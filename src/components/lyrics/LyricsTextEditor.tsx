'use client';

import { useState, useEffect } from 'react';
import { Edit3, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SongStructure } from '@/types';
import { countSyllables } from '@/lib/utils';

interface LyricsTextEditorProps {
  structure: SongStructure;
  onComplete: (lyrics: string) => void;
  isLastStructure: boolean;
}

export default function LyricsTextEditor({ structure, onComplete, isLastStructure }: LyricsTextEditorProps) {
  const [lyrics, setLyrics] = useState(structure.lyrics || '');
  const [currentSyllableCount, setCurrentSyllableCount] = useState(0);

  const targetSyllableCount = structure.adjustedSyllableCount || structure.syllableCount;

  useEffect(() => {
    setCurrentSyllableCount(countSyllables(lyrics));
  }, [lyrics]);

  const handleComplete = () => {
    if (lyrics.trim()) {
      onComplete(lyrics.trim());
    }
  };

  const syllableDifference = currentSyllableCount - targetSyllableCount;
  const isWithinRange = Math.abs(syllableDifference) <= 2; // Allow ±2 syllables tolerance

  const getLineInfo = (line: string) => {
    const lineSyllables = countSyllables(line);
    const averageSyllablesPerLine = Math.round(targetSyllableCount / 4); // Assuming ~4 lines
    const isGoodLength = Math.abs(lineSyllables - averageSyllablesPerLine) <= 3;
    
    return {
      syllables: lineSyllables,
      isGoodLength,
    };
  };

  const lines = lyrics.split('\n').filter(line => line.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          가사 편집
        </CardTitle>
        <CardDescription>
          생성된 가사를 확인하고 필요에 따라 수정해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Syllable Counter */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">현재 음절 수:</span>
              <Badge 
                variant={isWithinRange ? "default" : "destructive"}
                className="text-sm"
              >
                {currentSyllableCount}
              </Badge>
              <span className="text-sm text-muted-foreground">
                / {targetSyllableCount} (목표)
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {syllableDifference > 0 ? (
                <span className="text-orange-500">
                  {syllableDifference}음절 초과
                </span>
              ) : syllableDifference < 0 ? (
                <span className="text-blue-500">
                  {Math.abs(syllableDifference)}음절 부족
                </span>
              ) : (
                <span className="text-green-500">
                  정확히 맞음
                </span>
              )}
            </div>
          </div>
          
          {!isWithinRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              음절 수 조정 필요
            </div>
          )}
        </div>

        {/* Text Editor */}
        <div className="space-y-3">
          <Textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="여기에 가사를 입력하거나 수정하세요..."
            className="min-h-[200px] font-mono leading-relaxed"
            rows={8}
          />
          
          {/* Line by line analysis */}
          {lines.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">라인별 음절 분석</span>
              <div className="space-y-1">
                {lines.map((line, index) => {
                  const lineInfo = getLineInfo(line);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/25 rounded text-sm">
                      <span className="flex-1 truncate">{line}</span>
                      <Badge 
                        variant={lineInfo.isGoodLength ? "outline" : "secondary"}
                        className="text-xs ml-2"
                      >
                        {lineInfo.syllables}음절
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">✨ 편집 팁</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 긴 단어 → 짧은 단어로 바꿔보세요 (예: &quot;아름다운&quot; → &quot;예쁜&quot;)</li>
            <li>• 조사 조정: &quot;을/를&quot;, &quot;이/가&quot;, &quot;에서/서&quot; 등으로 음절 수 조절</li>
            <li>• 반복어나 감탄사 활용: &quot;oh&quot;, &quot;yeah&quot;, &quot;라라라&quot; 등</li>
            <li>• 라인 끝의 운율을 맞춰 자연스러운 흐름 만들기</li>
          </ul>
        </div>

        {/* Complete Button */}
        <Button 
          onClick={handleComplete}
          disabled={!lyrics.trim()}
          size="lg"
          className="w-full"
        >
          <Check className="h-4 w-4 mr-2" />
          {isLastStructure ? '프로젝트 완료하기' : '다음 파트로 이동'}
        </Button>
      </CardContent>
    </Card>
  );
}