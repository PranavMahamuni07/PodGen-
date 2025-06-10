import { ActionCtx, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";
import { getUser, getUserById } from "./users";
import { api, internal } from "./_generated/api";
import { rateLimit, formatRetryTime } from "../lib/rateLimits";
import { UserIdentity } from "convex/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const GENERATE_THUMBNAIL_ACTION = "generateThumbnailAction";
const GENERATE_AUDIO_ACTION = "generateAudioAction";

async function handleLimitations(ctx: ActionCtx, user: UserIdentity, voice?: string) {
  if (!user) throw new Error("User not authenticated");

  const rate = await ctx.runMutation(internal.openai.handleRateLimits, {
    userId: user.subject,
    type: voice ? GENERATE_AUDIO_ACTION : GENERATE_THUMBNAIL_ACTION,
  });

  await checkPodcastCount(ctx);

  if (!rate?.ok && rate.retryAt) {
    const retryAt = formatRetryTime(rate.retryAt);
    throw new Error(`Rate limit exceeded, try after: ${retryAt} (IST)`);
  }

  const { isSubscribed, freeThumbnails } = await ctx.runQuery(
    internal.openai.getUserSubscription,
    {}
  );

  if (!voice && !isSubscribed && freeThumbnails <= 0) {
    throw new Error("User must have a subscription to generate thumbnails");
  }

  if (voice && !isSubscribed && voice !== "alloy") {
    throw new Error("User must have a subscription to use other voice options");
  }

  return isSubscribed;
}

export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (ctx, { voice, input }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not authenticated");

    const defaultVoice = "alloy" as SpeechCreateParams["voice"];
    const isSubscribed = await handleLimitations(ctx, user, voice);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: isSubscribed ? (voice as SpeechCreateParams["voice"]) : defaultVoice,
      input,
    });

    return await mp3.arrayBuffer();
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("User not authenticated");

    await handleLimitations(ctx, user, undefined);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const url = response.data[0].url;
    if (!url) throw new Error("Error generating thumbnail");

    const buffer = await (await fetch(url)).arrayBuffer();

    await ctx.runMutation(internal.openai.reduceFreeThumbnailsCount, {
      userId: user.subject,
    });

    return buffer;
  },
});

export const handleRateLimits = internalMutation({
  args: { userId: v.string(), type: v.string() },
  handler: async (ctx, { userId, type }) => {
    return await rateLimit(ctx, {
      name: type,
      key: userId,
      throws: false,
    });
  },
});

export const reduceFreeThumbnailsCount = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await getUser(ctx, { clerkId: userId });
    if (!user) throw new Error("User not found");

    if (user.freeThumbnails > 0) {
      await ctx.db.patch(user._id, {
        freeThumbnails: user.freeThumbnails - 1,
      });
    }
  },
});

export const getUserSubscription = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = await getUserById(ctx, { clerkId: identity?.subject! });
    if (!user) throw new Error("User not found");

    return {
      isSubscribed: user.plan === "pro" || user.plan === "enterprise", // ✅ Corrected here
      plan: user.plan,
      freeThumbnails: user.freeThumbnails ?? 0,
    };
  },
});

async function checkPodcastCount(ctx: ActionCtx) {
  const user = await ctx.runQuery(api.users.getUser);
  if (!user) throw new Error("User not found");

  const limitMap: Record<string, number> = {
    free: 5,
    pro: 30,
    enterprise: 100,
  };

  const limit = limitMap[user.plan?.toLowerCase() ?? "free"];
  if (user.totalPodcasts >= limit) {
    throw new Error(`${user.plan ?? "Free"} users can only generate ${limit} podcasts per month`);
  }
}
