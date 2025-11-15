'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Save } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import LyricsEditor from '@/components/lyrics/LyricsEditor';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject } = useProjectStore();
  const verseId = params.verseId?.[0];
  const t = useTranslations('workspace');

  const handleGoHome = () => {
    if (confirm(t('confirmGoHome'))) {
      router.push('/');
    }
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('noProject')}</h2>
          <p className="text-muted-foreground">{t('noProjectDesc')}</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            {t('goHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Determine current structure to edit
  let currentStructureIndex = 0;
  if (verseId) {
    const structureIndex = currentProject.midiAnalysis.structure.findIndex(s => s.id === verseId);
    if (structureIndex !== -1) {
      currentStructureIndex = structureIndex;
    }
  } else {
    currentStructureIndex = currentProject.currentStructureIndex;
  }

  const currentStructure = currentProject.midiAnalysis.structure[currentStructureIndex];

  if (!currentStructure) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{t('selectPart')}</h2>
          <p className="text-muted-foreground">{t('selectPartDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Action Bar */}
      <div className="border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{currentStructure.name}</h2>
            <p className="text-xs text-muted-foreground">
              {currentProject.name} · {t('autoSaved')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {t('goHome')}
          </Button>
        </div>
      </div>

      <LyricsEditor
        structure={currentStructure}
        structureIndex={currentStructureIndex}
        project={currentProject}
      />
    </div>
  );
}