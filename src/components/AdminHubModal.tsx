import React, { useState } from 'react';
import type { Scenario, AppSettings } from '../types';
import { AdminStorageService } from '../services/adminStorageService';
import { SubscriptionService, type SubscriptionPlan, type LicenseInfo } from '../services/subscriptionService';
import { TeamAnalyticsService, type TeamMember } from '../services/teamAnalyticsService';
import { BusinessOnboardingModal } from './BusinessOnboardingModal';
import {
  ShieldCheck,
  X,
  Layers,
  FileJson,
  Settings,
  Plus,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Key,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  Crown,
  MessageCircle,
  Link as LinkIcon,
  Ban,
  CheckCircle2,
  BarChart3,
  Users,
  Printer,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface AdminHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
  onRefreshScenarios: (scenarios: Scenario[]) => void;
  onOpenCreateScenario: () => void;
  onOpenEditScenario: (scenario: Scenario) => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onLogoutAdmin: () => void;
}

export const AdminHubModal: React.FC<AdminHubModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onRefreshScenarios,
  onOpenCreateScenario,
  onOpenEditScenario,
  settings,
  onSaveSettings,
  onLogoutAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'analytics' | 'licenses' | 'sync' | 'pwa'>('analytics');

  // B2B Team Analytics & Reporting state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => TeamAnalyticsService.getTeamMembers());
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Bartender / Sala');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  // License generator & management state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('30D');
  const [clientNotesInput, setClientNotesInput] = useState('');
  const [lastGeneratedLicense, setLastGeneratedLicense] = useState<LicenseInfo | null>(null);
  const [adminLicenses, setAdminLicenses] = useState<LicenseInfo[]>(() => SubscriptionService.getAdminLicenses());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // PIN change state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gemini Key state
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Updating PWA state
  const [isUpdatingPwa, setIsUpdatingPwa] = useState(false);

  if (!isOpen) return null;

  // Filtered scenarios for Admin list
  const filtered = scenarios.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.aiCharacter.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDuplicate = (id: string) => {
    const { scenarios: updated, newScenario } = AdminStorageService.duplicateScenario(id);
    onRefreshScenarios(updated);
    if (newScenario) {
      onOpenEditScenario(newScenario);
    }
  };

  const handleExportCSV = () => {
    const csv = TeamAnalyticsService.exportToCSV('LOVO Bar Madrid');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Direccion_PitchBoss_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    TeamAnalyticsService.addMember({
      name: newMemberName.trim(),
      role: newMemberRole.trim(),
      email: newMemberEmail.trim() || undefined,
      scenarioId: 'lovo-bar-staff-hospitality',
      scenarioTitle: 'Coctelería LOVO Bar - Madrid',
      totalSessions: 1,
      menuFluencyScore: 70,
      pronunciationScore: 75,
      upSellingScore: 65,
      objectionsMastered: 2,
      totalObjections: 4,
      totalSpokenMinutes: 6,
      lastActiveDate: Date.now(),
      status: 'in_progress',
      executiveFeedback: `Nuevo colaborador registrado. En proceso de asimilación de la carta y protocolos de servicio.`
    });
    setTeamMembers(TeamAnalyticsService.getTeamMembers());
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddingMember(false);
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar al colaborador "${name}" del seguimiento de analítica?`)) {
      TeamAnalyticsService.removeMember(id);
      setTeamMembers(TeamAnalyticsService.getTeamMembers());
    }
  };

  const handleToggleVisibility = (id: string) => {
    const updated = AdminStorageService.toggleVisibility(id);
    onRefreshScenarios(updated);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el escenario "${title}"?`)) {
      const updated = AdminStorageService.deleteScenario(id);
      onRefreshScenarios(updated);
    }
  };

  const handleRestoreDefaults = () => {
    if (
      window.confirm(
        '¿Deseas restaurar los escenarios predeterminados de fábrica (LOVO Bar)? Si tienes escenarios creados, se recomienda hacer una copia de seguridad antes.'
      )
    ) {
      const defaults = AdminStorageService.restoreDefaults();
      onRefreshScenarios(defaults);
    }
  };

  const handleExportJson = () => {
    AdminStorageService.exportToJsonFile();
  };

  const handleCopyJson = () => {
    const jsonStr = AdminStorageService.exportToJsonString();
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = AdminStorageService.importFromJson(content, importMode);
      if (result.success) {
        setImportStatus({
          success: true,
          message: `¡Éxito! Se importaron ${result.count} escenarios correctamente.`
        });
        onRefreshScenarios(AdminStorageService.getScenarios());
      } else {
        setImportStatus({
          success: false,
          message: result.error || 'Error al procesar el archivo.'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!AdminStorageService.verifyAdminPin(currentPinInput)) {
      setPinChangeMsg({ type: 'error', text: 'El PIN actual no es correcto.' });
      return;
    }
    if (newPinInput.length < 4) {
      setPinChangeMsg({ type: 'error', text: 'El nuevo PIN debe tener al menos 4 dígitos.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ type: 'error', text: 'Los nuevos PINs no coinciden.' });
      return;
    }

    AdminStorageService.setAdminPin(newPinInput);
    setPinChangeMsg({ type: 'success', text: '¡PIN de administrador actualizado con éxito!' });
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('persona_gemini_api_key', apiKeyInput.trim());
    onSaveSettings({ ...settings, apiKey: apiKeyInput.trim() });
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const license = SubscriptionService.generateAdminLicense(selectedPlan, clientNotesInput);
    setLastGeneratedLicense(license);
    setAdminLicenses(SubscriptionService.getAdminLicenses());
    setClientNotesInput('');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyLink = (key: string) => {
    const link = SubscriptionService.getMagicLink(key);
    navigator.clipboard.writeText(link);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleRevokeLicense = (key: string) => {
    if (window.confirm('¿Seguro que deseas revocar esta licencia? El cliente perderá el acceso de inmediato.')) {
      SubscriptionService.revokeAdminLicense(key);
      setAdminLicenses(SubscriptionService.getAdminLicenses());
    }
  };

  const handleShareWhatsApp = (license: LicenseInfo) => {
    const magicLink = SubscriptionService.getMagicLink(license.key);
    const text = encodeURIComponent(
      `¡Hola! Aquí tienes tu pase de acceso a PitchBoss Pro (${license.planName}).\n\nToca este enlace directo para activarlo en tu móvil:\n${magicLink}\n\nO ingresa este código manualmente en la app: ${license.key}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleForcePwaUpdate = async () => {
    if (
      window.confirm(
        'Esto borrará la caché local de la PWA y recargará la aplicación para obtener la versión más reciente. ¿Deseas continuar?'
      )
    ) {
      setIsUpdatingPwa(true);
      await AdminStorageService.forcePwaUpdate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#0B0F17]/80 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-[#2A344A] bg-[#1C2331] text-[#E2E8F0] shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#2A344A] bg-[#12161F] shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-[#E2E8F0] truncate">Panel Admin</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider shrink-0">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] truncate hidden xs:block">
                Gestiona escenarios, ventas y PWA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                onLogoutAdmin();
                onClose();
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              title="Cerrar sesión de Administrador"
            >
              Salir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#12161F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#2A344A] bg-[#12161F]/60 px-4 sm:px-6 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>📊 Analítica de Dirección ({teamMembers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'scenarios'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Escenarios ({scenarios.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'licenses'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <Crown className="w-4 h-4 text-[#FBBF24]" />
            <span>Licencias & Ventas ({adminLicenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Copia & Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'border-[#38BDF8] text-[#38BDF8]'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración PWA & PIN</span>
          </button>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-emerald-500/20 hover:from-sky-500/30 hover:to-emerald-500/30 border border-sky-400/40 text-sky-300 font-bold text-xs cursor-pointer transition-all active:scale-95 shrink-0 my-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>🚀 Nueva Empresa (3 Pasos)</span>
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6">
          {/* TAB 0: B2B TEAM ANALYTICS & EXECUTIVE REPORT */}
          {activeTab === 'analytics' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Executive Quote Card for the Director */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1A2234] to-[#12161F] p-5 sm:p-6 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Evaluación Ejecutiva para la Dirección
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                        2 Empleados Certificados para Sala
                      </span>
                    </div>
                    <blockquote className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed italic">
                      "Tu empleado <span className="text-sky-300 font-bold">Carlos Méndez</span> ha completado 5 sesiones de LOVO Bar y tiene un <span className="text-emerald-400 font-bold">85% de fluidez en la carta</span>. Ha dominado las recomendaciones de los cócteles Bubi y Manabi y la política de cuenta no dividida. Elena Gómez (90%) y él están certificados y listos para sala."
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#12161F]">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Personal en Turno</span>
                  </div>
                  <div className="text-2xl font-black text-white">{teamMembers.length}</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-0.5">2 Certificados</div>
                </div>

                <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#12161F]">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Sesiones de Voz</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {teamMembers.reduce((acc, m) => acc + m.totalSessions, 0)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">8.140 chars asimilados</div>
                </div>

                <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#12161F]">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <span>Fluidez Media en Carta</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {Math.round(teamMembers.reduce((acc, m) => acc + m.menuFluencyScore, 0) / (teamMembers.length || 1))}%
                  </div>
                  <div className="text-[11px] text-sky-400 font-medium mt-0.5">+18% esta semana</div>
                </div>

                <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#12161F]">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Tiempo Total Hablado</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {teamMembers.reduce((acc, m) => acc + m.totalSpokenMinutes, 0)} min
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">~14 turnos reales</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#2A344A] bg-[#12161F]">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handlePrintReport}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-md shadow-sky-500/20 cursor-pointer transition-all active:scale-95"
                    title="Imprimir o guardar PDF del informe para dueños o dirección"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Informe Ejecutivo (PDF)</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-[#18202F] hover:bg-[#222B3D] border border-[#2A344A] cursor-pointer transition-all active:scale-95"
                    title="Descargar archivo CSV compatible con Excel / Google Sheets"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Exportar CSV (Excel)</span>
                  </button>

                  <button
                    onClick={() => setIsAddingMember(!isAddingMember)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#18202F] hover:bg-[#222B3D] border border-[#2A344A] cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4 text-sky-400" />
                    <span>Registrar Empleado</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-sky-500/20 hover:from-emerald-500/30 hover:to-sky-500/30 border border-emerald-500/40 text-emerald-300 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>🚀 Asistente Nueva Empresa (3 Pasos)</span>
                </button>
              </div>

              {/* Add Employee Form */}
              {isAddingMember && (
                <form
                  onSubmit={handleAddTeamMember}
                  className="p-4 rounded-2xl border border-sky-500/30 bg-[#18202F] space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Añadir Nuevo Miembro al Equipo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nombre (ej. Marcos Varela)"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="bg-[#12161F] border border-[#2A344A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Puesto (ej. Bartender, Sala)"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="bg-[#12161F] border border-[#2A344A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                    <input
                      type="email"
                      placeholder="Email de contacto (opcional)"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="bg-[#12161F] border border-[#2A344A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm cursor-pointer"
                    >
                      Guardar en Equipo
                    </button>
                  </div>
                </form>
              )}

              {/* Team Members Performance Table */}
              <div className="rounded-2xl border border-[#2A344A] bg-[#12161F] overflow-hidden shadow-lg">
                <div className="px-4 py-3 border-b border-[#2A344A] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Rendimiento Individual del Personal
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Carta activa: <strong>LOVO Bar Madrid</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18202F]/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#2A344A]">
                      <tr>
                        <th className="py-3 px-4">Colaborador</th>
                        <th className="py-3 px-3">Puesto</th>
                        <th className="py-3 px-3 text-center">Sesiones</th>
                        <th className="py-3 px-3 text-center">Fluidez Carta</th>
                        <th className="py-3 px-3 text-center">Fonética</th>
                        <th className="py-3 px-3 text-center">Up-Selling</th>
                        <th className="py-3 px-3 text-center">Objeciones</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A344A]/60">
                      {teamMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-[#18202F]/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{member.name}</div>
                            {member.email && (
                              <div className="text-[10px] text-slate-500 font-normal">{member.email}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300 font-medium">{member.role}</td>
                          <td className="py-3.5 px-3 text-center font-bold text-sky-400">
                            {member.totalSessions}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                              {member.menuFluencyScore}%
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-300 font-semibold">
                            {member.pronunciationScore}%
                          </td>
                          <td className="py-3.5 px-3 text-center text-amber-400 font-semibold">
                            {member.upSellingScore}%
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-300 font-mono">
                            {member.objectionsMastered}/{member.totalObjections}
                          </td>
                          <td className="py-3.5 px-4">
                            {member.status === 'ready' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Listo para Sala</span>
                              </span>
                            ) : member.status === 'in_progress' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                                <span>En Progreso</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <span>Requiere Repaso</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Eliminar colaborador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar escenario por título o nicho..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-[#12161F] border-[#2A344A] text-[#E2E8F0] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#38BDF8] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleRestoreDefaults}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#E2E8F0] hover:bg-[#202838] bg-[#12161F] border border-[#2A344A] transition-colors cursor-pointer"
                    title="Restaurar el escenario original de LOVO Bar"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Restaurar Fábrica</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateScenario();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#0EA5E9] hover:bg-[#38BDF8] transition-all shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Escenario</span>
                  </button>
                </div>
              </div>

              {/* Scenarios Table / List */}
              <div className="border border-[#2A344A] rounded-2xl overflow-hidden bg-[#12161F]/70 divide-y divide-[#2A344A]">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-[#94A3B8] text-xs">
                    No se encontraron escenarios que coincidan con la búsqueda.
                  </div>
                ) : (
                  filtered.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#202838]/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl shrink-0 p-2 rounded-xl bg-[#1C2331] border border-[#2A344A]">
                          {scenario.aiCharacter.avatar || '💼'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-[#E2E8F0] truncate">
                              {scenario.title}
                            </h4>
                            {scenario.isHidden ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C2331] text-[#94A3B8] border border-[#2A344A] font-medium">
                                Oculto a usuarios
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                                Visible
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C2331] text-[#38BDF8] border border-[#2A344A] font-mono">
                              {scenario.targetEnglishLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                            {scenario.niche} • Interlocutor: {scenario.aiCharacter.name} ({scenario.aiCharacter.role})
                          </p>
                          <p className="text-[11px] text-[#94A3B8]/80 line-clamp-1 mt-1 font-mono">
                            {scenario.initialGreeting}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenEditScenario(scenario);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1C2331] hover:bg-[#202838] text-[#E2E8F0] border border-[#2A344A] transition-colors cursor-pointer"
                          title="Editar todos los campos del escenario"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDuplicate(scenario.id)}
                          className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#E2E8F0] bg-[#1C2331] hover:bg-[#202838] border border-[#2A344A] transition-colors cursor-pointer"
                          title="Duplicar escenario"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleVisibility(scenario.id)}
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            scenario.isHidden
                              ? 'text-[#94A3B8] bg-[#1C2331] border-[#2A344A] hover:text-[#E2E8F0]'
                              : 'text-[#38BDF8] bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20'
                          }`}
                          title={scenario.isHidden ? 'Hacer visible a los usuarios' : 'Ocultar a los usuarios'}
                        >
                          {scenario.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDelete(scenario.id, scenario.title)}
                          className="p-1.5 rounded-xl text-[#94A3B8] hover:text-rose-400 bg-[#1C2331] hover:bg-[#202838] border border-[#2A344A] transition-colors cursor-pointer"
                          title="Eliminar escenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LICENSES & CLIENT SUBSCRIPTIONS */}
          {activeTab === 'licenses' && (
            <div className="space-y-6">
              {/* License Generator Box */}
              <div className="p-5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#E2E8F0] flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Generador de Licencias y Enlaces Mágicos</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Genera una clave y un enlace directo para enviar a tu cliente por WhatsApp o email al recibir el pago.
                  </p>
                </div>

                <form onSubmit={handleGenerateLicense} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Plan de Suscripción:
                      </label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value as SubscriptionPlan)}
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-[#18202F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="30D">Pase Mensual (30 Días - 19€)</option>
                        <option value="90D">Pase Trimestral (90 Días - 45€)</option>
                        <option value="365D">Pase Anual (1 Año - 120€)</option>
                        <option value="LIFETIME">Pase Vitalicio (Ilimitado - 299€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cliente / Empresa / Nota:
                      </label>
                      <input
                        type="text"
                        value={clientNotesInput}
                        onChange={(e) => setClientNotesInput(e.target.value)}
                        placeholder="Ej: Hotel Meliá - Recepción, o Juan Pérez"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-[#18202F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generar Licencia y Enlace Mágico</span>
                  </button>
                </form>

                {/* Newly Generated License Card */}
                {lastGeneratedLicense && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>¡Licencia lista para entregar!</span>
                      </span>
                      <span className="text-[11px] text-[#94A3B8]">
                        Expira el: {new Date(lastGeneratedLicense.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Key */}
                      <div>
                        <span className="text-xs text-[#94A3B8] block mb-1">Código de Licencia:</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 min-w-0 bg-[#18202F] px-3 py-2 rounded-xl font-mono text-xs text-sky-300 border border-[#2A344A] truncate">
                            {lastGeneratedLicense.key}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(lastGeneratedLicense.key)}
                            className="px-3.5 py-2 rounded-xl bg-[#222B3D] hover:bg-[#2A344A] text-xs font-semibold text-white border border-[#2A344A] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            {copiedKey === lastGeneratedLicense.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === lastGeneratedLicense.key ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Magic Link */}
                      <div>
                        <span className="text-xs text-[#94A3B8] block mb-1">Enlace Mágico de Activación Directa:</span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            readOnly
                            value={SubscriptionService.getMagicLink(lastGeneratedLicense.key)}
                            className="w-full bg-[#18202F] px-3 py-2 rounded-xl font-mono text-xs text-slate-300 border border-[#2A344A] truncate"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(lastGeneratedLicense.key)}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#222B3D] hover:bg-[#2A344A] text-xs font-semibold text-white border border-[#2A344A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {copiedLink === lastGeneratedLicense.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                              <span>{copiedLink === lastGeneratedLicense.key ? 'Copiado' : 'Copiar Link'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareWhatsApp(lastGeneratedLicense)}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Table of Issued Licenses */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                    Historial de Licencias Emitidas ({adminLicenses.length})
                  </h3>
                </div>

                {adminLicenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#94A3B8] border border-[#2A344A] rounded-2xl bg-[#12161F]">
                    Aún no has generado ninguna licencia. Utiliza el generador arriba para crear tu primer pase Pro.
                  </div>
                ) : (
                  <>
                    {/* Mobile License Cards View (sm:hidden) */}
                    <div className="space-y-2.5 sm:hidden">
                      {adminLicenses.map((lic) => {
                        const isExpired = Date.now() > lic.expiresAt;
                        return (
                          <div key={lic.key} className="p-3.5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-xs text-[#E2E8F0] truncate">{lic.planName}</span>
                                {lic.isRevoked ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                                    Revocada
                                  </span>
                                ) : isExpired ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222B3D] text-[#94A3B8] border border-[#2A344A] shrink-0">
                                    Vencida
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    Activa
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#94A3B8] shrink-0">
                                {new Date(lic.expiresAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-[#94A3B8] truncate text-[11px]">{lic.clientNotes || 'Cliente Directo'}</span>
                              <code className="font-mono text-[11px] text-sky-300 bg-[#18202F] px-2 py-0.5 rounded-lg border border-[#2A344A] shrink-0">
                                {lic.key}
                              </code>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-[#2A344A]">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(lic.key)}
                                className="flex-1 py-1.5 px-2 rounded-xl bg-[#18202F] hover:bg-[#222B3D] text-xs font-semibold text-[#E2E8F0] border border-[#2A344A] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <LinkIcon className="w-3.5 h-3.5 text-[#94A3B8]" />
                                <span>Copiar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShareWhatsApp(lic)}
                                className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                              {!lic.isRevoked && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeLicense(lic.key)}
                                  title="Revocar Licencia"
                                  className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table View (hidden sm:block) */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#2A344A] bg-[#12161F]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#161D2B] border-b border-[#2A344A] text-[11px] font-bold text-[#94A3B8]">
                          <tr>
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Cliente / Nota</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Vence</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A344A]/60">
                          {adminLicenses.map((lic) => {
                            const isExpired = Date.now() > lic.expiresAt;
                            return (
                              <tr key={lic.key} className="hover:bg-[#1C2331]/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-[11px] text-sky-300 font-semibold">
                                  {lic.key}
                                </td>
                                <td className="px-4 py-3 text-[#E2E8F0]">
                                  {lic.clientNotes || 'Directo'}
                                </td>
                                <td className="px-4 py-3 text-slate-300 font-medium">
                                  {lic.planName}
                                </td>
                                <td className="px-4 py-3 text-[#94A3B8]">
                                  {new Date(lic.expiresAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  {lic.isRevoked ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      Revocada
                                    </span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#222B3D] text-[#94A3B8] border border-[#2A344A]">
                                      Vencida
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      Activa
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleCopyLink(lic.key)}
                                      title="Copiar Enlace Mágico"
                                      className="p-1.5 rounded-lg bg-[#18202F] hover:bg-[#222B3D] text-[#94A3B8] hover:text-white border border-[#2A344A] transition-colors cursor-pointer"
                                    >
                                      <LinkIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleShareWhatsApp(lic)}
                                      title="Enviar por WhatsApp"
                                      className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                    {!lic.isRevoked && (
                                      <button
                                        onClick={() => handleRevokeLicense(lic.key)}
                                        title="Revocar Licencia"
                                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & SYNC */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> ¿Cómo compartir escenarios con otros teléfonos?
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  Para que tus camareros o alumnos tengan los mismos escenarios en sus móviles:
                  descarga el archivo JSON con el botón <strong>"Exportar Escenarios"</strong> y envíaselo por WhatsApp o correo.
                  Ellos solo deben abrir la PWA, entrar en Ajustes o Admin y pulsar <strong>"Importar Archivo JSON"</strong>.
                </p>
              </div>

              {/* Export Box */}
              <div className="p-5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#E2E8F0] flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      Exportar Escenarios (Copia de Seguridad)
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Descarga un archivo con todos los escenarios configurados para guardarlo como copia de seguridad o transferirlo.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                  <button
                    onClick={handleExportJson}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar archivo JSON</span>
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#E2E8F0] bg-[#18202F] hover:bg-[#222B3D] border border-[#2A344A] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#94A3B8]" />
                        <span>Copiar al portapapeles</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Import Box */}
              <div className="p-3.5 sm:p-5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-[#E2E8F0] flex items-center gap-2">
                    <Upload className="w-4 h-4 text-sky-400" />
                    Importar Escenarios desde Archivo JSON
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Carga un archivo JSON previamente exportado desde otro dispositivo o copia de respaldo.
                  </p>
                </div>

                {/* Import Mode Radio */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-sky-400"
                    />
                    <span className="text-slate-300">Fusionar (Añadir sin borrar los actuales)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-sky-400"
                    />
                    <span className="text-slate-300">Reemplazar todo</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-md shadow-sky-500/20">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar archivo JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      importStatus.success
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}
                  >
                    {importStatus.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{importStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PWA & PIN SETTINGS */}
          {activeTab === 'pwa' && (
            <div className="space-y-6">
              {/* Change Admin PIN */}
              <div className="p-5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#E2E8F0] flex items-center gap-2">
                    <Key className="w-4 h-4 text-sky-400" />
                    Cambiar PIN de Acceso Administrador
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Modifica el código de seguridad para que solo tú puedas gestionar la aplicación.
                  </p>
                </div>

                <form onSubmit={handlePinChangeSubmit} className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-[11px] text-[#94A3B8] mb-1">PIN Actual</label>
                    <input
                      type="password"
                      maxLength={8}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-[#18202F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">Nuevo PIN (mín. 4)</label>
                      <input
                        type="password"
                        maxLength={8}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-[#18202F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#94A3B8] mb-1">Confirmar Nuevo PIN</label>
                      <input
                        type="password"
                        maxLength={8}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-[#18202F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  {pinChangeMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        pinChangeMsg.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}
                    >
                      {pinChangeMsg.type === 'success' ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                      <span>{pinChangeMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 transition-colors cursor-pointer shadow-md shadow-sky-500/20"
                  >
                    Guardar Nuevo PIN
                  </button>
                </form>
              </div>

              {/* Gemini Central Key */}
              <div className="p-5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#E2E8F0] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      Clave de API Gemini de la Empresa
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      Configura la clave de Google Gemini para las simulaciones y el generador de escenarios.
                    </p>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    Obtener clave gratuita <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 min-w-0 px-3 py-2 text-xs font-mono rounded-xl border bg-[#18202F] border-[#2A344A] text-[#E2E8F0] focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-sky-500/20"
                  >
                    {apiKeySaved ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                    <span>{apiKeySaved ? 'Guardada' : 'Guardar'}</span>
                  </button>
                </div>
              </div>

              {/* PWA Maintenance & Cache */}
              <div className="p-5 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-[#E2E8F0] flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-sky-400" />
                    Mantenimiento PWA y Forzar Actualización
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Si has publicado una actualización o notas lentitud, puedes limpiar la caché local y forzar la recarga del Service Worker.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleForcePwaUpdate}
                    disabled={isUpdatingPwa}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#18202F] hover:bg-[#222B3D] border border-[#2A344A] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isUpdatingPwa ? 'animate-spin' : ''}`} />
                    <span>Limpiar Caché y Forzar Actualización PWA</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#2A344A] bg-[#12161F] flex items-center justify-between text-xs text-[#94A3B8] shrink-0">
          <span>PitchBoss Admin System • v2.1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#E2E8F0] hover:text-white bg-[#18202F] hover:bg-[#222B3D] border border-[#2A344A] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
      {/* 3-Step Guided Business Onboarding Wizard */}
      <BusinessOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onScenarioCreated={() => {
          onRefreshScenarios(AdminStorageService.getScenarios());
        }}
        onOpenAnalytics={() => {
          setActiveTab('analytics');
        }}
      />
    </div>
  );
};
