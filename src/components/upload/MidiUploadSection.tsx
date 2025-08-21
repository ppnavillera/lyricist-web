'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Music, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProjectStore } from '@/lib/store';
import { validateMidiFile, formatFileSize, generateId } from '@/lib/utils';
import { MidiAnalysis, SongStructure, LyricsProject } from '@/types';

export default function MidiUploadSection() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { setCurrentProject, setCurrentView, setLoading } = useProjectStore();
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    if (!validateMidiFile(file)) {
      setUploadError('올바른 MIDI 파일(.mid, .midi)을 업로드해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setLoading(true);

    try {
      // Mock MIDI analysis - In real app, this would call backend API
      const mockAnalysis: MidiAnalysis = {
        id: generateId(),
        fileName: file.name,
        duration: 180, // 3 minutes
        tempo: 120,
        timeSignature: '4/4',
        key: 'C Major',
        structure: [
          {
            id: generateId(),
            type: 'verse',
            name: 'Verse 1',
            startTime: 0,
            endTime: 30,
            syllableCount: 32,
            isCompleted: false,
          },
          {
            id: generateId(),
            type: 'chorus',
            name: 'Chorus',
            startTime: 30,
            endTime: 60,
            syllableCount: 28,
            isCompleted: false,
          },
          {
            id: generateId(),
            type: 'verse',
            name: 'Verse 2',
            startTime: 60,
            endTime: 90,
            syllableCount: 32,
            isCompleted: false,
          },
          {
            id: generateId(),
            type: 'chorus',
            name: 'Chorus',
            startTime: 90,
            endTime: 120,
            syllableCount: 28,
            isCompleted: false,
          },
          {
            id: generateId(),
            type: 'bridge',
            name: 'Bridge',
            startTime: 120,
            endTime: 150,
            syllableCount: 24,
            isCompleted: false,
          },
          {
            id: generateId(),
            type: 'chorus',
            name: 'Chorus (Final)',
            startTime: 150,
            endTime: 180,
            syllableCount: 28,
            isCompleted: false,
          },
        ] as SongStructure[],
        totalSyllables: 172,
        createdAt: new Date(),
      };

      const project: LyricsProject = {
        id: generateId(),
        name: file.name.replace(/\.(mid|midi)$/i, ''),
        midiAnalysis: mockAnalysis,
        theme: {
          genres: [],
          moods: [],
          keywords: [],
        },
        currentStructureIndex: 0,
        isCompleted: false,
        updatedAt: new Date(),
      };

      setCurrentProject(project);
      setCurrentView('theme');
      
      // Navigate to theme selection page
      router.push(`/editor/${project.id}/theme`);
    } catch (error) {
      setUploadError('파일 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  }, [setCurrentProject, setCurrentView, setLoading, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/midi': ['.mid', '.midi'],
      'audio/x-midi': ['.mid', '.midi'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-2xl">
      <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center space-y-4 py-8 cursor-pointer
              ${isDragActive ? 'bg-primary/5' : ''}
              ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'MIDI 파일을 여기에 놓으세요' : 'MIDI 파일을 업로드하세요'}
              </h3>
              <p className="text-muted-foreground">
                드래그 앤 드롭하거나 클릭하여 업로드
              </p>
              <p className="text-sm text-muted-foreground">
                지원 형식: .mid, .midi (최대 10MB)
              </p>
            </div>
            
            {!isUploading && (
              <Button variant="outline" className="mt-4">
                <Music className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
            )}
          </div>
          
          {uploadError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{uploadError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}