'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, tokenManager } from './api-client';

interface User {
  userId: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 초기화: 토큰 체크 & 사용자 정보 로드
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = tokenManager.getAccessToken();

    if (token) {
      try {
        // 사용자 정보 조회 (debug/me 사용)
        const response = await fetch('/api/v1/auth/debug/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // 토큰 만료 시 refresh 시도
          await refreshToken();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Refresh 시도
        await refreshToken();
      }
    }

    setLoading(false);
  };

  const login = () => {
    // 현재 경로 저장 (로그인 후 돌아오기 위해)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    }

    // OAuth2 로그인 페이지로 리다이렉트 (프록시 사용)
    window.location.href = '/oauth2/authorization/google';
  };

  const logout = async () => {
    try {
      const token = tokenManager.getAccessToken();
      if (token) {
        await apiClient.auth.logout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      router.push('/');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.auth.refresh();
      tokenManager.setTokens(response.accessToken);

      // 온보딩 체크
      if (!response.profileCompleted) {
        router.push('/auth/onboarding');
        return;
      }

      // 사용자 정보 다시 로드
      await checkAuth();
    } catch (error) {
      console.error('Token refresh failed:', error);
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
