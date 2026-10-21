import React, { useState, useRef, useEffect } from 'react';
import { Plus, Settings, Download, ChevronDown, Check, ShieldCheck, Shield, Crown, Sparkles, Lock, History, Award } from 'lucide-react';
import type { EnglishLevel } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenNewScenario: () => void;
  onOpenSettings: () => void;
  onOpenHistory?: () => void;
  currentLevel?: EnglishLevel;
  onOpenLevelModal?: () => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
  subscriptionStatus: 'active' | 'free_trial' | 'expired';
  daysRemaining?: number;
  onOpenSubscriptionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenAdmin,
  onOpenNewScenario,
  onOpenSettings,
  onOpenHistory,
  currentLevel = 'A1',
  onOpenLevelModal,
  canInstallPwa,
  onInstallPwa,
  subscriptionStatus,
  daysRemaining,
  onOpenSubscriptionModal
}) => {
  const { t, language, setLanguage, currentLanguageOption, allLanguages } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#2A344A] bg-[#12161F]/95 backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-[#2A344A] bg-[#1C2331] p-0.5 overflow-hidden flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
          <img src="/logo-icon.png" alt="PitchBoss Logo" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center text-[#E2E8F0] shrink-0 leading-tight">
              Pitch<span className="text-[#38BDF8] ml-0.5">Boss</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#FBBF24] font-bold text-[10px] sm:text-[11px] whitespace-nowrap shadow-sm tracking-tight">
              By Marco Daza
            </span>
          </div>
          {/* Mobile brand subtitle */}
          <div className="sm:hidden flex items-center mt-0.5">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#FBBF24] font-bold text-[9px] whitespace-nowrap tracking-tight">
              By Marco Daza
            </span>
          </div>
          <p className="text-[11px] hidden sm:block text-[#94A3B8] truncate">
            {t('nav.brandSubtitle')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0">
        {/* User CEFR Level Badge */}
        {onOpenLevelModal && (
          <button
            onClick={onOpenLevelModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs text-[#E2E8F0] transition-colors cursor-pointer shadow-sm shrink-0 font-bold"
            title="Ver evaluación de nivel CEFR y progreso"
          >
            <Award className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="text-[10px] sm:text-xs">
              <span className="hidden sm:inline text-[#94A3B8] font-normal">Nivel </span>
              <strong className="text-[#38BDF8]">{currentLevel}</strong>
            </span>
          </button>
        )}

        {/* Subscription Status Pill */}
        {subscriptionStatus === 'active' ? (
          <button
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[#FBBF24] text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
            title="Suscripción Pro Activa"
          >
            <Crown className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#FBBF24]">PRO</span>
            <span className="hidden sm:inline text-[10px] text-amber-300 font-mono">({daysRemaining}d)</span>
          </button>
        ) : subscriptionStatus === 'free_trial' ? (
          <button
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#1C2331] hover:bg-[#242D3E] border border-[#2A344A] text-[#94A3B8] text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Prueba gratuita disponible"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="hidden sm:inline text-[#E2E8F0]">1 Prueba Gratis</span>
            <span className="sm:hidden text-[11px] font-semibold text-[#38BDF8]">Gratis</span>
          </button>
        ) : (
          <button
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer animate-pulse shrink-0"
            title="Activa tu pase Pro"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="hidden sm:inline">Activar Pro</span>
            <span className="sm:hidden text-[11px] font-bold">Pro</span>
          </button>
        )}

        {/* Admin Button */}
        {isAdmin ? (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-[#FBBF24] text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            title="Panel de Administración PWA"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FBBF24]" />
            <span className="hidden md:inline">Admin PWA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={onOpenAdmin}
            className="hidden sm:flex p-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-[#94A3B8] hover:text-[#38BDF8] transition-colors cursor-pointer shrink-0"
            title="Acceso Administrador (PIN)"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}

        {/* Language Selector Dropdown */}
        <div className="relative shrink-0" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs text-[#E2E8F0] transition-colors cursor-pointer shadow-sm"
            title="Cambiar idioma / Change language"
          >
            <span className="text-sm sm:text-base leading-none">{currentLanguageOption.flag}</span>
            <span className="hidden md:inline font-semibold text-[11px] uppercase tracking-wider text-[#94A3B8]">
              {currentLanguageOption.code}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#94A3B8]" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#2A344A] bg-[#1C2331] text-[#E2E8F0] shadow-2xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b border-[#2A344A] mb-1 text-[#94A3B8]">
                Idioma / Language
              </div>
              {allLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                    language === lang.code
                      ? 'bg-sky-500/15 text-[#38BDF8] font-bold'
                      : 'text-[#E2E8F0] hover:bg-[#242D3E]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install Button */}
        {canInstallPwa && (
          <button
            onClick={onInstallPwa}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs font-semibold text-[#E2E8F0] transition-colors shadow-sm cursor-pointer shrink-0"
            title={t('nav.installPwa')}
          >
            <Download className="w-4 h-4 text-[#38BDF8]" />
            <span className="hidden md:inline">{t('nav.installPwa')}</span>
          </button>
        )}

        {/* History Button */}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-[#E2E8F0] transition-colors cursor-pointer shrink-0 text-xs font-semibold"
            title="Historial de conversaciones y transcripciones"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38BDF8]" />
            <span className="hidden lg:inline">Historial</span>
          </button>
        )}

        {/* New Scenario Button */}
        <button
          onClick={onOpenNewScenario}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-lg shadow-sky-950/40 active:scale-95 transition-all cursor-pointer bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 shrink-0"
          title={t('nav.newScenario')}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
          <span className="hidden sm:inline">{t('nav.newScenario')}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-[#94A3B8] hover:text-[#E2E8F0] transition-colors cursor-pointer shrink-0"
          title={t('nav.settings')}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
