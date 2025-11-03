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

// TODO: 백엔드 분석 응답을 레거시 MidiAnalyzerResponse 형식으로 변환
/**
 * 백엔드 분석 결과를 기존 MidiAnalyzerResponse 형식으로 변환
 * analyzeMidiFile 함수에서 사용
 */
export function convertBackendAnalysisToLegacyFormat(
  analysisResponse: MidiAnalysisResponse,
  fileName: string
): any {
  // TODO: 실제 구현 필요
  // 백엔드 API 응답 구조에 맞춰 변환 로직 작성
  /*
  return {
    metadata: {
      midi_file: fileName,
      total_duration_seconds: analysisResponse.durationMs / 1000,
      tempo_bpm: analysisResponse.tempoSummary.bpmAverage,
      time_signature: `${analysisResponse.timeSignatures[0]?.numerator || 4}/${analysisResponse.timeSignatures[0]?.denominator || 4}`,
    },
    lyrics_generation_tasks: analysisResponse.beats.map((beat, index) => ({
      section: `Section ${index + 1}`,
      time_range: {
        start: beat.timeMs / 1000,
        end: (analysisResponse.beats[index + 1]?.timeMs || analysisResponse.durationMs) / 1000,
      },
      target_syllables: 8, // TODO: 실제 계산 로직 필요
    })),
  };
  */

  throw new Error('TODO: convertBackendAnalysisToLegacyFormat 구현 필요');
}

// TODO: MIDI 분석 관련 헬퍼 함수들
/**
 * MIDI 분석 조회
 */
export async function getMidiAnalysis(midiId: number): Promise<MidiAnalysisResponse> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    return await apiClient.analysis.get(midiId);
  } catch (error) {
    console.error('MIDI 분석 조회 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: getMidiAnalysis 구현 필요');
}

/**
 * MIDI 분석 생성 (이미 업로드된 MIDI 파일에 대해)
 */
export async function createMidiAnalysis(midiId: number): Promise<MidiAnalysisResponse> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    return await apiClient.analysis.create(midiId);
  } catch (error) {
    console.error('MIDI 분석 생성 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: createMidiAnalysis 구현 필요');
}

/**
 * MIDI 분석 삭제
 */
export async function deleteMidiAnalysis(midiId: number): Promise<void> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    await apiClient.analysis.delete(midiId);
  } catch (error) {
    console.error('MIDI 분석 삭제 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: deleteMidiAnalysis 구현 필요');
}

// TODO: 가사 조회 관련 헬퍼 함수들
/**
 * 특정 가사 상세 조회
 */
export async function getLyricsById(lyricsId: number): Promise<{ summary: { lyricsId: number; generatedAt: string }; text: string }> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    return await apiClient.lyrics.getById(lyricsId);
  } catch (error) {
    console.error('가사 조회 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: getLyricsById 구현 필요');
}

/**
 * 가사 삭제
 */
export async function deleteLyrics(lyricsId: number): Promise<void> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    await apiClient.lyrics.delete(lyricsId);
  } catch (error) {
    console.error('가사 삭제 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: deleteLyrics 구현 필요');
}

// TODO: MIDI 파일 조회 관련 헬퍼 함수들
/**
 * 특정 MIDI 파일 상세 조회
 */
export async function getMidiById(midiId: number): Promise<{ summary: { lyricsId: number; generatedAt: string }; text: string }> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    return await apiClient.midi.getById(midiId);
  } catch (error) {
    console.error('MIDI 파일 조회 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: getMidiById 구현 필요');
}

/**
 * MIDI 파일 삭제
 */
export async function deleteMidi(midiId: number): Promise<void> {
  // TODO: 백엔드 API 연동 시 주석 해제
  /*
  try {
    await apiClient.midi.delete(midiId);
  } catch (error) {
    console.error('MIDI 파일 삭제 오류:', error);
    throw error;
  }
  */
  throw new Error('TODO: deleteMidi 구현 필요');
}
