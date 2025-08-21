'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { SongStructure, LyricsProject } from '@/types';
import { useProjectStore } from '@/lib/store';
import SyllableAdjuster from './SyllableAdjuster';
import AiLyricsGenerator from './AiLyricsGenerator';
import LyricsTextEditor from './LyricsTextEditor';
import EditableTitle from '@/components/common/EditableTitle';

interface LyricsEditorProps {
  structure: SongStructure;
  structureIndex: number;
  project: LyricsProject;
}

type EditorStep = 'syllable' | 'lyrics';

export default function LyricsEditor({ structure, structureIndex, project }: LyricsEditorProps) {
  const router = useRouter();
  const params = useParams();
  const songId = params.songId as string;
  
  const { 
    updateStructureSyllableCount, 
    updateStructureLineStructure,
    updateStructureName,
    updateStructureLyrics, 
    markStructureCompleted, 
    setCurrentStructureIndex 
  } = useProjectStore();
  
  const [currentStep, setCurrentStep] = useState<EditorStep>(
    structure.adjustedSyllableCount !== undefined ? 'lyrics' : 'syllable'
  );

  const handleSyllableComplete = (syllableCount: number, lineStructure: import('@/types').LineStructure[]) => {
    updateStructureSyllableCount(structure.id, syllableCount);
    updateStructureLineStructure(structure.id, lineStructure);
    setCurrentStep('lyrics');
  };

  const handleLyricsComplete = (lyrics: string) => {
    updateStructureLyrics(structure.id, lyrics);
    markStructureCompleted(structure.id);
    
    // Move to next structure or complete
    const nextIndex = structureIndex + 1;
    if (nextIndex < project.midiAnalysis.structure.length) {
      const nextStructure = project.midiAnalysis.structure[nextIndex];
      setCurrentStructureIndex(nextIndex);
      router.push(`/editor/${songId}/workspace/${nextStructure.id}`);
    } else {
      // All structures completed
      router.push(`/editor/${songId}/complete`);
    }
  };

  const handlePrevious = () => {
    if (structureIndex > 0) {
      const prevStructure = project.midiAnalysis.structure[structureIndex - 1];
      setCurrentStructureIndex(structureIndex - 1);
      router.push(`/editor/${songId}/workspace/${prevStructure.id}`);
    }
  };

  const handleNameChange = (newName: string) => {
    updateStructureName(structure.id, newName);
  };

  const canGoPrevious = structureIndex > 0;
  const isLastStructure = structureIndex === project.midiAnalysis.structure.length - 1;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <EditableTitle
                value={structure.name}
                onChange={handleNameChange}
                placeholder="구간 이름"
                maxLength={30}
              />
              <span className="text-2xl font-bold text-muted-foreground">가사 제작</span>
            </div>
            <p className="text-muted-foreground mt-1">
              {structureIndex + 1} / {project.midiAnalysis.structure.length} 단계
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              이전
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {currentStep === 'syllable' ? (
            <SyllableAdjuster
              structure={structure}
              onComplete={handleSyllableComplete}
            />
          ) : (
            <div className="space-y-6">
              <AiLyricsGenerator
                structure={structure}
                project={project}
              />
              
              <LyricsTextEditor
                structure={structure}
                onComplete={handleLyricsComplete}
                isLastStructure={isLastStructure}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}