import type { SavedSession, SessionReport, Message, Objective, Scenario } from '../types';

const STORAGE_KEY = 'pitchboss_saved_sessions_v1';

export class SessionHistoryService {
  /**
   * Retrieves all saved sessions from localStorage
   */
  public static getSessions(): SavedSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
      }
    } catch (e) {
      console.error('Error loading sessions from storage:', e);
    }
    return [];
  }

  /**
   * Saves or updates a session
   */
  public static upsertSession(session: SavedSession): SavedSession {
    const sessions = this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    const updatedSession = {
      ...session,
      updatedAt: Date.now()
    };

    if (index >= 0) {
      sessions[index] = updatedSession;
    } else {
      sessions.unshift(updatedSession);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving session to storage:', e);
    }

    return updatedSession;
  }

  /**
   * Creates a new in-progress session for a scenario
   */
  public static createNewSession(scenario: Scenario, initialMessages: Message[]): SavedSession {
    const newSession: SavedSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      scenarioNiche: scenario.niche,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      durationSeconds: 0,
      status: 'in_progress',
      messages: initialMessages,
      objectives: scenario.objectives.map((o) => ({ ...o, completed: false }))
    };

    return this.upsertSession(newSession);
  }

  /**
   * Gets all sessions associated with a specific scenario
   */
  public static getSessionsForScenario(scenarioId: string): SavedSession[] {
    return this.getSessions().filter((s) => s.scenarioId === scenarioId);
  }

  /**
   * Finds the latest in-progress session for a scenario (to allow resuming)
   */
  public static getLatestInProgressSession(scenarioId: string): SavedSession | null {
    const sessions = this.getSessionsForScenario(scenarioId);
    return sessions.find((s) => s.status === 'in_progress') || null;
  }

  /**
   * Marks a session as completed and attaches the executive evaluation report
   */
  public static completeSession({
    sessionId,
    report,
    messages,
    objectives,
    durationSeconds
  }: {
    sessionId: string;
    report: SessionReport;
    messages: Message[];
    objectives: Objective[];
    durationSeconds: number;
  }): void {
    const sessions = this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);

    if (target) {
      target.status = 'completed';
      target.report = report;
      target.messages = messages;
      target.objectives = objectives;
      target.durationSeconds = durationSeconds;
      target.updatedAt = Date.now();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch (e) {
        console.error('Error completing session in storage:', e);
      }
    }
  }

  /**
   * Deletes a session by ID
   */
  public static deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter((s) => s.id !== sessionId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error deleting session from storage:', e);
    }
  }

  /**
   * Returns aggregate metrics for company audit / employee dashboard
   */
  public static getGlobalMetrics(): {
    totalSessions: number;
    completedSessions: number;
    totalDurationSeconds: number;
    averageBusinessScore: number;
    averageEnglishScore: number;
  } {
    const sessions = this.getSessions();
    const completed = sessions.filter((s) => s.status === 'completed' && s.report);

    const totalDurationSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const avgBusiness =
      completed.length > 0
        ? Math.round(completed.reduce((acc, s) => acc + (s.report?.businessScore || 0), 0) / completed.length)
        : 0;
    const avgEnglish =
      completed.length > 0
        ? Math.round(completed.reduce((acc, s) => acc + (s.report?.englishScore || 0), 0) / completed.length)
        : 0;

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      totalDurationSeconds,
      averageBusinessScore: avgBusiness,
      averageEnglishScore: avgEnglish
    };
  }
}
