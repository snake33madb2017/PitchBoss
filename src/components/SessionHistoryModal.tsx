import React, { useState } from 'react';
import type { SavedSession } from '../types';
import { SessionHistoryService } from '../services/sessionHistoryService';
import {
  History,
  X,
  Search,
  Clock,
  MessageSquare,
  Award,
  ChevronRight,
  Play,
  Trash2,
  FileText,
  Calendar
} from 'lucide-react';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeSession: (session: SavedSession) => void;
  onViewReport: (session: SavedSession) => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  onResumeSession,
  onViewReport
}) => {
  const [sessions, setSessions] = useState<SavedSession[]>(() => SessionHistoryService.getSessions());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedSessionForTranscript, setSelectedSessionForTranscript] = useState<SavedSession | null>(null);

  if (!isOpen) return null;

  const refreshSessions = () => {
    setSessions(SessionHistoryService.getSessions());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar el registro de esta sesión?')) {
      SessionHistoryService.deleteSession(id);
      refreshSessions();
      if (selectedSessionForTranscript?.id === id) {
        setSelectedSessionForTranscript(null);
      }
    }
  };

  const metrics = SessionHistoryService.getGlobalMetrics();

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scenarioNiche.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-4xl rounded-3xl border border-zinc-800 bg-[#0c0d12] text-zinc-100 shadow-2xl shadow-black/95 flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-800 bg-zinc-950/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Historial de <span className="text-amber-400">Conversaciones</span>
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  {sessions.length} registradas
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Retoma charlas previas y audita las transcripciones de cada práctica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Performance Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/50 shrink-0">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 block">Total Prácticas</span>
            <span className="text-lg font-black text-white mt-0.5 block">{metrics.totalSessions}</span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 block">Tiempo en Voz</span>
            <span className="text-lg font-black text-amber-400 mt-0.5 block">
              {formatDuration(metrics.totalDurationSeconds)}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 block">Nota Negocio Media</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">
              {metrics.averageBusinessScore > 0 ? `${metrics.averageBusinessScore}%` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 block">Fluidez Inglés Media</span>
            <span className="text-lg font-black text-blue-400 mt-0.5 block">
              {metrics.averageEnglishScore > 0 ? `${metrics.averageEnglishScore}%` : '—'}
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-3 sm:p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por escenario o industria..."
              className="w-full border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 bg-zinc-900/90 border-zinc-800 text-zinc-200 placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === 'in_progress'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              En Curso
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === 'completed'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Completadas
            </button>
          </div>
        </div>

        {/* Main Content Area: Split View between List and Transcript Inspector */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {selectedSessionForTranscript ? (
            /* Transcript Detail View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <button
                  onClick={() => setSelectedSessionForTranscript(null)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:underline cursor-pointer font-bold"
                >
                  ← Volver al listado de sesiones
                </button>
                <div className="flex items-center gap-2">
                  {selectedSessionForTranscript.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        onClose();
                        onResumeSession(selectedSessionForTranscript);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Continuar esta charla
                    </button>
                  )}
                  {selectedSessionForTranscript.report && (
                    <button
                      onClick={() => onViewReport(selectedSessionForTranscript)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Ver Informe de Evaluación
                    </button>
                  )}
                </div>
              </div>

              {/* Session Overview Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{selectedSessionForTranscript.scenarioTitle}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedSessionForTranscript.status === 'in_progress'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {selectedSessionForTranscript.status === 'in_progress' ? '🟢 En Curso' : '✅ Completada'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {formatDate(selectedSessionForTranscript.updatedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" /> {formatDuration(selectedSessionForTranscript.durationSeconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> {selectedSessionForTranscript.messages.length} mensajes
                  </span>
                  {selectedSessionForTranscript.report && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Award className="w-3.5 h-3.5" /> Negocio: {selectedSessionForTranscript.report.businessScore}% | Inglés: {selectedSessionForTranscript.report.englishScore}%
                    </span>
                  )}
                </div>
              </div>

              {/* Message Transcript Log */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Transcripción de la Conversación ({selectedSessionForTranscript.messages.length} turnos)
                </h4>

                <div className="space-y-3">
                  {selectedSessionForTranscript.messages.map((msg, index) => {
                    const isAi = msg.sender === 'ai';
                    return (
                      <div
                        key={msg.id || index}
                        className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                          isAi
                            ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-200'
                            : 'bg-amber-500/10 border border-amber-500/20 text-zinc-100 ml-4 sm:ml-8'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={isAi ? 'text-amber-400' : 'text-zinc-300'}>
                            {isAi ? '🤖 Interlocutor IA' : '👤 Tú (Voz)'}
                          </span>
                          <span className="text-zinc-500 font-mono text-[10px]">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-medium leading-relaxed">{msg.text}</p>

                        {/* Translation if available */}
                        {msg.translation && (
                          <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800/60">
                            Traducción: {msg.translation}
                          </p>
                        )}

                        {/* Grammar / Vocabulary Corrections */}
                        {msg.corrections && msg.corrections.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-amber-500/30 text-[11px] space-y-1 mt-1.5">
                            <span className="font-bold text-amber-400 block">💡 Sugerencia Ejecutiva:</span>
                            {msg.corrections.map((c, ci) => (
                              <div key={ci} className="space-y-0.5">
                                <p className="text-zinc-300">
                                  Dijiste: <span className="line-through text-rose-400">{c.originalText}</span> →{' '}
                                  <strong className="text-emerald-400">{c.improvedText}</strong>
                                </p>
                                <p className="text-zinc-400 text-[10px]">{c.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No hay sesiones en el historial</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Las conversaciones que realices se guardarán automáticamente aquí para que puedas retomarlas o revisar tus correcciones.
              </p>
            </div>
          ) : (
            /* Sessions List */
            <div className="grid grid-cols-1 gap-3">
              {filteredSessions.map((s) => {
                const isInProgress = s.status === 'in_progress';
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionForTranscript(s)}
                    className="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isInProgress
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {isInProgress ? '🟢 En Curso' : '✅ Completada'}
                        </span>
                        <span className="text-xs font-bold text-zinc-400 truncate">{s.scenarioNiche}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {s.scenarioTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {formatDate(s.updatedAt)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" /> {formatDuration(s.durationSeconds)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-500" /> {s.messages.length} mensajes
                        </span>
                        {s.report && (
                          <span className="text-[11px] font-bold text-emerald-400">
                            Nota: {s.report.businessScore}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isInProgress ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onResumeSession(s);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
                          title="Continuar conversación donde se dejó"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Continuar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewReport(s);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                          title="Ver evaluación"
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">Informe</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(s.id, e)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Eliminar sesión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
