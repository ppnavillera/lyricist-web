// 백엔드 API와 프론트엔드 타입 간의 변환 유틸리티

import { apiClient } from './api-client';
import { MidiAnalysis, ProjectTheme, genreMapping, moodMapping } from '@/types';
import type { MidiAnalysisResponse, LyricsGenerationRequest } from '@/types/api';

/**
 * MIDI 파일 업로드 및 분석
 */
export async function uploadAndAnalyzeMidi(file: File): Promise<{
  midiId: number;
  analysis: MidiAnalysisResponse;
}> {
  try {
    // 1. Presign URL 요청
    const presignResponse = await apiClient.midi.presignUpload({
      fileName: file.name,
      contentType: file.type || 'audio/midi',
    });

    // 2. S3에 직접 업로드 (presign URL이 제공된다고 가정)
    // 실제로는 presignResponse에 uploadUrl이 포함되어야 함
    // 임시로 FormData로 업로드
    const formData = new FormData();
    formData.append('file', file);

    // 3. 업로드 확인
    const uploadResponse = await apiClient.midi.confirmUpload({
      tempKey: presignResponse.fileName,
      etag: 'placeholder-etag', // 실제로는 S3 응답에서 가져와야 함
      sizeBytes: file.size,
    });

    // 4. MIDI 분석 요청 (midiId는 서버에서 생성됨)
    // 임시로 1을 사용
    const midiId = 1; // 실제로는 uploadResponse에서 가져와야 함
    const analysisResponse = await apiClient.analysis.create(midiId);

    return {
      midiId,
      analysis: analysisResponse,
    };
  } catch (error) {
    console.error('MIDI 업로드 및 분석 오류:', error);
    throw error;
  }
}

/**
 * API 분석 데이터를 프론트엔드 MidiAnalysis 형식으로 변환
 */
export function convertApiAnalysisToMidiAnalysis(
  fileName: string,
  midiId: number,
  apiAnalysis: MidiAnalysisResponse
): MidiAnalysis {
  // 템포 정보 추출
  const tempo = apiAnalysis.tempoSummary.bpmAverage;

  // 박자 정보 추출
  const timeSignature = apiAnalysis.timeSignatures.length > 0
    ? `${apiAnalysis.timeSignatures[0].numerator}/${apiAnalysis.timeSignatures[0].denominator}`
    : '4/4';

  // duration을 초 단위로 변환
  const duration = apiAnalysis.durationMs / 1000;

  // 기본 구조 생성 (beats 정보를 기반으로)
  // 실제로는 더 복잡한 로직이 필요할 수 있음
  const structure = [];

  return {
    id: midiId.toString(),
    fileName,
    duration,
    tempo,
    timeSignature,
    key: 'C', // API에서 key 정보를 제공하지 않으므로 기본값
    structure,
    totalSyllables: 0,
    createdAt: new Date(),
    midiId,
    apiAnalysis,
  };
}

/**
 * 프론트엔드 테마를 API 요청 형식으로 변환
 */
export function convertThemeToApiRequest(theme: ProjectTheme): Omit<LyricsGenerationRequest, 'genres' | 'moods'> & {
  genres: string[];
  moods: string[];
} {
  return {
    genres: theme.genres.map(g => genreMapping[g]),
    moods: theme.moods.map(m => moodMapping[m]),
    keyword: theme.keywords,
    additionalRequest: theme.customStyle,
  };
}

/**
 * 가사 생성 요청
 */
export async function generateLyricsFromApi(
  midiAnalysisId: number,
  theme: ProjectTheme
): Promise<{ lyricsId: number; text: string }> {
  try {
    const request = convertThemeToApiRequest(theme);
    const response = await apiClient.lyrics.generate(midiAnalysisId, request as LyricsGenerationRequest);

    return {
      lyricsId: response.summary.lyricsId,
      text: response.text,
    };
  } catch (error) {
    console.error('가사 생성 오류:', error);
    throw error;
  }
}

/**
 * MIDI 파일 목록 조회
 */
export async function fetchMidiList(page: number = 0, size: number = 20) {
  try {
    return await apiClient.midi.list({
      page,
      size,
      sort: 'DESC',
      status: 'ANALYZED',
    });
  } catch (error) {
    console.error('MIDI 목록 조회 오류:', error);
    throw error;
  }
}

/**
 * 가사 목록 조회
 */
export async function fetchLyricsList(midiId: number, page: number = 0, size: number = 20) {
  try {
    return await apiClient.lyrics.list({
      page,
      size,
      sort: 'desc',
      midiId,
    });
  } catch (error) {
    console.error('가사 목록 조회 오류:', error);
    throw error;
  }
}
