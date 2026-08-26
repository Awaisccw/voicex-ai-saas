import { Queue, type DefaultJobOptions } from "bullmq";
import { redis } from "./redis";

export const VOICE_GENERATION_QUEUE_NAME = "voice-generation";

export interface VoiceGenerationJobPayload {
  readonly generationId: string;
  readonly userId: string;
  readonly text: string;
  readonly voiceId: string;
  readonly format: "mp3" | "wav" | "ogg";
  readonly creditsUsed: number;
  readonly speed?: number | undefined;
  readonly pitch?: number | undefined;
}

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // 2s -> 4s -> 8s
  },
  removeOnComplete: {
    count: 500, // Keep last 500 completed jobs for history
    age: 24 * 3600, // 24 hours
  },
  removeOnFail: {
    count: 1000, // Keep last 1000 failed jobs for audit
    age: 7 * 24 * 3600, // 7 days
  },
};

declare global {
  // eslint-disable-next-line no-var
  var voiceQueueGlobal: Queue<VoiceGenerationJobPayload> | undefined;
}

export function createVoiceGenerationQueue(): Queue<VoiceGenerationJobPayload> {
  return new Queue<VoiceGenerationJobPayload>(VOICE_GENERATION_QUEUE_NAME, {
    connection: redis,
    defaultJobOptions,
  });
}

export const voiceGenerationQueue: Queue<VoiceGenerationJobPayload> =
  globalThis.voiceQueueGlobal ?? createVoiceGenerationQueue();

if (process.env.NODE_ENV !== "production") {
  globalThis.voiceQueueGlobal = voiceGenerationQueue;
}
