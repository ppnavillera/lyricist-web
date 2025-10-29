import { MidiAnalyzerResponse } from "@/types";
import { uploadAndAnalyzeMidi, generateLyricsFromApi } from "./api-integration";
import type { ProjectTheme } from "@/types";

// 레거시 호환성을 위한 래퍼 함수들
// 실제 API 호출은 api-integration.ts를 통해 이루어짐

export async function analyzeMidiFile(
  file: File,
  barsPerPhrase: number = 4
): Promise<MidiAnalyzerResponse> {
  // 기존 로컬 API 사용 (폴백)
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
  // 기존 로컬 API 사용 (폴백)
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

// 새로운 백엔드 API 사용 함수들
export { uploadAndAnalyzeMidi, generateLyricsFromApi } from "./api-integration";
