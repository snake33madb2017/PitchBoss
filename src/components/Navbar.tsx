import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Settings,
  Download,
  ChevronDown,
  Check,
  ShieldCheck,
  Shield,
  Crown,
  Sparkles,
  Lock,
  History,
  Award,
  Presentation,
  Wine,
  Menu,
  X
} from 'lucide-react';
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
  onOpenLovoMenu?: () => void;
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
  onOpenSubscriptionModal,
  onOpenLovoMenu
}) => {
  const { t, language, setLanguage, currentLanguageOption, allLanguages } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop or ESC key
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsLangMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#2A344A] bg-[#12161F]/95 backdrop-blur-md px-3.5 sm:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-[#2A344A] bg-[#1C2331] p-0.5 overflow-hidden flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
            <img src="/logo-icon.png" alt="PitchBoss Logo" className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center text-[#E2E8F0] shrink-0 leading-tight">
                Pitch<span className="text-[#38BDF8] ml-0.5">Boss</span>
              </h1>
              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#FBBF24] font-bold text-[9px] sm:text-[11px] whitespace-nowrap shadow-sm tracking-tight">
                By Marco Daza
              </span>
            </div>
            <p className="text-[11px] hidden sm:block text-[#94A3B8] truncate">
              {t('nav.brandSubtitle')}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE CONTROLS (< 768px): Clean, Spacious & Zero Clutter */}
        {/* ========================================================= */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Quick CEFR Level Pill */}
          {onOpenLevelModal && (
            <button
              onClick={onOpenLevelModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-[#E2E8F0] transition-colors cursor-pointer shadow-sm text-xs font-bold"
              title="Tu nivel actual de inglés CEFR"
            >
              <Award className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-[11px] font-black text-[#38BDF8]">{currentLevel}</span>
            </button>
          )}

          {/* Quick New Scenario (+) Button */}
          <button
            onClick={onOpenNewScenario}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-white bg-[#0EA5E9] active:bg-[#38BDF8] shadow-md shadow-sky-950/40 transition-all cursor-pointer font-bold"
            title={t('nav.newScenario')}
          >
            <Plus className="w-4 h-4 text-white" />
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              isMobileMenuOpen
                ? 'border-[#38BDF8] bg-sky-500/15 text-[#38BDF8]'
                : 'border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-[#E2E8F0]'
            }`}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            title="Menú de opciones"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#38BDF8]" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            {/* Status indicator dot if Pro or Admin is active */}
            {subscriptionStatus === 'active' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#12161F]" />
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP CONTROLS (>= 768px): Full expansive quick-bar    */}
        {/* ========================================================= */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* User CEFR Level Badge */}
          {onOpenLevelModal && (
            <button
              onClick={onOpenLevelModal}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs text-[#E2E8F0] transition-colors cursor-pointer shadow-sm shrink-0 font-bold"
              title="Ver evaluación de nivel CEFR y progreso"
            >
              <Award className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-xs">
                <span className="text-[#94A3B8] font-normal">Nivel </span>
                <strong className="text-[#38BDF8]">{currentLevel}</strong>
              </span>
            </button>
          )}

          {/* Subscription Status Pill */}
          {subscriptionStatus === 'active' ? (
            <button
              onClick={onOpenSubscriptionModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[#FBBF24] text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
              title="Suscripción Pro Activa"
            >
              <Crown className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
              <span className="text-xs font-bold text-[#FBBF24]">PRO</span>
              <span className="text-[10px] text-amber-300 font-mono">({daysRemaining}d)</span>
            </button>
          ) : subscriptionStatus === 'free_trial' ? (
            <button
              onClick={onOpenSubscriptionModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C2331] hover:bg-[#242D3E] border border-[#2A344A] text-[#94A3B8] text-xs font-medium transition-colors cursor-pointer shrink-0"
              title="Prueba gratuita disponible"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-[#E2E8F0]">1 Prueba Gratis</span>
            </button>
          ) : (
            <button
              onClick={onOpenSubscriptionModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer animate-pulse shrink-0"
              title="Activa tu pase Pro"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Activar Pro</span>
            </button>
          )}

          {/* Admin Button */}
          {isAdmin ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-[#FBBF24] text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
              title="Panel de Administración PWA"
            >
              <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
              <span>Admin PWA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-[#94A3B8] hover:text-[#38BDF8] transition-colors cursor-pointer shrink-0"
              title="Acceso Administrador (PIN)"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {/* LOVO Cocktail Trilogy Menu Button */}
          {onOpenLovoMenu && (
            <button
              onClick={onOpenLovoMenu}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer shadow-sm shadow-amber-950/30 shrink-0"
              title="Carta Trilogía LOVO Bar"
            >
              <Wine className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Carta LOVO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs text-[#E2E8F0] transition-colors cursor-pointer shadow-sm"
              title="Cambiar idioma / Change language"
            >
              <span className="text-base leading-none">{currentLanguageOption.flag}</span>
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#94A3B8]">
                {currentLanguageOption.code}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs font-semibold text-[#E2E8F0] transition-colors shadow-sm cursor-pointer shrink-0"
              title={t('nav.installPwa')}
            >
              <Download className="w-4 h-4 text-[#38BDF8]" />
              <span>{t('nav.installPwa')}</span>
            </button>
          )}

          {/* LOVO Menu Button */}
              {onOpenLovoMenu && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLovoMenu();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 active:bg-amber-500/20 text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Wine className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>Carta Trilogía LOVO Bar</span>
                      <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">71</span>
                    </p>
                    <p className="text-[11px] text-[#94A3B8] truncate">Tomo I (La Musa), Tomo II (Lobo), Tomo III (La Tribu)</p>
                  </div>
                </button>
              )}

              {/* History Button */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-[#E2E8F0] transition-colors cursor-pointer shrink-0 text-xs font-semibold"
              title="Historial de conversaciones y transcripciones"
            >
              <History className="w-4 h-4 text-[#38BDF8]" />
              <span className="hidden lg:inline">Historial</span>
            </button>
          )}

          {/* Interactive Corporate Presentation Link */}
          <a
            href="/presentation/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs font-semibold text-[#E2E8F0] transition-colors shadow-sm cursor-pointer shrink-0"
            title="Ver Presentación Corporativa Interactiva"
          >
            <Presentation className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden xl:inline">Presentación</span>
          </a>

          {/* New Scenario Button */}
          <button
            onClick={onOpenNewScenario}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-sky-950/40 active:scale-95 transition-all cursor-pointer bg-[#0EA5E9] hover:bg-[#38BDF8] text-white shrink-0"
            title={t('nav.newScenario')}
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{t('nav.newScenario')}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-[#94A3B8] hover:text-[#E2E8F0] transition-colors cursor-pointer shrink-0"
            title={t('nav.settings')}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE MENU DRAWER / PANEL (When Hamburger is Clicked)    */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[54px] bottom-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            ref={mobileMenuRef}
            className="bg-[#12161F] border-b border-[#2A344A] shadow-2xl max-h-[calc(100vh-60px)] overflow-y-auto p-4 space-y-4 animate-in slide-in-from-top-3 duration-200"
          >
            {/* Status Summary: Level & Subscription */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* CEFR Level Card */}
              {onOpenLevelModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLevelModal();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider leading-none">Nivel CEFR</p>
                    <p className="text-sm font-black text-[#38BDF8] leading-tight mt-1 truncate">{currentLevel}</p>
                    <p className="text-[10px] text-sky-300 underline mt-0.5">Ver progreso</p>
                  </div>
                </button>
              )}

              {/* Subscription Card */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSubscriptionModal();
                }}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                  subscriptionStatus === 'active'
                    ? 'border-amber-500/40 bg-amber-500/10 active:bg-amber-500/20'
                    : subscriptionStatus === 'free_trial'
                    ? 'border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E]'
                    : 'border-rose-500/30 bg-rose-500/10 active:bg-rose-500/20'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    subscriptionStatus === 'active'
                      ? 'bg-amber-500/20 border-amber-500/40 text-[#FBBF24]'
                      : subscriptionStatus === 'free_trial'
                      ? 'bg-sky-500/15 border-sky-500/30 text-[#38BDF8]'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {subscriptionStatus === 'active' ? (
                    <Crown className="w-4 h-4" />
                  ) : subscriptionStatus === 'free_trial' ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider leading-none">Pase</p>
                  <p
                    className={`text-sm font-bold leading-tight mt-1 truncate ${
                      subscriptionStatus === 'active'
                        ? 'text-[#FBBF24]'
                        : subscriptionStatus === 'free_trial'
                        ? 'text-[#E2E8F0]'
                        : 'text-rose-400'
                    }`}
                  >
                    {subscriptionStatus === 'active'
                      ? `PRO (${daysRemaining}d)`
                      : subscriptionStatus === 'free_trial'
                      ? '1 Prueba'
                      : 'Sin Pase'}
                  </p>
                  <p className="text-[10px] text-amber-300 underline mt-0.5">Gestionar</p>
                </div>
              </button>
            </div>

            {/* Menu Navigation Items */}
            <div className="space-y-2">
              {/* History Button */}
              {onOpenHistory && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#E2E8F0]">Historial de Conversaciones</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">Transcripciones, audio y feedback de IA</p>
                  </div>
                </button>
              )}

              {/* Corporate Presentation */}
              <a
                href="/presentation/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#E2E8F0]">Presentación Corporativa Interactiva</p>
                  <p className="text-[11px] text-[#94A3B8] truncate">Casos de uso para empresas y nichos</p>
                </div>
              </a>

              {/* Admin Panel Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                  isAdmin
                    ? 'border-amber-500/40 bg-amber-500/15 active:bg-amber-500/25'
                    : 'border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#FBBF24] shrink-0">
                  {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#E2E8F0]">
                      {isAdmin ? 'Panel de Administración PWA' : 'Acceso Administrador (PIN)'}
                    </p>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] truncate">
                    {isAdmin ? 'Gestión de escenarios, IA e inyector maestro' : 'Entra con PIN de seguridad'}
                  </p>
                </div>
              </button>

              {/* PWA Install Button */}
              {canInstallPwa && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onInstallPwa();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-sky-500/40 bg-sky-500/15 active:bg-sky-500/25 text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/25 border border-sky-500/50 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#38BDF8]">Instalar App en el Móvil</p>
                    <p className="text-[11px] text-sky-200/80 truncate">Acceso directo offline en pantalla de inicio</p>
                  </div>
                </button>
              )}

              {/* Settings Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-left transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-500/15 border border-slate-500/30 flex items-center justify-center text-[#94A3B8] shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#E2E8F0]">{t('nav.settings')}</p>
                  <p className="text-[11px] text-[#94A3B8] truncate">Voz de IA, velocidad y preferencias</p>
                </div>
              </button>
            </div>

            {/* Language Selection Grid */}
            <div className="pt-3 border-t border-[#2A344A]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 px-1">
                Idioma de la Interfaz
              </p>
              <div className="grid grid-cols-2 gap-2">
                {allLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-sky-500/15 border-sky-500/40 text-[#38BDF8] font-bold'
                        : 'bg-[#1C2331] border-[#2A344A] text-[#E2E8F0] active:bg-[#242D3E]'
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                    {language === lang.code && (
                      <Check className="w-3.5 h-3.5 text-[#38BDF8] ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
