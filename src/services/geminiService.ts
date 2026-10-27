import type { Scenario, Message, SessionReport, EnglishLevel, DifficultyLevel } from '../types';

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
    // Check Vite env variable if provided
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  }

  public static hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  }

  public static setApiKey(key: string): void {
    localStorage.setItem('persona_gemini_api_key', key.trim());
  }

  /**
   * Dual-channel execution:
   * 1. Attempts to route via Backend Proxy (/api/gemini/chat) to protect API keys in production B2B.
   * 2. Falls back to direct client-side Gemini REST call if proxy is unavailable or running static.
   */
  private static async executeGeminiCall(geminiPayload: any): Promise<any> {
    const model = this.getModel();
    const clientApiKey = this.getApiKey();

    // Channel 1: Attempt secure backend proxy first
    try {
      const proxyRes = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          clientApiKey,
          geminiPayload
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return JSON.parse(candidateText);
        }
      }
    } catch {
      // Backend proxy unavailable in pure static mode, fallback to direct client call
    }

    // Channel 2: Direct client-side call if client key exists
    if (clientApiKey) {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${clientApiKey}`;
      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });

      if (!directRes.ok) {
        throw new Error(`Direct Gemini API error: ${directRes.status} ${directRes.statusText}`);
      }

      const data = await directRes.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText);
      }
    }

    throw new Error('No API Key or Proxy available');
  }

  /**
   * Generates a complete scenario from a simple user description, full menu, or company manual.
   * Uses Gemini with temperature 0.25 and strict responseSchema.
   */
  public static async generateScenarioFromPrompt(
    prompt: string,
    options?: { targetEnglishLevel?: EnglishLevel; difficulty?: DifficultyLevel }
  ): Promise<Partial<Scenario>> {
    const targetLevel = options?.targetEnglishLevel;
    const targetDiff = options?.difficulty;

    const systemInstructionText = `You are an expert executive coach, roleplay curriculum designer, and business hospitality consultant.
The user is providing business documentation, a restaurant/bar menu, a service catalogue, an operations manual, or roleplay specifications.
Your mission is to parse this business knowledge and generate a high-stakes, realistic English professional roleplay scenario.

CRITICAL PARSING & EXTRACTION DIRECTIVES:
1. EXTRACT REAL BUSINESS ASSETS: Extract actual product names, cocktails, dishes, ingredients, prices, service rules, opening hours, and policies from the user's text.
2. CEFR LEVEL CALIBRATION: ${targetLevel ? `Calibrate dialogues, sentence complexity, and phonetic tips strictly for CEFR Level ${targetLevel}.` : 'Calibrate automatically according to complexity.'}
3. DIFFICULTY CALIBRATION: ${targetDiff ? `Set customer temperament and scenario friction to ${targetDiff}.` : 'Set realistic difficulty.'}
4. OBJECTIVES: Create 4 clear, action-oriented business goals (e.g., recommend specific items from the provided menu, handle payment, resolve doubts).
5. COMMON OBJECTIONS: Formulate 3 to 4 realistic objections or questions customers will genuinely ask about these exact items, prices, or policies.
6. NICHE VOCABULARY: Extract at least 8 to 14 crucial terms/cocktails/dishes from the text, providing phonetic pronunciation in brackets [e.g. "Bubi Cocktail [Bú-bi Cóc-teil] (Dulce, ron y plátano)"].
7. ZERO-HALLUCINATIONS: Ground names, prices, and facts directly in the user's provided text.
8. 🚨 MANDATORY LANGUAGE DISCIPLINE:
   - PitchBoss is strictly for practicing English in customer/business encounters.
   - The AI character (${options?.targetEnglishLevel || 'Customer'}) ONLY speaks English and does not speak Spanish.
   - "initialGreeting": Spoken strictly in English (e.g. "Good evening! It is our first time here. Could you recommend something special from your cocktail menu?").
   - "initialTranslation": Spanish translation of the greeting for learner comprehension.
   - "initialTip": Coaching advice in Spanish, BUT the spoken sentence inside quotes MUST 100% BE IN ENGLISH with phonetic transcription in brackets [e.g. Di en inglés: "Welcome to LOVO Bar! Here is our cocktail menu." [Uél-cam tu LO-VO Bar! Jí-er is au-er cóc-teil me-niu].]. NEVER suggest the user speak in Spanish!`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: `Create a professional business English roleplay scenario based on this company documentation/menu:\n\n"""\n${prompt}\n"""` }]
        }
      ],
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            niche: { type: 'STRING' },
            aiCharacter: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                role: { type: 'STRING' },
                avatar: { type: 'STRING' },
                personality: { type: 'STRING' },
                voiceGender: { type: 'STRING', enum: ['male', 'female'] }
              },
              required: ['name', 'role', 'avatar', 'personality', 'voiceGender']
            },
            userRole: { type: 'STRING' },
            context: { type: 'STRING' },
            initialGreeting: {
              type: 'STRING',
              description: 'Customer opening greeting spoken strictly in natural English.'
            },
            initialTranslation: {
              type: 'STRING',
              description: 'Spanish translation of the customer initial greeting.'
            },
            initialTip: {
              type: 'STRING',
              description: 'Coaching tip in Spanish telling the user what phrase to say IN ENGLISH with phonetics in brackets. Example: Di en inglés: "Welcome to our bar! Here is our menu." [Uél-cam tu au-er bar! Jí-er is au-er me-niu]. NEVER suggest speaking in Spanish.'
            },
            difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard', 'hostile'] },
            targetEnglishLevel: { type: 'STRING', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
            objectives: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  description: { type: 'STRING' },
                  completed: { type: 'BOOLEAN' }
                },
                required: ['id', 'description', 'completed']
              }
            },
            commonObjections: { type: 'ARRAY', items: { type: 'STRING' } },
            nicheVocabulary: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: [
            'title',
            'niche',
            'aiCharacter',
            'userRole',
            'context',
            'initialGreeting',
            'initialTranslation',
            'initialTip',
            'difficulty',
            'targetEnglishLevel',
            'objectives',
            'commonObjections',
            'nicheVocabulary'
          ]
        }
      }
    };

    try {
      const parsed = await this.executeGeminiCall(payload);
      return {
        ...parsed,
        id: 'custom-' + Date.now(),
        businessKnowledge: prompt,
        targetEnglishLevel: targetLevel || parsed.targetEnglishLevel || 'A1',
        difficulty: targetDiff || parsed.difficulty || 'easy',
        isCustom: true,
        createdAt: Date.now()
      };
    } catch (err) {
      console.warn('AI Generation failed, using dynamic template:', err);
      const mocked = this.mockGenerateScenario(prompt);
      return {
        ...mocked,
        businessKnowledge: prompt,
        targetEnglishLevel: targetLevel || mocked.targetEnglishLevel || 'A1',
        difficulty: targetDiff || mocked.difficulty || 'easy'
      };
    }
  }

  /**
   * Main conversational turn:
   * Operates in 'God Mode':
   * - temperature: 0.25 for deterministic, professional roleplay without hallucinations.
   * - Strict Grounding directive: never breaks character, never invents non-existent company facts.
   * - Hardware-enforced JSON schema via responseSchema.
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
${
  scenario.businessKnowledge
    ? `
OFFICIAL COMPANY KNOWLEDGE BASE & PRODUCTS (STRICT SOURCE OF TRUTH):
"""
${scenario.businessKnowledge}
"""
You must strictly follow this knowledge base. Reference real cocktails, dishes, ingredients, prices, and policies mentioned above when interacting as a customer or providing feedback.
`
    : ''
}

Common business objections in this situation:
${scenario.commonObjections.map((o) => `- ${o}`).join('\n')}

Specialized industry vocabulary:
${scenario.nicheVocabulary.map((v) => `- ${v}`).join('\n')}

Pending Business Objectives to achieve:
${pendingObjectives.map((o) => `- [${o.id}] ${o.description}`).join('\n')}

🚨 CRITICAL RULES & STRICT LANGUAGE DISCIPLINE (ABSOLUTE PRIORITY):
1. ROLE & IDENTITY: Stay 100% in character as ${scenario.aiCharacter.name}. Never break character or refer to yourself as an AI model. Keep your spoken replies concise and natural for real-time speech (1 to 2 spoken English sentences maximum).
2. STRICT GROUNDING: Strictly confine your knowledge to the scenario context, company knowledge base, and business facts. NEVER invent imaginary policies, non-existent drinks/dishes, or hallucinated prices.
3. 🌐 ABSOLUTE LANGUAGE RULE FOR THE "tip" FIELD:
   - PitchBoss is a specialized training simulator for non-native employees (bartenders, waitstaff, receptionists, executives) to attend international clients IN ENGLISH.
   - The customer (${scenario.aiCharacter.name}) DOES NOT SPEAK SPANISH and only speaks English.
   - ⚠️ EVEN IF THE MENU, INGREDIENTS, RECIPES, OR PROTOCOLS IN THE KNOWLEDGE BASE ARE WRITTEN IN SPANISH, YOU MUST ALWAYS TRANSLATE ANY RECOMMENDED PRODUCTS, INGREDIENTS, OR RESPONSES INTO NATURAL ENGLISH FOR THE USER'S SPOKEN LINE.
   - The "tip" field gives coaching advice in Spanish, BUT THE SPOKEN LINE INSIDE QUOTES MUST ALWAYS BE 100% IN ENGLISH, followed by a phonetic pronunciation transcription in square brackets [for Spanish speakers].
   - ❌ STRICTLY FORBIDDEN: NEVER suggest a response in Spanish!
     DO NOT WRITE: Di: "Claro, tenemos el Manabi. Es afrutado y picante..." [Klá-ro, te-né-mos...]
   - ✅ MANDATORY FORMAT:
     Di en inglés: "Certainly! I recommend our Manabi cocktail. It's fruity and spicy with Bumbu rum, passion fruit, and a hint of chili." [Sér-ten-li! Ai re-co-mend au-er Ma-na-bi cóc-teil. It's fru-ti and spái-si uid Bum-bu ram, pá-shon frut, and e jint of chi-li.]
4. CEFR Level Guidance:
   ${
     isBeginner
       ? '- The user is at Beginner level (' + scenario.targetEnglishLevel + '). Speak in short, clear, accessible English. The "tip" MUST provide a short, direct phrase IN ENGLISH inside quotation marks, followed by phonetic transcription in brackets [e.g. Di en inglés: "Good evening, welcome to LOVO Bar! Here is our menu." [Gud ív-ning, uél-cam tu LO-VO Bar! Jí-er is au-er me-niu.]].'
       : isIntermediate
       ? '- The user is at Intermediate level (' + scenario.targetEnglishLevel + '). Speak naturally as a business customer with realistic requests. The "tip" MUST coach the user on how to respond IN ENGLISH with natural phrasing and consultative upselling, followed by phonetics in brackets [e.g. Di en inglés: "Certainly, we have two signature cocktails: the Bubi and the Manabi. Which flavours do you prefer?" [Sér-ten-li, uii jav tu síg-na-chur cóc-teils: de Bu-bi and de Ma-na-bi. Uich fléi-vors du iu pri-fér?]].'
       : '- The user is at Advanced Executive level (' + scenario.targetEnglishLevel + '). Speak in fluent, nuanced business English. The "tip" should provide executive-level phrasing IN ENGLISH with strategic negotiation guidance and phonetics.'
   }
5. Check if the user's latest response fulfilled any pending objectives. If so, include their exact IDs in "completedObjectiveIds".
6. Detect any notable English grammar, pronunciation or vocabulary mistakes and provide discrete suggestions in "corrections". If the user spoke well, return an empty array [].
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

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstructions }]
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            reply: {
              type: 'STRING',
              description: 'Customer spoken reply strictly in natural English (1 to 2 sentences).'
            },
            translation: {
              type: 'STRING',
              description: 'Accurate Spanish translation of the reply for student comprehension.'
            },
            tip: {
              type: 'STRING',
              description: 'Coaching tip in Spanish advising the user what phrase to say. The suggested spoken dialogue inside quotes MUST BE 100% IN ENGLISH, followed by phonetic transcription in brackets for Spanish speakers. Example: Di en inglés: "Certainly! I recommend the Manabi cocktail." [Sér-ten-li! Ai re-co-mend de Ma-na-bi cóc-teil.]. NEVER suggest a Spanish phrase inside quotes, even if the menu was provided in Spanish.'
            },
            corrections: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  originalText: { type: 'STRING' },
                  improvedText: { type: 'STRING' },
                  explanation: { type: 'STRING' }
                },
                required: ['originalText', 'improvedText', 'explanation']
              }
            },
            completedObjectiveIds: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['reply', 'translation', 'tip', 'corrections', 'completedObjectiveIds']
        }
      }
    };

    try {
      const parsed = await this.executeGeminiCall(payload);
      return {
        reply: parsed.reply || "Thank you. Let's proceed with our meeting.",
        translation: parsed.translation || '',
        tip: parsed.tip || '',
        corrections: parsed.corrections || [],
        completedObjectiveIds: parsed.completedObjectiveIds || []
      };
    } catch (err) {
      console.warn('Gemini turn fallback triggered:', err);
      return this.mockSendTurn(scenario, userMessageText, conversationHistory);
    }
  }

  /**
   * Generates live suggestions/hints when the user is stuck during a call
   */
  public static async getLiveHints(scenario: Scenario, conversationHistory: Message[]): Promise<string[]> {
    const lastAiMessage =
      [...conversationHistory].reverse().find((m) => m.sender === 'ai')?.text || scenario.initialGreeting;

    const isBeginner = scenario.targetEnglishLevel === 'A1' || scenario.targetEnglishLevel === 'A2';

    const payload = {
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
              } that the user could say right now to reply. Even if company documentation, menus, or ingredients are in Spanish, all 3 suggested sentences MUST be in English with phonetic pronunciation in brackets for Spanish speakers. Never suggest Spanish sentences.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        }
      }
    };

    try {
      const parsed = await this.executeGeminiCall(payload);
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
    const completedObj = scenario.objectives.filter((o) => o.completed).map((o) => o.description);
    const pendingObj = scenario.objectives.filter((o) => !o.completed).map((o) => o.description);

    if (conversationHistory.length < 3) {
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

Provide an executive performance review in Spanish evaluating business outcomes and English fluency.`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              businessScore: { type: 'INTEGER' },
              englishScore: { type: 'INTEGER' },
              executiveSummary: { type: 'STRING' },
              keyStrengths: { type: 'ARRAY', items: { type: 'STRING' } },
              areasForImprovement: { type: 'ARRAY', items: { type: 'STRING' } },
              vocabularyUsed: { type: 'ARRAY', items: { type: 'STRING' } },
              suggestedPhrases: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    original: { type: 'STRING' },
                    better: { type: 'STRING' },
                    reason: { type: 'STRING' }
                  },
                  required: ['original', 'better', 'reason']
                }
              }
            },
            required: [
              'businessScore',
              'englishScore',
              'executiveSummary',
              'keyStrengths',
              'areasForImprovement',
              'vocabularyUsed',
              'suggestedPhrases'
            ]
          }
        }
      };

      const parsed = await this.executeGeminiCall(payload);

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
        avatar: 'target',
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
