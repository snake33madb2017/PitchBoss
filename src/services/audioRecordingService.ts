/**
 * PitchBoss Enterprise — Audio Recording Service
 * Captures user speech audio via MediaRecorder and provides playback audio blobs.
 */

export class AudioRecordingService {
  private static mediaRecorder: MediaRecorder | null = null;
  private static audioChunks: Blob[] = [];
  private static activeStream: MediaStream | null = null;
  private static isRecordingNow: boolean = false;
  private static currentRecordingResolve: ((url: string | null) => void) | null = null;

  public static isRecording(): boolean {
    return this.isRecordingNow;
  }

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  }

  /**
   * Initializes or gets the shared mic media stream
   */
  public static async getStream(): Promise<MediaStream | null> {
    if (this.activeStream && this.activeStream.active) {
      return this.activeStream;
    }
    if (!this.isSupported()) return null;
    try {
      this.activeStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      return this.activeStream;
    } catch (err) {
      console.warn('AudioRecordingService: Microphone access error:', err);
      return null;
    }
  }

  /**
   * Starts a recording segment (e.g. while user holds Walkie-Talkie mic)
   */
  public static async startRecording(): Promise<boolean> {
    try {
      const stream = await this.getStream();
      if (!stream) return false;

      this.audioChunks = [];

      // Determine best supported mimeType
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      this.mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          if (this.currentRecordingResolve) {
            this.currentRecordingResolve(audioUrl);
            this.currentRecordingResolve = null;
          }
        } else {
          if (this.currentRecordingResolve) {
            this.currentRecordingResolve(null);
            this.currentRecordingResolve = null;
          }
        }
        this.isRecordingNow = false;
      };

      this.mediaRecorder.start(250);
      this.isRecordingNow = true;
      return true;
    } catch (err) {
      console.warn('AudioRecordingService: Start recording error:', err);
      this.isRecordingNow = false;
      return false;
    }
  }

  /**
   * Stops recording and returns the playable Audio Blob URL
   */
  public static stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.isRecordingNow = false;
        return resolve(null);
      }
      this.currentRecordingResolve = resolve;
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecordingNow = false;
        resolve(null);
      }
    });
  }

  /**
   * Releases microphone tracks when leaving call screen
   */
  public static cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
    }
    this.isRecordingNow = false;
    this.currentRecordingResolve = null;
  }
}
