import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Download,
  Filter,
  FileText,
  StickyNote,
  Bell,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  Requirement,
  RequirementCategory,
  TaskStatus,
  Priority,
  ProoflineCitation
} from '../types';
import { ProoflineCard } from './ProoflineCard';
import { api } from '../services/api';

interface ActionPlanViewProps {
  workspaceId: string;
  requirements: Requirement[];
  onTaskUpdated: (taskId: string, updates: any) => Promise<void>;
  onNavigateToCitation: (citation: ProoflineCitation) => void;
  onOpenTranslator?: (text: string) => void;
}

const CATEGORIES: RequirementCategory[] = [
  'Eligibility Verification',
  'Before Applying',
  'Documents to Prepare',
  'Application Completion',
  'Final Review',
  'Submission'
];

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  workspaceId,
  requirements,
  onTaskUpdated,
  onNavigateToCitation,
  onOpenTranslator
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'incomplete' | 'completed' | 'mandatory'>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [editingReminderTaskId, setEditingReminderTaskId] = useState<string | null>(null);
  const [tempReminder, setTempReminder] = useState<string>('');

  const completedCount = requirements.filter((r) => r.status === 'Completed').length;
  const mandatoryCount = requirements.filter((r) => r.is_mandatory).length;
  const mandatoryCompleted = requirements.filter((r) => r.is_mandatory && r.status === 'Completed').length;
  const progressPercent = requirements.length ? Math.round((completedCount / requirements.length) * 100) : 0;
  const mandatoryProgressPercent = mandatoryCount ? Math.round((mandatoryCompleted / mandatoryCount) * 100) : 0;

  // Filter tasks
  const filteredRequirements = requirements.filter((r) => {
    if (filterStatus === 'incomplete') return r.status !== 'Completed';
    if (filterStatus === 'completed') return r.status === 'Completed';
    if (filterStatus === 'mandatory') return r.is_mandatory;
    return true;
  });

  const toggleTaskCompletion = async (req: Requirement) => {
    const nextStatus: TaskStatus = req.status === 'Completed' ? 'Not Started' : 'Completed';
    await onTaskUpdated(req.id, { status: nextStatus });
  };

  const handleSaveNotes = async (taskId: string) => {
    await onTaskUpdated(taskId, { personal_notes: tempNotes });
    setEditingNotesTaskId(null);
  };

  const handleSaveReminder = async (taskId: string) => {
    await onTaskUpdated(taskId, { user_reminder: tempReminder });
    setEditingReminderTaskId(null);
  };

  const handleChangePriority = async (taskId: string, priority: Priority) => {
    await onTaskUpdated(taskId, { priority });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Top Header & Metrics Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Interactive Action Plan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evidence-backed requirements converted into a structured preparation workflow.
            </p>
          </div>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Export:</span>
            <a
              href={api.getExportUrl(workspaceId, 'markdown')}
              download
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition font-medium text-[11px]"
            >
              Markdown
            </a>
            <a
              href={api.getExportUrl(workspaceId, 'csv')}
              download
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition font-medium text-[11px]"
            >
              CSV
            </a>
            <a
              href={api.getExportUrl(workspaceId, 'json')}
              download
              className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition font-medium text-[11px]"
            >
              JSON
            </a>
          </div>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Overall Progress */}
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">Overall Tasks Done</span>
              <span className="text-sky-600 dark:text-sky-400">
                {completedCount} / {requirements.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Mandatory Readiness Progress */}
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">Mandatory Prerequisites</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {mandatoryCompleted} / {mandatoryCount} ({mandatoryProgressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${mandatoryProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            All ({requirements.length})
          </button>
          <button
            onClick={() => setFilterStatus('incomplete')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              filterStatus === 'incomplete'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Incomplete ({requirements.length - completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('mandatory')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              filterStatus === 'mandatory'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Mandatory ({mandatoryCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              filterStatus === 'completed'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

      </div>

      {/* Categorized Task List Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {CATEGORIES.map((cat) => {
          const catTasks = filteredRequirements.filter((r) => r.category === cat);
          if (catTasks.length === 0) return null;

          return (
            <div key={cat} className="space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {cat} ({catTasks.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  {catTasks.filter((t) => t.status === 'Completed').length} of {catTasks.length} done
                </span>
              </div>

              <div className="space-y-2">
                {catTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isExpanded = expandedTask === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-3.5 transition-all ${
                        isCompleted
                          ? 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-80'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 shadow-sm hover:border-sky-300 dark:hover:border-sky-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTaskCompletion(task)}
                          title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                          className="mt-0.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition shrink-0"
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {/* Title & Plain Language */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`font-semibold text-sm ${
                                isCompleted
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>

                            {task.is_mandatory ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                Mandatory
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                Optional
                              </span>
                            )}

                            {task.deadline && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                                <Clock className="w-3 h-3" />
                                Due: {task.deadline}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {task.plain_language}
                          </p>

                          {/* Quick Citation Badge & Expansion trigger */}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <ProoflineCard
                              citation={task.citation}
                              onNavigateToCitation={onNavigateToCitation}
                              compact
                            />

                            {task.dependencies && task.dependencies.length > 0 && (
                              <span className="text-[10px] text-slate-400 italic">
                                Prerequisites: {task.dependencies.join(', ')}
                              </span>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                              {onOpenTranslator && (
                                <button
                                  onClick={() => onOpenTranslator(task.original_wording)}
                                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                                  title="Translate instruction into Hindi / Hinglish"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Translate
                                </button>
                              )}

                              <button
                                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                                title="Expand task details, notes & reminders"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Section (Notes, Reminders, Full Citation, Priority) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg text-xs">
                          {/* Full Proofline Citation */}
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block mb-1">
                              Verbatim Document Quote & Verification:
                            </span>
                            <ProoflineCard
                              citation={task.citation}
                              onNavigateToCitation={onNavigateToCitation}
                            />
                          </div>

                          {/* Personal Notes */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
                                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                                Personal Notes
                              </span>
                              {editingNotesTaskId !== task.id && (
                                <button
                                  onClick={() => {
                                    setEditingNotesTaskId(task.id);
                                    setTempNotes(task.personal_notes || '');
                                  }}
                                  className="text-sky-600 dark:text-sky-400 text-[11px] hover:underline"
                                >
                                  {task.personal_notes ? 'Edit note' : '+ Add note'}
                                </button>
                              )}
                            </div>

                            {editingNotesTaskId === task.id ? (
                              <div className="space-y-1.5">
                                <textarea
                                  value={tempNotes}
                                  onChange={(e) => setTempNotes(e.target.value)}
                                  placeholder="e.g. Requested transcript from Registrar on Monday..."
                                  rows={2}
                                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingNotesTaskId(null)}
                                    className="px-2 py-0.5 rounded text-[11px] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveNotes(task.id)}
                                    className="px-2.5 py-0.5 rounded text-[11px] bg-sky-600 text-white font-medium hover:bg-sky-700"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              task.personal_notes && (
                                <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 italic">
                                  "{task.personal_notes}"
                                </p>
                              )
                            )}
                          </div>

                          {/* Reminder & Priority Row */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                            {/* Reminder */}
                            <div className="flex items-center gap-1.5">
                              <Bell className="w-3.5 h-3.5 text-sky-500" />
                              {editingReminderTaskId === task.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="date"
                                    value={tempReminder}
                                    onChange={(e) => setTempReminder(e.target.value)}
                                    className="p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[11px]"
                                  />
                                  <button
                                    onClick={() => handleSaveReminder(task.id)}
                                    className="px-2 py-0.5 bg-sky-600 text-white rounded text-[11px]"
                                  >
                                    Set
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingReminderTaskId(task.id);
                                    setTempReminder(task.user_reminder || '');
                                  }}
                                  className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-sky-600 underline"
                                >
                                  {task.user_reminder ? `Reminder: ${task.user_reminder}` : '+ Set reminder'}
                                </button>
                              )}
                            </div>

                            {/* Priority Select */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">Priority:</span>
                              {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => handleChangePriority(task.id, p)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                    task.priority === p
                                      ? 'bg-slate-900 text-white dark:bg-sky-500'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
