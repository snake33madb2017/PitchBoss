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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80">
        {/* Top Header Badge */}
        <div className="p-6 border-b flex items-start justify-between bg-zinc-950 border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center text-amber-400 shadow-md bg-zinc-900 border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                {t('report.badge')}
              </span>
              <h2 className="text-xl font-bold text-white">{report.scenarioTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-2xl p-4 text-center bg-zinc-950 border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">{t('report.businessScore')}</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {report.businessScore}%
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-zinc-950 border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">{t('report.englishScore')}</span>
              <div className="text-2xl font-black mt-1 text-zinc-100">
                {report.englishScore}%
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-zinc-950 border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">{t('report.practiceTime')}</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-1 font-mono text-zinc-300">
                <Clock className="w-4 h-4 text-zinc-500" />
                {formatTime(report.durationSeconds)}
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-zinc-950 border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">{t('report.totalTurns')}</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-1 font-mono text-zinc-300">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                {report.totalMessages}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="border rounded-2xl p-5 space-y-2 bg-zinc-950 border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-300">
              <Award className="w-4 h-4 text-amber-400" />
              {t('report.executiveEval')}
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">
              {report.executiveSummary}
            </p>
          </div>

          {/* Objectives Achieved */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {t('report.checklist')} ({report.completedObjectives.length})
            </h4>
            <div className="space-y-1.5">
              {report.completedObjectives.map((desc, i) => (
                <div
                  key={'comp-' + i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-zinc-950 border-zinc-800 text-zinc-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{desc}</span>
                </div>
              ))}
              {report.pendingObjectives.map((desc, i) => (
                <div
                  key={'pend-' + i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-zinc-950/40 border-zinc-800/60 text-zinc-500"
                >
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>{desc} ({t('call.pending')})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-4 space-y-2 bg-zinc-950 border-zinc-800">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> {t('report.strengths')}
              </h5>
              <ul className="space-y-1.5 text-xs list-disc list-inside text-zinc-400">
                {report.keyStrengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="border rounded-2xl p-4 space-y-2 bg-zinc-950 border-zinc-800">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" /> {t('report.improvements')}
              </h5>
              <ul className="space-y-1.5 text-xs list-disc list-inside text-zinc-400">
                {report.areasForImprovement.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Better Ways to Say It (Native Coaching) */}
          {report.suggestedPhrases.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t('report.phrasingUpgrades')}
              </h4>
              <div className="space-y-2">
                {report.suggestedPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border space-y-1.5 bg-zinc-950 border-zinc-800"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                      <span className="line-through text-zinc-500">"{phrase.original}"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 hidden sm:block shrink-0" />
                      <span className="font-semibold text-zinc-100">"{phrase.better}"</span>
                    </div>
                    <p className="text-[11px] italic text-zinc-400">{phrase.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-6 border-t border-zinc-800 bg-zinc-950">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('report.share')}</span>
          </button>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              onClick={onRestart}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer border-zinc-700 hover:bg-zinc-800 text-white text-center"
            >
              {t('report.again')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer bg-zinc-100 hover:bg-white text-zinc-950 shadow-black/40 text-center"
            >
              {t('report.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
