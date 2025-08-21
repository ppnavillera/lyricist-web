'use client';

import { useState } from 'react';
import { Sparkles, RotateCcw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SongStructure, LyricsProject } from '@/types';
import { useProjectStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AiLyricsGeneratorProps {
  structure: SongStructure;
  project: LyricsProject;
}

export default function AiLyricsGenerator({ structure, project }: AiLyricsGeneratorProps) {
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [linesText, setLinesText] = useState<string[]>(() => {
    // Initialize with existing lyrics or empty lines
    if (structure.lyrics) {
      return structure.lyrics.split('\n');
    }
    return Array(structure.lineStructure?.length || 4).fill('');
  });
  const [generatingLineIndex, setGeneratingLineIndex] = useState<number | null>(null);
  const [lineOptions, setLineOptions] = useState<{[lineIndex: number]: string[]}>({});
  const { updateStructureLyrics } = useProjectStore();

  const targetSyllableCount = structure.adjustedSyllableCount || structure.syllableCount;

  const updateLineText = (lineIndex: number, text: string) => {
    const newLinesText = [...linesText];
    newLinesText[lineIndex] = text;
    setLinesText(newLinesText);
  };

  const generateLineOptions = async (lineIndex: number) => {
    if (!structure.lineStructure || lineIndex >= structure.lineStructure.length) {
      return;
    }

    setGeneratingLineIndex(lineIndex);
    
    try {
      // Mock AI generation for specific line
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const line = structure.lineStructure[lineIndex];
      const targetSyllables = line.syllables;
      const previousLines = linesText.slice(0, lineIndex).filter(text => text.trim());
      
      // Generate 3 options for this line considering previous context
      const options = generateSingleLineOptions(lineIndex, targetSyllables, previousLines);
      
      setLineOptions(prev => ({
        ...prev,
        [lineIndex]: options
      }));
      
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGeneratingLineIndex(null);
    }
  };

  const selectLineOption = (lineIndex: number, selectedOption: string) => {
    updateLineText(lineIndex, selectedOption);
    
    // Remove options for this line
    setLineOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[lineIndex];
      return newOptions;
    });
  };

  const saveAllLines = () => {
    const completeLyrics = linesText.filter(line => line.trim()).join('\n');
    updateStructureLyrics(structure.id, completeLyrics);
  };

  const clearLineOptions = (lineIndex: number) => {
    setLineOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[lineIndex];
      return newOptions;
    });
  };

  const generateSingleLineOptions = (lineIndex: number, targetSyllables: number, previousLines: string[]) => {
    // Generate options that flow naturally from previous lines
    const baseTemplates = [
      ['햇살이 비치는 창가에서', '너의 목소리가 들려와', '따뜻한 마음으로 안아줘'],
      ['시간이 흘러도 변하지 않는', '우리의 약속을 기억해', '어둠이 와도 두렵지 않아'],
      ['바람에 흩날리는 꽃잎처럼', '가벼운 마음으로 떠나가', '새로운 시작을 향해서'],
      ['하늘을 바라보며 걸어가', '꿈을 향해 달려가며', '희망찬 미래를 그려봐']
    ];
    
    // Consider context from previous lines for better flow
    let templates = baseTemplates[lineIndex % baseTemplates.length];
    
    // If there are previous lines, try to create thematic continuation
    if (previousLines.length > 0) {
      const lastLine = previousLines[previousLines.length - 1];
      
      // Simple thematic matching based on keywords
      if (lastLine.includes('햇살') || lastLine.includes('밝')) {
        templates = ['따뜻한 빛이 감싸주네', '환한 웃음이 번져가', '행복이 가득 차올라'];
      } else if (lastLine.includes('시간') || lastLine.includes('흘러')) {
        templates = ['지나간 날들을 생각해', '추억이 스며들어와', '영원히 기억할 순간'];
      } else if (lastLine.includes('바람') || lastLine.includes('흩날')) {
        templates = ['자유롭게 날아오르며', '구름처럼 떠다니며', '하늘 높이 올라가'];
      }
    }
    
    return templates.map(template => {
      const currentLength = template.replace(/\s/g, '').length;
      
      if (currentLength === targetSyllables) {
        return template;
      } else if (currentLength > targetSyllables) {
        // Intelligently trim while keeping meaning
        return template.substring(0, targetSyllables);
      } else {
        // Extend naturally
        const diff = targetSyllables - currentLength;
        const naturalEndings = ['요', '네요', '어요', '죠', '해요'];
        
        if (diff <= 3) {
          return template + (naturalEndings[diff - 1] || '');
        } else {
          return '정말 ' + template;
        }
      }
    });
  };

  const selectLyrics = (lyrics: string) => {
    updateStructureLyrics(structure.id, lyrics);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI 가사 생성
        </CardTitle>
        <CardDescription>
          설정한 테마와 음절 수에 맞는 가사를 AI가 생성해드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Settings */}
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
          
          <div className="space-y-3">
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
              {project.theme.keywords.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  키워드: {project.theme.keywords.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">추가 요청사항 (선택사항)</label>
          <Input
            placeholder="예: 더 감성적으로, 특정 단어 포함, 운율 강조 등"
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
          />
        </div>

        {/* Line-by-line Editor */}
        {structure.lineStructure && structure.lineStructure.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">줄별 가사 편집</h4>
            
            {structure.lineStructure.map((line, lineIndex) => (
              <Card key={lineIndex} className="border-l-4 border-l-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {lineIndex + 1}줄: {line.description || `${lineIndex + 1}번째 줄`} ({line.syllables}음절)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateLineOptions(lineIndex)}
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
                      {lineOptions[lineIndex] && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => clearLineOptions(lineIndex)}
                        >
                          옵션 닫기
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Text Input */}
                  <Input
                    placeholder={`${lineIndex + 1}번째 줄 가사를 입력하세요...`}
                    value={linesText[lineIndex] || ''}
                    onChange={(e) => updateLineText(lineIndex, e.target.value)}
                    className="font-medium"
                  />
                  
                  {/* AI Generated Options */}
                  {lineOptions[lineIndex] && (
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">AI 생성 옵션:</span>
                      {lineOptions[lineIndex].map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm">{option}</span>
                          <Button 
                            size="xs" 
                            onClick={() => selectLineOption(lineIndex, option)}
                          >
                            선택
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Context Preview */}
                  {lineIndex > 0 && linesText.slice(0, lineIndex).some(text => text.trim()) && (
                    <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                      <span className="font-medium">이전 줄들:</span>
                      <div className="mt-1">
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
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-2">
          <Button 
            onClick={saveAllLines}
            className="flex-1"
            disabled={!linesText.some(line => line.trim())}
          >
            가사 저장하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}