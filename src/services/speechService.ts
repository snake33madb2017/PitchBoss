export interface SpeechVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
}

export class SpeechService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static silenceTimer: any = null;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static keepAliveTimer: any = null;
  private static watchdogTimer: any = null;
  private static isSpeakingNow: boolean = false;

  public static isRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  public static isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Returns available English voices from the browser synthesis engine
   */
  public static getEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.isSynthesisSupported()) {
        return resolve([]);
      }

      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        return resolve(enVoices.length > 0 ? enVoices : voices);
      }

      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        resolve(enVoices.length > 0 ? enVoices : voices);
      };
    });
  }

  /**
   * Starts speech recognition listening for input (Spanish or English)
   */
  public static startListening({
    lang = 'es-ES',
    onTranscript,
    onSpeechEnd,
    onError
  }: {
    lang?: string;
    onTranscript: (text: string, isFinal: boolean) => void;
    onSpeechEnd: (finalTranscript: string) => void;
    onError?: (error: string) => void;
  }): void {
    if (!this.isRecognitionSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    let accumulatedFinal = '';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulatedFinal += ' ' + transcript;
        } else {
          interim += transcript;
        }
      }

      const currentText = (accumulatedFinal + ' ' + interim).trim();
      onTranscript(currentText, false);

      // Reset auto-silence timer: when user pauses for 1.4 seconds, treat as complete turn
      clearTimeout(this.silenceTimer);
      if (currentText.length > 0) {
        this.silenceTimer = setTimeout(() => {
          this.stopListening();
          onSpeechEnd(currentText);
        }, 1400);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }

  /**
   * Stops listening
   */
  public static stopListening(): void {
    clearTimeout(this.silenceTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
  }

  private static clearSpeechTimers(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Speaks text out loud with GC safety and watchdog protection
   */
  public static speakText({
    text,
    lang = 'auto',
    voiceName,
    rate = 1.0,
    pitch = 1.0,
    onStart,
    onEnd,
    onError
  }: {
    text: string;
    lang?: 'es-ES' | 'en-US' | 'auto';
    voiceName?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): void {
    if (!this.isSynthesisSupported()) {
      if (onError) onError('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech cleanly
    this.cancelSpeech();

    // Clean text of markdown, asterisks, brackets, parentheticals
    const cleanText = text
      .replace(/\*+/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Detect language if auto
    let targetLang = lang;
    if (!targetLang || targetLang === 'auto') {
      const isSpanish = /[áéíóúñ¿¡]|\b(hola|vamos|escenario|coctel|cóctel|bar|camarero|perfecto|listo|empezar|tienes|tienen|puedes|decir|buenas|tardes|noches|por favor|bienvenido|mesa|barra|cuenta|excelente|trabajas|bartender|recepcion)\b/i.test(cleanText);
      targetLang = isSpanish ? 'es-ES' : 'en-US';
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.activeUtterance = utterance; // Retain globally to prevent Chromium GC bug
    this.isSpeakingNow = true;

    utterance.lang = targetLang;
    utterance.rate = Math.max(0.7, Math.min(1.4, rate));
    utterance.pitch = Math.max(0.8, Math.min(1.2, pitch));

    // Match preferred voice or best language voice
    const voices = window.speechSynthesis.getVoices();
    if (voiceName) {
      const match = voices.find(v => v.name === voiceName);
      if (match) utterance.voice = match;
    } else {
      if (targetLang.startsWith('es')) {
        const esVoice = voices.find(
          v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Pablo') || v.name.includes('Laura') || v.name.includes('Jorge') || v.name.includes('Monica') || v.name.includes('Paulina'))
        ) || voices.find(v => v.lang.startsWith('es'));
        if (esVoice) utterance.voice = esVoice;
      } else {
        const naturalVoice = voices.find(
          v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en'));
        if (naturalVoice) utterance.voice = naturalVoice;
      }
    }

    let hasEnded = false;
    const finishUtterance = () => {
      if (hasEnded) return;
      hasEnded = true;
      this.clearSpeechTimers();
      this.activeUtterance = null;
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      if (onStart) onStart();
      // Keep-alive for Chrome/Edge (speechSynthesis pauses without wake)
      this.keepAliveTimer = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 4000);
    };

    utterance.onend = () => {
      finishUtterance();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      if (onError) onError(e);
      finishUtterance();
    };

    // Watchdog timer: If browser never fires onend, release state automatically
    const words = cleanText.split(/\s+/).length;
    const watchdogMs = Math.max(3000, words * 500 + 2500);
    this.watchdogTimer = setTimeout(() => {
      if (this.isSpeakingNow && !hasEnded) {
        console.warn('SpeechSynthesis watchdog triggered: releasing speech state');
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // ignore
        }
        finishUtterance();
      }
    }, watchdogMs);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Failed to execute window.speechSynthesis.speak:', e);
      finishUtterance();
    }
  }

  /**
   * Stops any ongoing audio speech
   */
  public static cancelSpeech(): void {
    this.clearSpeechTimers();
    this.activeUtterance = null;
    this.isSpeakingNow = false;
    if (this.isSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Checks whether speech synthesis is actively playing
   */
  public static isSpeaking(): boolean {
    return this.isSpeakingNow && this.activeUtterance !== null;
  }
}
