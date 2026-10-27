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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0B0F17]/85 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#2A344A] bg-[#1C2331] text-[#E2E8F0] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Header icon */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-sky-300 p-0.5 mx-auto shadow-xl shadow-sky-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#12161F] rounded-[22px] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> ¡Evaluación Superada!
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Has Ascendido a <span className="text-[#38BDF8]">{LevelEvaluationService.getPitchTier(event.toLevel)}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Tu solvencia comunicativa y puntuación de negocio han alcanzado el estándar directivo exigido.
          </p>
        </div>

        {/* Level Progression Visual Pill */}
        <div className="p-4 rounded-2xl bg-[#12161F] border border-[#2A344A] flex items-center justify-between relative z-10">
          <div className="text-center">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Nivel Anterior</span>
            <span className="text-sm sm:text-base font-black text-[#94A3B8] mt-0.5 block">{LevelEvaluationService.getPitchTier(event.fromLevel)}</span>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-6 h-6 text-[#38BDF8] animate-pulse" />
            <span className="text-[9px] text-[#38BDF8] font-bold uppercase tracking-widest mt-0.5">Ascenso</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-sky-400 font-bold uppercase block">Nuevo Nivel</span>
            <span className="text-base sm:text-lg font-black text-[#38BDF8] mt-0.5 block">
              {LevelEvaluationService.getPitchTier(event.toLevel)}
            </span>
          </div>
        </div>

        {/* What changes in the simulation */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#12161F] border border-[#2A344A] relative z-10">
          <span className="text-xs font-bold text-[#E2E8F0] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ¿Qué cambia a partir de ahora en tus simulaciones?
          </span>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {toDesc.aiBehavior}
          </p>
          <div className="pt-2 border-t border-[#2A344A] flex items-center justify-between text-[11px] text-[#94A3B8]">
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
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-[#2A344A] bg-[#222B3D] hover:bg-[#2A344A] text-[#E2E8F0] transition-colors cursor-pointer text-center"
            >
              Ver Informe Detallado
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl text-xs font-bold shadow-xl shadow-sky-500/20 bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer text-center"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
