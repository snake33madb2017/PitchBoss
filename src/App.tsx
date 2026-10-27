import { useState, useEffect } from 'react';
import type { Scenario, SessionReport, AppSettings, SavedSession, LevelProgress, LevelPromotionEvent, Workspace } from './types';
import { AdminStorageService } from './services/adminStorageService';
import { SubscriptionService, type UserSubscriptionState } from './services/subscriptionService';
import { LevelEvaluationService } from './services/levelEvaluationService';
import { NotificationService } from './services/notificationService';
import { Navbar } from './components/Navbar';
import { ScenarioCard } from './components/ScenarioCard';
import { ScenarioModal } from './components/ScenarioModal';
import { CallScreen } from './components/CallScreen';
import { SessionReportModal } from './components/SessionReportModal';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { LevelAssessmentModal } from './components/LevelAssessmentModal';
import { LevelPromotionModal } from './components/LevelPromotionModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminHubModal } from './components/AdminHubModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LovoMenuModal } from './components/LovoMenuModal';
import { TepicMenuModal } from './components/TepicMenuModal';
import { CompanyAccessModal } from './components/CompanyAccessModal';
import { EmployeeSelectorModal } from './components/EmployeeSelectorModal';
import { BusinessOnboardingModal } from './components/BusinessOnboardingModal';
import { CloudSyncService } from './services/cloudSyncService';
import { TeamAnalyticsService, type TeamMember } from './services/teamAnalyticsService';
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
  Check,
  Building2,
  Key,
  ArrowRight,
  Lock,
  Users,
  Eye,
  Wheat,
  Wine
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
  const [selectedPitchTier, setSelectedPitchTier] = useState<string>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [isBusinessOnboardingOpen, setIsBusinessOnboardingOpen] = useState(false);

  // Active call & modals
  const [activeCallScenario, setActiveCallScenario] = useState<Scenario | null>(null);
  const [activeSessionToResume, setActiveSessionToResume] = useState<SavedSession | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<Scenario | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);

  // User subscription state (Freemium + License Keys)
  const [subscriptionState, setSubscriptionState] = useState<UserSubscriptionState>(() =>
    SubscriptionService.getSubscriptionState()
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isLovoMenuOpen, setIsLovoMenuOpen] = useState(false);
  const [isTepicMenuOpen, setIsTepicMenuOpen] = useState(false);
  const [isCompanyAccessModalOpen, setIsCompanyAccessModalOpen] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => CloudSyncService.getCurrentWorkspaceId());
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [adminViewAll, setAdminViewAll] = useState(false);
  const [activationToast, setActivationToast] = useState<string | null>(null);

  // Corporate Login View State ("Vista cómoda y standard para login corporativo sin mostrar empresas")
  const [isCorporateLoginView, setIsCorporateLoginView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'login' || params.get('portal') === 'login' || params.get('portal') === 'empresa';
    }
    return false;
  });
  const [corporateLicenseInput, setCorporateLicenseInput] = useState('');
  const [corporateEmployeeInput, setCorporateEmployeeInput] = useState('');
  const [corporateLoginError, setCorporateLoginError] = useState<string | null>(null);
  const [isSubmittingCorporateLogin, setIsSubmittingCorporateLogin] = useState(false);

  // Company license input & error state on locked gate
  const [companyKeyInput, setCompanyKeyInput] = useState('');
  const [companyKeyError, setCompanyKeyError] = useState<string | null>(null);

  // Collaborator CEFR Level & Promotion state
  const [levelProgress, setLevelProgress] = useState<LevelProgress>(() =>
    LevelEvaluationService.getLevelProgress()
  );
  const [isLevelAssessmentModalOpen, setIsLevelAssessmentModalOpen] = useState(false);
  const [promotionEvent, setPromotionEvent] = useState<LevelPromotionEvent | null>(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  // Load available workspaces from backend / local cache
  useEffect(() => {
    CloudSyncService.getWorkspaces().then(setWorkspaces);
  }, []);

  // Auto-detect Magic Activation Link from URL (?key=PB-...) & company locks
  useEffect(() => {
    SubscriptionService.checkUrlForActivationKeyAsync().then((activation) => {
      if (activation.activated) {
        setSubscriptionState(SubscriptionService.getSubscriptionState());
        setActiveWorkspaceId(CloudSyncService.getCurrentWorkspaceId());
        setActivationToast(activation.message || '¡Licencia activada con éxito!');
        setTimeout(() => setActivationToast(null), 5000);
      }
    });
  }, []);

  // Auto-sync with cloud backend & schedule daily practice notifications
  useEffect(() => {
    NotificationService.scheduleDailyCheck();
    AdminStorageService.syncWithCloud().then((synced) => {
      if (synced && synced.length > 0) {
        setScenarios(synced);
      }
    });
  }, []);

  // Auto-detect menu modals, company deep links and login view (?modal=tepic, ?modal=lovo, ?company=..., ?view=login)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyParam = params.get('company') || params.get('workspace');
    const currentSub = SubscriptionService.getSubscriptionState();
    const isUserCompanyLocked = Boolean(
      currentSub.status === 'active' &&
      currentSub.activeLicense?.workspaceId &&
      currentSub.activeLicense.workspaceId !== 'default'
    );

    // If an employee is licensed to a company, strictly lock their environment to that company
    if (isUserCompanyLocked && !AdminStorageService.isAdminSessionActive()) {
      const lockedWs = currentSub.activeLicense!.workspaceId!;
      CloudSyncService.setCurrentWorkspaceId(lockedWs);
      setActiveWorkspaceId(lockedWs);
    } else if (companyParam) {
      CloudSyncService.setCurrentWorkspaceId(companyParam);
      setActiveWorkspaceId(companyParam);
    }

    const viewParam = params.get('view') || params.get('portal');
    if (viewParam === 'login' || viewParam === 'empresa') {
      setIsCorporateLoginView(true);
    }
    if (params.get('modal') === 'tepic' || params.get('menu') === 'tepic') {
      setIsTepicMenuOpen(true);
    }
    if (params.get('modal') === 'lovo' || params.get('menu') === 'lovo') {
      setIsLovoMenuOpen(true);
    }
  }, []);

  // Auto-detect direct scenario deep link (?scenario=...)
  useEffect(() => {
    if (scenarios.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const targetScenarioId = params.get('scenario');
      if (targetScenarioId) {
        const found = scenarios.find((s) => s.id === targetScenarioId);
        if (found) {
          handleSelectScenario(found);
        }
      }
    }
  }, [scenarios]);

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

  const handleResumeSession = (session: SavedSession) => {
    const sc = scenarios.find((s) => s.id === session.scenarioId);
    if (sc) {
      setActiveSessionToResume(session);
      setActiveCallScenario(sc);
    }
  };

  const handleStartFreshScenario = (scenario: Scenario) => {
    setActiveSessionToResume(null);
    handleSelectScenario(scenario);
  };

  // Admin / Company Manager authentication handlers
  const handleOpenAdmin = () => {
    if (isAdmin) {
      setIsAdminHubOpen(true);
    } else if (hasCompanyLicense) {
      // Company Manager with active license enters directly into their company management dashboard
      setIsAdminHubOpen(true);
    } else {
      setIsAdminPinModalOpen(true);
    }
  };

  // Discreet keyboard shortcut for owner/admin: Ctrl + Shift + A or Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminHubOpen(true);
  };

  const handleLogoutAdmin = () => {
    AdminStorageService.setAdminSessionActive(false);
    CloudSyncService.clearAdminToken();
    setIsAdmin(false);
    setIsAdminHubOpen(false);
    setIsAdminPinModalOpen(false);
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('persona_app_settings', JSON.stringify(newSettings));
  };

  // Switch or Exit enterprise workspace
  const handleSwitchToWorkspace = (wsId: string) => {
    CloudSyncService.setCurrentWorkspaceId(wsId);
    setActiveWorkspaceId(wsId);
    if (wsId === 'default') {
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      window.history.replaceState({}, document.title, `${window.location.pathname}?company=${encodeURIComponent(wsId)}`);
    }
  };

  const handleExitCompanyWorkspace = () => {
    SubscriptionService.resetLocalSubscription();
    CloudSyncService.setCurrentWorkspaceId('default');
    setActiveWorkspaceId('default');
    setSubscriptionState(SubscriptionService.getSubscriptionState());
    setIsCorporateLoginView(false);
    handleSwitchToWorkspace('default');
  };

  const handleOpenCorporateLogin = () => {
    setIsCorporateLoginView(true);
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'login');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPresentation = () => {
    setIsCorporateLoginView(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('portal');
    window.history.pushState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCorporateLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!corporateLicenseInput.trim()) {
      setCorporateLoginError('Por favor ingresa tu código de licencia corporativa.');
      return;
    }
    setIsSubmittingCorporateLogin(true);
    setCorporateLoginError(null);

    try {
      const result = await SubscriptionService.activateLicenseAsync(corporateLicenseInput.trim());
      if (result.success && result.license) {
        const wsId = result.license.workspaceId || 'default';
        setSubscriptionState(SubscriptionService.getSubscriptionState());
        setActiveWorkspaceId(wsId);
        CloudSyncService.setCurrentWorkspaceId(wsId);

        // If collaborator name provided, register and assign session to them
        if (corporateEmployeeInput.trim()) {
          const cleanName = corporateEmployeeInput.trim();
          const members = TeamAnalyticsService.getTeamMembers(wsId);
          let m = members.find((mem) => mem.name.toLowerCase() === cleanName.toLowerCase());
          if (!m) {
            m = TeamAnalyticsService.addMember({
              name: cleanName,
              role: 'Personal de Sala',
              email: `${cleanName.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
              workspaceId: wsId,
              scenarioId: '',
              scenarioTitle: 'Entrenamiento Inicial',
              totalSessions: 0,
              menuFluencyScore: 70,
              pronunciationScore: 70,
              upSellingScore: 65,
              objectionsMastered: 0,
              totalObjections: 3,
              totalSpokenMinutes: 0,
              lastActiveDate: Date.now(),
              status: 'in_progress',
              executiveFeedback: 'Registrado para entrenamiento en el portal corporativo.'
            });
          }
          if (m) {
            TeamAnalyticsService.setActiveEmployeeId(wsId, m.id);
            setActiveEmployee(m);
          }
        }

        setIsCorporateLoginView(false);
        setCorporateLicenseInput('');
        setCorporateEmployeeInput('');

        // Update URL to company
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('portal');
        if (wsId && wsId !== 'default') {
          url.searchParams.set('company', wsId);
        }
        window.history.pushState({}, '', url.toString());

        setActivationToast(`¡Bienvenido a ${result.license.companyName}! Tu entorno exclusivo está activo.`);
        setTimeout(() => setActivationToast(null), 5000);
      } else {
        setCorporateLoginError(result.message || 'Código de licencia no válido o no encontrado.');
      }
    } catch (err: any) {
      setCorporateLoginError(err.message || 'Error al validar la licencia con el servidor.');
    } finally {
      setIsSubmittingCorporateLogin(false);
    }
  };

  // Effective company / workspace identifier:
  // Licensed employee is strictly locked to their company; Admin has free workspace switching
  const isLicensedCompany = Boolean(
    subscriptionState.status === 'active' &&
    subscriptionState.activeLicense?.workspaceId &&
    subscriptionState.activeLicense.workspaceId !== 'default'
  );

  const effectiveWorkspaceId = (!isAdmin && isLicensedCompany)
    ? subscriptionState.activeLicense!.workspaceId!
    : (subscriptionState.activeLicense?.workspaceId || activeWorkspaceId);

  const isScopedToCompany = Boolean(effectiveWorkspaceId && effectiveWorkspaceId !== 'default');
  const activeWorkspaceName =
    subscriptionState.activeLicense?.companyName ||
    (effectiveWorkspaceId === 'tepic-madrid'
      ? 'Restaurante Tepic (Ayala 14)'
      : effectiveWorkspaceId === 'lovo-bar'
      ? 'LOVO Bar & Hospitality'
      : 'PitchBoss');

  // Strict Enterprise Security:
  // Must have an active license assigned to this workspace OR be logged in as Admin!
  const hasCompanyLicense = Boolean(
    subscriptionState.status === 'active' &&
    subscriptionState.activeLicense &&
    subscriptionState.activeLicense.workspaceId === effectiveWorkspaceId
  );
  const hasCompanyAccess = isAdmin || hasCompanyLicense;
  const officialLicense = SubscriptionService.getOfficialLicenseForWorkspace(effectiveWorkspaceId);

  // Seat quotas & scoped employee count for company plan management
  const maxSeats = subscriptionState.activeLicense?.employeeSeats || (effectiveWorkspaceId === 'tepic-madrid' ? 15 : 10);
  const teamMembersForWorkspace = TeamAnalyticsService.getTeamMembers(effectiveWorkspaceId);
  const teamCount = teamMembersForWorkspace.length;

  // Active employee / student profile studying in this company portal
  const [isEmployeeSelectorOpen, setIsEmployeeSelectorOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<TeamMember | null>(() =>
    TeamAnalyticsService.getActiveEmployee(effectiveWorkspaceId)
  );

  useEffect(() => {
    setActiveEmployee(TeamAnalyticsService.getActiveEmployee(effectiveWorkspaceId));
  }, [effectiveWorkspaceId]);

  const handleUnlockCompanyWithKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyKeyInput.trim()) {
      setCompanyKeyError('Por favor ingresa tu código de licencia corporativa.');
      return;
    }
    const result = await SubscriptionService.activateLicenseAsync(companyKeyInput.trim(), effectiveWorkspaceId);
    if (result.success && result.license) {
      setSubscriptionState(SubscriptionService.getSubscriptionState());
      setActiveWorkspaceId(result.license.workspaceId || effectiveWorkspaceId);
      setActivationToast(result.message);
      setTimeout(() => setActivationToast(null), 5000);
      setCompanyKeyInput('');
      setCompanyKeyError(null);
    } else {
      setCompanyKeyError(result.message || 'Código de licencia no válido o expirado.');
    }
  };

  // Multi-Tenant Partitioning & Scenario Scoping:
  // - If scoped to an enterprise (e.g. tepic-madrid or lovo-bar with active license or admin):
  //   - Licensed staff see scenarios belonging to their assigned company!
  // - If on General/Default Face:
  //   - Filter by selectedCompanyFilter ('all', 'tepic-madrid', 'lovo-bar', 'default')
  //   - 'all' displays ALL scenarios across Tepic, LOVO and General demos so content is immediately accessible!
  const tenantScenarios = scenarios.filter((s) => {
    if (isScopedToCompany) {
      if (!hasCompanyAccess) {
        return false;
      }
      if (!isAdmin || !adminViewAll) {
        return s.workspaceId === effectiveWorkspaceId;
      }
      return true;
    }

    // On general public catalog face:
    if (selectedCompanyFilter === 'lovo-bar') {
      return s.workspaceId === 'lovo-bar';
    }
    if (selectedCompanyFilter === 'tepic-madrid') {
      return s.workspaceId === 'tepic-madrid';
    }
    if (selectedCompanyFilter === 'default') {
      return s.workspaceId === 'default' || !s.workspaceId;
    }

    // Default 'all': Show all scenarios so users can explore and test LOVO, Tepic & Demo freely!
    return true;
  });

  // Unique niches list for filter tabs (considering visibility)
  const visibleScenarios = tenantScenarios.filter((s) => (isAdmin ? true : !s.isHidden));
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
    const matchesPitchTier =
      selectedPitchTier === 'all' ||
      (selectedPitchTier === 'pitch1' && LevelEvaluationService.getPitchTier(scenario.targetEnglishLevel || scenario.title) === 'Pitch One') ||
      (selectedPitchTier === 'pitch2' && LevelEvaluationService.getPitchTier(scenario.targetEnglishLevel || scenario.title) === 'Pitch Two') ||
      (selectedPitchTier === 'pitch3' && LevelEvaluationService.getPitchTier(scenario.targetEnglishLevel || scenario.title) === 'Pitch Three');

    return matchesSearch && matchesNiche && matchesDifficulty && matchesPitchTier;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#12161F] text-[#E2E8F0] selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navigation */}
      <Navbar
        isAdmin={isAdmin}
        onOpenAdmin={handleOpenAdmin}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenNewScenario={handleOpenCreateScenario}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        currentLevel={levelProgress.currentLevel}
        onOpenLevelModal={() => setIsLevelAssessmentModalOpen(true)}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        subscriptionStatus={subscriptionState.status}
        daysRemaining={subscriptionState.daysRemaining}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenLovoMenu={() => setIsLovoMenuOpen(true)}
        onOpenTepicMenu={() => setIsTepicMenuOpen(true)}
        activeWorkspaceId={isScopedToCompany ? effectiveWorkspaceId : selectedCompanyFilter}
        activeWorkspaceName={activeWorkspaceName}
        onSelectWorkspace={(wsId) => {
          if (wsId === 'all') {
            setSelectedCompanyFilter('all');
            handleExitCompanyWorkspace();
          } else {
            setSelectedCompanyFilter(wsId);
            handleSwitchToWorkspace(wsId);
          }
        }}
        onOpenCompanyAccess={handleOpenCorporateLogin}
        onExitCompanyWorkspace={handleExitCompanyWorkspace}
        hasCompanyLicense={hasCompanyLicense}
        teamCount={teamCount}
        maxSeats={maxSeats}
        activeEmployee={activeEmployee}
        onOpenEmployeeSelector={() => setIsEmployeeSelectorOpen(true)}
        onOpenNewCompany={() => setIsBusinessOnboardingOpen(true)}
      />

      {/* Floating Activation Toast Notification */}
      {activationToast && (
        <div className="fixed top-16 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-sm p-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs text-white">¡Suscripción Activada!</p>
            <p className="text-[11px] text-emerald-300 leading-snug break-words">{activationToast}</p>
          </div>
        </div>
      )}

      {/* Admin Quick Action Banner (When Master Admin Mode is Active) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-b border-amber-500/30 px-3.5 sm:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 text-[#FBBF24] shrink-0" />
            <span className="font-bold text-[#FBBF24]">Modo Administrador Maestro</span>
            <span className="text-[#94A3B8]">
              — Espacio: <strong className="text-white">{activeWorkspaceName}</strong>
            </span>
            {isScopedToCompany && (
              <button
                onClick={() => setAdminViewAll(!adminViewAll)}
                className="px-2.5 py-0.5 rounded-lg bg-[#1C2331] hover:bg-[#2A344A] text-slate-300 hover:text-white border border-[#2A344A] text-[11px] transition cursor-pointer"
                title="Alternar entre ver solo los escenarios de esta empresa o el catálogo completo"
              >
                {adminViewAll ? (
                  <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-sky-400" /> Viendo Todos los Escenarios</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-400" /> Filtrando solo {activeWorkspaceName}</span>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsCompanyAccessModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-sky-400 hover:bg-sky-500/10 border border-sky-500/30 transition-colors cursor-pointer text-xs"
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Cambiar Portal</span>
            </button>

            <button
              onClick={() => setIsAdminHubOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 font-bold transition-colors cursor-pointer shadow-sm text-xs"
            >
              <Settings2 className="w-3.5 h-3.5 shrink-0" />
              <span>Panel de Control</span>
            </button>

            <button
              onClick={handleLogoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-[#1C2331] border border-[#2A344A] transition-colors cursor-pointer text-xs"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* Company Manager Quick Action Banner (When Company License is Active and NOT Super Admin) */}
      {!isAdmin && hasCompanyLicense && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-transparent border-b border-emerald-500/30 px-3.5 sm:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-emerald-400">Licencia Corporativa Activa</span>
            <span className="text-[#94A3B8]">
              — {activeWorkspaceName} · Plan con{' '}
              <strong className="text-white">
                {teamCount}/{maxSeats} cupos utilizados
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsAdminHubOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold transition-all cursor-pointer shadow-sm text-xs"
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span><span className="hidden sm:inline">Gestión de </span>Equipo & Reportes ({teamCount}/{maxSeats})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3.5 sm:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {isScopedToCompany && !hasCompanyAccess ? (
          /* ========================================================= */
          /* LOCKED COMPANY ACCESS PORTAL (Strict Multi-Tenant Gate)   */
          /* ========================================================= */
          <div className="max-w-2xl mx-auto py-8 sm:py-12 animate-in fade-in zoom-in-95">
            <div className="rounded-3xl border border-stone-700/80 bg-[#161D2B]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-md text-center space-y-6">
              {/* Company Emblem & Lock Badge */}
              <div className="relative inline-block mx-auto">
                {effectiveWorkspaceId === 'tepic-madrid' ? (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center p-2 mx-auto shadow-xl bg-[#FAF7F2] border-2 border-[#B39964]"
                  >
                    <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-10 w-auto object-contain" />
                  </div>
                ) : effectiveWorkspaceId === 'lovo-bar' ? (
                  <div className="w-24 h-24 rounded-2xl bg-black border-2 border-[#D3A548] p-3 flex items-center justify-center mx-auto shadow-xl">
                    <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[#38BDF8] mx-auto shadow-xl">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-[#12161F]">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso Restringido · Requiere Licencia Corporativa</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeWorkspaceName}
                </h2>
                <p className="text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
                  Las simulaciones de entrenamiento en inglés con IA, protocolos de hospitalidad y cartas oficiales de este portal son exclusivas para el personal autorizado con licencia corporativa o administradores de PitchBoss.
                </p>
              </div>

              {/* License Key Redemption Box */}
              <div className="p-5 rounded-2xl bg-[#12161F] border border-[#2A344A] text-left space-y-3">
                <label className="block text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Ingresa la Clave de Licencia de tu Empresa:</span>
                </label>
                <form onSubmit={handleUnlockCompanyWithKey} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={companyKeyInput}
                      onChange={(e) => {
                        setCompanyKeyInput(e.target.value);
                        setCompanyKeyError(null);
                      }}
                      placeholder="PB-365D-XXXX-YYYY"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#1C2331] border border-[#2A344A] text-white font-mono text-xs uppercase placeholder:text-stone-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/20"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Desbloquear</span>
                    </button>
                  </div>
                  {companyKeyError && (
                    <p className="text-xs text-rose-400 font-medium">{companyKeyError}</p>
                  )}
                </form>

                {/* Helpful testing hint for evaluators (Only visible in admin mode) */}
                {isAdmin && officialLicense && (
                  <div className="pt-2 border-t border-[#2A344A]/60 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate">Clave oficial emitida para esta empresa (Admin):</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyKeyInput(officialLicense.key);
                        setCompanyKeyError(null);
                      }}
                      className="text-sky-400 hover:text-sky-300 font-mono font-bold underline ml-2 cursor-pointer shrink-0"
                      title="Copiar clave de prueba al formulario"
                    >
                      Autocompletar ({officialLicense.key.slice(0, 15)}...)
                    </button>
                  </div>
                )}
              </div>

              {/* Alternative Owner, Demo & Navigation Actions */}
              <div className="pt-4 border-t border-[#2A344A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                {isAdmin && officialLicense && (
                  <button
                    type="button"
                    onClick={() => {
                      const res = SubscriptionService.activateLicense(officialLicense.key, effectiveWorkspaceId);
                      if (res.success) {
                        setSubscriptionState(SubscriptionService.getSubscriptionState());
                        setActivationToast('¡Portal de empresa desbloqueado con éxito!');
                        setTimeout(() => setActivationToast(null), 4000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-[#0284C7] hover:from-sky-400 hover:to-sky-500 text-white font-bold transition shadow-lg shadow-sky-500/20 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Desbloquear Modo Evaluación</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Soy Propietario (PIN)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExitCompanyWorkspace}
                  className="text-stone-400 hover:text-white transition flex items-center gap-1 cursor-pointer py-1"
                >
                  <span>↩ Volver a Portada General</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="relative rounded-3xl border border-[#2A344A] bg-[#1C2331] p-6 sm:p-10 overflow-hidden shadow-2xl shadow-black/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Subtle ambient cyan glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

          {effectiveWorkspaceId === 'tepic-madrid' ? (
            /* ======================================================== */
            /* TEPIC SPECIAL BRAND HERO (Salamanca Oasis & Bib Gourmand) */
            /* ======================================================== */
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2E281E] border border-[#B39964] text-xs font-semibold text-[#E8D4A2]">
                  <span className="w-2 h-2 rounded-full bg-[#B39964] animate-pulse" />
                  <span>RESTAURANTE TEPIC · GUÍA MICHELIN BIB GOURMAND (AYALA 14, MADRID)</span>
                </div>
                {subscriptionState.activeLicense && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E3327] border border-[#2D7D52] text-[11px] font-semibold text-[#A7F3D0]">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Licencia Corporativa ({subscriptionState.activeLicense.employeeSeats || 15} empleados)</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-tight text-white">
                Simulador de Pitch y Servicio Bilingüe para{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6CA] via-[#B39964] to-[#C29F5D]">
                  Restaurante Tepic
                </span>
              </h2>

              <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-stone-200">
                Entrenamiento conversacional con IA para equipo de sala y barra. Domina en inglés la explicación del nixtamalizado de maíz, tacos al pastor y cochinita pibil, maridajes de mezcales artesanales y protocolos de hospitalidad Michelin.
              </p>

              {/* Active Employee (Student) indicator */}
              {hasCompanyLicense && (
                activeEmployee ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#B39964]/40 bg-[#171614]/90 text-xs backdrop-blur-sm shadow-sm flex-wrap">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-stone-400">Alumno en turno:</span>
                    <strong className="text-white font-bold">{activeEmployee.name}</strong>
                    <span className="text-[11px] text-[#FDE68A] font-medium">({activeEmployee.role})</span>
                    <span className="text-stone-600">•</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">{activeEmployee.totalSessions} prácticas</span>
                    <button
                      onClick={() => setIsEmployeeSelectorOpen(true)}
                      className="ml-1 text-[11px] text-[#B39964] hover:text-[#FDE68A] underline font-semibold cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-sky-500/40 bg-[#171614]/90 text-xs backdrop-blur-sm shadow-sm flex-wrap">
                    <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-stone-300">Sin colaborador asignado</span>
                    <button
                      onClick={() => setIsEmployeeSelectorOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow ml-1"
                    >
                      Crear mi Alumno
                    </button>
                  </div>
                )
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
                <button
                  onClick={() => setIsTepicMenuOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B39964] hover:bg-[#C29F5D] text-stone-950 font-black transition shadow-lg shadow-[#B39964]/20 cursor-pointer"
                >
                  <div className="h-4 w-7 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/50">
                    <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-3 w-auto object-contain" />
                  </div>
                  <span>Abrir Carta Oficial Tepic</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[#21201E] border-[#38342D] text-stone-200 font-medium">
                  <Wheat className="w-3.5 h-3.5 text-[#B39964]" />
                  <span>100% Maíz Nixtamalizado</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-[#21201E] border-[#38342D] text-stone-200 font-medium">
                  <Wine className="w-3.5 h-3.5 text-[#B39964]" />
                  <span>Mezcales de Oaxaca</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={handleExitCompanyWorkspace}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#38342D] bg-[#282622] hover:bg-[#322F2A] text-stone-300 hover:text-white transition cursor-pointer"
                    title="Volver a la portada general de PitchBoss (Super Admin)"
                  >
                    <span>↩ Cambiar Empresa</span>
                  </button>
                )}
              </div>
            </div>
          ) : effectiveWorkspaceId === 'lovo-bar' ? (
            /* ======================================================== */
            /* LOVO BAR SPECIAL BRAND HERO                              */
            /* ======================================================== */
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D3A548]/15 border border-[#D3A548]/40 text-xs font-semibold text-[#D3A548]">
                  <span className="w-2 h-2 rounded-full bg-[#D3A548] animate-pulse" />
                  <span>LOVO BAR MADRID · COCKTAILS & ART DÉCO (HUERTAS)</span>
                </div>
                {subscriptionState.activeLicense && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Licencia Corporativa ({subscriptionState.activeLicense.employeeSeats || 10} empleados)</span>
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-tight text-white">
                Simulador de Pitch y Coctelería para{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0D0] via-[#D3A548] to-[#B58C3A]">
                  LOVO Bar Madrid
                </span>
              </h2>

              <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-[#CBD5E1]">
                Entrenamiento conversacional con IA para bartenders y equipo de sala. Domina en inglés la Trilogía de 71 cócteles, la vida de Josephine Baker, los 4 estadios y protocolos de up-selling de destilados de alta gama.
              </p>

              {/* Active Employee (Student) indicator */}
              {hasCompanyLicense && (
                activeEmployee ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#D3A548]/40 bg-black/80 text-xs backdrop-blur-sm shadow-sm flex-wrap">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-stone-400">Alumno en turno:</span>
                    <strong className="text-white font-bold">{activeEmployee.name}</strong>
                    <span className="text-[11px] text-[#D3A548] font-medium">({activeEmployee.role})</span>
                    <span className="text-stone-600">•</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">{activeEmployee.totalSessions} prácticas</span>
                    <button
                      onClick={() => setIsEmployeeSelectorOpen(true)}
                      className="ml-1 text-[11px] text-[#D3A548] hover:text-white underline font-semibold cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-sky-500/40 bg-black/80 text-xs backdrop-blur-sm shadow-sm flex-wrap">
                    <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-stone-300">Sin colaborador asignado</span>
                    <button
                      onClick={() => setIsEmployeeSelectorOpen(true)}
                      className="px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] cursor-pointer shadow ml-1"
                    >
                      Crear mi Alumno
                    </button>
                  </div>
                )
              )}

              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
                <button
                  onClick={() => setIsLovoMenuOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D3A548] hover:bg-[#B58C3A] text-black font-black transition shadow-lg shadow-[#D3A548]/25 cursor-pointer"
                >
                  <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-4 h-4 object-contain" />
                  <span>Abrir Carta LOVO (71 Cócteles)</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-black/60 border-[#2A344A] text-slate-200 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#D3A548]" />
                  <span>Trilogía 3 Tomos</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={handleExitCompanyWorkspace}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#2A344A] bg-[#12161F] hover:bg-[#18202F] text-slate-400 hover:text-white transition cursor-pointer"
                    title="Volver a la portada general de PitchBoss (Super Admin)"
                  >
                    <span>↩ Cambiar Empresa</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* STANDARD / GENERAL HERO (PitchBoss Public Platform)      */
            /* ======================================================== */
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-[#38BDF8]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('hero.badge')}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-[#E2E8F0]">
                {t('hero.title')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-sky-300 to-[#0EA5E9]">
                  {t('hero.titleHighlight')}
                </span>
              </h2>

              <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-[#94A3B8]">
                {t('hero.description')}
              </p>

              {/* Quick Benefits Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#12161F] border-[#2A344A] text-[#E2E8F0] font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t('hero.benefitStrict')}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#12161F] border-[#2A344A] text-[#E2E8F0] font-medium">
                  <Zap className="w-4 h-4 text-[#FBBF24]" />
                  <span>{t('hero.benefitHandsFree')}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-[#12161F] border-[#2A344A] text-[#94A3B8] font-medium">
                  <Briefcase className="w-4 h-4 text-[#38BDF8]" />
                  <span>{t('hero.benefitFeedback')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Right Emblem Card */}
          <div className="relative z-10 hidden lg:flex flex-col items-center justify-center p-6 border border-[#2A344A] rounded-3xl shrink-0 shadow-2xl backdrop-blur-sm max-w-[280px] bg-[#12161F]/90">
            {effectiveWorkspaceId === 'tepic-madrid' ? (
              <>
                <div 
                  className="w-28 h-20 rounded-2xl flex items-center justify-center mb-3 shadow-xl bg-[#FAF7F2] p-2 border-2 border-[#B39964]"
                >
                  <img src="/images/logos/tepic-logo.png" alt="Restaurante Tepic" className="h-12 w-auto object-contain" />
                </div>
                <span className="text-base font-serif font-black text-center text-white">
                  Restaurante Tepic
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#B39964] font-bold mt-0.5">
                  Michelin Bib Gourmand
                </span>
                <p className="text-[11px] text-center text-stone-300 mt-1 leading-snug">
                  Calle de Ayala, 14 · Barrio de Salamanca · Madrid
                </p>
              </>
            ) : effectiveWorkspaceId === 'lovo-bar' ? (
              <>
                <div className="w-24 h-24 rounded-2xl bg-black border-2 border-[#D3A548] p-3 flex items-center justify-center mb-3 shadow-xl shadow-black">
                  <img src="/images/logos/lovo-logo.webp" alt="LOVO Bar" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-serif font-black text-center text-[#D3A548]">
                  LOVO Bar Madrid
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#D3A548] font-bold mt-0.5">
                  Hospitality & Cocktails
                </span>
                <p className="text-[11px] text-center text-zinc-400 mt-1 leading-snug">
                  Calle de Echegaray · Barrio de las Letras · Madrid
                </p>
              </>
            ) : (
              <>
                <div className="w-28 h-28 rounded-2xl border border-[#2A344A] bg-[#1C2331] p-2 flex items-center justify-center mb-3 shadow-lg shadow-black/40">
                  <img src="/logo-icon.png" alt="PitchBoss Emblem" className="w-full h-full object-contain drop-shadow-md rounded-xl" />
                </div>
                <span className="text-base font-black flex items-center text-[#E2E8F0]">
                  Pitch<span className="text-[#38BDF8] ml-0.5">Boss</span>
                </span>
                <p className="text-[11px] text-center text-[#94A3B8] mt-1 leading-snug">
                  {t('nav.brandSubtitle')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CORPORATE LOGIN INTERNAL VIEW ("La Interna para Empresas") */}
        {/* ========================================================= */}
        {!isScopedToCompany && isCorporateLoginView && (
          <div className="py-6 sm:py-10 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Top Bar with Return button */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToPresentation}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#2A344A] bg-[#161D2B] hover:bg-[#1C2331] text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                <span>← Volver a la Presentación</span>
              </button>
              <span className="text-[11px] font-mono text-slate-500">PitchBoss Enterprise · B2B Login</span>
            </div>

            {/* Main Corporate Login Card */}
            <div className="rounded-3xl border border-[#2A344A] bg-[#161D2B]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-7">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto shadow-lg shadow-sky-500/10">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Portal de Acceso Corporativo
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                  Ingreso estándar para empresas acreditadas. Introduce tu código de licencia para acceder a tus contenidos exclusivos, cartas oficiales y reportes.
                </p>
              </div>

              {/* Corporate Login Form */}
              <form onSubmit={handleCorporateLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sky-400">
                      <Key className="w-3.5 h-3.5" />
                      <span>Código de Licencia de tu Empresa:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Formato: PB-XXXX-XXXX</span>
                  </label>
                  <input
                    type="text"
                    value={corporateLicenseInput}
                    onChange={(e) => {
                      setCorporateLicenseInput(e.target.value);
                      setCorporateLoginError(null);
                    }}
                    placeholder="PB-365D-XXXX-YYYY"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#12161F] border border-[#2A344A] text-white font-mono text-sm sm:text-base uppercase placeholder:text-stone-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Nombre del Alumno / Empleado en Turno (Opcional):</span>
                  </label>
                  <input
                    type="text"
                    value={corporateEmployeeInput}
                    onChange={(e) => setCorporateEmployeeInput(e.target.value)}
                    placeholder="Ej. Laura Gómez (Jefa de Sala)"
                    className="w-full px-4 py-3 rounded-2xl bg-[#12161F] border border-[#2A344A] text-white text-xs sm:text-sm placeholder:text-stone-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Si introduces tu nombre, los minutos hablados y tu nivel Pitch se auditarán bajo tu perfil individual para gerencia.
                  </p>
                </div>

                {corporateLoginError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                    <span className="font-medium">{corporateLoginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingCorporateLogin}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-[#0284C7] hover:from-sky-400 hover:to-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-sky-500/25 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Validar Licencia y Entrar al Entorno Privado</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>

              {/* Security & Multi-tenant Privacy Badges */}
              <div className="p-5 rounded-2xl border border-[#2A344A] bg-[#12161F]/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Garantía de Confidencialidad y Aislamiento</span>
                </h4>
                <ul className="text-xs text-[#94A3B8] space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Privacidad total:</strong> Ninguna otra empresa puede visualizar tus cartas, manuales, precios o personal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Configuración instantánea:</strong> Tu código de licencia activa automáticamente el logotipo y protocolos de tu marca.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Auditoría ejecutiva:</strong> La dirección de tu empresa puede exportar métricas, fluidez y certificaciones de sala en cualquier momento.</span>
                  </li>
                </ul>
              </div>

              {/* Support Help */}
              <div className="text-center pt-2 border-t border-[#2A344A]/60">
                <p className="text-xs text-slate-500">
                  ¿Tu empresa aún no cuenta con licencia corporativa?{' '}
                  <button
                    onClick={handleBackToPresentation}
                    className="text-sky-400 hover:text-sky-300 underline font-semibold cursor-pointer"
                  >
                    Explorar la Presentación Pública de PitchBoss
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PITCHBOSS SAAS PRESENTATION SECTION (Public Root)          */}
        {/* ========================================================= */}
        {!isScopedToCompany && !isCorporateLoginView && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 3 Presentation Value Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pillar 1: Conversational Voice AI */}
              <div className="rounded-3xl border border-[#2A344A] bg-gradient-to-br from-[#1C2331] to-[#12161F] p-6 space-y-3 shadow-xl hover:border-sky-500/40 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">IA Conversacional Bilingüe</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Simulación realista con clientes angloparlantes exigentes. Práctica manos libres por voz, feedback pedagógico instantáneo y calibración del nivel CEFR (A1 a C2).
                </p>
              </div>

              {/* Pillar 2: Isolated Enterprise Portals */}
              <div className="rounded-3xl border border-[#2A344A] bg-gradient-to-br from-[#1C2331] to-[#12161F] p-6 space-y-3 shadow-xl hover:border-emerald-500/40 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Portales Privados y Cifrados</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Entornos multi-inquilino 100% aislados. Cada organización opera con sus cartas gastronómicas, técnicas de up-selling y co-branding institucional con estricta confidencialidad.
                </p>
              </div>

              {/* Pillar 3: Executive Team Certification */}
              <div className="rounded-3xl border border-[#2A344A] bg-gradient-to-br from-[#1C2331] to-[#12161F] p-6 space-y-3 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Auditoría y Certificación</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Métricas ejecutivas en vivo para la dirección: minutos de práctica, precisión en venta cruzada y estado de certificación para saber quién está realmente listo para sala.
                </p>
              </div>
            </div>

            {/* Corporate Access Banner CTA */}
            <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-r from-[#1C2331] via-[#161D2B] to-[#12161F] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1.5 max-w-xl">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                  Acceso Empresas Acreditadas
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  ¿Tu empresa ya cuenta con una Licencia Corporativa?
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Ingresa a la vista cómoda de autenticación corporativa para canjear tu código y acceder a tus módulos de entrenamiento y cartas privadas.
                </p>
              </div>

              <button
                onClick={handleOpenCorporateLogin}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-[#0284C7] hover:from-sky-400 hover:to-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-sky-500/25 cursor-pointer shrink-0 active:scale-98"
              >
                <Building2 className="w-4 h-4" />
                <span>Ingresar a mi Portal Corporativo</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

          </div>
        )}

        {/* Scenarios Catalog & Management (Only shown for Admin or scoped Company Portals, never on public landing) */}
        {(isAdmin || isScopedToCompany) && !isCorporateLoginView && (
          <>
            {/* Header: Admin vs Company Portal */}
            {isAdmin && (
              <div className="border-b border-sky-500/30 pb-3 pt-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <span>Catálogo de Escenarios y Gestión de Empresas</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Modo Administrador
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Supervisión y gestión de escenarios asignados a cada empresa (Restaurante Tepic, LOVO Bar y Demo Matriz).
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Enterprise Workspace Selector Tabs (Only visible in Admin Mode) */}
              {isAdmin && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                    selectedCompanyFilter === 'all'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-[#1C2331] text-slate-300 border-[#2A344A] hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Todas las Empresas</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-mono">
                    {scenarios.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCompanyFilter('tepic-madrid')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                    selectedCompanyFilter === 'tepic-madrid'
                      ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md shadow-[#B39964]/20 font-black'
                      : 'bg-[#1C2331] text-stone-300 border-[#2A344A] hover:border-[#B39964]/60 hover:text-white'
                  }`}
                >
                  <div className="h-4 w-7 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/40">
                    <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-2.5 w-auto object-contain" />
                  </div>
                  <span className="font-serif">Restaurante Tepic</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-mono">
                    {scenarios.filter((s) => s.workspaceId === 'tepic-madrid').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCompanyFilter('lovo-bar')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                    selectedCompanyFilter === 'lovo-bar'
                      ? 'bg-[#D3A548] text-black border-[#D3A548] shadow-md shadow-[#D3A548]/25 font-black'
                      : 'bg-[#1C2331] text-slate-300 border-[#2A344A] hover:border-[#D3A548]/60 hover:text-white'
                  }`}
                >
                  <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-4 h-4 object-contain" />
                  <span className="font-serif">LOVO Bar Madrid</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-mono">
                    {scenarios.filter((s) => s.workspaceId === 'lovo-bar').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCompanyFilter('default')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                    selectedCompanyFilter === 'default'
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-[#1C2331] text-slate-300 border-[#2A344A] hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span>⭐</span>
                  <span>Demo Matriz</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/25 font-mono">
                    {scenarios.filter((s) => s.workspaceId === 'default' || !s.workspaceId).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBusinessOnboardingOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 ml-auto"
                  title="Añadir una nueva empresa u hotel a PitchBoss"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Empresa</span>
                </button>
              </div>
            )}

            {/* Direct Company Menu Shortcut Banner when a company is selected */}
              {selectedCompanyFilter === 'lovo-bar' && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-black via-[#0B0E14] to-[#12161F] border border-[#D3A548]/40 animate-in fade-in shadow-xl shadow-black">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black border border-[#D3A548]/50 p-1 flex items-center justify-center shrink-0 shadow-md">
                      <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-serif font-black text-[#D3A548]">LOVO Bar · Coctelería Emocional (Josephine Baker)</p>
                      <p className="text-[11px] text-zinc-400">10 escenarios de entrenamiento activos basados en la Trilogía oficial.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLovoMenuOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#D3A548] hover:bg-[#B58C3A] text-black font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-[#D3A548]/25"
                  >
                    <img src="/images/logos/lovo-logo.webp" alt="LOVO" className="w-3.5 h-3.5 object-contain" />
                    <span>Abrir Carta LOVO (71 Cócteles)</span>
                  </button>
                </div>
              )}

              {selectedCompanyFilter === 'tepic-madrid' && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#21201E] via-[#1A1917] to-[#12161F] border border-[#B39964]/50 animate-in fade-in shadow-xl shadow-black">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-8 rounded-xl bg-[#FAF7F2] border border-[#B39964]/60 p-1 flex items-center justify-center shrink-0 shadow-md">
                      <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-5 w-auto object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-serif font-bold text-white">Restaurante Tepic · Michelin Bib Gourmand (Ayala 14)</p>
                      <p className="text-[11px] text-stone-300">3 escenarios de sala y maridaje con tacos nixtamalizados y mezcales.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTepicMenuOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#B39964] hover:bg-[#C29F5D] text-stone-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-[#B39964]/20"
                  >
                    <div className="h-3.5 w-6 bg-[#FAF7F2] rounded px-0.5 flex items-center justify-center border border-[#B39964]/50">
                      <img src="/images/logos/tepic-logo.png" alt="Tepic" className="h-2.5 w-auto object-contain" />
                    </div>
                    <span>Abrir Carta Tepic</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-full lg:max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full border rounded-2xl pl-10 pr-4 py-2.5 text-xs transition-colors focus:outline-none focus:border-[#38BDF8] bg-[#1C2331] border-[#2A344A] text-[#E2E8F0] placeholder:text-[#94A3B8]"
              />
            </div>

            {/* Selectors Group: Responsive and neatly wrapped */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 shrink-0 scrollbar-none">
              {/* Pitch Tier Selector */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span className="hidden sm:inline">Nivel</span> Pitch
                </span>
                <select
                  value={selectedPitchTier}
                  onChange={(e) => setSelectedPitchTier(e.target.value)}
                  className="border rounded-xl px-2.5 sm:px-3 py-2 text-xs focus:outline-none focus:border-[#38BDF8] cursor-pointer bg-[#1C2331] border-[#2A344A] text-[#E2E8F0] font-medium"
                >
                  <option value="all">Todos los Niveles</option>
                  <option value="pitch1">Pitch One</option>
                  <option value="pitch2">Pitch Two</option>
                  <option value="pitch3">Pitch Three</option>
                </select>
              </div>

              {/* Difficulty Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span className="hidden sm:inline">{t('filter.difficulty')}</span>
                </span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border rounded-xl px-2.5 sm:px-3 py-2 text-xs focus:outline-none focus:border-[#38BDF8] cursor-pointer bg-[#1C2331] border-[#2A344A] text-[#E2E8F0] font-medium"
                >
                  <option value="all">{t('filter.allDifficulties')}</option>
                  <option value="easy">{t('filter.easy')}</option>
                  <option value="medium">{t('filter.medium')}</option>
                  <option value="hard">{t('filter.hard')}</option>
                  <option value="hostile">{t('filter.hostile')}</option>
                </select>
              </div>
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
                      ? 'bg-[#0EA5E9] text-slate-950 font-bold shadow-md shadow-sky-950/40'
                      : 'bg-[#1C2331] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#2A344A] hover:border-[#3D4A66]'
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
            <h3 className="text-base font-bold flex items-center gap-2 text-[#E2E8F0]">
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              <span>
                {isScopedToCompany
                  ? `Módulos de Entrenamiento · ${activeWorkspaceName} (${filteredScenarios.length})`
                  : `${t('scenarios.available')} · Catálogo General (${filteredScenarios.length})`}
              </span>
            </h3>

            {isAdmin && (
              <button
                onClick={handleOpenCreateScenario}
                className="flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] hover:text-[#0EA5E9] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Escenario</span>
              </button>
            )}
          </div>

          {filteredScenarios.length === 0 ? (
            <div className="text-center py-12 border rounded-3xl p-8 space-y-4 bg-[#1C2331] border-[#2A344A]">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-[#38BDF8] bg-sky-500/10 border border-sky-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-[#E2E8F0]">
                  {isScopedToCompany ? t('scenarios.emptyTitle') : 'Accede al Portal de tu Empresa'}
                </p>
                <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                  {isScopedToCompany
                    ? t('scenarios.emptyDesc')
                    : 'Para garantizar la confidencialidad de cada organización, los escenarios de simulación están asignados de forma privada a cada empresa cliente.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleOpenCorporateLogin}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Ingresar con Licencia de Empresa</span>
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedNiche('all');
                    setSelectedDifficulty('all');
                    setSelectedPitchTier('all');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#12161F] hover:bg-[#18202F] border border-[#2A344A] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isAdmin={isAdmin}
                  onSelect={handleStartFreshScenario}
                  onResume={handleResumeSession}
                  onEdit={handleOpenEditScenario}
                  onDuplicate={handleDuplicateScenario}
                  onToggleVisibility={handleToggleVisibility}
                  onDelete={handleDeleteScenario}
                />
              ))}
            </div>
          )}
        </div>
          </>
        )}
        </>
      )}
      </main>

      {/* Discreet Platform Footer with Owner Entry */}
      <footer className="border-t border-[#1E2638] bg-[#0E121A]/80 backdrop-blur-sm py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-lg bg-[#1C2331] border border-[#2A344A] p-0.5 overflow-hidden flex items-center justify-center">
              <img src="/logo-icon.png" alt="PitchBoss" className="w-full h-full object-cover rounded" />
            </div>
            <p>
              © {new Date().getFullYear()} <strong className="text-stone-300 font-semibold">PitchBoss Enterprise</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {isScopedToCompany && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1C2331] border border-[#2A344A] text-stone-300 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Portal: {activeWorkspaceName}</span>
              </span>
            )}

            <button
              onClick={handleOpenAdmin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                isAdmin
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-bold'
                  : 'text-stone-500 hover:text-stone-300 hover:bg-white/5 border border-transparent hover:border-stone-800'
              }`}
              title={isAdmin ? "Panel de control de PitchBoss (Activo)" : "Acceso restringido para el propietario (Ctrl + Shift + A)"}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panel Propietario</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-stone-600" />
                  <span>Acceso Administración</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Fullscreen Voice Call Screen */}
      {activeCallScenario && (
        <CallScreen
          scenario={activeCallScenario}
          initialSession={activeSessionToResume}
          onEndCall={(report) => {
            setActiveCallScenario(null);
            setActiveSessionToResume(null);

            // Link employee details to report
            const enrichedReport: SessionReport = {
              ...report,
              employeeName: activeEmployee?.name,
              workspaceId: effectiveWorkspaceId
            };
            setSessionReport(enrichedReport);

            // Record progress under the active employee profile
            if (activeEmployee) {
              const updated = TeamAnalyticsService.recordSessionResult(activeEmployee.id, enrichedReport);
              if (updated) {
                setActiveEmployee(updated);
              }
            }

            // Autonomous evaluation and level promotion check
            const evalResult = LevelEvaluationService.evaluateSession(enrichedReport);
            setLevelProgress(evalResult.progress);
            if (evalResult.promoted && evalResult.promotionEvent) {
              setPromotionEvent(evalResult.promotionEvent);
              setIsPromotionModalOpen(true);
            }
          }}
          onExit={() => {
            setActiveCallScenario(null);
            setActiveSessionToResume(null);
          }}
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
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
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
        isSuperAdmin={isAdmin}
        companyLicense={subscriptionState.activeLicense}
        activeWorkspaceIdProp={effectiveWorkspaceId}
        activeWorkspaceNameProp={activeWorkspaceName}
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

      {/* Session History & Audit Transcripts Modal */}
      <SessionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onResumeSession={(session) => {
          setIsHistoryModalOpen(false);
          handleResumeSession(session);
        }}
        onViewReport={(session) => {
          if (session.report) {
            setSessionReport(session.report);
          }
        }}
      />

      {/* Level Assessment & CEFR Progress Modal */}
      <LevelAssessmentModal
        isOpen={isLevelAssessmentModalOpen}
        onClose={() => setIsLevelAssessmentModalOpen(false)}
        isAdmin={isAdmin}
        onLevelChanged={(updated) => setLevelProgress(updated)}
      />

      {/* Level Promotion Celebration Modal */}
      <LevelPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        event={promotionEvent}
        onViewReport={() => {
          setIsPromotionModalOpen(false);
        }}
      />

      {/* Menu Modals */}
      <LovoMenuModal
        isOpen={isLovoMenuOpen}
        onClose={() => setIsLovoMenuOpen(false)}
      />
      <TepicMenuModal
        isOpen={isTepicMenuOpen}
        onClose={() => setIsTepicMenuOpen(false)}
      />
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscriptionUpdated={() => setSubscriptionState(SubscriptionService.getSubscriptionState())}
        state={subscriptionState}
      />
      <CompanyAccessModal
        isOpen={isCompanyAccessModalOpen}
        onClose={() => setIsCompanyAccessModalOpen(false)}
        workspaces={workspaces}
        onSelectWorkspace={handleSwitchToWorkspace}
        onLicenseActivated={(msg) => {
          setSubscriptionState(SubscriptionService.getSubscriptionState());
          setActiveWorkspaceId(CloudSyncService.getCurrentWorkspaceId());
          setActivationToast(msg);
          setTimeout(() => setActivationToast(null), 5000);
        }}
      />
      <EmployeeSelectorModal
        isOpen={isEmployeeSelectorOpen}
        onClose={() => setIsEmployeeSelectorOpen(false)}
        workspaceId={effectiveWorkspaceId}
        workspaceName={activeWorkspaceName}
        activeEmployee={activeEmployee}
        onSelectEmployee={(emp) => {
          TeamAnalyticsService.setActiveEmployeeId(effectiveWorkspaceId, emp.id);
          setActiveEmployee(emp);
        }}
        maxSeats={maxSeats}
      />
      <BusinessOnboardingModal
        isOpen={isBusinessOnboardingOpen}
        onClose={() => setIsBusinessOnboardingOpen(false)}
        onScenarioCreated={(newScenario) => {
          setScenarios(AdminStorageService.getScenarios());
          if (newScenario.workspaceId) {
            handleSwitchToWorkspace(newScenario.workspaceId);
          }
          setIsBusinessOnboardingOpen(false);
          setActivationToast('¡Nueva empresa creada con éxito!');
          setTimeout(() => setActivationToast(null), 5000);
        }}
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
