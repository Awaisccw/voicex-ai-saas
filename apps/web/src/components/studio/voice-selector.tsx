"use client";

import * as React from "react";
import { Badge } from "@saas/ui";
import { PRESET_VOICES } from "@saas/core";
import { useStudioStore } from "@/store/useStudioStore";

export const VoiceSelector: React.FC = () => {
  const { selectedVoiceId, setSelectedVoiceId } = useStudioStore();
  const [playingPreviewId, setPlayingPreviewId] = React.useState<string | null>(null);

  const handleTogglePreview = (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();
    if (playingPreviewId === voiceId) {
      setPlayingPreviewId(null);
    } else {
      setPlayingPreviewId(voiceId);
      // Auto-reset preview simulation after 3s
      setTimeout(() => {
        setPlayingPreviewId((curr) => (curr === voiceId ? null : curr));
      }, 3500);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Select AI Voice Actor
        </label>
        <span className="text-xs text-muted-foreground">
          {PRESET_VOICES.length} Studio Voices Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRESET_VOICES.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          const isPreviewing = playingPreviewId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => setSelectedVoiceId(voice.id)}
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 text-left group select-none ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-glow text-foreground"
                  : "bg-card/60 border-border/60 hover:border-border hover:bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground group-hover:bg-primary/20"
                    }`}
                  >
                    {voice.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-foreground">
                        {voice.name}
                      </span>
                      {voice.isPremium && (
                        <Badge variant="glow" size="sm">
                          HD
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {voice.languageName} • {voice.gender}
                    </p>
                  </div>
                </div>

                {/* Sample Preview Play Button */}
                <button
                  type="button"
                  onClick={(e) => handleTogglePreview(e, voice.id)}
                  title="Listen to sample audio"
                  className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
                    isPreviewing
                      ? "bg-primary text-primary-foreground border-primary animate-pulse"
                      : "bg-background/80 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {isPreviewing ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Tag Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/70 text-muted-foreground capitalize">
                  {voice.category}
                </span>
                {voice.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-background/60 text-muted-foreground border border-border/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
