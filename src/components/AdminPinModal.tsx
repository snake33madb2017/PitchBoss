import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, ArrowRight, AlertCircle } from 'lucide-react';
import { AdminStorageService } from '../services/adminStorageService';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Por favor, ingresa el PIN.');
      return;
    }

    if (AdminStorageService.verifyAdminPin(pin)) {
      AdminStorageService.setAdminSessionActive(true);
      setError(null);
      onSuccess();
      onClose();
    } else {
      setError('PIN incorrecto. Inténtalo de nuevo.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D111A]/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl border border-[#2A344A] bg-[#1C2331] p-6 text-[#E2E8F0] shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#202838] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <ShieldCheck className="w-7 h-7 text-[#38BDF8]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#E2E8F0]">Modo Administrador</h2>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Ingresa tu PIN para editar escenarios, exportar datos y gestionar la PWA.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#E2E8F0] flex items-center justify-between">
              <span>PIN de Seguridad</span>
              <span className="text-[11px] text-[#FBBF24] font-normal">Por defecto: 1234</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••"
                className="w-full pl-10 pr-10 py-3 text-center tracking-[0.3em] font-mono text-lg rounded-2xl border bg-[#12161F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0] bg-[#12161F] hover:bg-[#202838] border border-[#2A344A] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#0EA5E9] hover:bg-[#38BDF8] flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Acceder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
