import React, { useState } from 'react';
import {
  Workflow,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Requirement, RequirementCategory, ProoflineCitation } from '../types';
import { ProoflineCard } from './ProoflineCard';

interface RequirementGraphProps {
  requirements: Requirement[];
  onNavigateToCitation: (citation: ProoflineCitation) => void;
}

const ORDERED_STAGES: { category: RequirementCategory; label: string; desc: string }[] = [
  {
    category: 'Eligibility Verification',
    label: '1. Eligibility Check',
    desc: 'Confirm prerequisite criteria (GPA, enrollment, citizenship) before applying'
  },
  {
    category: 'Documents to Prepare',
    label: '2. Document Dossier',
    desc: 'Gather transcripts, IDs, recommendation letters, and certificates'
  },
  {
    category: 'Before Applying',
    label: '3. Pre-Application',
    desc: 'Review official notice, instructions, and register portal credentials'
  },
  {
    category: 'Application Completion',
    label: '4. Form & Essays',
    desc: 'Complete questionnaire fields, Statement of Purpose, and portfolio links'
  },
  {
    category: 'Final Review',
    label: '5. Final Verification',
    desc: 'Review fee payments, check file readability, and declaration'
  },
  {
    category: 'Submission',
    label: '6. Official Submission',
    desc: 'Transmit materials before deadline and archive confirmation receipt'
  }
];

export const RequirementGraph: React.FC<RequirementGraphProps> = ({
  requirements,
  onNavigateToCitation
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RequirementCategory>('Eligibility Verification');
  const [selectedTask, setSelectedTask] = useState<Requirement | null>(null);

  const selectedTasks = requirements.filter((r) => r.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Workflow className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Interactive Requirement Workflow Graph
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visual representation of process dependencies from eligibility to final submission cutoff. Click any node to inspect evidence.
        </p>
      </div>

      {/* Visual Progression Nodes (Horizontal Sequence) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
        {ORDERED_STAGES.map((stage, idx) => {
          const isSelected = selectedCategory === stage.category;
          const stageTasks = requirements.filter((r) => r.category === stage.category);
          const completedCount = stageTasks.filter((r) => r.status === 'Completed').length;

          return (
            <button
              key={stage.category}
              onClick={() => {
                setSelectedCategory(stage.category);
                setSelectedTask(null);
              }}
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between min-h-[90px] ${
                isSelected
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 dark:border-sky-400 shadow-md ring-1 ring-sky-500'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-sky-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 block mb-0.5">
                  Stage {idx + 1}
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {stage.label}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>{stageTasks.length} tasks</span>
                {completedCount === stageTasks.length && stageTasks.length > 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className="text-[10px] font-mono">{completedCount}/{stageTasks.length}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Details & Evidence Inspector */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-850/50 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              {selectedCategory}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {ORDERED_STAGES.find((s) => s.category === selectedCategory)?.desc}
            </span>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            {selectedTasks.length} Extracted Requirements
          </span>
        </div>

        {/* Task Cards in this Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-2 ${
                selectedTask?.id === t.id
                  ? 'bg-white dark:bg-slate-800 border-sky-500 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {t.title}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  t.is_mandatory ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.is_mandatory ? 'Mandatory' : 'Optional'}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                {t.plain_language}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">
                  Page {t.citation.page_number} ({t.citation.section_heading})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToCitation(t.citation);
                  }}
                  className="text-sky-600 hover:underline flex items-center gap-0.5"
                >
                  View quote <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Task Deep Evidence Inspector */}
        {selectedTask && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400 block">
              Evidence Grounding for "{selectedTask.title}"
            </span>
            <ProoflineCard
              citation={selectedTask.citation}
              onNavigateToCitation={onNavigateToCitation}
            />
          </div>
        )}
      </div>

    </div>
  );
};
