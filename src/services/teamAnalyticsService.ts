export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
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

const STORAGE_KEY = 'pitchboss_b2b_team_analytics_v1';

const DEFAULT_DEMO_TEAM: TeamMember[] = [
  {
    id: 'emp-1',
    name: 'Carlos Méndez',
    role: 'Bartender Principal',
    email: 'carlos.bar@lovobar.com',
    scenarioId: 'lovo-bar-staff-hospitality',
    scenarioTitle: 'Coctelería LOVO Bar - Madrid',
    totalSessions: 5,
    menuFluencyScore: 85,
    pronunciationScore: 88,
    upSellingScore: 82,
    objectionsMastered: 4,
    totalObjections: 4,
    totalSpokenMinutes: 28,
    lastActiveDate: Date.now() - 1000 * 60 * 45, // Hace 45 min
    status: 'ready',
    executiveFeedback: 'Tu empleado Carlos ha completado 5 sesiones de LOVO Bar y tiene un 85% de fluidez en la carta. Ha dominado las recomendaciones de los cócteles Bubi y Manabi y la política de cuenta no dividida.'
  },
  {
    id: 'emp-2',
    name: 'Elena Gómez',
    role: 'Camarera de Sala & Coctelería',
    email: 'elena.g@lovobar.com',
    scenarioId: 'lovo-bar-staff-hospitality',
    scenarioTitle: 'Coctelería LOVO Bar - Madrid',
    totalSessions: 4,
    menuFluencyScore: 90,
    pronunciationScore: 92,
    upSellingScore: 88,
    objectionsMastered: 4,
    totalObjections: 4,
    totalSpokenMinutes: 22,
    lastActiveDate: Date.now() - 1000 * 60 * 180, // Hace 3 horas
    status: 'ready',
    executiveFeedback: 'Excelente desempeño en el protocolo de bienvenida de 40 segundos y narración del storytelling de Joséphine Baker.'
  },
  {
    id: 'emp-3',
    name: 'Marcos Varela',
    role: 'Bartender Junior',
    email: 'marcos.v@lovobar.com',
    scenarioId: 'lovo-bar-staff-hospitality',
    scenarioTitle: 'Coctelería LOVO Bar - Madrid',
    totalSessions: 2,
    menuFluencyScore: 65,
    pronunciationScore: 70,
    upSellingScore: 55,
    objectionsMastered: 2,
    totalObjections: 4,
    totalSpokenMinutes: 12,
    lastActiveDate: Date.now() - 1000 * 60 * 60 * 24, // Ayer
    status: 'in_progress',
    executiveFeedback: 'Buena base. Debe reforzar el ofrecimiento de destilados premium (Bourbon/Rye) en la 2ª ronda según el protocolo.'
  },
  {
    id: 'emp-4',
    name: 'Sofía Ramos',
    role: 'Hostess / Bienvenida',
    email: 'sofia.r@lovobar.com',
    scenarioId: 'lovo-bar-staff-hospitality',
    scenarioTitle: 'Coctelería LOVO Bar - Madrid',
    totalSessions: 1,
    menuFluencyScore: 52,
    pronunciationScore: 60,
    upSellingScore: 45,
    objectionsMastered: 1,
    totalObjections: 4,
    totalSpokenMinutes: 6,
    lastActiveDate: Date.now() - 1000 * 60 * 60 * 48, // Hace 2 días
    status: 'needs_practice',
    executiveFeedback: 'Requiere más práctica en frases de recepción en barra y oferta de agua de cortesía antes del próximo servicio.'
  }
];

export class TeamAnalyticsService {
  /**
   * Retrieves all team members, initializing with demo data if empty
   */
  public static getTeamMembers(): TeamMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading team analytics:', e);
    }

    // Default initialization
    this.saveTeamMembers(DEFAULT_DEMO_TEAM);
    return DEFAULT_DEMO_TEAM;
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
   * Adds a new team member
   */
  public static addMember(member: Omit<TeamMember, 'id'>): TeamMember {
    const members = this.getTeamMembers();
    const newMember: TeamMember = {
      ...member,
      id: `emp-${Date.now()}`
    };
    members.push(newMember);
    this.saveTeamMembers(members);
    return newMember;
  }

  /**
   * Deletes a team member
   */
  public static removeMember(id: string): void {
    const members = this.getTeamMembers().filter((m) => m.id !== id);
    this.saveTeamMembers(members);
  }

  /**
   * Updates an existing member
   */
  public static updateMember(member: TeamMember): void {
    const members = this.getTeamMembers().map((m) => (m.id === member.id ? member : m));
    this.saveTeamMembers(members);
  }

  /**
   * Resets data to initial demo team
   */
  public static resetDemoTeam(): TeamMember[] {
    this.saveTeamMembers(DEFAULT_DEMO_TEAM);
    return DEFAULT_DEMO_TEAM;
  }

  /**
   * Generates summary statistics for the Director dashboard
   */
  public static getSummaryMetrics(): {
    totalEmployees: number;
    totalSessions: number;
    avgFluency: number;
    avgPronunciation: number;
    totalSpokenMinutes: number;
    readyForFloorCount: number;
  } {
    const members = this.getTeamMembers();
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
   * Exports team report as a clean CSV string
   */
  public static exportToCSV(companyName = 'LOVO Bar Madrid'): string {
    const members = this.getTeamMembers();
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
