# PersonaEnglish AI — Simulador de Inglés para Cualquier Nicho de Negocio (PWA)

Una Progressive Web App (PWA) de alto rendimiento diseñada para **hablar por horas en inglés especializado en cualquier industria o situación de negocio**, con enfoque estricto en el escenario asignado.

---

## 🚀 Características Principales

1. **Creador de Escenarios a Medida para Cualquier Nicho (1-Click AI Builder):**
   - Escribe en una sola frase lo que quieres simular (ej. *"Vender ciberseguridad a un hospital"* o *"Negociar fletes marítimos con un transitario escéptico"*).
   - La IA genera automáticamente el perfil del personaje, sus objeciones del sector, criterios de éxito y vocabulario técnico.

2. **Enfoque Estricto (*Persona Locking & Anti-Drift*):**
   - La IA se mantiene 100% en personaje. No actúa como chatbot genérico.
   - Si te desvías del tema, el interlocutor te reencauza de inmediato dentro del contexto del negocio.

3. **Modo Llamada Manos Libres (*Hands-Free Spoken Roleplay*):**
   - Pantalla completa de llamada con **Audio Visualizer reactivo en Canvas**.
   - Reconocimiento de voz nativo (Web Speech API) y síntesis de voz en inglés con control de cadencia y acentos.
   - Si te quedas bloqueado, pulsa **💡 Hint** para recibir 3 opciones profesionales en tiempo real.

4. **Corrección Gramatical y Vocabulario en Vivo:**
   - Detecta errores y te muestra sugerencias ejecutivas discretas sin cortar la conversación.

5. **Reporte de Rendimiento Ejecutivo al Colgar:**
   - Desglose de **Puntuación de Negocio** (0-100%) y **Fluidez en Inglés** (0-100%).
   - Checklist de objetivos completados.
   - Comparador de frases: *"Cómo lo dijiste"* vs *"Cómo lo diría un directivo nativo"*.

6. **PWA Instalable Multiplataforma:**
   - Service Worker y manifiesto configurados.
   - Funciona e instala en iPhone (iOS Safari), Android (Chrome) y Escritorio (PC/Mac).

---

## 🛠️ Cómo Iniciar el Proyecto

### 1. Iniciar el servidor de desarrollo
En la terminal, dentro de la carpeta del proyecto:
```bash
npm run dev
```
Abre la URL que indique Vite (normalmente `http://localhost:5173/`).

### 2. Configurar tu API Key de Gemini
Puedes ingresar tu clave de forma gratuita en:
1. Haz clic en el icono de **Ajustes (⚙️)** en la barra superior de la app.
2. Pega tu API Key de [Google AI Studio](https://aistudio.google.com/app/apikey).
3. *(Opcional)* También puedes definirla en un archivo `.env`:
   ```bash
   VITE_GEMINI_API_KEY=tu_clave_aqui
   ```
> **Nota:** La aplicación incluye un motor inteligente de demostración integrado para probar de inmediato las llamadas incluso antes de añadir la clave.

---

## 📱 Instalación como PWA en el Móvil

* **En Android (Chrome):** Pulsa los 3 puntos del navegador y selecciona **"Instalar aplicación"** o pulsa el botón *"Install PWA"* en la barra superior.
* **En iOS (iPhone / Safari):** Pulsa el botón de compartir de Safari (icono con flecha hacia arriba) y selecciona **"Añadir a la pantalla de inicio"**.

---

## 📁 Estructura del Código

```
├── public/                 # Iconos y manifiesto PWA
├── src/
│   ├── components/
│   │   ├── AudioVisualizer.tsx    # Ondas y orbe de voz reactivo en Canvas
│   │   ├── CallScreen.tsx         # Interfaz de llamada a pantalla completa
│   │   ├── Navbar.tsx             # Barra superior y botón de instalación PWA
│   │   ├── ScenarioCard.tsx       # Tarjetas de escenarios con métricas y tags
│   │   ├── ScenarioModal.tsx      # Creador de escenarios manual y 1-Click con IA
│   │   ├── SessionReportModal.tsx # Informe de rendimiento y evaluación al colgar
│   │   └── SettingsModal.tsx      # Ajustes de voz, velocidad y API Key
│   ├── data/
│   │   └── presetScenarios.ts     # Escenarios empresariales de alta fidelidad
│   ├── services/
│   │   ├── geminiService.ts       # Motor de conversación con guardrails y memoria
│   │   └── speechService.ts       # STT y TTS nativo con Web Speech API
│   ├── types/
│   │   └── index.ts               # Definiciones TypeScript
│   ├── App.tsx                    # Orquestador principal y catálogo de escenarios
│   └── main.tsx                   # Punto de entrada de la aplicación
```
