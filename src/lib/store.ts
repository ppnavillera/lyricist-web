import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LyricsProject, MidiAnalysis, ProjectTheme, SongStructure, UIState, ExportOptions, LineStructure } from '@/types';

interface ProjectStore {
  // Current project state
  currentProject: LyricsProject | null;
  
  // UI state
  ui: UIState;
  
  // Actions
  setCurrentProject: (project: LyricsProject | null) => void;
  updateProjectTheme: (theme: ProjectTheme) => void;
  updateStructureLyrics: (structureId: string, lyrics: string) => void;
  updateStructureSyllableCount: (structureId: string, syllableCount: number) => void;
  updateStructureName: (structureId: string, name: string) => void;
  updateStructureLineStructure: (structureId: string, lineStructure: LineStructure[]) => void;
  markStructureCompleted: (structureId: string) => void;
  setCurrentStructureIndex: (index: number) => void;
  completeProject: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentView: (view: UIState['currentView']) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Reset
  resetProject: () => void;
}

const initialUIState: UIState = {
  isLoading: false,
  error: null,
  currentView: 'upload',
  sidebarCollapsed: false,
};

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentProject: null,
        ui: initialUIState,
        
        setCurrentProject: (project) => {
          set({ currentProject: project });
        },
        
        updateProjectTheme: (theme) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          set({
            currentProject: {
              ...currentProject,
              theme,
              updatedAt: new Date(),
            },
          });
        },
        
        updateStructureLyrics: (structureId, lyrics) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const updatedStructure = currentProject.midiAnalysis.structure.map((s) =>
            s.id === structureId ? { ...s, lyrics } : s
          );
          
          set({
            currentProject: {
              ...currentProject,
              midiAnalysis: {
                ...currentProject.midiAnalysis,
                structure: updatedStructure,
              },
              updatedAt: new Date(),
            },
          });
        },
        
        updateStructureSyllableCount: (structureId, syllableCount) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const updatedStructure = currentProject.midiAnalysis.structure.map((s) =>
            s.id === structureId ? { ...s, adjustedSyllableCount: syllableCount } : s
          );
          
          set({
            currentProject: {
              ...currentProject,
              midiAnalysis: {
                ...currentProject.midiAnalysis,
                structure: updatedStructure,
              },
              updatedAt: new Date(),
            },
          });
        },
        
        updateStructureName: (structureId, name) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const updatedStructure = currentProject.midiAnalysis.structure.map((s) =>
            s.id === structureId ? { ...s, name } : s
          );
          
          set({
            currentProject: {
              ...currentProject,
              midiAnalysis: {
                ...currentProject.midiAnalysis,
                structure: updatedStructure,
              },
              updatedAt: new Date(),
            },
          });
        },
        
        updateStructureLineStructure: (structureId, lineStructure) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const totalSyllables = lineStructure.reduce((sum, line) => sum + line.syllables, 0);
          
          const updatedStructure = currentProject.midiAnalysis.structure.map((s) =>
            s.id === structureId ? { 
              ...s, 
              lineStructure,
              adjustedSyllableCount: totalSyllables
            } : s
          );
          
          set({
            currentProject: {
              ...currentProject,
              midiAnalysis: {
                ...currentProject.midiAnalysis,
                structure: updatedStructure,
              },
              updatedAt: new Date(),
            },
          });
        },
        
        markStructureCompleted: (structureId) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          const updatedStructure = currentProject.midiAnalysis.structure.map((s) =>
            s.id === structureId ? { ...s, isCompleted: true } : s
          );
          
          const allCompleted = updatedStructure.every(s => s.isCompleted);
          
          set({
            currentProject: {
              ...currentProject,
              midiAnalysis: {
                ...currentProject.midiAnalysis,
                structure: updatedStructure,
              },
              isCompleted: allCompleted,
              completedAt: allCompleted ? new Date() : currentProject.completedAt,
              updatedAt: new Date(),
            },
          });
        },
        
        setCurrentStructureIndex: (index) => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          set({
            currentProject: {
              ...currentProject,
              currentStructureIndex: index,
              updatedAt: new Date(),
            },
          });
        },
        
        completeProject: () => {
          const { currentProject } = get();
          if (!currentProject) return;
          
          set({
            currentProject: {
              ...currentProject,
              isCompleted: true,
              completedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        },
        
        setLoading: (loading) => {
          set((state) => ({
            ui: { ...state.ui, isLoading: loading },
          }));
        },
        
        setError: (error) => {
          set((state) => ({
            ui: { ...state.ui, error },
          }));
        },
        
        setCurrentView: (view) => {
          set((state) => ({
            ui: { ...state.ui, currentView: view },
          }));
        },
        
        setSidebarCollapsed: (collapsed) => {
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: collapsed },
          }));
        },
        
        resetProject: () => {
          set({
            currentProject: null,
            ui: initialUIState,
          });
        },
      }),
      {
        name: 'lyricist-project-store',
        partialize: (state) => ({
          currentProject: state.currentProject,
        }),
      }
    ),
    {
      name: 'project-store',
    }
  )
);