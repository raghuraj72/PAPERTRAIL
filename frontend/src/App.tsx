import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckSquare,
  Bot,
  AlertTriangle,
  Layers,
  ChevronRight,
  Plus,
  ShieldCheck,
  Calendar,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

import {
  Workspace,
  WorkspaceSummary,
  DocumentParsed,
  ProoflineCitation,
  Requirement
} from './types';
import { api } from './services/api';

import { Navbar } from './components/Navbar';
import { DocumentUploader } from './components/DocumentUploader';
import { DocumentViewer } from './components/DocumentViewer';
import { ActionPlanView } from './components/ActionPlanView';
import { AskPapertrailAI } from './components/AskPapertrailAI';
import { ContradictionAlerts } from './components/ContradictionAlerts';
import { ReadyToSubmitModal } from './components/ReadyToSubmitModal';
import { RequirementGraph } from './components/RequirementGraph';
import { DeadlineTimeline } from './components/DeadlineTimeline';
import { DocumentComparator } from './components/DocumentComparator';
import { PlainTranslatorModal } from './components/PlainTranslatorModal';
import { DashboardView } from './components/DashboardView';

export const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [activeCitation, setActiveCitation] = useState<ProoflineCitation | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'workspace' | 'graph' | 'compare' | 'timeline'>('dashboard');
  const [rightPanelTab, setRightPanelTab] = useState<'action_plan' | 'ask_ai'>('action_plan');

  const [isReadinessOpen, setIsReadinessOpen] = useState<boolean>(false);
  const [translatorData, setTranslatorData] = useState<{ isOpen: boolean; text: string }>({
    isOpen: false,
    text: '',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUploaderModal, setShowUploaderModal] = useState<boolean>(false);

  // Accessibility & Theme States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('papertrail_theme') === 'dark';
  });
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(1);

  // Apply theme classes to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('papertrail_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('papertrail_theme', 'light');
    }

    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.style.setProperty('--font-scale', fontScale.toString());
  }, [isDarkMode, isHighContrast, fontScale]);

  // Initial Load
  useEffect(() => {
    loadWorkspacesList();
  }, []);

  const loadWorkspacesList = async () => {
    try {
      const list = await api.listWorkspaces();
      setWorkspaces(list);
      if (list.length > 0 && !activeWorkspace) {
        loadWorkspaceDetails(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  };

  const loadWorkspaceDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const ws = await api.getWorkspace(id);
      setActiveWorkspace(ws);
      setActiveDocIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWorkspace = (id: string) => {
    loadWorkspaceDetails(id);
  };

  const handleNewWorkspace = async () => {
    try {
      const name = prompt('Enter a name for the new workspace:', 'Application Guidelines');
      if (!name) return;
      const ws = await api.createWorkspace(name);
      await loadWorkspacesList();
      setActiveWorkspace(ws);
      setShowUploaderModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setIsLoading(true);
      const ws = await api.loadDemoWorkspace();
      await loadWorkspacesList();
      setActiveWorkspace(ws);
      setActiveDocIndex(0);
      setActiveTab('dashboard');
      setShowUploaderModal(false);
    } catch (err) {
      alert('Failed to load synthetic demo: ' + (err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!activeWorkspace) {
      const ws = await api.createWorkspace('Document Workspace');
      setActiveWorkspace(ws);
      await api.uploadDocument(ws.id, file);
      await loadWorkspaceDetails(ws.id);
      await loadWorkspacesList();
    } else {
      await api.uploadDocument(activeWorkspace.id, file);
      await loadWorkspaceDetails(activeWorkspace.id);
      await loadWorkspacesList();
    }
    setShowUploaderModal(false);
  };

  const handleTaskUpdated = async (taskId: string, updates: any) => {
    if (!activeWorkspace) return;
    try {
      await api.updateTask(activeWorkspace.id, taskId, updates);
      // Refresh workspace state
      const ws = await api.getWorkspace(activeWorkspace.id);
      setActiveWorkspace(ws);
      loadWorkspacesList();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigateToCitation = (citation: ProoflineCitation) => {
    setActiveCitation(citation);
    setActiveTab('workspace');
    // Also select the document if needed
    if (activeWorkspace && activeWorkspace.documents.length > 1) {
      const docIdx = activeWorkspace.documents.findIndex((d) => d.id === citation.document_id);
      if (docIdx !== -1) {
        setActiveDocIndex(docIdx);
      }
    }
  };

  const activeDoc: DocumentParsed | undefined =
    activeWorkspace?.documents && activeWorkspace.documents.length > 0
      ? activeWorkspace.documents[activeDocIndex] || activeWorkspace.documents[0]
      : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Main Navigation */}
      <Navbar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        onNewWorkspace={handleNewWorkspace}
        onLoadDemo={handleLoadDemo}
        onOpenReadiness={() => setIsReadinessOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        fontScale={fontScale}
        onChangeFontScale={(delta) => setFontScale((s) => Math.max(0.8, Math.min(1.4, s + delta)))}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        
        {/* If no workspace or no documents, show Welcome Hero & Uploader */}
        {(!activeWorkspace || activeWorkspace.documents.length === 0) ? (
          <div className="max-w-4xl mx-auto w-full my-auto py-8 sm:py-12 space-y-8">
            
            {/* Hero Heading */}
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <Sparkles className="w-3.5 h-3.5" />
                Proofline Evidence Intelligence · MLH × DEV 2026
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Turn Complicated Documents Into Clear Action Plans.
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Upload college circulars, scholarships, application notices, or government instructions. 
                PAPERTRAIL extracts every requirement with verifiable citations directly to the source text.
              </p>
            </div>

            {/* Document Uploader */}
            <DocumentUploader
              onUpload={handleUploadDocument}
              onLoadDemo={handleLoadDemo}
              isLoading={isLoading}
            />

            {/* Three Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center mb-2">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Evidence-First Action Plans
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Requirements are prioritized into 6 stages (prerequisites, documents, submission) without hallucinated status.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  PROOFLINE Citations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every requirement and AI answer links directly to its source page and verbatim passage. No fake citations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
                <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mb-2">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Contradiction Detection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Identifies conflicting deadlines, fees, and instructions across pages, presenting dual-passage evidence.
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* Main Workspace Views */
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* View Tab 0: Interactive Command Center Dashboard */}
            {activeTab === 'dashboard' && activeWorkspace && (
              <div className="flex-1 w-full">
                <DashboardView
                  workspace={activeWorkspace}
                  onNavigateToCitation={handleNavigateToCitation}
                  onOpenReadiness={() => setIsReadinessOpen(true)}
                  onGoToTab={(tab) => setActiveTab(tab)}
                  onTaskUpdated={handleTaskUpdated}
                />
              </div>
            )}

            {/* View Tab 1: Primary Document Workspace (Three-Panel Layout) */}
            {activeTab === 'workspace' && activeDoc && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)] min-h-[600px]">
                
                {/* LEFT PANEL: Document Navigation & Metadata (3 Cols) */}
                <aside className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm overflow-hidden gap-4">
                  
                  {/* Documents in Workspace Switcher */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Workspace Documents ({activeWorkspace.documents.length})
                      </span>
                      <button
                        onClick={() => setShowUploaderModal(true)}
                        className="text-sky-600 dark:text-sky-400 hover:underline text-[11px] flex items-center gap-0.5 font-semibold"
                        title="Add another document"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {activeWorkspace.documents.map((doc, idx) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setActiveDocIndex(idx);
                            setActiveCitation(null);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition text-xs flex items-center justify-between ${
                            activeDocIndex === idx
                              ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-900 dark:text-sky-200 font-semibold'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-sky-500 shrink-0" />
                            <span className="truncate">{doc.filename}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {doc.page_count}p
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contradictions Banner if any */}
                  {activeWorkspace.combined_contradictions.length > 0 && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{activeWorkspace.combined_contradictions.length} Conflict(s) Detected</span>
                      </div>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400">
                        Conflicting deadlines or fees detected. Review in Action Plan or Contradiction tab.
                      </p>
                    </div>
                  )}

                  {/* Quick Document Summary */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Document Synopsis
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-4">
                      {activeDoc.summary}
                    </p>
                    {activeDoc.fee_info && (
                      <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700 text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Fee:</span> {activeDoc.fee_info}
                      </div>
                    )}
                  </div>

                  {/* Document Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {activeDoc.requirements.length}
                      </span>
                      <span className="text-[10px] text-slate-400">Requirements</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {activeDoc.dates.length}
                      </span>
                      <span className="text-[10px] text-slate-400">Dates & Cutoffs</span>
                    </div>
                  </div>

                  {/* Support contacts */}
                  {activeDoc.contact_details && activeDoc.contact_details.length > 0 && (
                    <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                      <span className="font-semibold block mb-0.5">Official Inquiries:</span>
                      {activeDoc.contact_details.slice(0, 2).map((c, i) => (
                        <div key={i} className="truncate">{c}</div>
                      ))}
                    </div>
                  )}

                </aside>

                {/* CENTER PANEL: Original Document Preview & Highlights (5 Cols) */}
                <section className="lg:col-span-5 h-full overflow-hidden">
                  <DocumentViewer
                    document={activeDoc}
                    workspaceId={activeWorkspace.id}
                    activeCitation={activeCitation}
                    onClearActiveCitation={() => setActiveCitation(null)}
                  />
                </section>

                {/* RIGHT PANEL: Action Plan Checklist OR Ask AI (4 Cols) */}
                <section className="lg:col-span-4 flex flex-col h-full overflow-hidden">
                  {/* Panel Sub-Tabs */}
                  <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl mb-2 text-xs font-semibold">
                    <button
                      onClick={() => setRightPanelTab('action_plan')}
                      className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                        rightPanelTab === 'action_plan'
                          ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Action Plan</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800">
                        {activeWorkspace.action_plan_completed_count}/{activeWorkspace.action_plan_total_count}
                      </span>
                    </button>

                    <button
                      onClick={() => setRightPanelTab('ask_ai')}
                      className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                        rightPanelTab === 'ask_ai'
                          ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                      <span>Ask AI</span>
                    </button>
                  </div>

                  {/* Panel Content */}
                  <div className="flex-1 overflow-hidden">
                    {rightPanelTab === 'action_plan' ? (
                      <ActionPlanView
                        workspaceId={activeWorkspace.id}
                        requirements={activeWorkspace.combined_requirements}
                        onTaskUpdated={handleTaskUpdated}
                        onNavigateToCitation={handleNavigateToCitation}
                        onOpenTranslator={(text) => setTranslatorData({ isOpen: true, text })}
                      />
                    ) : (
                      <AskPapertrailAI
                        workspaceId={activeWorkspace.id}
                        onNavigateToCitation={handleNavigateToCitation}
                      />
                    )}
                  </div>
                </section>

              </div>
            )}

            {/* View Tab 2: Workflow Graph */}
            {activeTab === 'graph' && activeWorkspace && (
              <div className="flex-1">
                <RequirementGraph
                  requirements={activeWorkspace.combined_requirements}
                  onNavigateToCitation={handleNavigateToCitation}
                />
              </div>
            )}

            {/* View Tab 3: Deadlines & Timeline */}
            {activeTab === 'timeline' && activeWorkspace && (
              <div className="flex-1 max-w-4xl mx-auto w-full">
                <DeadlineTimeline
                  dates={activeDoc ? activeDoc.dates : []}
                  onNavigateToCitation={handleNavigateToCitation}
                />
              </div>
            )}

            {/* View Tab 4: Compare Documents */}
            {activeTab === 'compare' && activeWorkspace && (
              <div className="flex-1 max-w-4xl mx-auto w-full">
                <DocumentComparator
                  workspaceId={activeWorkspace.id}
                  documents={activeWorkspace.documents}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Upload Additional Document Modal */}
      {showUploaderModal && activeWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-xl w-full">
            <DocumentUploader
              onUpload={handleUploadDocument}
              onLoadDemo={handleLoadDemo}
              isLoading={isLoading}
            />
            <div className="text-center mt-3">
              <button
                onClick={() => setShowUploaderModal(false)}
                className="text-xs text-white/80 hover:text-white underline"
              >
                Cancel and return to workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READY TO SUBMIT? Modal */}
      {activeWorkspace && (
        <ReadyToSubmitModal
          workspaceId={activeWorkspace.id}
          isOpen={isReadinessOpen}
          onClose={() => setIsReadinessOpen(false)}
          onNavigateToCitation={handleNavigateToCitation}
        />
      )}

      {/* Plain Translator Modal */}
      <PlainTranslatorModal
        isOpen={translatorData.isOpen}
        onClose={() => setTranslatorData({ isOpen: false, text: '' })}
        initialText={translatorData.text}
      />

    </div>
  );
};

export default App;
