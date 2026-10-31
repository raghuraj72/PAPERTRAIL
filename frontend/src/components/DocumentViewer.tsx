import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  ListTree,
  FileText,
  Highlighter,
  ExternalLink,
  Layers
} from 'lucide-react';
import { DocumentParsed, ProoflineCitation } from '../types';
import { api } from '../services/api';

interface DocumentViewerProps {
  document: DocumentParsed;
  workspaceId: string;
  activeCitation: ProoflineCitation | null;
  onClearActiveCitation?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  workspaceId,
  activeCitation,
  onClearActiveCitation
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTOC, setShowTOC] = useState<boolean>(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Jump to page if activeCitation changes
  useEffect(() => {
    if (activeCitation && activeCitation.page_number) {
      setCurrentPage(activeCitation.page_number);
    }
  }, [activeCitation]);

  const totalPages = document.page_count || Object.keys(document.pages_text).length || 1;
  const rawPageText = document.pages_text[currentPage] || 'No text extracted for this page.';

  // Highlight helper: highlight active citation quote and/or search query
  const renderHighlightedContent = () => {
    const highlightTarget = activeCitation?.exact_passage?.trim();
    const query = searchQuery.trim().toLowerCase();

    // Split page by paragraphs
    const paragraphs = rawPageText.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      const isCitationMatch =
        highlightTarget &&
        activeCitation?.page_number === currentPage &&
        para.toLowerCase().includes(highlightTarget.toLowerCase().slice(0, 40));

      let content: React.ReactNode = para;

      // Highlight search query if active
      if (query && para.toLowerCase().includes(query)) {
        const parts = para.split(new RegExp(`(${query})`, 'gi'));
        content = parts.map((part, i) =>
          part.toLowerCase() === query ? (
            <mark key={i} className="bg-amber-300 dark:bg-amber-500/50 text-slate-900 dark:text-white rounded px-0.5 font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        );
      }

      return (
        <div
          key={pIdx}
          className={`mb-4 leading-relaxed transition-colors ${
            isCitationMatch
              ? 'proofline-highlight bg-sky-100/70 dark:bg-sky-950/40 p-3 rounded-lg border-l-4 border-sky-500 shadow-sm'
              : ''
          }`}
        >
          {isCitationMatch && (
            <div className="flex items-center justify-between text-[11px] font-semibold text-sky-800 dark:text-sky-300 mb-1.5 pb-1 border-b border-sky-200 dark:border-sky-800">
              <span className="flex items-center gap-1">
                <Highlighter className="w-3.5 h-3.5" />
                Proofline Target Passage ({activeCitation?.section_heading})
              </span>
              {onClearActiveCitation && (
                <button
                  onClick={onClearActiveCitation}
                  className="text-slate-400 hover:text-slate-600 text-[10px] underline"
                >
                  Dismiss highlight
                </button>
              )}
            </div>
          )}
          <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap font-sans">
            {content}
          </p>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Top Document Header Toolbar */}
      <div className="p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-850">
        
        {/* Document Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {document.document_title || document.filename}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              {document.document_type} · {(document.file_size_bytes / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>

        {/* Page Nav & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* TOC Toggle */}
          {document.sections && document.sections.length > 0 && (
            <button
              onClick={() => setShowTOC(!showTOC)}
              title="Table of Contents"
              className={`p-1.5 rounded-lg border text-xs transition ${
                showTOC
                  ? 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListTree className="w-4 h-4" />
            </button>
          )}

          {/* Page Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-700 dark:text-slate-300 text-[11px]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Download Raw File */}
          <a
            href={api.getDocumentFileUrl(workspaceId, document.id)}
            download={document.filename}
            title="Download Document"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Search Bar Subtoolbar */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within page text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {activeCitation && (
          <div className="flex items-center gap-1.5 text-[11px] text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 font-medium">
            <span>Viewing Proofline Citation (Page {activeCitation.page_number})</span>
          </div>
        )}
      </div>

      {/* Main Content Area (with optional TOC drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sections Sidebar (TOC) */}
        {showTOC && (
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850 p-3 overflow-y-auto shrink-0 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              Document Sections
            </h4>
            <div className="space-y-1">
              {document.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setCurrentPage(sec.page_number);
                    setShowTOC(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded transition truncate block ${
                    currentPage === sec.page_number
                      ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mr-1.5">
                    P{sec.page_number}
                  </span>
                  {sec.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Page Text Document Container */}
        <div
          ref={contentContainerRef}
          className="flex-1 p-6 overflow-y-auto bg-slate-50/40 dark:bg-slate-900/60 max-w-full font-serif"
        >
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-6 text-xs text-slate-400 font-mono">
              <span>{document.filename}</span>
              <span>PAGE {currentPage} OF {totalPages}</span>
            </div>

            {renderHighlightedContent()}
          </div>
        </div>

      </div>
    </div>
  );
};
