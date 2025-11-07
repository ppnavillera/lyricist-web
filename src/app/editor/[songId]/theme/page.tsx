"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/lib/store";
import { Genre, Mood, ProjectTheme } from "@/types";
import { ArrowRight, Music, Sparkles, Home } from "lucide-react";

const genres: Genre[] = [
  "발라드",
  "힙합",
  "록",
  "팝",
  "R&B",
  "인디",
  "댄스",
  "포크",
];
const moods: Mood[] = [
  "행복한",
  "슬픈",
  "신나는",
  "차분한",
  "로맨틱한",
  "우울한",
  "희망적인",
  "그리운",
  "감성적인",
  "역동적인",
  "몽환적인",
  "강렬한",
];

export default function ThemePage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, updateProjectTheme } = useProjectStore();
  const songId = params.songId as string;

  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);
  const [keywords, setKeywords] = useState("");
  const [customStyle, setCustomStyle] = useState("");

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleMood = (mood: Mood) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleNext = () => {
    const theme: ProjectTheme = {
      genres: selectedGenres,
      moods: selectedMoods,
      keywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      customStyle: customStyle || undefined,
    };

    updateProjectTheme(theme);
    router.push(`/editor/${songId}/workspace`);
  };

  const handleGoHome = () => {
    if (confirm('홈으로 돌아가시겠습니까? 모든 작업 내용은 자동으로 저장됩니다.')) {
      router.push('/');
    }
  };

  const canProceed = selectedGenres.length > 0 && selectedMoods.length > 0;

  if (!currentProject) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1"></div>
              <div className="flex items-center justify-center gap-3 flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                  <Sparkles className="h-10 w-10 text-primary relative z-10" />
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  홈으로
                </Button>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                곡 테마 설정
              </h1>
              <p className="text-xl text-muted-foreground">
                {currentProject.name}의 장르와 분위기를 설정해주세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Analysis results */}
            <div className="space-y-6 animate-slide-up">
              <Card className="card-hover border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    분석 결과
                  </CardTitle>
                  <CardDescription>
                    업로드된 MIDI 파일 분석 정보
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted/30 rounded-lg backdrop-blur-sm">
                      <span className="text-muted-foreground block mb-1">
                        파일명
                      </span>
                      <p className="font-medium truncate">
                        {currentProject.midiAnalysis.fileName}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg backdrop-blur-sm">
                      <span className="text-muted-foreground block mb-1">
                        길이
                      </span>
                      <p className="font-medium">
                        {Math.floor(currentProject.midiAnalysis.duration / 60)}
                        분 {currentProject.midiAnalysis.duration % 60}초
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg backdrop-blur-sm">
                      <span className="text-muted-foreground block mb-1">
                        템포
                      </span>
                      <p className="font-medium">
                        {currentProject.midiAnalysis.tempo} BPM
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg backdrop-blur-sm">
                      <span className="text-muted-foreground block mb-1">
                        조성
                      </span>
                      <p className="font-medium">
                        {currentProject.midiAnalysis.key}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">
                      곡 구조
                    </span>
                    <div className="space-y-2">
                      {currentProject.midiAnalysis.structure.map(
                        (section, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg backdrop-blur-sm border border-primary/10"
                          >
                            <span className="font-medium">{section.name}</span>
                            <Badge variant="outline">
                              {section.syllableCount} 음절
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Theme settings */}
            <div
              className="space-y-6 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <Card className="card-hover border-primary/20">
                <CardHeader>
                  <CardTitle>장르 선택</CardTitle>
                  <CardDescription>
                    곡에 어울리는 장르를 선택해주세요 (다중 선택 가능)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={
                          selectedGenres.includes(genre) ? "default" : "outline"
                        }
                        className="cursor-pointer transition-all duration-300 hover:scale-105"
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-primary/20">
                <CardHeader>
                  <CardTitle>분위기 선택</CardTitle>
                  <CardDescription>
                    원하는 가사의 분위기를 선택해주세요 (다중 선택 가능)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                      <Badge
                        key={mood}
                        variant={
                          selectedMoods.includes(mood) ? "default" : "outline"
                        }
                        className="cursor-pointer transition-all duration-300 hover:scale-105"
                        onClick={() => toggleMood(mood)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-primary/20">
                <CardHeader>
                  <CardTitle>키워드 (선택사항)</CardTitle>
                  <CardDescription>
                    가사에 포함하고 싶은 키워드나 주제를 입력해주세요
                  </CardDescription>
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
                <span className="relative z-10 flex items-center">
                  가사 제작 시작하기
                  <ArrowRight className="h-5 w-5 ml-2" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
