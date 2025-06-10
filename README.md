<div align="center">
  <br />

  <br />

  <div>
    <img src="https://img.shields.io/badge/-Typescript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Next_._JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-OpenAI-black?style=for-the-badge&logoColor=white&logo=openai&color=412991" alt="openai" />
    <img src="https://img.shields.io/badge/-Convex-black?style=for-the-badge&logoColor=white&logo=convex&color=FFD700" alt="convex" />
    <img src="https://img.shields.io/badge/-Clerk-black?style=for-the-badge&logoColor=white&logo=clerk&color=000000" alt="clerk" />
    <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn" />
    <img src="https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white)" alt="zod">

  </div>

  <h1 align="center">PODGEN Podcast Platform</h1>

  

</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 📸 [Screenshots](#screenshots)




## <a name="introduction">🤖 Introduction</a>

A cutting-edge AI SaaS platform that enables users to create, discover, and enjoy podcasts with advanced features like text-to-audio conversion with multi-voice AI, podcast thumbnail Image generation and seamless playback. The platform is built using Next.js, TypeScript, Convex, OpenAI, Clerk, ShadCN, and Tailwind CSS. It offers a modern home page, podcast discovery page, search functionality, podcast creation page, profile page, podcast details page, and a responsive design for a seamless user experience.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- TypeScript
- Convex
- OpenAI
- Stripe (for payments)
- Clerk
- ShadCN
- Tailwind CSS
- Zod (for validation)

## <a name="features">🔋 Features</a>

👉 **Advanced Authentication**: Offers secure and dependable user login and registration functionalities.

👉 **Contemporary Home Page**: Highlights trending podcasts with a persistent player for uninterrupted listening.

👉 **Podcast Discovery Page**: A dedicated section for users to explore a wide range of new and popular podcasts.

👉 **Comprehensive Search Functionality**: Empowers users to effortlessly find podcasts using various filters and criteria.

👉 **Podcast Creation Page**: Facilitates podcast creation with text-to-speech conversion, AI-generated images, and preview options.

👉 **Multi-Voice AI Capability**: Provides multiple AI-generated voice options for creating dynamic and engaging podcasts.

👉 **User Profile Page**: Allows users to view and manage their created podcasts, including options to delete them.

👉 **Detailed Podcast Page**: Presents in-depth information about each podcast, including creator details, listener statistics, and transcripts.

👉 **Enhanced Podcast Player**: Includes features like rewind/fast forward controls and mute/unmute functionality for an optimal listening experience.

👉 **Responsive Design**: Ensures the platform looks great and works seamlessly on all devices and screen sizes.

and many more, including code architecture and reusability

## <a name="screenshots">📸 Screenshots</a>

| Homepage |
| :-----------: |
|  <img src="assets/screenshots/home.png" alt="Home Page" style="border-radius:12px; max-width:100%;">  |
| Discover Page |
| <img src="assets/screenshots/discover.png" alt="Discover Page" style="border-radius:12px; max-width:100%;">   |
| Create Podcast Page |
| <img src="assets/screenshots/create.png" alt="Create Podcast Page" style="border-radius:12px; max-width:100%;"> |
| Podcast Details Page |
|  <img src="assets/screenshots/podcast.png" alt="Podcast Details Page" style="border-radius:12px; max-width:100%;"> |
| Profile Page |
|  <img src="assets/screenshots/profile.png" alt="Profile Page" style="border-radius:12px; max-width:100%;"> |
| Plans Page |
|  <img src="assets/screenshots/plans.png" alt="Plans Page" style="border-radius:12px; max-width:100%;"> |
| Payment / Stripe Checkout Page |
|  <img src="assets/screenshots/stripe.png" alt="Payment Page" style="border-radius:12px; max-width:100%;"> |
| Usage Page |
|  <img src="assets/screenshots/usage.png" alt="Usage Page" style="border-radius:12px; max-width:100%;"> |


## <a name="getting-started">🤸 Getting Started</a>

Follow these steps to set up the project locally on your machine.



**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content to your local env file and on the convex dashboard:

```env
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL='/sign-in'
NEXT_PUBLIC_CLERK_SIGN_UP_URL='/sign-up'
OPENAI_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

Replace the placeholder values with your actual Convex & Clerk credentials. You can obtain these credentials by signing up on the [Convex](https://www.convex.dev/), [Clerk](https://clerk.com/),
[OpenAI](https://platform.openai.com/) and [Stripe](https://stripe.com/) websites.

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

**Testing Stripe Payments**

To test the Stripe payments/subscriptions functionality, you can use the following test card details:

- **Card Number**: 4242 4242 4242 4242
- **Expiry Date**: Any future date
- **CVC/CVV**: Any 3-digit number
- **Cardholder Name**: Any name
- **Address**: Any address (e.g., 123 Main Street)
- **ZIP Code**: Any 5-digit number

You can also use the [Stripe Test Cards](https://docs.stripe.com/testing#cards) for more test card details.





<br />
<br />
