'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function SongLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { currentProject } = useProjectStore();
  const songId = params.songId as string;

  useEffect(() => {
    // If no current project or project ID doesn't match, redirect to home
    if (!currentProject || currentProject.id !== songId) {
      router.push('/');
    }
  }, [currentProject, songId, router]);

  if (!currentProject || currentProject.id !== songId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}