import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, ArrowLeft, Check, Copy, Share2, ShieldCheck, FileText, Wine, Building, Lightbulb, BarChart3, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Scenario, EnglishLevel, DifficultyLevel } from '../types';
import { AdminStorageService } from '../services/adminStorageService';
import { CloudSyncService } from '../services/cloudSyncService';
import { LOVO_BAR_MASTER_KNOWLEDGE } from '../data/lovoBarKnowledge';

interface BusinessOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioCreated: (newScenario: Scenario) => void;
  onOpenAnalytics?: () => void;
}

export const BusinessOnboardingModal: React.FC<BusinessOnboardingModalProps> = ({
  isOpen,
  onClose,
  onScenarioCreated,
  onOpenAnalytics
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Business & Menu Document
  const [businessName, setBusinessName] = useState('LOVO Bar Madrid');
  const [nicheCategory, setNicheCategory] = useState('Coctelería & Hospitalidad');
  const [menuDocument, setMenuDocument] = useState(LOVO_BAR_MASTER_KNOWLEDGE);

  // Step 2: Level & Calibration
  const [targetLevel, setTargetLevel] = useState<EnglishLevel>('A1');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [employeeRole, setEmployeeRole] = useState('Bartender / Camarero');
  const [characterName, setCharacterName] = useState('James & Sarah');
  const [createdScenario, setCreatedScenario] = useState<Scenario | null>(null);

  // Step 3: Sharing
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleNextStep1 = () => {
    if (!businessName.trim() || !menuDocument.trim()) return;
    setStep(2);
  };

  const handleCreateAndGenerateLink = () => {
    const wsId = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'default';
    const scenarioId = `biz-${Date.now()}`;
    const newScenario: Scenario = {
      id: scenarioId,
      workspaceId: wsId,
      title: `${businessName}: Atención a Clientes Internacionales (Carta Oficial)`,
      niche: `${nicheCategory} - ${businessName}`,
      businessKnowledge: menuDocument.trim(),
      aiCharacter: {
        name: characterName,
        role: `Clientes internacionales en ${businessName}`,
        avatar: 'cocktail',
        personality: 'Tutor interactivo y cliente internacional. Habla en inglés según la carta oficial y te guía en español con apoyo fonético paso a paso.',
        voiceGender: 'male'
      },
      userRole: employeeRole,
      context: `Estás en ${businessName}. Conoces la carta oficial, los productos, precios y protocolos de servicio. Atiendes clientes internacionales practicando conversación en inglés.`,
      initialGreeting: `Good evening! It is our first time here at ${businessName}. Could you recommend something special from your menu?`,
      initialTranslation: `¡Buenas noches! Es nuestra primera vez aquí en ${businessName}. ¿Podrías recomendarnos algo especial de vuestra carta?`,
      initialTip: `Tip: Saluda cordialmente en inglés diciendo: "Good evening, welcome to ${businessName}! Here is our menu." [Gud ív-ning, uél-cam tu ${businessName}! Jí-er is au-er me-niu].`,
      difficulty,
      targetEnglishLevel: targetLevel,
      objectives: [
        { id: 'obj-1', description: `Dar la bienvenida al cliente en ${businessName} y presentar el concepto`, completed: false },
        { id: 'obj-2', description: 'Indagar gustos y recomendar opciones de la carta oficial', completed: false },
        { id: 'obj-3', description: 'Up-selling: Ofrecer alternativa premium o maridaje de comida', completed: false },
        { id: 'obj-4', description: 'Gestión de cuenta y despedida con agradecimiento', completed: false }
      ],
      commonObjections: [
        `Could you recommend your signature best-sellers from ${businessName}?`,
        'Do you have any options for people with food allergies or intolerances?',
        'Can we split the bill equally and pay by card?'
      ],
      nicheVocabulary: [
        `Welcome to ${businessName}! [Uél-cam tu ${businessName}!]`,
        'May I recommend our signature cocktail? [Méi ai re-co-mend...]',
        'Are there any food allergies? [Ar der é-ni fud á-ler-dchis?]',
        'We divide the total bill equally [Uii di-váid de tóu-tal bil í-cua-li]'
      ],
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Save scenario to storage and sync to cloud
    AdminStorageService.upsertScenario(newScenario);
    CloudSyncService.createWorkspace(businessName.trim());

    setCreatedScenario(newScenario);
    onScenarioCreated(newScenario);
    setStep(3);

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const getShareableUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pitchboss.onrender.com';
    return `${origin}/?scenario=${createdScenario?.id || 'lovo-tomo1-pitch1'}`;
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const url = getShareableUrl();
    const text = encodeURIComponent(
      `¡Hola equipo! Aquí tenéis nuestro simulador de voz en inglés con la carta oficial de ${businessName}. Practicad 5 minutos antes del turno para ganar seguridad con clientes internacionales: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#0B0F17]/90 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#2A344A] bg-[#1C2331] text-[#E2E8F0] shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden">
        {/* Header with 3-Step Progress */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-[#2A344A] bg-[#12161F] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 mr-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-[#E2E8F0] truncate">
                Activación Nuevas Empresas
              </h2>
              <p className="text-[11px] sm:text-xs text-[#94A3B8] truncate hidden xs:block">
                Configura el simulador con tu carta y envíalo a tu equipo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#222B3D] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-3 border-b border-[#2A344A] bg-[#151B27] text-xs font-semibold shrink-0">
          <div
            className={`py-2.5 sm:py-3 px-1.5 sm:px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
              step === 1 ? 'border-sky-400 text-sky-400 bg-sky-500/5' : step > 1 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-current shrink-0">
              {step > 1 ? <Check className="w-2.5 h-2.5" /> : '1'}
            </span>
            <span className="hidden sm:inline">1. Pega tu Menú / Carta</span>
            <span className="sm:hidden text-[11px]">1. Menú</span>
          </div>

          <div
            className={`py-2.5 sm:py-3 px-1.5 sm:px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
              step === 2 ? 'border-sky-400 text-sky-400 bg-sky-500/5' : step > 2 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-current shrink-0">
              {step > 2 ? <Check className="w-2.5 h-2.5" /> : '2'}
            </span>
            <span className="hidden sm:inline">2. Calibra Dificultad</span>
            <span className="sm:hidden text-[11px]">2. Nivel</span>
          </div>

          <div
            className={`py-2.5 sm:py-3 px-1.5 sm:px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 ${
              step === 3 ? 'border-sky-400 text-sky-400 bg-sky-500/5' : 'border-transparent text-slate-500'
            }`}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-current shrink-0">
              3
            </span>
            <span className="hidden sm:inline">3. Pasa el Link al Equipo</span>
            <span className="sm:hidden text-[11px]">3. Link</span>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
          {/* STEP 1: Pega tu menú */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre del Establecimiento / Empresa *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. LOVO Bar Madrid, Hotel Wellington, Café Central"
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nicho / Categoría
                  </label>
                  <select
                    value={nicheCategory}
                    onChange={(e) => setNicheCategory(e.target.value)}
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="Coctelería & Hospitalidad">Coctelería & Bar de Autor</option>
                    <option value="Restaurante & Gastronomía">Restaurante & Sala</option>
                    <option value="Hotel & Alojamiento de Lujo">Hotel & Recepción</option>
                    <option value="Retail de Lujo & Boutiques">Retail de Lujo</option>
                    <option value="Servicios Corporativos & Ventas">Negociación & Ventas B2B</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Pega la Carta, Menú o Manual Completo *</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {menuDocument.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={menuDocument}
                  onChange={(e) => setMenuDocument(e.target.value)}
                  placeholder="Copia y pega la carta con platos, cócteles, precios, ingredientes y reglas de servicio..."
                  className="w-full bg-[#18202F] border border-[#2A344A] rounded-2xl p-4 text-xs font-mono text-[#E2E8F0] focus:outline-none focus:border-sky-400 placeholder:text-slate-500 leading-relaxed resize-y"
                />
              </div>

              {/* Quick Template Fillers */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-medium">O carga una plantilla:</span>
                <button
                  type="button"
                  onClick={() => {
                    setBusinessName('LOVO Bar Madrid');
                    setNicheCategory('Coctelería & Hospitalidad');
                    setMenuDocument(LOVO_BAR_MASTER_KNOWLEDGE);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#2A344A] bg-[#18202F] hover:bg-[#222B3D] text-sky-400 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Wine className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>LOVO Bar Oficial</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBusinessName('Hotel Boutique Luxury');
                    setNicheCategory('Hotel & Alojamiento de Lujo');
                    setMenuDocument(`MANUAL DE ATENCIÓN EN RECEPCIÓN DE HOTEL:\n- Check-in: A partir de las 15:00. Pedir pasaportes a todos los huéspedes.\n- Desayuno buffet: De 07:30 a 11:00 en la planta baja.\n- Check-out: Máximo a las 12:00 mediodía.\n- Consigna de equipaje gratuita.\n- Taxis y traslados al aeropuerto: Tarifa fija 33€.`);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#2A344A] bg-[#18202F] hover:bg-[#222B3D] text-slate-300 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Building className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Hotel Boutique</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Calibra dificultad */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 leading-relaxed flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-sky-400 shrink-0" />
                <span><strong>Calibración pedagógica:</strong> La IA adaptará la velocidad de habla, la longitud de las oraciones y el vocabulario según el nivel de tus trabajadores.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nivel Pitch del Equipo
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as EnglishLevel)}
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-sky-400 cursor-pointer font-medium"
                  >
                    <option value="A1">Pitch One (Iniciación y apoyo guiado)</option>
                    <option value="A2">Pitch One (Atención fluida y protocolo)</option>
                    <option value="B1">Pitch Two (Fluidez y alternativas)</option>
                    <option value="B2">Pitch Two (Argumentación y Up-Selling)</option>
                    <option value="C1">Pitch Three (Alta Dirección y Negociación VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Temperamento del Cliente IA
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-sky-400 cursor-pointer font-medium"
                  >
                    <option value="easy">Fácil (Cliente amable y comprensivo)</option>
                    <option value="medium">Medio (Cliente indeciso que pide recomendaciones)</option>
                    <option value="hard">Exigente (Cliente con prisas y alergias alimentarias)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Rol del Empleado (Tu Personal)
                  </label>
                  <input
                    type="text"
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value)}
                    placeholder="Ej. Bartender, Camarero de sala, Recepcionista"
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre del Cliente IA
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ej. James & Sarah (Turistas Internacionales)"
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#12161F] text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-200">Resumen de la configuración:</span>
                <p>
                  • Negocio: <strong>{businessName}</strong> ({nicheCategory})
                </p>
                <p>
                  • Memoria de Carta: <strong>{menuDocument.length} caracteres</strong> inyectados como fuente de la verdad estricta.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Pasa el link a tus empleados */}
          {step === 3 && (
            <div className="space-y-5 animate-in zoom-in-95 text-center sm:text-left">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 to-sky-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    ¡Simulador con la Carta de {businessName} Creado y Activo!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Tus empleados ya pueden practicar conversaciones reales por voz desde sus propios móviles sin instalar nada.
                  </p>
                </div>
              </div>

              {/* Direct Link Share Box */}
              <div className="p-4 rounded-2xl border border-[#2A344A] bg-[#12161F] space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-400 text-left">
                  Enlace Directo para los Empleados
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareableUrl()}
                    className="flex-1 bg-[#18202F] border border-[#2A344A] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md shadow-sky-500/20"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar por WhatsApp al Grupo de Trabajo</span>
                </button>

                {onOpenAnalytics && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAnalytics();
                    }}
                    className="p-3.5 rounded-2xl bg-[#18202F] hover:bg-[#222B3D] border border-sky-400/40 text-sky-400 hover:text-sky-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <span>Abrir Panel de Analítica del Director</span>
                  </button>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#151B27] border border-[#2A344A] text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Cada sesión que completen tus empleados sumará automáticamente a las métricas del <strong>Panel de Analítica de Dirección</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#2A344A] bg-[#12161F] flex items-center justify-between shrink-0">
          {step > 1 && step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s: 1 | 2 | 3) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep1}
                disabled={!businessName.trim() || !menuDocument.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Siguiente: Calibrar Nivel</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleCreateAndGenerateLink}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white shadow-lg shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Generar Simulador & Enlace</span>
                <Zap className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-sky-500 hover:bg-sky-400 text-white shadow-md cursor-pointer transition-all"
              >
                <span>Cerrar y Ver Escenario</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
