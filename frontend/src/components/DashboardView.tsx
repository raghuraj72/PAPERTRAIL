import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Volume2,
  VolumeX,
  ArrowRight,
  Calculator,
  Layers,
  FileText,
  FileCheck2,
  Scale,
  ExternalLink,
  Flame,
  CheckSquare,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import {
  Workspace,
  Requirement,
  Contradiction,
  ProoflineCitation
} from '../types';

interface DashboardViewProps {
  workspace: Workspace;
  onNavigateToCitation: (citation: ProoflineCitation) => void;
  onOpenReadiness: () => void;
  onGoToTab: (tab: 'workspace' | 'graph' | 'compare' | 'timeline') => void;
  onTaskUpdated: (taskId: string, updates: any) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  onNavigateToCitation,
  onOpenReadiness,
  onGoToTab,
  onTaskUpdated
}) => {
  // Live Countdown state
  const [selectedDeadline, setSelectedDeadline] = useState<'oct15' | 'nov1'>('oct15');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Eligibility Calculator state
  const [userGPA, setUserGPA] = useState<number>(3.4);
  const [studentStatus, setStudentStatus] = useState<'undergrad' | 'final_year' | 'postgrad'>('undergrad');
  const [enrollmentDocAge, setEnrollmentDocAge] = useState<number>(30); // days

  // Contradiction spotlight tab
  const [selectedContraIdx, setSelectedContraIdx] = useState<number>(0);

  // Confetti trigger
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Requirements metrics
  const requirements = workspace.combined_requirements;
  const completedCount = requirements.filter((r) => r.status === 'Completed').length;
  const totalCount = requirements.length;
  const mandatoryReqs = requirements.filter((r) => r.is_mandatory);
  const mandatoryCompleted = mandatoryReqs.filter((r) => r.status === 'Completed').length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const mandatoryPercent = mandatoryReqs.length ? Math.round((mandatoryCompleted / mandatoryReqs.length) * 100) : 0;

  // Contradictions
  const contradictions = workspace.combined_contradictions;
  const activeContra = contradictions[selectedContraIdx] || contradictions[0];

  // Target Deadlines for countdown
  useEffect(() => {
    const targetDate = selectedDeadline === 'oct15'
      ? new Date('2026-10-15T23:59:59-05:00').getTime()
      : new Date('2026-11-01T17:00:00-05:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedDeadline]);

  // Audio briefing function using Web Speech API
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const briefingText = `Executive briefing for ${workspace.name}. There are ${totalCount} extracted requirements across six stages, with ${mandatoryReqs.length} mandatory conditions. Key qualifications include a minimum cumulative GPA of 3.2, full-time undergraduate enrollment proof issued within 60 days, official transcripts, and two mentor recommendation letters. Warning: two critical contradictions were detected, including conflicting deadlines of October 15 versus November 1.`;
    
    const utterance = new SpeechSynthesisUtterance(briefingText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Eligibility evaluation calculations
  const gpaPass = userGPA >= 3.2;
  const statusPass = studentStatus === 'undergrad' || studentStatus === 'final_year';
  const docAgePass = enrollmentDocAge <= 60;
  const overallEligible = gpaPass && statusPass && docAgePass;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. HERO AMBIENT COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 text-white p-6 sm:p-8 border border-slate-700/60 shadow-xl">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur">
                <Brain className="w-3.5 h-3.5" />
                Proofline Intelligence Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Verifiable Citations
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Clarity Command Center
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transforming complex instructions into verifiable action. Monitor prerequisite fulfillment, resolve conflicting clauses, and verify evidence before submitting.
            </p>

            {/* Interactive Action Launcher Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onGoToTab('workspace')}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-md shadow-sky-500/20 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Open 3-Panel Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleToggleSpeech}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-2 ${
                  isSpeaking
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                    : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
                }`}
                title="Listen to 30-second executive audio summary"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Stop Audio Briefing' : 'Listen to Briefing'}</span>
              </button>

              <button
                onClick={onOpenReadiness}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Run Pre-Submission Audit</span>
              </button>
            </div>
          </div>

          {/* Radial Readiness Score Visual Widget */}
          <div className="shrink-0 flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-sky-400 transition-all duration-700 ease-out"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{progressPercent}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Prepared
                </span>
              </div>
            </div>

            <div className="ml-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                Readiness State
              </span>
              <h4 className="text-sm font-bold text-white">
                {progressPercent === 100 ? 'Ready for Review' : `${completedCount} of ${totalCount} Done`}
              </h4>
              <p className="text-[11px] text-slate-300">
                {mandatoryCompleted} of {mandatoryReqs.length} mandatory criteria verified
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. THREE CORE INTERACTIVE WIDGETS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* WIDGET A: Interactive Deadline Countdown Clock */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Deadline Countdown
              </h3>
            </div>

            {/* Toggle between the 2 conflicting dates */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
              <button
                onClick={() => setSelectedDeadline('oct15')}
                className={`px-2 py-0.5 rounded-md transition ${
                  selectedDeadline === 'oct15'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Oct 15 (Page 1)
              </button>
              <button
                onClick={() => setSelectedDeadline('nov1')}
                className={`px-2 py-0.5 rounded-md transition ${
                  selectedDeadline === 'nov1'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Nov 1 (Addendum)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block font-mono">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Days
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block font-mono">
                {timeLeft.hours}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Hours
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block font-mono">
                {timeLeft.minutes}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Mins
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 block font-mono">
                {timeLeft.seconds}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Secs
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
            {selectedDeadline === 'oct15'
              ? 'Targeting primary cutoff: October 15, 2026 at 11:59 PM EST (Stated on Page 1).'
              : 'Targeting maintenance extension cutoff: November 1, 2026 at 5:00 PM EST (Section 5.3).'}
          </p>
        </div>

        {/* WIDGET B: Interactive "Am I Eligible?" Calculator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Eligibility Simulator
              </h3>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              overallEligible
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {overallEligible ? 'QUALIFIES' : 'CRITERIA MISMATCH'}
            </span>
          </div>

          {/* Interactive controls */}
          <div className="space-y-3 text-xs">
            {/* GPA Slider */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Cumulative GPA: {userGPA.toFixed(2)}</span>
                <span className={`text-[11px] ${gpaPass ? 'text-emerald-600' : 'text-rose-600 font-bold'}`}>
                  {gpaPass ? '✓ Passes 3.2 Cutoff' : '✗ Below 3.2 Minimum'}
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="4.0"
                step="0.05"
                value={userGPA}
                onChange={(e) => setUserGPA(parseFloat(e.target.value))}
                className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Student Enrollment Status */}
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Degree Level:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'undergrad', label: 'Undergrad' },
                  { id: 'final_year', label: 'Final Year' },
                  { id: 'postgrad', label: 'Graduate' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStudentStatus(s.id as any)}
                    className={`py-1 rounded-lg text-[11px] font-medium transition ${
                      studentStatus === s.id
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note on Exemption */}
            {studentStatus === 'final_year' && (
              <p className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                ★ <strong>Dean's Exemption Clause:</strong> You are eligible, but you must attach a signed Provisional Clearance Letter.
              </p>
            )}
          </div>
        </div>

        {/* WIDGET C: Document Bureaucracy & Complexity Index */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Bureaucracy Index
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
              HIGH DENSITY
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <span>Mandatory Requirement Ratio</span>
                <span className="font-bold text-slate-900 dark:text-white">88%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '88%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                <span>Reading Complexity</span>
                <span className="font-bold text-slate-900 dark:text-white">Grade 14 (College Level)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Ambiguity Clashes:</span>
              <span className="font-bold text-rose-600">2 Inconsistencies Detected</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. DISCREPANCY & CONTRADICTION SPOTLIGHT RADAR */}
      {contradictions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  Contradiction Radar Spotlight
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Dual-Passage Evidence
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PAPERTRAIL detects mutually conflicting clauses and surfaces both verbatim excerpts instead of deciding silently.
                </p>
              </div>
            </div>

            {/* Tab switch between contradiction 1 and 2 */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              {contradictions.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContraIdx(idx)}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedContraIdx === idx
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Conflict {idx + 1}: {c.topic.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Active Contradiction Card */}
          {activeContra && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeContra.title}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                  {activeContra.severity}
                </span>
              </div>

              {/* Dual Passages Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Passage A */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-sky-600 dark:text-sky-400">
                    <span>CLAUSE A: Page {activeContra.passage_a.page_number}</span>
                    <span className="font-normal text-slate-400">{activeContra.passage_a.section_heading}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 italic font-serif leading-relaxed">
                    "{activeContra.passage_a.exact_passage}"
                  </p>
                  <button
                    onClick={() => onNavigateToCitation(activeContra.passage_a)}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Highlight on Page {activeContra.passage_a.page_number}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Passage B */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <span>CLAUSE B: Page {activeContra.passage_b.page_number}</span>
                    <span className="font-normal text-slate-400">{activeContra.passage_b.section_heading}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 italic font-serif leading-relaxed">
                    "{activeContra.passage_b.exact_passage}"
                  </p>
                  <button
                    onClick={() => onNavigateToCitation(activeContra.passage_b)}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Highlight on Page {activeContra.passage_b.page_number}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Discrepancy Advice Box */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs space-y-1">
                <p className="text-slate-800 dark:text-slate-200">
                  <strong>Analysis:</strong> {activeContra.discrepancy_explanation}
                </p>
                <p className="text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                  💡 <strong>Actionable Guidance:</strong> {activeContra.suggested_action}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. WORKFLOW LIFECYCLE PROGRESS CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            6-Stage Preparation Pipeline
          </h3>
          <button
            onClick={() => onGoToTab('graph')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>View Dependency Graph</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { stage: 'Eligibility Verification', count: 3, icon: ShieldCheck, color: 'text-sky-500' },
            { stage: 'Before Applying', count: 2, icon: Bookmark, color: 'text-indigo-500' },
            { stage: 'Documents to Prepare', count: 4, icon: FileText, color: 'text-teal-500' },
            { stage: 'Application Completion', count: 3, icon: CheckSquare, color: 'text-purple-500' },
            { stage: 'Final Review', count: 2, icon: Scale, color: 'text-amber-500' },
            { stage: 'Submission', count: 1, icon: ArrowRight, color: 'text-emerald-500' }
          ].map((item, idx) => {
            const Icon = item.icon;
            const stageTasks = requirements.filter((r) => r.category === item.stage);
            const done = stageTasks.filter((r) => r.status === 'Completed').length;
            const pct = stageTasks.length ? Math.round((done / stageTasks.length) * 100) : 0;

            return (
              <div
                key={item.stage}
                onClick={() => onGoToTab('workspace')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs hover:border-sky-400 cursor-pointer transition flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">0{idx + 1}</span>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {item.stage}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {done} of {stageTasks.length} Done
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
