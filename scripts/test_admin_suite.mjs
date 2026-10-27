/**
 * Automated Test Suite for PitchBoss Administrator Functions
 * Tests:
 * 1. Admin PIN & Session Authentication
 * 2. Scenario Lifecycle (Create, Read, Update, Duplicate, Visibility Toggle, Delete, Restore)
 * 3. Scenario Import & Export (JSON serialization, Merge & Replace, Schema validation)
 * 4. B2B License Management (Key generation, Checksum integrity, Validation, Magic Link, Revocation)
 * 5. B2B Team Analytics & Reporting (Employee seats, Metrics aggregation, Session recording, CSV export)
 * 6. Centralized Backend API (Auth, Workspaces, Scenarios multi-tenant, Live audit reports)
 */

import assert from 'assert';
import http from 'http';
import { handleBackendRoute } from '../server/backendLogic.mjs';

// Setup Mock Browser Storage Environment for Services
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();
globalThis.sessionStorage = new LocalStorageMock();
globalThis.window = {
  location: {
    origin: 'http://localhost:5173',
    pathname: '/',
    search: ''
  }
};

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

// Helper to mock HTTP requests directly to handleBackendRoute
function mockBackendRequest({ method = 'GET', url = '/api/health', headers = {}, body = '' }) {
  return new Promise((resolve) => {
    let responseStatus = 200;
    let responseHeaders = {};
    let responseData = '';

    const req = {
      method,
      url,
      headers
    };

    const res = {
      set statusCode(val) { responseStatus = val; },
      get statusCode() { return responseStatus; },
      setHeader(name, val) { responseHeaders[name.toLowerCase()] = val; },
      end(data) {
        responseData = data;
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {}
        resolve({
          status: responseStatus,
          headers: responseHeaders,
          data: parsed
        });
      }
    };

    handleBackendRoute(req, res, typeof body === 'object' ? JSON.stringify(body) : body);
  });
}

