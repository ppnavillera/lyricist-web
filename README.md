# Lyricist Web 🎵

MIDI 파일을 분석하여 자동으로 작사를 도와주는 AI 가사 작성 도구

## 주요 기능

- 🎹 **MIDI 파일 분석**: MIDI 파일을 업로드하면 템포, 박자, 구조 등을 자동 분석
- 🤖 **AI 가사 생성**: 장르, 무드, 키워드를 선택하여 AI가 가사를 자동 생성
- ✍️ **가사 편집**: 생성된 가사를 실시간으로 편집하고 수정
- 🎼 **구조 시각화**: 곡의 구조(Verse, Chorus, Bridge 등)를 시각적으로 표시
- 💾 **프로젝트 저장**: 작업 중인 프로젝트를 저장하고 나중에 다시 불러오기

## 기술 스택

- **프레임워크**: Next.js 15.4 (App Router)
- **언어**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **상태 관리**: Zustand
- **AI**: Google Generative AI (Gemini)
- **백엔드 통신**: Custom API Client
- **음악 처리**: Tone.js, @tonejs/midi

## 시작하기

### 필수 조건

- Node.js 20 이상
- npm, yarn, pnpm, 또는 bun

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd lyricist-web

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.local.example .env.local
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# 백엔드 API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Google AI API Key (선택사항 - 레거시 기능용)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
lyricist-web/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx           # 랜딩 페이지
│   │   ├── editor/            # 편집기 페이지
│   │   └── api/               # API 라우트 (레거시)
│   ├── components/            # React 컴포넌트
│   │   ├── common/           # 공통 컴포넌트
│   │   ├── lyrics/           # 가사 관련 컴포넌트
│   │   ├── midi/             # MIDI 관련 컴포넌트
│   │   ├── upload/           # 업로드 관련 컴포넌트
│   │   ├── workspace/        # 작업 공간 컴포넌트
│   │   └── ui/               # UI 기본 컴포넌트
│   ├── lib/                   # 유틸리티 및 라이브러리
│   │   ├── api-client.ts     # 백엔드 API 클라이언트
│   │   ├── api-integration.ts # API 통합 유틸리티
│   │   ├── api.ts            # 레거시 API
│   │   ├── store.ts          # Zustand 스토어
│   │   └── utils.ts          # 공통 유틸리티
│   └── types/                 # TypeScript 타입 정의
│       ├── api.ts            # API 타입
│       └── index.ts          # 프론트엔드 타입
├── public/                    # 정적 파일
└── docs/                      # 문서
    ├── API_INTEGRATION.md    # API 통합 가이드
    └── CHANGELOG.md          # 변경 이력
```

## API 통합

이 프로젝트는 백엔드 API와 통합되어 있습니다. 자세한 내용은 [API_INTEGRATION.md](./API_INTEGRATION.md)를 참고하세요.

### 주요 API 기능

- **인증**: JWT 토큰 기반 인증
- **MIDI 업로드**: S3 Presigned URL을 통한 파일 업로드
- **MIDI 분석**: 템포, 박자, 비트 정보 추출
- **가사 생성**: AI 기반 가사 자동 생성

## 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 개발 가이드

### 컴포넌트 추가

새 컴포넌트는 `src/components/` 디렉토리에 추가하세요.

```typescript
// src/components/example/ExampleComponent.tsx
export function ExampleComponent() {
  return <div>Example</div>;
}
```

### API 호출

```typescript
import { apiClient } from '@/lib/api-client';

// MIDI 목록 조회
const midis = await apiClient.midi.list({
  page: 0,
  size: 20,
  sort: 'DESC',
  status: 'ANALYZED',
});
```

### 상태 관리

```typescript
import { useProjectStore } from '@/lib/store';

function MyComponent() {
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  // ...
}
```

## 배포

### Vercel

가장 간단한 배포 방법은 [Vercel Platform](https://vercel.com/new)을 사용하는 것입니다.

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포

자세한 내용은 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)을 참고하세요.

## 라이선스

MIT License

## 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 문의

문제가 있거나 제안사항이 있다면 이슈를 생성해주세요.

---

Made with ❤️ by Lyricist Team
