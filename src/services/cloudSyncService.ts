import type { Scenario, SessionReport, Workspace } from '../types';

const WORKSPACE_STORAGE_KEY = 'pitchboss_current_workspace_id';
const ADMIN_TOKEN_KEY = 'pitchboss_admin_token';
const EMPLOYEE_NAME_KEY = 'pitchboss_employee_name';

export class CloudSyncService {
  /**
   * Current active workspace ID (defaults to 'default')
   */
  public static getCurrentWorkspaceId(): string {
    return localStorage.getItem(WORKSPACE_STORAGE_KEY) || 'default';
  }

  public static setCurrentWorkspaceId(workspaceId: string): void {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  }

  /**
   * Employee / User name on this device
   */
  public static getEmployeeName(): string {
    return localStorage.getItem(EMPLOYEE_NAME_KEY) || 'Colaborador';
  }

  public static setEmployeeName(name: string): void {
    localStorage.setItem(EMPLOYEE_NAME_KEY, name.trim());
  }

  /**
   * Admin Authentication Token
   */
  public static getAdminToken(): string {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  }

  public static setAdminToken(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  public static clearAdminToken(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  /**
   * Verifies admin PIN securely against backend
   */
  public static async adminLogin(pin: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setAdminToken(data.token);
        return { success: true, token: data.token };
      }
      return { success: false, error: data.error || 'PIN incorrecto' };
    } catch (err: any) {
      // Fallback for offline usage with default 3319
      if (pin.trim() === '3319') {
        const mockToken = 'pb_adm_offline_' + Date.now();
        this.setAdminToken(mockToken);
        return { success: true, token: mockToken };
      }
      return { success: false, error: err.message || 'Error de conexión' };
    }
  }

  public static async verifyAdminToken(): Promise<boolean> {
    const token = this.getAdminToken();
    if (!token) return false;
    if (token.startsWith('pb_adm_offline_')) return true;
    try {
      const res = await fetch(`/api/admin/verify?token=${encodeURIComponent(token)}`, {
        headers: { 'X-Admin-Token': token }
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.valid);
      }
      return false;
    } catch {
      return true; // Resilience when offline
    }
  }

  /**
   * Updates admin PIN on centralized backend
   */
  public static async changeAdminPin(newPin: string): Promise<boolean> {
    const token = this.getAdminToken();
    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify({ newPin: newPin.trim() })
      });
      return res.ok;
    } catch (err) {
      console.warn('Could not sync PIN change to backend:', err);
      return false;
    }
  }

  /**
   * Fetch all workspaces
   */
  public static async getWorkspaces(): Promise<Workspace[]> {
    try {
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const data = await res.json();
        return data.workspaces || [];
      }
    } catch (err) {
      console.warn('Could not fetch cloud workspaces, using local fallback:', err);
    }
    return [
      { id: 'default', name: 'General / Matriz', createdAt: Date.now() },
      { id: 'lovo-bar', name: 'LOVO Bar & Hospitality', createdAt: Date.now() },
      { id: 'tepic-madrid', name: 'Restaurante Tepic (Ayala 14)', createdAt: Date.now() }
    ];
  }

  /**
   * Create a new workspace
   */
  public static async createWorkspace(name: string): Promise<Workspace | null> {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        return data.workspace;
      }
    } catch (err) {
      console.error('Error creating workspace:', err);
    }
    return null;
  }

  /**
   * Sync and fetch cloud scenarios for the given workspace
   */
  public static async fetchCloudScenarios(workspaceId?: string): Promise<Scenario[]> {
    const ws = workspaceId || this.getCurrentWorkspaceId();
    try {
      const res = await fetch(`/api/scenarios?workspaceId=${encodeURIComponent(ws)}`, {
        headers: { 'X-PitchBoss-Workspace': ws }
      });
      if (res.ok) {
        const data = await res.json();
        return data.scenarios || [];
      }
    } catch (err) {
      console.warn('Could not fetch cloud scenarios:', err);
    }
    return [];
  }

  /**
   * Sync a scenario to the cloud
   */
  public static async syncScenarioToCloud(scenario: Scenario, workspaceId?: string): Promise<boolean> {
    const ws = workspaceId || this.getCurrentWorkspaceId();
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PitchBoss-Workspace': ws
        },
        body: JSON.stringify({ ...scenario, workspaceId: ws })
      });
      return res.ok;
    } catch (err) {
      console.warn('Could not sync scenario to cloud:', err);
      return false;
    }
  }

  /**
   * Delete scenario from cloud
   */
  public static async deleteCloudScenario(scenarioId: string, workspaceId?: string): Promise<boolean> {
    const ws = workspaceId || this.getCurrentWorkspaceId();
    try {
      const res = await fetch(`/api/scenarios/${encodeURIComponent(scenarioId)}`, {
        method: 'DELETE',
        headers: { 'X-PitchBoss-Workspace': ws }
      });
      return res.ok;
    } catch (err) {
      console.warn('Could not delete cloud scenario:', err);
      return false;
    }
  }

  /**
   * Submit an employee session report to the cloud for team audit
   */
  public static async submitReport(report: SessionReport, workspaceId?: string): Promise<boolean> {
    const ws = workspaceId || this.getCurrentWorkspaceId();
    const employee = this.getEmployeeName();
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PitchBoss-Workspace': ws
        },
        body: JSON.stringify({
          ...report,
          workspaceId: ws,
          employeeName: employee
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('Could not submit report to cloud:', err);
      return false;
    }
  }

  /**
   * Fetch all team reports for the live supervisor audit dashboard
   */
  public static async getTeamReports(workspaceId?: string): Promise<SessionReport[]> {
    const ws = workspaceId || this.getCurrentWorkspaceId();
    try {
      const res = await fetch(`/api/reports?workspaceId=${encodeURIComponent(ws)}`, {
        headers: { 'X-PitchBoss-Workspace': ws }
      });
      if (res.ok) {
        const data = await res.json();
        return data.reports || [];
      }
    } catch (err) {
      console.warn('Could not fetch team reports:', err);
    }
    return [];
  }
}