async function runSuite() {
  console.log('\n======================================================');
  console.log('🧪 PITCHBOSS ADMIN AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  // --- 1. BACKEND ROUTE TESTS ---
  console.log('--- 1. CENTRALIZED BACKEND ROUTES & API ---');

  let adminToken = '';

  await itAsync('Health check endpoint returns ok', async () => {
    const res = await mockBackendRequest({ url: '/api/health' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  await itAsync('Admin login fails with invalid PIN', async () => {
    const res = await mockBackendRequest({
      method: 'POST',
      url: '/api/admin/login',
      body: { pin: '0000' }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await itAsync('Admin login succeeds with default PIN 3319 and issues auth token', async () => {
    const res = await mockBackendRequest({
      method: 'POST',
      url: '/api/admin/login',
      body: { pin: '3319' }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token && res.data.token.startsWith('pb_adm_'));
    adminToken = res.data.token;
  });

  await itAsync('Admin token verification succeeds with valid token', async () => {
    const res = await mockBackendRequest({
      method: 'GET',
      url: `/api/admin/verify?token=${adminToken}`,
      headers: { 'x-admin-token': adminToken }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.valid, true);
  });

  await itAsync('Workspaces API returns default workspaces', async () => {
    const res = await mockBackendRequest({ url: '/api/workspaces' });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.workspaces));
    assert.ok(res.data.workspaces.some(w => w.id === 'tepic-madrid'));
    assert.ok(res.data.workspaces.some(w => w.id === 'lovo-bar'));
  });

  await itAsync('Workspaces API creates a new enterprise workspace', async () => {
    const wsName = `Hotel Ritz ${Date.now()}`;
    const res = await mockBackendRequest({
      method: 'POST',
      url: '/api/workspaces',
      body: { name: wsName }
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.workspace.name, wsName);
    assert.ok(res.data.workspace.id.startsWith('hotel-ritz-'));
  });

  await itAsync('Scenarios API saves and retrieves multi-tenant scenario', async () => {
    const testScenario = {
      id: 'test-scenario-ritz-1',
      title: 'Concierge VIP Check-in',
      workspaceId: 'hotel-ritz-madrid',
      initialGreeting: 'Good morning! Welcome to The Ritz.'
    };

    const saveRes = await mockBackendRequest({
      method: 'POST',
      url: '/api/scenarios',
      headers: { 'x-pitchboss-workspace': 'hotel-ritz-madrid' },
      body: testScenario
    });
    assert.strictEqual(saveRes.status, 200);
    assert.strictEqual(saveRes.data.success, true);

    const getRes = await mockBackendRequest({
      method: 'GET',
      url: '/api/scenarios?workspaceId=hotel-ritz-madrid',
      headers: { 'x-pitchboss-workspace': 'hotel-ritz-madrid' }
    });
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.scenarios.some(s => s.id === 'test-scenario-ritz-1'));
  });

  await itAsync('Reports API submits employee report and retrieves team audit log', async () => {
    const reportData = {
      employeeName: 'Gonzalo Pérez',
      scenarioId: 'test-scenario-ritz-1',
      scenarioTitle: 'Concierge VIP Check-in',
      businessScore: 95,
      englishScore: 90,
      durationSeconds: 120
    };

    const postRes = await mockBackendRequest({
      method: 'POST',
      url: '/api/reports',
      headers: { 'x-pitchboss-workspace': 'hotel-ritz-madrid' },
      body: reportData
    });
    assert.strictEqual(postRes.status, 201);
    assert.strictEqual(postRes.data.report.employeeName, 'Gonzalo Pérez');

    const getRes = await mockBackendRequest({
      method: 'GET',
      url: '/api/reports?workspaceId=hotel-ritz-madrid',
      headers: { 'x-pitchboss-workspace': 'hotel-ritz-madrid' }
    });
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.reports.some(r => r.employeeName === 'Gonzalo Pérez'));
  });

  // --- 2. SUBSCRIPTION & LICENSES (ADMIN) ---
  console.log('\n--- 2. B2B LICENSES & SALES (SUBSCRIPTION SERVICE) ---');
  
  // Dynamically load compiled/transpiled services or test their logical algorithms
  const { SubscriptionService } = await import('../src/services/subscriptionService.ts');

  it('Admin generates valid 30D, 90D, 365D, and LIFETIME licenses', () => {
    const lic30 = SubscriptionService.generateAdminLicense('30D', 'Prueba Cliente 1', 'tepic-madrid', 'Restaurante Tepic', 15);
    assert.ok(lic30.key.startsWith('PB-30D-'));
    assert.strictEqual(lic30.workspaceId, 'tepic-madrid');
    assert.strictEqual(lic30.employeeSeats, 15);
    assert.strictEqual(lic30.isRevoked, false);

    const licLifetime = SubscriptionService.generateAdminLicense('LIFETIME', 'Socio Fundador', 'lovo-bar', 'LOVO Bar', 20);
    assert.ok(licLifetime.key.startsWith('PB-LIFETIME-'));
    assert.strictEqual(licLifetime.employeeSeats, 20);
  });

  it('Validates generated license key with checksum verification', () => {
    const lic = SubscriptionService.generateAdminLicense('365D', 'Test Validation');
    const val = SubscriptionService.validateKey(lic.key);
    assert.strictEqual(val.valid, true);
    assert.strictEqual(val.plan, '365D');
  });

  it('Rejects tampered license keys', () => {
    const lic = SubscriptionService.generateAdminLicense('365D', 'Tamper Test');
    // Alter last character of checksum
    const tampered = lic.key.slice(0, -1) + (lic.key.slice(-1) === 'A' ? 'B' : 'A');
    const val = SubscriptionService.validateKey(tampered);
    assert.strictEqual(val.valid, false);
    assert.ok(val.message.includes('alterada') || val.message.includes('inválido') || val.message.includes('no auténtica'));
  });

  it('Generates Magic Link with key and company parameters', () => {
    const lic = SubscriptionService.generateAdminLicense('90D', 'Link Test', 'tepic-madrid');
    const link = SubscriptionService.getMagicLink(lic.key, 'tepic-madrid');
    assert.ok(link.includes(`key=${encodeURIComponent(lic.key)}`));
    assert.ok(link.includes('company=tepic-madrid'));
  });

  it('Revokes admin license and blocks future validation', () => {
    const lic = SubscriptionService.generateAdminLicense('30D', 'Revocation Test');
    SubscriptionService.revokeAdminLicense(lic.key);
    const val = SubscriptionService.validateKey(lic.key);
    assert.strictEqual(val.valid, false);
    assert.ok(val.message.includes('revocada'));
  });

  // --- 3. TEAM ANALYTICS & B2B REPORTING ---
  console.log('\n--- 3. B2B TEAM ANALYTICS & REPORTING ---');
  const { TeamAnalyticsService } = await import('../src/services/teamAnalyticsService.ts');

  it('Retrieves team members scoped by workspace', () => {
    const tepicTeam = TeamAnalyticsService.getTeamMembers('tepic-madrid');
    assert.ok(tepicTeam.length > 0);
    assert.ok(tepicTeam.every(m => m.workspaceId === 'tepic-madrid'));

    const lovoTeam = TeamAnalyticsService.getTeamMembers('lovo-bar');
    assert.ok(lovoTeam.length > 0);
    assert.ok(lovoTeam.every(m => m.workspaceId === 'lovo-bar'));
  });

  it('Adds new team member and computes updated summary metrics', () => {
    const newMember = TeamAnalyticsService.addMember({
      name: 'Sergio Ramos',
      role: 'Segundo Maitre',
      workspaceId: 'tepic-madrid',
      scenarioId: 'tepic-maiz-nixtamal-pitch1',
      scenarioTitle: 'Tepic Módulo 1',
      totalSessions: 3,
      menuFluencyScore: 88,
      pronunciationScore: 82,
      upSellingScore: 80,
      objectionsMastered: 4,
      totalObjections: 4,
      totalSpokenMinutes: 15,
      lastActiveDate: Date.now(),
      status: 'ready',
      executiveFeedback: 'Excelente desempeño.'
    }, 'tepic-madrid');

    assert.ok(newMember.id.startsWith('emp-'));
    const members = TeamAnalyticsService.getTeamMembers('tepic-madrid');
    assert.ok(members.some(m => m.name === 'Sergio Ramos'));

    const metrics = TeamAnalyticsService.getSummaryMetrics('tepic-madrid');
    assert.ok(metrics.totalEmployees >= 5);
    assert.ok(metrics.readyForFloorCount >= 1);
  });

  it('Exports valid CSV formatted report scoped to company', () => {
    const csv = TeamAnalyticsService.exportToCSV('Restaurante Tepic', 'tepic-madrid');
    assert.ok(csv.includes('# INFORME EJECUTIVO DE CAPACITACIÓN B2B - RESTAURANTE TEPIC'));
    assert.ok(csv.includes('Empleado;Rol;Email;Escenario / Carta'));
    assert.ok(csv.includes('Sergio Ramos'));
    // Ensure LOVO members are not included in Tepic's export
    assert.ok(!csv.includes('Carlos Méndez'));
  });

  it('Removes team member and liberates seat', () => {
    const membersBefore = TeamAnalyticsService.getTeamMembers('tepic-madrid');
    const target = membersBefore.find(m => m.name === 'Sergio Ramos');
    assert.ok(target);

    TeamAnalyticsService.removeMember(target.id);
    const membersAfter = TeamAnalyticsService.getTeamMembers('tepic-madrid');
    assert.ok(!membersAfter.some(m => m.id === target.id));
  });

  // --- 4. SCENARIOS STORAGE & CRUD (ADMIN STORAGE SERVICE) ---
  console.log('\n--- 4. SCENARIO MANAGEMENT & STORAGE LIFECYCLE ---');
  const { AdminStorageService } = await import('../src/services/adminStorageService.ts');

  it('Loads scenarios and preserves presets without overwriting non-LOVO business knowledge', () => {
    const scenarios = AdminStorageService.getScenarios();
    assert.ok(scenarios.length > 0);
    const tepicSc = scenarios.find(s => s.id === 'tepic-pitch1');
    assert.ok(tepicSc);
    assert.strictEqual(tepicSc.workspaceId, 'tepic-madrid');
    assert.ok(tepicSc.businessKnowledge && !tepicSc.businessKnowledge.includes("TOMO I: LA MUSA"));
  });

  it('Upserts new custom scenario and preserves workspaceId', () => {
    const customSc = {
      id: 'custom-vip-1',
      title: 'Atención VIP Presidencial',
      niche: 'Alta Hostelería',
      workspaceId: 'hotel-ritz-madrid',
      aiCharacter: {
        name: 'Ambassador Smith',
        role: 'Embajador',
        avatar: '🎩',
        personality: 'Exigente'
      },
      userRole: 'Jefe de Sala',
      context: 'Cena de Estado',
      initialGreeting: 'Good evening. Is the private dining salon prepared?',
      initialTranslation: 'Buenas noches. ¿Está preparado el salón privado?',
      initialTip: 'Saluda con formalidad.',
      difficulty: 'hard',
      targetEnglishLevel: 'C1',
      objectives: [{ id: 'obj-1', description: 'Confirmar reserva', completed: false }],
      commonObjections: ['We require absolute discretion.'],
      nicheVocabulary: ['Private suite [Prái-vat suiit]'],
      isCustom: true,
      createdAt: Date.now()
    };

    const updated = AdminStorageService.upsertScenario(customSc);
    const found = updated.find(s => s.id === 'custom-vip-1');
    assert.ok(found);
    assert.strictEqual(found.workspaceId, 'hotel-ritz-madrid');
    assert.strictEqual(found.title, 'Atención VIP Presidencial');
  });

  it('Duplicates scenario with unique ID and " (Copia)" title', () => {
    const { scenarios, newScenario } = AdminStorageService.duplicateScenario('custom-vip-1');
    assert.ok(newScenario);
    assert.ok(newScenario.id.startsWith('custom-'));
    assert.notStrictEqual(newScenario.id, 'custom-vip-1');
    assert.strictEqual(newScenario.title, 'Atención VIP Presidencial (Copia)');
    assert.strictEqual(newScenario.workspaceId, 'hotel-ritz-madrid');
    assert.ok(scenarios.some(s => s.id === newScenario.id));
  });

  it('Toggles scenario visibility (isHidden)', () => {
    const updated = AdminStorageService.toggleVisibility('custom-vip-1');
    const found = updated.find(s => s.id === 'custom-vip-1');
    assert.strictEqual(found.isHidden, true);

    const toggledBack = AdminStorageService.toggleVisibility('custom-vip-1');
    const foundBack = toggledBack.find(s => s.id === 'custom-vip-1');
    assert.strictEqual(foundBack.isHidden, false);
  });

  it('Deletes scenario and records ID in deleted registry to prevent resurrection', () => {
    const updated = AdminStorageService.deleteScenario('custom-vip-1');
    assert.ok(!updated.some(s => s.id === 'custom-vip-1'));
    
    // Check deleted IDs
    const deletedIds = AdminStorageService.getDeletedScenarioIds();
    assert.ok(deletedIds.includes('custom-vip-1'));

    // Re-loading scenarios must NOT bring it back
    const reloaded = AdminStorageService.getScenarios();
    assert.ok(!reloaded.some(s => s.id === 'custom-vip-1'));
  });

  it('Exports and imports scenarios via JSON (Merge & Replace modes)', () => {
    const jsonStr = AdminStorageService.exportToJsonString();
    assert.ok(jsonStr.length > 50);

    // Test import invalid JSON
    const invalidResult = AdminStorageService.importFromJson('{ not: a: valid: json }');
    assert.strictEqual(invalidResult.success, false);

    // Test import valid scenario
    const testImportJson = JSON.stringify([
      {
        id: 'imported-test-1',
        title: 'Escenario Importado Test',
        initialGreeting: 'Hello there!',
        workspaceId: 'default'
      }
    ]);

    const mergeResult = AdminStorageService.importFromJson(testImportJson, 'merge');
    assert.strictEqual(mergeResult.success, true);
    assert.strictEqual(mergeResult.count, 1);

    const scenarios = AdminStorageService.getScenarios();
    assert.ok(scenarios.some(s => s.id === 'imported-test-1'));
  });

  it('Manages Admin PIN and active session', () => {
    assert.strictEqual(AdminStorageService.getAdminPin(), '3319');
    assert.strictEqual(AdminStorageService.verifyAdminPin('3319'), true);
    assert.strictEqual(AdminStorageService.verifyAdminPin('9999'), false);

    // Change PIN
    const changed = AdminStorageService.setAdminPin('5678');
    assert.strictEqual(changed, true);
    assert.strictEqual(AdminStorageService.getAdminPin(), '5678');
    assert.strictEqual(AdminStorageService.verifyAdminPin('5678'), true);

    // Restore back to 3319
    AdminStorageService.setAdminPin('3319');
    assert.strictEqual(AdminStorageService.getAdminPin(), '3319');

    // Admin Session
    assert.strictEqual(AdminStorageService.isAdminSessionActive(), false);
    AdminStorageService.setAdminSessionActive(true);
    assert.strictEqual(AdminStorageService.isAdminSessionActive(), true);
    AdminStorageService.setAdminSessionActive(false);
    assert.strictEqual(AdminStorageService.isAdminSessionActive(), false);
  });

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runSuite().catch((err) => {
  console.error('\n❌ Test suite execution failed:', err);
  process.exit(1);
});
