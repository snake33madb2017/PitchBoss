import React, { useState, useEffect, useRef } from 'react';
import type { SessionReport } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { CloudSyncService } from '../services/cloudSyncService';
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
  Printer,
  Volume2,
  Play,
  Pause,
  X,
  MessageCircle,
  Check
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-submit report to backend so it registers in the manager's live team audit
  useEffect(() => {
    CloudSyncService.submitReport(report);
  }, [report]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const copyToClipboard = () => {
    const text = `[Performance Debrief] - ${report.scenarioTitle}
Business Score: ${report.businessScore}%
English Score: ${report.englishScore}%
Duration: ${formatTime(report.durationSeconds)}
Objectives Completed: ${report.completedObjectives.length}

Executive Summary:
${report.executiveSummary}`;
    navigator.clipboard.writeText(text);
    alert('Report summary copied to clipboard!');
  };

  const shareToWhatsApp = () => {
    const employee = CloudSyncService.getEmployeeName();
    const text = `*[REPORTE EJECUTIVO PITCHBOSS]* - ${report.scenarioTitle}
• Colaborador: *${employee}*
• Business Score: *${report.businessScore}%*
• Fluidez Inglés: *${report.englishScore}%*
• Duración: ${formatTime(report.durationSeconds)}
• Objetivos: ${report.completedObjectives.length} logrados

*[Resumen Ejecutivo]*
${report.executiveSummary}

*PitchBoss Enterprise*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleToggleAudio = () => {
    if (!report.audioRecordingUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(report.audioRecordingUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {
        setIsPlayingAudio(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden my-3 sm:my-8 animate-in fade-in zoom-in-95 bg-[#1C2331] border-[#2A344A] text-[#E2E8F0] shadow-black/80 print:border-none print:shadow-none print:text-black print:bg-white print:my-0">
        {/* Top Header Badge */}
        <div className="p-4 sm:p-6 border-b flex items-start justify-between bg-[#12161F] border-[#2A344A] print:bg-white print:border-b-2 print:border-zinc-300">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 mr-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center text-[#38BDF8] shadow-md bg-[#1C2331] border-sky-500/30 shrink-0 print:border-zinc-300 print:text-sky-600">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8] print:text-sky-600 block">
                {t('report.badge')}
              </span>
              <h2 className="text-base sm:text-xl font-bold text-[#E2E8F0] truncate print:text-zinc-900">{report.scenarioTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors cursor-pointer text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161F] shrink-0 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-[72vh] overflow-y-auto space-y-5 sm:space-y-6 print:max-h-none print:overflow-visible">
          {/* Employee Link Confirmation Badge */}
          {report.employeeName && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs print:border-zinc-300 print:bg-zinc-50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 print:hidden" />
                <span className="text-stone-300 truncate print:text-zinc-800">
                  Práctica de voz registrada para:{' '}
                  <strong className="text-white print:text-black font-bold">{report.employeeName}</strong>
                </span>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shrink-0 self-start sm:self-auto print:text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Reportado a Gerencia</span>
              </span>
            </div>
          )}

          {/* Audio Playback Player (When user audio recording is available) */}
          {report.audioRecordingUrl && (
            <div className="flex items-center justify-between p-4 rounded-2xl border bg-gradient-to-r from-sky-500/10 via-[#1C2331] to-sky-500/5 border-sky-500/30 print:hidden shadow-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAudio}
                  className="w-10 h-10 rounded-xl bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 flex items-center justify-center font-bold cursor-pointer transition-all shadow-md shadow-sky-950/40"
                  title={isPlayingAudio ? 'Pausar audio' : 'Reproducir mi intervención'}
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Grabación de audio de tu intervención</span>
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {isPlayingAudio ? 'Reproduciendo tu audio...' : 'Pulsa reproducir para escuchar tu pronunciación'}
                  </p>
                </div>
              </div>

              {isPlayingAudio && (
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-sky-400 rounded-full animate-bounce" />
                  <span className="w-1 h-5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-2 bg-sky-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>
          )}

          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold print:text-zinc-600">{t('report.businessScore')}</span>
              <div className="text-2xl font-black text-[#FBBF24] mt-1 print:text-amber-600">
                {report.businessScore}%
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold print:text-zinc-600">{t('report.englishScore')}</span>
              <div className="text-2xl font-black mt-1 text-[#38BDF8] print:text-sky-600">
                {report.englishScore}%
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold print:text-zinc-600">{t('report.practiceTime')}</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-1 font-mono text-[#E2E8F0] print:text-zinc-900">
                <Clock className="w-4 h-4 text-[#94A3B8] print:text-zinc-500" />
                {formatTime(report.durationSeconds)}
              </div>
            </div>

            <div className="border rounded-2xl p-4 text-center bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold print:text-zinc-600">{t('report.totalTurns')}</span>
              <div className="text-lg font-bold mt-1 flex items-center justify-center gap-1 font-mono text-[#E2E8F0] print:text-zinc-900">
                <MessageSquare className="w-4 h-4 text-[#94A3B8] print:text-zinc-500" />
                {report.totalMessages}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="border rounded-2xl p-5 space-y-2 bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#38BDF8] print:text-sky-600">
              <Award className="w-4 h-4 text-[#38BDF8] print:text-sky-600" />
              {t('report.executiveEval')}
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-[#E2E8F0] print:text-zinc-800">
              {report.executiveSummary}
            </p>
          </div>

          {/* Objectives Achieved */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E2E8F0] print:text-zinc-900">
              {t('report.checklist')} ({report.completedObjectives.length})
            </h4>
            <div className="space-y-1.5">
              {report.completedObjectives.map((desc, i) => (
                <div
                  key={'comp-' + i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-[#12161F] border-[#2A344A] text-[#E2E8F0] print:bg-emerald-50 print:border-emerald-200 print:text-emerald-950"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-600 shrink-0" />
                  <span>{desc}</span>
                </div>
              ))}
              {report.pendingObjectives.map((desc, i) => (
                <div
                  key={'pend-' + i}
                  className="flex items-center gap-2 p-2.5 rounded-xl border text-xs bg-[#12161F]/40 border-[#2A344A]/60 text-[#94A3B8] print:bg-zinc-50 print:border-zinc-200 print:text-zinc-600"
                >
                  <XCircle className="w-4 h-4 text-zinc-600 print:text-zinc-400 shrink-0" />
                  <span>{desc} ({t('call.pending')})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-2xl p-4 space-y-2 bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E2E8F0] print:text-zinc-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-600" /> {t('report.strengths')}
              </h5>
              <ul className="space-y-1.5 text-xs list-disc list-inside text-[#94A3B8] print:text-zinc-700">
                {report.keyStrengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="border rounded-2xl p-4 space-y-2 bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300">
              <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E2E8F0] print:text-zinc-900">
                <TrendingUp className="w-3.5 h-3.5 text-[#38BDF8] print:text-sky-600" /> {t('report.improvements')}
              </h5>
              <ul className="space-y-1.5 text-xs list-disc list-inside text-[#94A3B8] print:text-zinc-700">
                {report.areasForImprovement.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Better Ways to Say It (Native Coaching) */}
          {report.suggestedPhrases.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#E2E8F0] print:text-zinc-900">
                <Sparkles className="w-4 h-4 text-[#38BDF8] print:text-sky-600" />
                {t('report.phrasingUpgrades')}
              </h4>
              <div className="space-y-2">
                {report.suggestedPhrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border space-y-1.5 bg-[#12161F] border-[#2A344A] print:bg-zinc-50 print:border-zinc-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                      <span className="line-through text-[#94A3B8] print:text-zinc-400">"{phrase.original}"</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8] print:text-sky-600 hidden sm:block shrink-0" />
                      <span className="font-semibold text-[#E2E8F0] print:text-zinc-900">"{phrase.better}"</span>
                    </div>
                    <p className="text-[11px] italic text-[#94A3B8] print:text-zinc-600">{phrase.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-6 border-t border-[#2A344A] bg-[#12161F] print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
              title="Compartir reporte por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer bg-[#1C2331] hover:bg-[#202838] border-[#2A344A] text-[#E2E8F0]"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer bg-[#1C2331] hover:bg-[#202838] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]"
              title="Copiar texto resumen"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

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
