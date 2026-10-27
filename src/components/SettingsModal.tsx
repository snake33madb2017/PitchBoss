import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { SpeechService } from '../services/speechService';
import { CloudSyncService } from '../services/cloudSyncService';
import { NotificationService } from '../services/notificationService';
import { useTranslation } from '../i18n/LanguageContext';
import { Settings, Volume2, Mic, Check, X, Download, User, Bell, Shield, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenAdmin?: () => void;
  canInstallPwa?: boolean;
  onInstallPwa?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenAdmin,
  canInstallPwa,
  onInstallPwa
}) => {
  const { t } = useTranslation();

  const [speechRate, setSpeechRate] = useState(settings.speechRate);
  const [autoListen, setAutoListen] = useState(settings.autoListen);
  const [fastResponseMode, setFastResponseMode] = useState(settings.fastResponseMode ?? true);
  const [silenceThresholdMs, setSilenceThresholdMs] = useState(settings.silenceThresholdMs ?? 800);
  const [preferredVoice, setPreferredVoice] = useState(settings.preferredVoice);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [employeeName, setEmployeeName] = useState(() => CloudSyncService.getEmployeeName());
  const [remindersEnabled, setRemindersEnabled] = useState(() => NotificationService.isEnabled());
  const [micTestStatus, setMicTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [micTestMsg, setMicTestMsg] = useState<string>('');

  useEffect(() => {
    SpeechService.getEnglishVoices().then((voices) => {
      setAvailableVoices(voices);
    });
  }, []);

  if (!isOpen) return null;

  const handleTestMic = async () => {
    setMicTestStatus('testing');
    const res = await SpeechService.requestMicrophonePermission();
    if (res.granted) {
      setMicTestStatus('success');
      setMicTestMsg('¡Micrófono activo y con permisos concedidos!');
      setTimeout(() => setMicTestStatus('idle'), 4000);
    } else {
      setMicTestStatus('error');
      setMicTestMsg(
        res.error === 'unsupported'
          ? 'Este navegador no soporta reconocimiento de voz nativo.'
          : 'Permiso denegado. Permite el micrófono en la barra del navegador.'
      );
    }
  };

  const handleToggleReminders = async () => {
    if (remindersEnabled) {
      NotificationService.disable();
      setRemindersEnabled(false);
    } else {
      const granted = await NotificationService.requestPermission();
      setRemindersEnabled(granted);
    }
  };

  const handleSave = () => {
    CloudSyncService.setEmployeeName(employeeName);
    onSaveSettings({
      ...settings,
      speechRate,
      autoListen,
      fastResponseMode,
      silenceThresholdMs,
      preferredVoice,
      employeeName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F17]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 bg-[#1C2331] border-[#2A344A] text-[#E2E8F0]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-[#12161F] border-[#2A344A]">
          <div className="flex items-center gap-2 text-[#38BDF8] min-w-0">
            <Settings className="w-5 h-5 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-[#E2E8F0] truncate">{t('settings.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors cursor-pointer text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161F] shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Employee Name (For Live Audit Reports) */}
          <div className="space-y-2 p-3 sm:p-3.5 rounded-2xl border border-sky-500/20 bg-[#12161F]">
            <label className="text-xs font-semibold flex items-center gap-1.5 text-white">
              <User className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              Tu Nombre / Colaborador
            </label>
            <p className="text-[11px] text-[#94A3B8]">
              Tus reportes y notas de simulación se etiquetarán con este nombre en el panel del encargado.
            </p>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Ej. Carlos Méndez"
              className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#38BDF8] bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
            />
          </div>

          {/* Daily Retention Reminders (PWA Notifications) */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border bg-[#12161F] border-[#2A344A]">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-[#E2E8F0]">
                <Bell className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                Recordatorio Diario (PWA)
              </span>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Recibe un aviso diario para hacer 3 minutos de roleplay antes de tu turno.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleReminders}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                remindersEnabled ? 'bg-[#0EA5E9]' : 'bg-[#1C2331] border border-[#2A344A]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  remindersEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold flex items-center gap-1.5 text-[#E2E8F0]">
              <Volume2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              {t('settings.voice')}
            </label>
            <select
              value={preferredVoice}
              onChange={(e) => setPreferredVoice(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2.5 text-xs cursor-pointer focus:outline-none focus:border-[#38BDF8] bg-[#12161F] border-[#2A344A] text-[#E2E8F0]"
            >
              <option value="">{t('settings.defaultVoice')}</option>
              {availableVoices.map((v, i) => (
                <option key={i} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Speed / Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#E2E8F0]">
                {t('settings.speed')} {speechRate.toFixed(1)}x
              </span>
              <span className="text-[11px] text-[#94A3B8]">
                {speechRate < 1 ? t('settings.speedSlow') : speechRate > 1 ? t('settings.speedFast') : t('settings.speedNormal')}
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* Hands-Free Auto-Listen Mode Toggle */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border bg-[#12161F] border-[#2A344A]">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-[#E2E8F0]">
                <Mic className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                {t('settings.handsFreeTitle')}
              </span>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                {t('settings.handsFreeDesc')}
              </p>
            </div>
            <button
              onClick={() => setAutoListen(!autoListen)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                autoListen ? 'bg-[#0EA5E9]' : 'bg-[#1C2331] border border-[#2A344A]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoListen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Ultra-Fast Response Mode Toggle */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border bg-[#12161F] border-sky-500/30">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-[#38BDF8]">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Modo Respuesta Ultrarrápida (&lt; 1s)
              </span>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Prioriza la síntesis de voz local y el modelo Gemini 2.0 Flash para que la IA responda casi al instante sin esperas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFastResponseMode(!fastResponseMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                fastResponseMode ? 'bg-[#0EA5E9]' : 'bg-[#1C2331] border border-[#2A344A]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  fastResponseMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Silence Detection Speed */}
          <div className="space-y-1.5 p-3 sm:p-3.5 rounded-2xl border bg-[#12161F] border-[#2A344A]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#E2E8F0] flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#38BDF8]" />
                Pausa de Silencio para Responder
              </span>
              <span className="text-[11px] text-[#38BDF8] font-bold">
                {silenceThresholdMs <= 750 ? 'Ultrarrápido (750ms)' : silenceThresholdMs <= 950 ? 'Equilibrado (900ms)' : 'Relajado (1300ms)'}
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Cuánto tiempo espera la app tras dejar de hablar antes de enviar tu voz al interlocutor.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { ms: 750, label: 'Rápido (0.75s)' },
                { ms: 900, label: 'Medio (0.9s)' },
                { ms: 1300, label: 'Pausado (1.3s)' }
              ].map((opt) => (
                <button
                  key={opt.ms}
                  type="button"
                  onClick={() => setSilenceThresholdMs(opt.ms)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    silenceThresholdMs === opt.ms
                      ? 'bg-sky-500/20 border-[#38BDF8] text-[#38BDF8]'
                      : 'bg-[#1C2331] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Microphone Diagnostic / Tester Button */}
          <div className="p-3 sm:p-3.5 rounded-2xl border bg-[#12161F] border-[#2A344A] space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#E2E8F0] flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Diagnóstico y Prueba de Micrófono
                </span>
                <p className="text-[11px] text-[#94A3B8]">
                  Verifica que tu navegador tenga permiso para captar tu voz.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestMic}
                disabled={micTestStatus === 'testing'}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1C2331] hover:bg-[#2A344A] text-[#38BDF8] border border-[#38BDF8]/40 transition-colors cursor-pointer shrink-0"
              >
                {micTestStatus === 'testing' ? 'Comprobando...' : 'Probar Micrófono'}
              </button>
            </div>
            {micTestStatus === 'success' && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{micTestMsg}</span>
              </div>
            )}
            {micTestStatus === 'error' && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{micTestMsg}</span>
              </div>
            )}
          </div>

          {/* PWA Install Quick Action (Android / Desktop) */}
          {canInstallPwa && onInstallPwa && (
            <div className="p-3 sm:p-3.5 rounded-2xl border border-[#2A344A] bg-[#12161F] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-[#E2E8F0] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#38BDF8] shrink-0" /> Instalar Aplicación PWA
                </span>
                <p className="text-[11px] text-[#94A3B8]">
                  Añade PitchBoss a tu dispositivo como una App nativa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onInstallPwa();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0EA5E9] hover:bg-[#38BDF8] text-white transition-colors cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
              >
                Instalar
              </button>
            </div>
          )}

          {/* iOS / iPhone Install Guide */}
          {typeof navigator !== 'undefined' &&
            /iPad|iPhone|iPod/.test(navigator.userAgent || '') &&
            !(navigator as unknown as { standalone?: boolean }).standalone && (
              <div className="p-3 sm:p-3.5 rounded-2xl border border-sky-500/20 bg-sky-500/5 space-y-2">
                <span className="text-xs font-bold text-[#38BDF8] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#38BDF8] shrink-0" /> Cómo Instalar en iPhone / iPad
                </span>
                <p className="text-[11px] text-[#E2E8F0] leading-relaxed">
                  1. En <strong>Safari</strong>, pulsa el botón <strong>Compartir</strong> (icono del cuadrado con la flecha hacia arriba <span className="text-[#38BDF8] font-bold">[ ↑ ]</span>).<br />
                  2. Desliza hacia abajo y pulsa <strong>"Añadir a pantalla de inicio"</strong>.<br />
                  3. Pulsa <strong>Añadir</strong> arriba a la derecha. ¡Listo!
                </p>
              </div>
            )}

          {/* Admin Panel Quick Access */}
          {onOpenAdmin && (
            <div className="p-3 sm:p-3.5 rounded-2xl border border-[#2A344A] bg-[#12161F] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Administración de la PWA</span>
                </span>
                <p className="text-[11px] text-[#94A3B8]">
                  Editar escenarios, exportar/importar y cambiar PIN.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0EA5E9] hover:bg-[#38BDF8] text-white transition-colors cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
              >
                Abrir Admin
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 sm:py-4 border-t bg-[#12161F] border-[#2A344A]">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold transition-colors cursor-pointer text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1C2331] rounded-xl text-center"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 shadow-sky-950/40 text-center"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t('settings.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
