'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Copy, FileText, Music, Home, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';
import { downloadAsFile, copyToClipboard, formatDate, exportToPDF } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export default function CompletePage() {
  const locale = useLocale();
  const t = useTranslations('complete');
  const tPdf = useTranslations('pdf');
  const tTheme = useTranslations('theme');
  const tWorkspace = useTranslations('workspace');
  const params = useParams();
  const router = useRouter();
  const { currentProject, resetProject } = useProjectStore();
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper function to translate genre/mood values
  const translateValue = (value: string, type: 'genres' | 'moods'): string => {
    try {
      return tTheme(`${type}.${value}`);
    } catch {
      return value;
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{tWorkspace('noProject')}</h2>
          <Button onClick={() => router.push('/')}>{tWorkspace('goHome')}</Button>
        </div>
      </div>
    );
  }

  const completedStructures = currentProject.midiAnalysis.structure.filter(s => s.isCompleted && s.lyrics);
  const totalSyllables = completedStructures.reduce((sum, s) => sum + (s.adjustedSyllableCount || s.syllableCount), 0);

  const generateFullLyrics = () => {
    return completedStructures
      .map(structure => `[${structure.name}]\n${structure.lyrics}\n`)
      .join('\n');
  };

  const generateDetailedExport = () => {
    const lyrics = generateFullLyrics();
    const translatedGenres = currentProject.theme.genres.map(g => translateValue(g, 'genres'));
    const translatedMoods = currentProject.theme.moods.map(m => translateValue(m, 'moods'));

    const info = `${t('projectName')}: ${currentProject.name}
${t('midiFile')}: ${currentProject.midiAnalysis.fileName}
${t('createdAt')}: ${formatDate(currentProject.midiAnalysis.createdAt, locale)}
${t('completedAt')}: ${currentProject.completedAt ? formatDate(currentProject.completedAt, locale) : t('justNow')}

${t('genre')}: ${translatedGenres.join(', ')}
${t('mood')}: ${translatedMoods.join(', ')}
${currentProject.theme.keywords.length > 0 ? `${t('keywords')}: ${currentProject.theme.keywords.join(', ')}` : ''}

${t('totalSyllables')}: ${totalSyllables}
${t('completedSections')}: ${completedStructures.length}

=== ${t('completedLyrics')} ===

${lyrics}

${tPdf('footer')}`;

    return info;
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(generateFullLyrics());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownloadTxt = () => {
    const content = generateDetailedExport();
    downloadAsFile(content, `${currentProject.name}_lyrics.txt`, 'text/plain');
  };

  const handleDownloadPdf = async () => {
    const translatedGenres = currentProject.theme.genres.map(g => translateValue(g, 'genres'));
    const translatedMoods = currentProject.theme.moods.map(m => translateValue(m, 'moods'));

    await exportToPDF({
      projectName: currentProject.name,
      fileName: currentProject.midiAnalysis.fileName,
      createdAt: formatDate(currentProject.midiAnalysis.createdAt, locale),
      completedAt: currentProject.completedAt ? formatDate(currentProject.completedAt, locale) : undefined,
      genres: translatedGenres,
      moods: translatedMoods,
      keywords: currentProject.theme.keywords,
      totalSyllables,
      structures: completedStructures.map(s => ({
        name: s.name,
        lyrics: s.lyrics || '',
        syllableCount: s.adjustedSyllableCount || s.syllableCount,
      })),
    }, `${currentProject.name}_lyrics.pdf`, {
      title: tPdf('title'),
      project: tPdf('project'),
      file: tPdf('file'),
      createdAt: tPdf('createdAt'),
      completedAt: tPdf('completedAt'),
      inProgress: tPdf('inProgress'),
      genre: tPdf('genre'),
      mood: tPdf('mood'),
      keywords: tPdf('keywords'),
      totalSyllables: tPdf('totalSyllables'),
      sectionsCount: tPdf('sectionsCount', { count: completedStructures.length }),
      lyricsHeader: tPdf('lyricsHeader'),
      syllables: tPdf('syllables'),
      footer: tPdf('footer'),
    });
  };

  const handleNewProject = () => {
    resetProject();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎉 {t('congratulations')}</h1>
              <p className="text-muted-foreground">
                {t('projectCompleted', { projectName: currentProject.name })}
              </p>
            </div>
            <Button variant="outline" onClick={handleNewProject}>
              <Home className="h-4 w-4 mr-2" />
              {t('newProject')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Final Lyrics */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  {t('completedLyrics')}
                </CardTitle>
                <CardDescription>
                  {t('allPartsCompleted')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {completedStructures.map((structure, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{structure.name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {structure.adjustedSyllableCount || structure.syllableCount} {tWorkspace('syllables')}
                        </span>
                      </div>
                      <div className="p-4 bg-muted/20 rounded-lg whitespace-pre-line text-sm leading-relaxed">
                        {structure.lyrics}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t('export')}
                </CardTitle>
                <CardDescription>
                  {t('exportDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button onClick={handleCopy} variant="outline" className="h-auto p-4">
                    <div className="flex flex-col items-center gap-2">
                      <Copy className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{t('copyLyrics')}</div>
                        <div className="text-xs text-muted-foreground">
                          {copySuccess ? t('copied') : t('copyLyricsOnly')}
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button onClick={handleDownloadTxt} variant="outline" className="h-auto p-4">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{t('downloadTxt')}</div>
                        <div className="text-xs text-muted-foreground">{t('downloadTxtDescription')}</div>
                      </div>
                    </div>
                  </Button>

                  <Button onClick={handleDownloadPdf} variant="outline" className="h-auto p-4">
                    <div className="flex flex-col items-center gap-2">
                      <FileType className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{t('downloadPdf')}</div>
                        <div className="text-xs text-muted-foreground">{t('downloadPdfDescription')}</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Project Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('projectInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">{t('projectName')}</span>
                    <p className="font-medium">{currentProject.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t('midiFile')}</span>
                    <p className="font-medium">{currentProject.midiAnalysis.fileName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t('completedAt')}</span>
                    <p className="font-medium">
                      {currentProject.completedAt ? formatDate(currentProject.completedAt, locale) : t('justNow')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">{t('genre')}</span>
                  <div className="flex flex-wrap gap-1">
                    {currentProject.theme.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {translateValue(genre, 'genres')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">{t('mood')}</span>
                  <div className="flex flex-wrap gap-1">
                    {currentProject.theme.moods.map((mood, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {translateValue(mood, 'moods')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {currentProject.theme.keywords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">{t('keywords')}</span>
                    <p className="text-sm">{currentProject.theme.keywords.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('statistics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{completedStructures.length}</div>
                    <div className="text-xs text-muted-foreground">{t('completedSections')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalSyllables}</div>
                    <div className="text-xs text-muted-foreground">{t('totalSyllables')}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {Math.floor(currentProject.midiAnalysis.duration / 60)}{tWorkspace('minutes')} {currentProject.midiAnalysis.duration % 60}{tWorkspace('seconds')}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('songLength')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}