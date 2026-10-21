import React from 'react';
import type { SessionReport } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare,
  Share2,
  X
} from 'lucide-react';

interface SessionReportModalProps {
  report: SessionReport;
  onClose: () => void;
  onRestart: () => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  report,
  onClose,
  onRestart
}) => {
  const { t } = useTranslation();

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const copyToClipboard = () => {
    const text = `🎯 Performance Debrief - ${report.scenarioTitle}
Business Score: ${report.businessScore}%
English Score: ${report.englishScore}%
Duration: ${formatTime(report.durationSeconds)}
Objectives Completed: ${report.completedObjectives.length}

Executive Summary:
${report.executiveSummary}`;
    navigator.clipboard.writeText(text);
    alert('Report summary copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 bg-[#1C2331] border-[#2A344A] text-[#E2E8F0] shadow-black/80">
        {/* Top Header Badge */}
        <div className="p-6 border-b flex items-start justify-between bg-[#12161F] border-[#2A344A]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center text-[#38BDF8] shadow-md bg-[#1C2331] border-sky-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8]">
                {t('report.badge')}
              </span>
              <h2 className="text-xl font-bold text-[#E2E8F0]">{report.scenarioTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl transition-colors cursor-pointer text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A]">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">{t('report.businessScore')}</span>
              <div className="text-2xl font-black text-[#FBBF24] mt-1">
                {report.businessScore}%
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A]">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">{t('report.englishScore')}</span>
              <div className="text-2xl font-black mt-1 text-[#38BDF8]">
                {report.englishScore}%
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A]">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">{t('report.practiceTime')}</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-1 font-mono text-[#E2E8F0]">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                {formatTime(report.durationSeconds)}
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A]">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">{t('report.totalTurns')}</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-1 font-mono text-[#E2E8F0]">
                <MessageSquare className="w-4 h-4 text-[#94A3B8]" />
                {report.totalMessages}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="border rounded-2xl p-5 space-y-2 bg-[#12161F] border-[#2A344A]">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#38BDF8]">
              <Award className="w-4 h-4 text-[#38BDF8]" />
              {t('report.executiveEval')}
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-[#E2E8F0]">
              {report.executiveSummary}
            </p>
          </div>

          {/* Objectives Achieved */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0]">
              {t('report.checklist')} ({report.completedObjectives.length})
            </h4>
            <div className="space-y-1.5">
              {report.completedObjectives.map((desc, i) => (
                <div
                  key={'comp-' + i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-[#12161F] border-[#2A344A] text-[#E2E8F0]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{desc}</span>
                </div>
              ))}
              {report.pendingObjectives.map((desc, i) => (
                <div
                  key={'pend-' + i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-[#12161F]/40 border-[#2A344A]/60 text-[#94A3B8]"
                >
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>{desc} ({t('call.pending')})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-4 space-y-2 bg-[#12161F] border-[#2A344A]">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E2E8F0]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('report.strengths')}
              </h5>
              <ul className="space-y-1.5 text-xs list-disc list-inside text-[#94A3B8]">
                {report.keyStrengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="border rounded-2xl p-4 space-y-2 bg-[#12161F] border-[#2A344A]">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E2E8F0]">
                <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8]" /> {t('report.improvements')}
              </h5>
              <ul className="space-y-1.5 text-xs list-disc list-inside text-[#94A3B8]">
                {report.areasForImprovement.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Better Ways to Say It (Native Coaching) */}
          {report.suggestedPhrases.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E2E8F0]">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                {t('report.phrasingUpgrades')}
              </h4>
              <div className="space-y-2">
                {report.suggestedPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border space-y-1.5 bg-[#12161F] border-[#2A344A]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                      <span className="line-through text-[#94A3B8]">"{phrase.original}"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8] hidden sm:block shrink-0" />
                      <span className="font-semibold text-[#E2E8F0]">"{phrase.better}"</span>
                    </div>
                    <p className="text-[11px] italic text-[#94A3B8]">{phrase.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-6 border-t border-[#2A344A] bg-[#12161F]">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer bg-[#1C2331] hover:bg-[#202838] border-[#2A344A] text-[#E2E8F0]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('report.share')}</span>
          </button>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer border-[#2A344A] hover:bg-[#1C2331] text-[#E2E8F0] text-center"
            >
              {t('report.again')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 shadow-sky-950/40 text-center"
            >
              {t('report.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
