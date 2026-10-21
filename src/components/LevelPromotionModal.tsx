import React, { useEffect } from 'react';
import type { LevelPromotionEvent } from '../types';
import { LevelEvaluationService } from '../services/levelEvaluationService';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface LevelPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: LevelPromotionEvent | null;
  onViewReport?: () => void;
}

export const LevelPromotionModal: React.FC<LevelPromotionModalProps> = ({
  isOpen,
  onClose,
  event,
  onViewReport
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6', '#ffffff']
        });
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const toDesc = LevelEvaluationService.getLevelDescription(event.toLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#14141a] via-[#0d0e14] to-[#08080c] text-zinc-100 shadow-2xl shadow-amber-500/10 p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Header icon */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 mx-auto shadow-xl shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> ¡Evaluación Superada!
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Has Ascendido a <span className="text-amber-400">Nivel {event.toLevel}</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300">
            Tu solvencia comunicativa y puntuación de negocio han alcanzado el estándar directivo exigido.
          </p>
        </div>

        {/* Level Progression Visual Pill */}
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between relative z-10">
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Nivel Anterior</span>
            <span className="text-xl font-black text-zinc-400 mt-0.5 block">{event.fromLevel}</span>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse" />
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest mt-0.5">Ascenso</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">Nuevo Nivel</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 mt-0.5 block">
              {event.toLevel}
            </span>
          </div>
        </div>

        {/* What changes in the simulation */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 relative z-10">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ¿Qué cambia a partir de ahora en tus simulaciones?
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {toDesc.aiBehavior}
          </p>
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Nota en última práctica:</span>
            <span className="text-emerald-400 font-bold">Fluidez {event.englishScore}% | Negocio {event.businessScore}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 relative z-10">
          {onViewReport && (
            <button
              onClick={() => {
                onClose();
                onViewReport();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer text-center"
            >
              Ver Informe Detallado
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs font-black shadow-xl shadow-amber-500/20 bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all cursor-pointer text-center"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
