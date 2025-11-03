// API 클라이언트 - 백엔드 API와 통신
// 빈 문자열 = Next.js 프록시 사용 (CORS 회피)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// API 에러 타입
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  meta?: Record<string, unknown>;
  correlationId?: string;
}

// 토큰 관리
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(access: string, refresh?: string) {
    this.accessToken = access;
    if (refresh) {
      this.refreshToken = refresh;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', access);
      if (refresh) {
        localStorage.setItem('refreshToken', refresh);
      }
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken && typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}

export const tokenManager = new TokenManager();

// API 클라이언트 클래스
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = tokenManager.getAccessToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || `API 요청 실패: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        // 백엔드 응답이 { success, data, timestamp } 형식인 경우 data 추출
        if (json.success && json.data !== undefined) {
          return json.data as T;
        }
        return json as T;
      }

      return {} as T;
    } catch (error) {
      console.error('API 요청 오류:', error);
      throw error;
    }
  }

  // 인증 API
  auth = {
    refresh: async () => {
      const response = await this.request<{ accessToken: string; profileCompleted: boolean }>(
        '/api/v1/auth/refresh',
        { method: 'POST' }
      );
      tokenManager.setTokens(response.accessToken);
      return response;
    },

    logout: async () => {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
      tokenManager.clearTokens();
    },
  };

  // 사용자 API
  user = {
    getMe: async () => {
      return this.request<{ userId: string; name: string; phone: string }>(
        '/api/v1/user/my'
      );
    },

    updateMe: async (data: { name: string; phone: string }) => {
      return this.request<{ userId: string; name: string; phone: string }>(
        '/api/v1/user/my',
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
    },
  };

  // 온보딩 API
  onboarding = {
    complete: async (data: { name: string; phone: string }) => {
      return this.request('/api/v1/onboarding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // MIDI 업로드 API
  midi = {
    presignUpload: async (data: { fileName: string; contentType: string }) => {
      return this.request<{ fileName: string; contentType: string }>(
        '/api/v1/midis/presign',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    confirmUpload: async (data: { tempKey: string; etag: string; sizeBytes: number }) => {
      return this.request<{ tempKey: string; etag: string; sizeBytes: number }>(
        '/api/v1/midis',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
    },

    list: async (params: { page: number; size: number; sort: 'ASC' | 'DESC'; status: string }) => {
      const query = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString(),
        sort: params.sort,
        status: params.status,
      });
      return this.request<{
        content: Array<{ lyricsId: number; generatedAt: string }>;
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
      }>(`/api/v1/midis?${query}`);
    },

    getById: async (midiId: number) => {
      return this.request<{
        summary: { lyricsId: number; generatedAt: string };
        text: string;
      }>(`/api/v1/midis/${midiId}`);
    },

    delete: async (midiId: number) => {
      return this.request<{ deletedId: string }>(
        `/api/v1/midis/${midiId}`,
        { method: 'DELETE' }
      );
    },
  };

  // MIDI 분석 API
  analysis = {
    create: async (midiId: number) => {
      return this.request<{
        midiId: number;
        durationMs: number;
        ppq: number;
        tempoSummary: {
          bpmAverage: number;
          bpmMedian: number;
          bpmFirst: number;
          bpmMode: number;
        };
        tempoChanges: Array<{ timeMs: number; bpm: number }>;
        timeSignatures: Array<{ timeMs: number; numerator: number; denominator: number }>;
        beats: Array<{ timeMs: number }>;
      }>(`/api/v1/midi/analysis/${midiId}`, { method: 'POST' });
    },

    get: async (midiId: number) => {
      return this.request<{
        midiId: number;
        durationMs: number;
        ppq: number;
        tempoSummary: {
          bpmAverage: number;
          bpmMedian: number;
          bpmFirst: number;
          bpmMode: number;
        };
        tempoChanges: Array<{ timeMs: number; bpm: number }>;
        timeSignatures: Array<{ timeMs: number; numerator: number; denominator: number }>;
        beats: Array<{ timeMs: number }>;
      }>(`/api/v1/midi/analysis/${midiId}`);
    },

    delete: async (midiId: number) => {
      return this.request<string>(
        `/api/v1/midi/analysis/${midiId}`,
        { method: 'DELETE' }
      );
    },
  };

  // 가사 API
  lyrics = {
    list: async (params: { page: number; size: number; sort: string; midiId: number }) => {
      const query = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString(),
        sort: params.sort,
        midiId: params.midiId.toString(),
      });
      return this.request<{
        content: Array<{ lyricsId: number; generatedAt: string }>;
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
      }>(`/api/v1/lyrics?${query}`);
    },

    getById: async (lyricsId: number) => {
      return this.request<{
        summary: { lyricsId: number; generatedAt: string };
        text: string;
      }>(`/api/v1/lyrics/${lyricsId}`);
    },

    generate: async (midiAnalysisId: number, request: {
      genres: string[];
      moods: string[];
      keyword: string[];
      additionalRequest?: string;
    }) => {
      return this.request<{
        summary: { lyricsId: number; generatedAt: string };
        text: string;
      }>(`/api/v1/lyrics/generation?midiAnalysisId=${midiAnalysisId}`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    delete: async (lyricsId: number) => {
      return this.request<string>(
        `/api/v1/lyrics/${lyricsId}`,
        { method: 'DELETE' }
      );
    },
  };
}

export const apiClient = new ApiClient(API_BASE_URL);
