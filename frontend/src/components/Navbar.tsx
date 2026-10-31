import React from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Eye,
  Type,
  FolderOpen,
  Plus
} from 'lucide-react';
import { Workspace, WorkspaceSummary } from '../types';

interface NavbarProps {
  workspaces: WorkspaceSummary[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (id: string) => void;
  onNewWorkspace: () => void;
  onLoadDemo: () => void;
  onOpenReadiness: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontScale: number;
  onChangeFontScale: (delta: number) => void;
  activeTab: 'dashboard' | 'workspace' | 'graph' | 'compare' | 'timeline';
  onChangeTab: (tab: 'dashboard' | 'workspace' | 'graph' | 'compare' | 'timeline') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onNewWorkspace,
  onLoadDemo,
  onOpenReadiness,
  isDarkMode,
  onToggleDarkMode,
  isHighContrast,
  onToggleHighContrast,
  fontScale,
  onChangeFontScale,
  activeTab,
  onChangeTab
}) => {
  const completedCount = activeWorkspace?.action_plan_completed_count ?? 0;
  const totalCount = activeWorkspace?.action_plan_total_count ?? 0;
  const hasContradictions = (activeWorkspace?.combined_contradictions.length ?? 0) > 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                PAPERTRAIL
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Clarity Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Understand the requirements. Know what to do.
            </p>
          </div>
        </div>

        {/* Workspace Switcher & Navigation Tabs */}
        <div className="flex items-center gap-2">
          {workspaces.length > 0 && (
            <div className="relative">
              <select
                aria-label="Select Workspace"
                value={activeWorkspace?.id ?? ''}
                onChange={(e) => onSelectWorkspace(e.target.value)}
                className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-[170px] truncate"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onNewWorkspace}
            title="Create New Workspace"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Demo Challenge</span>
          </button>

          {/* Navigation View Tabs */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Command Center
            </button>
            <button
              onClick={() => onChangeTab('workspace')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'workspace'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => onChangeTab('graph')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'graph'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Workflow Graph
            </button>
            <button
              onClick={() => onChangeTab('timeline')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Deadlines
            </button>
            <button
              onClick={() => onChangeTab('compare')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'compare'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Compare
            </button>
          </div>
        </div>

        {/* Action Buttons & Accessibility */}
        <div className="flex items-center gap-2">
          {/* Ready to Submit Audit Button */}
          {activeWorkspace && (
            <button
              onClick={onOpenReadiness}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition shadow-sm ${
                hasContradictions
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-300'
              }`}
            >
              {hasContradictions ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>Ready to Submit?</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700">
                {completedCount}/{totalCount}
              </span>
            </button>
          )}

          {/* Accessibility Font Size */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => onChangeFontScale(-0.1)}
              title="Decrease Font Size"
              disabled={fontScale <= 0.8}
              className="px-1.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30"
            >
              A-
            </button>
            <span className="text-[10px] text-slate-400">|</span>
            <button
              onClick={() => onChangeFontScale(0.1)}
              title="Increase Font Size"
              disabled={fontScale >= 1.4}
              className="px-1.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            title={isHighContrast ? "Normal Contrast" : "High Contrast Accessibility"}
            className={`p-1.5 rounded-lg border transition ${
              isHighContrast
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation for active workspace */}
      {activeWorkspace && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/90 dark:bg-slate-900/90 text-xs">
          <button
            onClick={() => onChangeTab('dashboard')}
            className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition ${
              activeTab === 'dashboard'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => onChangeTab('workspace')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'workspace'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => onChangeTab('graph')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'graph'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Workflow Graph
          </button>
          <button
            onClick={() => onChangeTab('timeline')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'timeline'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => onChangeTab('compare')}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'compare'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Compare
          </button>
        </div>
      )}
    </header>
  );
};
