'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProjectStore } from '@/lib/store';
import LyricsEditor from '@/components/lyrics/LyricsEditor';

export default function WorkspacePage() {
  const params = useParams();
  const { currentProject } = useProjectStore();
  const verseId = params.verseId?.[0];

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">프로젝트를 불러올 수 없습니다</h2>
          <p className="text-muted-foreground">홈페이지로 돌아가서 새로운 프로젝트를 시작하세요.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            홈으로 이동
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
          <h2 className="text-xl font-semibold mb-2">작업할 파트를 선택해주세요</h2>
          <p className="text-muted-foreground">왼쪽 사이드바에서 편집할 파트를 선택하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <LyricsEditor 
        structure={currentStructure}
        structureIndex={currentStructureIndex}
        project={currentProject}
      />
    </div>
  );
}