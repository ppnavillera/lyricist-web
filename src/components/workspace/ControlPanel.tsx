'use client';

import { Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';
import MidiPlayer from '@/components/midi/MidiPlayer';

export default function ControlPanel() {
  const { currentProject } = useProjectStore();

  if (!currentProject) return null;

  const currentStructure = currentProject.midiAnalysis.structure[currentProject.currentStructureIndex];

  return (
    <div className="h-full bg-card flex flex-col">
      {/* MIDI Player */}
      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium">MIDI 플레이어</h3>
            <p className="text-xs text-muted-foreground">
              {currentStructure?.name} 구간 재생
            </p>
          </div>
          <MidiPlayer
            midiUrl={currentProject.midiFileUrl}
            startTime={currentStructure?.startTime}
            endTime={currentStructure?.endTime}
          />
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4 border-b border-border">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">프로젝트 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">파일명</span>
                <p className="text-sm font-medium truncate">{currentProject.midiAnalysis.fileName}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">장르</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProject.theme.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">분위기</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProject.theme.moods.map((mood, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {mood}
                    </Badge>
                  ))}
                </div>
              </div>
              {currentProject.theme.keywords.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">키워드</span>
                  <p className="text-sm">{currentProject.theme.keywords.join(', ')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <div className="p-4 flex-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              작성 팁
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="space-y-2">
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                💡 음절 수가 맞지 않나요? 긴 단어를 짧게 줄이거나 조사를 조정해보세요.
              </div>
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                🎵 멜로디의 높낮이를 고려해서 모음이 많은 단어를 배치해보세요.
              </div>
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                ✨ AI가 생성한 가사가 마음에 들지 않으면 키워드를 추가해서 다시 요청해보세요.
              </div>
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                📝 직접 수정할 때는 운율과 의미를 모두 고려해주세요.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}