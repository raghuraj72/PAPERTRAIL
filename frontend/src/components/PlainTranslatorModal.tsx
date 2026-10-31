import React, { useState, useEffect } from 'react';
import { X, Languages, Sparkles, Quote, Copy, Check } from 'lucide-react';
import { api } from '../services/api';

interface PlainTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
}

export const PlainTranslatorModal: React.FC<PlainTranslatorModalProps> = ({
  isOpen,
  onClose,
  initialText
}) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [targetLang, setTargetLang] = useState<'simple_en' | 'hi' | 'hinglish'>('hi');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialText) {
      setSourceText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (isOpen && sourceText) {
      handleTranslate();
    }
  }, [isOpen, targetLang]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.translateText(sourceText, targetLang);
      setTranslatedText(res.translated_text);
      setNotes(res.notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Plain-Language Explainer & Translator
              </h3>
              <p className="text-xs text-slate-500">
                Simplifies complicated legalese while preserving mandatory conditions
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Language selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Style / Language:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setTargetLang('simple_en')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  targetLang === 'simple_en' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Simple English
              </button>
              <button
                onClick={() => setTargetLang('hi')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  targetLang === 'hi' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setTargetLang('hinglish')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  targetLang === 'hinglish' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>

          {/* Original Text */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Original Document Clause:
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed">
              "{sourceText}"
            </div>
          </div>

          {/* Simplified / Translated Result */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Clarified Translation:
              </label>
              {translatedText && (
                <button
                  onClick={handleCopy}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-slate-900 dark:text-white leading-relaxed min-h-[90px]">
              {isLoading ? (
                <span className="text-slate-400 italic">Simplifying and translating...</span>
              ) : (
                translatedText
              )}
            </div>

            {notes && (
              <p className="text-[11px] text-slate-400 italic mt-1.5">{notes}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-sky-500 text-xs font-semibold hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
