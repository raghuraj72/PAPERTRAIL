import React, { useState } from 'react';
import {
  GitCompare,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DocumentParsed, DocumentComparisonResult } from '../types';
import { api } from '../services/api';

interface DocumentComparatorProps {
  workspaceId: string;
  documents: DocumentParsed[];
}

export const DocumentComparator: React.FC<DocumentComparatorProps> = ({
  workspaceId,
  documents
}) => {
  const [docAId, setDocAId] = useState<string>(documents[0]?.id || '');
  const [docBId, setDocBId] = useState<string>(documents[1]?.id || documents[0]?.id || '');
  const [result, setResult] = useState<DocumentComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!docAId || !docBId) {
      setErrorMsg('Please select two documents to compare.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const data = await api.compareDocuments(workspaceId, docAId, docBId);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (documents.length < 2) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs space-y-3">
        <GitCompare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
          Document Comparison Requires At Least Two Documents
        </h4>
        <p className="text-slate-500 max-w-md mx-auto">
          Upload two different versions (e.g. 2025 Notice vs 2026 Notice, or Draft Guidelines vs Final Notice) to detect added, removed, or modified requirements automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Document Version Diff Engine
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detect added requirements, removed clauses, altered deadlines, and changed fee terms between two documents.
        </p>
      </div>

      {/* Selector Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Base Version (Document A):
          </label>
          <select
            value={docAId}
            onChange={(e) => setDocAId(e.target.value)}
            className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename} ({d.document_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            New / Updated Version (Document B):
          </label>
          <select
            value={docBId}
            onChange={(e) => setDocBId(e.target.value)}
            className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename} ({d.document_type})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={isLoading}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Documents</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-4">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-900 dark:text-sky-200 font-medium">
            <strong>Diff Summary:</strong> {result.summary_of_changes}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Added Requirements */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-850 space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                Added Requirements ({result.added_requirements.length})
              </h5>
              {result.added_requirements.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No new requirements added.</p>
              ) : (
                <div className="space-y-2">
                  {result.added_requirements.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {r.title}
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {r.plain_language}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Removed Requirements */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-850 space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4" />
                Removed Requirements ({result.removed_requirements.length})
              </h5>
              {result.removed_requirements.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No requirements removed.</p>
              ) : (
                <div className="space-y-2">
                  {result.removed_requirements.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white block line-through">
                        {r.title}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.plain_language}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Changed Deadlines */}
          {result.changed_deadlines.length > 0 && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-850 space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Changed Deadlines & Dates ({result.changed_deadlines.length})
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {result.changed_deadlines.map((cd, idx) => (
                  <div key={idx} className="p-2 rounded bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                    <span className="font-bold text-slate-900 dark:text-white block">{cd.date}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{cd.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
