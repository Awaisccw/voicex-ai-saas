import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? "sk_test_mock_stripe_key_placeholder",
  {
    apiVersion: "2024-06-20",
    appInfo: {
      name: "VOICEX AI Platform",
      version: "0.1.0",
    },
  },
);

export interface PricingPlan {
  readonly id: "CREATOR" | "PRO" | "ENTERPRISE";
  readonly name: string;
  readonly priceMonthlyUsd: number;
  readonly priceId: string;
  readonly monthlyCredits: number;
  readonly voiceClones: number;
  readonly maxAudioQuality: string;
  readonly features: readonly string[];
}

export const SUBSCRIPTION_PLANS: Record<"CREATOR" | "PRO", PricingPlan> = {
  CREATOR: {
    id: "CREATOR",
    name: "Creator Plan",
    priceMonthlyUsd: 19,
    priceId: process.env.STRIPE_PRICE_CREATOR ?? "price_creator_monthly",
    monthlyCredits: 25000,
    voiceClones: 3,
    maxAudioQuality: "24-bit / 48kHz WAV",
    features: [
      "25,000 monthly synthesis credits",
      "3 Instant Voice Clones",
      "All 120+ Neural Voices & Accents",
      "Commercial Monetization License",
      "Priority Audio Processing Queue",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro Studio Plan",
    priceMonthlyUsd: 49,
    priceId: process.env.STRIPE_PRICE_PRO ?? "price_pro_monthly",
    monthlyCredits: 100000,
    voiceClones: 15,
    maxAudioQuality: "Lossless Master FLAC / WAV",
    features: [
      "100,000 monthly synthesis credits",
      "15 High-Fidelity Voice Clones",
      "Emotion & Cadence Directing",
      "Full API & Webhook Access",
      "Dedicated Enterprise Support",
      "Zero-Retention Privacy Option",
    ],
  },
};

export interface CreditPack {
  readonly id: "credits_1k" | "credits_5k" | "credits_20k";
  readonly name: string;
  readonly credits: number;
  readonly priceUsd: number;
  readonly priceId: string;
  readonly popular?: boolean;
}

export const CREDIT_PACKS: readonly CreditPack[] = [
  {
    id: "credits_1k",
    name: "Starter Pack",
    credits: 1000,
    priceUsd: 9,
    priceId: process.env.STRIPE_PRICE_CREDITS_1K ?? "price_credits_1k",
  },
  {
    id: "credits_5k",
    name: "Creator Pack",
    credits: 5000,
    priceUsd: 39,
    priceId: process.env.STRIPE_PRICE_CREDITS_5K ?? "price_credits_5k",
    popular: true,
  },
  {
    id: "credits_20k",
    name: "Studio Pack",
    credits: 20000,
    priceUsd: 129,
    priceId: process.env.STRIPE_PRICE_CREDITS_20K ?? "price_credits_20k",
  },
];
