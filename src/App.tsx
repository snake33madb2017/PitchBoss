import { useState, useEffect } from 'react';
import type { Scenario, SessionReport, AppSettings } from './types';
import { AdminStorageService } from './services/adminStorageService';
import { SubscriptionService, type UserSubscriptionState } from './services/subscriptionService';
import { Navbar } from './components/Navbar';
import { ScenarioCard } from './components/ScenarioCard';
import { ScenarioModal } from './components/ScenarioModal';
import { CallScreen } from './components/CallScreen';
import { SessionReportModal } from './components/SessionReportModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminHubModal } from './components/AdminHubModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import {
  Search,
  Filter,
  Sparkles,
  Briefcase,
  ShieldCheck,
  Zap,
  Layers,
  Settings2,
  LogOut,
  Plus,
  Check
} from 'lucide-react';

function AppContent() {
  const { t } = useTranslation();

  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => AdminStorageService.isAdminSessionActive());
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isAdminHubOpen, setIsAdminHubOpen] = useState(false);

  // Scenarios state managed by AdminStorageService
  const [scenarios, setScenarios] = useState<Scenario[]>(() => AdminStorageService.getScenarios());

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Active call & modals
  const [activeCallScenario, setActiveCallScenario] = useState<Scenario | null>(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<Scenario | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);

  // User subscription state (Freemium + License Keys)
  const [subscriptionState, setSubscriptionState] = useState<UserSubscriptionState>(() =>
    SubscriptionService.getSubscriptionState()
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [activationToast, setActivationToast] = useState<string | null>(null);

  // Auto-detect Magic Activation Link from URL (?key=PB-...)
  useEffect(() => {
    const activation = SubscriptionService.checkUrlForActivationKey();
    if (activation.activated) {
      setSubscriptionState(SubscriptionService.getSubscriptionState());
      setActivationToast(activation.message || '¡Licencia activada con éxito!');
      setTimeout(() => setActivationToast(null), 5000);
    }
  }, []);

  // App settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('persona_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      apiKey: localStorage.getItem('persona_gemini_api_key') || '',
      model: 'gemini-2.5-flash',
      preferredVoice: '',
      speechRate: 1.0,
      speechPitch: 1.0,
      autoListen: true,
      showRealtimeHints: true,
      hapticFeedback: true
    };
  });

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  // Scenario operations
  const handleOpenCreateScenario = () => {
    setScenarioToEdit(null);
    setIsScenarioModalOpen(true);
  };

  const handleOpenEditScenario = (scenario: Scenario) => {
    setScenarioToEdit(scenario);
    setIsScenarioModalOpen(true);
  };

  const handleSaveScenario = (scenario: Scenario) => {
    const updated = AdminStorageService.upsertScenario(scenario);
    setScenarios(updated);
  };

  const handleDuplicateScenario = (id: string) => {
    const { scenarios: updated, newScenario } = AdminStorageService.duplicateScenario(id);
    setScenarios(updated);
    if (newScenario) {
      handleOpenEditScenario(newScenario);
    }
  };

  const handleToggleVisibility = (id: string) => {
    const updated = AdminStorageService.toggleVisibility(id);
    setScenarios(updated);
  };

  const handleDeleteScenario = (id: string) => {
    const updated = AdminStorageService.deleteScenario(id);
    setScenarios(updated);
  };

  // Start simulation with subscription paywall verification
  const handleSelectScenario = (scenario: Scenario) => {
    // Admin has full unrestricted access for testing
    if (isAdmin) {
      setActiveCallScenario(scenario);
      return;
    }

    const check = SubscriptionService.canStartSimulation();
    if (!check.allowed) {
      setIsSubscriptionModalOpen(true);
      return;
    }

    // Record credit usage if on free trial
    if (check.reason === 'free_trial') {
      SubscriptionService.recordSimulationStarted();
      setSubscriptionState(SubscriptionService.getSubscriptionState());
    }

    setActiveCallScenario(scenario);
  };

  // Admin authentication handlers
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminHubOpen(true);
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminHubOpen(true);
  };

  const handleLogoutAdmin = () => {
    AdminStorageService.setAdminSessionActive(false);
    setIsAdmin(false);
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('persona_app_settings', JSON.stringify(newSettings));
  };

  // Unique niches list for filter tabs (considering visibility)
  const visibleScenarios = scenarios.filter((s) => (isAdmin ? true : !s.isHidden));
  const allNiches = ['all', ...Array.from(new Set(visibleScenarios.map((s) => s.niche)))];

  // Filtered scenarios
  const filteredScenarios = visibleScenarios.filter((scenario) => {
    const matchesSearch =
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.aiCharacter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.aiCharacter.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNiche = selectedNiche === 'all' || scenario.niche === selectedNiche;
    const matchesDifficulty = selectedDifficulty === 'all' || scenario.difficulty === selectedDifficulty;

    return matchesSearch && matchesNiche && matchesDifficulty;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Navigation */}
      <Navbar
        isAdmin={isAdmin}
        onOpenAdmin={handleOpenAdmin}
        onOpenNewScenario={handleOpenCreateScenario}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        subscriptionStatus={subscriptionState.status}
        daysRemaining={subscriptionState.daysRemaining}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
      />

      {/* Floating Activation Toast Notification */}
      {activationToast && (
        <div className="fixed top-18 right-4 z-50 max-w-sm p-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">¡Suscripción Activada!</p>
            <p className="text-[11px] text-emerald-300 leading-snug">{activationToast}</p>
          </div>
        </div>
      )}

      {/* Admin Quick Action Banner (When Admin Mode is Active) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-b border-amber-500/30 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300">Modo Administrador Activo</span>
            <span className="hidden sm:inline text-zinc-400">
              — Puedes editar cualquier escenario, duplicar, ocultar y gestionar copias de seguridad.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdminHubOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Panel de Control</span>
            </button>

            <button
              onClick={handleLogoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-[#131317] via-[#0f0f13] to-[#09090b] p-6 sm:p-10 overflow-hidden shadow-2xl shadow-black/90 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Subtle ambient gold tint */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero.badge')}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              {t('hero.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                {t('hero.titleHighlight')}
              </span>
            </h2>

            <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-zinc-300">
              {t('hero.description')}
            </p>

            {/* Quick Benefits Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-zinc-950/80 border-zinc-800 text-zinc-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('hero.benefitStrict')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-zinc-950/80 border-zinc-800 text-zinc-300 font-medium">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{t('hero.benefitHandsFree')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-zinc-950/80 border-zinc-800 text-zinc-300 font-medium">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                <span>{t('hero.benefitFeedback')}</span>
              </div>
            </div>
          </div>

          {/* PitchBoss Emblem Card */}
          <div className="relative z-10 hidden lg:flex flex-col items-center justify-center p-6 border border-zinc-800 rounded-3xl shrink-0 shadow-2xl shadow-black/80 backdrop-blur-sm max-w-[280px] bg-zinc-950/90">
            <div className="w-28 h-28 rounded-2xl border border-zinc-800/80 bg-[#09090b] p-2 flex items-center justify-center mb-3 shadow-lg shadow-black/60">
              <img src="/logo-icon.png" alt="PitchBoss Emblem" className="w-full h-full object-contain drop-shadow-md rounded-xl" />
            </div>
            <span className="text-base font-black flex items-center text-white">
              Pitch<span className="text-amber-400 ml-0.5">Boss</span>
            </span>
            <p className="text-[11px] text-center text-zinc-400 mt-1 leading-snug">
              {t('nav.brandSubtitle')}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full border rounded-2xl pl-10 pr-4 py-2.5 text-xs transition-colors focus:outline-none focus:border-amber-500/80 bg-zinc-900/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>

            {/* Difficulty Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> {t('filter.difficulty')}
              </span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 cursor-pointer bg-zinc-900 border-zinc-800 text-zinc-200"
              >
                <option value="all">{t('filter.allDifficulties')}</option>
                <option value="easy">{t('filter.easy')}</option>
                <option value="medium">{t('filter.medium')}</option>
                <option value="hard">{t('filter.hard')}</option>
                <option value="hostile">{t('filter.hostile')}</option>
              </select>
            </div>
          </div>

          {/* Industry Niche Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {allNiches.map((niche) => {
              const isSelected = selectedNiche === niche;
              return (
                <button
                  key={niche}
                  onClick={() => setSelectedNiche(niche)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md shadow-black/40'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {niche === 'all' ? t('filter.allNiches') : niche}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2 text-white">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{t('scenarios.available')} ({filteredScenarios.length})</span>
            </h3>

            {isAdmin && (
              <button
                onClick={handleOpenCreateScenario}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Escenario</span>
              </button>
            )}
          </div>

          {filteredScenarios.length === 0 ? (
            <div className="text-center py-16 border rounded-3xl p-8 space-y-3 bg-zinc-900/40 border-zinc-800/80">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-zinc-500 bg-zinc-800">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">
                {t('scenarios.emptyTitle')}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {t('scenarios.emptyDesc')}
              </p>
              <button
                onClick={handleOpenCreateScenario}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer bg-zinc-100 hover:bg-white text-zinc-950 shadow-md shadow-black/40"
              >
                {t('scenarios.createWithAi')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isAdmin={isAdmin}
                  onSelect={handleSelectScenario}
                  onEdit={handleOpenEditScenario}
                  onDuplicate={handleDuplicateScenario}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={handleDeleteScenario}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Fullscreen Voice Call Screen */}
      {activeCallScenario && (
        <CallScreen
          scenario={activeCallScenario}
          onEndCall={(report) => {
            setActiveCallScenario(null);
            setSessionReport(report);
          }}
          onExit={() => setActiveCallScenario(null)}
        />
      )}

      {/* Scenario Create & Edit Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => {
          setIsScenarioModalOpen(false);
          setScenarioToEdit(null);
        }}
        onSave={handleSaveScenario}
        scenarioToEdit={scenarioToEdit}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Admin PIN Prompt Modal */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Hub Management Dashboard */}
      <AdminHubModal
        isOpen={isAdminHubOpen}
        onClose={() => setIsAdminHubOpen(false)}
        scenarios={scenarios}
        onRefreshScenarios={(updated) => setScenarios(updated)}
        onOpenCreateScenario={handleOpenCreateScenario}
        onOpenEditScenario={handleOpenEditScenario}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Session Performance Debrief Modal */}
      {sessionReport && (
        <SessionReportModal
          report={sessionReport}
          onClose={() => setSessionReport(null)}
          onRestart={() => {
            const sc = scenarios.find((s) => s.id === sessionReport.scenarioId);
            if (sc) {
              setSessionReport(null);
              setActiveCallScenario(sc);
            }
          }}
        />
      )}

      {/* Subscription Paywall & License Management Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscriptionUpdated={() => setSubscriptionState(SubscriptionService.getSubscriptionState())}
        state={subscriptionState}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
