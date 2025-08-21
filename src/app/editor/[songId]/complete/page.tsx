'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Copy, FileText, Music, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';
import { downloadAsFile, copyToClipboard, formatDate } from '@/lib/utils';

export default function CompletePage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, resetProject } = useProjectStore();
  const [copySuccess, setCopySuccess] = useState(false);

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">프로젝트를 찾을 수 없습니다</h2>
          <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const completedStructures = currentProject.midiAnalysis.structure.filter(s => s.isCompleted && s.lyrics);
  const totalSyllables = completedStructures.reduce((sum, s) => sum + (s.adjustedSyllableCount || s.syllableCount), 0);

  const generateFullLyrics = () => {
    return completedStructures
      .map(structure => `[${structure.name}]\n${structure.lyrics}\n`)
      .join('\n');
  };

  const generateDetailedExport = () => {
    const lyrics = generateFullLyrics();
    const info = `프로젝트: ${currentProject.name}
파일: ${currentProject.midiAnalysis.fileName}
생성일: ${formatDate(currentProject.midiAnalysis.createdAt)}
완료일: ${currentProject.completedAt ? formatDate(currentProject.completedAt) : '진행중'}

장르: ${currentProject.theme.genres.join(', ')}
분위기: ${currentProject.theme.moods.join(', ')}
${currentProject.theme.keywords.length > 0 ? `키워드: ${currentProject.theme.keywords.join(', ')}` : ''}

총 음절 수: ${totalSyllables}
총 ${completedStructures.length}개 구간

=== 가사 ===

${lyrics}

Generated with Lyricist AI`;
    
    return info;
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(generateFullLyrics());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownloadTxt = () => {
    const content = generateDetailedExport();
    downloadAsFile(content, `${currentProject.name}_lyrics.txt`, 'text/plain');
  };

  const handleNewProject = () => {
    resetProject();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎉 프로젝트 완료!</h1>
              <p className="text-muted-foreground">
                {currentProject.name}의 가사 제작이 완료되었습니다
              </p>
            </div>
            <Button variant="outline" onClick={handleNewProject}>
              <Home className="h-4 w-4 mr-2" />
              새 프로젝트
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Final Lyrics */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  완성된 가사
                </CardTitle>
                <CardDescription>
                  모든 구간의 가사가 완성되었습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {completedStructures.map((structure, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{structure.name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {structure.adjustedSyllableCount || structure.syllableCount} 음절
                        </span>
                      </div>
                      <div className="p-4 bg-muted/20 rounded-lg whitespace-pre-line text-sm leading-relaxed">
                        {structure.lyrics}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  내보내기
                </CardTitle>
                <CardDescription>
                  완성된 가사를 다양한 형태로 저장하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={handleCopy} variant="outline" className="h-auto p-4">
                    <div className="flex flex-col items-center gap-2">
                      <Copy className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">클립보드 복사</div>
                        <div className="text-xs text-muted-foreground">
                          {copySuccess ? '복사 완료!' : '가사만 복사'}
                        </div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button onClick={handleDownloadTxt} variant="outline" className="h-auto p-4">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">TXT 다운로드</div>
                        <div className="text-xs text-muted-foreground">프로젝트 정보 포함</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Project Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">프로젝트명</span>
                    <p className="font-medium">{currentProject.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">MIDI 파일</span>
                    <p className="font-medium">{currentProject.midiAnalysis.fileName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">완료일</span>
                    <p className="font-medium">
                      {currentProject.completedAt ? formatDate(currentProject.completedAt) : '방금 전'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">장르</span>
                  <div className="flex flex-wrap gap-1">
                    {currentProject.theme.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">분위기</span>
                  <div className="flex flex-wrap gap-1">
                    {currentProject.theme.moods.map((mood, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>

                {currentProject.theme.keywords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">키워드</span>
                    <p className="text-sm">{currentProject.theme.keywords.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{completedStructures.length}</div>
                    <div className="text-xs text-muted-foreground">완성된 구간</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalSyllables}</div>
                    <div className="text-xs text-muted-foreground">총 음절 수</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {Math.floor(currentProject.midiAnalysis.duration / 60)}분 {currentProject.midiAnalysis.duration % 60}초
                  </div>
                  <div className="text-xs text-muted-foreground">곡 길이</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}