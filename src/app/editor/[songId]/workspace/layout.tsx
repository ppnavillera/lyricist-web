'use client';

import { useProjectStore } from '@/lib/store';
import ProgressSidebar from '@/components/workspace/ProgressSidebar';
import ControlPanel from '@/components/workspace/ControlPanel';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ui } = useProjectStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Progress */}
      <div className={`${ui.sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 border-r border-border`}>
        <ProgressSidebar />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Right Panel - Controls */}
      <div className="w-80 border-l border-border">
        <ControlPanel />
      </div>
    </div>
  );
}