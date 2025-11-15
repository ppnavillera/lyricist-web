"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SongStructure } from "@/types";
import { copyToClipboard } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function ProgressSidebar() {
  const t = useTranslations('workspace');
  const params = useParams();
  const router = useRouter();
  const { currentProject, ui, setSidebarCollapsed, setCurrentStructureIndex } =
    useProjectStore();
  const songId = params.songId as string;

  // Initialize with all completed structures expanded by default
  const [expandedStructures, setExpandedStructures] = useState<Set<string>>(
    () => {
      if (!currentProject) return new Set();
      return new Set(
        currentProject.midiAnalysis.structure
          .filter((s) => s.isCompleted && s.lyrics)
          .map((s) => s.id)
      );
    }
  );

  const [copyingStructure, setCopyingStructure] = useState<string | null>(null);
  const [detailModalStructure, setDetailModalStructure] = useState<
    string | null
  >(null);

  // Auto-expand newly completed structures
  useEffect(() => {
    if (!currentProject) return;
    const completedWithLyrics = currentProject.midiAnalysis.structure
      .filter((s) => s.isCompleted && s.lyrics)
      .map((s) => s.id);

    setExpandedStructures((prev) => new Set([...prev, ...completedWithLyrics]));
  }, [currentProject?.midiAnalysis.structure]);

  if (!currentProject) return null;

  const completedCount = currentProject.midiAnalysis.structure.filter(
    (s) => s.isCompleted
  ).length;
  const totalCount = currentProject.midiAnalysis.structure.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleStructureClick = (structureId: string, index: number) => {
    // Check if previous structures are completed
    const canAccess =
      index === 0 ||
      currentProject.midiAnalysis.structure
        .slice(0, index)
        .every((s) => s.isCompleted);

    if (!canAccess) {
      // Don't allow navigation to uncompleted structures
      return;
    }

    setCurrentStructureIndex(index);
    router.push(`/editor/${songId}/workspace/${structureId}`);
  };

  const handleStructureKeyDown = (
    e: React.KeyboardEvent,
    structureId: string,
    index: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStructureClick(structureId, index);
    }
  };

  const canAccessStructure = (index: number) => {
    return (
      index === 0 ||
      currentProject.midiAnalysis.structure
        .slice(0, index)
        .every((s) => s.isCompleted)
    );
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

  const handleCopyLyrics = async (
    lyrics: string,
    structureId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await copyToClipboard(lyrics);
      setCopyingStructure(structureId);
      setTimeout(() => setCopyingStructure(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
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
            {t('progress')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!ui.sidebarCollapsed)}
          >
            {ui.sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!ui.sidebarCollapsed && (
          // **[수정 부분 1] Progress 컴포넌트 스타일 변경**
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {t('completedCount', { completed: completedCount, total: totalCount })}
              </span>
              <span className="text-primary font-bold">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50">
              <div
                className="h-full progress-gradient transition-all duration-500 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
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
                {/* **[수정 부분 2] 구조 아이템 스타일 변경** */}
                <div
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                  onClick={() => handleStructureClick(structure.id, index)}
                  onKeyDown={(e) =>
                    handleStructureKeyDown(e, structure.id, index)
                  }
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all duration-300 focus:outline-none relative overflow-hidden group",
                    canAccess &&
                      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 cursor-pointer",
                    currentProject.currentStructureIndex === index &&
                      "bg-gradient-to-r from-primary/20 to-accent/10 border-2 border-primary/30 shadow-lg shadow-primary/20",
                    isLocked && "opacity-50 cursor-not-allowed bg-muted/30"
                  )}
                >
                  {currentProject.currentStructureIndex === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse"></div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "flex items-center gap-3",
                          ui.sidebarCollapsed && "justify-center"
                        )}
                      >
                        {/* **[수정 부분 3] 완료 체크 아이콘 스타일 변경** */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
                            structure.isCompleted
                              ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50"
                              : currentProject.currentStructureIndex === index
                              ? "bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg shadow-primary/50"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {structure.isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {/* [수정 부분 3 끝] */}

                        {!ui.sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {structure.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {structure.adjustedSyllableCount ||
                                structure.syllableCount}{" "}
                              {t('syllables')}
                            </div>
                            {isLocked && (
                              <div className="text-xs text-orange-500 mt-1">
                                🔒 {t('completePrevious')}
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
                                onClick={(e) =>
                                  openDetailModal(structure.id, e)
                                }
                                title={t('viewDetail')}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-60 hover:opacity-100"
                                onClick={(e) => toggleExpanded(structure.id, e)}
                                title={
                                  expandedStructures.has(structure.id)
                                    ? t('collapse')
                                    : t('expand')
                                }
                              >
                                {expandedStructures.has(structure.id) ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          )}
                          {!structure.isCompleted &&
                            currentProject.currentStructureIndex === index && (
                              <Clock className="h-4 w-4 text-primary" />
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* [수정 부분 2 끝] */}

                {/* Simple Expanded Lyrics */}
                {!ui.sidebarCollapsed &&
                  expandedStructures.has(structure.id) &&
                  structure.lyrics && (
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
          {/* **[수정 부분 4] 완료 버튼 스타일 변경** */}
          <Button
            onClick={handleComplete}
            disabled={completedCount < totalCount}
            className={cn(
              "w-full neon-button relative overflow-hidden",
              completedCount === totalCount &&
                "bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50"
            )}
            variant={completedCount === totalCount ? "default" : "outline"}
          >
            <span className="relative z-10">
              {completedCount === totalCount
                ? `✨ ${t('completeAll')}`
                : t('remainingCount', { count: totalCount - completedCount })}
            </span>
          </Button>
          {/* [수정 부분 4 끝] */}
        </div>
      )}

      {/* Detail Modal (기존 코드 유지) */}
      {detailModalStructure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {t('lyricsDetail', { name: currentProject.midiAnalysis.structure.find(
                      (s) => s.id === detailModalStructure
                    )?.name || '' })}
                </h3>
                <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {(() => {
                const structure = currentProject.midiAnalysis.structure.find(
                  (s) => s.id === detailModalStructure
                );
                if (!structure || !structure.lyrics) return null;

                return (
                  <div className="space-y-4">
                    {/* Copy Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) =>
                          handleCopyLyrics(structure.lyrics!, structure.id, e)
                        }
                      >
                        {copyingStructure === structure.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            {t('copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('copyLyrics')}
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
                        <h4 className="font-medium mb-2">{t('lineStructure')}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {structure.lineStructure.map((line, lineIndex) => (
                            <div
                              key={lineIndex}
                              className="flex items-center justify-between p-2 bg-muted/25 rounded text-sm"
                            >
                              <span>
                                {t('lineInfo', { number: lineIndex + 1, description: line.description || t('lineInfo', { number: lineIndex + 1, description: '' }).split(':')[0] })}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {line.syllables} {t('syllables')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                      <span>
                        {t('totalSyllableCount', { count: structure.lyrics.replace(/\s+/g, "").length })}
                      </span>
                      <span>
                        {t('lineCount', { count: structure.lyrics.split("\n").length })}
                      </span>
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
