import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Settings,
  Download,
  ChevronDown,
  Check,
  ShieldCheck,
  Crown,
  Sparkles,
  Lock,
  History,
  Award,
  Presentation,
  Menu,
  X,
  Building2,
  LogOut,
  Users,
  User,
  MoreHorizontal,
  Globe,
  Key
} from 'lucide-react';
import type { EnglishLevel } from '../types';
import type { TeamMember } from '../services/teamAnalyticsService';
import { LevelEvaluationService } from '../services/levelEvaluationService';
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
  onOpenTepicMenu?: () => void;
  activeWorkspaceId?: string;
  activeWorkspaceName?: string;
  onSelectWorkspace?: (workspaceId: string) => void;
  onOpenCompanyAccess?: () => void;
  onExitCompanyWorkspace?: () => void;
  onLogoutAdmin?: () => void;
  hasCompanyLicense?: boolean;
  teamCount?: number;
  maxSeats?: number;
  activeEmployee?: TeamMember | null;
  onOpenEmployeeSelector?: () => void;
  onOpenNewCompany?: () => void;
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
  onOpenLovoMenu,
  onOpenTepicMenu,
  activeWorkspaceId = 'default',
  activeWorkspaceName,
  onSelectWorkspace,
  onOpenCompanyAccess,
  onExitCompanyWorkspace,
  onLogoutAdmin,
  hasCompanyLicense,
  teamCount,
  maxSeats,
  activeEmployee,
  onOpenEmployeeSelector,
  onOpenNewCompany
}) => {
  const { language, setLanguage, allLanguages } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isCartasDropdownOpen, setIsCartasDropdownOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const companyDropdownRef = useRef<HTMLDivElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const cartasDropdownRef = useRef<HTMLDivElement | null>(null);

  // Secret owner triple-click on PitchBoss logo to open Admin PIN login
  const logoClickCountRef = useRef(0);
  const logoClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickTimeoutRef.current) clearTimeout(logoClickTimeoutRef.current);

    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      onOpenAdmin();
    } else {
      logoClickTimeoutRef.current = setTimeout(() => {
        logoClickCountRef.current = 0;
      }, 500);
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(target)) {
        setIsCompanyDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
      if (cartasDropdownRef.current && !cartasDropdownRef.current.contains(target)) {
        setIsCartasDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on resize to desktop or ESC key
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsCompanyDropdownOpen(false);
        setIsMoreMenuOpen(false);
        setIsCartasDropdownOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleCompanySelect = (wsId: string) => {
    setIsCompanyDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (onSelectWorkspace) {
      onSelectWorkspace(wsId);
    }
  };

  const currentPitchTierName = LevelEvaluationService.getPitchTier(currentLevel);

  return (
    <header className="sticky top-0 z-30 border-b border-[#2A344A] bg-[#12161F]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* ========================================================= */}
        {/* LEFT CLUSTER: Brand Identity & Company Switcher Dropdown */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Logo & Platform Name */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 min-w-0 cursor-pointer select-none shrink-0"
            title="PitchBoss Enterprise (Triple clic para acceso administrador)"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#2A344A] bg-[#1C2331] p-0.5 overflow-hidden flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
              <img src="/logo-icon.png" alt="PitchBoss Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight flex items-center text-[#E2E8F0] leading-none">
                  Pitch<span className="text-[#38BDF8] ml-0.5">Boss</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#FBBF24] font-bold text-[9px] tracking-tight">
                  By Marco Daza
                </span>
              </div>
            </div>
          </div>

          {/* Company Switcher Pill (Desktop & Tablet) - Only visible for Admin or scoped company portal */}
          {(isAdmin || (activeWorkspaceId && activeWorkspaceId !== 'default' && activeWorkspaceId !== 'all')) && (
            <>
              <span className="hidden sm:inline-block text-[#2A344A]">/</span>
              <div className="relative shrink-0" ref={companyDropdownRef}>
                <button
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    activeWorkspaceId === 'lovo-bar'
                      ? 'border-[#D3A548]/50 bg-black/60 text-[#D3A548] hover:border-[#D3A548]'
                      : activeWorkspaceId === 'tepic-madrid'
                      ? 'border-[#B39964]/50 bg-[#21201E] text-[#FAF6EE] hover:border-[#B39964]'
                      : 'border-[#2A344A] bg-[#161D2B] hover:bg-[#1C2433] text-slate-200 hover:border-sky-500/40'
                  }`}
                  title="Cambiar de empresa o ver catálogo general"
                >
                  {activeWorkspaceId === 'lovo-bar' ? (
                    <>
                      <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-4 h-4 object-contain" />
                      <span className="font-serif font-black text-[#D3A548] truncate max-w-[110px] sm:max-w-[150px]">LOVO Bar</span>
                    </>
                  ) : activeWorkspaceId === 'tepic-madrid' ? (
                    <>
                      <div className="h-4 w-7 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/40">
                        <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-3 w-auto object-contain" />
                      </div>
                      <span className="font-serif font-bold text-[#FAF6EE] truncate max-w-[110px] sm:max-w-[150px]">Rest. Tepic</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-semibold text-slate-300 truncate max-w-[110px] sm:max-w-[150px]">
                        {activeWorkspaceName && activeWorkspaceName !== 'PitchBoss' ? activeWorkspaceName : 'Empresas (Todas)'}
                      </span>
                    </>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

            {/* Company Dropdown Menu */}
            {isCompanyDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#2A344A] bg-[#161D2B] text-[#E2E8F0] shadow-2xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#2A344A]">
                  Seleccionar Empresa / Entorno
                </div>

                {/* Option 1: All companies */}
                <button
                  onClick={() => handleCompanySelect('all')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition cursor-pointer text-left ${
                    activeWorkspaceId === 'all' || activeWorkspaceId === 'default'
                      ? 'bg-sky-500/15 text-sky-300 font-bold'
                      : 'text-slate-200 hover:bg-[#1F2738]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">Todas las Empresas</p>
                      <p className="text-[10px] text-slate-400 truncate">Catálogo completo (Tepic, LOVO y Demo)</p>
                    </div>
                  </div>
                  {(activeWorkspaceId === 'all' || activeWorkspaceId === 'default') && (
                    <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                </button>

                {/* Option 2: Restaurante Tepic */}
                <button
                  onClick={() => handleCompanySelect('tepic-madrid')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition cursor-pointer text-left ${
                    activeWorkspaceId === 'tepic-madrid'
                      ? 'bg-[#B39964]/20 text-[#F5DEB3] font-bold'
                      : 'text-slate-200 hover:bg-[#1F2738]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#B39964]/60 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-5 w-auto object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-serif font-bold text-white truncate">Restaurante Tepic</p>
                        <span className="text-[9px] px-1 rounded bg-[#2E281E] text-[#E8D4A2] border border-[#B39964]/40 font-semibold">Bib Gourmand</span>
                      </div>
                      <p className="text-[10px] text-stone-400 truncate">Calle de Ayala, 14 · Salamanca, Madrid</p>
                    </div>
                  </div>
                  {activeWorkspaceId === 'tepic-madrid' && (
                    <Check className="w-4 h-4 text-[#B39964] shrink-0" />
                  )}
                </button>

                {/* Option 3: LOVO Bar */}
                <button
                  onClick={() => handleCompanySelect('lovo-bar')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition cursor-pointer text-left ${
                    activeWorkspaceId === 'lovo-bar'
                      ? 'bg-[#D3A548]/20 text-[#D3A548] font-bold'
                      : 'text-slate-200 hover:bg-[#1F2738]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black border border-[#D3A548]/50 p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-serif font-bold text-[#D3A548] truncate">LOVO Bar Madrid</p>
                        <span className="text-[9px] px-1 rounded bg-[#D3A548]/20 text-[#D3A548] border border-[#D3A548]/30 font-semibold">71 Cócteles</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">Calle Echegaray 20 · Barrio de las Letras</p>
                    </div>
                  </div>
                  {activeWorkspaceId === 'lovo-bar' && (
                    <Check className="w-4 h-4 text-[#D3A548] shrink-0" />
                  )}
                </button>

                {/* Option 4: Register new enterprise */}
                <div className="p-2 border-t border-[#2A344A] bg-[#12161F]/60">
                  <button
                    onClick={() => {
                      setIsCompanyDropdownOpen(false);
                      if (onOpenNewCompany) onOpenNewCompany();
                      else if (onOpenAdmin) onOpenAdmin();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Registrar Nueva Empresa</span>
                  </button>
                </div>

                {/* Option 5: Acceso Empresas / Validar Licencia */}
                {onOpenCompanyAccess && (
                  <div className="p-2 border-t border-[#2A344A]/60 bg-[#12161F]/40">
                    <button
                      onClick={() => {
                        setIsCompanyDropdownOpen(false);
                        onOpenCompanyAccess();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sky-400 hover:bg-sky-500/10 text-xs font-semibold transition cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Ingresar con Licencia Corporativa</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>

        {/* ========================================================= */}
        {/* MOBILE HEADER BAR (< 768px): Clean, No Overlap, No Clipping */}
        {/* ========================================================= */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Pitch Level Pill */}
          {onOpenLevelModal && (
            <button
              onClick={onOpenLevelModal}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-[#E2E8F0] text-xs font-bold transition cursor-pointer shadow-sm"
              title="Tu nivel actual de Pitch"
            >
              <Award className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-[11px] font-black text-[#38BDF8] truncate max-w-[70px]">
                {currentPitchTierName}
              </span>
            </button>
          )}

          {/* Quick Carta button in mobile header (LOVO or Tepic) */}
          {activeWorkspaceId === 'lovo-bar' && onOpenLovoMenu ? (
            <button
              onClick={onOpenLovoMenu}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#D3A548]/50 bg-black/70 active:bg-black text-[#D3A548] text-xs font-bold transition cursor-pointer shadow-sm"
              title="Carta Trilogía LOVO Bar (71 cócteles)"
            >
              <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-3.5 h-3.5 object-contain" />
              <span className="text-[11px] font-serif font-black">Carta</span>
            </button>
          ) : activeWorkspaceId === 'tepic-madrid' && onOpenTepicMenu ? (
            <button
              onClick={onOpenTepicMenu}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#B39964]/50 bg-[#21201E] active:bg-[#282622] text-[#FAF6EE] text-xs font-bold transition cursor-pointer shadow-sm"
              title="Carta Oficial Restaurante Tepic (Michelin Bib Gourmand)"
            >
              <div className="h-3.5 w-6 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/40">
                <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-2.5 w-auto object-contain" />
              </div>
              <span className="text-[11px] font-serif font-bold">Carta</span>
            </button>
          ) : null}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMobileMenuOpen
                ? 'border-[#38BDF8] bg-sky-500/15 text-[#38BDF8]'
                : 'border-[#2A344A] bg-[#1C2331] active:bg-[#242D3E] text-[#E2E8F0]'
            }`}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            title="Menú de opciones"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#38BDF8]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP HEADER BAR (>= 768px): Structured & Consolidated */}
        {/* ========================================================= */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* PRIMARY CONTEXTUAL MENU: Carta LOVO or Carta Tepic or Cartas Selector */}
          {activeWorkspaceId === 'lovo-bar' && onOpenLovoMenu ? (
            <button
              onClick={onOpenLovoMenu}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#D3A548]/50 bg-black/80 hover:bg-black text-[#D3A548] text-xs font-bold transition cursor-pointer shadow-sm shrink-0 shadow-black"
              title="Carta Trilogía LOVO Bar (71 cócteles)"
            >
              <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-4 h-4 object-contain" />
              <span className="font-serif font-black tracking-wide">Carta LOVO</span>
              <span className="text-[10px] bg-[#D3A548]/25 text-[#D3A548] px-1.5 py-0.2 rounded font-mono font-bold">71</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D3A548] animate-pulse" />
            </button>
          ) : activeWorkspaceId === 'tepic-madrid' && onOpenTepicMenu ? (
            <button
              onClick={onOpenTepicMenu}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#B39964]/50 bg-[#21201E] hover:bg-[#2A2925] text-[#FAF6EE] text-xs font-bold transition cursor-pointer shadow-sm shrink-0 shadow-black"
              title="Carta Oficial Restaurante Tepic (Michelin Bib Gourmand)"
            >
              <div className="h-4 w-7 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/40">
                <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-3 w-auto object-contain" />
              </div>
              <span className="font-serif font-bold tracking-wide">Carta Tepic</span>
              <span className="text-[10px] bg-[#B39964]/25 text-[#F3E5AB] px-1.5 py-0.2 rounded font-mono font-bold">Ayala 14</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B39964] animate-pulse" />
            </button>
          ) : isAdmin ? (
            /* Both Cartas Quick Dropdown when in General/All - ONLY visible for Admin */
            <div className="relative shrink-0" ref={cartasDropdownRef}>
              <button
                onClick={() => setIsCartasDropdownOpen(!isCartasDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2A344A] bg-[#161D2B] hover:bg-[#1F2738] text-xs font-bold text-slate-200 transition cursor-pointer shadow-sm shrink-0"
                title="Explorar cartas gastronómicas oficiales"
              >
                <span>📖</span>
                <span>Cartas Oficiales</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCartasDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#2A344A] bg-[#161D2B] text-[#E2E8F0] shadow-2xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  {onOpenLovoMenu && (
                    <button
                      onClick={() => {
                        setIsCartasDropdownOpen(false);
                        onOpenLovoMenu();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-amber-500/15 text-amber-300 font-bold transition cursor-pointer"
                    >
                      <span className="text-base">🍸</span>
                      <div className="min-w-0">
                        <p>Carta Trilogía LOVO Bar</p>
                        <p className="text-[10px] text-slate-400 font-normal">71 Cócteles & Josephine Baker</p>
                      </div>
                    </button>
                  )}
                  {onOpenTepicMenu && (
                    <button
                      onClick={() => {
                        setIsCartasDropdownOpen(false);
                        onOpenTepicMenu();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-stone-700 text-white font-bold transition cursor-pointer border-t border-[#2A344A]"
                    >
                      <span className="text-base">🥑</span>
                      <div className="min-w-0">
                        <p>Carta Restaurante Tepic</p>
                        <p className="text-[10px] text-slate-400 font-normal">Tacos, Mezcales & Bib Gourmand</p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* ACTIVE EMPLOYEE / ALUMNO PILL */}
          {hasCompanyLicense && onOpenEmployeeSelector && (
            <button
              onClick={onOpenEmployeeSelector}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-[#38BDF8] text-xs font-bold transition cursor-pointer shadow-sm shrink-0"
              title={activeEmployee ? `Estudiando como: ${activeEmployee.name} (${activeEmployee.role})` : 'Seleccionar colaborador'}
            >
              <User className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="truncate max-w-[100px] lg:max-w-[130px]">
                {activeEmployee ? activeEmployee.name : 'Alumno'}
              </span>
            </button>
          )}

          {/* PITCH LEVEL BADGE */}
          {onOpenLevelModal && (
            <button
              onClick={onOpenLevelModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-xs text-[#E2E8F0] transition cursor-pointer shadow-sm shrink-0 font-bold"
              title="Tu nivel actual y progreso en PitchBoss"
            >
              <Award className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-[#38BDF8]">{currentPitchTierName}</span>
            </button>
          )}

          {/* PRO PLAN BADGE */}
          {subscriptionStatus === 'active' ? (
            <button
              onClick={onOpenSubscriptionModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[#FBBF24] text-xs font-bold transition cursor-pointer shadow-sm shrink-0"
              title="Suscripción Pro Activa"
            >
              <Crown className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
              <span>PRO</span>
              {typeof daysRemaining === 'number' && (
                <span className="text-[10px] text-amber-300 font-mono hidden xl:inline">({daysRemaining}d)</span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenSubscriptionModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1C2331] hover:bg-[#242D3E] border border-[#2A344A] text-slate-300 text-xs font-medium transition cursor-pointer shrink-0"
              title="Prueba gratuita disponible"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span className="text-xs">Prueba</span>
            </button>
          )}

          {/* ADMIN / GERENTE MODE BUTTON */}
          {isAdmin ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-[#FBBF24] text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
              title="Abrir Panel Maestro de Administración"
            >
              <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
              <span className="hidden xl:inline">Admin</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          ) : hasCompanyLicense ? (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-[#38BDF8] text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
              title={`Panel Gerente de Empresa (${teamCount ?? 0}/${maxSeats ?? 10} cupos utilizados)`}
            >
              <Users className="w-4 h-4 text-[#38BDF8]" />
              <span className="hidden xl:inline">Gerente</span>
              {typeof maxSeats === 'number' && (
                <span className="text-[10px] bg-sky-500/20 text-sky-200 px-1.5 py-0.2 rounded font-mono font-bold hidden sm:inline">
                  {teamCount ?? 0}/{maxSeats}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-700/80 bg-[#161D2B] hover:bg-[#1E2638] text-xs font-bold text-stone-300 hover:text-white transition shadow-sm cursor-pointer shrink-0"
              title="Acceso Administrador (PIN)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Admin</span>
            </button>
          )}

          {/* CONSOLIDATED "MORE OPTIONS" MENU (•••): Eliminates Button Overcrowding */}
          <div className="relative shrink-0" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMoreMenuOpen
                  ? 'border-sky-500 bg-sky-500/15 text-sky-400'
                  : 'border-[#2A344A] bg-[#1C2331] hover:bg-[#242D3E] text-slate-300 hover:text-white'
              }`}
              title="Más opciones y herramientas"
              aria-label="Más opciones"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#2A344A] bg-[#161D2B] text-[#E2E8F0] shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-xl">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#2A344A]">
                  Opciones Rápidas
                </div>

                {/* Language Switch: Structured 5-column grid without overflow or scroll */}
                <div className="px-3.5 py-2.5 border-b border-[#2A344A]/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span>Idioma de la Plataforma</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                      {language.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 bg-[#12161F] p-1 rounded-xl border border-[#2A344A]">
                    {allLanguages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`py-1 text-center rounded-lg text-xs font-bold transition cursor-pointer ${
                          language === l.code
                            ? 'bg-sky-500 text-slate-950 shadow-sm font-black'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                        title={l.name}
                      >
                        {l.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* History */}
                {onOpenHistory && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenHistory();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-slate-200 hover:bg-[#1F2738] hover:text-white transition cursor-pointer"
                  >
                    <History className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Historial de Prácticas</span>
                  </button>
                )}

                {/* PWA Install */}
                {canInstallPwa && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onInstallPwa();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-emerald-300 hover:bg-emerald-500/15 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instalar App en Ordenador</span>
                  </button>
                )}

                {/* New Scenario (Admin) */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenNewScenario();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-sky-300 hover:bg-sky-500/15 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Crear Nuevo Escenario</span>
                  </button>
                )}

                {/* Settings (Admin) */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-slate-200 hover:bg-[#1F2738] hover:text-white transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Ajustes del Sistema</span>
                  </button>
                )}

                {/* Corporate Exit / Logout */}
                {isAdmin && onLogoutAdmin ? (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onLogoutAdmin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-rose-300 hover:bg-rose-500/15 transition cursor-pointer border-t border-[#2A344A]/60"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Cerrar Sesión Admin</span>
                  </button>
                ) : activeWorkspaceId && activeWorkspaceId !== 'default' && onExitCompanyWorkspace ? (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onExitCompanyWorkspace();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-rose-300 hover:bg-rose-500/15 transition cursor-pointer border-t border-[#2A344A]/60"
                  >
                    <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Salir de la Empresa</span>
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE DRAWER: Comprehensive, Clean & User Friendly       */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[52px] bottom-0 z-40 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div
            ref={mobileMenuRef}
            className="bg-[#12161F] border-b border-[#2A344A] shadow-2xl max-h-[calc(100vh-55px)] overflow-y-auto overflow-x-hidden p-4 space-y-4 animate-in slide-in-from-top-3 duration-200"
          >
            {/* SECTIONS 1 & 2: Company Switcher & Menus (Only visible for Admin or scoped company portal) */}
            {(isAdmin || (activeWorkspaceId && activeWorkspaceId !== 'default' && activeWorkspaceId !== 'all')) && (
              <>
                {/* SECTION 1: Company Switcher Tabs */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Empresa / Entorno Activo
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#161D2B] p-1 rounded-2xl border border-[#2A344A]">
                    <button
                      onClick={() => handleCompanySelect('all')}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeWorkspaceId === 'all' || activeWorkspaceId === 'default'
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => handleCompanySelect('tepic-madrid')}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeWorkspaceId === 'tepic-madrid'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🌮 Tepic
                    </button>
                    <button
                      onClick={() => handleCompanySelect('lovo-bar')}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer ${
                        activeWorkspaceId === 'lovo-bar'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🍸 LOVO
                    </button>
                  </div>
                </div>

                {/* SECTION 2: Official Gastronomy Menus */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Cartas Oficiales
                  </p>

                  {/* Carta LOVO Button */}
                  {onOpenLovoMenu && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenLovoMenu();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#D3A548]/40 bg-gradient-to-r from-black via-[#0B0E14] to-[#12161F] text-left transition cursor-pointer shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-black border border-[#D3A548]/50 p-1 flex items-center justify-center shrink-0 shadow-md">
                        <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="h-full w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-serif font-black text-[#D3A548]">Carta Trilogía LOVO Bar</p>
                          <span className="text-[10px] bg-[#D3A548] text-black font-black px-1.5 py-0.2 rounded">71 Cócteles</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">La Musa, Taxonomía & La Tribu</p>
                      </div>
                    </button>
                  )}

                  {/* Carta Tepic Button */}
                  {onOpenTepicMenu && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenTepicMenu();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-[#B39964]/50 bg-gradient-to-r from-[#21201E] via-[#1A1917] to-[#12161F] text-left transition cursor-pointer shadow-md hover:border-[#B39964]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#B39964]/60 p-1 flex items-center justify-center shrink-0 shadow-md">
                        <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-5 w-auto object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-serif font-bold text-white">Carta Restaurante Tepic</p>
                          <span className="text-[10px] bg-[#2E281E] text-[#E8D4A2] font-bold px-1.5 py-0.2 rounded border border-[#B39964]/40">
                            Bib Gourmand
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 truncate mt-0.5">Tacos nixtamalizados, mezcales y vinos (Ayala 14)</p>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* SECTION 3: Progress & Profile Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Level Card */}
              {onOpenLevelModal && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenLevelModal();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#2A344A] bg-[#161D2B] text-left transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nivel Pitch</p>
                    <p className="text-xs font-black text-sky-400 truncate">{currentPitchTierName}</p>
                  </div>
                </button>
              )}

              {/* Subscription Card */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSubscriptionModal();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-[#2A344A] bg-[#161D2B] text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Plan</p>
                  <p className="text-xs font-black text-amber-400 truncate">
                    {subscriptionStatus === 'active' ? 'PRO' : 'Prueba'}
                  </p>
                </div>
              </button>
            </div>

            {/* SECTION 4: Tools & Actions */}
            <div className="space-y-1.5 pt-2 border-t border-[#2A344A]">
              {/* History */}
              {onOpenHistory && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <History className="w-4 h-4 text-sky-400" />
                  <span>Historial de Grabaciones & Prácticas</span>
                </button>
              )}

              {/* PWA Install */}
              {canInstallPwa && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onInstallPwa();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Instalar App en el Móvil</span>
                </button>
              )}

              {/* Corporate Presentation */}
              <a
                href="/presentation/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-500/10 transition cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-indigo-400" />
                <span>Presentación Corporativa Interactiva</span>
              </a>

              {/* Admin or Manager Hub */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isAdmin ? 'Panel Maestro de Administración' : 'Panel de Control / Acceso PIN'}</span>
              </button>

              {/* Exit or Logout */}
              {isAdmin && onLogoutAdmin ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogoutAdmin();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Cerrar Sesión de Administrador</span>
                </button>
              ) : activeWorkspaceId && activeWorkspaceId !== 'default' && onExitCompanyWorkspace ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExitCompanyWorkspace();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Salir del Portal Corporativo</span>
                </button>
              ) : null}
            </div>

            {/* SECTION 5: Language Selection (Zero horizontal overflow/scroll on mobile) */}
            <div className="pt-2 border-t border-[#2A344A] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Idioma de la Plataforma:</span>
                </span>
                <span className="text-[10px] font-bold uppercase text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                  {language.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 bg-[#161D2B] p-1 rounded-xl border border-[#2A344A]">
                {allLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`py-2 text-center rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                      language === l.code
                        ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    title={l.name}
                  >
                    <span>{l.flag}</span>
                    <span className="font-mono text-[11px]">{l.code.toUpperCase()}</span>
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
