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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('lyricsEditor');
  const tWorkspace = useTranslations('workspace');
  const tTheme = useTranslations('theme');
  const [linesText, setLinesText] = useState<string[]>(() => {
    if (structure.lyrics) {
      return structure.lyrics.split('\n');
    }
    return Array(structure.lineStructure?.length || 4).fill('');
  });

  // Helper function to translate genre/mood values
  const translateValue = (value: string, type: 'genres' | 'moods'): string => {
    try {
      return tTheme(`${type}.${value}`);
    } catch {
      return value;
    }
  };

  const [generatingLineIndex, setGeneratingLineIndex] = useState<number | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

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
      alert(t('generationError'));
    } finally {
      setGeneratingLineIndex(null);
    }
  };

  // 전체 가사를 순차적으로 자동 생성
  const generateAllLines = async () => {
    if (!structure.lineStructure || structure.lineStructure.length === 0) {
      return;
    }

    setIsGeneratingAll(true);

    try {
      const totalLines = structure.lineStructure.length;
      const newLinesText = [...linesText];

      for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
        // 현재 줄 생성 중 표시
        setGeneratingLineIndex(lineIndex);

        const line = structure.lineStructure[lineIndex];
        const targetSyllables = line.syllables;
        const previousLines = newLinesText.slice(0, lineIndex).filter(text => text.trim());

        // AI 생성 (실제 Gemini API 호출)
        const generatedText = await generateLyrics(targetSyllables, {
          previousLines,
          theme: project.theme,
          description: line.description,
        });

        // 생성된 가사를 배열에 추가
        newLinesText[lineIndex] = generatedText;
        setLinesText([...newLinesText]);

        // 잠시 대기 (사용자가 진행 상황을 볼 수 있도록)
        await new Promise(resolve => setTimeout(resolve, 300));
      }

    } catch (error) {
      console.error(t('fullGenerationError'), error);
      alert(t('generationError'));
    } finally {
      setGeneratingLineIndex(null);
      setIsGeneratingAll(false);
    }
  };

  // 전체 생성 취소
  const cancelGenerateAll = () => {
    setIsGeneratingAll(false);
    setGeneratingLineIndex(null);
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
          {t('lyricsCreation')}
        </CardTitle>
        <CardDescription>
          {t('lyricsCreationDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme & Target Info */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t('targetSyllableCount')}:</span>
              <p className="font-medium">{targetSyllableCount} {tWorkspace('syllables')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('part')}:</span>
              <p className="font-medium">{structure.name}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">{t('configuredTheme')}:</span>
            <div className="flex flex-wrap gap-2">
              {project.theme.genres.map((genre, index) => (
                <Badge key={index} variant="secondary">{translateValue(genre, 'genres')}</Badge>
              ))}
              {project.theme.moods.map((mood, index) => (
                <Badge key={index} variant="outline">{translateValue(mood, 'moods')}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Syllable Counter */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('currentSyllableCount')}</span>
              <Badge
                variant={isWithinRange ? "default" : "destructive"}
                className="text-sm"
              >
                {totalCurrentSyllables}
              </Badge>
              <span className="text-sm text-muted-foreground">
                / {targetSyllableCount} ({t('target')})
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {syllableDifference > 0 ? (
                <span className="text-orange-500">
                  {t('syllablesOver', { count: syllableDifference })}
                </span>
              ) : syllableDifference < 0 ? (
                <span className="text-blue-500">
                  {t('syllablesUnder', { count: Math.abs(syllableDifference) })}
                </span>
              ) : (
                <span className="text-green-500">
                  {t('exactMatch')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Line-by-line Editor */}
        {structure.lineStructure && structure.lineStructure.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t('lineCreation')}</h4>
              {isGeneratingAll ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={cancelGenerateAll}
                >
                  {t('cancelGeneration')}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  onClick={generateAllLines}
                  disabled={isGeneratingAll}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('autoGenerateAll')}
                </Button>
              )}
            </div>

            {/* 진행 상태 표시 */}
            {isGeneratingAll && generatingLineIndex !== null && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t('generatingProgress', { current: generatingLineIndex + 1, total: structure.lineStructure!.length })}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${((generatingLineIndex + 1) / structure.lineStructure!.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        {t('lineNumber', { number: lineIndex + 1 })}: {line.description || t('lineDescriptionDefault', { number: lineIndex + 1 })}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isLineGood ? "outline" : "secondary"}
                          className="text-xs"
                        >
                          {currentLineSyllables}/{targetLineSyllables}{tWorkspace('syllables')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateLineText(lineIndex)}
                          disabled={generatingLineIndex === lineIndex || isGeneratingAll}
                        >
                          {generatingLineIndex === lineIndex ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {t('generating')}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              {t('aiGenerateButton')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Input
                      placeholder={t('linePlaceholder', { number: lineIndex + 1 })}
                      value={linesText[lineIndex] || ''}
                      onChange={(e) => updateLineText(lineIndex, e.target.value)}
                      className="font-medium"
                    />

                    {/* Previous lines context */}
                    {lineIndex > 0 && linesText.slice(0, lineIndex).some(text => text.trim()) && (
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded mt-2">
                        <span className="font-medium">{t('previousLines')}</span>
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
              {t('resetLineCount')}
            </Button>
          )}
          <Button
            onClick={handleComplete}
            disabled={!canComplete}
            size="lg"
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {isLastStructure ? t('completeProject') : t('moveToNextPart')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}