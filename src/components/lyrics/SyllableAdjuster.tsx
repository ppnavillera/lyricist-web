'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SongStructure, LineStructure } from '@/types';
import LineStructureEditor from './LineStructureEditor';

interface SyllableAdjusterProps {
  structure: SongStructure;
  onComplete: (syllableCount: number, lineStructure: LineStructure[]) => void;
}

export default function SyllableAdjuster({ structure, onComplete }: SyllableAdjusterProps) {
  const [adjustedCount, setAdjustedCount] = useState(
    structure.adjustedSyllableCount || structure.syllableCount
  );
  const [lineStructure, setLineStructure] = useState<LineStructure[]>(
    structure.lineStructure || []
  );

  const handleLineStructureUpdate = (newLineStructure: LineStructure[]) => {
    setLineStructure(newLineStructure);
    const total = newLineStructure.reduce((sum, line) => sum + line.syllables, 0);
    setAdjustedCount(total);
  };

  const handleComplete = () => {
    onComplete(adjustedCount, lineStructure);
  };

  const canComplete = lineStructure.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>줄별 음절 수 설정</CardTitle>
          <CardDescription>
            AI가 분석한 기본 음절 수를 줄별로 나누어 설정하세요. 각 줄의 음절 수에 맞춰 더 정확한 가사를 생성할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">분석된 기본 음절 수</span>
            <span className="text-lg font-bold text-primary">{structure.syllableCount} 음절</span>
          </div>
        </CardContent>
      </Card>

      {/* Line Structure Editor */}
      <LineStructureEditor
        totalSyllables={adjustedCount}
        initialLineStructure={structure.lineStructure}
        onUpdate={handleLineStructureUpdate}
      />

      {/* Complete Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleComplete} 
          disabled={!canComplete}
          size="lg"
          className="min-w-[200px]"
        >
          완료 - 가사 제작으로 이동
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}