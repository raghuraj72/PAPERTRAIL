import React from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookmarkCheck
} from 'lucide-react';
import { ExtractedDate, ProoflineCitation } from '../types';
import { ProoflineCard } from './ProoflineCard';

interface DeadlineTimelineProps {
  dates: ExtractedDate[];
  onNavigateToCitation: (citation: ProoflineCitation) => void;
}

export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({
  dates,
  onNavigateToCitation
}) => {
  if (!dates || dates.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
        No dates or deadlines extracted from current documents.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Deadline & Milestone Timeline
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Chronological breakdown of stated dates, cutoff deadlines, and review periods extracted from the document text.
        </p>
      </div>

      {/* Timeline entries */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-200 dark:before:bg-sky-900">
        {dates.map((d, idx) => (
          <div key={d.id} className="relative group">
            {/* Timeline dot */}
            <div className={`absolute -left-6 sm:-left-8 top-1.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
              d.is_critical
                ? 'border-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60'
                : 'border-sky-500 ring-4 ring-sky-100 dark:ring-sky-950/60'
            }`} />

            <div className="bg-slate-50/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-sky-400 transition space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-500" />
                    {d.date_text}
                  </span>
                  {d.is_critical && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                      Final Cutoff
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 self-start sm:self-auto">
                  Type: {d.date_type}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300">
                {d.event_description}
              </p>

              {/* Source Proofline */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Page {d.citation.page_number} · {d.citation.section_heading}
                </span>
                <button
                  onClick={() => onNavigateToCitation(d.citation)}
                  className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
                >
                  View in document <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
