'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';
import { Genre, Mood, ProjectTheme } from '@/types';
import { ArrowRight, Music } from 'lucide-react';

const genres: Genre[] = ['발라드', '힙합', '록', '팝', 'R&B', '인디', '댄스', '포크'];
const moods: Mood[] = [
  '행복한', '슬픈', '신나는', '차분한', '로맨틱한', '우울한', 
  '희망적인', '그리운', '감성적인', '역동적인', '몽환적인', '강렬한'
];

export default function ThemePage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, updateProjectTheme } = useProjectStore();
  const songId = params.songId as string;

  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [keywords, setKeywords] = useState('');
  const [customStyle, setCustomStyle] = useState('');

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleMood = (mood: Mood) => {
    setSelectedMoods(prev =>
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handleNext = () => {
    const theme: ProjectTheme = {
      genres: selectedGenres,
      moods: selectedMoods,
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      customStyle: customStyle || undefined,
    };

    updateProjectTheme(theme);
    router.push(`/editor/${songId}/workspace`);
  };

  const canProceed = selectedGenres.length > 0 && selectedMoods.length > 0;

  if (!currentProject) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">곡 테마 설정</h1>
            <p className="text-muted-foreground">
              {currentProject.name}의 장르와 분위기를 설정해주세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Analysis results */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    분석 결과
                  </CardTitle>
                  <CardDescription>업로드된 MIDI 파일 분석 정보</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">파일명:</span>
                      <p className="font-medium">{currentProject.midiAnalysis.fileName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">길이:</span>
                      <p className="font-medium">{Math.floor(currentProject.midiAnalysis.duration / 60)}분 {currentProject.midiAnalysis.duration % 60}초</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">템포:</span>
                      <p className="font-medium">{currentProject.midiAnalysis.tempo} BPM</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">조성:</span>
                      <p className="font-medium">{currentProject.midiAnalysis.key}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">곡 구조:</span>
                    <div className="space-y-2">
                      {currentProject.midiAnalysis.structure.map((section, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="font-medium">{section.name}</span>
                          <Badge variant="outline">{section.syllableCount} 음절</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Theme settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>장르 선택</CardTitle>
                  <CardDescription>곡에 어울리는 장르를 선택해주세요 (다중 선택 가능)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>분위기 선택</CardTitle>
                  <CardDescription>원하는 가사의 분위기를 선택해주세요 (다중 선택 가능)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => toggleMood(mood)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>키워드 (선택사항)</CardTitle>
                  <CardDescription>가사에 포함하고 싶은 키워드나 주제를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="예: 사랑, 이별, 꿈, 희망 (쉼표로 구분)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <Textarea
                    placeholder="참고할 스타일이나 추가 요청사항이 있다면 자유롭게 입력해주세요"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Button 
                onClick={handleNext} 
                disabled={!canProceed}
                size="lg" 
                className="w-full"
              >
                가사 제작 시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}