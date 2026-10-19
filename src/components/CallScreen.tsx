import React, { useState, useEffect, useRef } from 'react';
import type { Scenario, Message, SessionReport } from '../types';
import { GeminiService } from '../services/geminiService';
import { SpeechService } from '../services/speechService';
import { AudioVisualizer } from './AudioVisualizer';
import { useTranslation } from '../i18n/LanguageContext';
import {
  PhoneOff,
  Mic,
  MicOff,
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
  Languages
} from 'lucide-react';

interface CallScreenProps {
  scenario: Scenario;
  onEndCall: (report: SessionReport) => void;
  onExit: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({ scenario, onEndCall, onExit }) => {
  const { t } = useTranslation();

  // Call state
  const [callState, setCallState] = useState<'idle' | 'ai_speaking' | 'user_listening' | 'processing'>('processing');
  const [messages, setMessages] = useState<Message[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [autoListen] = useState(true);

  // Collapsible helpers to avoid screen clutter
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTip, setShowTip] = useState(false);
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
  const [currentObjectives, setCurrentObjectives] = useState(scenario.objectives);

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

  // Start initial greeting
  useEffect(() => {
    const initialMsg: Message = {
      id: 'msg-0',
      sender: 'ai',
      text: scenario.initialGreeting,
      translation: scenario.initialTranslation,
      tip: scenario.initialTip,
      timestamp: Date.now()
    };
    setMessages([initialMsg]);

    // Speak initial greeting
    setCallState('ai_speaking');
    SpeechService.speakText({
      text: scenario.initialGreeting,
      onStart: () => setCallState('ai_speaking'),
      onEnd: () => {
        if (autoListen) {
          setTimeout(() => {
            startListeningForUser();
          }, 600);
        } else {
          setCallState('idle');
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

  // Start listening for user speech
  const startListeningForUser = () => {
    SpeechService.cancelSpeech();
    setInterimTranscript('');
    setCallState('user_listening');

    SpeechService.startListening({
      lang: 'en-US',
      onTranscript: (text) => {
        setInterimTranscript(text);
      },
      onSpeechEnd: (finalText) => {
        if (finalText.trim().length > 0) {
          handleUserSubmission(finalText);
        } else {
          setCallState('idle');
        }
      },
      onError: (err) => {
        console.warn('Speech err:', err);
        setCallState('idle');
      }
    });
  };

  // Process user speech or typed text
  const handleUserSubmission = async (text: string) => {
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
      timestamp: Date.now()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setCallState('processing');

    try {
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

      setMessages((prev) => [...prev, aiMsg]);

      // Speak response out loud
      if (!isMuted) {
        setCallState('ai_speaking');
        SpeechService.speakText({
          text: response.reply,
          onStart: () => setCallState('ai_speaking'),
          onEnd: () => {
            if (autoListen) {
              setTimeout(() => {
                startListeningForUser();
              }, 600);
            } else {
              setCallState('idle');
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
    }
  };

  // Re-play last AI utterance
  const repeatLastAiStatement = () => {
    const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
    if (lastAi) {
      SpeechService.cancelSpeech();
      setCallState('ai_speaking');
      SpeechService.speakText({
        text: lastAi.text,
        onStart: () => setCallState('ai_speaking'),
        onEnd: () => {
          if (autoListen) startListeningForUser();
          else setCallState('idle');
        }
      });
    }
  };

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

    onEndCall(report);
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'ai');
  const lastAiMessage = lastAiMsg?.text || scenario.initialGreeting;
  const lastAiTranslation = lastAiMsg?.translation || scenario.initialTranslation;
  const lastAiTip = lastAiMsg?.tip || scenario.initialTip;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070709] text-zinc-100 overflow-hidden">
      {/* Top Bar Header - Clean, non-wrapping single line */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md shrink-0 z-20">
        {/* Left: Avatar + Character Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
            <span className="text-base sm:text-lg" role="img">
              {scenario.aiCharacter.avatar}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-[220px]">
                {scenario.aiCharacter.name}
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            </div>
            <p className="text-[10px] text-zinc-400 truncate max-w-[140px] sm:max-w-none">
              {scenario.userRole}
            </p>
          </div>
        </div>

        {/* Right: Controls & Timer */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mute speaker button */}
          <button
            onClick={() => {
              if (!isMuted) SpeechService.cancelSpeech();
              setIsMuted(!isMuted);
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title={isMuted ? 'Activar sonido' : 'Silenciar voz'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Timer pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{formatDuration(durationSeconds)}</span>
          </div>

          {/* Objectives Toggle */}
          <button
            onClick={() => setShowObjectives(!showObjectives)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
            title="Ver objetivos"
          >
            <span>
              {currentObjectives.filter((o) => o.completed).length}/{currentObjectives.length}
            </span>
            {showObjectives ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Exit without report */}
          <button
            onClick={onExit}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Salir"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Objectives Drawer */}
      {showObjectives && (
        <div className="bg-zinc-950/95 border-b border-zinc-800 px-4 sm:px-6 py-3 space-y-2 backdrop-blur-md shrink-0 z-20 animate-in fade-in slide-in-from-top-2">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Objetivos de la Simulación
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentObjectives.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-start gap-2 p-2 rounded-xl text-xs border ${
                  obj.completed
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
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
        {/* Visualizer & Orb */}
        <div
          onClick={() => {
            if (callState === 'ai_speaking') {
              SpeechService.cancelSpeech();
              startListeningForUser();
            } else if (callState === 'user_listening') {
              SpeechService.stopListening();
              setCallState('idle');
            } else if (callState === 'idle') {
              startListeningForUser();
            }
          }}
          className="relative cursor-pointer group shrink-0 pt-1"
          title={callState === 'ai_speaking' ? 'Toca para interrumpir y hablar' : 'Toca para hablar'}
        >
          <AudioVisualizer state={callState} />

          {/* Character Avatar inside Orb */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-900 border-2 border-zinc-700/80 group-hover:border-amber-400 flex items-center justify-center shadow-2xl shadow-black/80 backdrop-blur-md transition-all">
              <span className="text-xl sm:text-3xl" role="img">
                {scenario.aiCharacter.avatar}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Status Pill */}
        <div className="shrink-0">
          {callState === 'ai_speaking' && (
            <button
              onClick={() => {
                SpeechService.cancelSpeech();
                startListeningForUser();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 cursor-pointer transition-colors"
              title="Toca para interrumpir"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Hablando...</span>
              <span className="text-[10px] text-zinc-400 underline ml-1">Interrumpir</span>
            </button>
          )}

          {callState === 'user_listening' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-zinc-950 border border-white animate-pulse shadow-md">
              <Mic className="w-3.5 h-3.5 text-zinc-950" />
              <span>Te escucho... habla en inglés</span>
            </span>
          )}

          {callState === 'processing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Pensando respuesta...</span>
            </span>
          )}

          {callState === 'idle' && (
            <button
              onClick={startListeningForUser}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Toca el micro para responder</span>
            </button>
          )}
        </div>

        {/* User live speech bubble (if actively speaking) */}
        {interimTranscript && (
          <div className="w-full rounded-2xl p-3.5 bg-zinc-900/90 border border-amber-500/30 text-center animate-in fade-in">
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">
              Tu voz en directo:
            </p>
            <p className="text-sm font-medium text-white italic">"{interimTranscript}"</p>
          </div>
        )}

        {/* Clean Dialogue Card: Spacious & Elegant */}
        <div className="w-full rounded-3xl bg-zinc-950/90 border border-zinc-800/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 mb-1">
              {scenario.aiCharacter.name}:
            </p>
            <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed whitespace-pre-line">
              "{lastAiMessage}"
            </p>
          </div>

          {/* Interactive Help Pills: Expand on demand, no screen clutter! */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80 flex-wrap">
            {lastAiTranslation && (
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  showTranslation
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Languages className="w-3 h-3 text-amber-400" />
                <span>{showTranslation ? 'Ocultar traducción' : '🇪🇸 Ver traducción'}</span>
              </button>
            )}

            {lastAiTip && (
              <button
                type="button"
                onClick={() => setShowTip(!showTip)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  showTip
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>{showTip ? 'Ocultar sugerencia' : '💡 ¿Cómo responder?'}</span>
              </button>
            )}
          </div>

          {/* Expanded Spanish Translation Card */}
          {showTranslation && lastAiTranslation && (
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 italic animate-in fade-in slide-in-from-top-1 leading-relaxed">
              <span className="font-semibold text-zinc-400 not-italic block text-[10px] uppercase mb-0.5">
                Traducción:
              </span>
              "{lastAiTranslation}"
            </div>
          )}

          {/* Expanded Pronunciation Tip & Phonetics Card */}
          {showTip && lastAiTip && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 animate-in fade-in slide-in-from-top-1 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px] mb-1">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>Consejo de respuesta y fonética:</span>
              </div>
              <p className="leading-snug">{lastAiTip}</p>
            </div>
          )}
        </div>

        {/* Real-time Coach Correction Toast (Dismissable, never overlapping) */}
        {latestCorrection && (
          <div className="w-full rounded-2xl bg-[#141419] border border-amber-500/30 p-3.5 text-xs animate-in fade-in slide-in-from-bottom-2 shadow-xl space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consejo de Fluidez:</span>
              </span>
              <button
                onClick={() => setLatestCorrection(null)}
                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <p className="text-zinc-400">
                <span className="text-rose-400 font-semibold">Dijiste:</span> "{latestCorrection.originalText}"
              </p>
              <p className="text-zinc-200">
                <span className="text-emerald-400 font-semibold">Más natural:</span> "{latestCorrection.improvedText}"
              </p>
            </div>
            <p className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
              {latestCorrection.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Expandable Chat Log Drawer */}
      {showChatLog && (
        <div className="absolute inset-x-0 bottom-24 top-14 bg-black/95 border-t border-zinc-800 p-4 overflow-y-auto z-40 backdrop-blur-lg flex flex-col justify-between">
          <div className="space-y-3 max-w-xl mx-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t('call.transcriptTitle')}
              </h3>
              <button
                onClick={() => setShowChatLog(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-zinc-500 mb-0.5">
                  {m.sender === 'user' ? 'Tú' : scenario.aiCharacter.name}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-zinc-100 text-zinc-950 font-medium rounded-br-none'
                      : 'bg-zinc-900 text-zinc-200 rounded-bl-none border border-zinc-800'
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
        <div className="px-4 py-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 max-w-xl mx-auto w-full shrink-0 z-30">
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
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                handleUserSubmission(textInput);
                setTextInput('');
              }
            }}
            className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Floating Call Dock (Apple / ChatGPT style) */}
      <div className="px-4 sm:px-6 py-3 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md flex items-center justify-between max-w-md mx-auto w-full shrink-0 z-20">
        {/* Lifeline / Hint button */}
        <button
          onClick={fetchLiveHints}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
          title="Pedir ideas de respuesta"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 flex items-center justify-center transition-all">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">Pista</span>
        </button>

        {/* Repeat audio button */}
        <button
          onClick={repeatLastAiStatement}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Escuchar de nuevo"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all">
            <RotateCcw className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">Repetir</span>
        </button>

        {/* Central Prominent Microphone Button */}
        <button
          onClick={() => {
            if (callState === 'user_listening') {
              SpeechService.stopListening();
              setCallState('idle');
            } else {
              startListeningForUser();
            }
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
            callState === 'user_listening'
              ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30'
              : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-500/20'
          }`}
          title={callState === 'user_listening' ? 'Detener micrófono' : 'Hablar'}
        >
          {callState === 'user_listening' ? (
            <Mic className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6 text-zinc-950" />
          )}
        </button>

        {/* Keyboard Toggle */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            showTextInput ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
          }`}
          title="Escribir texto"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all">
            <Keyboard className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium">Teclado</span>
        </button>

        {/* End Call Button */}
        <button
          onClick={handleHangUp}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
          title="Colgar y ver reporte"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-rose-600 hover:border-rose-600 flex items-center justify-center text-rose-400 hover:text-white transition-all">
            <PhoneOff className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-rose-400">Colgar</span>
        </button>
      </div>

      {/* Lifeline Hints Modal */}
      {showHintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <h3 className="text-xs font-bold text-white">Sugerencias para responder</h3>
              </div>
              <button
                onClick={() => setShowHintsModal(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400">
              Elige una frase profesional para responder de inmediato:
            </p>

            {loadingHints ? (
              <div className="py-6 text-center text-xs text-zinc-400 animate-pulse">
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
                    className="w-full text-left p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 leading-relaxed transition-all cursor-pointer"
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
