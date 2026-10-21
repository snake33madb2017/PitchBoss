import type { Scenario, Message, SessionReport } from '../types';

export class GeminiService {
  private static getModel(): string {
    try {
      const saved = localStorage.getItem('persona_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.model && typeof parsed.model === 'string' && parsed.model.trim().length > 0) {
          return parsed.model.trim();
        }
      }
    } catch {}
    return 'gemini-2.5-flash';
  }

  private static getApiKey(): string {
    const fromStorage = localStorage.getItem('persona_gemini_api_key');
    if (fromStorage && fromStorage.trim().length > 0) {
      return fromStorage.trim();
    }
    // Also check Vite env variable if provided
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  public static hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('persona_gemini_api_key', key.trim());
  }

  /**
   * Generates a complete scenario from a simple user description in any business niche
   */
  public static async generateScenarioFromPrompt(prompt: string): Promise<Partial<Scenario>> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return this.mockGenerateScenario(prompt);
    }

    const systemPrompt = `You are an expert executive coach and roleplay curriculum designer. 
Convert the user's prompt into a high-stakes, realistic English professional roleplay scenario.
Respond strictly in valid JSON matching this schema:
{
  "title": "Short punchy scenario title",
  "niche": "Industry / Niche name",
  "aiCharacter": {
    "name": "Character full name",
    "role": "Job title and company",
    "avatar": "Single representative emoji",
    "personality": "Behavior, tone, skepticism level",
    "voiceGender": "male" or "female"
  },
  "userRole": "Specific professional role the user plays",
  "context": "Clear 2-sentence background setup of the situation",
  "initialGreeting": "The character's first realistic opening spoken line in English (1-2 sentences)",
  "initialTranslation": "Spanish translation of the greeting",
  "initialTip": "Friendly coaching tip in Spanish with phonetic pronunciation in brackets [like this]",
  "difficulty": "easy" | "medium" | "hard" | "hostile",
  "targetEnglishLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "objectives": [
    {"id": "obj-1", "description": "Specific business goal 1", "completed": false},
    {"id": "obj-2", "description": "Specific business goal 2", "completed": false},
    {"id": "obj-3", "description": "Specific business goal 3", "completed": false}
  ],
  "commonObjections": ["Objection 1", "Objection 2", "Objection 3"],
  "nicheVocabulary": ["Term 1", "Term 2", "Term 3", "Term 4", "Term 5"]
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUser request: "${prompt}". Return ONLY raw JSON without markdown codeblocks.` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      return {
        ...parsed,
        id: 'custom-' + Date.now(),
        isCustom: true,
        createdAt: Date.now()
      };
    } catch (err) {
      console.warn('AI Generation failed, falling back to dynamic template:', err);
      return this.mockGenerateScenario(prompt);
    }
  }

  /**
   * Main conversational turn:
   * Dynamically adapts to ANY business niche, role, objectives, and CEFR English Level.
   * Keeps replies concise for natural spoken dialogue (1-2 sentences).
   * Extracts grammar corrections and tracks completed objectives.
   */
  public static async sendTurn({
    scenario,
    conversationHistory,
    userMessageText
  }: {
    scenario: Scenario;
    conversationHistory: Message[];
    userMessageText: string;
  }): Promise<{
    reply: string;
    translation?: string;
    tip?: string;
    corrections?: { originalText: string; improvedText: string; explanation: string }[];
    completedObjectiveIds?: string[];
  }> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return this.mockSendTurn(scenario, userMessageText, conversationHistory);
    }

    const pendingObjectives = scenario.objectives.filter((o) => !o.completed);
    const recentMessages = conversationHistory.slice(-10);

    const isBeginner = scenario.targetEnglishLevel === 'A1' || scenario.targetEnglishLevel === 'A2';
    const isIntermediate = scenario.targetEnglishLevel === 'B1' || scenario.targetEnglishLevel === 'B2';

    const systemInstructions = `
CRITICAL DIRECTIVE: You are an expert Bilingual AI Language Coach and Professional Business Roleplay Partner.
You are strictly roleplaying as:
- Name: ${scenario.aiCharacter.name}
- Role & Organization: ${scenario.aiCharacter.role}
- Personality & Demeanor: ${scenario.aiCharacter.personality}
- Industry / Business Niche: ${scenario.niche}
- Scenario Context: ${scenario.context}
- Target CEFR Level: ${scenario.targetEnglishLevel}
- Difficulty: ${scenario.difficulty}

The user is playing the professional role of: "${scenario.userRole}".

Common business objections in this situation:
${scenario.commonObjections.map((o) => `- ${o}`).join('\n')}

Specialized industry vocabulary to practice:
${scenario.nicheVocabulary.map((v) => `- ${v}`).join('\n')}

Pending Business Objectives to achieve:
${pendingObjectives.map((o) => `- [${o.id}] ${o.description}`).join('\n')}

ROLEPLAY & ADAPTATION RULES:
1. Stay 100% in character as ${scenario.aiCharacter.name}. Do NOT break character or act as an external chatbot.
2. The user is ALREADY playing the role of ${scenario.userRole}. Never ask them to choose a role or ask if they are ready. Engage them directly in the dialogue.
3. Keep spoken replies concise and natural for audio playback (1 to 2 spoken sentences maximum).
4. CEFR Level Guidance:
   ${
     isBeginner
       ? '- The user is at Beginner level (' + scenario.targetEnglishLevel + '). Speak in short, clear, accessible English. The "tip" field MUST be friendly in Spanish, coaching the user on what phrase to say next in English with a phonetic pronunciation guide in brackets [e.g. Di: "Good morning, welcome!" [Gud mór-ning, uél-cam!]].'
       : isIntermediate
       ? '- The user is at Intermediate level (' + scenario.targetEnglishLevel + '). Speak naturally as a business professional with realistic objections. The "tip" field should be in Spanish with strategic business phrasing.'
       : '- The user is at Advanced Executive level (' + scenario.targetEnglishLevel + '). Challenge claims with rigor, evaluate ROI and risk, and speak in native executive English.'
   }
5. Check if the user's latest response fulfilled any of the pending objectives listed above. If so, include their IDs in "completedObjectiveIds".
6. Detect any notable English grammar, pronunciation or vocabulary mistakes and provide discrete suggestions in "corrections".

STRICT OUTPUT FORMAT:
You MUST respond strictly in valid JSON matching this schema:
{
  "reply": "Spoken character dialogue in English",
  "translation": "Spanish translation of your spoken reply",
  "tip": "Coaching tip in Spanish advising the user what to reply next in English${isBeginner ? ' with phonetic pronunciation guide in brackets' : ''}",
  "corrections": [
    {
      "originalText": "Mistake or Spanish phrase the user said",
      "improvedText": "${isBeginner ? 'Easy English phrase with Spanish pronunciation guide in brackets' : 'More professional native business phrasing'}",
      "explanation": "Brief explanation in Spanish to help the user remember"
    }
  ],
  "completedObjectiveIds": ["obj-id-fulfilled"]
}
If the user made no significant mistakes, leave "corrections" as an empty array [].
`;

    // Format contents alternating user and model roles, starting with user
    const formattedContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    formattedContents.push({
      role: 'user',
      parts: [{ text: `Hello, let's start the simulation for ${scenario.title}. I am ready in my role as ${scenario.userRole}.` }]
    });

    for (const m of recentMessages) {
      const role = m.sender === 'user' ? 'user' : 'model';
      const last = formattedContents[formattedContents.length - 1];
      if (last && last.role === role) {
        last.parts.push({ text: m.text });
      } else {
        formattedContents.push({
          role,
          parts: [{ text: m.text }]
        });
      }
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstructions }]
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.6,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini turn error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);

      return {
        reply: parsed.reply || "Thank you. Let's proceed with our meeting.",
        translation: parsed.translation || '',
        tip: parsed.tip || '',
        corrections: parsed.corrections || [],
        completedObjectiveIds: parsed.completedObjectiveIds || []
      };
    } catch (err) {
      console.error('Gemini turn error, using intelligent fallback:', err);
      return this.mockSendTurn(scenario, userMessageText, conversationHistory);
    }
  }

  /**
   * Generates live suggestions/hints when the user is stuck during a call
   */
  public static async getLiveHints(scenario: Scenario, conversationHistory: Message[]): Promise<string[]> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return this.getMockHints(scenario);
    }

    const lastAiMessage =
      [...conversationHistory].reverse().find((m) => m.sender === 'ai')?.text || scenario.initialGreeting;

    const isBeginner = scenario.targetEnglishLevel === 'A1' || scenario.targetEnglishLevel === 'A2';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `The user is practicing spoken English in this scenario:
Scenario: ${scenario.title} (${scenario.niche})
User role: ${scenario.userRole}
Level: ${scenario.targetEnglishLevel}
AI Character last said: "${lastAiMessage}"
Vocabulary to practice: ${scenario.nicheVocabulary.slice(0, 5).join(', ')}

Provide 3 short, easy, natural spoken English sentences suitable for a ${scenario.userRole}${
                      isBeginner ? ' including Spanish phonetic pronunciation in brackets like [Jáu can ai jelp iu?]' : ''
                    } that the user could say right now to reply.
Respond strictly in JSON array of strings: ["suggestion 1", "suggestion 2", "suggestion 3"]`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      );

      const data = await response.json();
      const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : this.getMockHints(scenario);
    } catch {
      return this.getMockHints(scenario);
    }
  }

  private static getMockHints(scenario: Scenario): string[] {
    const isLovo = scenario.id.includes('lovo') || scenario.niche.includes('Coctelería') || scenario.niche.includes('LOVO');
    const isAdmin = scenario.id.includes('admin') || scenario.niche.includes('Administración') || scenario.niche.includes('Office');

    if (isLovo) {
      return [
        'Welcome to LOVO Bar! Table for two or at the bar? [Uél-cam tu Lovo Bar! Téibol or bar?]',
        'I recommend our signature Bubi or Manabi cocktail. [Ai re-co-ménd de Bu-bi or Ma-na-bi cóc-teil]',
        'The restrooms are downstairs. Would you like to pay with card or cash? [Rest-rums ar daun-stérs]'
      ];
    }

    if (isAdmin) {
      return [
        'Good morning, welcome! May I see your ID, please? [Gud mór-ning, uél-cam! Méi ai sii iur ai-dii?]',
        'Meeting room B is on the second floor, down the hall to the right. [Míiting rum bii is on de sé-cond flor]',
        'I will log the parcel and notify the department right away. [Ai uil log de pár-sel]'
      ];
    }

    // Dynamic hints from scenario vocabulary
    if (scenario.nicheVocabulary && scenario.nicheVocabulary.length >= 3) {
      return [
        `Regarding our ${scenario.nicheVocabulary[0]}, let me walk you through our solution.`,
        `We prioritize your ${scenario.nicheVocabulary[1]} with guaranteed timelines.`,
        `Let's schedule a dedicated follow-up to address ${scenario.nicheVocabulary[2]}.`
      ];
    }

    return [
      'Could you clarify the specific ROI and metrics we are discussing?',
      'I understand your concern about costs, but consider the long-term efficiency gains.',
      'Let us schedule a dedicated follow-up meeting with your technical team.'
    ];
  }

  /**
   * Generates a comprehensive final evaluation after finishing a session
   */
  public static async generateSessionReport({
    scenario,
    conversationHistory,
    durationSeconds
  }: {
    scenario: Scenario;
    conversationHistory: Message[];
    durationSeconds: number;
  }): Promise<SessionReport> {
    const apiKey = this.getApiKey();
    const completedObj = scenario.objectives.filter((o) => o.completed).map((o) => o.description);
    const pendingObj = scenario.objectives.filter((o) => !o.completed).map((o) => o.description);

    if (!apiKey || conversationHistory.length < 3) {
      return this.mockGenerateReport(scenario, conversationHistory, durationSeconds, completedObj, pendingObj);
    }

    try {
      const transcript = conversationHistory.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

      const prompt = `
Analyze this business English roleplay session:
Scenario: ${scenario.title} (${scenario.niche})
User Role: ${scenario.userRole}
AI Character: ${scenario.aiCharacter.name} (${scenario.aiCharacter.role})
Target Level: ${scenario.targetEnglishLevel}
Duration: ${Math.round(durationSeconds / 60)} minutes

Transcript:
${transcript}

Provide an executive performance review in JSON with this structure:
{
  "businessScore": 0-100,
  "englishScore": 0-100,
  "executiveSummary": "Concise 2-3 sentence overview of the conversation in Spanish",
  "keyStrengths": ["Strength 1 in Spanish", "Strength 2 in Spanish", "Strength 3 in Spanish"],
  "areasForImprovement": ["Improvement 1 in Spanish", "Improvement 2 in Spanish", "Improvement 3 in Spanish"],
  "vocabularyUsed": ["term1", "term2"],
  "suggestedPhrases": [
    {
      "original": "Actual phrase the user said or weak phrasing",
      "better": "High-impact native executive English alternative",
      "reason": "Why this conveys more authority or precision in Spanish"
    }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      const data = await response.json();
      const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);

      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        durationSeconds,
        totalMessages: conversationHistory.length,
        completedObjectives: completedObj,
        pendingObjectives: pendingObj,
        businessScore: parsed.businessScore || 80,
        englishScore: parsed.englishScore || 85,
        executiveSummary: parsed.executiveSummary || 'Buena práctica de simulación en este entorno de negocio.',
        keyStrengths: parsed.keyStrengths || ['Tono profesional adecuado', 'Interacción fluida con el interlocutor'],
        areasForImprovement: parsed.areasForImprovement || ['Ampliar vocabulario técnico del sector', 'Mayor asertividad al rebatir objeciones'],
        vocabularyUsed: parsed.vocabularyUsed || scenario.nicheVocabulary.slice(0, 2),
        suggestedPhrases: parsed.suggestedPhrases || []
      };
    } catch {
      return this.mockGenerateReport(scenario, conversationHistory, durationSeconds, completedObj, pendingObj);
    }
  }

  private static mockGenerateReport(
    scenario: Scenario,
    conversationHistory: Message[],
    durationSeconds: number,
    completedObj: string[],
    pendingObj: string[]
  ): SessionReport {
    const isLovo = scenario.id.includes('lovo') || scenario.niche.includes('Coctelería') || scenario.niche.includes('LOVO');
    const isAdmin = scenario.id.includes('admin') || scenario.niche.includes('Administración') || scenario.niche.includes('Office');

    if (isLovo) {
      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        durationSeconds,
        totalMessages: conversationHistory.length,
        completedObjectives: completedObj,
        pendingObjectives: pendingObj,
        businessScore: Math.min(100, Math.max(75, completedObj.length * 20 + 20)),
        englishScore: 88,
        executiveSummary:
          'Excelente práctica de servicio y hospitalidad en LOVO Bar. Lograste atender a clientes angloparlantes usando frases claras de nivel A1 para ubicar clientes, sugerir cócteles y gestionar el cobro.',
        keyStrengths: [
          'Atención al cliente amable, rápida y directa',
          'Buena recomendación de la carta de cócteles (Bubi, Manabi, opciones 0,0)',
          'Dominio de frases clave de supervivencia para sala, barra y cobro'
        ],
        areasForImprovement: [
          'Recordar ofrecer la carta de placeres (Iberian Ham & Cheese Board) para aumentar el ticket medio',
          'Pronunciar con naturalidad "Table or bar?" [Téibol or bar?]',
          'Despedir siempre con una sonrisa diciendo "Have a great night!"'
        ],
        vocabularyUsed: scenario.nicheVocabulary.slice(0, 4),
        suggestedPhrases: [
          {
            original: 'Mesa o barra',
            better: 'Table or bar, please? [Téibol or bar, plis?]',
            reason: 'Frase corta y educada para recepcionistas y camareros de LOVO Bar.'
          },
          {
            original: 'El baño está abajo',
            better: 'Restrooms are downstairs [Rest-rums ar daun-stérs]',
            reason: 'Instrucción universal y fácil de pronunciar para sala y barra.'
          }
        ]
      };
    }

    if (isAdmin) {
      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        durationSeconds,
        totalMessages: conversationHistory.length,
        completedObjectives: completedObj,
        pendingObjectives: pendingObj,
        businessScore: Math.min(100, Math.max(75, completedObj.length * 22 + 15)),
        englishScore: 84,
        executiveSummary:
          'Muy buena sesión de atención en oficinas internacionales. Supiste acreditar visitantes con amabilidad, guiar hacia las salas de reuniones y coordinar recepción de paquetería.',
        keyStrengths: [
          'Acreditación formal y correcta de visitas corporativas',
          'Instrucciones espaciales claras para ubicación de salas',
          'Manejo resolutivo de avisos de averías para mantenimiento'
        ],
        areasForImprovement: [
          'Pronunciar con precisión "visitor badge" [ví-si-tor badch]',
          'Confirmar el nombre del destinatario en entregas urgentes',
          'Usar fórmulas de cortesía como "May I see your ID, please?"'
        ],
        vocabularyUsed: scenario.nicheVocabulary.slice(0, 4),
        suggestedPhrases: [
          {
            original: 'Give me your document',
            better: 'May I see your ID, please? Here is your visitor badge.',
            reason: 'Mucho más profesional y adecuado para la recepción de una multinacional.'
          },
          {
            original: 'Wait a moment for maintenance',
            better: 'I will report the issue to our maintenance team right away.',
            reason: 'Transmite diligencia y tranquilidad al visitante o director.'
          }
        ]
      };
    }

    return {
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      durationSeconds,
      totalMessages: conversationHistory.length,
      completedObjectives: completedObj,
      pendingObjectives: pendingObj,
      businessScore: Math.min(100, Math.max(70, completedObj.length * 25 + 20)),
      englishScore: 82,
      executiveSummary: `Práctica sólida en el área de ${scenario.niche}. Mantuviste la compostura profesional y avanzaste en la consecución de los objetivos planteados.`,
      keyStrengths: [
        'Mantuvo un tono empresarial coherente a lo largo de la simulación',
        'Buen uso de la terminología técnica del sector',
        'Respuestas ágiles frente a las objeciones del interlocutor'
      ],
      areasForImprovement: [
        'Incorporar cierres de conversación más asertivos',
        'Presentar cifras y plazos concretos con mayor rapidez',
        'Usar conectores de transición como "Furthermore" o "In that regard"'
      ],
      vocabularyUsed: scenario.nicheVocabulary.slice(0, 3),
      suggestedPhrases: [
        {
          original: 'I think we can do it faster for you.',
          better: 'Our deployment roadmap guarantees a streamlined onboarding within 14 business days.',
          reason: 'Demuestra rigor y compromiso con plazos medibles.'
        }
      ]
    };
  }

  // --- Dynamic Mock Handlers for Zero-Config Testing ---

  private static mockGenerateScenario(prompt: string): Partial<Scenario> {
    const cleanPrompt = prompt.trim();
    return {
      id: 'custom-' + Date.now(),
      title: cleanPrompt.length > 35 ? cleanPrompt.slice(0, 35) + '...' : cleanPrompt,
      niche: 'Sector Empresarial Especializado',
      aiCharacter: {
        name: 'Marcus Sterling',
        role: 'Director de Operaciones & Decisor de Compra',
        avatar: '🎯',
        personality: 'Pragmático, analítico, busca claridad y exige datos de rentabilidad.',
        voiceGender: 'male'
      },
      userRole: 'Especialista / Consultor del Negocio',
      context: `Estás en una conversación clave respecto a: "${cleanPrompt}". Debes presentar valor concreto, superar objeciones técnicas y cerrar un siguiente hito.`,
      initialGreeting: `Thanks for making time. Regarding our situation with ${cleanPrompt.toLowerCase().slice(0, 40)}, I've reviewed your notes. What makes your approach the right decision for us right now?`,
      initialTranslation: 'Gracias por su tiempo. Respecto a nuestra situación, he revisado sus notas. ¿Qué hace que su propuesta sea la decisión correcta para nosotros ahora mismo?',
      initialTip: "Tip: Presenta tu propuesta de valor directo al grano diciendo: 'Our solution optimizes your workflow with zero downtime' [Áu-er so-lú-shon óp-ti-mái-ses iur uórk-flou].",
      difficulty: 'medium',
      targetEnglishLevel: 'B1',
      objectives: [
        { id: 'obj-1', description: 'Presentar propuesta de valor enfocada en el cuello de botella', completed: false },
        { id: 'obj-2', description: 'Rebatir objeción principal de costes o tiempos de transición', completed: false },
        { id: 'obj-3', description: 'Cerrar una fecha concreta para prueba piloto o siguiente reunión', completed: false }
      ],
      commonObjections: [
        'The transition risk seems too high for our current quarterly targets.',
        'We are currently evaluating another provider with established track record.',
        'What specific SLA guarantees do you provide if performance benchmarks fall short?'
      ],
      nicheVocabulary: ['Value proposition', 'Benchmark', 'Implementation timeline', 'Deliverables', 'Risk mitigation'],
      isCustom: true,
      createdAt: Date.now()
    };
  }

  private static mockSendTurn(
    scenario: Scenario,
    userText: string,
    history: Message[]
  ): {
    reply: string;
    translation?: string;
    tip?: string;
    corrections: { originalText: string; improvedText: string; explanation: string }[];
    completedObjectiveIds: string[];
  } {
    const lower = userText.toLowerCase();
    const completedObjectiveIds: string[] = [];
    const userTurnCount = history.filter((m) => m.sender === 'user').length;
    const isLovo = scenario.id.includes('lovo') || scenario.niche.includes('Coctelería') || scenario.niche.includes('LOVO');
    const isAdmin = scenario.id.includes('admin') || scenario.niche.includes('Administración') || scenario.niche.includes('Office');

    // Case 1: LOVO Bar Hospitality
    if (isLovo) {
      if (userTurnCount <= 1 || lower.includes('table') || lower.includes('bar') || lower.includes('welcome') || lower.includes('yes') || lower.includes('si') || lower.includes('good')) {
        return {
          reply: 'Thank you! Could you recommend two of your signature cocktails? What do you have?',
          translation: '¡Gracias! ¿Puedes recomendarnos dos de sus cócteles de autor? ¿Cuáles tienen?',
          tip: "Tip: Recomiéndale los cócteles Bubi o Manabi diciendo: 'I recommend the Bubi or Manabi cocktail' [Ai re-co-ménd de Bu-bi or Ma-na-bi cóc-teil].",
          completedObjectiveIds: ['obj-1'],
          corrections: lower.includes('si') || lower.includes('sí') ? [{
            originalText: userText,
            improvedText: 'Welcome to LOVO Bar! Table or bar? [Uél-cam tu Lovo Bar! Téibol or bar?]',
            explanation: 'Para saludar al cliente, puedes usar esta frase estándar de hostelería.'
          }] : []
        };
      }

      if (userTurnCount === 2 || lower.includes('bubi') || lower.includes('manabi') || lower.includes('cocktail') || lower.includes('drink')) {
        return {
          reply: 'The Bubi sounds delicious! Can we have two Bubi cocktails, please? Do you have any tapas or snacks like Iberian Ham or cheese?',
          translation: '¡El Bubi suena delicioso! ¿Nos traes dos cócteles Bubi, por favor? ¿Tienen alguna tapa o aperitivo como jamón ibérico o queso?',
          tip: "Tip: Ofrécele el Jamón Ibérico o la Tabla de Quesos diciendo: 'We have Iberian Ham and Cheese Board' [Ui jav ai-bí-ri-an jam and chis bord].",
          completedObjectiveIds: ['obj-2'],
          corrections: []
        };
      }

      if (userTurnCount === 3 || lower.includes('ham') || lower.includes('cheese') || lower.includes('snack') || lower.includes('tapas')) {
        return {
          reply: 'Wonderful, an Iberian Ham board sounds delicious! Excuse me, where is the restroom located?',
          translation: '¡Estupendo, una ración de jamón ibérico suena deliciosa! Disculpa, ¿dónde están los baños?',
          tip: "Tip: Indícale que los baños están abajo diciendo: 'The restrooms are downstairs' [De rest-rums ar daun-stérs].",
          completedObjectiveIds: ['obj-3'],
          corrections: []
        };
      }

      if (userTurnCount === 4 || lower.includes('restroom') || lower.includes('downstairs') || lower.includes('bill') || lower.includes('card') || lower.includes('cash')) {
        return {
          reply: 'Downstairs, got it, thank you! Could you also bring us the bill please? Can we pay with credit card?',
          translation: 'Abajo, entendido, ¡gracias! ¿Nos traes también la cuenta, por favor? ¿Podemos pagar con tarjeta?',
          tip: "Tip: Pregúntale si tarjeta o efectivo diciendo: 'Card or cash?' [Card or cash?].",
          completedObjectiveIds: ['obj-4'],
          corrections: []
        };
      }

      return {
        reply: 'Here is our card. Thank you so much for the wonderful service and hospitality! Have a great night!',
        translation: 'Aquí está nuestra tarjeta. ¡Muchísimas gracias por el maravilloso servicio y hospitalidad! ¡Que pases buena noche!',
        tip: '¡Excelente trabajo! Has completado con éxito la atención en inglés a clientes extranjeros.',
        completedObjectiveIds: ['obj-4'],
        corrections: []
      };
    }

    // Case 2: Auxiliar Administrativo y Servicios Generales
    if (isAdmin) {
      if (userTurnCount <= 1 || lower.includes('morning') || lower.includes('id') || lower.includes('badge') || lower.includes('welcome') || lower.includes('sign')) {
        return {
          reply: 'Thank you! Here is my ID card. By the way, could you tell me where meeting room B is located?',
          translation: '¡Gracias! Aquí está mi documento. Por cierto, ¿podrías indicarme dónde está la sala de reuniones B?',
          tip: "Tip: Indícale que la sala está en la segunda planta diciendo: 'Meeting room B is on the second floor, down the hall to the right' [Míiting rum bii is on de sé-cond flor].",
          completedObjectiveIds: ['admin-obj-1'],
          corrections: []
        };
      }

      if (userTurnCount === 2 || lower.includes('floor') || lower.includes('hall') || lower.includes('room') || lower.includes('second') || lower.includes('right')) {
        return {
          reply: 'Second floor on the right, perfect. Also, the courier just arrived at the desk with urgent parcels for Mr. Smith. Could you sign for them?',
          translation: 'Segunda planta a la derecha, perfecto. Además, el mensajero acaba de llegar con paquetes urgentes para el Sr. Smith. ¿Podrías firmar la entrega?',
          tip: "Tip: Confirma que firmas y registras el paquete diciendo: 'I will sign for the parcel, log it, and notify Mr. Smith' [Ai uil sáin for de pár-sel, log it and nóu-ti-fai].",
          completedObjectiveIds: ['admin-obj-2'],
          corrections: []
        };
      }

      if (userTurnCount === 3 || lower.includes('sign') || lower.includes('parcel') || lower.includes('log') || lower.includes('package') || lower.includes('notify')) {
        return {
          reply: 'Thank you for handling that. One last thing: the air conditioning in meeting room B is too cold. Could you report it to maintenance?',
          translation: 'Gracias por gestionarlo. Una última cosa: el aire acondicionado en la sala B está demasiado frío. ¿Podrías avisar a mantenimiento?',
          tip: "Tip: Confirma que avisas a mantenimiento de inmediato diciendo: 'I will report the issue to our maintenance team right away' [Ai uil ri-pórt di í-shiu tu áu-er méin-te-nans tiim].",
          completedObjectiveIds: ['admin-obj-3'],
          corrections: []
        };
      }

      return {
        reply: 'Splendid! Thank you so much for your professional assistance and quick coordination today. Have a productive day!',
        translation: '¡Espléndido! Muchísimas gracias por su asistencia profesional y rápida coordinación. ¡Que tenga un día muy productivo!',
        tip: '¡Excelente trabajo! Has gestionado todas las áreas operativas de recepción y servicios generales con éxito.',
        completedObjectiveIds: ['admin-obj-4'],
        corrections: []
      };
    }

    // Case 3: Universal / Business / Custom Scenario Mock Engine
    const targetObj = scenario.objectives.find((o) => !o.completed);
    if (targetObj) {
      completedObjectiveIds.push(targetObj.id);
    }

    let reply = `That is a fair point regarding our operational workflow. However, how does your approach mitigate transition risks for our team?`;
    let tip = `Tip: Destaca las garantías de servicio y soporte diciendo: 'We provide 24/7 dedicated support and a 30-day risk-free transition period.'`;
    let translation = 'Es un punto razonable sobre nuestro flujo operativo. Sin embargo, ¿cómo mitiga su enfoque los riesgos de transición para nuestro equipo?';

    if (history.length % 3 === 0 && scenario.commonObjections.length > 0) {
      const objection = scenario.commonObjections[Math.floor(Math.random() * scenario.commonObjections.length)];
      reply = `I understand your argument, but here is our main hesitation: ${objection} How would you address that?`;
      translation = `Entiendo su argumento, pero esta es nuestra principal duda: ${objection} ¿Cómo respondería a eso?`;
    } else if (lower.includes('pilot') || lower.includes('trial') || lower.includes('next') || lower.includes('meet') || lower.includes('schedule')) {
      reply = `I am open to structuring this as a pilot program. Send over the formal agreement, and let's schedule a kickoff next Tuesday.`;
      translation = 'Estoy abierto a estructurar esto como un programa piloto. Envíe el acuerdo formal y fijemos el lanzamiento el próximo martes.';
      tip = "Tip: Confirma el cierre del acuerdo diciendo: 'Perfect, I will send the agreement today and confirm Tuesday's kickoff.'";
    }

    const corrections: { originalText: string; improvedText: string; explanation: string }[] = [];
    if (lower.includes('i have reason') || lower.includes('i am agree')) {
      corrections.push({
        originalText: 'I am agree',
        improvedText: 'I agree',
        explanation: 'En inglés se dice "I agree", no "I am agree".'
      });
    } else if (lower.includes('explain me')) {
      corrections.push({
        originalText: 'Explain me',
        improvedText: 'Explain to me / Walk me through',
        explanation: 'El verbo "explain" requiere la preposición "to" (explain to me).'
      });
    }

    return { reply, translation, tip, corrections, completedObjectiveIds };
  }
}
