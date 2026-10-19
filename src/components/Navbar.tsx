import React, { useState, useRef, useEffect } from 'react';
import { Plus, Settings, Download, ChevronDown, Check, ShieldCheck, Shield, Crown, Sparkles, Lock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onOpenNewScenario: () => void;
  onOpenSettings: () => void;
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
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-0.5 overflow-hidden flex items-center justify-center shadow-lg shadow-black/50 shrink-0">
          <img src="/logo-icon.png" alt="PitchBoss Logo" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-lg font-black tracking-tight flex items-center text-white shrink-0">
              Pitch<span className="text-amber-400 ml-0.5">Boss</span>
            </h1>
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[9px] sm:text-[11px] whitespace-nowrap shadow-sm shadow-amber-500/10 tracking-tight">
              By Marco Daza
            </span>
          </div>
          <p className="text-[11px] hidden sm:block text-zinc-400 truncate">
            {t('nav.brandSubtitle')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink-0">
        {/* Subscription Status Pill */}
        {subscriptionStatus === 'active' ? (
          <button
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-amber-500/10 shrink-0"
            title="Suscripción Pro Activa"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-amber-300">PRO</span>
            <span className="hidden sm:inline text-[10px] text-amber-400 font-mono">({daysRemaining}d)</span>
          </button>
        ) : subscriptionStatus === 'free_trial' ? (
          <button
            onClick={onOpenSubscriptionModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Prueba gratuita disponible"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">1 Prueba Gratis</span>
            <span className="sm:hidden text-[11px] font-semibold text-amber-400">Gratis</span>
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
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            title="Panel de Administración PWA"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="hidden md:inline">Admin PWA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={onOpenAdmin}
            className="hidden sm:flex p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
            title="Acceso Administrador (PIN)"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}

        {/* Language Selector Dropdown with Flags */}
        <div className="relative shrink-0" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 transition-colors cursor-pointer shadow-sm"
            title="Cambiar idioma / Change language"
          >
            <span className="text-sm sm:text-base leading-none">{currentLanguageOption.flag}</span>
            <span className="hidden md:inline font-semibold text-[11px] uppercase tracking-wider text-zinc-300">
              {currentLanguageOption.code}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-200 shadow-2xl shadow-black/90 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-800 mb-1 text-zinc-500">
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
                      ? 'bg-amber-500/10 text-amber-400 font-bold'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {language === lang.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PWA Install Button (desktop / tablet) */}
        {canInstallPwa && (
          <button
            onClick={onInstallPwa}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors shadow-sm cursor-pointer shrink-0"
            title={t('nav.installPwa')}
          >
            <Download className="w-4 h-4 text-zinc-400" />
            <span className="hidden md:inline">{t('nav.installPwa')}</span>
          </button>
        )}

        {/* New Scenario Button */}
        <button
          onClick={onOpenNewScenario}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-lg shadow-black/40 active:scale-95 transition-all cursor-pointer bg-zinc-100 hover:bg-white text-zinc-950 shrink-0"
          title={t('nav.newScenario')}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-950" />
          <span className="hidden sm:inline">{t('nav.newScenario')}</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title={t('nav.settings')}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
