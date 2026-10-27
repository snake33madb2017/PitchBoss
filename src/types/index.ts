export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'hostile';
export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  niche: string; // e.g. "Fintech B2B Sales", "Real Estate", "Medical Tech", "Job Interview"
  aiCharacter: {
    name: string;
    role: string; // e.g. "CFO of Acme Corp"
    avatar: string; // avatar emoji or icon
    personality: string; // e.g. "Skeptical, busy, focused on ROI"
    voiceGender?: 'male' | 'female';
  };
  userRole: string; // e.g. "Enterprise Account Executive"
  context: string; // The situation setup
  initialGreeting: string; // The first thing the AI says
  initialTranslation?: string; // Spanish translation of the opening English line
  initialTip?: string; // Pronunciation / phrase tip for the user
  difficulty: DifficultyLevel;
  targetEnglishLevel: EnglishLevel;
  objectives: Objective[];
  commonObjections: string[];
  nicheVocabulary: string[]; // Specific industry jargon to use or practice
  businessKnowledge?: string; // Raw pasted menu, product list, FAQs or operational manual
  workspaceId?: string; // Multi-tenant partition
  isCustom?: boolean;
  isHidden?: boolean; // When true, hidden from non-admin users
  createdAt: number;
  updatedAt?: number;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: number;
  translation?: string;
  showTranslation?: boolean;
  audioLang?: 'es-ES' | 'en-US';
  tip?: string;
  audioUrl?: string; // Spoken audio recording for playback
  corrections?: {
    originalText: string;
    improvedText: string;
    explanation: string;
  }[];
  usedVocabulary?: string[];
}

export interface SessionReport {
  id?: string;
  workspaceId?: string;
  employeeName?: string;
  audioRecordingUrl?: string; // Call audio recording URL
  createdAt?: number;
  scenarioId: string;
  scenarioTitle: string;
  durationSeconds: number;
  totalMessages: number;
  completedObjectives: string[];
  pendingObjectives: string[];
  businessScore: number; // 0 - 100
  englishScore: number; // 0 - 100
  executiveSummary: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  vocabularyUsed: string[];
  suggestedPhrases: { original: string; better: string; reason: string }[];
}

export interface AppSettings {
  apiKey: string;
  model: string;
  preferredVoice: string;
  speechRate: number;
  speechPitch: number;
  autoListen: boolean; // Continuous conversational mode
  showRealtimeHints: boolean;
  hapticFeedback: boolean;
  adminPin?: string; // Admin PIN (defaults to '3319')
  workspaceId?: string; // Current active workspace
  employeeName?: string; // Current user / employee name
  enableDailyReminders?: boolean;
  reminderHour?: number;
  fastResponseMode?: boolean; // Ultra-fast low latency mode
  silenceThresholdMs?: number; // Silence detection timeout in ms
}

export interface SavedSession {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  scenarioNiche: string;
  startedAt: number;
  updatedAt: number;
  durationSeconds: number;
  status: 'in_progress' | 'completed';
  messages: Message[];
  objectives: Objective[];
  report?: SessionReport;
}

export interface LevelPromotionEvent {
  fromLevel: EnglishLevel;
  toLevel: EnglishLevel;
  date: number;
  reason: string;
  businessScore: number;
  englishScore: number;
  scenarioTitle: string;
}

export interface LevelProgress {
  currentLevel: EnglishLevel;
  nextLevel: EnglishLevel | null;
  masteryScore: number; // 0 - 100%
  consecutivePassingSessions: number;
  totalCompletedEvaluations: number;
  lastEvaluatedAt?: number;
  history: LevelPromotionEvent[];
}
