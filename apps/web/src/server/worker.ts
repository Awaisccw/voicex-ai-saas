import { Worker, type Job } from "bullmq";
import { redis } from "./redis";
import {
  VOICE_GENERATION_QUEUE_NAME,
  type VoiceGenerationJobPayload,
} from "./queue";
import { generateFishAudioTTS } from "./fish-audio";
import { uploadAudioBuffer } from "./storage";
import {
  prisma,
  GenerationStatus,
  TransactionType,
} from "@saas/db";
import { captureException } from "../lib/sentry";

// eslint-disable-next-line no-console
console.log(`[Worker] Starting AI Voiceover Generation Worker on queue: ${VOICE_GENERATION_QUEUE_NAME}...`);

export async function processVoiceGenerationJob(
  job: Job<VoiceGenerationJobPayload>,
): Promise<{ audioUrl: string; duration: number }> {
  const { generationId, userId, text, voiceId, format, creditsUsed } = job.data;

  // eslint-disable-next-line no-console
  console.log(
    `[Worker] Processing job ${job.id} (Attempt ${job.attemptsMade + 1}) | Generation ID: ${generationId} | User: ${userId}`,
  );

  // Step 1: Update status to PROCESSING in database
  await prisma.voiceGeneration.update({
    where: { id: generationId },
    data: {
      status: GenerationStatus.PROCESSING,
      jobId: job.id ? String(job.id) : null,
    },
  });

  await job.updateProgress(20);

  // Step 2: Call Fish Audio API for Neural TTS Synthesis
  const ttsResult = await generateFishAudioTTS({
    text,
    voiceId,
    format,
  });

  await job.updateProgress(65);

  // Step 3: Upload resulting audio buffer to S3 / Object Storage
  const filename = `${generationId}-${Date.now()}.${format}`;
  const audioUrl = await uploadAudioBuffer(
    ttsResult.audioBuffer,
    filename,
    ttsResult.contentType,
  );

  await job.updateProgress(90);

  // Step 4: Mark VoiceGeneration as COMPLETED
  await prisma.voiceGeneration.update({
    where: { id: generationId },
    data: {
      status: GenerationStatus.COMPLETED,
      audioUrl,
      duration: ttsResult.durationSeconds,
      cost: parseFloat((creditsUsed * 0.001).toFixed(4)),
    },
  });

  await job.updateProgress(100);

  // eslint-disable-next-line no-console
  console.log(
    `[Worker] ✅ Successfully generated audio for job ${job.id} | Audio URL: ${audioUrl}`,
  );

  return {
    audioUrl,
    duration: ttsResult.durationSeconds,
  };
}

export const voiceWorker = new Worker<VoiceGenerationJobPayload>(
  VOICE_GENERATION_QUEUE_NAME,
  processVoiceGenerationJob,
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000, // 10 requests per second rate limit guard
    },
  },
);

voiceWorker.on("completed", (job) => {
  // eslint-disable-next-line no-console
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

voiceWorker.on("failed", async (job, err) => {
  if (!job) return;

  const { generationId, userId, creditsUsed } = job.data;
  const maxAttempts = job.opts.attempts ?? 3;
  const isFinalAttempt = job.attemptsMade >= maxAttempts;

  // eslint-disable-next-line no-console
  console.error(
    `[Worker] ❌ Job ${job.id} failed (Attempt ${job.attemptsMade}/${maxAttempts}): ${err.message}`,
  );

  captureException(err, {
    extra: {
      generationId,
      userId,
      jobId: job.id,
      attempt: job.attemptsMade,
    },
  });

  if (isFinalAttempt) {
    // eslint-disable-next-line no-console
    console.log(
      `[Worker] Final retry exhausted for job ${job.id}. Marking generation as FAILED and refunding ${creditsUsed} credits to user ${userId}.`,
    );

    try {
      await prisma.$transaction([
        // Mark generation record as FAILED
        prisma.voiceGeneration.update({
          where: { id: generationId },
          data: {
            status: GenerationStatus.FAILED,
            errorMessage: err.message,
          },
        }),
        // Refund user credits
        prisma.user.update({
          where: { id: userId },
          data: {
            credits: { increment: creditsUsed },
          },
        }),
        // Log refund in transaction ledger
        prisma.creditTransaction.create({
          data: {
            userId,
            amount: creditsUsed,
            type: TransactionType.REFUND,
            description: `Automated refund for failed synthesis generation (${generationId.slice(-8)})`,
          },
        }),
      ]);
      // eslint-disable-next-line no-console
      console.log(`[Worker] ✅ Refund of ${creditsUsed} credits reconciled for user ${userId}.`);
    } catch (refundError: unknown) {
      const refundMsg = refundError instanceof Error ? refundError.message : "Unknown error";
      // eslint-disable-next-line no-console
      console.error(`[Worker] 🚨 Failed to reconcile refund for generation ${generationId}:`, refundMsg);
    }
  }
});

// Graceful worker shutdown on termination signals
const shutdown = async () => {
  // eslint-disable-next-line no-console
  console.log("[Worker] Gracefully closing worker connections...");
  await voiceWorker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
