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
  private static utteranceQueue: Array<{ text: string; lang: 'es-ES' | 'en-US' }> = [];
  private static isSpeakingNow: boolean = false;
  private static chunkWatchdogTimer: any = null;
  private static speechSessionId: number = 0;

  public static isRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  public static isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Returns available English and Spanish voices
   */
  public static getEnglishVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.isSynthesisSupported()) {
        return resolve([]);
      }

      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        return resolve(voices);
      }

      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
    });
  }

  /**
   * Cleans stuttered or looped duplicate phrases caused by Android WebSpeech buffer re-triggers
   */
  public static cleanDuplicatePhrases(text: string): string {
    if (!text || text.length < 3) return text;

    let words = text.split(/\s+/).filter(Boolean);
    if (words.length <= 1) return text;

    // 1. Remove immediate consecutive single-word duplicates: "good good morning" -> "good morning"
    const singleDeduped: string[] = [];
    for (let i = 0; i < words.length; i++) {
      if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
        singleDeduped.push(words[i]);
      }
    }
    words = singleDeduped;

    // 2. Remove consecutive multi-word repeating loops (e.g. "good morning good morning" -> "good morning")
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 10) {
      changed = false;
      iterations++;
      const n = words.length;
      for (let phraseLen = Math.floor(n / 2); phraseLen >= 2; phraseLen--) {
        for (let i = 0; i <= n - 2 * phraseLen; i++) {
          const phrase1 = words.slice(i, i + phraseLen).map((w) => w.toLowerCase()).join(' ');
          const phrase2 = words.slice(i + phraseLen, i + 2 * phraseLen).map((w) => w.toLowerCase()).join(' ');
          if (phrase1 === phrase2) {
            words.splice(i + phraseLen, phraseLen);
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }

    return words.join(' ');
  }

  private static latestTranscript: string = '';

  public static getLatestTranscript(): string {
    return this.latestTranscript;
  }

  /**
   * Starts speech recognition listening for input (defaults to en-US for English training)
   * enableAutoSilence: false for Walkie-Talkie (hold to speak, release to send)
   */
  public static startListening({
    lang = 'en-US',
    enableAutoSilence = false,
    onTranscript,
    onSpeechEnd,
    onError
  }: {
    lang?: string;
    enableAutoSilence?: boolean;
    onTranscript: (text: string, isFinal: boolean) => void;
    onSpeechEnd?: (finalTranscript: string) => void;
    onError?: (error: string) => void;
  }): void {
    if (!this.isRecognitionSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.latestTranscript = '';

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Re-evaluate from results array to prevent compounding duplicates on Android Chrome
      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (!item || !item[0]) continue;
        const piece = (item[0].transcript || '').trim();
        if (item.isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + piece;
        } else {
          interimTranscript += (interimTranscript ? ' ' : '') + piece;
        }
      }

      const rawText = (finalTranscript + ' ' + interimTranscript).trim();
      const currentText = SpeechService.cleanDuplicatePhrases(rawText);
      this.latestTranscript = currentText;

      onTranscript(currentText, false);

      // In hands-free mode, auto-detect silence. In Walkie-talkie mode, wait for user button release!
      if (enableAutoSilence) {
        clearTimeout(this.silenceTimer);
        if (currentText.length > 0) {
          this.silenceTimer = setTimeout(() => {
            this.stopListening();
            if (onSpeechEnd) onSpeechEnd(currentText);
          }, 1300);
        }
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
   * Stops listening and returns the latest captured transcript
   */
  public static stopListening(): string {
    clearTimeout(this.silenceTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    return this.latestTranscript;
  }

  /**
   * Cleans text: strips markdown, brackets, quotes
   */
  private static cleanText(text: string): string {
    return text
      .replace(/[*_#~`]/g, '')
      .replace(/\[.*?\]/g, '') // Remove bracketed phonetic tips
      .replace(/\(.*?\)/g, '') // Remove parentheses
      .replace(/["“”«»]/g, '')
      .trim();
  }

  /**
   * Splits text into short natural sentence chunks
   * Chrome/Android TTS cuts off if a single utterance exceeds ~150 chars.
   */
  private static splitIntoChunks(text: string): Array<{ text: string; lang: 'es-ES' | 'en-US' }> {
    const rawChunks = text
      .split(/(?<=[.?!:\n])\s+/)
      .map(c => this.cleanText(c))
      .filter(c => c.length > 0);

    const result: Array<{ text: string; lang: 'es-ES' | 'en-US' }> = [];

    for (const chunk of rawChunks) {
      if (chunk.length > 160) {
        const subParts = chunk.split(/(?<=[,;])\s+/).filter(p => p.trim().length > 0);
        for (const sub of subParts) {
          result.push({
            text: sub.trim(),
            lang: this.detectLang(sub)
          });
        }
      } else {
        result.push({
          text: chunk.trim(),
          lang: this.detectLang(chunk)
        });
      }
    }

    return result.length > 0 ? result : [{ text: this.cleanText(text), lang: this.detectLang(text) }];
  }

  /**
   * Detects whether a sentence is in Spanish or English
   */
  private static detectLang(text: string): 'es-ES' | 'en-US' {
    const isSpanish = /[áéíóúñ¿¡]|\b(hola|bienvenido|entro|camarero|bartender|tutor|practicaremos|empecemos|situación|mostrador|atención|buenas|noches|tardes|días|mesa|barra|cuenta|por favor|tienes|tienen|puedes|decir|excelente|trabajas|visitas|recepción|oficina)\b/i.test(text);
    return isSpanish ? 'es-ES' : 'en-US';
  }

  private static activeAudioElement: HTMLAudioElement | null = null;

  /**
   * Attempts to play high-fidelity Neural TTS from backend proxy (/api/tts/speak).
   * Gracefully falls back to browser SpeechSynthesis if unavailable or offline.
   */
  public static async speakTextNeuralOrFallback({
    text,
    voiceGender = 'female',
    lang = 'auto',
    voiceName,
    rate = 1.0,
    pitch = 1.0,
    onStart,
    onEnd,
    onError
  }: {
    text: string;
    voiceGender?: 'male' | 'female';
    lang?: 'es-ES' | 'en-US' | 'auto';
    voiceName?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }): Promise<void> {
    // 1. If audio element is currently playing, pause it
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
        this.activeAudioElement = null;
      } catch {}
    }

    try {
      const res = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceGender,
          lang: lang === 'auto' ? this.detectLang(text) : lang
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audioBase64) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
          this.activeAudioElement = audio;
          if (onStart) onStart();
          audio.onended = () => {
            this.activeAudioElement = null;
            if (onEnd) onEnd();
          };
          audio.onerror = () => {
            this.activeAudioElement = null;
            // Fallback to browser
            this.speakText({ text, lang, voiceName, rate, pitch, onStart, onEnd, onError });
          };
          await audio.play();
          return;
        }
      }
    } catch {
      // Fallback silently
    }

    // Fallback to browser speech synthesis
    this.speakText({ text, lang, voiceName, rate, pitch, onStart, onEnd, onError });
  }

  /**
   * Speaks text chunk by chunk sequentially.
   * Completely immune to duplicate loops and race conditions via speechSessionId token gating.
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

    // Cancel existing speech session and generate a new unique session ID
    this.cancelSpeech();
    const currentSessionId = ++this.speechSessionId;

    const chunks = this.splitIntoChunks(text);
    if (chunks.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    this.utteranceQueue = chunks;
    this.isSpeakingNow = true;

    if (onStart) onStart();

    const voices = window.speechSynthesis.getVoices();

    const speakNextChunk = (index: number) => {
      // Gate check: If session has changed or speaking was cancelled, abort immediately
      if (currentSessionId !== this.speechSessionId || !this.isSpeakingNow || index >= this.utteranceQueue.length) {
        if (currentSessionId === this.speechSessionId) {
          this.isSpeakingNow = false;
          this.activeUtterance = null;
          if (this.chunkWatchdogTimer) clearTimeout(this.chunkWatchdogTimer);
          if (onEnd) onEnd();
        }
        return;
      }

      const item = this.utteranceQueue[index];
      const targetLang = lang === 'auto' ? item.lang : lang;

      const utterance = new SpeechSynthesisUtterance(item.text);
      this.activeUtterance = utterance;
      utterance.lang = targetLang;
      utterance.rate = Math.max(0.75, Math.min(1.25, rate));
      utterance.pitch = Math.max(0.85, Math.min(1.15, pitch));

      // Match voice for this chunk's language
      if (voiceName) {
        const match = voices.find(v => v.name === voiceName);
        if (match) utterance.voice = match;
      } else {
        if (targetLang.startsWith('es')) {
          const esVoice = voices.find(
            v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Pablo') || v.name.includes('Laura') || v.name.includes('Jorge') || v.name.includes('Monica'))
          ) || voices.find(v => v.lang.startsWith('es'));
          if (esVoice) utterance.voice = esVoice;
        } else {
          const enVoice = voices.find(
            v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('David'))
          ) || voices.find(v => v.lang.startsWith('en'));
          if (enVoice) utterance.voice = enVoice;
        }
      }

      let chunkHandled = false;
      const advance = () => {
        if (chunkHandled) return;
        chunkHandled = true;
        if (this.chunkWatchdogTimer) clearTimeout(this.chunkWatchdogTimer);

        // Only advance if this session is still the active one
        if (currentSessionId === this.speechSessionId) {
          speakNextChunk(index + 1);
        }
      };

      utterance.onend = () => {
        if (currentSessionId !== this.speechSessionId) return;
        advance();
      };

      utterance.onerror = (e) => {
        if (currentSessionId !== this.speechSessionId) return;
        console.warn('Utterance chunk error, advancing:', e);
        advance();
      };

      // Watchdog per chunk: 10s maximum
      if (this.chunkWatchdogTimer) clearTimeout(this.chunkWatchdogTimer);
      this.chunkWatchdogTimer = setTimeout(() => {
        if (!chunkHandled && currentSessionId === this.speechSessionId && this.isSpeakingNow) {
          console.warn('Chunk watchdog expired, advancing');
          advance();
        }
      }, 10000);

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Failed to speak chunk:', err);
        advance();
      }
    };

    // Small 30ms micro-pause allows Chrome/OS audio buffer to completely flush before starting new audio
    setTimeout(() => {
      if (currentSessionId === this.speechSessionId) {
        speakNextChunk(0);
      }
    }, 30);
  }

  /**
   * Cancels any ongoing speech immediately and invalidates all pending callbacks
   */
  public static cancelSpeech(): void {
    // Invalidate current speech session token so pending onend/onerror callbacks are ignored
    this.speechSessionId++;
    this.utteranceQueue = [];
    this.isSpeakingNow = false;

    if (this.activeUtterance) {
      this.activeUtterance.onend = null;
      this.activeUtterance.onerror = null;
      this.activeUtterance = null;
    }

    if (this.chunkWatchdogTimer) {
      clearTimeout(this.chunkWatchdogTimer);
      this.chunkWatchdogTimer = null;
    }

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
