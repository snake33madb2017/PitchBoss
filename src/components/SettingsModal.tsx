import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import { SpeechService } from '../services/speechService';
import { useTranslation } from '../i18n/LanguageContext';
import { Settings, Key, Volume2, Mic, Check, X, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onOpenAdmin?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenAdmin
}) => {
  const { t } = useTranslation();

  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [speechRate, setSpeechRate] = useState(settings.speechRate);
  const [autoListen, setAutoListen] = useState(settings.autoListen);
  const [preferredVoice, setPreferredVoice] = useState(settings.preferredVoice);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    SpeechService.getEnglishVoices().then((voices) => {
      setAvailableVoices(voices);
    });
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    GeminiService.setApiKey(apiKey);
    onSaveSettings({
      ...settings,
      apiKey,
      speechRate,
      autoListen,
      preferredVoice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-zinc-950 border-zinc-800">
          <div className="flex items-center gap-2 text-amber-400">
            <Settings className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">{t('settings.title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold flex items-center gap-1.5 text-zinc-200">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                {t('settings.apiKey')}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                {t('settings.getKey')} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono transition-colors focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
            />
            <p className="text-[11px] text-zinc-400">
              {t('settings.apiKeyDesc')}
            </p>
          </div>

          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold flex items-center gap-1.5 text-zinc-200">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              {t('settings.voice')}
            </label>
            <select
              value={preferredVoice}
              onChange={(e) => setPreferredVoice(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2.5 text-xs cursor-pointer focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100"
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200">
                {t('settings.speed')} {speechRate.toFixed(1)}x
              </label>
              <span className="text-[11px] text-zinc-400">
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
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Hands-Free Auto-Listen Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-zinc-950/60 border-zinc-800">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-200">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                {t('settings.handsFreeTitle')}
              </span>
              <p className="text-[11px] text-zinc-400">
                {t('settings.handsFreeDesc')}
              </p>
            </div>
            <button
              onClick={() => setAutoListen(!autoListen)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                autoListen ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoListen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Admin Panel Quick Access */}
          {onOpenAdmin && (
            <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  🛡️ Administración de la PWA
                </span>
                <p className="text-[11px] text-zinc-400">
                  Editar escenarios, exportar/importar y cambiar PIN.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-colors cursor-pointer shadow-sm"
              >
                Abrir Admin
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-zinc-950 border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold transition-colors cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer bg-zinc-100 hover:bg-white text-zinc-950 shadow-black/40"
          >
            <Check className="w-3.5 h-3.5 text-zinc-950" />
            {t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
