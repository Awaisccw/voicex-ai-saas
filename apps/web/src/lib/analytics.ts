export type AnalyticsEvent =
  | { name: "page_view"; properties: { path: string } }
  | { name: "user_registered"; properties: { userId: string; email: string } }
  | { name: "user_logged_in"; properties: { userId: string } }
  | {
      name: "voice_generation_started";
      properties: {
        voiceId: string;
        characterCount: number;
        creditsUsed: number;
        format: string;
      };
    }
  | {
      name: "voice_generation_completed";
      properties: {
        generationId: string;
        duration: number;
      };
    }
  | {
      name: "voice_generation_failed";
      properties: {
        generationId: string;
        error: string;
      };
    }
  | {
      name: "checkout_initiated";
      properties: {
        type: "subscription" | "credit_pack";
        id: string;
        amountUsd?: number;
      };
    };

export function trackEvent<E extends AnalyticsEvent>(
  name: E["name"],
  properties: E["properties"],
): void {
  if (typeof window === "undefined") return;

  // Log in development
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[Analytics] 📊 Event "${name}":`, properties);
  }

  // PostHog integration
  const posthog = (window as unknown as { posthog?: { capture: (event: string, props?: unknown) => void } }).posthog;
  if (posthog && typeof posthog.capture === "function") {
    posthog.capture(name, properties);
  }

  // Google Analytics 4 (gtag.js) integration
  const gtag = (window as unknown as { gtag?: (type: string, action: string, props?: unknown) => void }).gtag;
  if (gtag && typeof gtag === "function") {
    gtag("event", name, properties);
  }
}

export function trackPageView(url: string): void {
  trackEvent("page_view", { path: url });
}
