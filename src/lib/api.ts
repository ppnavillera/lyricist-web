import { MidiAnalyzerResponse } from "@/types";
import { uploadAndAnalyzeMidi, generateLyricsFromApi, convertBackendAnalysisToLegacyFormat } from "./api-integration";
import type { ProjectTheme } from "@/types";
// TODO: 아래 주석 해제 필요
// import { apiClient } from "./api-client";
// import { genreMapping, moodMapping } from "@/types";

// 레거시 호환성을 위한 래퍼 함수들
// 실제 API 호출은 api-integration.ts를 통해 이루어짐

export async function analyzeMidiFile(
  file: File,
  barsPerPhrase: number = 4
): Promise<MidiAnalyzerResponse> {
  // TODO: 백엔드 S3 Presigned URL 업로드 방식으로 변경
  // TODO: 아래 주석 해제하고 기존 로컬 API 코드 제거
  /*
  // Step 1: Presigned URL 요청
  const presignResponse = await apiClient.midi.presignUpload({
    fileName: file.name,
    contentType: file.type || 'audio/midi',
  });

  // Step 2: S3에 파일 업로드
  const uploadResult = await fetch(presignResponse.presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'audio/midi',
    },
  });

  if (!uploadResult.ok) {
    throw new Error('S3 업로드에 실패했습니다.');
  }

  const etag = uploadResult.headers.get('ETag')?.replace(/"/g, '') || '';

  // Step 3: 백엔드에 업로드 완료 알림
  const confirmResponse = await apiClient.midi.confirmUpload({
    tempKey: presignResponse.tempKey,
    etag,
    sizeBytes: file.size,
  });

  const midiId = confirmResponse.midiId;

  // Step 4: MIDI 분석 요청
  const analysisResponse = await apiClient.analysis.create(midiId);

  // Step 5: 백엔드 응답을 기존 MidiAnalyzerResponse 형식으로 변환
  return convertBackendAnalysisToLegacyFormat(analysisResponse, file.name);
  */

  // 기존 로컬 API 사용 (임시)
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
  // TODO: 백엔드 가사 생성 API로 변경
  // TODO: 아래 주석 해제하고 기존 Gemini API 직접 호출 제거
  /*
  // midiAnalysisId가 필요함 - 프로젝트에서 가져와야 함
  const midiAnalysisId = getCurrentProjectMidiAnalysisId(); // TODO: 구현 필요

  // 장르/무드 한글 -> 영문 변환 (genreMapping, moodMapping 사용)
  const genres = context?.theme?.genres?.map(g => genreMapping[g]) || [];
  const moods = context?.theme?.moods?.map(m => moodMapping[m]) || [];
  const keywords = context?.theme?.keywords || [];

  const lyricsResponse = await apiClient.lyrics.generate(midiAnalysisId, {
    genres,
    moods,
    keyword: keywords,
    additionalRequest: context?.description,
  });

  // 백엔드 응답에서 가사 텍스트 추출
  return lyricsResponse.text;
  */

  // 기존 로컬 Gemini API 사용 (임시)
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
