import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Loader2,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { ProoflineCitation, AskPapertrailResponse } from '../types';
import { ProoflineCard } from './ProoflineCard';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: ProoflineCitation[];
  confidence?: number;
  uncertaintyWarning?: string;
  suggestedQuestions?: string[];
  timestamp: string;
}

interface AskPapertrailAIProps {
  workspaceId: string;
  onNavigateToCitation: (citation: ProoflineCitation) => void;
}

const PRESET_QUESTIONS = [
  'What is the minimum GPA required to be eligible?',
  'Which documents are mandatory vs optional?',
  'What is the final application submission deadline?',
  'Is there an application fee, or has it been waived?',
  'Does this document contain conflicting instructions?'
];

export const AskPapertrailAI: React.FC<AskPapertrailAIProps> = ({
  workspaceId,
  onNavigateToCitation
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am PAPERTRAIL AI. Ask me anything about your uploaded document. Every answer I provide will be backed by clickable Proofline citations linking directly to the source text.',
      suggestedQuestions: PRESET_QUESTIONS.slice(0, 3),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response: AskPapertrailResponse = await api.askPapertrail(
        workspaceId,
        q,
        undefined,
        targetLanguage
      );

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        citations: response.citations,
        confidence: response.confidence,
        uncertaintyWarning: response.uncertainty_warning,
        suggestedQuestions: response.suggested_next_questions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error processing question: ${err.message || 'Unable to connect to assistant.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Header Toolbar */}
      <div className="p-3 sm:px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              Ask PAPERTRAIL AI
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Grounded RAG
              </span>
            </h4>
            <span className="text-[10px] text-slate-400">Every response linked to original source text</span>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 text-xs">
          <Languages className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as any)}
            className="text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {/* Sender & Timestamp */}
              <div className="flex items-center justify-between gap-2 mb-1 opacity-70 text-[10px]">
                <span className="font-semibold uppercase tracking-wider">
                  {msg.sender === 'user' ? 'You' : 'PAPERTRAIL Grounded AI'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Text content */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Uncertainty Warning if any */}
              {msg.uncertaintyWarning && (
                <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{msg.uncertaintyWarning}</span>
                </div>
              )}

              {/* Proofline Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">
                    <span>Evidence Citations ({msg.citations.length})</span>
                    {msg.confidence && (
                      <span className="font-normal normal-case">
                        Confidence: {Math.round(msg.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {msg.citations.map((cite) => (
                    <ProoflineCard
                      key={cite.id}
                      citation={cite}
                      onNavigateToCitation={onNavigateToCitation}
                    />
                  ))}
                </div>
              )}

              {/* Suggested Follow-ups */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                    Suggested Questions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {msg.suggestedQuestions.map((sq, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sq)}
                        className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-800 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-md px-2 py-0.5 transition"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-xs text-slate-400 italic">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            <span>Retrieving verified document passages...</span>
          </div>
        )}
      </div>

      {/* Preset Questions Chips */}
      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Quick:
        </span>
        {PRESET_QUESTIONS.map((pq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pq)}
            className="text-[10px] text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-0.5 shrink-0 transition"
          >
            {pq}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask anything about eligibility, deadlines, required docs..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 transition shadow-sm"
          title="Send Question"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
