import type { EnglishLevel, LevelProgress, LevelPromotionEvent, SessionReport } from '../types';

const LEVEL_STORAGE_KEY = 'pitchboss_user_level_progress_v1';

const LEVEL_HIERARCHY: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export class LevelEvaluationService {
  /**
   * Returns the next CEFR level in sequence, or null if maximum reached
   */
  public static getNextLevel(current: EnglishLevel): EnglishLevel | null {
    const idx = LEVEL_HIERARCHY.indexOf(current);
    if (idx >= 0 && idx < LEVEL_HIERARCHY.length - 1) {
      return LEVEL_HIERARCHY[idx + 1];
    }
    return null;
  }

  /**
   * Retrieves the current level progress of the collaborator
   */
  public static getLevelProgress(): LevelProgress {
    try {
      const data = localStorage.getItem(LEVEL_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.currentLevel) {
          return {
            ...parsed,
            nextLevel: this.getNextLevel(parsed.currentLevel)
          };
        }
      }
    } catch (e) {
      console.error('Error loading level progress:', e);
    }

    // Default initialization: starting at A1 (Beginner)
    const initial: LevelProgress = {
      currentLevel: 'A1',
      nextLevel: 'A2',
      masteryScore: 25,
      consecutivePassingSessions: 0,
      totalCompletedEvaluations: 0,
      history: []
    };

    this.saveProgress(initial);
    return initial;
  }

  /**
   * Saves progress to local storage
   */
  private static saveProgress(progress: LevelProgress): void {
    try {
      localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving level progress:', e);
    }
  }

  /**
   * Evaluates a completed session and determines whether to promote the user
   */
  public static evaluateSession(report: SessionReport): {
    promoted: boolean;
    promotionEvent?: LevelPromotionEvent;
    progress: LevelProgress;
    feedbackMessage: string;
  } {
    const currentProgress = this.getLevelProgress();
    const nextLevel = this.getNextLevel(currentProgress.currentLevel);

    // Minimum criteria for a successful practice turn
    const isPassing =
      report.englishScore >= 75 &&
      report.businessScore >= 70 &&
      report.completedObjectives.length >= 2 &&
      report.totalMessages >= 4;

    const totalEvals = currentProgress.totalCompletedEvaluations + 1;

    if (!isPassing) {
      const updatedProgress: LevelProgress = {
        ...currentProgress,
        totalCompletedEvaluations: totalEvals,
        lastEvaluatedAt: Date.now(),
        consecutivePassingSessions: Math.max(0, currentProgress.consecutivePassingSessions - 1),
        masteryScore: Math.max(15, currentProgress.masteryScore - 10)
      };
      this.saveProgress(updatedProgress);

      return {
        promoted: false,
        progress: updatedProgress,
        feedbackMessage:
          'Continúa practicando este escenario. Para desbloquear el siguiente nivel, necesitas superar el 75% en fluidez y cumplir al menos 2 objetivos de negocio.'
      };
    }

    // Passing session!
    const newConsecutive = currentProgress.consecutivePassingSessions + 1;
    const newMastery = Math.min(100, currentProgress.masteryScore + 40);

    // Condition to level up: 2 consecutive passing sessions or 100% mastery, and next level exists
    const shouldPromote = (newConsecutive >= 2 || newMastery >= 100) && nextLevel !== null;

    if (shouldPromote && nextLevel) {
      const promotionEvent: LevelPromotionEvent = {
        fromLevel: currentProgress.currentLevel,
        toLevel: nextLevel,
        date: Date.now(),
        reason: `Excelente desempeño en "${report.scenarioTitle}" con ${report.englishScore}% en fluidez y ${report.businessScore}% en objetivos comerciales.`,
        businessScore: report.businessScore,
        englishScore: report.englishScore,
        scenarioTitle: report.scenarioTitle
      };

      const promotedProgress: LevelProgress = {
        currentLevel: nextLevel,
        nextLevel: this.getNextLevel(nextLevel),
        masteryScore: 20, // baseline for the new level
        consecutivePassingSessions: 0,
        totalCompletedEvaluations: totalEvals,
        lastEvaluatedAt: Date.now(),
        history: [promotionEvent, ...currentProgress.history]
      };

      this.saveProgress(promotedProgress);

      return {
        promoted: true,
        promotionEvent,
        progress: promotedProgress,
        feedbackMessage: `¡Enhorabuena! Has demostrado solvencia comunicativa y has ascendido oficialmente al Nivel ${nextLevel}.`
      };
    }

    // Gained progress towards promotion
    const updatedProgress: LevelProgress = {
      ...currentProgress,
      totalCompletedEvaluations: totalEvals,
      lastEvaluatedAt: Date.now(),
      consecutivePassingSessions: newConsecutive,
      masteryScore: newMastery
    };
    this.saveProgress(updatedProgress);

    return {
      promoted: false,
      progress: updatedProgress,
      feedbackMessage: `¡Gran sesión! Llevas ${newConsecutive} práctica(s) consecutiva(s) aprobada(s). Completa 1 sesión más con alta puntuación para subir a Nivel ${nextLevel}.`
    };
  }

  /**
   * Allows manual level setting (for testing or manager adjustment)
   */
  public static setUserLevel(level: EnglishLevel): LevelProgress {
    const current = this.getLevelProgress();
    const updated: LevelProgress = {
      ...current,
      currentLevel: level,
      nextLevel: this.getNextLevel(level),
      masteryScore: 30,
      consecutivePassingSessions: 0
    };
    this.saveProgress(updated);
    return updated;
  }

  /**
   * Translates internal CEFR level code to user-facing Pitch Tier name:
   * A1, A2 -> 'Pitch One'
   * B1, B2 -> 'Pitch Two'
   * C1, C2 -> 'Pitch Three'
   */
  public static getPitchTier(level?: string): 'Pitch One' | 'Pitch Two' | 'Pitch Three' {
    if (!level) return 'Pitch One';
    const clean = level.toUpperCase();
    if (clean.includes('C1') || clean.includes('C2') || clean.includes('THREE') || clean.includes('3')) {
      return 'Pitch Three';
    }
    if (clean.includes('B1') || clean.includes('B2') || clean.includes('TWO') || clean.includes('2')) {
      return 'Pitch Two';
    }
    return 'Pitch One';
  }

  /**
   * Strips CEFR parenthetical codes like (A1-A2), (B1-B2), (C1-C2), (A1), etc. from scenario titles
   */
  public static cleanTitle(title: string): string {
    if (!title) return '';
    return title
      .replace(/\s*\((?:A1-A2|B1-B2|C1-C2|A1|A2|B1|B2|C1|C2)\)/gi, '')
      .replace(/\s*—\s*(?:A1-A2|B1-B2|C1-C2|A1|A2|B1|B2|C1|C2)/gi, '')
      .replace(/\s*-\s*(?:A1-A2|B1-B2|C1-C2|A1|A2|B1|B2|C1|C2)/gi, '')
      .trim();
  }

  /**
   * Explains competency description per level
   */
  public static getLevelDescription(level: EnglishLevel): {
    title: string;
    profile: string;
    aiBehavior: string;
  } {
    switch (level) {
      case 'A1':
        return {
          title: 'Pitch One (Iniciación y Saludos)',
          profile: 'Frases de bienvenida, saludos amables, pedidos básicos y apoyo con tips fonéticos.',
          aiBehavior: 'El interlocutor habla lento y pausado. Te ofrece tips fonéticos y guía en español cuando dudas.'
        };
      case 'A2':
        return {
          title: 'Pitch One (Atención Operativa)',
          profile: 'Atención a visitas, toma de pedidos, resolución de dudas comunes sobre la carta y protocolo.',
          aiBehavior: 'Interlocutor cordial que responde en frases completas. Plantea dudas sobre horarios y recomendaciones.'
        };
      case 'B1':
        return {
          title: 'Pitch Two (Fluidez y Carta Oficial)',
          profile: 'Storytelling de productos, explicación de ingredientes, alternativas y defensa de carta.',
          aiBehavior: 'El cliente pide recomendaciones de autor, pregunta por alérgenos y solicita detalles de preparación.'
        };
      case 'B2':
        return {
          title: 'Pitch Two (Argumentación y Up-Selling)',
          profile: 'Venta sugestiva premium, maridaje de autor y resolución de objeciones comerciales.',
          aiBehavior: 'Interlocutor directivo que desafía tus sugerencias y exige justificación de precios y valor.'
        };
      case 'C1':
        return {
          title: 'Pitch Three (Alta Dirección y Negociación)',
          profile: 'Negociaciones complejas a nivel C-Suite, auditorías críticas y persuasión estratégica.',
          aiBehavior: 'Inglés con modismos sofisticados, ritmo rápido y análisis exhaustivo de opciones.'
        };
      case 'C2':
        return {
          title: 'Pitch Three (Maestría y Diplomacia)',
          profile: 'Soltura absoluta bilingüe sin ningún tipo de barrera cultural, técnica o de protocolo.',
          aiBehavior: 'Conversaciones al más alto nivel internacional con matices sutiles y máxima exigencia.'
        };
      default:
        return {
          title: 'Pitch One',
          profile: 'Competencia comunicativa orientada a negocios.',
          aiBehavior: 'Interlocutor adaptativo.'
        };
    }
  }
}
