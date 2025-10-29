import { MidiAnalyzerResponse } from "@/types";

export async function analyzeMidiFile(
  file: File,
  barsPerPhrase: number = 4
): Promise<MidiAnalyzerResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bars_per_phrase", barsPerPhrase.toString());

  const response = await fetch("/api/midi/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "MIDI 분석에 실패했습니다.");
  }

  return response.json();
}

export async function generateLyrics(
  syllableCount: number,
  context?: {
    previousLines?: string[];
    theme?: { genres?: string[]; moods?: string[]; keywords?: string[] };
    description?: string;
  }
): Promise<string> {
  const response = await fetch("/api/lyrics/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      syllableCount,
      context,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "가사 생성에 실패했습니다.");
  }

  const data = await response.json();
  return data.lyrics;
}
