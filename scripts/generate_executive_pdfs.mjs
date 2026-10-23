import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectDir = 'C:/Desarrollos MDev/Ingles personalizado';
const publicDir = path.join(projectDir, 'public');
const artifactDir = 'C:/Users/snake/.gemini/antigravity/brain/b4db3e92-a66e-4ab8-9239-a2afc002ccbe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Helper to convert markdown text to rich executive HTML
function markdownToHtml(mdText, title, docTypeBadge, subtitle) {
  const lines = mdText.split('\n');
  let html = '';
  let inTable = false;
  let tableHeaderParsed = false;
  let tableRows = [];
  let inMermaid = false;
  let mermaidContent = '';
  let inList = false;
  let listType = ''; // 'ul' or 'ol'
  let inCallout = false;
  let calloutType = '';
  let calloutContent = [];

  const flushList = () => {
    if (inList) {
      html += listType === 'ul' ? '</ul>\n' : '</ol>\n';
      inList = false;
      listType = '';
    }
  };

  const flushCallout = () => {
    if (inCallout) {
      const typeClass = calloutType.toLowerCase();
      const icon = calloutType === 'NOTE' ? 'ℹ️ NOTA TÉCNICA' : calloutType === 'TIP' ? '💡 CONSEJO ESTRATÉGICO' : '⚠️ IMPORTANTE';
      const text = calloutContent.join(' ').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<div class="callout callout-${typeClass}">
        <div class="callout-header">${icon}</div>
        <div class="callout-body">${text}</div>
      </div>\n`;
      inCallout = false;
      calloutType = '';
      calloutContent = [];
    }
  };

  const flushTable = () => {
    if (inTable) {
      html += '<div class="table-container"><table>\n';
      if (tableRows.length > 0) {
        html += '<thead><tr>\n';
        tableRows[0].forEach(cell => {
          html += `<th>${cell.trim()}</th>\n`;
        });
        html += '</tr></thead>\n<tbody>\n';
        for (let i = 1; i < tableRows.length; i++) {
          html += '<tr>\n';
          tableRows[i].forEach((cell, idx) => {
            let formatted = cell.trim()
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>');
            const isNumeric = /^(\$|€|\+|\-|\d)/.test(formatted) || formatted.includes('%');
            html += `<td class="${isNumeric ? 'text-right' : ''}">${formatted}</td>\n`;
          });
          html += '</tr>\n';
        }
        html += '</tbody>\n';
      }
      html += '</table></div>\n';
      inTable = false;
      tableHeaderParsed = false;
      tableRows = [];
    }
  };

  const renderMermaidFallback = (content) => {
    // Check if it's the Flowchart for Render / PitchBoss
    if (content.includes('ClientLayer') || content.includes('RenderPlatform')) {
      return `
      <div class="diagram-box">
        <div class="diagram-title">Arquitectura de Servidor y Flujo de Audio / IA</div>
        <div class="arch-grid">
          <div class="arch-card client-card">
            <div class="arch-badge">CAPA CLIENTE (MÓVIL / PWA)</div>
            <div class="arch-name">📱 PitchBoss PWA</div>
            <p>React 19 + Service Worker offline. Audio Web Speech API en el navegador.</p>
          </div>
          <div class="arch-arrow">➔</div>
          <div class="arch-card render-card">
            <div class="arch-badge">RENDER.COM CLOUD</div>
            <div class="arch-name">⚡ Web Service Starter ($7/mes)</div>
            <p>Node.js Proxy seguro. Always-on 24/7. Oculta la clave secreta de Gemini.</p>
          </div>
          <div class="arch-arrow">➔</div>
          <div class="arch-card gemini-card">
            <div class="arch-badge">CEREBRO IA EXTERNO</div>
            <div class="arch-name">🧠 Google Gemini 2.5 Flash</div>
            <p>Inferencia conversacional, coaching fonético y análisis de ventas en <800ms.</p>
          </div>
        </div>
      </div>`;
    }

    if (content.includes('xychart-beta')) {
      return `
      <div class="diagram-box">
        <div class="diagram-title">Proyección de Ingresos Mensuales Recurrentes (MRR) a 12 Meses</div>
        <div class="chart-container">
          <div class="bar-col">
            <div class="bar-val">237 €</div>
            <div class="bar" style="height: 18px;"></div>
            <div class="bar-label">Mes 1<br><small>3 clientes</small></div>
          </div>
          <div class="bar-col">
            <div class="bar-val">1.190 €</div>
            <div class="bar" style="height: 45px;"></div>
            <div class="bar-label">Mes 3<br><small>10 clientes</small></div>
          </div>
          <div class="bar-col">
            <div class="bar-val">3.870 €</div>
            <div class="bar" style="height: 95px;"></div>
            <div class="bar-label">Mes 6<br><small>30 clientes</small></div>
          </div>
          <div class="bar-col">
            <div class="bar-val">8.685 €</div>
            <div class="bar" style="height: 160px;"></div>
            <div class="bar-label">Mes 9<br><small>65 clientes</small></div>
          </div>
          <div class="bar-col">
            <div class="bar-val highlight-val">16.380 €</div>
            <div class="bar highlight-bar" style="height: 240px;"></div>
            <div class="bar-label"><strong>Mes 12</strong><br><small>120 clientes</small></div>
          </div>
        </div>
        <div class="chart-footer">Coste técnico total estimado en Mes 12: <strong>~45 € / mes</strong>. Margen neto directo: <strong>97,5%</strong>.</div>
      </div>`;
    }

    if (content.includes('ROI del Cliente')) {
      return `
      <div class="diagram-box">
        <div class="diagram-title">Ecuación Económica del Retorno de Inversión (ROI) para el Restaurante</div>
        <div class="roi-flow">
          <div class="roi-step">
            <div class="roi-cost">Inversión: 149 €/mes</div>
            <div class="roi-desc">Plan Sala Pro (hasta 15 empleados)</div>
          </div>
          <div class="roi-arrow">+</div>
          <div class="roi-step">
            <div class="roi-gain">1 Cóctel Extra al Día</div>
            <div class="roi-desc">+12 € a 15 € por turno en up-selling</div>
          </div>
          <div class="roi-arrow">=</div>
          <div class="roi-step roi-winner">
            <div class="roi-result">+1.800 € / mes</div>
            <div class="roi-desc">Facturación adicional neta en sala</div>
          </div>
        </div>
      </div>`;
    }

    if (content.includes('Track1') || content.includes('Roadmap')) {
      return `
      <div class="diagram-box">
        <div class="diagram-title">Pilares de Lanzamiento al Mercado</div>
        <div class="tracks-grid">
          <div class="track-card">
            <div class="track-header">1. Infraestructura Cloud (~20€)</div>
            <ul>
              <li>Dominio pitchboss.es / .app</li>
              <li>Servidor Render Starter ($7/mes)</li>
              <li>Google Cloud AI billing</li>
            </ul>
          </div>
          <div class="track-card">
            <div class="track-header">2. Operativa B2B (0€)</div>
            <ul>
              <li>Stripe Billing para suscripciones</li>
              <li>Contrato de servicio de 1 página</li>
              <li>Dossier comercial para el dueño</li>
            </ul>
          </div>
          <div class="track-card">
            <div class="track-header">3. Captación In Situ</div>
            <ul>
              <li>Campaña 5 Clientes Faro (14 días)</li>
              <li>Demostración en barra con Tablet</li>
              <li>Caso de éxito LOVO Bar</li>
            </ul>
          </div>
        </div>
      </div>`;
    }

    if (content.includes('Director / Dueño') || content.includes('Pega la Carta')) {
      return `
      <div class="diagram-box">
        <div class="diagram-title">Ciclo Operativo PitchBoss Enterprise</div>
        <div class="arch-grid">
          <div class="arch-card">
            <div class="arch-badge">PASO 1: DIRECTOR</div>
            <div class="arch-name">Pega la Carta en 1 Clic</div>
            <p>Carga de menú y protocolos en 60 segundos.</p>
          </div>
          <div class="arch-arrow">➔</div>
          <div class="arch-card">
            <div class="arch-badge">PASO 2: EMPLEADOS</div>
            <div class="arch-name">Práctica de Voz 5 min</div>
            <p>Simulación con cliente extranjero y fonética.</p>
          </div>
          <div class="arch-arrow">➔</div>
          <div class="arch-card">
            <div class="arch-badge">PASO 3: RETORNO</div>
            <div class="arch-name">Panel del Director</div>
            <p>Métricas de ventas, soltura y asimilación.</p>
          </div>
        </div>
      </div>`;
    }

    return '';
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check Mermaid block
    if (line.startsWith('```mermaid')) {
      flushList();
      flushCallout();
      flushTable();
      inMermaid = true;
      mermaidContent = '';
      continue;
    }
    if (inMermaid) {
      if (line.startsWith('```')) {
        inMermaid = false;
        html += renderMermaidFallback(mermaidContent) + '\n';
        mermaidContent = '';
      } else {
        mermaidContent += rawLine + '\n';
      }
      continue;
    }

    // Callout handling
    if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || line.startsWith('> [!IMPORTANT]')) {
      flushList();
      flushCallout();
      flushTable();
      inCallout = true;
      calloutType = line.includes('NOTE') ? 'NOTE' : line.includes('TIP') ? 'TIP' : 'IMPORTANT';
      continue;
    }
    if (inCallout) {
      if (line.startsWith('>')) {
        calloutContent.push(line.replace(/^>\s*/, ''));
        continue;
      } else {
        flushCallout();
      }
    }

    // Skip empty lines
    if (line === '') {
      flushList();
      flushTable();
      continue;
    }

    // Skip table of contents in printed version or header metadata
    if (line.startsWith('> **Destinatarios:**') || line.startsWith('> **Documento Confidencial:**') || line.startsWith('> **Guía Oficial:')) {
      continue;
    }

    // Horizontal Rule
    if (line === '---') {
      flushList();
      flushCallout();
      flushTable();
      html += '<hr class="doc-divider" />\n';
      continue;
    }

    // Table Handling
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      flushCallout();
      const cells = line.split('|').slice(1, -1);
      // Check if separator line
      if (cells.every(c => c.trim().match(/^:?-+:?$/))) {
        tableHeaderParsed = true;
        continue;
      }
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Headings
    if (line.startsWith('# ')) {
      flushList();
      flushCallout();
      const hText = line.replace(/^#\s+/, '');
      html += `<h1 class="main-title">${hText}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      flushCallout();
      const hText = line.replace(/^##\s+/, '');
      html += `<h2 class="section-title">${hText}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      flushList();
      flushCallout();
      const hText = line.replace(/^###\s+/, '');
      html += `<h3 class="subsection-title">${hText}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      flushList();
      flushCallout();
      const hText = line.replace(/^####\s+/, '');
      html += `<h4 class="sub-subsection-title">${hText}</h4>\n`;
      continue;
    }

    // Lists
    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList || listType !== 'ul') {
        flushList();
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      const itemContent = line.replace(/^(\*|-)\s+/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      html += `<li>${itemContent}</li>\n`;
      continue;
    }

    if (line.match(/^\d+\.\s+/)) {
      if (!inList || listType !== 'ol') {
        flushList();
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      }
      const itemContent = line.replace(/^\d+\.\s+/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      html += `<li>${itemContent}</li>\n`;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      const bText = line.replace(/^>\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      html += `<blockquote>${bText}</blockquote>\n`;
      continue;
    }

    // Math block equation
    if (line.startsWith('$$') && line.endsWith('$$')) {
      flushList();
      const math = line.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');
      html += `<div class="math-box">${math}</div>\n`;
      continue;
    }

    // Normal paragraph
    flushList();
    const formattedPara = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    html += `<p>${formattedPara}</p>\n`;
  }

  flushList();
  flushCallout();
  flushTable();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 14mm 18mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1E293B;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    /* Executive Header */
    .doc-header {
      background: linear-gradient(135deg, #090D16 0%, #1E293B 100%);
      color: #FFFFFF;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #334155;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .doc-badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.15);
      color: #38BDF8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .doc-header h1 {
      margin: 6px 0 8px 0;
      font-size: 18pt;
      color: #F8FAFC;
      letter-spacing: -0.5px;
      line-height: 1.25;
    }

    .doc-subtitle {
      font-size: 9.5pt;
      color: #94A3B8;
      margin: 0;
    }

    .doc-meta {
      display: flex;
      gap: 16px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 8.5pt;
      color: #CBD5E1;
    }

    .doc-meta span strong {
      color: #38BDF8;
    }

    /* Titles */
    h1.main-title {
      display: none; /* Already in banner */
    }

    h2.section-title {
      font-size: 13pt;
      color: #0F172A;
      margin-top: 24px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 2px solid #E2E8F0;
      letter-spacing: -0.3px;
      page-break-after: avoid;
    }

    h3.subsection-title {
      font-size: 11pt;
      color: #0284C7;
      margin-top: 16px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    h4.sub-subsection-title {
      font-size: 10pt;
      color: #334155;
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }

    strong {
      color: #0F172A;
    }

    code {
      background: #F1F5F9;
      color: #0284C7;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 9pt;
      border: 1px solid #E2E8F0;
      font-family: Consolas, Monaco, monospace;
    }

    hr.doc-divider {
      border: none;
      border-top: 1px solid #E2E8F0;
      margin: 20px 0;
    }

    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 22px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Tables */
    .table-container {
      margin: 14px 0 18px 0;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      overflow: hidden;
    }

    th {
      background: #F1F5F9;
      color: #0F172A;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #CBD5E1;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    td {
      padding: 7px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: middle;
    }

    tr:nth-child(even) td {
      background: #F8FAFC;
    }

    .text-right {
      text-align: right;
      font-weight: 600;
    }

    /* Callout Boxes */
    .callout {
      border-radius: 8px;
      padding: 12px 14px;
      margin: 14px 0;
      page-break-inside: avoid;
      font-size: 9.5pt;
    }

    .callout-header {
      font-weight: 700;
      font-size: 9pt;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .callout-note {
      background: #F0F9FF;
      border-left: 4px solid #0284C7;
      color: #0369A1;
    }
    .callout-note .callout-header { color: #0284C7; }

    .callout-tip {
      background: #F0FDF4;
      border-left: 4px solid #10B981;
      color: #166534;
    }
    .callout-tip .callout-header { color: #10B981; }

    .callout-important {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      color: #92400E;
    }
    .callout-important .callout-header { color: #D97706; }

    /* Diagram Styling */
    .diagram-box {
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 10px;
      padding: 16px;
      margin: 18px 0;
      page-break-inside: avoid;
    }

    .diagram-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      text-align: center;
    }

    .arch-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .arch-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 12px;
      flex: 1;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .arch-badge {
      font-size: 7pt;
      font-weight: 700;
      color: #0284C7;
      background: #E0F2FE;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .arch-name {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 4px;
    }

    .arch-card p {
      font-size: 8pt;
      color: #64748B;
      margin: 0;
      text-align: center;
    }

    .arch-arrow {
      font-size: 14pt;
      color: #94A3B8;
      font-weight: bold;
    }

    /* Bar Chart for MRR */
    .chart-container {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 270px;
      padding: 20px 10px 10px 10px;
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }

    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      width: 75px;
    }

    .bar-val {
      font-size: 8.5pt;
      font-weight: 700;
      color: #334155;
      margin-bottom: 6px;
    }

    .highlight-val {
      color: #0284C7;
      font-size: 10pt;
    }

    .bar {
      width: 44px;
      background: #94A3B8;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
    }

    .highlight-bar {
      background: linear-gradient(180deg, #38BDF8 0%, #0284C7 100%);
    }

    .bar-label {
      font-size: 8pt;
      color: #64748B;
      text-align: center;
      margin-top: 8px;
      line-height: 1.2;
    }

    .chart-footer {
      font-size: 8.5pt;
      color: #64748B;
      margin-top: 10px;
      text-align: center;
    }

    /* ROI Flow */
    .roi-flow {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 10px;
      margin-top: 8px;
    }

    .roi-step {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px;
      flex: 1;
      text-align: center;
    }

    .roi-cost {
      font-size: 10.5pt;
      font-weight: 700;
      color: #DC2626;
    }

    .roi-gain {
      font-size: 10.5pt;
      font-weight: 700;
      color: #D97706;
    }

    .roi-winner {
      background: #F0FDF4;
      border: 1px solid #86EFAC;
    }

    .roi-result {
      font-size: 13pt;
      font-weight: 800;
      color: #16A34A;
    }

    .roi-desc {
      font-size: 8pt;
      color: #64748B;
      margin-top: 4px;
    }

    .roi-arrow {
      font-size: 16pt;
      font-weight: bold;
      color: #94A3B8;
    }

    /* Tracks Grid */
    .tracks-grid {
      display: flex;
      gap: 10px;
    }

    .track-card {
      flex: 1;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px;
    }

    .track-header {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0284C7;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #F1F5F9;
    }

    .track-card ul {
      padding-left: 16px;
      margin: 0;
      font-size: 8pt;
      color: #475569;
    }

    /* Footer Branding */
    .footer-bar {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-badge">${docTypeBadge}</div>
    <h1>${title}</h1>
    <p class="doc-subtitle">${subtitle}</p>
    <div class="doc-meta">
      <span>Fecha: <strong>Octubre 2026</strong></span>
      <span>Versión: <strong>1.0 Producción</strong></span>
      <span>Plataforma: <strong>PitchBoss Enterprise PWA</strong></span>
      <span>Cloud Host: <strong>dashboard.render.com</strong></span>
    </div>
  </div>

  ${html}

  <div class="footer-bar">
    <span>PitchBoss Enterprise © 2026 — Documentación Confidencial para Socios</span>
    <span>https://pitchboss.onrender.com</span>
  </div>
</body>
</html>`;
}

// 1. Generate HTML for INFORME_SERVIDORES_Y_COSTOS_RENDER
const serverMdPath = path.join(projectDir, 'INFORME_SERVIDORES_Y_COSTOS_RENDER.md');
const serverMd = fs.readFileSync(serverMdPath, 'utf8');
const serverHtml = markdownToHtml(
  serverMd,
  'Informe de Infraestructura de Servidores y Costes en Render',
  'INFRAESTRUCTURA TÉCNICA CLOUD & PRESUPUESTO',
  'Análisis pormenorizado de servidores, arquitectura lean, consumo de IA Gemini y costes operativos'
);
const serverHtmlPath = path.join(projectDir, 'INFORME_SERVIDORES_Y_COSTOS_RENDER.html');
fs.writeFileSync(serverHtmlPath, serverHtml, 'utf8');
console.log('✅ Generado HTML para Servidores y Costes');

// 2. Generate HTML for DOSSIER_SOCIO_LANZAMIENTO_Y_ROI
const dossierMdPath = path.join(projectDir, 'DOSSIER_SOCIO_LANZAMIENTO_Y_ROI.md');
const dossierMd = fs.readFileSync(dossierMdPath, 'utf8');
const dossierHtml = markdownToHtml(
  dossierMd,
  'Dossier Estratégico para Socios: Solución, Lanzamiento y ROI',
  'DOSSIER ESTRATÉGICO CONFIDENCIAL PARA SOCIOS',
  'Qué hace la solución, por qué supera a la competencia, plan de lanzamiento a 15 días y modelo financiero con ROI'
);
const dossierHtmlPath = path.join(projectDir, 'DOSSIER_SOCIO_LANZAMIENTO_Y_ROI.html');
fs.writeFileSync(dossierHtmlPath, dossierHtml, 'utf8');
console.log('✅ Generado HTML para Dossier del Socio');

// 3. Compile PDFs via Edge Headless
const serverPdfName = 'INFORME_SERVIDORES_Y_COSTOS_RENDER.pdf';
const dossierPdfName = 'DOSSIER_SOCIO_LANZAMIENTO_Y_ROI.pdf';

const serverPdfProject = path.join(projectDir, serverPdfName);
const dossierPdfProject = path.join(projectDir, dossierPdfName);

console.log('⏳ Imprimiendo PDF 1 (Servidores y Costes)...');
execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${serverPdfProject}" "${serverHtmlPath}"`);
console.log(`✅ PDF 1 creado: ${serverPdfProject}`);

console.log('⏳ Imprimiendo PDF 2 (Dossier para el Socio)...');
execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${dossierPdfProject}" "${dossierHtmlPath}"`);
console.log(`✅ PDF 2 creado: ${dossierPdfProject}`);

// 4. Distribute PDFs to public/ and artifacts directory
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.copyFileSync(serverPdfProject, path.join(publicDir, serverPdfName));
fs.copyFileSync(dossierPdfProject, path.join(publicDir, dossierPdfName));
console.log('✅ PDFs copiados a public/ para descarga web');

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}
fs.copyFileSync(serverPdfProject, path.join(artifactDir, serverPdfName));
fs.copyFileSync(dossierPdfProject, path.join(artifactDir, dossierPdfName));
console.log('✅ PDFs copiados al directorio de artefactos');

console.log('🎉 Todos los PDFs se han generado y distribuido exitosamente.');
