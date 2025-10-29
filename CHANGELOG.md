# Changelog

## [API 통합] - 2025-10-29

### 추가됨

#### 1. 백엔드 API 클라이언트 (`src/lib/api-client.ts`)
- JWT 토큰 관리 (`TokenManager` 클래스)
- RESTful API 클라이언트 (`ApiClient` 클래스)
- 다음 API 엔드포인트 지원:
  - 인증 (Auth): 토큰 갱신, 로그아웃
  - 사용자 (User): 내 정보 조회/수정
  - 온보딩 (Onboarding): 프로필 완성
  - MIDI 업로드: Presign URL, 업로드 확인
  - MIDI 관리: 목록 조회, 상세 조회, 삭제
  - MIDI 분석: 생성, 조회, 삭제
  - 가사: 목록 조회, 상세 조회, 생성, 삭제

#### 2. API 타입 정의 (`src/types/api.ts`)
- 백엔드 API 스펙에 맞는 TypeScript 타입 정의
- Request/Response 인터페이스
- 에러 응답 타입

#### 3. API 통합 유틸리티 (`src/lib/api-integration.ts`)
- MIDI 업로드 및 분석 통합 함수
- 백엔드 타입 ↔ 프론트엔드 타입 변환 함수
- 가사 생성 API 래퍼

#### 4. 환경 변수 템플릿 (`.env.local.example`)
- API Base URL 설정
- Google AI API Key 설정 (레거시 지원)

#### 5. 문서
- `API_INTEGRATION.md`: API 통합 가이드
- `CHANGELOG.md`: 변경 이력

### 변경됨

#### 1. 타입 정의 업데이트 (`src/types/index.ts`)
- API 연동 필드 추가 (`midiId`, `apiAnalysis`, `apiMidiId`, `apiLyricsId`)
- 장르/무드 매핑 추가:
  - `ApiGenre`, `ApiMood`: API에서 사용하는 영문 타입
  - `Genre`, `Mood`: UI에서 사용하는 한글 타입
  - `genreMapping`, `moodMapping`: 변환 매핑

#### 2. API 래퍼 업데이트 (`src/lib/api.ts`)
- 기존 로컬 API 함수 유지 (폴백)
- 새로운 백엔드 API 함수 export

### 호환성

- 기존 코드와의 호환성을 위해 레거시 API 함수 유지
- 점진적으로 새로운 API로 마이그레이션 가능

### 다음 할 일

1. **인증 플로우 구현**
   - 로그인/회원가입 페이지 추가
   - OAuth2 또는 JWT 인증 처리
   - 토큰 자동 갱신 로직

2. **MIDI 업로드 플로우 개선**
   - S3 Presigned URL을 통한 직접 업로드
   - 업로드 진행률 표시
   - 에러 처리 개선

3. **가사 생성 UI 통합**
   - 백엔드 API를 사용한 가사 생성
   - 생성된 가사 저장 및 관리
   - 버전 관리 기능

4. **테스트 추가**
   - API 클라이언트 단위 테스트
   - 통합 테스트
   - E2E 테스트

5. **에러 처리 개선**
   - 전역 에러 핸들러
   - 사용자 친화적인 에러 메시지
   - 재시도 로직

### 마이그레이션 가이드

기존 코드를 새로운 API로 마이그레이션하려면:

```typescript
// Before (기존)
import { analyzeMidiFile } from '@/lib/api';
const analysis = await analyzeMidiFile(file);

// After (새로운)
import { uploadAndAnalyzeMidi } from '@/lib/api-integration';
const { midiId, analysis } = await uploadAndAnalyzeMidi(file);
```

자세한 내용은 `API_INTEGRATION.md`를 참고하세요.
