export interface MidiAnalysis {
  id: string;
  fileName: string;
  duration: number;
  tempo: number;
  timeSignature: string;
  key: string;
  structure: SongStructure[];
  totalSyllables: number;
  createdAt: Date;
}

// API Response types
export interface MidiAnalyzerMetadata {
  midi_file: string;
  tempo_bpm: number;
  time_signature: string;
  total_duration_seconds: number;
  bars_per_phrase: number;
  total_phrases: number;
}

export interface SectionSummary {
  total_syllables: number;
  phrase_count: number;
}

export interface LyricsGenerationTask {
  section: string;
  target_syllables: number;
  time_range: {
    start: number;
    end: number;
  };
  bars: string;
}

export interface MidiAnalyzerResponse {
  metadata: MidiAnalyzerMetadata;
  syllable_requirements: Record<string, number>;
  section_summary: Record<string, SectionSummary>;
  lyrics_generation_tasks: LyricsGenerationTask[];
}

export interface LineStructure {
  syllables: number;
  description?: string;
}

export interface SongStructure {
  id: string;
  type: StructureType;
  name: string;
  startTime: number;
  endTime: number;
  syllableCount: number;
  adjustedSyllableCount?: number;
  lineStructure?: LineStructure[];
  lyrics?: string;
  isCompleted: boolean;
}

export type StructureType = 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'pre-chorus' | 'instrumental';

export interface ProjectTheme {
  genres: Genre[];
  moods: Mood[];
  keywords: string[];
  customStyle?: string;
}

export type Genre = 
  | '발라드' 
  | '힙합' 
  | '록' 
  | '팝' 
  | 'R&B' 
  | '인디' 
  | '댄스' 
  | '포크';

export type Mood = 
  | '행복한' 
  | '슬픈' 
  | '신나는' 
  | '차분한' 
  | '로맨틱한' 
  | '우울한' 
  | '희망적인' 
  | '그리운' 
  | '감성적인' 
  | '역동적인' 
  | '몽환적인' 
  | '강렬한';

export interface LyricsProject {
  id: string;
  name: string;
  midiAnalysis: MidiAnalysis;
  midiFileUrl?: string; // URL to stored MIDI file for playback
  theme: ProjectTheme;
  currentStructureIndex: number;
  isCompleted: boolean;
  completedAt?: Date;
  updatedAt: Date;
}

export interface LyricsGenerationRequest {
  structureId: string;
  syllableCount: number;
  theme: ProjectTheme;
  additionalPrompt?: string;
  context?: {
    previousStructures?: SongStructure[];
    overallTheme?: string;
  };
}

export interface LyricsGenerationResponse {
  structureId: string;
  lyrics: string;
  syllableCount: number;
  confidence: number;
  alternatives?: string[];
}

export interface ExportOptions {
  format: 'txt' | 'pdf' | 'clipboard';
  includeStructureInfo: boolean;
  includeProjectInfo: boolean;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  currentView: 'upload' | 'theme' | 'editor' | 'complete';
  sidebarCollapsed: boolean;
}