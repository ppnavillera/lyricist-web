'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient, tokenManager } from '@/lib/api-client';

export default function AuthCallback() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // OAuth2 로그인 후 백엔드가 refreshToken을 HttpOnly 쿠키로 설정함
      // 이제 /api/v1/auth/refresh를 호출하여 accessToken을 받아야 함

      const response = await apiClient.auth.refresh();

      // accessToken 저장
      tokenManager.setTokens(response.accessToken);

      // 사용자 정보 로드
      await checkAuth();

      // 온보딩 체크
      if (!response.profileCompleted) {
        router.push('/auth/onboarding');
      } else {
        // 로그인 전 경로로 돌아가기
        const redirectPath =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('redirectAfterLogin')
            : null;

        if (redirectPath && redirectPath !== '/auth/login') {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      // 에러 발생 시 로그인 페이지로
      router.push('/auth/login?error=auth_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="text-center relative z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
        <p className="text-muted-foreground">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
