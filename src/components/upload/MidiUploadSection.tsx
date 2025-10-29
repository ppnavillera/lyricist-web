"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Music, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStore } from "@/lib/store";
import { validateMidiFile, generateId } from "@/lib/utils";
import { analyzeMidiFile } from "@/lib/api";
import { MidiAnalysis, SongStructure, LyricsProject, StructureType } from "@/types";

export default function MidiUploadSection() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { setCurrentProject, setCurrentView, setLoading } = useProjectStore();
  const router = useRouter();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (!validateMidiFile(file)) {
        setUploadError("올바른 MIDI 파일(.mid, .midi)을 업로드해주세요.");
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      setLoading(true);

      try {
        // Call MIDI analyzer API
        const apiResponse = await analyzeMidiFile(file, 4);

        console.log("API Response:", JSON.stringify(apiResponse, null, 2));

        // Convert API response to MidiAnalysis format
        const structure: SongStructure[] = apiResponse.lyrics_generation_tasks.map((task, index) => {
          console.log(`Task ${index}:`, task);

          // Determine structure type from section name
          const sectionName = task.section?.toLowerCase() || "";
          let type: StructureType = "verse";

          if (sectionName.includes("chorus")) type = "chorus";
          else if (sectionName.includes("bridge")) type = "bridge";
          else if (sectionName.includes("intro")) type = "intro";
          else if (sectionName.includes("outro")) type = "outro";
          else if (sectionName.includes("pre-chorus")) type = "pre-chorus";
          else if (sectionName.includes("instrumental")) type = "instrumental";

          return {
            id: generateId(),
            type,
            name: task.section || `Section ${index + 1}`,
            startTime: task.time_range?.start || 0,
            endTime: task.time_range?.end || 0,
            syllableCount: task.target_syllables || 0,
            isCompleted: false,
          };
        });

        const totalSyllables = structure.reduce((sum, s) => sum + s.syllableCount, 0);

        console.log("Total syllables:", totalSyllables);
        console.log("Structure count:", structure.length);

        const analysis: MidiAnalysis = {
          id: generateId(),
          fileName: apiResponse.metadata.midi_file,
          duration: apiResponse.metadata.total_duration_seconds,
          tempo: apiResponse.metadata.tempo_bpm,
          timeSignature: apiResponse.metadata.time_signature,
          key: "Unknown", // API doesn't provide key info
          structure,
          totalSyllables,
          createdAt: new Date(),
        };

        // Create object URL for MIDI file
        const midiFileUrl = URL.createObjectURL(file);

        const project: LyricsProject = {
          id: generateId(),
          name: file.name.replace(/\.(mid|midi)$/i, ""),
          midiAnalysis: analysis,
          midiFileUrl, // Store MIDI file URL for playback
          theme: {
            genres: [],
            moods: [],
            keywords: [],
          },
          currentStructureIndex: 0,
          isCompleted: false,
          updatedAt: new Date(),
        };

        console.log("Created project:", project);

        setCurrentProject(project);
        setCurrentView("theme");

        router.push(`/editor/${project.id}/theme`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "파일 분석 중 오류가 발생했습니다.";
        setUploadError(errorMessage);
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
        setLoading(false);
      }
    },
    [setCurrentProject, setCurrentView, setLoading, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/midi": [".mid", ".midi"],
      "audio/x-midi": [".mid", ".midi"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all card-hover relative overflow-hidden group">
        {/* 배경 그라데이션 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <CardContent className="p-10 relative z-10">
          <div
            {...getRootProps()}
            className={`
              flex flex-col items-center justify-center space-y-6 py-12 cursor-pointer rounded-lg
              transition-all duration-300
              ${isDragActive ? "bg-primary/10 scale-105" : ""}
              ${isUploading ? "cursor-not-allowed opacity-50" : ""}
            `}
          >
            <input {...getInputProps()} />

            <div className="relative">
              {/* 글로우 효과 */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>

              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow relative z-10">
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-white" />
                )}
              </div>
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold">
                {isDragActive
                  ? "여기에 파일을 놓으세요"
                  : "MIDI 파일을 업로드하세요"}
              </h3>
              <p className="text-muted-foreground text-lg">
                드래그 앤 드롭하거나 클릭하여 업로드
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>지원 형식: .mid, .midi (최대 10MB)</span>
              </div>
            </div>

            {!isUploading && (
              <Button
                variant="outline"
                size="lg"
                className="mt-4 neon-button border-primary/20 hover:border-primary"
              >
                <Music className="h-5 w-5 mr-2" />
                파일 선택
              </Button>
            )}
          </div>

          {uploadError && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-slide-up">
              <p className="text-sm text-destructive text-center">
                {uploadError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
