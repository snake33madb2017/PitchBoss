import React, { useState, useEffect } from 'react';
import type { Scenario, DifficultyLevel, EnglishLevel, Objective } from '../types';
import { GeminiService } from '../services/geminiService';
import { X, Sparkles, Plus, Trash2, Loader2, Wand2, Edit3, BookOpen, MessageSquare, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

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
        setActiveTab('manual');
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
      } else {
        setActiveTab('ai');
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
        setObjectives([
          { id: 'obj-1', description: 'Saludar en inglés con naturalidad', completed: false }
        ]);
        setObjections(['Do you have a table for two?']);
        setVocabulary(['Welcome [Uél-cam]']);
      }
    }
  }, [isOpen, scenarioToEdit]);

  if (!isOpen) return null;

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generated = await GeminiService.generateScenarioFromPrompt(aiPrompt);
      if (generated) {
        setTitle(generated.title || '');
        setNiche(generated.niche || '');
        setAiName(generated.aiCharacter?.name || '');
        setAiRole(generated.aiCharacter?.role || '');
        setAiAvatar(generated.aiCharacter?.avatar || '💼');
        setAiPersonality(generated.aiCharacter?.personality || '');
        setVoiceGender(generated.aiCharacter?.voiceGender || 'male');
        setUserRole(generated.userRole || '');
        setContext(generated.context || '');
        setInitialGreeting(generated.initialGreeting || '');
        setInitialTranslation(generated.initialTranslation || '');
        setInitialTip(generated.initialTip || '');
        setDifficulty(generated.difficulty || 'medium');
        setTargetEnglishLevel(generated.targetEnglishLevel || 'B1');
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
      }
    } catch (e) {
      console.error(e);
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
      isCustom: true,
      isHidden: scenarioToEdit?.isHidden || false,
      createdAt: scenarioToEdit?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSave(scenarioData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-[#0f0f13] text-zinc-100 shadow-2xl shadow-black/95 flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/95 shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              {isEditMode ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {isEditMode ? 'Editar Escenario' : 'Crear Escenario de Entrenamiento'}
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                {isEditMode
                  ? 'Modifica los diálogos, fonética, objetivos y vocabulario'
                  : 'Diseña una nueva simulación con IA o de forma manual'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-zinc-800 px-4 sm:px-6 pt-1 bg-zinc-950/50 shrink-0">
          {!isEditMode && (
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>{t('modal.tabAi')}</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditMode ? 'Datos del Escenario' : t('modal.tabManual')}</span>
          </button>
        </div>

        {/* Tab Content: Scrollable body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-5 scrollbar-thin">
          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="border border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed bg-zinc-950 text-zinc-300">
                {t('modal.aiBanner')}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-zinc-200">
                  {t('modal.promptLabel')}
                </label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Camarero en LOVO Bar atendiendo a una pareja de turistas británicos que preguntan por cócteles dulces y tapas sin gluten..."
                  className="w-full border rounded-2xl p-3.5 text-sm sm:text-base transition-colors focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              {/* Sample idea chips */}
              <div className="space-y-2">
                <p className="text-xs text-zinc-400 font-semibold">Ideas de prueba rápida:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Atender comensales estadounidenses que piden la cuenta por separado en barra',
                    'Recomendar cócteles de autor en LOVO Bar a una clienta indecisa',
                    'Gestionar una queja amablemente por una bebida que tardó unos minutos',
                    'Atender a turistas en inglés básico A1 preguntando por el baño y tapas ibéricas'
                  ].map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(idea)}
                      className="text-xs sm:text-sm px-3 py-1.5 rounded-xl text-left border transition-colors cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('modal.generating')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                    <span>Generar Escenario con IA</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Basic Details: Title & Niche */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-zinc-200">
                    Título del Escenario *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Staff LOVO Bar: Atención a Clientes Internacionales"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm sm:text-base transition-colors focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-zinc-200">
                    Nicho / Ubicación
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ej: Coctelería & Hospitalidad (LOVO Bar Madrid)"
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm sm:text-base transition-colors focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>

              {/* Character Profile */}
              <div className="rounded-2xl p-4 sm:p-5 border space-y-4 bg-zinc-950/60 border-zinc-800">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Perfil del Interlocutor (IA)
                </h4>

                {/* Avatar Emoji Selector - Responsive wrap, NEVER overflows */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400">
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
                            ? 'bg-amber-500/20 border-amber-500/60 scale-110 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 opacity-80'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Nombre del Personaje *</label>
                    <input
                      type="text"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      placeholder="Ej: James & Sarah"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Rol del Personaje</label>
                    <input
                      type="text"
                      value={aiRole}
                      onChange={(e) => setAiRole(e.target.value)}
                      placeholder="Ej: Clientes extranjeros"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Voz (Género)</label>
                    <select
                      value={voiceGender}
                      onChange={(e) => setVoiceGender(e.target.value as any)}
                      className="w-full border rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    >
                      <option value="male">Masculina (Male)</option>
                      <option value="female">Femenina (Female)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Tu Rol (Usuario)</label>
                    <input
                      type="text"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      placeholder="Ej: Camarero / Bartender"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Personalidad de la IA</label>
                    <input
                      type="text"
                      value={aiPersonality}
                      onChange={(e) => setAiPersonality(e.target.value)}
                      placeholder="Ej: Tutor empático y cercano. Te guía paso a paso."
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Context Setup */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-zinc-200">
                  Contexto y Situación
                </label>
                <textarea
                  rows={2}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Estás en LOVO Bar (Calle Echegaray 20, Madrid). Tu tutor te guía en español paso a paso..."
                  className="w-full border rounded-xl p-3 text-sm sm:text-base transition-colors focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>

              {/* Initial Greeting, Translation & Phonetic Tip */}
              <div className="rounded-2xl p-4 sm:p-5 border border-zinc-800 bg-zinc-950/70 space-y-3.5">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Diálogo Inicial y Ayuda de Pronunciación</span>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 font-semibold mb-1">
                    1. Saludo Inicial de la IA (En Inglés) *
                  </label>
                  <textarea
                    rows={2}
                    value={initialGreeting}
                    onChange={(e) => setInitialGreeting(e.target.value)}
                    placeholder="Hello! Good evening, a table for two, please!"
                    className="w-full border rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-300 font-semibold mb-1">
                      2. Traducción al Español (Opcional)
                    </label>
                    <input
                      type="text"
                      value={initialTranslation}
                      onChange={(e) => setInitialTranslation(e.target.value)}
                      placeholder="¡Hola! Buenas noches, ¿una mesa para dos, por favor?"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-300 font-semibold mb-1">
                      3. Tip con Pronunciación Fonética [Fonética]
                    </label>
                    <input
                      type="text"
                      value={initialTip}
                      onChange={(e) => setInitialTip(e.target.value)}
                      placeholder="Tip: Di 'Welcome to LOVO Bar!' [Uél-cam tu Lovo Bar!]"
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty and Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-zinc-200">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm cursor-pointer focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100"
                  >
                    <option value="easy">Fácil (Pacientes y colaboradores)</option>
                    <option value="medium">Media (Clientes ocupados)</option>
                    <option value="hard">Difícil (Objeciones exigentes)</option>
                    <option value="hostile">Hostil / Negociación dura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-zinc-200">
                    Nivel de Inglés Objetivo
                  </label>
                  <select
                    value={targetEnglishLevel}
                    onChange={(e) => setTargetEnglishLevel(e.target.value as EnglishLevel)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-sm cursor-pointer focus:outline-none focus:border-amber-500 bg-zinc-950 border-zinc-800 text-zinc-100"
                  >
                    <option value="A1">Nivel A1 (Principiante / Frases cortas y guiadas)</option>
                    <option value="A2">Nivel A2 (Básico conversacional)</option>
                    <option value="B1">Nivel B1 (Intermedio)</option>
                    <option value="B2">Nivel B2 (Intermedio alto)</option>
                    <option value="C1">Nivel C1 (Avanzado profesional)</option>
                    <option value="C2">Nivel C2 (Nativo / Alta dirección)</option>
                  </select>
                </div>
              </div>

              {/* Objectives List */}
              <div className="rounded-2xl p-4 sm:p-5 border border-zinc-800 bg-zinc-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">
                    Objetivos de la Simulación ({objectives.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setObjectives([...objectives, { id: 'obj-' + Date.now(), description: '', completed: false }])
                    }
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Objections */}
              <div className="rounded-2xl p-4 sm:p-5 border border-zinc-800 bg-zinc-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">
                    Objeciones del Cliente ({objections.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setObjections([...objections, ''])}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => setObjections(objections.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary and Key Expressions */}
              <div className="rounded-2xl p-4 sm:p-5 border border-zinc-800 bg-zinc-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Vocabulario Clave con Fonética ({vocabulary.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setVocabulary([...vocabulary, ''])}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
                        className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-zinc-900 border-zinc-800 text-zinc-100 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setVocabulary(vocabulary.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-rose-400 p-2 rounded-xl transition-colors cursor-pointer"
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
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/95 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {t('modal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEditMode ? 'Guardar Cambios' : 'Guardar y Practicar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
