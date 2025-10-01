'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SongStructure, LyricsProject } from '@/types';
import { countSyllables } from '@/lib/utils';

interface SimpleLyricsEditorProps {
  structure: SongStructure;
  project: LyricsProject;
  onComplete: (lyrics: string) => void;
  isLastStructure: boolean;
}

export default function SimpleLyricsEditor({ 
  structure, 
  project, 
  onComplete, 
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const line = structure.lineStructure[lineIndex];
      const targetSyllables = line.syllables;
      const previousLines = linesText.slice(0, lineIndex).filter(text => text.trim());
      
      const generatedText = generateSingleLine(lineIndex, targetSyllables, previousLines);
      updateLineText(lineIndex, generatedText);
      
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGeneratingLineIndex(null);
    }
  };

  const generateSingleLine = (lineIndex: number, targetSyllables: number, previousLines: string[]) => {
    const baseTemplates = [
      ['햇살이 비치는 창가에서', '너의 목소리가 들려와', '따뜻한 마음으로 안아줘'],
      ['시간이 흘러도 변하지 않는', '우리의 약속을 기억해', '어둠이 와도 두렵지 않아'],
      ['바람에 흩날리는 꽃잎처럼', '가벼운 마음으로 떠나가', '새로운 시작을 향해서'],
      ['하늘을 바라보며 걸어가', '꿈을 향해 달려가며', '희망찬 미래를 그려봐']
    ];
    
    let templates = baseTemplates[lineIndex % baseTemplates.length];
    
    if (previousLines.length > 0) {
      const lastLine = previousLines[previousLines.length - 1];
      
      if (lastLine.includes('햇살') || lastLine.includes('밝')) {
        templates = ['따뜻한 빛이 감싸주네', '환한 웃음이 번져가', '행복이 가득 차올라'];
      } else if (lastLine.includes('시간') || lastLine.includes('흘러')) {
        templates = ['지나간 날들을 생각해', '추억이 스며들어와', '영원히 기억할 순간'];
      } else if (lastLine.includes('바람') || lastLine.includes('흩날')) {
        templates = ['자유롭게 날아오르며', '구름처럼 떠다니며', '하늘 높이 올라가'];
      }
    }
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const currentLength = template.replace(/\s/g, '').length;
    
    if (currentLength === targetSyllables) {
      return template;
    } else if (currentLength > targetSyllables) {
      return template.substring(0, targetSyllables);
    } else {
      const diff = targetSyllables - currentLength;
      const naturalEndings = ['요', '네요', '어요', '죠', '해요'];
      
      if (diff <= 3) {
        return template + (naturalEndings[diff - 1] || '');
      } else {
        return '정말 ' + template;
      }
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

        {/* Complete Button */}
        <Button 
          onClick={handleComplete}
          disabled={!canComplete}
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