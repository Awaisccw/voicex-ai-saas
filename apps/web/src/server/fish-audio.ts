export interface FishAudioTTSParams {
  readonly text: string;
  readonly voiceId: string;
  readonly format?: "mp3" | "wav" | "ogg" | undefined;
  readonly speed?: number | undefined;
}

export interface FishAudioTTSResult {
  readonly audioBuffer: Buffer;
  readonly durationSeconds: number;
  readonly contentType: string;
}

export async function generateFishAudioTTS(
  params: FishAudioTTSParams,
): Promise<FishAudioTTSResult> {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  const { text, voiceId, format = "mp3" } = params;

  const contentTypeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
  };

  const contentType = contentTypeMap[format] ?? "audio/mpeg";

  if (!apiKey || apiKey === "mock_fish_audio_api_key_placeholder") {
    // eslint-disable-next-line no-console
    console.log(
      `[FishAudio:Mock] Synthesizing "${text.slice(0, 40)}..." using voice ${voiceId} in mock mode.`,
    );

    // Simulate realistic TTS generation latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Calculate approximate duration: ~15-18 characters per second in natural speech
    const durationSeconds = Math.max(1.5, parseFloat((text.length * 0.065).toFixed(2)));

    // Create a mock audio buffer representing synthesized audio data
    const mockAudioBuffer = Buffer.from(
      `ID3\x04\x00\x00\x00\x00\x00#TSSE\x00\x00\x00\x0f\x00\x00\x03VOICEX Neural Engine mock data for text: ${text.slice(0, 80)}`,
    );

    return {
      audioBuffer: mockAudioBuffer,
      durationSeconds,
      contentType,
    };
  }

  try {
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format,
        latency: "normal",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText) as { message?: string; detail?: string };
        parsedMessage = errorJson.message ?? errorJson.detail ?? errorText;
      } catch {
        // use raw text
      }

      if (response.status === 429) {
        throw new Error(`Fish Audio API rate limit exceeded: ${parsedMessage}`);
      }

      throw new Error(
        `Fish Audio API failed with status ${response.status}: ${parsedMessage}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Duration estimation from character count / audio size
    const durationSeconds = Math.max(1.0, parseFloat((text.length * 0.065).toFixed(2)));

    return {
      audioBuffer,
      durationSeconds,
      contentType,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown Fish Audio TTS error";
    // eslint-disable-next-line no-console
    console.error("[FishAudio] TTS generation error:", message);
    throw error;
  }
}
