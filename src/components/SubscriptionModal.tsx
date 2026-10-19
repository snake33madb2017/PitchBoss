import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Sparkles,
  Key,
  MessageCircle,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock
} from 'lucide-react';
import { SubscriptionService, type UserSubscriptionState } from '../services/subscriptionService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated: () => void;
  state: UserSubscriptionState;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionUpdated,
  state
}) => {
  const [licenseInput, setLicenseInput] = useState('');
  const [activationMsg, setActivationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  if (!isOpen) return null;

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;

    setIsActivating(true);
    setActivationMsg(null);

    const result = SubscriptionService.activateLicense(licenseInput.trim());
    setIsActivating(false);

    if (result.success) {
      setActivationMsg({ type: 'success', text: result.message });
      setLicenseInput('');
      onSubscriptionUpdated();
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setActivationMsg({ type: 'error', text: result.message });
    }
  };

  const handleOpenWhatsApp = (planTitle: string) => {
    const text = encodeURIComponent(
      `¡Hola! Quiero activar mi suscripción Pro a PitchBoss (${planTitle}). ¿Cuáles son los métodos de pago?`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#0b0c10] border border-zinc-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl shadow-black/90 space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Pitch<span className="text-amber-400">Boss Pro</span>
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider">
                  Acceso Total
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Domina las conversaciones en inglés para tu profesión
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {state.status === 'active' ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">{state.activeLicense?.planName}</p>
                <p className="text-[11px] text-emerald-400/90">
                  {state.daysRemaining} días restantes de suscripción
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-emerald-200">
              Activo
            </span>
          </div>
        ) : state.status === 'expired' ? (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Simulación de prueba completada</p>
              <p className="text-[11px] text-rose-300/80">
                Has consumido tu prueba gratuita. Activa tu pase para continuar practicando.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Prueba Gratuita disponible</p>
              <p className="text-[11px] text-amber-200/80">
                Tienes 1 simulación de prueba gratuita para probar el simulador.
              </p>
            </div>
          </div>
        )}

        {/* Benefits List */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px]">Llamadas y voz ilimitadas</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px]">Walkie-Talkie dinámico</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px]">Todos los escenarios pro</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px]">Reportes del Coach IA</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Planes de Suscripción Disponibles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 30 Days */}
            <div
              onClick={() => handleOpenWhatsApp('Plan 30 Días')}
              className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Mensual
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">19€</span>
                  <span className="text-[10px] text-zinc-400">/mes</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">30 días de acceso total</p>
              </div>
              <button
                type="button"
                className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Elegir</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* 90 Days - POPULAR */}
            <div
              onClick={() => handleOpenWhatsApp('Plan Trimestral 90 Días')}
              className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between relative shadow-lg shadow-amber-500/10 group"
            >
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider">
                Recomendado
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Trimestral
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">45€</span>
                  <span className="text-[10px] text-amber-300">/3 meses</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">15€/mes • Ahorras 21%</p>
              </div>
              <button
                type="button"
                className="mt-3 w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Elegir</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Annual */}
            <div
              onClick={() => handleOpenWhatsApp('Plan Anual 1 Año')}
              className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Anual
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">120€</span>
                  <span className="text-[10px] text-zinc-400">/año</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">10€/mes • Ahorras 47%</p>
              </div>
              <button
                type="button"
                className="mt-3 w-full py-1.5 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Elegir</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Order Action */}
        <button
          onClick={() => handleOpenWhatsApp('Pase PitchBoss Pro')}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Solicitar Suscripción por WhatsApp</span>
        </button>

        {/* License Key Activation Section */}
        <div className="pt-2 border-t border-zinc-800/80">
          {!showCodeInput ? (
            <button
              onClick={() => setShowCodeInput(true)}
              className="w-full text-center text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>¿Ya tienes un código o licencia? Actívalo aquí</span>
            </button>
          ) : (
            <form onSubmit={handleActivateKey} className="space-y-2 animate-in fade-in">
              <label className="text-[11px] font-medium text-zinc-300 block">
                Ingresa tu código de licencia (ej: PB-30D-...):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
                  placeholder="PB-30D-XXXX-XXXX"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white tracking-wider focus:outline-none focus:border-amber-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={isActivating || !licenseInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  {isActivating ? 'Verificando...' : 'Activar'}
                </button>
              </div>

              {activationMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    activationMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {activationMsg.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{activationMsg.text}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
