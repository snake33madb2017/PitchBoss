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
  isCustom?: boolean;
  isHidden?: boolean; // When true, hidden from non-admin users
  createdAt: number;
  updatedAt?: number;
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
  corrections?: {
    originalText: string;
    improvedText: string;
    explanation: string;
  }[];
  usedVocabulary?: string[];
}

export interface SessionReport {
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
  adminPin?: string; // Admin PIN (defaults to '1234')
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
