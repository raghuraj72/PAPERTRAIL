import React from 'react';
import {
  AlertTriangle,
  Scale,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Contradiction, ProoflineCitation } from '../types';
import { ProoflineCard } from './ProoflineCard';

interface ContradictionAlertsProps {
  contradictions: Contradiction[];
  onNavigateToCitation: (citation: ProoflineCitation) => void;
}

export const ContradictionAlerts: React.FC<ContradictionAlertsProps> = ({
  contradictions,
  onNavigateToCitation
}) => {
  if (!contradictions || contradictions.length === 0) {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
        <Scale className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>No contradictions or conflicting clauses detected across these document instructions.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            {contradictions.length} Potential Contradiction{contradictions.length > 1 ? 's' : ''} Detected
          </span>
        </div>
        <span className="text-[11px] text-rose-600 dark:text-rose-400 italic">
          Review both original clauses before finalizing your application
        </span>
      </div>

      <div className="space-y-3">
        {contradictions.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-850 border border-rose-200 dark:border-rose-900 rounded-xl p-4 shadow-sm space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {c.title}
                </h4>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                c.severity === 'critical'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
              }`}>
                {c.severity}
              </span>
            </div>

            {/* Side-by-side Dual Passages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Passage A */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block mb-1">
                  Clause A (Page {c.passage_a.page_number})
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed mb-2">
                  "{c.passage_a.exact_passage}"
                </p>
                <ProoflineCard
                  citation={c.passage_a}
                  onNavigateToCitation={onNavigateToCitation}
                  compact
                />
              </div>

              {/* Passage B */}
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                  Clause B (Page {c.passage_b.page_number})
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed mb-2">
                  "{c.passage_b.exact_passage}"
                </p>
                <ProoflineCard
                  citation={c.passage_b}
                  onNavigateToCitation={onNavigateToCitation}
                  compact
                />
              </div>
            </div>

            {/* Explanation & Suggested Action */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <p className="text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Discrepancy Analysis:</strong> {c.discrepancy_explanation}
              </p>
              <div className="p-2 rounded bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 text-amber-900 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span><strong>Recommended Action:</strong> {c.suggested_action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
