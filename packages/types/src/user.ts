export type UserRole = "owner" | "admin" | "editor" | "viewer";

export type SubscriptionTier = "free" | "creator" | "pro" | "enterprise";

export interface UsageQuota {
  readonly charactersTotal: number;
  readonly charactersUsed: number;
  readonly charactersRemaining: number;
  readonly voiceClonesTotal: number;
  readonly voiceClonesUsed: number;
  readonly apiCallsThisMonth: number;
  readonly resetDate: string;
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly avatarUrl?: string;
  readonly role: UserRole;
  readonly tier: SubscriptionTier;
  readonly quota: UsageQuota;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SubscriptionPlan {
  readonly id: SubscriptionTier;
  readonly name: string;
  readonly monthlyPriceUsd: number;
  readonly annualPriceUsd: number;
  readonly characterLimit: number;
  readonly voiceCloneSlots: number;
  readonly maxAudioQualityKbps: number;
  readonly commercialLicense: boolean;
  readonly priorityQueue: boolean;
  readonly features: readonly string[];
}
