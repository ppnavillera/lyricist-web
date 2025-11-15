'use client';

import { useState, useEffect } from 'react';
import { Edit3, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SongStructure } from '@/types';
import { countSyllables } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface LyricsTextEditorProps {
  structure: SongStructure;
  onComplete: (lyrics: string) => void;
  isLastStructure: boolean;
}

export default function LyricsTextEditor({ structure, onComplete, isLastStructure }: LyricsTextEditorProps) {
  const t = useTranslations('lyricsEditor');
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
          {t('lyricsEdit')}
        </CardTitle>
        <CardDescription>
          {t('lyricsEditDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Syllable Counter */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('currentSyllableCount')}</span>
              <Badge
                variant={isWithinRange ? "default" : "destructive"}
                className="text-sm"
              >
                {currentSyllableCount}
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

          {!isWithinRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              {t('adjustmentNeeded')}
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
              <span className="text-sm font-medium">{t('lineAnalysis')}</span>
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
                        {lineInfo.syllables}{t('syllables')}
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
          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">✨ {t('editTips')}</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• {t('editTip1')}</li>
            <li>• {t('editTip2')}</li>
            <li>• {t('editTip3')}</li>
            <li>• {t('editTip4')}</li>
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
          {isLastStructure ? t('completeProject') : t('moveToNextPart')}
        </Button>
      </CardContent>
    </Card>
  );
}