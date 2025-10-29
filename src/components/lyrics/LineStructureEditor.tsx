'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LineStructure } from '@/types';
import { cn } from '@/lib/utils';

interface LineStructureEditorProps {
  totalSyllables: number;
  initialLineStructure?: LineStructure[];
  onUpdate: (lineStructure: LineStructure[]) => void;
}

const PRESETS = [
  { name: '균등 4줄', lines: [8, 8, 8, 8] },
  { name: '균등 6줄', lines: [5, 5, 5, 5, 6, 6] },
  { name: '일반형', lines: [10, 6, 12, 4] },
  { name: '발라드형', lines: [12, 8, 10, 6] },
];

export default function LineStructureEditor({ totalSyllables, initialLineStructure, onUpdate }: LineStructureEditorProps) {
  const [lines, setLines] = useState<LineStructure[]>(() => {
    if (initialLineStructure && initialLineStructure.length > 0) {
      return initialLineStructure;
    }
    // Default: 1 line with all syllables
    return [{
      syllables: totalSyllables,
      description: `1번째 줄`,
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

  const updateLineDescription = (index: number, description: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], description };
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
      syllables: 1,
      description: `${lines.length + 1}번째 줄`
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
        syllables: Math.max(1, syllables),
        description: `${i + 1}번째 줄`,
      })));
    } else {
      setLines(preset.lines.map((syllables, i) => ({
        syllables,
        description: `${i + 1}번째 줄`,
      })));
    }
  };

  const resetToEqual = () => {
    const syllablesPerLine = Math.floor(totalSyllables / lines.length);
    const remainder = totalSyllables % lines.length;
    
    setLines(lines.map((_, i) => ({
      syllables: syllablesPerLine + (i < remainder ? 1 : 0),
      description: `${i + 1}번째 줄`,
    })));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>줄별 음절 수 설정</CardTitle>
        <CardDescription>
          분석된 기본 음절 수({totalSyllables}음절)를 참고하여 줄별로 나누어 설정하세요. 당김음이나 작곡 의도에 따라 총 음절 수는 달라질 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">현재 총 음절:</span>
            <Badge variant="default" className="text-sm">
              {currentTotal}
            </Badge>
            <span className="text-sm text-muted-foreground">
              (기본: {totalSyllables}음절)
            </span>
          </div>
          {difference !== 0 && (
            <span className={cn(
              "text-sm",
              Math.abs(difference) <= 3 ? "text-blue-600" : "text-orange-600"
            )}>
              {difference > 0 ? `+${difference}` : `${difference}`}음절
            </span>
          )}
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-sm font-medium">빠른 설정</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                {preset.name} ({preset.lines.join('-')})
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToEqual}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              균등분배
            </Button>
          </div>
        </div>

        {/* Line Editors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">줄별 설정</span>
            <Button
              variant="outline"
              size="sm"
              onClick={addLine}
              disabled={lines.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              줄 추가
            </Button>
          </div>
          
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                
                <div className="flex-1">
                  <Input
                    placeholder={`${index + 1}번째 줄 설명`}
                    value={line.description || ''}
                    onChange={(e) => updateLineDescription(index, e.target.value)}
                    className="text-sm"
                  />
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
          <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💡 줄별 음절 설정 팁</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 기본 음절 수는 참고용이며, 작곡 의도에 따라 자유롭게 조정하세요</li>
            <li>• 당김음이 있다면 해당 음절을 앞/뒤 줄로 이동시킬 수 있습니다</li>
            <li>• 빠른 멜로디 부분은 음절을 많이, 느린 부분은 적게</li>
            <li>• 감정적 표현이 중요한 부분은 여유있게 설정하세요</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}