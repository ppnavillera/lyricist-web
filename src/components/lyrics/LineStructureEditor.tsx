'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LineStructure } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface LineStructureEditorProps {
  totalSyllables: number;
  initialLineStructure?: LineStructure[];
  onUpdate: (lineStructure: LineStructure[]) => void;
}

const PRESETS = [
  { nameKey: 'presetEven4', lines: [8, 8, 8, 8] },
  { nameKey: 'presetEven6', lines: [5, 5, 5, 5, 6, 6] },
  { nameKey: 'presetStandard', lines: [10, 6, 12, 4] },
  { nameKey: 'presetBallad', lines: [12, 8, 10, 6] },
];

export default function LineStructureEditor({ totalSyllables, initialLineStructure, onUpdate }: LineStructureEditorProps) {
  const t = useTranslations('lyricsEditor');
  const [lines, setLines] = useState<LineStructure[]>(() => {
    if (initialLineStructure && initialLineStructure.length > 0) {
      return initialLineStructure;
    }
    // Default: 1 line with all syllables
    return [{
      syllables: totalSyllables,
    }];
  });

  const currentTotal = lines.reduce((sum, line) => sum + line.syllables, 0);
  const difference = currentTotal - totalSyllables;

  useEffect(() => {
    // Always update, don't force exact match
    onUpdate(lines);
  }, [lines, onUpdate]);

  const updateLineSyllables = (index: number, syllables: number) => {
    if (syllables < 1 || syllables > 50) return;
    
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], syllables };
    setLines(newLines);
  };


  const addLine = () => {
    if (lines.length >= 10) return;

    // Take 1 syllable from the last line
    const newLines = [...lines];
    if (newLines[newLines.length - 1].syllables > 1) {
      newLines[newLines.length - 1] = {
        ...newLines[newLines.length - 1],
        syllables: newLines[newLines.length - 1].syllables - 1
      };
    }

    newLines.push({
      syllables: 1
    });

    setLines(newLines);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const applyPreset = (preset: { name: string; lines: number[] }) => {
    if (preset.lines.reduce((sum, s) => sum + s, 0) !== totalSyllables) {
      // Adjust preset to match total syllables
      const scale = totalSyllables / preset.lines.reduce((sum, s) => sum + s, 0);
      const adjustedLines = preset.lines.map(s => Math.round(s * scale));
      
      // Fine-tune to exact total
      const currentSum = adjustedLines.reduce((sum, s) => sum + s, 0);
      const diff = totalSyllables - currentSum;
      if (diff !== 0) {
        adjustedLines[0] += diff;
      }
      
      setLines(adjustedLines.map((syllables, i) => ({
        syllables: Math.max(1, syllables)
      })));
    } else {
      setLines(preset.lines.map((syllables, i) => ({
        syllables
      })));
    }
  };

  const resetToEqual = () => {
    const syllablesPerLine = Math.floor(totalSyllables / lines.length);
    const remainder = totalSyllables % lines.length;

    setLines(lines.map((_, i) => ({
      syllables: syllablesPerLine + (i < remainder ? 1 : 0)
    })));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('lineStructureSettings')}</CardTitle>
        <CardDescription>
          {t('lineStructureDescription', { count: totalSyllables })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t('currentTotal')}</span>
            <Badge variant="default" className="text-sm">
              {currentTotal}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ({t('default')}: {totalSyllables} {t('syllables')})
            </span>
          </div>
          {difference !== 0 && (
            <span className={cn(
              "text-sm",
              Math.abs(difference) <= 3 ? "text-blue-600" : "text-orange-600"
            )}>
              {difference > 0 ? `+${difference}` : `${difference}`} {t('syllables')}
            </span>
          )}
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-sm font-medium">{t('quickSettings')}</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                {t(preset.nameKey)} ({preset.lines.join('-')})
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToEqual}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t('evenDistribution')}
            </Button>
          </div>
        </div>

        {/* Line Editors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('lineSettings')}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={addLine}
              disabled={lines.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('addLine')}
            </Button>
          </div>
          
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                  {index + 1}
                </div>

                <div className="flex-1 text-sm text-muted-foreground">
                  {t('lineNumber', { number: index + 1 })}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateLineSyllables(index, line.syllables - 1)}
                    disabled={line.syllables <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <div className="w-16 text-center">
                    <span className="text-sm font-medium">{line.syllables}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateLineSyllables(index, line.syllables + 1)}
                    disabled={line.syllables >= 50}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeLine(index)}
                  disabled={lines.length <= 1}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💡 {t('lineStructureTips')}</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• {t('tip1')}</li>
            <li>• {t('tip2')}</li>
            <li>• {t('tip3')}</li>
            <li>• {t('tip4')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}