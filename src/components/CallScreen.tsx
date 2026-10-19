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
  MessageSquare,
  Sparkles,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  Keyboard,
  Radio
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
  const [autoListen, setAutoListen] = useState(true); // Hands-free mode
  const [showObjectives, setShowObjectives] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Live hints
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
      setDurationSeconds(prev => prev + 1);
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
          }, 600); // 600ms acoustic dampening buffer so mic does not pick up speaker echo
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
      lang: 'es-ES',
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

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) {
      setCallState('idle');
      return;
    }

    // Acoustic Echo Guard: Prevent microphone picking up speaker reverberation from previous AI speech
    const lastAi = [...messages].reverse().find(m => m.sender === 'ai');
    if (lastAi) {
      const lowerUser = trimmed.toLowerCase();
      const lowerAi = lastAi.text.toLowerCase();
      if (lowerUser.length > 8 && lowerAi.includes(lowerUser)) {
        console.warn('Acoustic echo detected from speakers, ignoring turn:', trimmed);
        setCallState('idle');
        return;
      }
    }

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: Date.now()
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setCallState('processing');

    try {
      const response = await GeminiService.sendTurn({
        scenario,
        conversationHistory: updatedHistory,
        userMessageText: trimmed
      });

      // Update objectives if satisfied
      if (response.completedObjectiveIds && response.completedObjectiveIds.length > 0) {
        setCurrentObjectives(prev =>
          prev.map(o => (response.completedObjectiveIds!.includes(o.id) ? { ...o, completed: true } : o))
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

      setMessages(prev => [...prev, aiMsg]);

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
              }, 600); // 600ms acoustic dampening buffer
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
    const lastAi = [...messages].reverse().find(m => m.sender === 'ai');
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

  const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
  const lastAiMessage = lastAiMsg?.text || scenario.initialGreeting;
  const lastAiTranslation = lastAiMsg?.translation || scenario.initialTranslation;
  const lastAiTip = lastAiMsg?.tip || scenario.initialTip;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-zinc-100 overflow-hidden">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
            <span className="text-xl" role="img">{scenario.aiCharacter.avatar}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {scenario.aiCharacter.name}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-amber-400 border border-amber-500/20 font-medium">
                {scenario.niche}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate">{scenario.aiCharacter.role}</p>
          </div>
        </div>

        {/* Controls, Timer & Objectives Toggle */}
        <div className="flex items-center gap-2">
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
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Hands-Free Auto-Listen Toggle */}
          <button
            onClick={() => setAutoListen(!autoListen)}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors cursor-pointer ${
              autoListen
                ? 'bg-zinc-900 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Toggle Hands-Free Auto-Listen"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t('call.handsFree')}</span>
          </button>

          {/* Timer pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            {formatDuration(durationSeconds)}
          </div>

          {/* Objectives Dropdown Toggle */}
          <button
            onClick={() => setShowObjectives(!showObjectives)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
          >
            <span>{currentObjectives.filter(o => o.completed).length}/{currentObjectives.length} {t('call.goals')}</span>
            {showObjectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Exit without report */}
          <button
            onClick={onExit}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Exit call"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Objectives Drawer */}
      {showObjectives && (
        <div className="bg-zinc-950/95 border-b border-zinc-800 px-6 py-3 space-y-2 backdrop-blur-md">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('call.sessionGoals')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentObjectives.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-start gap-2 p-2 rounded-lg text-xs border ${
                  obj.completed
                    ? 'bg-zinc-900 border-amber-500/40 text-amber-300 font-medium'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{obj.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Central Visualizer & Avatar Area (Scrollable on mobile) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 sm:py-6 flex flex-col items-center justify-start sm:justify-center relative space-y-3.5 scrollbar-thin">
        {/* Visualizer Canvas - Clickable to speak or interrupt */}
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
          className="relative cursor-pointer group shrink-0"
          title={callState === 'ai_speaking' ? 'Toca para interrumpir y hablar' : 'Toca para hablar'}
        >
          <AudioVisualizer state={callState} />
          
          {/* Inner Character Avatar in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900 border-2 border-zinc-700/80 group-hover:border-zinc-500 flex items-center justify-center shadow-2xl shadow-black/80 backdrop-blur-md transition-all">
              <span className="text-3xl sm:text-4xl" role="img">{scenario.aiCharacter.avatar}</span>
            </div>
          </div>
        </div>

        {/* State Badge */}
        <div className="mt-2 mb-3">
          {callState === 'ai_speaking' && (
            <button
              onClick={() => {
                SpeechService.cancelSpeech();
                startListeningForUser();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 animate-pulse cursor-pointer transition-colors"
              title="Toca para interrumpir y hablar"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{scenario.aiCharacter.name} {t('call.speaking')}</span>
              <span className="text-[10px] text-zinc-400 underline ml-1">Interrumpir</span>
            </button>
          )}
          {callState === 'user_listening' && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-950 border border-white font-bold animate-pulse">
              <Mic className="w-3.5 h-3.5 text-zinc-950" />
              {t('call.listening')}
            </span>
          )}
          {callState === 'processing' && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              {t('call.processing')}
            </span>
          )}
          {callState === 'idle' && (
            <button
              onClick={startListeningForUser}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer transition-colors"
            >
              {t('call.tapToSpeak')}
            </button>
          )}
        </div>

        {/* Live Subtitle Transcript Banner */}
        <div className="w-full max-w-xl bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-center space-y-1.5 min-h-[90px] flex flex-col justify-center">
          {interimTranscript ? (
            <div>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wide uppercase">You:</p>
              <p className="text-sm sm:text-base text-zinc-100 font-medium italic">"{interimTranscript}"</p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-zinc-400 font-semibold tracking-wide uppercase">
                {scenario.aiCharacter.name}:
              </p>
              <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed whitespace-pre-line">
                "{lastAiMessage}"
              </p>
              {lastAiTranslation && (
                <p className="text-xs text-zinc-400 italic mt-2 border-t border-zinc-800/80 pt-1.5">
                  🇪🇸 "{lastAiTranslation}"
                </p>
              )}
              {lastAiTip && (
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-start justify-center gap-1.5 text-xs text-amber-300 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-left sm:text-center leading-snug">{lastAiTip}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Discrete Grammar Correction Pill */}
        {latestCorrection && (
          <div className="w-full max-w-xl mt-3 bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex items-start justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 shadow-xl">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('call.coachTip')}</span>
                <span className="line-through text-zinc-500">"{latestCorrection.originalText}"</span>
                <span className="text-amber-400 font-bold">→ "{latestCorrection.improvedText}"</span>
              </div>
              <p className="text-zinc-400 text-[11px]">{latestCorrection.explanation}</p>
            </div>
            <button
              onClick={() => setLatestCorrection(null)}
              className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Expandable Chat Log Drawer */}
      {showChatLog && (
        <div className="absolute inset-x-0 bottom-24 top-14 bg-black/95 border-t border-zinc-800 p-4 overflow-y-auto z-40 backdrop-blur-lg flex flex-col justify-between">
          <div className="space-y-3 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{t('call.transcriptTitle')}</h3>
              <button onClick={() => setShowChatLog(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-zinc-500 mb-0.5">
                  {m.sender === 'user' ? 'You' : scenario.aiCharacter.name}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
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
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 max-w-2xl mx-auto w-full">
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
            placeholder={t('call.typePlaceholder')}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                handleUserSubmission(textInput);
                setTextInput('');
              }
            }}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Floating Call Controls */}
      <div className="px-6 py-3 sm:py-4 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md flex items-center justify-between max-w-lg mx-auto w-full shrink-0 z-20">
        {/* Lifeline / Hint button */}
        <button
          onClick={fetchLiveHints}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
          title={t('call.hintBtn')}
        >
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 flex items-center justify-center transition-all">
            <Lightbulb className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t('call.hintBtn')}</span>
        </button>

        {/* Repeat audio button */}
        <button
          onClick={repeatLastAiStatement}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title={t('call.repeatBtn')}
        >
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center transition-all">
            <RotateCcw className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t('call.repeatBtn')}</span>
        </button>

        {/* Main Microphone Button */}
        <button
          onClick={() => {
            if (callState === 'user_listening') {
              SpeechService.stopListening();
              setCallState('idle');
            } else {
              startListeningForUser();
            }
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
            callState === 'user_listening'
              ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-black/80'
          }`}
          title={callState === 'user_listening' ? 'Stop listening' : 'Speak'}
        >
          {callState === 'user_listening' ? (
            <Mic className="w-7 h-7 text-white animate-pulse" />
          ) : (
            <MicOff className="w-7 h-7 text-zinc-950" />
          )}
        </button>

        {/* Keyboard / Text Toggle button */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            showTextInput ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
          }`}
          title={t('call.textBtn')}
        >
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all">
            <Keyboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t('call.textBtn')}</span>
        </button>

        {/* Transcript / Chat log button */}
        <button
          onClick={() => setShowChatLog(!showChatLog)}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            showChatLog ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
          }`}
          title={t('call.logBtn')}
        >
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-all">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">{t('call.logBtn')}</span>
        </button>

        {/* End Call Button */}
        <button
          onClick={handleHangUp}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
          title={t('call.endBtn')}
        >
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-rose-600 hover:border-rose-600 flex items-center justify-center text-rose-400 hover:text-white transition-all">
            <PhoneOff className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium text-rose-400">{t('call.endBtn')}</span>
        </button>
      </div>

      {/* Lifeline Hints Modal */}
      {showHintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Lightbulb className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">{t('call.hintsTitle')}</h3>
              </div>
              <button onClick={() => setShowHintsModal(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              {t('call.hintsDesc')}
            </p>

            {loadingHints ? (
              <div className="py-6 text-center text-xs text-zinc-400 animate-pulse">
                {t('call.loadingHints')}
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
                    className="w-full text-left p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 leading-relaxed transition-all cursor-pointer"
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
