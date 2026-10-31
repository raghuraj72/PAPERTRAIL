import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Quote
} from 'lucide-react';
import { ProoflineCitation } from '../types';

interface ProoflineCardProps {
  citation: ProoflineCitation;
  onNavigateToCitation?: (citation: ProoflineCitation) => void;
  compact?: boolean;
}

export const ProoflineCard: React.FC<ProoflineCardProps> = ({
  citation,
  onNavigateToCitation,
  compact = false
}) => {
  const confidencePercent = Math.round(citation.confidence * 100);

  if (compact) {
    return (
      <button
        onClick={() => onNavigateToCitation && onNavigateToCitation(citation)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition shadow-sm text-left group"
        title="Click to jump to exact passage in document"
      >
        <FileText className="w-3 h-3 shrink-0 text-sky-500" />
        <span className="font-semibold">Page {citation.page_number}</span>
        <span className="text-slate-400">·</span>
        <span className="truncate max-w-[120px]">{citation.section_heading}</span>
        <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-sky-200/80 dark:border-sky-900/50 rounded-xl p-3.5 transition-all hover:border-sky-300 dark:hover:border-sky-700 shadow-sm">
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <FileText className="w-3 h-3" />
            Page {citation.page_number}
          </span>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 truncate max-w-[150px]">
            {citation.section_heading}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          {citation.verified ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified ({confidencePercent}%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Partial match ({confidencePercent}%)
            </span>
          )}
        </div>
      </div>

      {/* Verbatim Supporting Passage Quote */}
      <div className="relative pl-3 my-2 border-l-2 border-sky-500 dark:border-sky-400 text-xs text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed">
        <Quote className="w-3 h-3 text-sky-400/50 absolute -top-1 -left-2" />
        "{citation.exact_passage}"
      </div>

      {/* Open / Jump to Document Action */}
      {onNavigateToCitation && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 text-[10px]">Doc: {citation.document_name}</span>
          <button
            onClick={() => onNavigateToCitation(citation)}
            className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition"
          >
            <span>Jump to original page</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
