import React, { useState, useEffect } from 'react';
import type { Scenario, DifficultyLevel, EnglishLevel, Objective } from '../types';
import { GeminiService } from '../services/geminiService';
import { CloudSyncService } from '../services/cloudSyncService';
import { X, Sparkles, Plus, Trash2, Loader2, Wand2, Edit3, BookOpen, MessageSquare, Check, FileText, Zap } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { LOVO_BAR_MASTER_KNOWLEDGE } from '../data/lovoBarKnowledge';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
  scenarioToEdit?: Scenario | null;
}

const DEFAULT_AVATARS = ['🍸', '💼', '👔', '👩‍💼', '👨‍💼', '🍹', '🧑‍🍳', '🤝', '🎯', '✈️', '🏨', '🩺'];

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  scenarioToEdit
}) => {
  const { t } = useTranslation();

  const isEditMode = Boolean(scenarioToEdit);
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('');
  const [aiName, setAiName] = useState('');
  const [aiRole, setAiRole] = useState('');
  const [aiAvatar, setAiAvatar] = useState('🍸');
  const [aiPersonality, setAiPersonality] = useState('');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [userRole, setUserRole] = useState('');
  const [context, setContext] = useState('');
  const [initialGreeting, setInitialGreeting] = useState('');
  const [initialTranslation, setInitialTranslation] = useState('');
  const [initialTip, setInitialTip] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [targetEnglishLevel, setTargetEnglishLevel] = useState<EnglishLevel>('A1');
  const [businessKnowledge, setBusinessKnowledge] = useState('');
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const [objectives, setObjectives] = useState<Objective[]>([
    { id: 'obj-1', description: 'Dar la bienvenida y ubicar a los clientes', completed: false }
  ]);
  const [objections, setObjections] = useState<string[]>([
    'We do not speak Spanish, could you recommend something sweet and fruity?'
  ]);
  const [vocabulary, setVocabulary] = useState<string[]>([
    'Welcome to Lovo Bar [Uél-cam tu Lovo Bar]',
    'Table or bar? [Téibol or bar?]'
  ]);

  // Sync state whenever modal opens or scenarioToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (scenarioToEdit) {
        setAiPrompt(scenarioToEdit.businessKnowledge || '');
        setBusinessKnowledge(scenarioToEdit.businessKnowledge || '');
        setActiveTab(scenarioToEdit.businessKnowledge ? 'manual' : 'ai');
        setTitle(scenarioToEdit.title || '');
        setNiche(scenarioToEdit.niche || '');
        setAiName(scenarioToEdit.aiCharacter?.name || '');
        setAiRole(scenarioToEdit.aiCharacter?.role || '');
        setAiAvatar(scenarioToEdit.aiCharacter?.avatar || '🍸');
        setAiPersonality(scenarioToEdit.aiCharacter?.personality || '');
        setVoiceGender(scenarioToEdit.aiCharacter?.voiceGender || 'male');
        setUserRole(scenarioToEdit.userRole || '');
        setContext(scenarioToEdit.context || '');
        setInitialGreeting(scenarioToEdit.initialGreeting || '');
        setInitialTranslation(scenarioToEdit.initialTranslation || '');
        setInitialTip(scenarioToEdit.initialTip || '');
        setDifficulty(scenarioToEdit.difficulty || 'easy');
        setTargetEnglishLevel(scenarioToEdit.targetEnglishLevel || 'A1');
        setObjectives(
          scenarioToEdit.objectives && scenarioToEdit.objectives.length > 0
            ? scenarioToEdit.objectives
            : [{ id: 'obj-1', description: 'Objetivo de muestra', completed: false }]
        );
        setObjections(
          scenarioToEdit.commonObjections && scenarioToEdit.commonObjections.length > 0
            ? scenarioToEdit.commonObjections
            : ['Objeción de muestra']
        );
        setVocabulary(
          scenarioToEdit.nicheVocabulary && scenarioToEdit.nicheVocabulary.length > 0
            ? scenarioToEdit.nicheVocabulary
            : ['Término clave [fonética]']
        );
        setGenerationNotice(null);
      } else {
        setActiveTab('ai');
        setAiPrompt('');
        setTitle('');
        setNiche('');
        setAiName('');
        setAiRole('');
        setAiAvatar('🍸');
        setAiPersonality('');
        setVoiceGender('male');
        setUserRole('');
        setContext('');
        setInitialGreeting('');
        setInitialTranslation('');
        setInitialTip('');
        setDifficulty('easy');
        setTargetEnglishLevel('A1');
        setBusinessKnowledge('');
        setGenerationNotice(null);
        setObjectives([
          { id: 'obj-1', description: 'Saludar en inglés con naturalidad', completed: false }
        ]);
        setObjections(['Do you have a table for two?']);
        setVocabulary(['Welcome [Uél-cam]']);
      }
    }
  }, [isOpen, scenarioToEdit]);

  // Instant direct injection of business knowledge into scenario memory without requiring external AI
  const handleDirectInject = () => {
    if (!aiPrompt.trim()) return;
    const text = aiPrompt.trim();
    setBusinessKnowledge(text);

    // Auto-detect or provide smart defaults if fields are empty
    if (!title.trim() || title === 'Nuevo Escenario') {
      if (text.toLowerCase().includes('lovo bar')) {
        setTitle('Coctelería LOVO Bar - Madrid (Atención Internacional & Carta)');
        setNiche('Coctelería Emocional & Hospitalidad (Calle Echegaray 20)');
      } else {
        const firstLine = text.split('\n')[0].replace(/^Presentacion:\s*/i, '').trim();
        setTitle(firstLine.slice(0, 55) || 'Escenario Personalizado');
        setNiche('Atención & Negocio Internacional');
      }
    }

    if (!aiName.trim()) {
      setAiName('James & Sarah (Clientes Internacionales)');
      setAiRole('Clientes extranjeros en barra');
      setAiAvatar('🍸');
      setAiPersonality('Clientes internacionales curiosos por probar cócteles de autor, pedir recomendaciones y disfrutar de la experiencia del local.');
      setVoiceGender('male');
    }

    if (!userRole.trim()) {
      setUserRole('Bartender / Camarero');
    }

    if (!context.trim()) {
      setContext('Atención en barra a clientes internacionales aplicando la carta oficial y protocolos de servicio del establecimiento.');
    }

    if (!initialGreeting.trim()) {
      setInitialGreeting('Good evening! It is our first time here at LOVO Bar. Could you recommend something special from your cocktail menu?');
      setInitialTranslation('¡Buenas noches! Es nuestra primera vez aquí en LOVO Bar. ¿Podrías recomendarnos algo especial de vuestra carta de cócteles?');
      setInitialTip('Tip: Saluda cordialmente en inglés diciendo: "Good evening, welcome to LOVO Bar! Here is our cocktail menu." [Gud ív-ning, uél-cam tu LO-VO Bar! Jí-er is au-er cóc-teil me-niu].');
    }

    setGenerationNotice('¡Memoria inyectada con éxito! La IA utilizará este documento completo como fuente de la verdad para todos sus diálogos.');
    setActiveTab('manual');
    setTimeout(() => setGenerationNotice(null), 6000);
  };

  if (!isOpen) return null;

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGenerationNotice(null);
    try {
      const generated = await GeminiService.generateScenarioFromPrompt(aiPrompt, {
        targetEnglishLevel,
        difficulty
      });
      if (generated) {
        setTitle(generated.title || '');
        setNiche(generated.niche || '');
        setAiName(generated.aiCharacter?.name || '');
        setAiRole(generated.aiCharacter?.role || '');
        setAiAvatar(generated.aiCharacter?.avatar || '🍸');
        setAiPersonality(generated.aiCharacter?.personality || '');
        setVoiceGender(generated.aiCharacter?.voiceGender || 'male');
        setUserRole(generated.userRole || '');
        setContext(generated.context || '');
        setInitialGreeting(generated.initialGreeting || '');
        setInitialTranslation(generated.initialTranslation || '');
        setInitialTip(generated.initialTip || '');
        setDifficulty(generated.difficulty || difficulty || 'easy');
        setTargetEnglishLevel(generated.targetEnglishLevel || targetEnglishLevel || 'A1');
        setBusinessKnowledge(aiPrompt.trim());
        if (generated.objectives && generated.objectives.length > 0) {
          setObjectives(generated.objectives);
        }
        if (generated.commonObjections && generated.commonObjections.length > 0) {
          setObjections(generated.commonObjections);
        }
        if (generated.nicheVocabulary && generated.nicheVocabulary.length > 0) {
          setVocabulary(generated.nicheVocabulary);
        }
        setActiveTab('manual');
        setGenerationNotice('¡Escenario calibrado y programado con éxito a partir de tu carta! Revisa los campos y pulsa Guardar.');
        setTimeout(() => setGenerationNotice(null), 8000);
      }
    } catch (e) {
      console.error(e);
      alert('Hubo un error al procesar el documento con la IA. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !aiName.trim() || !initialGreeting.trim()) {
      alert('Por favor, completa al menos el Título, el Nombre del Personaje y el Saludo Inicial en Inglés.');
      return;
    }

    const scenarioData: Scenario = {
      id: scenarioToEdit?.id || 'custom-' + Date.now(),
      title: title.trim(),
      niche: niche.trim() || 'General Business & Hospitality',
      aiCharacter: {
        name: aiName.trim(),
        role: aiRole.trim() || 'Cliente Internacional',
        avatar: aiAvatar.trim() || '🍸',
        personality: aiPersonality.trim() || 'Amable y natural',
        voiceGender
      },
      userRole: userRole.trim() || 'Staff / Bartender',
      context: context.trim() || 'Simulación de atención a cliente internacional en inglés.',
      initialGreeting: initialGreeting.trim(),
      initialTranslation: initialTranslation.trim(),
      initialTip: initialTip.trim(),
      difficulty,
      targetEnglishLevel,
      objectives: objectives.filter((o) => o.description.trim().length > 0),
      commonObjections: objections.filter((o) => o.trim().length > 0),
      nicheVocabulary: vocabulary.filter((v) => v.trim().length > 0),
      businessKnowledge: businessKnowledge.trim() || undefined,
      isCustom: true,
      isHidden: scenarioToEdit?.isHidden || false,
      workspaceId: scenarioToEdit?.workspaceId || CloudSyncService.getCurrentWorkspaceId(),
      createdAt: scenarioToEdit?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSave(scenarioData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#0B0F17]/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#2A344A] bg-[#1C2331] text-[#E2E8F0] shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-3.5 border-b border-[#2A344A] bg-[#12161F] shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0 mr-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              {isEditMode ? <Edit3 className="w-4 h-4 text-sky-400" /> : <Sparkles className="w-4 h-4 text-sky-400" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-[#E2E8F0] truncate">
                {isEditMode ? 'Editar Escenario' : 'Crear Escenario'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#94A3B8] truncate hidden xs:block">
                {isEditMode
                  ? 'Modifica los diálogos, fonética, objetivos y vocabulario'
                  : 'Diseña una nueva simulación con IA o de forma manual'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#222B3D] transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#2A344A] px-3 sm:px-6 pt-1 bg-[#12161F] shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'ai'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">✨ Inyector Maestro de Carta / IA</span>
            <span className="sm:hidden">✨ Inyector Carta / IA</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'manual'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isEditMode ? 'Datos del Escenario' : 'Campos Detallados'}</span>
          </button>
        </div>

        {/* Tab Content: Scrollable body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-5 scrollbar-thin">
          {activeTab === 'ai' ? (
            <div className="space-y-4">
              {/* Master Injector Header Card */}
              <div className="border border-sky-500/30 rounded-2xl p-4 sm:p-5 bg-[#12161F] text-[#E2E8F0] space-y-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#E2E8F0]">
                    Inyector Maestro de Empresa / Carta de Productos
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  Copia y pega aquí la <strong>carta completa de tu bar/restaurante</strong>, lista de productos, precios, alérgenos o el manual de atención de tu empresa. La IA extraerá los nombres reales, creará los objetivos comerciales y calibrará los diálogos con fonética en un solo clic.
                </p>
              </div>

              {/* Pre-calibration Controls: English Level & Customer Temperament */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#12161F] border border-[#2A344A]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5">
                    Nivel Pitch Objetivo
                  </label>
                  <select
                    value={targetEnglishLevel}
                    onChange={(e) => setTargetEnglishLevel(e.target.value as EnglishLevel)}
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3 py-2 text-xs font-semibold text-[#E2E8F0] focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="A1">Pitch One (Iniciación y apoyo guiado)</option>
                    <option value="A2">Pitch One (Atención fluida y carta)</option>
                    <option value="B1">Pitch Two (Fluidez y alternativas)</option>
                    <option value="B2">Pitch Two (Argumentación y objeciones)</option>
                    <option value="C1">Pitch Three (Alta Dirección y Negociación)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-400 mb-1.5">
                    Dificultad / Actitud del Cliente
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full bg-[#18202F] border border-[#2A344A] rounded-xl px-3 py-2 text-xs font-semibold text-[#E2E8F0] focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="easy">Fácil (Cliente amable y comprensivo)</option>
                    <option value="medium">Medio (Cliente indeciso que pide recomendaciones)</option>
                    <option value="hard">Difícil (Cliente con prisas o peticiones especiales)</option>
                    <option value="hostile">Hostil / Retador (Quejas y gestión de incidencias)</option>
                  </select>
                </div>
              </div>

              {/* Giant Master Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Pega aquí la carta, menú o ambiente completo *
                  </label>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    {aiPrompt.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={9}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ejemplo de lo que puedes pegar en bruto:&#10;&#10;CARTA DE COCTELERÍA Y TAPAS (LOVO BAR):&#10;- Bubi Cocktail (12€): Ron blanco, plátano flameado, cacao, ginger beer. Sabor dulce.&#10;- Manabi Cocktail (13€): Pisco acholado, piña asada, coco, ají amarillo. Afrutado y picante.&#10;- Josephine Baker 0.0 (10€): Sin alcohol con maracuyá, menta fresca y tónica.&#10;- Tabla Jamón Ibérico de Bellota (22€), Tabla de Quesos Artesanos (18€).&#10;&#10;INFORMACIÓN DEL LOCAL:&#10;- Baños: Bajando las escaleras a la izquierda.&#10;- Pago: Tarjeta Visa/Mastercard o efectivo.&#10;- Preguntas habituales: ¿Opciones sin gluten? Sí, tablas y ensaladas."
                  className="w-full border rounded-2xl p-4 text-xs sm:text-sm font-mono leading-relaxed transition-colors focus:outline-none focus:border-sky-400 bg-[#18202F] border-[#2A344A] text-[#E2E8F0] placeholder:text-slate-500 resize-y"
                />
              </div>

              {/* Quick Load Business Templates */}
              <div className="space-y-2">
                <p className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>O carga una plantilla real de negocio para probar:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetEnglishLevel('A1');
                      setDifficulty('easy');
                      setAiPrompt(LOVO_BAR_MASTER_KNOWLEDGE);
                    }}
                    className="text-xs p-2.5 rounded-xl text-left border transition-all cursor-pointer bg-[#18202F] hover:bg-[#222B3D] border-[#2A344A] text-[#E2E8F0] hover:border-sky-400/50 flex items-center gap-2"
                  >
                    <span>🍸</span>
                    <span className="font-medium">Coctelería LOVO Bar (Carta Oficial Completa + Protocolo 8 Pasos)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetEnglishLevel('A2');
                      setDifficulty('medium');
                      setAiPrompt(`MANUAL DE ATENCIÓN EN RECEPCIÓN CORPORATIVA:\n- Procedimiento: Saludar cordialmente, pedir documento de identidad (ID / Passport) y registrar en el libro de visitas.\n- Entrega de acreditación: Entregar pase de visitante (Visitor Badge) para los tornos de acceso.\n- Salas de reuniones: Sala A (primera planta), Sala B (segunda planta al fondo a la derecha).\n- Paquetería: Recepcionar envíos de mensajería (DHL, UPS), firmar albarán y notificar al empleado destinatario.\n- Incidencias: Contactar con equipo de mantenimiento si falla el proyector o el aire acondicionado.`);
                    }}
                    className="text-xs p-2.5 rounded-xl text-left border transition-all cursor-pointer bg-[#18202F] hover:bg-[#222B3D] border-[#2A344A] text-[#E2E8F0] hover:border-sky-400/50 flex items-center gap-2"
                  >
                    <span>🏢</span>
                    <span className="font-medium">Oficinas / Recepción & Mensajería</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetEnglishLevel('B1');
                      setDifficulty('medium');
                      setAiPrompt(`CARTA RESTAURANTE Y CAFETERÍA ESPECIALIDAD:\n- Flat White (3.20€), Cold Brew con avena (4.50€), Matcha Latte (4.80€).\n- Tostada de aguacate, huevo poché y semillas (8.50€). Pan sin gluten disponible (+1€).\n- Alérgenos: Disponemos de leche de avena, almendras y soja. Toda la repostería contiene trazas de frutos secos.\n- Pago y pedidos: Se pide en mostrador con número de mesa. Aceptamos pagos con móvil y Apple Pay.`);
                    }}
                    className="text-xs p-2.5 rounded-xl text-left border transition-all cursor-pointer bg-[#18202F] hover:bg-[#222B3D] border-[#2A344A] text-[#E2E8F0] hover:border-sky-400/50 flex items-center gap-2"
                  >
                    <span>☕</span>
                    <span className="font-medium">Cafetería de Especialidad & Brunch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetEnglishLevel('B1');
                      setDifficulty('hard');
                      setAiPrompt(`MANUAL DE CHECK-IN EN HOTEL INTERNACIONAL:\n- Check-in: A partir de las 15:00. Solicitar pasaportes de todos los huéspedes mayores de edad.\n- Desayuno buffet: De 07:00 a 10:30 AM en la planta baja.\n- Check-out: Máximo a las 12:00 del mediodía. Late check-out sujeto a suplemento y disponibilidad.\n- Consigna: Gratuita para clientes antes de entrar a la habitación o tras la salida.\n- Taxis al aeropuerto: Se solicitan desde recepción, coste fijo aproximado 30-35€.`);
                    }}
                    className="text-xs p-2.5 rounded-xl text-left border transition-all cursor-pointer bg-[#18202F] hover:bg-[#222B3D] border-[#2A344A] text-[#E2E8F0] hover:border-sky-400/50 flex items-center gap-2"
                  >
                    <span>🛎️</span>
                    <span className="font-medium">Hotel / Recepción & Conserjería</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: AI Calibration & Direct Memory Injection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20 active:scale-[0.99]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Calibrando con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>✨ Calibrar Diálogos & Objetivos con IA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectInject}
                  disabled={!aiPrompt.trim()}
                  className="py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer bg-[#18202F] hover:bg-[#222B3D] border border-sky-400/50 text-sky-400 hover:text-sky-300 disabled:opacity-50 active:scale-[0.99]"
                  title="Inyecta todo el texto en bruto a la memoria de la IA de inmediato"
                >
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span>⚡ Inyectar a Memoria Directamente (1 Clic)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {generationNotice && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{generationNotice}</span>
                </div>
              )}
              {/* Basic Details: Title & Niche */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-200">
                    Título del Escenario *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Staff LOVO Bar: Atención a Clientes Internacionales"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm sm:text-base transition-colors focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-200">
                    Nicho / Ubicación
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ej: Coctelería & Hospitalidad (LOVO Bar Madrid)"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm sm:text-base transition-colors focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                  />
                </div>
              </div>

              {/* Master Business Knowledge / Menu Document Card */}
              <div className="rounded-2xl p-4 sm:p-5 border border-sky-500/30 bg-[#12161F] space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[#E2E8F0] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Memoria de Negocio / Carta Inyectada a la IA</span>
                  </label>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {businessKnowledge.length > 0 ? `${businessKnowledge.length} caracteres activos` : 'Sin memoria inyectada'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Todo lo que esté en esta caja es la <strong>fuente estricta de la verdad</strong> para la IA durante la simulación de voz (cócteles, precios, ingredientes, políticas y storytelling).
                </p>
                <textarea
                  rows={4}
                  value={businessKnowledge}
                  onChange={(e) => setBusinessKnowledge(e.target.value)}
                  placeholder="Pega aquí la carta, menú o manual del negocio..."
                  className="w-full border rounded-xl p-3 text-xs sm:text-sm transition-colors focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0] placeholder:text-slate-500 font-mono resize-y"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt(businessKnowledge || LOVO_BAR_MASTER_KNOWLEDGE);
                      setActiveTab('ai');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Abrir en el Inyector Maestro de Carta / IA</span>
                  </button>
                  {businessKnowledge.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setBusinessKnowledge(LOVO_BAR_MASTER_KNOWLEDGE)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Inyectar Carta Oficial LOVO Bar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Character Profile */}
              <div className="rounded-2xl p-4 sm:p-5 border space-y-4 bg-[#12161F] border-[#2A344A]">
                <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider">
                  Perfil del Interlocutor (IA)
                </h4>

                {/* Avatar Emoji Selector - Responsive wrap, NEVER overflows */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#94A3B8]">
                    Seleccionar Avatar:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAiAvatar(emoji)}
                        className={`text-xl p-2 rounded-xl border transition-all cursor-pointer ${
                          aiAvatar === emoji
                            ? 'bg-sky-500/20 border-sky-500/60 scale-110 shadow-sm'
                            : 'bg-[#18202F] border-[#2A344A] hover:bg-[#222B3D] opacity-80'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Nombre del Personaje *</label>
                    <input
                      type="text"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      placeholder="Ej: James & Sarah"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Rol del Personaje</label>
                    <input
                      type="text"
                      value={aiRole}
                      onChange={(e) => setAiRole(e.target.value)}
                      placeholder="Ej: Clientes extranjeros"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Voz (Género)</label>
                    <select
                      value={voiceGender}
                      onChange={(e) => setVoiceGender(e.target.value as any)}
                      className="w-full border rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    >
                      <option value="male">Masculina (Male)</option>
                      <option value="female">Femenina (Female)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Tu Rol (Usuario)</label>
                    <input
                      type="text"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      placeholder="Ej: Camarero / Bartender"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Personalidad de la IA</label>
                    <input
                      type="text"
                      value={aiPersonality}
                      onChange={(e) => setAiPersonality(e.target.value)}
                      placeholder="Ej: Tutor empático y cercano. Te guía paso a paso."
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    />
                  </div>
                </div>
              </div>

              {/* Context Setup */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-200">
                  Contexto y Situación
                </label>
                <textarea
                  rows={2}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Estás en LOVO Bar (Calle Echegaray 20, Madrid). Tu tutor te guía en español paso a paso..."
                  className="w-full border rounded-xl p-3 text-sm sm:text-base transition-colors focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                />
              </div>

              {/* Initial Greeting, Translation & Phonetic Tip */}
              <div className="rounded-2xl p-4 sm:p-5 border border-[#2A344A] bg-[#12161F] space-y-3.5">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Diálogo Inicial y Ayuda de Pronunciación</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    1. Saludo Inicial de la IA (En Inglés) *
                  </label>
                  <textarea
                    rows={2}
                    value={initialGreeting}
                    onChange={(e) => setInitialGreeting(e.target.value)}
                    placeholder="Hello! Good evening, a table for two, please!"
                    className="w-full border rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      2. Traducción al Español (Opcional)
                    </label>
                    <input
                      type="text"
                      value={initialTranslation}
                      onChange={(e) => setInitialTranslation(e.target.value)}
                      placeholder="¡Hola! Buenas noches, ¿una mesa para dos, por favor?"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      3. Tip con Pronunciación Fonética [Fonética]
                    </label>
                    <input
                      type="text"
                      value={initialTip}
                      onChange={(e) => setInitialTip(e.target.value)}
                      placeholder="Tip: Di en inglés 'Welcome to LOVO Bar!' [Uél-cam tu LO-VO Bar!]"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty and Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-200">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm cursor-pointer focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                  >
                    <option value="easy">Fácil (Pacientes y colaboradores)</option>
                    <option value="medium">Media (Clientes ocupados)</option>
                    <option value="hard">Difícil (Objeciones exigentes)</option>
                    <option value="hostile">Hostil / Negociación dura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-200">
                    Nivel Pitch Objetivo
                  </label>
                  <select
                    value={targetEnglishLevel}
                    onChange={(e) => setTargetEnglishLevel(e.target.value as EnglishLevel)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm cursor-pointer focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                  >
                    <option value="A1">Pitch One (Iniciación / Frases cortas y guiadas)</option>
                    <option value="A2">Pitch One (Atención operativa y carta)</option>
                    <option value="B1">Pitch Two (Intermedio comercial)</option>
                    <option value="B2">Pitch Two (Argumentación y Up-Selling)</option>
                    <option value="C1">Pitch Three (Alta Dirección y Negociación)</option>
                    <option value="C2">Pitch Three (Maestría y Diplomacia VIP)</option>
                  </select>
                </div>
              </div>

              {/* Objectives List */}
              <div className="rounded-2xl p-4 sm:p-5 border border-[#2A344A] bg-[#12161F] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">
                    Objetivos de la Simulación ({objectives.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setObjectives([...objectives, { id: 'obj-' + Date.now(), description: '', completed: false }])
                    }
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir objetivo
                  </button>
                </div>
                <div className="space-y-2.5">
                  {objectives.map((obj, i) => (
                    <div key={obj.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={obj.description}
                        onChange={(e) => {
                          const updated = [...objectives];
                          updated[i].description = e.target.value;
                          setObjectives(updated);
                        }}
                        placeholder={`Objetivo ${i + 1}`}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                      />
                      <button
                        type="button"
                        onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Objections */}
              <div className="rounded-2xl p-4 sm:p-5 border border-[#2A344A] bg-[#12161F] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">
                    Objeciones del Cliente ({objections.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setObjections([...objections, ''])}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir objeción
                  </button>
                </div>
                <div className="space-y-2.5">
                  {objections.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const updated = [...objections];
                          updated[i] = e.target.value;
                          setObjections(updated);
                        }}
                        placeholder={`Objeción ${i + 1}`}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0]"
                      />
                      <button
                        type="button"
                        onClick={() => setObjections(objections.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary and Key Expressions */}
              <div className="rounded-2xl p-4 sm:p-5 border border-[#2A344A] bg-[#12161F] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Vocabulario Clave con Fonética ({vocabulary.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setVocabulary([...vocabulary, ''])}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir frase
                  </button>
                </div>
                <div className="space-y-2.5">
                  {vocabulary.map((vocab, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={vocab}
                        onChange={(e) => {
                          const updated = [...vocabulary];
                          updated[i] = e.target.value;
                          setVocabulary(updated);
                        }}
                        placeholder={`Término ${i + 1} (ej. Table or bar? [Téibol or bar?])`}
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-[#18202F] border-[#2A344A] text-[#E2E8F0] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setVocabulary(vocabulary.filter((_, idx) => idx !== i))}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Fixed & fully visible on mobile */}
        <div className="flex items-center justify-end gap-2.5 px-3.5 sm:px-6 py-3 sm:py-3.5 border-t border-[#2A344A] bg-[#12161F] shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#222B3D] transition-colors cursor-pointer text-center"
          >
            {t('modal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer text-center"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{isEditMode ? 'Guardar Cambios' : 'Guardar y Practicar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
