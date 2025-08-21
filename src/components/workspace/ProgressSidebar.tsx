'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Copy, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { SongStructure } from '@/types';
import { copyToClipboard } from '@/lib/utils';

export default function ProgressSidebar() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, ui, setSidebarCollapsed, setCurrentStructureIndex } = useProjectStore();
  const songId = params.songId as string;
  
  // Initialize with all completed structures expanded by default
  const [expandedStructures, setExpandedStructures] = useState<Set<string>>(() => {
    if (!currentProject) return new Set();
    return new Set(currentProject.midiAnalysis.structure
      .filter(s => s.isCompleted && s.lyrics)
      .map(s => s.id)
    );
  });
  
  const [copyingStructure, setCopyingStructure] = useState<string | null>(null);
  const [detailModalStructure, setDetailModalStructure] = useState<string | null>(null);

  // Auto-expand newly completed structures
  useEffect(() => {
    if (!currentProject) return;
    const completedWithLyrics = currentProject.midiAnalysis.structure
      .filter(s => s.isCompleted && s.lyrics)
      .map(s => s.id);
    
    setExpandedStructures(prev => new Set([...prev, ...completedWithLyrics]));
  }, [currentProject?.midiAnalysis.structure]);

  if (!currentProject) return null;

  const completedCount = currentProject.midiAnalysis.structure.filter(s => s.isCompleted).length;
  const totalCount = currentProject.midiAnalysis.structure.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleStructureClick = (structureId: string, index: number) => {
    // Check if previous structures are completed
    const canAccess = index === 0 || currentProject.midiAnalysis.structure.slice(0, index).every(s => s.isCompleted);
    
    if (!canAccess) {
      // Don't allow navigation to uncompleted structures
      return;
    }
    
    setCurrentStructureIndex(index);
    router.push(`/editor/${songId}/workspace/${structureId}`);
  };

  const handleStructureKeyDown = (e: React.KeyboardEvent, structureId: string, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStructureClick(structureId, index);
    }
  };

  const canAccessStructure = (index: number) => {
    return index === 0 || currentProject.midiAnalysis.structure.slice(0, index).every(s => s.isCompleted);
  };

  const handleComplete = () => {
    router.push(`/editor/${songId}/complete`);
  };

  const toggleExpanded = (structureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedStructures);
    if (newExpanded.has(structureId)) {
      newExpanded.delete(structureId);
    } else {
      newExpanded.add(structureId);
    }
    setExpandedStructures(newExpanded);
  };

  const handleCopyLyrics = async (lyrics: string, structureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyToClipboard(lyrics);
      setCopyingStructure(structureId);
      setTimeout(() => setCopyingStructure(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const openDetailModal = (structureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailModalStructure(structureId);
  };

  const closeDetailModal = () => {
    setDetailModalStructure(null);
    setCopyingStructure(null);
  };


  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn("font-semibold", ui.sidebarCollapsed && "hidden")}>
            진행 현황
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!ui.sidebarCollapsed)}
          >
            {ui.sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {!ui.sidebarCollapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>완료: {completedCount}/{totalCount}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        )}
      </div>

      {/* Structure List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {currentProject.midiAnalysis.structure.map((structure, index) => {
            const canAccess = canAccessStructure(index);
            const isLocked = !canAccess;
            
            return (
            <div key={structure.id} className="mb-2">
              <div
                role="button"
                tabIndex={isLocked ? -1 : 0}
                onClick={() => handleStructureClick(structure.id, index)}
                onKeyDown={(e) => handleStructureKeyDown(e, structure.id, index)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                  canAccess && "hover:bg-muted cursor-pointer",
                  currentProject.currentStructureIndex === index && "bg-primary/10 border border-primary/20",
                  isLocked && "opacity-50 cursor-not-allowed bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center gap-3", ui.sidebarCollapsed && "justify-center")}>
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs",
                      structure.isCompleted 
                        ? "bg-green-500 text-white" 
                        : currentProject.currentStructureIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {structure.isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                    </div>
                    
                    {!ui.sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {structure.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {structure.adjustedSyllableCount || structure.syllableCount} 음절
                        </div>
                        {isLocked && (
                          <div className="text-xs text-orange-500 mt-1">
                            🔒 이전 구간을 먼저 완료하세요
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!ui.sidebarCollapsed && (
                    <div className="flex items-center gap-1">
                      {structure.isCompleted && structure.lyrics && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-60 hover:opacity-100"
                            onClick={(e) => openDetailModal(structure.id, e)}
                            title="자세히 보기"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-60 hover:opacity-100"
                            onClick={(e) => toggleExpanded(structure.id, e)}
                            title={expandedStructures.has(structure.id) ? "접기" : "펼치기"}
                          >
                            {expandedStructures.has(structure.id) ? 
                              <ChevronUp className="h-3 w-3" /> : 
                              <ChevronDown className="h-3 w-3" />
                            }
                          </Button>
                        </>
                      )}
                      {!structure.isCompleted && currentProject.currentStructureIndex === index && (
                        <Clock className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Simple Expanded Lyrics */}
              {!ui.sidebarCollapsed && expandedStructures.has(structure.id) && structure.lyrics && (
                <div className="mt-2 mx-3 p-3 bg-muted/20 rounded-lg border-l-2 border-primary/30">
                  <div className="text-xs leading-relaxed whitespace-pre-line text-foreground/80">
                    {structure.lyrics}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {!ui.sidebarCollapsed && (
        <div className="p-4 border-t border-border">
          <Button 
            onClick={handleComplete}
            disabled={completedCount < totalCount}
            className="w-full"
            variant={completedCount === totalCount ? "default" : "outline"}
          >
            {completedCount === totalCount ? "완료하기" : `${totalCount - completedCount}개 남음`}
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalStructure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {currentProject.midiAnalysis.structure.find(s => s.id === detailModalStructure)?.name} - 가사 상세
                </h3>
                <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {(() => {
                const structure = currentProject.midiAnalysis.structure.find(s => s.id === detailModalStructure);
                if (!structure || !structure.lyrics) return null;
                
                return (
                  <div className="space-y-4">
                    {/* Copy Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleCopyLyrics(structure.lyrics!, structure.id, e)}
                      >
                        {copyingStructure === structure.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            가사 복사
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Full Lyrics */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="whitespace-pre-line text-sm leading-relaxed">
                        {structure.lyrics}
                      </div>
                    </div>
                    
                    {/* Line Structure */}
                    {structure.lineStructure && (
                      <div>
                        <h4 className="font-medium mb-2">줄별 구조</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {structure.lineStructure.map((line, lineIndex) => (
                            <div key={lineIndex} className="flex items-center justify-between p-2 bg-muted/25 rounded text-sm">
                              <span>{lineIndex + 1}줄: {line.description || `${lineIndex + 1}번째 줄`}</span>
                              <Badge variant="outline" className="text-xs">{line.syllables}음절</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Statistics */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                      <span>총 음절 수: {structure.lyrics.replace(/\s+/g, '').length}음절</span>
                      <span>줄 수: {structure.lyrics.split('\n').length}줄</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}