"use node";

import { v } from "convex/values";
import { ActionCtx, action, internalAction, internalMutation, mutation } from "./_generated/server";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";

type Metadata = {
  userId: string;
};

type plan = "free" | "pro" | "enterprise";

export const pay = action({
  args: { plan: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("You must be logged in to subscribe!");
    }

    if (!user.emailVerified) {
      throw new Error("You must have a verified email to subscribe!");
    }

    if (!args.plan) {
      throw new Error("You must provide a plan to subscribe to!");
    }

    const domain = process.env.HOSTING_URL ?? "https://pod-gen-seven.vercel.app";
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });

    let priceId = "";

    switch (args.plan) {
      case "pro":
        priceId = process.env.PRICE_ID_PRO!;
        break;
      case "enterprise":
        priceId = process.env.PRICE_ID_ENTERPRISE!;
        break;
      case "pro-annual":
        priceId = process.env.PRICE_ID_PRO_ANNUAL!;
        break;
      case "enterprise-annual":
        priceId = process.env.PRICE_ID_ENTERPRISE_ANNUAL!;
        break;
      default:
        throw new Error("Invalid plan provided!");
    }

    const paymentId = await ctx.runMutation(internal.payments.create);
    const session = await stripe.checkout.sessions.create({
      ui_mode: "hosted",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: {
        userId: user.subject,
      },
      mode: "subscription",
      success_url: `${domain}/plans?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}`,
    });

    await ctx.runMutation(internal.payments.markPending, {
      paymentId,
      stripeId: session.id,
    });
    return session.url;
  },
});

export const cancelSubscription = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("You must be logged in to cancel your subscription!");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });

    const { subscriptionId } = await ctx.runQuery(
      api.users.getSubscriptionByClerkId,
      {
        clerkId: user.subject,
      }
    ) as { subscriptionId: string | undefined};

    if (!subscriptionId) {
      throw new Error("No subscription found for this user!");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === "canceled") {
      throw new Error("Subscription already canceled!");
    }

    await stripe.subscriptions.cancel(subscriptionId);

    return { success: true };
  },
});

export const createCustomerPortal = action({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("You must be logged in to access the customer portal!");
    }

    const { customerId } = await ctx.runQuery(
      api.users.getSubscriptionByClerkId,
      {
        clerkId: user.subject,
      }
    ) as { customerId: string | undefined };

    if (!customerId) {
      throw new Error("No customer id found for this user!");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId!,
      return_url:
        process.env.HOSTING_URL ??
        `https://pod-gen-seven.vercel.app/plans?session_id={BILLING_PORTAL_SESSION_ID}`,
    });

    return session.url;
  },
});

async function getPlanNameFromProductId(stripe: Stripe, productId: string) {
  return await stripe.products.retrieve(productId).then((product) => product.name.toLowerCase() as plan);
}

async function handleEvents(
  stripe: Stripe,
  ctx: ActionCtx,
  event: Stripe.Event
) {
  const completedEvent = event.data.object as Stripe.Checkout.Session & {
    metadata: Metadata;
  };

  const updateEvent = event.data.object as Stripe.Subscription & {
    metadata: Metadata;
  };

  let subscriptionId = completedEvent.subscription as string | undefined;
  let subscription = {} as Stripe.Subscription;

  if (subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(
      completedEvent.subscription as string
    );
  }

  try {

    switch (event.type) {
      case "checkout.session.completed":
        const stripeId = (event.data.object as { id: string }).id;
        const userId = completedEvent.metadata.userId;
        const customerId = completedEvent.customer as string;

        await ctx.runMutation(internal.users.updateSubscription, {
          userId,
          subscriptionId: subscription.id,
          endsOn: subscription.current_period_end * 1000,
          plan: await getPlanNameFromProductId(
            stripe,
            subscription.items.data[0]?.price.product as string
          ),
          customerId: customerId,
        });
        await ctx.runMutation(internal.payments.fulfill, { stripeId, customerId, userId});
        break;

      case "invoice.payment_succeeded":
        await ctx.runMutation(internal.users.updateSubscriptionBySubId, {
          subscriptionId: subscription.items.data[0]?.price.id,
          endsOn: subscription.current_period_end * 1000,
          customerId: subscription.customer as string,
          plan: await getPlanNameFromProductId(
            stripe,
            subscription.items.data[0]?.price.product as string
          ),
        });
        break;

      case "customer.subscription.updated":
        await ctx.runMutation(internal.users.updateSubscriptionBySubId, {
          subscriptionId: updateEvent.id,
          endsOn: updateEvent.current_period_end * 1000, // the subscription ends on the current_period_end date regardless of the cancel_at date
          customerId: updateEvent.customer as string,
          plan: updateEvent.cancel_at ? "free" : // if the subscription is canceled, set the plan to "free" to prevent the user from being charged again
            await getPlanNameFromProductId(
              stripe,
            updateEvent.items.data[0].price.product as string
          ),
        });
        break;
      case "customer.subscription.deleted":
        // update the user's subscription to "free" if the subscription is deleted
        await ctx.runMutation(internal.users.updateSubscriptionBySubId, {
          subscriptionId: updateEvent.id,
          endsOn: updateEvent.current_period_end * 1000,
          customerId: completedEvent.customer as string,
          plan: "free",
        });
        break;

      /**
       * TODO: Add "customer.updated" event to update the user's (billing) email in the database
       */

      default:
        break;
    }
    return { success: true };
  } catch (error) {
    console.error("Error processing event: ", error);
    return { success: false, error: (error as { message: string }).message };
  }
}

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });

    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET as string;

    try {
      const event = stripe.webhooks.constructEvent(
        args.payload,
        args.signature,
        webhookSecret
      );

      return await handleEvents(stripe, ctx, event);
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});
