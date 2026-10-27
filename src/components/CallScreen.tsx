import React, { useState, useEffect, useRef } from 'react';
import type { Scenario, Message, SessionReport, SavedSession, AppSettings } from '../types';
import { GeminiService } from '../services/geminiService';
import { SpeechService } from '../services/speechService';
import { SessionHistoryService } from '../services/sessionHistoryService';
import { AudioRecordingService } from '../services/audioRecordingService';
import { AudioVisualizer } from './AudioVisualizer';
import { useTranslation } from '../i18n/LanguageContext';
import {
  PhoneOff,
  Mic,
  Volume2,
  VolumeX,
  Lightbulb,
  CheckCircle2,
  Circle,
  Sparkles,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Keyboard,
  Languages,
  Radio,
  BookOpen,
  Trophy,
  Zap,
  AlertCircle,
  Globe
} from 'lucide-react';
import { CorporateAvatar } from './CorporateAvatar';

interface CallScreenProps {
  scenario: Scenario;
  initialSession?: SavedSession | null;
  settings?: AppSettings;
  onEndCall: (report: SessionReport) => void;
  onExit: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({ scenario, initialSession, settings, onEndCall, onExit }) => {
  const { t } = useTranslation();

  const sessionIdRef = useRef<string>(
    initialSession?.id || `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );

  // Call state
  const [callState, setCallState] = useState<'idle' | 'ai_speaking' | 'user_listening' | 'processing'>(
    initialSession ? 'idle' : 'processing'
  );
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialSession && initialSession.messages.length > 0) {
      return initialSession.messages;
    }
    return [
      {
        id: 'msg-0',
        sender: 'ai',
        text: scenario.initialGreeting,
        translation: scenario.initialTranslation,
        tip: scenario.initialTip,
        timestamp: Date.now()
      }
    ];
  });
  const [interimTranscript, setInterimTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(initialSession?.durationSeconds || 0);
  const [isMuted, setIsMuted] = useState(false);

  // Voice & Interaction Mode State
  const [isHandsFree, setIsHandsFree] = useState<boolean>(settings?.autoListen ?? false);
  const isHandsFreeRef = useRef(isHandsFree);
  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  const [speechLang, setSpeechLang] = useState<'en-US' | 'es-ES'>('en-US');
  const speechLangRef = useRef<'en-US' | 'es-ES'>('en-US');
  useEffect(() => {
    speechLangRef.current = speechLang;
  }, [speechLang]);

  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const silenceThreshold = settings?.silenceThresholdMs || 800;
  const fastMode = settings?.fastResponseMode !== false;

  // Walkie-Talkie & Push-To-Talk state
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  const isHoldingMicRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const hasSpokenInitialRef = useRef(false);
  const [walkieTalkieTip, setWalkieTalkieTip] = useState<string | null>(null);
  const transcriptRef = useRef('');
  const pressStartTimeRef = useRef(0);

  // Collapsible helpers to avoid screen clutter
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [dismissedLevelNudge, setDismissedLevelNudge] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Live hints modal
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [showHintsModal, setShowHintsModal] = useState(false);

  // Latest feedback pill
  const [latestCorrection, setLatestCorrection] = useState<{
    originalText: string;
    improvedText: string;
    explanation: string;
  } | null>(null);

  // Scenario objectives state
  const currentObjectivesRef = useRef(initialSession?.objectives || scenario.objectives);
  const [currentObjectives, setCurrentObjectives] = useState(initialSession?.objectives || scenario.objectives);
  useEffect(() => {
    currentObjectivesRef.current = currentObjectives;
  }, [currentObjectives]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format call duration MM:SS
  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start initial greeting or resume session
  useEffect(() => {
    if (initialSession) {
      setCallState('idle');
      return () => {
        SpeechService.cancelSpeech();
        SpeechService.stopListening();
      };
    }

    if (hasSpokenInitialRef.current) {
      return;
    }
    hasSpokenInitialRef.current = true;

    const initialMsg: Message = {
      id: 'msg-0',
      sender: 'ai',
      text: scenario.initialGreeting,
      translation: scenario.initialTranslation,
      tip: scenario.initialTip,
      timestamp: Date.now()
    };
    setMessages([initialMsg]);

    SessionHistoryService.upsertSession({
      id: sessionIdRef.current,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioNiche: scenario.niche,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      durationSeconds: 0,
      status: 'in_progress',
      messages: [initialMsg],
      objectives: scenario.objectives
    });

    // Speak initial greeting with natural cadence
    setCallState('ai_speaking');
    const effectiveRate = settings?.speechRate || (fastMode ? 1.08 : 1.0);
    SpeechService.speakText({
      text: scenario.initialGreeting,
      voiceName: settings?.preferredVoice,
      rate: effectiveRate,
      onStart: () => setCallState('ai_speaking'),
      onEnd: () => {
        setCallState('idle');
        if (isHandsFreeRef.current) {
          setTimeout(() => {
            startListeningSession(true);
          }, 300);
        }
      },
      onError: () => {
        setCallState('idle');
      }
    });

    return () => {
      SpeechService.cancelSpeech();
      SpeechService.stopListening();
    };
  }, []);

  // Auto-scroll chat log
  useEffect(() => {
    if (showChatLog) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChatLog]);

  // Speech error translator & diagnostics
  const handleSpeechError = (err: string) => {
    console.warn('Speech error received:', err);
    if (err === 'not-allowed' || err === 'denied' || err === 'permission-denied') {
      setMicErrorMessage('El navegador ha bloqueado el micrófono. Haz clic en "Activar Micrófono" o desbloquea el candado 🔒 en la barra de direcciones.');
    } else if (err === 'audio-capture') {
      setMicErrorMessage('No se detecta entrada de audio. Comprueba que el micrófono esté conectado y no esté en uso por otra app.');
    } else if (err === 'unsupported') {
      setMicErrorMessage('Tu navegador actual no admite reconocimiento de voz nativo (Web Speech API). Te recomendamos Google Chrome o Microsoft Edge.');
    } else if (err === 'network') {
      setMicErrorMessage('Error de red al conectar con el servicio de voz de Google. Revisa tu conexión a internet o usa el teclado.');
    } else if (err !== 'no-speech' && err !== 'aborted') {
      setMicErrorMessage(`Error de micrófono: ${err}. Puedes usar el teclado para responder.`);
    }
    setCallState('idle');
    setIsHoldingMic(false);
    isHoldingMicRef.current = false;
  };

  const handleRequestMicPermission = async () => {
    const res = await SpeechService.requestMicrophonePermission();
    if (res.granted) {
      setMicErrorMessage(null);
      startListeningSession(isHandsFreeRef.current);
    } else {
      handleSpeechError(res.error || 'not-allowed');
    }
  };

  // Helper to start listening session
  const startListeningSession = (handsFreeMode = false) => {
    if (callState === 'processing' || isSubmittingRef.current) return;
    if (callState === 'ai_speaking') {
      SpeechService.cancelSpeech();
    }

    setMicErrorMessage(null);
    pressStartTimeRef.current = Date.now();
    transcriptRef.current = '';
    setInterimTranscript('');
    setCallState('user_listening');

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {}
    }

    try {
      AudioRecordingService.startRecording();
    } catch {}

    SpeechService.startListening({
      lang: speechLangRef.current,
      enableAutoSilence: handsFreeMode || isHandsFreeRef.current,
      silenceTimeoutMs: silenceThreshold,
      onTranscript: (text) => {
        transcriptRef.current = text;
        setInterimTranscript(text);
      },
      onSpeechEnd: (finalText) => {
        const raw = finalText || transcriptRef.current;
        const cleaned = SpeechService.cleanDuplicatePhrases(raw);
        if (cleaned && cleaned.length >= 2) {
          handleUserSubmission(cleaned);
        } else {
          setCallState('idle');
        }
      },
      onError: (err) => {
        handleSpeechError(err);
      }
    });
  };

  // Immediate stop and submit without buffering lag
  const handleStopListeningAndSubmit = () => {
    const immediateText = (transcriptRef.current || SpeechService.getLatestTranscript()).trim();
    SpeechService.stopListening();
    setInterimTranscript('');

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }

    const cleaned = SpeechService.cleanDuplicatePhrases(immediateText);
    if (cleaned && cleaned.length >= 2) {
      AudioRecordingService.stopRecording().catch(() => {});
      handleUserSubmission(cleaned);
    } else {
      setCallState('idle');
      setWalkieTalkieTip('No se detectó voz. Vuelve a pulsar o mantén presionado para hablar.');
      setTimeout(() => setWalkieTalkieTip(null), 3000);
    }
  };

  // Smart Mic Pointer Down: starts listening or handles click-to-send
  const handleWalkieTalkieStart = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (callState === 'processing' || isSubmittingRef.current) return;

    // If currently listening in Tap-to-Talk mode, tapping again submits immediately!
    if (callState === 'user_listening' && !isHoldingMicRef.current) {
      handleStopListeningAndSubmit();
      return;
    }

    pressStartTimeRef.current = Date.now();
    isHoldingMicRef.current = true;
    setIsHoldingMic(true);
    setWalkieTalkieTip(null);

    startListeningSession(isHandsFreeRef.current);
  };

  // Smart Mic Pointer Up: determines if it was a quick tap or a held press
  const handleWalkieTalkieEnd = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!isHoldingMicRef.current) return;
    const holdDuration = Date.now() - pressStartTimeRef.current;
    isHoldingMicRef.current = false;
    setIsHoldingMic(false);

    // If quick tap (< 350ms): user clicked to activate Tap-to-Talk! Keep listening!
    if (holdDuration < 350) {
      return;
    }

    // Held > 350ms: Walkie-Talkie release to send
    handleStopListeningAndSubmit();
  };

  // Process user speech or typed text with ultra-low latency
  const handleUserSubmission = async (text: string, audioUrl?: string) => {
    if (isSubmittingRef.current || callState === 'processing') return;
    isSubmittingRef.current = true;

    try {
      SpeechService.stopListening();
      setInterimTranscript('');

      const cleaned = SpeechService.cleanDuplicatePhrases(text.trim());
      if (!cleaned || cleaned.length < 2) {
        setCallState('idle');
        return;
      }

      // Acoustic Echo Guard
      const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
      if (lastAi) {
        const lowerUser = cleaned.toLowerCase();
        const lowerAi = lastAi.text.toLowerCase();
        if (lowerUser.length > 8 && lowerAi.includes(lowerUser)) {
          console.warn('Acoustic echo detected from speakers, ignoring turn:', cleaned);
          setCallState('idle');
          return;
        }
      }

      const userMsg: Message = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: cleaned,
        audioUrl,
        timestamp: Date.now()
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setCallState('processing');

      // Fast turn generation using Gemini 2.0 Flash
      const response = await GeminiService.sendTurn({
        scenario,
        conversationHistory: updatedHistory,
        userMessageText: cleaned
      });

      // Update objectives if satisfied
      if (response.completedObjectiveIds && response.completedObjectiveIds.length > 0) {
        setCurrentObjectives((prev) =>
          prev.map((o) => (response.completedObjectiveIds!.includes(o.id) ? { ...o, completed: true } : o))
        );
      }

      // Show real-time friendly correction if found
      if (response.corrections && response.corrections.length > 0) {
        setLatestCorrection(response.corrections[0]);
      }

      const aiMsg: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: response.reply,
        translation: response.translation,
        tip: response.tip,
        timestamp: Date.now(),
        corrections: response.corrections
      };

      const nextMessages = [...updatedHistory, aiMsg];
      setMessages(nextMessages);

      // Auto-save in-progress session
      SessionHistoryService.upsertSession({
        id: sessionIdRef.current,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        scenarioNiche: scenario.niche,
        startedAt: initialSession?.startedAt || Date.now(),
        updatedAt: Date.now(),
        durationSeconds,
        status: 'in_progress',
        messages: nextMessages,
        objectives: currentObjectivesRef.current
      });

      // Speak response out loud using instant local browser speech synthesis
      if (!isMuted) {
        setCallState('ai_speaking');
        const effectiveRate = settings?.speechRate || (fastMode ? 1.08 : 1.0);
        SpeechService.speakText({
          text: response.reply,
          voiceName: settings?.preferredVoice,
          rate: effectiveRate,
          onStart: () => setCallState('ai_speaking'),
          onEnd: () => {
            setCallState('idle');
            if (isHandsFreeRef.current) {
              setTimeout(() => {
                startListeningSession(true);
              }, 250);
            }
          },
          onError: () => {
            setCallState('idle');
          }
        });
      } else {
        setCallState('idle');
      }
    } catch (e) {
      console.error(e);
      setCallState('idle');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Re-play or toggle last AI utterance
  const toggleRepeatAiSpeech = () => {
    if (callState === 'ai_speaking') {
      SpeechService.cancelSpeech();
      setCallState('idle');
      return;
    }

    const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
    if (lastAi) {
      if (isMuted) {
        setIsMuted(false);
      }
      SpeechService.cancelSpeech();
      setCallState('ai_speaking');
      const effectiveRate = settings?.speechRate || (fastMode ? 1.08 : 1.0);
      SpeechService.speakText({
        text: lastAi.text,
        voiceName: settings?.preferredVoice,
        rate: effectiveRate,
        onStart: () => setCallState('ai_speaking'),
        onEnd: () => {
          setCallState('idle');
        },
        onError: () => {
          setCallState('idle');
        }
      });
    }
  };

  const repeatLastAiStatement = toggleRepeatAiSpeech;

  // Request instant hints from AI
  const fetchLiveHints = async () => {
    setShowHintsModal(true);
    setLoadingHints(true);
    try {
      const suggestions = await GeminiService.getLiveHints(scenario, messages);
      setHints(suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHints(false);
    }
  };

  // Conclude call and compute final performance report
  const handleHangUp = async () => {
    SpeechService.cancelSpeech();
    SpeechService.stopListening();
    setCallState('processing');

    const updatedScenario = {
      ...scenario,
      objectives: currentObjectives
    };

    const report = await GeminiService.generateSessionReport({
      scenario: updatedScenario,
      conversationHistory: messages,
      durationSeconds
    });

    const userAudioUrl = [...messages].reverse().find((m) => m.audioUrl)?.audioUrl;
    if (userAudioUrl) {
      report.audioRecordingUrl = userAudioUrl;
    }
    AudioRecordingService.cleanup();

    // Mark session as completed in storage
    SessionHistoryService.completeSession({
      sessionId: sessionIdRef.current,
      report,
      messages,
      objectives: currentObjectives,
      durationSeconds
    });

    onEndCall(report);
  };

  const handleExitWithAutoSave = () => {
    SpeechService.cancelSpeech();
    SpeechService.stopListening();
    AudioRecordingService.cleanup();
    SessionHistoryService.upsertSession({
      id: sessionIdRef.current,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioNiche: scenario.niche,
      startedAt: initialSession?.startedAt || Date.now(),
      updatedAt: Date.now(),
      durationSeconds,
      status: 'in_progress',
      messages,
      objectives: currentObjectives
    });
    onExit();
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'ai');
  const lastAiMessage = lastAiMsg?.text || scenario.initialGreeting;
  const lastAiTranslation = lastAiMsg?.translation || scenario.initialTranslation;
  const lastAiTip = lastAiMsg?.tip || scenario.initialTip;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#12161F] text-[#E2E8F0] overflow-hidden">
      {/* Top Bar Header - Clean, non-wrapping single line */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-[#2A344A] bg-[#12161F]/95 backdrop-blur-md shrink-0 z-20">
        {/* Left: Avatar + Character Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1C2331] border border-[#2A344A] flex items-center justify-center shrink-0">
            <span className="text-base sm:text-lg" role="img">
              {scenario.aiCharacter.avatar}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-[#E2E8F0] truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[220px]">
                {scenario.aiCharacter.name}
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            </div>
            <p className="text-[10px] text-[#94A3B8] truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none">
              {scenario.userRole}
            </p>
          </div>
        </div>

        {/* Right: Controls & Timer */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mute speaker button */}
          <button
            onClick={() => {
              if (!isMuted) SpeechService.cancelSpeech();
              setIsMuted(!isMuted);
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-[#1C2331] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
            title={isMuted ? 'Activar sonido' : 'Silenciar voz'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Timer pill */}
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-[#1C2331] border border-[#2A344A] text-[11px] sm:text-xs font-mono font-medium text-[#FBBF24] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
            <span>{formatDuration(durationSeconds)}</span>
          </div>

          {/* Objectives Toggle */}
          <button
            onClick={() => setShowObjectives(!showObjectives)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-[#1C2331] hover:bg-[#202838] border border-[#2A344A] text-[11px] sm:text-xs font-medium text-[#E2E8F0] transition-colors cursor-pointer shrink-0"
            title="Ver objetivos"
          >
            <span>
              {currentObjectives.filter((o) => o.completed).length}/{currentObjectives.length}
            </span>
            {showObjectives ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Exit without report */}
          <button
            onClick={handleExitWithAutoSave}
            className="p-1.5 rounded-xl bg-[#1C2331] hover:bg-[#202838] border border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0] transition-colors cursor-pointer shrink-0"
            title="Guardar y Salir"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Objectives Drawer */}
      {showObjectives && (
        <div className="bg-[#1C2331] border-b border-[#2A344A] px-4 sm:px-6 py-3 space-y-2 backdrop-blur-md shrink-0 z-20 animate-in fade-in slide-in-from-top-2">
          <p className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
            Objetivos de la Simulación
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentObjectives.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-start gap-2 p-2 rounded-xl text-xs border ${
                  obj.completed
                    ? 'bg-sky-500/10 border-sky-500/30 text-[#38BDF8] font-medium'
                    : 'bg-[#12161F] border-[#2A344A] text-[#94A3B8]'
                }`}
              >
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug text-[11px]">{obj.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Center Stage: Scrollable, clean, breathing layout */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-2 sm:py-6 flex flex-col items-center justify-start space-y-3 sm:space-y-4 max-w-xl mx-auto w-full scrollbar-thin pb-8">
        
        {/* Microphone Diagnostic / Permission Alert Banner */}
        {micErrorMessage && (
          <div className="w-full p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xl animate-in fade-in shrink-0">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
              <p className="leading-tight text-[11px] font-medium">{micErrorMessage}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRequestMicPermission}
                className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
              >
                Activar Micrófono
              </button>
              <button
                type="button"
                onClick={() => setShowTextInput(true)}
                className="px-2 py-1 rounded-xl bg-[#1C2331] hover:bg-[#2A344A] text-[#E2E8F0] text-[11px] border border-[#2A344A] cursor-pointer"
              >
                Escribir
              </button>
              <button
                type="button"
                onClick={() => setMicErrorMessage(null)}
                className="p-1 text-rose-300 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Visualizer & Orb - Tap or Walkie-talkie enabled */}
        <div
          onPointerDown={handleWalkieTalkieStart}
          onPointerUp={handleWalkieTalkieEnd}
          onPointerCancel={handleWalkieTalkieEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="relative cursor-pointer group shrink-0 pt-1 touch-none select-none"
          title={callState === 'user_listening' ? 'Toca para enviar tu voz ahora' : 'Toca una vez o mantén presionado para hablar'}
        >
          <AudioVisualizer state={callState} />

          {/* Character Avatar inside Orb */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1C2331] border-2 transition-all flex items-center justify-center shadow-2xl backdrop-blur-md ${
                callState === 'user_listening'
                  ? 'border-rose-500 scale-110 shadow-rose-500/50'
                  : 'border-[#2A344A] group-hover:border-[#38BDF8]'
              }`}
            >
              {callState === 'user_listening' ? (
                <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400 animate-pulse" />
              ) : (
                <CorporateAvatar
                  avatar={scenario.aiCharacter.avatar}
                  name={scenario.aiCharacter.name}
                  size="lg"
                  className="w-full h-full rounded-full border-0 shadow-none bg-transparent"
                />
              )}
            </div>
          </div>
        </div>

        {/* Clean Status Pill with Smart Guidance */}
        <div className="shrink-0 flex flex-col items-center gap-1.5">
          {callState === 'ai_speaking' && (
            <button
              onClick={() => {
                SpeechService.cancelSpeech();
                setCallState('idle');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-[#38BDF8] border border-sky-500/30 cursor-pointer transition-colors"
              title="Toca para interrumpir"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Hablando...</span>
              <span className="text-[10px] text-[#94A3B8] underline ml-1">Interrumpir</span>
            </button>
          )}

          {callState === 'user_listening' && (
            <button
              type="button"
              onClick={handleStopListeningAndSubmit}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse shadow-lg hover:bg-rose-500/30 cursor-pointer transition-all"
              title="Toca para enviar tu intervención"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{isHoldingMic ? 'Habla ahora • Suelta para enviar' : 'Escuchando... Toca para enviar'}</span>
              {!isHoldingMic && <Send className="w-3 h-3 text-rose-300 ml-0.5" />}
            </button>
          )}

          {callState === 'processing' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#1C2331] text-[#38BDF8] border border-sky-500/40 shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] animate-spin" />
              <span>Generando respuesta rápida...</span>
            </span>
          )}

          {callState === 'idle' && (
            <button
              type="button"
              onClick={() => startListeningSession(isHandsFree)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-[#1C2331] text-[#E2E8F0] border border-[#2A344A] hover:border-[#38BDF8] shadow-sm transition-all cursor-pointer"
              title="Toca para empezar a hablar"
            >
              <Radio className="w-3 h-3 text-[#38BDF8] animate-pulse" />
              <span>Toca o mantén presionado para hablar</span>
            </button>
          )}

          {/* Quick Voice Mode Bar: Hands-free & Language Pill */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setIsHandsFree(!isHandsFree)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                isHandsFree
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20'
                  : 'bg-[#12161F] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
              title={isHandsFree ? 'Modo Manos Libres activo: se envía y escucha automáticamente' : 'Activar modo manos libres continuo'}
            >
              <Zap className={`w-3 h-3 ${isHandsFree ? 'text-amber-400 fill-amber-400' : 'text-[#94A3B8]'}`} />
              <span>{isHandsFree ? 'Manos Libres: ON' : 'Manos Libres: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSpeechLang(speechLang === 'en-US' ? 'es-ES' : 'en-US')}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#12161F] border border-[#2A344A] text-[#E2E8F0] hover:border-[#38BDF8] transition-all cursor-pointer"
              title="Cambiar idioma del micrófono (Inglés / Español)"
            >
              <Globe className="w-3 h-3 text-[#38BDF8]" />
              <span>{speechLang === 'en-US' ? 'Micro: 🇺🇸 EN' : 'Micro: 🇪🇸 ES'}</span>
            </button>
          </div>

          {walkieTalkieTip && (
            <span className="text-[11px] font-medium text-[#FBBF24] bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl animate-in fade-in">
              {walkieTalkieTip}
            </span>
          )}
        </div>

        {/* User live speech bubble (if actively speaking) */}
        {interimTranscript && (
          <div className="w-full rounded-2xl p-3.5 bg-[#1C2331] border border-sky-500/40 text-center animate-in fade-in">
            <p className="text-[10px] text-[#38BDF8] font-bold uppercase tracking-wider mb-1">
              Tu voz en directo:
            </p>
            <p className="text-sm font-medium text-[#E2E8F0] italic">"{interimTranscript}"</p>
          </div>
        )}

        {/* Proactive Level Promotion Suggestion Nudge */}
        {!dismissedLevelNudge &&
          currentObjectives.filter((o) => o.completed).length >= 2 &&
          messages.filter((m) => m.sender === 'user').length >= 3 && (
            <div className="w-full rounded-2xl p-3.5 bg-gradient-to-r from-amber-500/15 via-[#1C2331] to-sky-500/15 border border-amber-500/30 shadow-lg text-xs animate-in fade-in slide-in-from-top-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-[#FBBF24]">¡Excelente dominio de este escenario!</p>
                  <p className="text-[#94A3B8] text-[11px] leading-snug">
                    Has cumplido {currentObjectives.filter((o) => o.completed).length} objetivos. ¿Listo para dar el salto al siguiente nivel al colgar?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setDismissedLevelNudge(true)}
                  className="px-2.5 py-1 rounded-xl text-[11px] text-[#94A3B8] hover:text-[#E2E8F0] transition-colors cursor-pointer"
                >
                  Seguir aquí
                </button>
                <button
                  type="button"
                  onClick={handleHangUp}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FBBF24] hover:bg-amber-300 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Colgar y Subir Nivel</span>
                  <Trophy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        {/* Clean Dialogue Card: Spacious & Ergonomic */}
        <div className="w-full rounded-3xl bg-[#1C2331] border border-[#2A344A] p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] mb-1">
              {scenario.aiCharacter.name}:
            </p>
            <p className="text-sm sm:text-base text-[#E2E8F0] font-medium leading-relaxed whitespace-pre-line">
              "{lastAiMessage}"
            </p>
          </div>

          {/* Interactive Help Pills */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#2A344A] flex-wrap">
            {lastAiTranslation && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  showTranslation
                    ? 'bg-sky-500/15 border-sky-500/40 text-[#38BDF8]'
                    : 'bg-[#12161F] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                <Languages className="w-3 h-3 text-[#38BDF8]" />
                <span>{showTranslation ? 'Ocultar traducción' : 'Ver traducción'}</span>
              </button>
            )}

            {lastAiTip && (
              <button
                type="button"
                onClick={() => setShowTip(!showTip)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  showTip
                    ? 'bg-amber-500/15 border-amber-500/40 text-[#FBBF24]'
                    : 'bg-[#12161F] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-[#FBBF24]" />
                <span>{showTip ? 'Ocultar sugerencia' : '¿Cómo responder?'}</span>
              </button>
            )}

            {/* Third button: Replay / Escuchar mensaje de la IA */}
            <button
              type="button"
              onClick={toggleRepeatAiSpeech}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                callState === 'ai_speaking'
                  ? 'bg-sky-500/15 border-sky-500/50 text-[#38BDF8] shadow-sm shadow-sky-500/20'
                  : 'bg-[#12161F] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0] hover:border-[#38BDF8]/40'
              }`}
              title={callState === 'ai_speaking' ? 'Toca para pausar o detener el audio' : 'Reproducir mensaje de la IA en voz alta'}
            >
              {callState === 'ai_speaking' ? (
                <>
                  <VolumeX className="w-3 h-3 text-[#38BDF8] animate-pulse" />
                  <span>Detener audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-[#38BDF8]" />
                  <span>Escuchar de nuevo</span>
                </>
              )}
            </button>

            {/* Fourth button: Toggle Menu & Vocabulary Cheat Sheet */}
            {scenario.nicheVocabulary && scenario.nicheVocabulary.length > 0 && (
              <button
                type="button"
                onClick={() => setShowVocabulary(!showVocabulary)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  showVocabulary
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#12161F] border-[#2A344A] text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
                title="Ver carta de productos y vocabulario clave"
              >
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>{showVocabulary ? 'Ocultar carta' : `Carta & Léxico (${scenario.nicheVocabulary.length})`}</span>
              </button>
            )}
          </div>

          {/* Expanded Spanish Translation Card */}
          {showTranslation && lastAiTranslation && (
            <div className="p-3 rounded-2xl bg-[#12161F] border border-[#2A344A] text-xs text-[#E2E8F0] italic animate-in fade-in slide-in-from-top-1 leading-relaxed">
              <span className="font-semibold text-[#94A3B8] not-italic block text-[10px] uppercase mb-0.5">
                Traducción:
              </span>
              "{lastAiTranslation}"
            </div>
          )}

          {/* Expanded Pronunciation Tip & Phonetics Card */}
          {showTip && lastAiTip && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 animate-in fade-in slide-in-from-top-1 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-[#FBBF24] text-[11px] mb-1">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>Consejo de respuesta y fonética:</span>
              </div>
              <p className="leading-relaxed">{lastAiTip}</p>
            </div>
          )}

          {/* Expanded Vocabulary & Menu Cheat Sheet */}
          {showVocabulary && scenario.nicheVocabulary && scenario.nicheVocabulary.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#12161F] border border-[#2A344A] space-y-2.5 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Carta & Vocabulario del Local</span>
                </span>
                <span className="text-[10px] text-[#94A3B8]">
                  Pronúncialos para ganar fluidez
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {scenario.nicheVocabulary.map((term, idx) => {
                  const userSpeech = messages
                    .filter((m) => m.sender === 'user')
                    .map((m) => m.text.toLowerCase())
                    .join(' ');
                  const cleanKey = term.split('[')[0].trim().toLowerCase();
                  const isMentioned = cleanKey.length >= 3 && userSpeech.includes(cleanKey);

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl text-xs border transition-all flex items-start justify-between gap-1.5 ${
                        isMentioned
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                          : 'bg-[#1C2331] border-[#2A344A] text-[#E2E8F0]'
                      }`}
                    >
                      <span className="leading-snug text-[11px] font-mono">{term}</span>
                      {isMentioned && (
                        <span className="text-emerald-400 text-[10px] font-bold shrink-0 bg-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Usado</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Coach Correction Toast */}
        {latestCorrection && (
          <div className="w-full rounded-2xl bg-[#1C2331] border border-[#2A344A] p-3.5 text-xs animate-in fade-in slide-in-from-bottom-2 shadow-xl space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#38BDF8] flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consejo de Fluidez:</span>
              </span>
              <button
                onClick={() => setLatestCorrection(null)}
                className="text-[#94A3B8] hover:text-[#E2E8F0] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <p className="text-[#94A3B8]">
                <span className="text-rose-400 font-semibold">Dijiste:</span> "{latestCorrection.originalText}"
              </p>
              <p className="text-[#E2E8F0]">
                <span className="text-emerald-400 font-semibold">Más natural:</span> "{latestCorrection.improvedText}"
              </p>
            </div>
            <p className="text-[10px] text-[#94A3B8] pt-1 border-t border-[#2A344A]">
              {latestCorrection.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Expandable Chat Log Drawer */}
      {showChatLog && (
        <div className="absolute inset-x-0 bottom-24 top-14 bg-[#12161F]/95 border-t border-[#2A344A] p-4 overflow-y-auto z-40 backdrop-blur-lg flex flex-col justify-between">
          <div className="space-y-3 max-w-xl mx-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-[#2A344A]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                {t('call.transcriptTitle')}
              </h3>
              <button
                onClick={() => setShowChatLog(false)}
                className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-[#94A3B8] mb-0.5">
                  {m.sender === 'user' ? 'Tú' : scenario.aiCharacter.name}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0EA5E9] text-slate-950 font-medium rounded-br-none'
                      : 'bg-[#1C2331] text-[#E2E8F0] rounded-bl-none border border-[#2A344A]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Text Input Drawer */}
      {showTextInput && (
        <div className="px-4 py-2.5 bg-[#1C2331] border-t border-[#2A344A] flex items-center gap-2 max-w-xl mx-auto w-full shrink-0 z-30">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && textInput.trim()) {
                handleUserSubmission(textInput);
                setTextInput('');
              }
            }}
            placeholder="Escribe tu respuesta en inglés..."
            className="flex-1 bg-[#12161F] border border-[#2A344A] rounded-xl px-3.5 py-2 text-xs text-[#E2E8F0] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#38BDF8]"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                handleUserSubmission(textInput);
                setTextInput('');
              }
            }}
            className="p-2 rounded-xl bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 font-bold cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Floating Call Dock (Apple / ChatGPT style) */}
      <div
        className="px-2 xs:px-4 sm:px-6 py-2 sm:py-3 bg-[#12161F]/95 border-t border-[#2A344A] backdrop-blur-md flex items-center justify-around sm:justify-between max-w-md mx-auto w-full shrink-0 z-20"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {/* Lifeline / Hint button */}
        <button
          onClick={fetchLiveHints}
          className="flex flex-col items-center gap-1 text-[#94A3B8] hover:text-[#38BDF8] transition-colors cursor-pointer shrink-0"
          title="Pedir ideas de respuesta"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C2331] border border-[#2A344A] hover:border-[#38BDF8]/40 flex items-center justify-center transition-all">
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium">Pista</span>
        </button>

        {/* Repeat audio button */}
        <button
          onClick={repeatLastAiStatement}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer shrink-0 ${
            callState === 'ai_speaking' ? 'text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
          title={callState === 'ai_speaking' ? 'Detener audio' : 'Escuchar de nuevo'}
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C2331] border flex items-center justify-center transition-all ${
              callState === 'ai_speaking'
                ? 'border-[#38BDF8] shadow-sm shadow-sky-500/20'
                : 'border-[#2A344A] hover:border-[#3D4A66]'
            }`}
          >
            {callState === 'ai_speaking' ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38BDF8] animate-pulse" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium">
            {callState === 'ai_speaking' ? 'Detener' : 'Repetir'}
          </span>
        </button>

        {/* Central Prominent Mic Button (Dual-Mode: Tap to talk / Hold Walkie-talkie) */}
        <div className="flex flex-col items-center gap-1 -mt-1 select-none shrink-0">
          <button
            type="button"
            onPointerDown={handleWalkieTalkieStart}
            onPointerUp={handleWalkieTalkieEnd}
            onPointerCancel={handleWalkieTalkieEnd}
            onContextMenu={(e) => e.preventDefault()}
            className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer touch-none select-none relative ${
              callState === 'user_listening'
                ? 'bg-rose-600 text-white ring-6 sm:ring-8 ring-rose-500/30 scale-105 sm:scale-110 shadow-2xl shadow-rose-600/50'
                : 'bg-[#0EA5E9] hover:bg-[#38BDF8] text-slate-950 shadow-lg shadow-sky-950/40 active:scale-95'
            }`}
            title={
              callState === 'user_listening'
                ? isHoldingMic
                  ? 'Suelta para enviar'
                  : 'Toca para enviar intervención'
                : 'Toca o mantén presionado para hablar'
            }
          >
            {callState === 'user_listening' ? (
              isHoldingMic ? (
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-pulse" />
              ) : (
                <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            )}
          </button>
          <span
            className={`text-[9px] sm:text-[10px] font-semibold tracking-tight transition-colors ${
              callState === 'user_listening' ? 'text-rose-400 font-bold animate-pulse' : 'text-[#94A3B8]'
            }`}
          >
            {callState === 'user_listening'
              ? isHoldingMic
                ? '¡Suelta para enviar!'
                : '¡Toca para enviar!'
              : 'Toca o mantén'}
          </span>
        </div>

        {/* Keyboard Toggle */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer shrink-0 ${
            showTextInput ? 'text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
          title="Escribir texto"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C2331] border border-[#2A344A] flex items-center justify-center transition-all">
            <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium">Teclado</span>
        </button>

        {/* End Call Button */}
        <button
          onClick={handleHangUp}
          className="flex flex-col items-center gap-1 text-[#94A3B8] hover:text-rose-400 transition-colors cursor-pointer shrink-0"
          title="Colgar y ver reporte"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1C2331] border border-[#2A344A] hover:bg-rose-600 hover:border-rose-600 flex items-center justify-center text-rose-400 hover:text-white transition-all">
            <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-medium text-rose-400">Colgar</span>
        </button>
      </div>

      {/* Lifeline Hints Modal */}
      {showHintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C2331] border border-[#2A344A] rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#2A344A] pb-2.5">
              <div className="flex items-center gap-2 text-[#38BDF8]">
                <Lightbulb className="w-4 h-4" />
                <h3 className="text-xs font-bold text-[#E2E8F0]">Sugerencias para responder</h3>
              </div>
              <button
                onClick={() => setShowHintsModal(false)}
                className="text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#94A3B8]">
              Elige una frase profesional para responder de inmediato:
            </p>

            {loadingHints ? (
              <div className="py-6 text-center text-xs text-[#94A3B8] animate-pulse">
                Generando opciones con IA...
              </div>
            ) : (
              <div className="space-y-2">
                {hints.map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowHintsModal(false);
                      handleUserSubmission(hint);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-[#12161F] hover:bg-[#202838] border border-[#2A344A] text-xs text-[#E2E8F0] leading-relaxed transition-all cursor-pointer"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
