// API 스펙에 맞는 타입 정의

// User API Types
export interface UserResponse {
  userId: string;
  name: string;
  phone: string;
}

export interface UpdateUserRequest {
  name: string;
  phone: string; // 010-XXXX-XXXX 형식
}

// Onboarding API Types
export interface OnboardingRequest {
  name: string;
  phone: string; // 010-XXXX-XXXX 형식
}

// Auth API Types
export interface AuthRefreshResponse {
  accessToken: string;
  profileCompleted: boolean;
}

// MIDI Upload Types
export interface PresignUploadRequest {
  fileName: string;
  contentType: string;
}

export interface PresignUploadResponse {
  fileName: string;
  contentType: string;
}

export interface ConfirmUploadRequest {
  tempKey: string;
  etag: string;
  sizeBytes: number;
}

export interface ConfirmUploadResponse {
  tempKey: string;
  etag: string;
  sizeBytes: number;
}

// MIDI List Types
export interface MidiListParams {
  page: number;
  size: number;
  sort: 'ASC' | 'DESC';
  status: 'UPLOADED' | 'UPLOAD_FAILED' | 'ANALYZING' | 'ANALYZED' | 'LYRICS_GENERATED';
}

export interface MidiSummary {
  lyricsId: number;
  generatedAt: string;
}

export interface MidiListResponse {
  content: MidiSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface MidiDetailResponse {
  summary: MidiSummary;
  text: string;
}

export interface DeleteMidiResponse {
  deletedId: string;
}

// MIDI Analysis Types
export interface TempoSummary {
  bpmAverage: number;
  bpmMedian: number;
  bpmFirst: number;
  bpmMode: number;
}

export interface TempoChange {
  timeMs: number;
  bpm: number;
}

export interface TimeSignature {
  timeMs: number;
  numerator: number;
  denominator: number;
}

export interface Beat {
  timeMs: number;
}

export interface MidiAnalysisResponse {
  midiId: number;
  durationMs: number;
  ppq: number;
  tempoSummary: TempoSummary;
  tempoChanges: TempoChange[];
  timeSignatures: TimeSignature[];
  beats: Beat[];
}

// Lyrics Types
export interface LyricsSummary {
  lyricsId: number;
  generatedAt: string;
}

export interface LyricsListParams {
  page: number;
  size: number;
  sort: string;
  midiId: number;
}

export interface LyricsListResponse {
  content: LyricsSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface LyricsDetailResponse {
  summary: LyricsSummary;
  text: string;
}

export interface LyricsGenerationRequest {
  genres: ('BALLAD' | 'HIP_HOP' | 'ROCK' | 'POP' | 'RNB' | 'INDIE' | 'DANCE' | 'FOLK')[];
  moods: ('HAPPY' | 'SAD' | 'EXCITING' | 'CALM' | 'ROMANTIC' | 'GLOOMY' | 'HOPEFUL' | 'NOSTALGIC' | 'EMOTIONAL' | 'DYNAMIC' | 'DREAMY' | 'INTENSE')[];
  keyword: string[];
  additionalRequest?: string;
}

export interface LyricsGenerationResponse {
  summary: LyricsSummary;
  text: string;
}

// Page Response (공통 페이징)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Error Response
export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  meta?: Record<string, unknown>;
  correlationId?: string;
}
