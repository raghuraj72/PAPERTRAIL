import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Lock
} from 'lucide-react';
import { ReadinessReport, ProoflineCitation } from '../types';
import { api } from '../services/api';

interface ReadyToSubmitModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCitation?: (citation: ProoflineCitation) => void;
}

export const ReadyToSubmitModal: React.FC<ReadyToSubmitModalProps> = ({
  workspaceId,
  isOpen,
  onClose,
  onNavigateToCitation
}) => {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.getReadiness(workspaceId)
        .then((data) => setReport(data))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <FileCheck2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                READY TO SUBMIT?
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Pre-Submission Audit
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Honest review of prerequisites, checklist completion, contradictions, and deadlines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Evaluating workspace readiness metrics...
            </div>
          ) : report ? (
            <>
              {/* Readiness Score Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300 block mb-1">
                    Audit Status
                  </span>
                  <h4 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    {report.overall_status === 'READY_FOR_USER_REVIEW' && 'Ready for User Review'}
                    {report.overall_status === 'INCOMPLETE_TASKS' && 'Incomplete Mandatory Tasks'}
                    {report.overall_status === 'CONTRADICTIONS_DETECTED' && 'Contradictions Requiring Resolution'}
                    {report.overall_status === 'MORE_INFO_NEEDED' && 'Missing Administrative Details'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    {report.overall_status === 'READY_FOR_USER_REVIEW'
                      ? 'All mandatory requirements are satisfied. Please perform a final visual review before submitting.'
                      : 'Important items remain unfulfilled or ambiguous. Review the findings below before proceeding.'}
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full border-4 border-sky-400/40 bg-slate-800/80 shadow-inner">
                    <span className="text-2xl font-black text-sky-400">
                      {report.readiness_score}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    Readiness Score
                  </span>
                </div>
              </div>

              {/* Checklist Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">
                    {report.mandatory_completed}/{report.mandatory_total}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Mandatory Tasks
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">
                    {report.optional_completed}/{report.optional_total}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Optional Tasks
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className={`text-lg font-bold block ${
                    report.blocking_contradictions.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {report.blocking_contradictions.length}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Contradictions
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">
                    {report.unverified_citations_count}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Unverified Quotes
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {report.recommendations && report.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actionable Recommendations
                  </h5>
                  <div className="space-y-1.5">
                    {report.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-3 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Information Notice */}
              {report.missing_critical_info && report.missing_critical_info.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    Potentially Missing Document Details
                  </span>
                  <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-0.5">
                    {report.missing_critical_info.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 italic">
                <strong>Important Legal Notice:</strong> {report.disclaimer}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Never submit blindly · Verify every requirement
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-sky-500 font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
};
