# Lyricist Web - 백엔드 API 통합 가이드

이 문서는 Lyricist Web 프론트엔드가 백엔드 API와 통합된 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [환경 설정](#환경-설정)
3. [API 클라이언트 구조](#api-클라이언트-구조)
4. [주요 기능](#주요-기능)
5. [타입 정의](#타입-정의)
6. [사용 예시](#사용-예시)

## 개요

백엔드 API (Swagger 문서 기반)와 통합하여 다음 기능을 제공합니다:

- 사용자 인증 및 관리
- MIDI 파일 업로드 및 분석
- 가사 생성 및 관리

## 환경 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## API 클라이언트 구조

### 파일 구조

```
src/
├── lib/
│   ├── api-client.ts          # 백엔드 API 클라이언트
│   ├── api-integration.ts     # API 통합 유틸리티
│   └── api.ts                 # 레거시 API (폴백)
├── types/
│   ├── api.ts                 # API 타입 정의
│   └── index.ts               # 프론트엔드 타입 정의
```

### 주요 모듈

#### 1. `api-client.ts`

백엔드 API와 직접 통신하는 클라이언트입니다.

```typescript
import { apiClient } from '@/lib/api-client';

// 사용 예시
const midis = await apiClient.midi.list({
  page: 0,
  size: 20,
  sort: 'DESC',
  status: 'ANALYZED',
});
```

#### 2. `api-integration.ts`

백엔드 API와 프론트엔드 타입 간의 변환 로직을 제공합니다.

```typescript
import { uploadAndAnalyzeMidi } from '@/lib/api-integration';

// MIDI 업로드 및 분석
const { midiId, analysis } = await uploadAndAnalyzeMidi(file);
```

#### 3. `tokenManager`

JWT 토큰을 관리합니다.

```typescript
import { tokenManager } from '@/lib/api-client';

// 토큰 저장
tokenManager.setTokens(accessToken, refreshToken);

// 토큰 조회
const token = tokenManager.getAccessToken();

// 토큰 삭제
tokenManager.clearTokens();
```

## 주요 기능

### 1. 인증 (Auth)

```typescript
// 토큰 갱신
const { accessToken, profileCompleted } = await apiClient.auth.refresh();

// 로그아웃
await apiClient.auth.logout();
```

### 2. 사용자 관리 (User)

```typescript
// 내 정보 조회
const user = await apiClient.user.getMe();

// 내 정보 수정
const updatedUser = await apiClient.user.updateMe({
  name: '홍길동',
  phone: '010-1234-5678',
});
```

### 3. 온보딩 (Onboarding)

```typescript
// 온보딩 완료
await apiClient.onboarding.complete({
  name: '홍길동',
  phone: '010-1234-5678',
});
```

### 4. MIDI 업로드 및 관리

```typescript
// MIDI 파일 업로드
const { midiId, analysis } = await uploadAndAnalyzeMidi(file);

// MIDI 목록 조회
const midis = await apiClient.midi.list({
  page: 0,
  size: 20,
  sort: 'DESC',
  status: 'ANALYZED',
});

// MIDI 상세 조회
const midi = await apiClient.midi.getById(midiId);

// MIDI 삭제
await apiClient.midi.delete(midiId);
```

### 5. MIDI 분석

```typescript
// 분석 생성
const analysis = await apiClient.analysis.create(midiId);

// 분석 조회
const analysis = await apiClient.analysis.get(midiId);

// 분석 삭제
await apiClient.analysis.delete(midiId);
```

### 6. 가사 생성 및 관리

```typescript
// 가사 생성
const { lyricsId, text } = await generateLyricsFromApi(midiAnalysisId, theme);

// 가사 목록 조회
const lyrics = await apiClient.lyrics.list({
  page: 0,
  size: 20,
  sort: 'desc',
  midiId: midiId,
});

// 가사 상세 조회
const lyricsDetail = await apiClient.lyrics.getById(lyricsId);

// 가사 삭제
await apiClient.lyrics.delete(lyricsId);
```

## 타입 정의

### API 타입 (`types/api.ts`)

백엔드 API 스펙에 맞는 타입 정의입니다.

```typescript
// 장르
type ApiGenre = 'BALLAD' | 'HIP_HOP' | 'ROCK' | 'POP' | 'RNB' | 'INDIE' | 'DANCE' | 'FOLK';

// 무드
type ApiMood = 'HAPPY' | 'SAD' | 'EXCITING' | 'CALM' | 'ROMANTIC' | 'GLOOMY'
  | 'HOPEFUL' | 'NOSTALGIC' | 'EMOTIONAL' | 'DYNAMIC' | 'DREAMY' | 'INTENSE';
```

### 프론트엔드 타입 (`types/index.ts`)

UI에서 사용하는 한글 타입 정의입니다.

```typescript
// 장르
type Genre = '발라드' | '힙합' | '록' | '팝' | 'R&B' | '인디' | '댄스' | '포크';

// 무드
type Mood = '행복한' | '슬픈' | '신나는' | '차분한' | '로맨틱한' | '우울한'
  | '희망적인' | '그리운' | '감성적인' | '역동적인' | '몽환적인' | '강렬한';
```

### 타입 변환

`genreMapping`과 `moodMapping`을 사용하여 한글 타입을 API 타입으로 변환합니다.

```typescript
import { genreMapping, moodMapping } from '@/types';

const apiGenre = genreMapping['발라드']; // 'BALLAD'
const apiMood = moodMapping['행복한']; // 'HAPPY'
```

## 사용 예시

### 완전한 워크플로우 예시

```typescript
import { uploadAndAnalyzeMidi, generateLyricsFromApi } from '@/lib/api-integration';
import { apiClient } from '@/lib/api-client';

async function completeLyricsWorkflow(midiFile: File) {
  try {
    // 1. MIDI 업로드 및 분석
    const { midiId, analysis } = await uploadAndAnalyzeMidi(midiFile);
    console.log('MIDI 분석 완료:', analysis);

    // 2. 가사 생성
    const theme = {
      genres: ['발라드', '팝'],
      moods: ['감성적인', '로맨틱한'],
      keywords: ['사랑', '추억'],
      customStyle: '따뜻하고 감성적인 느낌',
    };

    const { lyricsId, text } = await generateLyricsFromApi(midiId, theme);
    console.log('가사 생성 완료:', text);

    // 3. 생성된 가사 조회
    const lyricsDetail = await apiClient.lyrics.getById(lyricsId);
    console.log('가사 상세:', lyricsDetail);

    return {
      midiId,
      lyricsId,
      lyrics: text,
    };
  } catch (error) {
    console.error('워크플로우 오류:', error);
    throw error;
  }
}
```

## 에러 처리

모든 API 호출은 에러를 throw하므로 try-catch로 처리해야 합니다.

```typescript
try {
  const result = await apiClient.midi.list({ ... });
} catch (error) {
  console.error('API 오류:', error);
  // 에러 처리 로직
}
```

API 에러 응답 형식:

```typescript
interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  meta?: Record<string, unknown>;
  correlationId?: string;
}
```

## 다음 단계

1. **인증 플로우 구현**: OAuth2 또는 JWT 기반 로그인 페이지 추가
2. **MIDI 업로드 UI 개선**: 프로그레스 바 및 업로드 상태 표시
3. **가사 편집 기능 강화**: 실시간 저장 및 버전 관리
4. **에러 처리 개선**: 사용자 친화적인 에러 메시지 표시

## 참고 자료

- [Swagger API 문서](http://localhost:8080/swagger-ui.html)
- [Next.js 문서](https://nextjs.org/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
