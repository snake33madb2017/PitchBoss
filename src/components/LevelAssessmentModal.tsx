import React, { useState } from 'react';
import type { EnglishLevel, LevelProgress } from '../types';
import { LevelEvaluationService } from '../services/levelEvaluationService';
import { Award, X, Target, Shield } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#2A344A] bg-[#1C2331] text-[#E2E8F0] shadow-2xl flex flex-col h-[92vh] sm:h-auto sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-7 py-3 sm:py-4 border-b border-[#2A344A] bg-[#12161F] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 mr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-[#E2E8F0] truncate">
                  Evaluación y <span className="text-[#38BDF8]">Nivel</span>
                </h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-[#38BDF8] font-bold uppercase tracking-wider shrink-0">
                  {LevelEvaluationService.getPitchTier(progress.currentLevel)}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#94A3B8] truncate hidden xs:block">
                Auditoría continua de dominio y criterio de promoción
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-[#1C2331] hover:bg-[#202838] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#2A344A] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-7 pt-2.5 pb-2 border-b border-[#2A344A] bg-[#12161F]/60 shrink-0 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedTab('status')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              selectedTab === 'status'
                ? 'bg-[#0EA5E9] text-slate-950 font-bold'
                : 'bg-[#12161F] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#2A344A]'
            }`}
          >
            Mi Progreso
          </button>
          <button
            onClick={() => setSelectedTab('levels')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              selectedTab === 'levels'
                ? 'bg-[#0EA5E9] text-slate-950 font-bold'
                : 'bg-[#12161F] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#2A344A]'
            }`}
          >
            Escala Niveles
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              selectedTab === 'history'
                ? 'bg-[#0EA5E9] text-slate-950 font-bold'
                : 'bg-[#12161F] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#2A344A]'
            }`}
          >
            Historial ({progress.history.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-5">
          {selectedTab === 'status' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Current Level Main Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#12161F] border border-[#2A344A] space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider block">
                      Tu Nivel Actual Certificado
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-[#E2E8F0] mt-0.5 truncate">
                      {currentDesc.title}
                    </h3>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-xs sm:text-sm font-black text-[#38BDF8] shrink-0">
                    {LevelEvaluationService.getPitchTier(progress.currentLevel)}
                  </div>
                </div>

                <p className="text-xs text-[#E2E8F0] leading-relaxed">
                  {currentDesc.profile}
                </p>

                {/* Next Level Progression Bar */}
                {nextLevel && (
                  <div className="space-y-2 pt-2 border-t border-[#2A344A]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#E2E8F0] font-medium text-[11px] sm:text-xs">
                        Hacia <strong className="text-[#38BDF8]">{LevelEvaluationService.getPitchTier(nextLevel)}</strong>:
                      </span>
                      <span className="font-mono font-bold text-[#38BDF8]">{progress.masteryScore}%</span>
                    </div>

                    <div className="w-full bg-[#1C2331] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress.masteryScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Promotion Requirements Checklist */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#12161F] border border-[#2A344A] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                  <Target className="w-4 h-4 shrink-0" /> Requisitos para el Siguiente Ascenso
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-[#1C2331] border border-[#2A344A]">
                    <span className="text-[#E2E8F0]">Prácticas aprobadas (&ge;75% fluidez):</span>
                    <span className="font-bold text-[#38BDF8] self-start sm:self-auto">
                      {progress.consecutivePassingSessions} de 2 necesarias
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-[#1C2331] border border-[#2A344A]">
                    <span className="text-[#E2E8F0]">Metas de negocio por llamada:</span>
                    <span className="font-bold text-emerald-400 self-start sm:self-auto">&ge; 2 objetivos</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-[#1C2331] border border-[#2A344A]">
                    <span className="text-[#E2E8F0]">Evaluaciones completadas:</span>
                    <span className="font-bold text-[#E2E8F0] self-start sm:self-auto">{progress.totalCompletedEvaluations}</span>
                  </div>
                </div>
              </div>

              {/* Behavior in Calls */}
              <div className="p-4 rounded-2xl bg-[#12161F]/60 border border-[#2A344A] space-y-1.5 text-xs text-[#E2E8F0]">
                <span className="font-bold text-[#E2E8F0] block">Comportamiento del Interlocutor de IA en este nivel:</span>
                <p className="leading-relaxed text-[#94A3B8]">{currentDesc.aiBehavior}</p>
              </div>

              {/* Admin quick switch override */}
              {isAdmin && (
                <div className="p-3.5 rounded-2xl border border-sky-500/20 bg-sky-500/5 space-y-2">
                  <span className="text-xs font-bold text-[#38BDF8] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>Ajuste Rápido de Nivel (Modo Administrador)</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Pitch One', lvl: 'A1' as EnglishLevel },
                      { label: 'Pitch Two', lvl: 'B1' as EnglishLevel },
                      { label: 'Pitch Three', lvl: 'C1' as EnglishLevel }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleManualLevelChange(item.lvl)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          LevelEvaluationService.getPitchTier(progress.currentLevel) === item.label
                            ? 'bg-[#0EA5E9] text-slate-950 font-black shadow-md'
                            : 'bg-[#1C2331] text-[#E2E8F0] hover:bg-[#202838] border border-[#2A344A]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'levels' && (
            <div className="space-y-3">
              {[
                {
                  tier: 'Pitch One',
                  level: 'A1' as EnglishLevel,
                  title: 'Pitch One (Iniciación y Saludos)',
                  profile: 'Frases de bienvenida, saludos amables, pedidos básicos y protocolo operativo de atención.',
                  aiBehavior: 'El interlocutor habla pausado y claro. Te ofrece tips fonéticos y guía en español cuando dudas.'
                },
                {
                  tier: 'Pitch Two',
                  level: 'B1' as EnglishLevel,
                  title: 'Pitch Two (Fluidez y Argumentación)',
                  profile: 'Storytelling de productos, explicación de carta, venta sugestiva premium y resolución de objeciones comerciales.',
                  aiBehavior: 'El cliente pide recomendaciones de autor, pregunta por alérgenos y exige justificación de valor.'
                },
                {
                  tier: 'Pitch Three',
                  level: 'C1' as EnglishLevel,
                  title: 'Pitch Three (Alta Dirección y Negociación)',
                  profile: 'Negociaciones complejas a nivel C-Suite, auditorías críticas, persuasión estratégica y diplomacia ejecutiva.',
                  aiBehavior: 'Inglés con modismos sofisticados, ritmo corporativo rápido y máxima exigencia de resultados.'
                }
              ].map((item) => {
                const isCurrent = LevelEvaluationService.getPitchTier(progress.currentLevel) === item.tier;
                return (
                  <div
                    key={item.tier}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-950/20'
                        : 'bg-[#12161F] border-[#2A344A]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-xl bg-[#1C2331] border border-[#2A344A] font-black text-[#38BDF8] text-xs flex items-center justify-center">
                          {item.tier}
                        </span>
                        <h4 className="text-xs font-bold text-[#E2E8F0]">{item.title}</h4>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0EA5E9] text-slate-950 font-bold uppercase">
                          Tu Nivel Actual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#E2E8F0] mt-2 leading-relaxed">{item.profile}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1 italic">IA: {item.aiBehavior}</p>
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
                  <p className="text-xs text-[#94A3B8]">Aún no se han registrado eventos de ascenso de nivel.</p>
                  <p className="text-[11px] text-zinc-500">
                    Completa sesiones de simulación con nota superior al 75% para ascender.
                  </p>
                </div>
              ) : (
                progress.history.map((ev, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#12161F] border border-[#2A344A] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#38BDF8]">
                        Ascenso: {LevelEvaluationService.getPitchTier(ev.fromLevel)} → {LevelEvaluationService.getPitchTier(ev.toLevel)}
                      </span>
                      <span className="text-[#94A3B8] text-[11px] font-mono">
                        {new Date(ev.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="text-[#E2E8F0] text-[11px]">{ev.reason}</p>
                    <div className="text-[10px] text-emerald-400 font-semibold pt-1">
                      Escenario: {LevelEvaluationService.cleanTitle(ev.scenarioTitle)} | Fluidez: {ev.englishScore}% | Negocio: {ev.businessScore}%
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
