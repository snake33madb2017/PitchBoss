import type { Scenario } from '../types';
import { PRESET_SCENARIOS } from '../data/presetScenarios';

const STORAGE_KEY = 'persona_managed_scenarios_v2';
const LEGACY_STORAGE_KEY = 'persona_custom_scenarios';
const PIN_STORAGE_KEY = 'persona_admin_pin';
const ADMIN_SESSION_KEY = 'persona_admin_session_active';
const DEFAULT_PIN = '1234';
const DELETED_IDS_KEY = 'pitchboss_deleted_scenarios_v1';

export class AdminStorageService {
  /**
   * Loads scenarios from local storage, migrating from legacy if needed.
   * If empty, populates with PRESET_SCENARIOS.
   */
  public static getScenarios(): Scenario[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let hasSynced = false;
          const syncedScenarios = parsed.map((s: Scenario) => {
            const presetMatch = PRESET_SCENARIOS.find((p) => p.id === s.id);
            // If it's a default preset and missing the full master business knowledge, auto-upgrade it
            if (presetMatch && (!s.businessKnowledge || !s.businessKnowledge.includes("TOMO I: LA MUSA"))) {
              hasSynced = true;
              return {
                ...s,
                title: presetMatch.title,
                niche: presetMatch.niche,
                businessKnowledge: presetMatch.businessKnowledge,
                context: presetMatch.context,
                aiCharacter: presetMatch.aiCharacter,
                objectives: presetMatch.objectives,
                commonObjections: presetMatch.commonObjections,
                nicheVocabulary: presetMatch.nicheVocabulary,
                initialGreeting: presetMatch.initialGreeting,
                initialTranslation: presetMatch.initialTranslation,
                initialTip: presetMatch.initialTip
              };
            }
            return s;
          });

          // Remove obsolete legacy LOVO scenario IDs and explicitly deleted scenarios if present
          const deletedIds = this.getDeletedScenarioIds();
          const PURGE_IDS = [
            'lovo-bar-staff-hospitality',
            'auxiliar-servicios-administrativos-generales',
            'lovo-tomo1-la-musa',
            'lovo-tomo2-taxonomia-animal',
            'lovo-tomo3-la-tribu',
            ...deletedIds
          ];
          const cleanedScenarios = syncedScenarios.filter((s: Scenario) => !PURGE_IDS.includes(s.id));
          if (cleanedScenarios.length !== syncedScenarios.length) {
            hasSynced = true;
          }

          // Auto-merge newly added preset scenarios if they are not yet in storage and not in deleted list
          const missingPresets = PRESET_SCENARIOS.filter(
            (p) => !cleanedScenarios.some((s: Scenario) => s.id === p.id) && !PURGE_IDS.includes(p.id)
          );

          if (missingPresets.length > 0 || hasSynced) {
            const merged = [...cleanedScenarios, ...missingPresets];
            this.saveScenarios(merged);
            return merged;
          }
          return cleanedScenarios;
        }
      }

      // Check legacy storage
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        try {
          const parsedLegacy = JSON.parse(legacy);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const merged = [...parsedLegacy, ...PRESET_SCENARIOS.filter(p => !parsedLegacy.some(l => l.id === p.id))];
            this.saveScenarios(merged);
            return merged;
          }
        } catch {}
      }
    } catch (e) {
      console.error('Error reading scenarios from storage:', e);
    }

    // Default initialization
    const initial = [...PRESET_SCENARIOS];
    this.saveScenarios(initial);
    return initial;
  }

  /**
   * Saves the entire list of scenarios to local storage.
   */
  public static saveScenarios(scenarios: Scenario[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
    } catch (e) {
      console.error('Error saving scenarios to storage:', e);
    }
  }

  /**
   * Updates an existing scenario or adds a new one.
   */
  public static upsertScenario(scenario: Scenario): Scenario[] {
    const current = this.getScenarios();
    const index = current.findIndex(s => s.id === scenario.id);

    let updated: Scenario[];
    if (index >= 0) {
      // Update existing
      updated = [...current];
      updated[index] = {
        ...scenario,
        updatedAt: Date.now()
      };
    } else {
      // Add new at the top
      updated = [
        {
          ...scenario,
          createdAt: scenario.createdAt || Date.now(),
          updatedAt: Date.now()
        },
        ...current
      ];
    }

    this.saveScenarios(updated);
    return updated;
  }

  /**
   * Duplicates an existing scenario with a new ID and "Copia de ..." title.
   */
  public static duplicateScenario(id: string): { scenarios: Scenario[]; newScenario: Scenario | null } {
    const current = this.getScenarios();
    const target = current.find(s => s.id === id);
    if (!target) return { scenarios: current, newScenario: null };

    const duplicated: Scenario = {
      ...target,
      id: 'custom-' + Date.now(),
      title: `${target.title} (Copia)`,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [duplicated, ...current];
    this.saveScenarios(updated);
    return { scenarios: updated, newScenario: duplicated };
  }

  /**
   * Deletes a scenario by ID.
   */
  public static getDeletedScenarioIds(): string[] {
    try {
      const data = localStorage.getItem(DELETED_IDS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  public static addDeletedScenarioId(id: string): void {
    const list = this.getDeletedScenarioIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(list));
    }
  }

  /**
   * Deletes a scenario by ID and persists deletion to prevent preset resurrection.
   */
  public static deleteScenario(id: string): Scenario[] {
    this.addDeletedScenarioId(id);
    const current = this.getScenarios();
    const updated = current.filter(s => s.id !== id);
    this.saveScenarios(updated);
    return updated;
  }

  /**
   * Toggles visibility (hide/show) for non-admin users.
   */
  public static toggleVisibility(id: string): Scenario[] {
    const current = this.getScenarios();
    const updated = current.map(s => {
      if (s.id === id) {
        return { ...s, isHidden: !s.isHidden, updatedAt: Date.now() };
      }
      return s;
    });
    this.saveScenarios(updated);
    return updated;
  }

  /**
   * Restores original default scenarios.
   */
  public static restoreDefaults(): Scenario[] {
    localStorage.removeItem(DELETED_IDS_KEY);
    const defaults = [...PRESET_SCENARIOS];
    this.saveScenarios(defaults);
    return defaults;
  }

  /**
   * Exports scenarios to a downloadable JSON file.
   */
  public static exportToJsonFile(): void {
    const scenarios = this.getScenarios();
    const dataStr = JSON.stringify(scenarios, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `pitchboss_escenarios_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Returns JSON string representation of scenarios for clipboard or sharing.
   */
  public static exportToJsonString(): string {
    return JSON.stringify(this.getScenarios(), null, 2);
  }

  /**
   * Imports scenarios from a JSON string, either replacing or merging.
   */
  public static importFromJson(jsonString: string, mode: 'merge' | 'replace' = 'merge'): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'El archivo JSON no contiene una lista de escenarios válida.' };
      }

      // Basic validation: must have id, title, and initialGreeting
      const validScenarios = parsed.filter(item => item && item.id && item.title && item.initialGreeting);
      if (validScenarios.length === 0) {
        return { success: false, count: 0, error: 'Ningún escenario cumple con la estructura requerida.' };
      }

      let finalScenarios: Scenario[];
      if (mode === 'replace') {
        finalScenarios = validScenarios;
      } else {
        const current = this.getScenarios();
        const map = new Map<string, Scenario>();
        current.forEach(s => map.set(s.id, s));
        validScenarios.forEach(s => map.set(s.id, s));
        finalScenarios = Array.from(map.values());
      }

      this.saveScenarios(finalScenarios);
      return { success: true, count: validScenarios.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Error al procesar el archivo JSON.' };
    }
  }

  /**
   * Admin Authentication & PIN
   */
  public static getAdminPin(): string {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  }

  public static setAdminPin(newPin: string): boolean {
    if (!newPin || newPin.trim().length < 4) return false;
    localStorage.setItem(PIN_STORAGE_KEY, newPin.trim());
    return true;
  }

  public static verifyAdminPin(pin: string): boolean {
    const currentPin = this.getAdminPin();
    return pin.trim() === currentPin;
  }

  public static isAdminSessionActive(): boolean {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }

  public static setAdminSessionActive(active: boolean): void {
    if (active) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }

  /**
   * PWA Maintenance: Clear Service Worker cache and reload app.
   */
  public static async forcePwaUpdate(): Promise<void> {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      window.location.reload();
    } catch (e) {
      console.error('Error updating PWA:', e);
      window.location.reload();
    }
  }
}
