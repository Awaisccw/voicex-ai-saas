import type { VoiceEmotion, VoiceSettings } from "./voice";

export type ProjectStatus = "draft" | "rendering" | "completed" | "archived";

export interface AudioBlock {
  readonly id: string;
  readonly text: string;
  readonly voiceId: string;
  readonly emotion: VoiceEmotion;
  readonly settings: VoiceSettings;
  readonly audioUrl?: string;
  readonly durationSeconds?: number;
  readonly startTimeSeconds: number;
  readonly characterCount: number;
}

export interface TimelineTrack {
  readonly id: string;
  readonly label: string;
  readonly muted: boolean;
  readonly solo: boolean;
  readonly volume: number; // 0.0 to 1.0
  readonly blocks: readonly AudioBlock[];
}

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly ownerId: string;
  readonly totalDurationSeconds: number;
  readonly totalCharacters: number;
  readonly tracks: readonly TimelineTrack[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
