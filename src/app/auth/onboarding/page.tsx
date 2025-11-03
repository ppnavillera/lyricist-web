'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

export default function OnboardingPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const validatePhone = (phone: string): boolean => {
    // 010-XXXX-XXXX 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 010-XXXX-XXXX 형식으로 자동 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('전화번호를 010-XXXX-XXXX 형식으로 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.onboarding.complete({
        name: formData.name.trim(),
        phone: formData.phone,
      });

      // 사용자 정보 다시 로드
      await checkAuth();

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
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(
        err instanceof Error ? err.message : '프로필 등록에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
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

      <Card className="w-full max-w-md mx-4 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
              <Music className="h-16 w-16 text-primary relative z-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text">환영합니다!</h1>
          <p className="text-muted-foreground">
            프로필 정보를 입력하고 Lyricist AI를 시작하세요
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={handlePhoneChange}
                disabled={loading}
                maxLength={13}
                required
              />
              <p className="text-xs text-muted-foreground">
                010-XXXX-XXXX 형식으로 입력해주세요
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              size="lg"
              disabled={loading}
            >
              {loading ? '처리 중...' : '시작하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
