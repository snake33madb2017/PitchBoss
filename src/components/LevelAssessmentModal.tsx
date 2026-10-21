import React, { useState } from 'react';
import type { EnglishLevel, LevelProgress } from '../types';
import { LevelEvaluationService } from '../services/levelEvaluationService';
import { Award, X, Target } from 'lucide-react';

interface LevelAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLevelChanged?: (progress: LevelProgress) => void;
  isAdmin?: boolean;
}

export const LevelAssessmentModal: React.FC<LevelAssessmentModalProps> = ({
  isOpen,
  onClose,
  onLevelChanged,
  isAdmin = false
}) => {
  const [progress, setProgress] = useState<LevelProgress>(() => LevelEvaluationService.getLevelProgress());
  const [selectedTab, setSelectedTab] = useState<'status' | 'levels' | 'history'>('status');

  if (!isOpen) return null;

  const currentDesc = LevelEvaluationService.getLevelDescription(progress.currentLevel);
  const nextLevel = progress.nextLevel;

  const handleManualLevelChange = (level: EnglishLevel) => {
    const updated = LevelEvaluationService.setUserLevel(level);
    setProgress(updated);
    if (onLevelChanged) {
      onLevelChanged(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#0d0e14] text-zinc-100 shadow-2xl shadow-black/95 flex flex-col h-[92vh] sm:h-auto sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-800 bg-zinc-950/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Evaluación y <span className="text-amber-400">Nivel de Inglés</span>
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider">
                  CEFR {progress.currentLevel}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Auditoría continua de dominio lingüístico y criterio de promoción
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

        {/* Tab Navigator */}
        <div className="flex items-center gap-2 px-5 sm:px-7 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-950/40 shrink-0 text-xs">
          <button
            onClick={() => setSelectedTab('status')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              selectedTab === 'status'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Mi Progreso Actual
          </button>
          <button
            onClick={() => setSelectedTab('levels')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              selectedTab === 'levels'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Escala de Niveles
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              selectedTab === 'history'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Historial de Ascensos ({progress.history.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {selectedTab === 'status' && (
            <div className="space-y-5">
              {/* Current Level Main Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider block">
                      Tu Nivel Actual Certificado
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {currentDesc.title}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-xl font-black text-amber-400">
                    {progress.currentLevel}
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentDesc.profile}
                </p>

                {/* Next Level Progression Bar */}
                {nextLevel && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">
                        Progreso hacia el <strong className="text-amber-400">Nivel {nextLevel}</strong>:
                      </span>
                      <span className="font-mono font-bold text-amber-400">{progress.masteryScore}%</span>
                    </div>

                    <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress.masteryScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Promotion Requirements Checklist */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Requisitos para el Siguiente Ascenso
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70">
                    <span className="text-zinc-300">Prácticas consecutivas aprobadas (&ge;75% fluidez):</span>
                    <span className="font-bold text-amber-400">
                      {progress.consecutivePassingSessions} de 2 necesarias
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70">
                    <span className="text-zinc-300">Cumplimiento de metas de negocio por llamada:</span>
                    <span className="font-bold text-emerald-400">&ge; 2 objetivos</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/70">
                    <span className="text-zinc-300">Evaluaciones completadas registradas:</span>
                    <span className="font-bold text-white">{progress.totalCompletedEvaluations}</span>
                  </div>
                </div>
              </div>

              {/* Behavior in Calls */}
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
                <span className="font-bold text-white block">Comportamiento del Interlocutor de IA en este nivel:</span>
                <p className="leading-relaxed text-zinc-400">{currentDesc.aiBehavior}</p>
              </div>

              {/* Admin quick switch override */}
              {isAdmin && (
                <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">
                    🛡️ Ajuste Rápido de Nivel (Modo Administrador)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as EnglishLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleManualLevelChange(lvl)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          progress.currentLevel === lvl
                            ? 'bg-amber-400 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        Nivel {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'levels' && (
            <div className="space-y-3">
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as EnglishLevel[]).map((lvl) => {
                const desc = LevelEvaluationService.getLevelDescription(lvl);
                const isCurrent = progress.currentLevel === lvl;
                return (
                  <div
                    key={lvl}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 font-black text-amber-400 text-xs flex items-center justify-center">
                          {lvl}
                        </span>
                        <h4 className="text-xs font-bold text-white">{desc.title}</h4>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold uppercase">
                          Tu Nivel Actual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{desc.profile}</p>
                    <p className="text-[11px] text-zinc-400 mt-1 italic">IA: {desc.aiBehavior}</p>
                  </div>
                );
              })}
            </div>
          )}

          {selectedTab === 'history' && (
            <div className="space-y-3">
              {progress.history.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Award className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">Aún no se han registrado eventos de ascenso de nivel.</p>
                  <p className="text-[11px] text-zinc-500">
                    Completa sesiones de simulación con nota superior al 75% para ascender.
                  </p>
                </div>
              ) : (
                progress.history.map((ev, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-400">
                        Ascenso: Nivel {ev.fromLevel} → Nivel {ev.toLevel}
                      </span>
                      <span className="text-zinc-500 text-[11px] font-mono">
                        {new Date(ev.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-[11px]">{ev.reason}</p>
                    <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                      Escenario: {ev.scenarioTitle} | Fluidez: {ev.englishScore}% | Negocio: {ev.businessScore}%
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
