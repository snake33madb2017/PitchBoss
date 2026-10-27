import React, { useState } from 'react';
import { X, Building2, Key, ArrowRight, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { SubscriptionService } from '../services/subscriptionService';
import type { Workspace } from '../types';

interface CompanyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces?: Workspace[];
  onSelectWorkspace: (workspaceId: string) => void;
  onLicenseActivated?: (message: string) => void;
}

export const CompanyAccessModal: React.FC<CompanyAccessModalProps> = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onLicenseActivated
}) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) return null;

  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setErrorMsg('Por favor ingresa tu código de licencia corporativa.');
      return;
    }

    setIsActivating(true);
    setErrorMsg(null);

    const result = SubscriptionService.activateLicense(licenseKeyInput.trim());
    if (result.success && result.license) {
      if (onLicenseActivated) {
        onLicenseActivated(result.message);
      }
      if (result.license.workspaceId) {
        onSelectWorkspace(result.license.workspaceId);
      }
      onClose();
    } else {
      setErrorMsg(result.message || 'Código de licencia no válido o no encontrado.');
    }
    setIsActivating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in font-sans">
      <div className="w-full max-w-lg rounded-3xl bg-[#12161F] border border-[#2A344A] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2A344A] flex items-center justify-between bg-[#161D2B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#38BDF8]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Portal Corporativo B2B</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Acceso Seguro
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Entorno privado y confidencial para empresas acreditadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1C2331] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Welcome message */}
          <div className="space-y-1.5 text-center">
            <h3 className="text-lg font-bold text-white">Ingresa a tu Portal de Empresa</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
              Introduce el código de licencia corporativa asignado a tu organización para acceder directamente a tus cartas oficiales, módulos de entrenamiento y reportes.
            </p>
          </div>

          {/* Standard License Key Login Form */}
          <form onSubmit={handleActivateLicense} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sky-400">
                  <Key className="w-3.5 h-3.5" />
                  <span>Código de Licencia Corporativa:</span>
                </span>
                <span className="text-[11px] text-[#94A3B8] font-mono">Formato: PB-XXXX-XXXX</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={licenseKeyInput}
                  onChange={(e) => {
                    setLicenseKeyInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="PB-365D-XXXX-YYYY"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-[#18202F] border border-[#2A344A] text-white font-mono text-sm uppercase placeholder:text-stone-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isActivating}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-[#0284C7] hover:from-sky-400 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/25 active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Validar Licencia y Entrar al Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Privacy and Multi-Tenant Guarantee */}
          <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#161D2B]/60 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía de Confidencialidad PitchBoss</span>
            </h4>
            <ul className="text-xs text-[#94A3B8] space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Privacidad total:</strong> Ninguna otra empresa puede ver tu contenido, cartas o personal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Identidad corporativa:</strong> Al ingresar, el entorno se personaliza automáticamente con tu marca.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Cupos y seguimiento:</strong> El gerente podrá revisar el progreso y habilitar empleados según su plan.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2A344A] bg-[#161D2B] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-stone-500" /> Cifrado y aislado por inquilino
          </span>
          <span className="font-semibold text-slate-400">PitchBoss Enterprise v2.1</span>
        </div>
      </div>
    </div>
  );
};
