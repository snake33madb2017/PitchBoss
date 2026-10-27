import type { SessionReport } from '../types';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  workspaceId: string; // 'tepic-madrid' | 'lovo-bar' | etc.
  scenarioId: string;
  scenarioTitle: string;
  totalSessions: number;
  menuFluencyScore: number; // 0 - 100%
  pronunciationScore: number; // 0 - 100%
  upSellingScore: number; // 0 - 100%
  objectionsMastered: number;
  totalObjections: number;
  totalSpokenMinutes: number;
  lastActiveDate: number;
  status: 'ready' | 'in_progress' | 'needs_practice';
  executiveFeedback: string;
}

const STORAGE_KEY = 'pitchboss_b2b_team_analytics_v3';
const ACTIVE_EMPLOYEE_KEY_PREFIX = 'pitchboss_active_employee_id_';

// 100% clean slate: no hardcoded mock or demo users
const DEFAULT_DEMO_TEAM: TeamMember[] = [];

export class TeamAnalyticsService {
  /**
   * Retrieves all team members, optionally filtered by company workspace
   */
  public static getTeamMembers(workspaceId?: string): TeamMember[] {
    let all: TeamMember[] = [];
    try {
      // Purge legacy mock data keys from earlier sessions
      if (typeof window !== 'undefined') {
        if (localStorage.getItem('pitchboss_b2b_team_analytics_v2')) {
          localStorage.removeItem('pitchboss_b2b_team_analytics_v2');
        }
        if (localStorage.getItem('pitchboss_b2b_team_analytics_v1')) {
          localStorage.removeItem('pitchboss_b2b_team_analytics_v1');
        }
      }

      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          all = parsed;
        }
      }
    } catch (e) {
      console.error('Error loading team analytics:', e);
    }

    if (workspaceId && workspaceId !== 'default' && workspaceId !== 'pitchboss' && workspaceId !== 'all') {
      return all.filter((m) => m.workspaceId === workspaceId);
    }

    return all;
  }

  /**
   * Saves team members to local storage
   */
  public static saveTeamMembers(members: TeamMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Error saving team analytics:', e);
    }
  }

  /**
   * Adds a new team member bound to a company workspace
   */
  public static addMember(member: Omit<TeamMember, 'id'>, workspaceId?: string): TeamMember {
    const all = this.getTeamMembers();
    const newMember: TeamMember = {
      ...member,
      workspaceId: workspaceId || member.workspaceId || 'default',
      id: `emp-${Date.now()}`
    };
    all.push(newMember);
    this.saveTeamMembers(all);
    return newMember;
  }

  /**
   * Deletes a team member (liberates a seat)
   */
  public static removeMember(id: string): void {
    const all = this.getTeamMembers();
    const updated = all.filter((m) => m.id !== id);
    this.saveTeamMembers(updated);
  }

  /**
   * Updates an existing member
   */
  public static updateMember(member: TeamMember): void {
    const all = this.getTeamMembers();
    const updated = all.map((m) => (m.id === member.id ? member : m));
    this.saveTeamMembers(updated);
  }

  /**
   * Resets data to initial clean slate
   */
  public static resetDemoTeam(): TeamMember[] {
    this.saveTeamMembers(DEFAULT_DEMO_TEAM);
    return DEFAULT_DEMO_TEAM;
  }

  /**
   * Purges all team members across all companies or for a specific workspace
   */
  public static purgeAllMembers(workspaceId?: string): void {
    if (workspaceId && workspaceId !== 'all') {
      const all = this.getTeamMembers();
      const updated = all.filter((m) => m.workspaceId !== workspaceId);
      this.saveTeamMembers(updated);
      this.setActiveEmployeeId(workspaceId, null);
    } else {
      this.saveTeamMembers([]);
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith(ACTIVE_EMPLOYEE_KEY_PREFIX)) {
            localStorage.removeItem(k);
          }
        });
      }
    }
  }

  /**
   * Generates summary statistics for the Director dashboard for a specific company
   */
  public static getSummaryMetrics(workspaceId?: string): {
    totalEmployees: number;
    totalSessions: number;
    avgFluency: number;
    avgPronunciation: number;
    totalSpokenMinutes: number;
    readyForFloorCount: number;
  } {
    const members = this.getTeamMembers(workspaceId);
    if (members.length === 0) {
      return {
        totalEmployees: 0,
        totalSessions: 0,
        avgFluency: 0,
        avgPronunciation: 0,
        totalSpokenMinutes: 0,
        readyForFloorCount: 0
      };
    }

    const totalSessions = members.reduce((acc, m) => acc + m.totalSessions, 0);
    const avgFluency = Math.round(members.reduce((acc, m) => acc + m.menuFluencyScore, 0) / members.length);
    const avgPronunciation = Math.round(members.reduce((acc, m) => acc + m.pronunciationScore, 0) / members.length);
    const totalSpokenMinutes = members.reduce((acc, m) => acc + m.totalSpokenMinutes, 0);
    const readyForFloorCount = members.filter((m) => m.status === 'ready').length;

    return {
      totalEmployees: members.length,
      totalSessions,
      avgFluency,
      avgPronunciation,
      totalSpokenMinutes,
      readyForFloorCount
    };
  }

  /**
   * Gets the active employee ID currently studying in a company workspace
   */
  public static getActiveEmployeeId(workspaceId: string): string | null {
    try {
      return localStorage.getItem(ACTIVE_EMPLOYEE_KEY_PREFIX + workspaceId);
    } catch {
      return null;
    }
  }

  /**
   * Sets the active employee ID currently studying in a company workspace
   */
  public static setActiveEmployeeId(workspaceId: string, employeeId: string | null): void {
    try {
      if (!employeeId) {
        localStorage.removeItem(ACTIVE_EMPLOYEE_KEY_PREFIX + workspaceId);
      } else {
        localStorage.setItem(ACTIVE_EMPLOYEE_KEY_PREFIX + workspaceId, employeeId);
      }
    } catch (e) {
      console.error('Error setting active employee:', e);
    }
  }

  /**
   * Gets the active employee profile currently studying
   */
  public static getActiveEmployee(workspaceId: string): TeamMember | null {
    const members = this.getTeamMembers(workspaceId);
    if (members.length === 0) return null;

    const activeId = this.getActiveEmployeeId(workspaceId);
    if (activeId) {
      const found = members.find((m) => m.id === activeId);
      if (found) return found;
    }

    // Default to the first team member if none explicitly selected
    return members[0];
  }

  /**
   * Records a completed training session for a team member and updates their progress
   */
  public static recordSessionResult(employeeId: string, report: SessionReport): TeamMember | null {
    const all = this.getTeamMembers();
    const idx = all.findIndex((m) => m.id === employeeId);
    if (idx === -1) return null;

    const m = all[idx];
    const prevSessions = m.totalSessions || 0;
    const newSessions = prevSessions + 1;

    // Weight recent performance smoothly
    const fluencyFromReport = report.businessScore || 75;
    const pronunciationFromReport = report.englishScore || 75;
    const upSellingFromReport = Math.min(100, Math.round((report.businessScore * 0.9) + ((report.completedObjectives?.length || 0) * 5)));

    const newFluency = Math.round((m.menuFluencyScore * prevSessions + fluencyFromReport) / newSessions);
    const newPronunciation = Math.round((m.pronunciationScore * prevSessions + pronunciationFromReport) / newSessions);
    const newUpSelling = Math.round((m.upSellingScore * prevSessions + upSellingFromReport) / newSessions);

    const spokenMins = Math.max(1, Math.round((report.durationSeconds || 60) / 60));
    const newTotalSpokenMinutes = (m.totalSpokenMinutes || 0) + spokenMins;

    const masteredObjCount = Math.min(4, Math.max(m.objectionsMastered, report.completedObjectives?.length || 0));

    // Determine readiness status:
    // If fluency >= 80 and pronunciation >= 75 -> 'ready' (Listo para Sala / Certificado)
    // If fluency >= 60 -> 'in_progress'
    // Else -> 'needs_practice'
    let newStatus: 'ready' | 'in_progress' | 'needs_practice' = 'needs_practice';
    if (newFluency >= 80 && newPronunciation >= 75) {
      newStatus = 'ready';
    } else if (newFluency >= 60 || newSessions >= 2) {
      newStatus = 'in_progress';
    }

    // Build dynamic executive feedback from AI debrief
    let dynamicFeedback = m.executiveFeedback;
    if (report.keyStrengths && report.keyStrengths.length > 0) {
      dynamicFeedback = `Demostró buen dominio en: ${report.keyStrengths.slice(0, 2).join(', ')}.`;
      if (report.areasForImprovement && report.areasForImprovement.length > 0) {
        dynamicFeedback += ` Área a reforzar: ${report.areasForImprovement[0]}.`;
      }
    }

    const updated: TeamMember = {
      ...m,
      totalSessions: newSessions,
      scenarioId: report.scenarioId || m.scenarioId,
      scenarioTitle: report.scenarioTitle || m.scenarioTitle,
      menuFluencyScore: newFluency,
      pronunciationScore: newPronunciation,
      upSellingScore: newUpSelling,
      objectionsMastered: masteredObjCount,
      totalSpokenMinutes: newTotalSpokenMinutes,
      lastActiveDate: Date.now(),
      status: newStatus,
      executiveFeedback: dynamicFeedback
    };

    all[idx] = updated;
    this.saveTeamMembers(all);
    return updated;
  }

  /**
   * Exports team report as a clean CSV string
   */
  public static exportToCSV(companyName = 'Restaurante Tepic', workspaceId?: string): string {
    const members = this.getTeamMembers(workspaceId);
    const headers = [
      'ID',
      'Empleado',
      'Rol',
      'Email',
      'Escenario / Carta',
      'Sesiones Completadas',
      'Fluidez Carta (%)',
      'Pronunciación (%)',
      'Up-Selling (%)',
      'Objeciones Superadas',
      'Minutos Hablados',
      'Estado',
      'Última Actividad',
      'Evaluación Dirección'
    ];

    const rows = members.map((m) => [
      m.id,
      `"${m.name}"`,
      `"${m.role}"`,
      m.email || '',
      `"${m.scenarioTitle}"`,
      m.totalSessions,
      `${m.menuFluencyScore}%`,
      `${m.pronunciationScore}%`,
      `${m.upSellingScore}%`,
      `${m.objectionsMastered}/${m.totalObjections}`,
      m.totalSpokenMinutes,
      m.status === 'ready' ? 'Listo para Sala' : m.status === 'in_progress' ? 'En Progreso' : 'Requiere Repaso',
      new Date(m.lastActiveDate).toLocaleDateString('es-ES'),
      `"${m.executiveFeedback.replace(/"/g, '""')}"`
    ]);

    return [
      `# INFORME EJECUTIVO DE CAPACITACIÓN B2B - ${companyName.toUpperCase()}`,
      `# Fecha de exportación: ${new Date().toLocaleString('es-ES')}`,
      headers.join(';'),
      ...rows.map((r) => r.join(';'))
    ].join('\r\n');
  }
}
