import { create } from "zustand";
import type {
  VoiceEmotion,
  VoiceSettings,
  TTSResponse,
  SynthesisStatus,
} from "@saas/types";
import {
  DEFAULT_VOICE_ID,
  DEFAULT_VOICE_SETTINGS,
} from "../constants/voices";

export interface GeneratedClip {
  readonly id: string;
  readonly voiceId: string;
  readonly text: string;
  readonly emotion: VoiceEmotion;
  readonly durationSeconds: number;
  readonly audioUrl: string;
  readonly createdAt: string;
}

export interface VoiceStudioState {
  readonly selectedVoiceId: string;
  readonly promptText: string;
  readonly selectedEmotion: VoiceEmotion;
  readonly settings: VoiceSettings;
  readonly status: SynthesisStatus;
  readonly isPlaying: boolean;
  readonly playbackProgress: number; // 0 to 100
  readonly activeClip: GeneratedClip | null;
  readonly history: readonly GeneratedClip[];
  readonly errorMessage: string | null;

  // Actions
  readonly setSelectedVoiceId: (id: string) => void;
  readonly setPromptText: (text: string) => void;
  readonly setSelectedEmotion: (emotion: VoiceEmotion) => void;
  readonly updateSettings: (partial: Partial<VoiceSettings>) => void;
  readonly setStatus: (status: SynthesisStatus) => void;
  readonly setIsPlaying: (isPlaying: boolean) => void;
  readonly setPlaybackProgress: (progress: number) => void;
  readonly setActiveClip: (clip: GeneratedClip | null) => void;
  readonly addClipToHistory: (clip: GeneratedClip) => void;
  readonly setErrorMessage: (message: string | null) => void;
  readonly generateSpeechMock: () => Promise<TTSResponse>;
  readonly resetStudio: () => void;
}

const INITIAL_PROMPT =
  "Welcome to the next generation of neural voice synthesis. Experience ultra-realistic human speech powered by cutting-edge acoustic intelligence.";

export const useVoiceStudioStore = create<VoiceStudioState>((set, get) => ({
  selectedVoiceId: DEFAULT_VOICE_ID,
  promptText: INITIAL_PROMPT,
  selectedEmotion: "neutral",
  settings: DEFAULT_VOICE_SETTINGS,
  status: "idle",
  isPlaying: false,
  playbackProgress: 0,
  activeClip: null,
  history: [],
  errorMessage: null,

  setSelectedVoiceId: (id) => set({ selectedVoiceId: id }),
  setPromptText: (text) => set({ promptText: text }),
  setSelectedEmotion: (emotion) => set({ selectedEmotion: emotion }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),
  setStatus: (status) => set({ status }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackProgress: (progress) => set({ playbackProgress: progress }),
  setActiveClip: (clip) => set({ activeClip: clip }),
  addClipToHistory: (clip) =>
    set((state) => ({
      history: [clip, ...state.history].slice(0, 10),
    })),
  setErrorMessage: (message) => set({ errorMessage: message }),

  generateSpeechMock: async () => {
    const { promptText, selectedVoiceId, selectedEmotion, addClipToHistory } = get();
    set({ status: "processing", errorMessage: null, isPlaying: false, playbackProgress: 0 });

    try {
      // Simulate realistic neural synthesis delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const durationSeconds = Math.max(2.5, Number((promptText.length * 0.065).toFixed(1)));
      const clipId = `clip-${Date.now()}`;
      const newClip: GeneratedClip = {
        id: clipId,
        voiceId: selectedVoiceId,
        text: promptText,
        emotion: selectedEmotion,
        durationSeconds,
        audioUrl: "/audio/generated-sample.mp3",
        createdAt: new Date().toISOString(),
      };

      addClipToHistory(newClip);
      set({
        status: "completed",
        activeClip: newClip,
        isPlaying: true,
        playbackProgress: 0,
      });

      const response: TTSResponse = {
        synthesisId: clipId,
        status: "completed",
        audioUrl: newClip.audioUrl,
        durationSeconds,
        characterCount: promptText.length,
        creditsUsed: Math.ceil(promptText.length / 5),
        createdAt: newClip.createdAt,
      };

      return response;
    } catch {
      const errorMsg = "Speech synthesis failed. Please check network connection.";
      set({ status: "failed", errorMessage: errorMsg });
      throw new Error(errorMsg);
    }
  },

  resetStudio: () =>
    set({
      promptText: INITIAL_PROMPT,
      selectedVoiceId: DEFAULT_VOICE_ID,
      selectedEmotion: "neutral",
      settings: DEFAULT_VOICE_SETTINGS,
      status: "idle",
      isPlaying: false,
      playbackProgress: 0,
      activeClip: null,
      errorMessage: null,
    }),
}));
