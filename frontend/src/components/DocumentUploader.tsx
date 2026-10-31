import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Loader2,
  FileType
} from 'lucide-react';

interface DocumentUploaderProps {
  onUpload: (file: File) => Promise<void>;
  onLoadDemo: () => void;
  isLoading: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  onLoadDemo,
  isLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

  const validateAndProcess = async (file: File) => {
    setErrorMsg(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setErrorMsg(`Unsupported file type '${ext}'. Please upload a PDF, DOCX, TXT, or Image.`);
      return;
    }
    if (file.size > maxSizeBytes) {
      setErrorMsg(`File size exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    try {
      setUploadStage('1. Uploading file...');
      setTimeout(() => setUploadStage('2. Parsing layout & sections...'), 400);
      setTimeout(() => setUploadStage('3. Extracting requirements & dates...'), 900);
      setTimeout(() => setUploadStage('4. Grounding Proofline citations...'), 1400);
      await onUpload(file);
      setUploadStage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
      setUploadStage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Upload Any Document to Clarify
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Turn college notices, scholarship guidelines, job requirements, or government forms into interactive, evidence-backed action plans.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-sky-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
        } ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
          className="hidden"
        />

        {isLoading ? (
          <div className="py-6 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {uploadStage || 'Analyzing document...'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Extracting sections, requirements, and grounding verifiable Prooflines
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="h-14 w-14 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7 stroke-[1.8]" />
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              <span className="text-sky-600 dark:text-sky-400 font-semibold underline">Click to choose a file</span> or drag and drop here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, DOCX, TXT, PNG, or JPG (up to 25 MB)
            </p>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Privacy guarantee banner & Demo launcher */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Privacy-first: Local grounded extraction. Your documents remain private on your machine.</span>
        </div>

        <button
          onClick={onLoadDemo}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800/80 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Or load synthetic demo challenge</span>
        </button>
      </div>
    </div>
  );
};
