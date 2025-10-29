'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Edit3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SongStructure, LyricsProject } from '@/types';
import { countSyllables } from '@/lib/utils';
import { generateLyrics } from '@/lib/api';

interface SimpleLyricsEditorProps {
  structure: SongStructure;
  project: LyricsProject;
  onComplete: (lyrics: string) => void;
  onBackToSyllable?: () => void;
  isLastStructure: boolean;
}

export default function SimpleLyricsEditor({
  structure,
  project,
  onComplete,
  onBackToSyllable,
  isLastStructure
}: SimpleLyricsEditorProps) {
  const [linesText, setLinesText] = useState<string[]>(() => {
    if (structure.lyrics) {
      return structure.lyrics.split('\n');
    }
    return Array(structure.lineStructure?.length || 4).fill('');
  });
  
  const [generatingLineIndex, setGeneratingLineIndex] = useState<number | null>(null);

  const targetSyllableCount = structure.adjustedSyllableCount || structure.syllableCount;

  const updateLineText = (lineIndex: number, text: string) => {
    const newLinesText = [...linesText];
    newLinesText[lineIndex] = text;
    setLinesText(newLinesText);
  };

  const generateLineText = async (lineIndex: number) => {
    if (!structure.lineStructure || lineIndex >= structure.lineStructure.length) {
      return;
    }

    setGeneratingLineIndex(lineIndex);

    try {
      const line = structure.lineStructure[lineIndex];
      const targetSyllables = line.syllables;
      const previousLines = linesText.slice(0, lineIndex).filter(text => text.trim());

      // Call Gemini API
      const generatedText = await generateLyrics(targetSyllables, {
        previousLines,
        theme: project.theme,
        description: line.description,
      });

      updateLineText(lineIndex, generatedText);

    } catch (error) {
      console.error('Generation error:', error);
      alert('가사 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setGeneratingLineIndex(null);
    }
  };


  const handleComplete = () => {
    const completeLyrics = linesText.filter(line => line.trim()).join('\n');
    if (completeLyrics.trim()) {
      onComplete(completeLyrics.trim());
    }
  };

  const totalCurrentSyllables = linesText
    .filter(line => line.trim())
    .reduce((sum, line) => sum + countSyllables(line), 0);

  const syllableDifference = totalCurrentSyllables - targetSyllableCount;
  const isWithinRange = Math.abs(syllableDifference) <= 2;

  const canComplete = linesText.some(line => line.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          가사 제작
        </CardTitle>
        <CardDescription>
          각 줄별로 AI가 가사를 생성하거나 직접 입력하여 수정해주세요.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Theme & Target Info */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">목표 음절 수:</span>
              <p className="font-medium">{targetSyllableCount} 음절</p>
            </div>
            <div>
              <span className="text-muted-foreground">파트:</span>
              <p className="font-medium">{structure.name}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">설정된 테마:</span>
            <div className="flex flex-wrap gap-2">
              {project.theme.genres.map((genre, index) => (
                <Badge key={index} variant="secondary">{genre}</Badge>
              ))}
              {project.theme.moods.map((mood, index) => (
                <Badge key={index} variant="outline">{mood}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Syllable Counter */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">현재 음절 수:</span>
              <Badge 
                variant={isWithinRange ? "default" : "destructive"}
                className="text-sm"
              >
                {totalCurrentSyllables}
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
        </div>

        {/* Line-by-line Editor */}
        {structure.lineStructure && structure.lineStructure.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">줄별 가사 제작</h4>
            
            {structure.lineStructure.map((line, lineIndex) => {
              const currentLineSyllables = countSyllables(linesText[lineIndex] || '');
              const targetLineSyllables = line.syllables;
              const lineDifference = currentLineSyllables - targetLineSyllables;
              const isLineGood = Math.abs(lineDifference) <= 1;

              return (
                <Card key={lineIndex} className="border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        {lineIndex + 1}줄: {line.description || `${lineIndex + 1}번째 줄`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isLineGood ? "outline" : "secondary"}
                          className="text-xs"
                        >
                          {currentLineSyllables}/{targetLineSyllables}음절
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateLineText(lineIndex)}
                          disabled={generatingLineIndex === lineIndex}
                        >
                          {generatingLineIndex === lineIndex ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              생성중
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI 생성
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Input
                      placeholder={`${lineIndex + 1}번째 줄 가사를 입력하세요...`}
                      value={linesText[lineIndex] || ''}
                      onChange={(e) => updateLineText(lineIndex, e.target.value)}
                      className="font-medium"
                    />
                    
                    {/* Previous lines context */}
                    {lineIndex > 0 && linesText.slice(0, lineIndex).some(text => text.trim()) && (
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded mt-2">
                        <span className="font-medium">이전 줄들:</span>
                        <div className="mt-1 space-y-0.5">
                          {linesText.slice(0, lineIndex)
                            .filter(text => text.trim())
                            .map((text, index) => (
                              <div key={index} className="truncate">
                                {index + 1}. {text}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onBackToSyllable && (
            <Button
              variant="outline"
              onClick={onBackToSyllable}
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              줄 수 다시 설정
            </Button>
          )}
          <Button
            onClick={handleComplete}
            disabled={!canComplete}
            size="lg"
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {isLastStructure ? '프로젝트 완료하기' : '다음 파트로 이동'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}