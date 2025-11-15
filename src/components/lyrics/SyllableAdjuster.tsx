'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SongStructure, LineStructure } from '@/types';
import LineStructureEditor from './LineStructureEditor';
import { useTranslations } from 'next-intl';

interface SyllableAdjusterProps {
  structure: SongStructure;
  onComplete: (syllableCount: number, lineStructure: LineStructure[]) => void;
}

export default function SyllableAdjuster({ structure, onComplete }: SyllableAdjusterProps) {
  const t = useTranslations('lyricsEditor');
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
          <CardTitle>{t('syllableAdjustment')}</CardTitle>
          <CardDescription>
            {t('syllableAdjustmentDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">{t('analyzedSyllables')}</span>
            <span className="text-lg font-bold text-primary">{structure.syllableCount} {t('syllables')}</span>
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
          {t('completeAndProceed')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}