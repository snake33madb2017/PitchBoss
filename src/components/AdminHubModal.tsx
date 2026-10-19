import React, { useState } from 'react';
import type { Scenario, AppSettings } from '../types';
import { AdminStorageService } from '../services/adminStorageService';
import { SubscriptionService, type SubscriptionPlan, type LicenseInfo } from '../services/subscriptionService';
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
  CheckCircle2
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
  const [activeTab, setActiveTab] = useState<'scenarios' | 'licenses' | 'sync' | 'pwa'>('scenarios');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#0f0f13] text-zinc-100 shadow-2xl shadow-black/95 flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-zinc-800 bg-zinc-950/95 shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-white truncate">Panel Admin</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider shrink-0">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate hidden xs:block">
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
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-950/50 px-4 sm:px-6 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'scenarios'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Escenarios ({scenarios.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'licenses'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Licencias & Ventas ({adminLicenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Copia & Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración PWA & PIN</span>
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6">
          {/* TAB 1: SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar escenario por título o nicho..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleRestoreDefaults}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                    title="Restaurar el escenario original de LOVO Bar"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Restaurar Fábrica</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCreateScenario();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Escenario</span>
                  </button>
                </div>
              </div>

              {/* Scenarios Table / List */}
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60 divide-y divide-zinc-800/80">
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No se encontraron escenarios que coincidan con la búsqueda.
                  </div>
                ) : (
                  filtered.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl shrink-0 p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                          {scenario.aiCharacter.avatar || '💼'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {scenario.title}
                            </h4>
                            {scenario.isHidden ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">
                                Oculto a usuarios
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                Visible
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                              {scenario.targetEnglishLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {scenario.niche} • Interlocutor: {scenario.aiCharacter.name} ({scenario.aiCharacter.role})
                          </p>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 font-mono">
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
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                          title="Editar todos los campos del escenario"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDuplicate(scenario.id)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                          title="Duplicar escenario"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleVisibility(scenario.id)}
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            scenario.isHidden
                              ? 'text-zinc-500 bg-zinc-900 border-zinc-800 hover:text-zinc-300'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title={scenario.isHidden ? 'Hacer visible a los usuarios' : 'Ocultar a los usuarios'}
                        >
                          {scenario.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDelete(scenario.id, scenario.title)}
                          className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
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
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Generador de Licencias y Enlaces Mágicos</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Genera una clave y un enlace directo para enviar a tu cliente por WhatsApp o email al recibir el pago.
                  </p>
                </div>

                <form onSubmit={handleGenerateLicense} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Plan de Suscripción:
                      </label>
                      <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value as SubscriptionPlan)}
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-900 border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="30D">Pase Mensual (30 Días - 19€)</option>
                        <option value="90D">Pase Trimestral (90 Días - 45€)</option>
                        <option value="365D">Pase Anual (1 Año - 120€)</option>
                        <option value="LIFETIME">Pase Vitalicio (Ilimitado - 299€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Cliente / Empresa / Nota:
                      </label>
                      <input
                        type="text"
                        value={clientNotesInput}
                        onChange={(e) => setClientNotesInput(e.target.value)}
                        placeholder="Ej: Hotel Meliá - Recepción, o Juan Pérez"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-900 border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                    <span>Generar Licencia y Enlace Mágico</span>
                  </button>
                </form>

                {/* Newly Generated License Card */}
                {lastGeneratedLicense && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>¡Licencia lista para entregar!</span>
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        Expira el: {new Date(lastGeneratedLicense.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Key */}
                      <div>
                        <span className="text-xs text-zinc-400 block mb-1">Código de Licencia:</span>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 min-w-0 bg-zinc-900 px-3 py-2 rounded-xl font-mono text-xs text-amber-300 border border-zinc-800 truncate">
                            {lastGeneratedLicense.key}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(lastGeneratedLicense.key)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            {copiedKey === lastGeneratedLicense.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === lastGeneratedLicense.key ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Magic Link */}
                      <div>
                        <span className="text-xs text-zinc-400 block mb-1">Enlace Mágico de Activación Directa:</span>
                        <div className="space-y-2">
                          <input
                            type="text"
                            readOnly
                            value={SubscriptionService.getMagicLink(lastGeneratedLicense.key)}
                            className="w-full bg-zinc-900 px-3 py-2 rounded-xl font-mono text-xs text-zinc-300 border border-zinc-800 truncate"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(lastGeneratedLicense.key)}
                              className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Historial de Licencias Emitidas ({adminLicenses.length})
                  </h3>
                </div>

                {adminLicenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500 border border-zinc-800/80 rounded-2xl bg-zinc-950/40">
                    Aún no has generado ninguna licencia. Utiliza el generador arriba para crear tu primer pase Pro.
                  </div>
                ) : (
                  <>
                    {/* Mobile License Cards View (sm:hidden) */}
                    <div className="space-y-2.5 sm:hidden">
                      {adminLicenses.map((lic) => {
                        const isExpired = Date.now() > lic.expiresAt;
                        return (
                          <div key={lic.key} className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/90 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-xs text-white truncate">{lic.planName}</span>
                                {lic.isRevoked ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                                    Revocada
                                  </span>
                                ) : isExpired ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 shrink-0">
                                    Vencida
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    Activa
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-400 shrink-0">
                                {new Date(lic.expiresAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-zinc-400 truncate text-[11px]">{lic.clientNotes || 'Cliente Directo'}</span>
                              <code className="font-mono text-[11px] text-amber-300 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800 shrink-0">
                                {lic.key}
                              </code>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(lic.key)}
                                className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Copiar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShareWhatsApp(lic)}
                                className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                              {!lic.isRevoked && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeLicense(lic.key)}
                                  title="Revocar Licencia"
                                  className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 cursor-pointer"
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
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-bold text-zinc-400">
                          <tr>
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Cliente / Nota</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Vence</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                          {adminLicenses.map((lic) => {
                            const isExpired = Date.now() > lic.expiresAt;
                            return (
                              <tr key={lic.key} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="px-4 py-3 font-mono text-[11px] text-amber-300 font-semibold">
                                  {lic.key}
                                </td>
                                <td className="px-4 py-3 text-zinc-200">
                                  {lic.clientNotes || 'Directo'}
                                </td>
                                <td className="px-4 py-3 text-zinc-300 font-medium">
                                  {lic.planName}
                                </td>
                                <td className="px-4 py-3 text-zinc-400">
                                  {new Date(lic.expiresAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  {lic.isRevoked ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      Revocada
                                    </span>
                                  ) : isExpired ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
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
                                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <LinkIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleShareWhatsApp(lic)}
                                      title="Enviar por WhatsApp"
                                      className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 transition-colors cursor-pointer"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                    {!lic.isRevoked && (
                                      <button
                                        onClick={() => handleRevokeLicense(lic.key)}
                                        title="Revocar Licencia"
                                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 transition-colors cursor-pointer"
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
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300 space-y-1">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> ¿Cómo compartir escenarios con otros teléfonos?
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Para que tus camareros o alumnos tengan los mismos escenarios en sus móviles:
                  descarga el archivo JSON con el botón <strong>"Exportar Escenarios"</strong> y envíaselo por WhatsApp o correo.
                  Ellos solo deben abrir la PWA, entrar en Ajustes o Admin y pulsar <strong>"Importar Archivo JSON"</strong>.
                </p>
              </div>

              {/* Export Box */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      Exportar Escenarios (Copia de Seguridad)
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Descarga un archivo con todos los escenarios configurados para guardarlo como copia de seguridad o transferirlo.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                  <button
                    onClick={handleExportJson}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar archivo JSON</span>
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-400" />
                        <span>Copiar al portapapeles</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Import Box */}
              <div className="p-3.5 sm:p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    Importar Escenarios desde Archivo JSON
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
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
                      className="accent-amber-400"
                    />
                    <span className="text-zinc-300">Fusionar (Añadir sin borrar los actuales)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-amber-400"
                    />
                    <span className="text-zinc-300">Reemplazar todo</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer shadow-md shadow-amber-500/20">
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

          {/* TAB 3: PWA & PIN SETTINGS */}
          {activeTab === 'pwa' && (
            <div className="space-y-6">
              {/* Change Admin PIN */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    Cambiar PIN de Acceso Administrador
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Modifica el código de seguridad para que solo tú puedas gestionar la aplicación.
                  </p>
                </div>

                <form onSubmit={handlePinChangeSubmit} className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">PIN Actual</label>
                    <input
                      type="password"
                      maxLength={8}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-900 border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Nuevo PIN (mín. 4)</label>
                      <input
                        type="password"
                        maxLength={8}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-900 border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Confirmar Nuevo PIN</label>
                      <input
                        type="password"
                        maxLength={8}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 text-xs rounded-xl border bg-zinc-900 border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
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
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    Guardar Nuevo PIN
                  </button>
                </form>
              </div>

              {/* Gemini Central Key */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Clave de API Gemini de la Empresa
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Configura la clave de Google Gemini para las simulaciones y el generador de escenarios.
                    </p>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
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
                    className="flex-1 min-w-0 px-3 py-2 text-xs font-mono rounded-xl border bg-zinc-900 border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {apiKeySaved ? <Check className="w-3.5 h-3.5 text-zinc-950" /> : null}
                    <span>{apiKeySaved ? 'Guardada' : 'Guardar'}</span>
                  </button>
                </div>
              </div>

              {/* PWA Maintenance & Cache */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-sky-400" />
                    Mantenimiento PWA y Forzar Actualización
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Si has publicado una actualización o notas lentitud, puedes limpiar la caché local y forzar la recarga del Service Worker.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleForcePwaUpdate}
                    disabled={isUpdatingPwa}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
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
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>PitchBoss Admin System • v2.1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
