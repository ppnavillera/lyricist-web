'use client';

import { Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';
import MidiPlayer from '@/components/midi/MidiPlayer';
import { useTranslations } from 'next-intl';

export default function ControlPanel() {
  const { currentProject } = useProjectStore();
  const t = useTranslations('workspace');
  const tTheme = useTranslations('theme');

  if (!currentProject) return null;

  const currentStructure = currentProject.midiAnalysis.structure[currentProject.currentStructureIndex];

  // Helper function to translate genre/mood values
  const translateValue = (value: string, type: 'genres' | 'moods'): string => {
    try {
      return tTheme(`${type}.${value}`);
    } catch {
      return value;
    }
  };

  return (
    <div className="h-full bg-card flex flex-col">
      {/* MIDI Player */}
      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium">{t('midiPlayer')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('sectionPlayback', { name: currentStructure?.name })}
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
            <CardTitle className="text-sm">{t('projectInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">{t('fileName')}</span>
                <p className="text-sm font-medium truncate">{currentProject.midiAnalysis.fileName}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('genre')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProject.theme.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {translateValue(genre, 'genres')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('mood')}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProject.theme.moods.map((mood, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {translateValue(mood, 'moods')}
                    </Badge>
                  ))}
                </div>
              </div>
              {currentProject.theme.keywords.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">{t('keywords')}</span>
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
              {t('writingTips')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="space-y-2">
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                💡 {t('tip1')}
              </div>
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                🎵 {t('tip2')}
              </div>
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                ✨ {t('tip3')}
              </div>
              <div className="p-2 bg-muted/50 rounded text-muted-foreground">
                📝 {t('tip4')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}