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

const STORAGE_KEY = 'pitchboss_b2b_team_analytics_v2';
const ACTIVE_EMPLOYEE_KEY_PREFIX = 'pitchboss_active_employee_id_';

const DEFAULT_DEMO_TEAM: TeamMember[] = [
  // --- LOVO Bar Madrid Team ---
  {
    id: 'emp-lovo-1',
    name: 'Carlos Méndez',
    role: 'Bartender Principal',
    email: 'carlos.bar@lovobar.com',
    workspaceId: 'lovo-bar',
    scenarioId: 'lovo-tomo1-pitch1',
    scenarioTitle: 'LOVO Tomo I: La Musa',
    totalSessions: 5,
    menuFluencyScore: 85,
    pronunciationScore: 88,
    upSellingScore: 82,
    objectionsMastered: 4,
    totalObjections: 4,
    totalSpokenMinutes: 28,
    lastActiveDate: Date.now() - 1000 * 60 * 45,
    status: 'ready',
    executiveFeedback: 'Tu empleado Carlos ha completado 5 sesiones de LOVO Bar y tiene un 85% de fluidez en la carta. Ha dominado las recomendaciones de los cócteles Bubi y Manabi y la política de cuenta no dividida.'
  },
  {
    id: 'emp-lovo-2',
    name: 'Elena Gómez',
    role: 'Camarera de Sala & Coctelería',
    email: 'elena.g@lovobar.com',
    workspaceId: 'lovo-bar',
    scenarioId: 'lovo-tomo1-pitch1',
    scenarioTitle: 'LOVO Tomo I: La Musa',
    totalSessions: 4,
    menuFluencyScore: 90,
    pronunciationScore: 92,
    upSellingScore: 88,
    objectionsMastered: 4,
    totalObjections: 4,
    totalSpokenMinutes: 22,
    lastActiveDate: Date.now() - 1000 * 60 * 180,
    status: 'ready',
    executiveFeedback: 'Excelente desempeño en el protocolo de bienvenida de 40 segundos y narración del storytelling de Joséphine Baker.'
  },
  {
    id: 'emp-lovo-3',
    name: 'Marcos Varela',
    role: 'Bartender Junior',
    email: 'marcos.v@lovobar.com',
    workspaceId: 'lovo-bar',
    scenarioId: 'lovo-tomo1-pitch1',
    scenarioTitle: 'LOVO Tomo I: La Musa',
    totalSessions: 2,
    menuFluencyScore: 65,
    pronunciationScore: 70,
    upSellingScore: 55,
    objectionsMastered: 2,
    totalObjections: 4,
    totalSpokenMinutes: 12,
    lastActiveDate: Date.now() - 1000 * 60 * 60 * 24,
    status: 'in_progress',
    executiveFeedback: 'Buena base. Debe reforzar el ofrecimiento de destilados premium (Bourbon/Rye) en la 2ª ronda según el protocolo.'
  },
  {
    id: 'emp-lovo-4',
    name: 'Sofía Ramos',
    role: 'Hostess / Bienvenida',
    email: 'sofia.r@lovobar.com',
    workspaceId: 'lovo-bar',
    scenarioId: 'lovo-tomo1-pitch1',
    scenarioTitle: 'LOVO Tomo I: La Musa',
    totalSessions: 1,
    menuFluencyScore: 52,
    pronunciationScore: 60,
    upSellingScore: 45,
    objectionsMastered: 1,
    totalObjections: 4,
    totalSpokenMinutes: 6,
    lastActiveDate: Date.now() - 1000 * 60 * 60 * 48,
    status: 'needs_practice',
    executiveFeedback: 'Requiere más práctica en frases de recepción en barra y oferta de agua de cortesía antes del próximo servicio.'
  },

  // --- Restaurante Tepic (Ayala 14) Team ---
  {
    id: 'emp-tepic-1',
    name: 'Mateo Salazar',
    role: 'Jefe de Sala & Atención VIP',
    email: 'mateo.sala@tepic.es',
    workspaceId: 'tepic-madrid',
    scenarioId: 'tepic-pitch1',
    scenarioTitle: 'Tepic Módulo 1: El Maíz y la Tradición',
    totalSessions: 6,
    menuFluencyScore: 92,
    pronunciationScore: 90,
    upSellingScore: 88,
    objectionsMastered: 4,
    totalObjections: 4,
    totalSpokenMinutes: 32,
    lastActiveDate: Date.now() - 1000 * 60 * 30,
    status: 'ready',
    executiveFeedback: 'Excelente explicación en inglés del nixtamalizado y tacos de cochinita pibil. Servicio fluido con comensales internacionales.'
  },
  {
    id: 'emp-tepic-2',
    name: 'Valeria Rivas',
    role: 'Sumiller de Mezcales & Barra',
    email: 'valeria.mezcal@tepic.es',
    workspaceId: 'tepic-madrid',
    scenarioId: 'tepic-pitch2',
    scenarioTitle: 'Tepic Módulo 2: Mezcales de Oaxaca',
    totalSessions: 5,
    menuFluencyScore: 89,
    pronunciationScore: 94,
    upSellingScore: 91,
    objectionsMastered: 4,
    totalObjections: 4,
    totalSpokenMinutes: 26,
    lastActiveDate: Date.now() - 1000 * 60 * 120,
    status: 'ready',
    executiveFeedback: 'Dominio impecable de las notas ahumadas de agaves silvestres (Tobalá y Tepeztate) y maridaje con mole de autor.'
  },
  {
    id: 'emp-tepic-3',
    name: 'Javier Morales',
    role: 'Camarero de Sala Junior',
    email: 'javier.m@tepic.es',
    workspaceId: 'tepic-madrid',
    scenarioId: 'tepic-pitch3',
    scenarioTitle: 'Tepic Módulo 3: Protocolo Michelin',
    totalSessions: 2,
    menuFluencyScore: 68,
    pronunciationScore: 72,
    upSellingScore: 60,
    objectionsMastered: 2,
    totalObjections: 4,
    totalSpokenMinutes: 14,
    lastActiveDate: Date.now() - 1000 * 60 * 60 * 20,
    status: 'in_progress',
    executiveFeedback: 'Buen progreso. Debe reforzar la oferta de postres mexicanos (tres leches y buñuelos) al retirar los platos principales.'
  },
  {
    id: 'emp-tepic-4',
    name: 'Camila Ortiz',
    role: 'Hostess / Recepción',
    email: 'camila.o@tepic.es',
    workspaceId: 'tepic-madrid',
    scenarioId: 'tepic-pitch1',
    scenarioTitle: 'Tepic Módulo 1: El Maíz y la Tradición',
    totalSessions: 1,
    menuFluencyScore: 55,
    pronunciationScore: 62,
    upSellingScore: 40,
    objectionsMastered: 1,
    totalObjections: 4,
    totalSpokenMinutes: 8,
    lastActiveDate: Date.now() - 1000 * 60 * 60 * 40,
    status: 'needs_practice',
    executiveFeedback: 'Requiere más soltura en la confirmación de alérgenos y recepción bilingüe en la entrada de Ayala 14.'
  }
];

export class TeamAnalyticsService {
  /**
   * Retrieves all team members, optionally filtered by company workspace
   */
  public static getTeamMembers(workspaceId?: string): TeamMember[] {
    let all: TeamMember[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          all = parsed;
        }
      }
    } catch (e) {
      console.error('Error loading team analytics:', e);
    }

    // Default initialization
    if (all.length === 0) {
      all = DEFAULT_DEMO_TEAM;
      this.saveTeamMembers(all);
    }

    if (workspaceId && workspaceId !== 'default' && workspaceId !== 'pitchboss') {
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
   * Resets data to initial demo team
   */
  public static resetDemoTeam(): TeamMember[] {
    this.saveTeamMembers(DEFAULT_DEMO_TEAM);
    return DEFAULT_DEMO_TEAM;
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
