import type { Scenario, Message, SessionReport } from '../types';

export class GeminiService {
  private static DEFAULT_MODEL = 'gemini-2.5-flash';

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
      // High-quality mock fallback if user has not yet entered an API key
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
  "difficulty": "easy" | "medium" | "hard" | "hostile",
  "targetEnglishLevel": "A2" | "B1" | "B2" | "C1" | "C2",
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
        `https://generativelanguage.googleapis.com/v1beta/models/${this.DEFAULT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUser request: "${prompt}". Return ONLY the raw JSON without markdown codeblocks.` }
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
   * Enforces 100% strict adherence to the assigned niche scenario.
   * Keeps replies concise for natural spoken dialogue (1-3 sentences).
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

    // Build rolling context to support hours of conversation without exceeding context windows:
    // We send scenario instructions + pending objectives + the last 10 messages verbatim
    const pendingObjectives = scenario.objectives.filter(o => !o.completed);
    const recentMessages = conversationHistory.slice(-10);

    const isBeginnerA1 = scenario.targetEnglishLevel === 'A1' || scenario.difficulty === 'easy';

    const systemInstructions = `
CRITICAL DIRECTIVE: You are an expert Bilingual AI Language Coach and Roleplay Partner (like in AILEARNA).
You are strictly roleplaying as:
- Name: ${scenario.aiCharacter.name}
- Role: ${scenario.aiCharacter.role}
- Personality & Demeanor: ${scenario.aiCharacter.personality}
- Industry Niche: ${scenario.niche}
- Target English Level: ${scenario.targetEnglishLevel}
- Difficulty Level: ${scenario.difficulty}

The user is playing: ${scenario.userRole}.
The current scenario context is: ${scenario.context}

CRITICAL ROLEPLAY & PROGRESSION RULES:
1. You act as a warm bilingual coach who guides in SPANISH and roleplays as the foreign client in short simple ENGLISH (Level A1).
2. NEVER ASK THE USER TO CHOOSE A ROLE OR REPEATEDLY ASK IF THEY ARE READY. The user is ALREADY the waiter/bartender at LOVO Bar.
3. Advance the interaction sequentially:
   - If user welcomes you or says yes: Ask for a table or signature cocktail recommendations ("Thank you! Could you recommend two cocktails? What do you have?").
   - If user recommends cocktails: Order two Bubi cocktails and ask for snacks/tapas ("Two Bubi cocktails, please! Do you have tapas or snacks like Iberian Ham or cheese?").
   - If user offers snacks: Ask where the restrooms are and ask for the bill ("Delicious! Excuse me, where are the restrooms? And could we have the bill, please?").
   - If user indicates restrooms/bill: Hand your card, thank them, and say farewell ("Here is our card. Thank you so much for the wonderful service! Have a good night!").
4. Check if the user's latest response fulfilled any of these pending objectives:
${pendingObjectives.map(o => `- [${o.id}] ${o.description}`).join('\n')}
5. Spoken replies MUST BE concise (1 to 2 short sentences maximum).
5. Output MUST BE strictly valid JSON with this format:
{
  "reply": "Spoken customer line in English, optionally preceded by 1 short Spanish coaching phrase",
  "translation": "Spanish translation of the English phrase",
  "tip": "Short friendly tip in Spanish coaching the user on what phrase to say in English with phonetic pronunciation [e.g. Di: 'Welcome to LOVO Bar! Table or bar?' [Uél-cam tu Lovo Bar! Téibol or bar?]]",
  "corrections": [
    {
      "originalText": "Mistake or Spanish phrase the user said",
      "improvedText": "${isBeginnerA1 ? 'Easy English phrase with Spanish pronunciation guide in brackets [e.g. Table or bar? [Téibol or bar?]]' : 'More professional native business phrasing'}",
      "explanation": "Brief explanation in Spanish to help the user remember"
    }
  ],
  "completedObjectiveIds": ["obj-id-if-fulfilled-in-this-turn"]
}
If the user's English had no notable mistakes, leave "corrections" as an empty array [].
`;

    // Format contents alternating user and model roles, starting with user (strictly required by Gemini API)
    const formattedContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    formattedContents.push({
      role: 'user',
      parts: [{ text: `Let's begin the LOVO Bar hospitality practice. I am playing the role of ${scenario.userRole}.` }]
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
        `https://generativelanguage.googleapis.com/v1beta/models/${this.DEFAULT_MODEL}:generateContent?key=${apiKey}`,
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
        reply: parsed.reply || "Thank you! What cocktails do you recommend here at LOVO Bar?",
        translation: parsed.translation || "",
        tip: parsed.tip || "",
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
    const isLovo = scenario.id.includes('lovo') || scenario.niche.includes('Coctelería') || scenario.niche.includes('LOVO');

    if (!apiKey) {
      if (isLovo) {
        return [
          "Welcome to Lovo Bar! Table for two or at the bar? [Uél-cam tu Lovo Bar! Téibol or bar?]",
          "I recommend our Bubi cocktail. It is sweet with banana and cocoa.",
          "Would you like some 100% Iberian Ham or a cheese board? [Jamón Ibérico & Cheese Board]",
          "The restrooms are downstairs. Can I bring you the bill? [Card or cash?]"
        ];
      }
      return [
        "Could you clarify the specific ROI and metrics we are discussing?",
        "I understand your concern about costs, but consider the long-term efficiency gains.",
        "Let's schedule a dedicated follow-up meeting with your technical team."
      ];
    }

    const lastAiMessage = [...conversationHistory].reverse().find(m => m.sender === 'ai')?.text || scenario.initialGreeting;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.DEFAULT_MODEL}:generateContent?key=${apiKey}`,
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

Provide 3 short, easy, natural spoken English sentences${isLovo ? ' (for a bar employee at LOVO Bar Madrid, including Spanish pronunciation in brackets like [Uél-cam tu Lovo Bar])' : ''} that the user could say right now to reply.
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
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      if (isLovo) {
        return [
          "Welcome to Lovo Bar! Table for two or at the bar? [Téibol or bar?]",
          "I recommend our signature Bubi cocktail. It is sweet and refreshing.",
          "The restrooms are downstairs. Can I bring you the bill? [Card or cash?]"
        ];
      }
      return [
        "Let me address that point directly with our performance numbers.",
        "I hear your reservation, and that's exactly why our SLA includes 99.9% uptime guarantees.",
        "Would it be helpful if we structured this as a phased pilot program?"
      ];
    }
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
    const completedObj = scenario.objectives.filter(o => o.completed).map(o => o.description);
    const pendingObj = scenario.objectives.filter(o => !o.completed).map(o => o.description);

    if (!apiKey || conversationHistory.length < 3) {
      const isLovo = scenario.id.includes('lovo') || scenario.niche.includes('Coctelería') || scenario.niche.includes('LOVO');

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
          executiveSummary: 'Excelente práctica de servicio y hospitalidad en LOVO Bar. Lograste atender a clientes angloparlantes usando frases claras de nivel A1 para ubicar clientes, sugerir cócteles y gestionar el cobro.',
          keyStrengths: [
            'Atención al cliente amable, rápida y directa',
            'Buena recomendación de la carta de cócteles (Bubi, Manabi, opciones 0,0)',
            'Dominio de frases clave de supervivencia para sala, barra, office y cobro'
          ],
          areasForImprovement: [
            'Recordar ofrecer la carta de placeres (Iberian Ham & Cheese Board) para aumentar el ticket medio',
            'Pronunciar con naturalidad "Table or bar?" [Téibol or bar?]',
            'Despedir siempre con una sonrisa diciendo "Have a great night!"'
          ],
          vocabularyUsed: scenario.nicheVocabulary.slice(0, 4),
          suggestedPhrases: [
            {
              original: "Mesa o barra",
              better: "Table or bar, please? [Téibol or bar, plis?]",
              reason: "Frase corta y educada para recepcionistas y camareros de LOVO Bar."
            },
            {
              original: "El baño está abajo",
              better: "Restrooms are downstairs [Rest-rums ar daun-stérs]",
              reason: "Instrucción universal y fácil de pronunciar para cualquier empleado (office, barra o sala)."
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
        businessScore: Math.min(100, Math.max(65, completedObj.length * 30 + 15)),
        englishScore: 82,
        executiveSummary: `Solid practice session in the ${scenario.niche} domain. You maintained professional composure and addressed critical objections.`,
        keyStrengths: [
          'Maintained professional business tone throughout the exchange',
          'Good use of relevant industry terminology',
          'Addressed objections without becoming defensive'
        ],
        areasForImprovement: [
          'Incorporate more assertive closing statements',
          'Elaborate on specific metrics and financial ROI figures earlier in the discussion',
          'Use transition connectors like "Furthermore", "In that regard", and "To illustrate"'
        ],
        vocabularyUsed: scenario.nicheVocabulary.slice(0, 3),
        suggestedPhrases: [
          {
            original: "I think we can do it faster for you.",
            better: "Our deployment roadmap guarantees a streamlined onboarding within 14 business days.",
            reason: "More authoritative and demonstrates confidence with concrete timelines."
          },
          {
            original: "Don't worry about the money.",
            better: "Let's examine how the efficiency dividend fully offsets the initial capital expenditure.",
            reason: "Uses executive-level financial language rather than casual assurances."
          }
        ]
      };
    }

    try {
      const transcript = conversationHistory
        .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const prompt = `
Analyze this business English roleplay session:
Scenario: ${scenario.title} (${scenario.niche})
User Role: ${scenario.userRole}
AI Character: ${scenario.aiCharacter.name} (${scenario.aiCharacter.role})
Duration: ${Math.round(durationSeconds / 60)} minutes

Transcript:
${transcript}

Provide an executive performance review in JSON with this structure:
{
  "businessScore": 0-100,
  "englishScore": 0-100,
  "executiveSummary": "Concise 2-3 sentence overview of the conversation",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForImprovement": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "vocabularyUsed": ["term1", "term2"],
  "suggestedPhrases": [
    {
      "original": "Actual phrase the user said or weak phrasing",
      "better": "High-impact native executive English alternative",
      "reason": "Why this conveys more authority or precision"
    }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.DEFAULT_MODEL}:generateContent?key=${apiKey}`,
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
        executiveSummary: parsed.executiveSummary || 'Good progress during the roleplay session.',
        keyStrengths: parsed.keyStrengths || [],
        areasForImprovement: parsed.areasForImprovement || [],
        vocabularyUsed: parsed.vocabularyUsed || [],
        suggestedPhrases: parsed.suggestedPhrases || []
      };
    } catch {
      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        durationSeconds,
        totalMessages: conversationHistory.length,
        completedObjectives: completedObj,
        pendingObjectives: pendingObj,
        businessScore: 78,
        englishScore: 80,
        executiveSummary: 'Great roleplay session. Your technical arguments were clear and you held your ground against tough questions.',
        keyStrengths: ['Good pacing', 'Relevant vocabulary', 'Clear delivery'],
        areasForImprovement: ['Use more idiomatic business collocations', 'Propose next steps earlier'],
        vocabularyUsed: scenario.nicheVocabulary.slice(0, 2),
        suggestedPhrases: []
      };
    }
  }

  // --- Dynamic Mock Handlers for Zero-Config Immediate Testing ---

  private static mockGenerateScenario(prompt: string): Partial<Scenario> {
    const cleanPrompt = prompt.trim();
    return {
      id: 'custom-' + Date.now(),
      title: cleanPrompt.length > 35 ? cleanPrompt.slice(0, 35) + '...' : cleanPrompt,
      niche: 'Custom Specialized Business Niche',
      aiCharacter: {
        name: 'Marcus Sterling',
        role: 'Key Decision Maker & Department Director',
        avatar: '🎯',
        personality: 'Discerning, pragmatic, expects clarity, challenges claims with market realities.',
        voiceGender: 'male'
      },
      userRole: 'Industry Specialist / Consultant',
      context: `You are in a high-stakes discussion regarding: "${cleanPrompt}". You must convince Marcus by presenting concrete value, overcoming domain-specific hesitations, and driving toward a concrete agreement.`,
      initialGreeting: `Thanks for making time. Regarding our situation with ${cleanPrompt.toLowerCase().slice(0, 40)}, I've reviewed your preliminary notes. Let's cut straight to the point: what makes your proposal the right path for us right now?`,
      difficulty: 'medium',
      targetEnglishLevel: 'B2',
      objectives: [
        { id: 'obj-1', description: 'Deliver a compelling value proposition addressing his core bottleneck', completed: false },
        { id: 'obj-2', description: 'Counter the principal objection regarding cost and transition timing', completed: false },
        { id: 'obj-3', description: 'Establish a clear next milestone or signed trial agreement', completed: false }
      ],
      commonObjections: [
        "The risk of transition seems disproportionate to the projected upside.",
        "We are evaluating two other alternatives with established track records.",
        "What specific guarantees do you provide if performance benchmarks aren't met?"
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
    const userTurnCount = history.filter(m => m.sender === 'user').length;
    const isLovo = scenario.id.includes('lovo') || scenario.niche.includes('Coctelería') || scenario.niche.includes('LOVO');

    if (isLovo) {
      // Step 1: User welcomes or confirms seating
      if (userTurnCount <= 1 || lower.includes('table') || lower.includes('bar') || lower.includes('welcome') || lower.includes('yes') || lower.includes('si') || lower.includes('sí') || lower.includes('hello') || lower.includes('hi') || lower.includes('camarero') || lower.includes('good')) {
        return {
          reply: "Thank you! Could you recommend two of your signature cocktails? What do you have?",
          translation: "¡Gracias! ¿Puedes recomendarnos dos de sus cócteles de autor? ¿Cuáles tienen?",
          tip: "Tip: Recomiéndale los cócteles Bubi o Manabi diciendo: 'I recommend the Bubi or Manabi cocktail' [Ai re-co-ménd de Bu-bi or Ma-na-bi cóc-teil].",
          completedObjectiveIds: ['obj-1'],
          corrections: lower.includes('si') || lower.includes('sí') ? [{
            originalText: userText,
            improvedText: "Welcome to LOVO Bar! Table or bar? [Uél-cam tu Lovo Bar! Téibol or bar?]",
            explanation: "Para saludar al cliente, puedes usar esta frase estándar de hostelería."
          }] : []
        };
      }

      // Step 2: User recommends cocktail
      if (userTurnCount === 2 || lower.includes('bubi') || lower.includes('manabi') || lower.includes('inuit') || lower.includes('maori') || lower.includes('cocktail') || lower.includes('drink') || lower.includes('sweet') || lower.includes('fresh') || lower.includes('fruit')) {
        return {
          reply: "The Bubi sounds delicious! Can we have two Bubi cocktails, please? Do you have any tapas or snacks like Iberian Ham or cheese?",
          translation: "¡El Bubi suena delicioso! ¿Nos traes dos cócteles Bubi, por favor? ¿Tienen alguna tapa o aperitivo como jamón ibérico o queso?",
          tip: "Tip: Ofrécele el Jamón Ibérico o la Tabla de Quesos diciendo: 'We have Iberian Ham and Cheese Board' [Ui jav ai-bí-ri-an jam and chis bord].",
          completedObjectiveIds: ['obj-2'],
          corrections: []
        };
      }

      // Step 3: User offers food/tapas
      if (userTurnCount === 3 || lower.includes('ham') || lower.includes('jamon') || lower.includes('cheese') || lower.includes('queso') || lower.includes('snack') || lower.includes('food') || lower.includes('tapas') || lower.includes('oyster') || lower.includes('placer')) {
        return {
          reply: "Wonderful, an Iberian Ham board sounds delicious! Excuse me, where is the restroom located?",
          translation: "¡Estupendo, una ración de jamón ibérico suena deliciosa! Disculpa, ¿dónde están los baños?",
          tip: "Tip: Indícale que los baños están abajo diciendo: 'The restrooms are downstairs' [De rest-rums ar daun-stérs].",
          completedObjectiveIds: ['obj-3'],
          corrections: []
        };
      }

      // Step 4: User indicates restrooms / bill
      if (userTurnCount === 4 || lower.includes('restroom') || lower.includes('downstairs') || lower.includes('bathroom') || lower.includes('toilet') || lower.includes('baño') || lower.includes('abajo') || lower.includes('bill') || lower.includes('check')) {
        return {
          reply: "Downstairs, got it, thank you! Could you also bring us the bill please? Can we pay with credit card?",
          translation: "Abajo, entendido, ¡gracias! ¿Nos traes también la cuenta, por favor? ¿Podemos pagar con tarjeta?",
          tip: "Tip: Pregúntale si tarjeta o efectivo diciendo: 'Card or cash?' [Card or cash?].",
          completedObjectiveIds: ['obj-4'],
          corrections: []
        };
      }

      // Step 5: User handles payment / closing
      return {
        reply: "Here is our card. Thank you so much for the wonderful service and hospitality! Have a great night!",
        translation: "Aquí está nuestra tarjeta. ¡Muchísimas gracias por el maravilloso servicio y hospitalidad! ¡Que pases buena noche!",
        tip: "¡Excelente trabajo! Has completado con éxito la atención en inglés a clientes extranjeros en LOVO Bar.",
        completedObjectiveIds: ['obj-4'],
        corrections: []
      };
    }

    // Default enterprise fallback
    if (lower.includes('roi') || lower.includes('cost') || lower.includes('save') || lower.includes('revenue') || lower.includes('price')) {
      const obj1 = scenario.objectives.find(o => !o.completed);
      if (obj1) completedObjectiveIds.push(obj1.id);
    }
    if (lower.includes('security') || lower.includes('schedule') || lower.includes('trial') || lower.includes('meet') || lower.includes('tuesday') || lower.includes('call')) {
      const obj2 = scenario.objectives.find(o => !o.completed && !completedObjectiveIds.includes(o.id));
      if (obj2) completedObjectiveIds.push(obj2.id);
    }

    let reply = `That's an interesting perspective. However, looking at our balance sheet and project timeline, how exactly does that prevent unexpected delays for our team?`;

    if (history.length % 3 === 0) {
      const objection = scenario.commonObjections[Math.floor(Math.random() * scenario.commonObjections.length)];
      reply = `I hear what you're saying, but consider this: ${objection} How do you plan to mitigate that?`;
    } else if (lower.includes('meet') || lower.includes('demo') || lower.includes('next step') || lower.includes('proposal')) {
      reply = `I might be open to that if the numbers make sense. Send over the formal brief by tomorrow morning, and let's set up a brief sync with our technical lead.`;
    }

    const corrections: { originalText: string; improvedText: string; explanation: string }[] = [];
    if (lower.includes('i have reason') || lower.includes('i am agree')) {
      corrections.push({
        originalText: "I am agree",
        improvedText: "I agree",
        explanation: 'En inglés se dice "I agree", no "I am agree".'
      });
    } else if (lower.includes('explain me')) {
      corrections.push({
        originalText: "Explain me",
        improvedText: "Explain to me / Walk me through",
        explanation: 'El verbo "explain" requiere la preposición "to" (explain to me).'
      });
    }

    return { reply, corrections, completedObjectiveIds };
  }
}
