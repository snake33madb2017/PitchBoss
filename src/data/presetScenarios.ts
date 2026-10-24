import type { Scenario } from '../types';
import { LOVO_BAR_MASTER_KNOWLEDGE } from './lovoBarKnowledge';

export const PRESET_SCENARIOS: Scenario[] = [
  // ==========================================
  // PROTOCOLO GENERAL LOVO BAR (CORE ONBOARDING)
  // ==========================================
  {
    id: 'lovo-bar-staff-hospitality',
    title: 'Coctelería LOVO Bar: Protocolo de Hospitalidad & Carta Oficial (Madrid)',
    niche: 'LOVO Bar: Protocolo General',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'James & Sarah (International Guests at LOVO Bar)',
      role: 'Clientes internacionales en barra y tutor bilingüe de LOVO Bar',
      avatar: '🍸',
      personality: 'Tutor interactivo y cliente internacional en la barra de LOVO Bar. Habla en inglés británico/americano elegante como cliente, preguntando por cócteles de autor, recomendaciones y comida, y te guía en español con transcripción fonética y feedback del protocolo de servicio de LOVO Bar.',
      voiceGender: 'male'
    },
    userRole: 'Bartender / Camarero de LOVO Bar',
    context: 'Atiendes en la barra principal de LOVO Bar en Calle Echegaray 20 (Barrio de las Letras, Madrid). Aplicas los 8 pasos del protocolo: bienvenida en menos de 40 segundos, posavasos, agua de cortesía, sugerencias de la pizarra, elaboración a la vista, up-selling de calidad en 2ª ronda y cuenta total dividida a partes iguales.',
    initialGreeting: '¡Hola! Bienvenido a tu entrenamiento en LOVO Bar. Hoy pondrás en práctica la atención en barra con clientes internacionales usando la carta real y los 8 pasos de hospitalidad.\n\nEntro a LOVO Bar por primera vez, me siento en la barra y te miro con curiosidad:\n\n"Good evening! It’s our first time here at LOVO Bar. Could you tell us what this place is about, and what would you recommend to start?"',
    initialTranslation: '¡Buenas noches! Es nuestra primera vez aquí en LOVO Bar. ¿Podrías contarnos de qué trata el local y qué nos recomendarías para empezar?',
    initialTip: "Tip: Aplica el Paso 1 de LOVO (Welcome): saluda en menos de 40s, extiende posavasos, ofrece agua y explica la coctelería emocional inspirada en Josephine Baker: 'Welcome to LOVO! We are an emotional cocktail bar inspired by Josephine Baker. Here is some complimentary water. Would you like to explore our menu?' [Uél-cam tu Ló-vo! Uii ar an i-móu-sho-nal cóc-teil bar...]",
    difficulty: 'easy',
    targetEnglishLevel: 'A1',
    objectives: [
      { id: 'obj-1', description: 'Bienvenida en 40s y presentación LOVO: Saludar, servir agua de cortesía y explicar la Coctelería Emocional inspirada en Josephine Baker', completed: false },
      { id: 'obj-2', description: 'Toma de comanda e indagación de gustos: Preguntar por preferencias (dulce, cítrico, afrutado, picante) y recomendar cócteles de la carta (Red Moon, Jupe Banane, Mowgli, Bötúku)', completed: false },
      { id: 'obj-3', description: 'Up-selling de calidad & Alergias: Consultar intolerancias y ofrecer up-selling en 2ª ronda (Bourbon/Rye superior, Negroni week o tablas de jamón ibérico/quesos)', completed: false },
      { id: 'obj-4', description: 'Cuenta dividida y despedida calurosa: Entregar la cuenta total dividida a partes iguales y despedir con agradecimiento según el protocolo', completed: false }
    ],
    commonObjections: [
      "It's our first time at LOVO Bar. Could you explain the concept and recommend a signature cocktail that is fruity and slightly spicy?",
      "I have a peanut and nut allergy. Which signature cocktails from your 3 volumes are completely safe for me?",
      "For our second round, can you recommend a high-end Bourbon or a premium Rye whiskey from your top shelf?",
      "Could we have the bill, please? We would like to pay by credit card and split the total equally."
    ],
    nicheVocabulary: [
      'Welcome to LOVO Bar! [Uél-cam tu Ló-vo Bar!] (Bienvenida)',
      'Emotional Cocktail Bar [I-móu-sho-nal Cóc-teil Bar] (Coctelería emocional)',
      'Complimentary welcome water [Com-pli-mén-ta-ri uél-cam uó-ter] (Agua de bienvenida)',
      'Red Moon Cocktail [Red Mun Cóc-teil] (12€: Vodka Ketel One, Campari, vino naranja, sorbete naranja)',
      'Jupe Banane [Dchup Ba-nán] (12€: Vodka, fresa y plátano clarificados, yogur, limón)',
      'Mowgli Cocktail [Móu-gli Cóc-teil] (13€: Roku Gin, pandan, cardamomo, banana, sal)',
      'Do you have any food allergies or intolerances? [Du iu jav é-ni fud á-ler-dchis?]',
      'Up-selling: Premium Bourbon or Rye [Prí-mium Bór-bon or Rai]',
      'We divide the total bill equally [Uii di-váid de tóu-tal bil í-cua-li]',
      'Thank you for visiting LOVO, have a wonderful night! [Jav a uán-der-ful náit!]'
    ],
    createdAt: Date.now()
  },

  // ==========================================
  // TOMO I: LA MUSA (JOSEPHINE BAKER)
  // ==========================================
  {
    id: 'lovo-tomo1-pitch1',
    title: 'LOVO Tomo I · Pitch One (A1-A2): La Musa (Saludos, Sabores & Cócteles Básicos)',
    niche: 'Tomo I: La Musa',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Emma (Tourist visiting Madrid)',
      role: 'Turista angloparlante en su primera visita a Madrid',
      avatar: '🌟',
      personality: 'Viajera amable y relajada. No es experta en cócteles y busca algo fácil de beber (dulce o afrutado). Hace preguntas sencillas sobre los ingredientes y necesita recomendaciones claras.',
      voiceGender: 'female'
    },
    userRole: 'Bartender / Camarero de LOVO Bar',
    context: 'Emma entra sola a LOVO Bar por la tarde. Se sienta en la barra y mira el Tomo I. Necesita una bienvenida cálida, agua de cortesía y una recomendación inicial sencilla de la carta de Josephine Baker.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch One (A1-A2) para el Tomo I: La Musa. Emma se sienta en la barra y te saluda:\n\n"Hi! Good evening! The bar looks stunning. It’s my first time here. Could you recommend something sweet and fruity from this first menu?"',
    initialTranslation: '¡Hola! ¡Buenas noches! El bar se ve increíble. Es mi primera vez aquí. ¿Podrías recomendarme algo dulce y afrutado de este primer menú?',
    initialTip: "Tip: Saluda cordialmente, ofrece agua y sugiere 'Jupe Banane' (12€) explicando fresa y plátano clarificados: 'Good evening! Welcome to LOVO. Here is some water. I recommend Jupe Banane—it is sweet, fruity, with strawberry and banana, inspired by Josephine Baker!' [Gud ív-ning! Uél-cam tu Ló-vo. Ai re-co-ménd Dchup Ba-nán...]",
    difficulty: 'easy',
    targetEnglishLevel: 'A1',
    objectives: [
      { id: 't1-p1-obj-1', description: 'Saludar en inglés, dar la bienvenida y ofrecer agua de cortesía ("Welcome to LOVO! Here is some water")', completed: false },
      { id: 't1-p1-obj-2', description: 'Preguntar preferencias básicas de sabor ("Do you prefer sweet, sour, or bitter drinks?")', completed: false },
      { id: 't1-p1-obj-3', description: 'Recomendar Jupe Banane (12€) o Red Moon (12€) indicando sus ingredientes principales', completed: false },
      { id: 't1-p1-obj-4', description: 'Indicar el precio con claridad y desearle que disfrute su copa ("It is 12 euros. Enjoy your cocktail!")', completed: false }
    ],
    commonObjections: [
      "Is Jupe Banane too strong, or is it light and easy to drink?",
      "I do not like bitter drinks like Campari. Can you make sure my drink is fresh and sweet?",
      "How much is this cocktail, and do you accept credit card payments?"
    ],
    nicheVocabulary: [
      'Welcome to LOVO! [Uél-cam tu Ló-vo!]',
      'Complimentary water [Com-pli-mén-ta-ri uó-ter] (Agua de cortesía)',
      'Sweet and fruity [Suiit and frú-ti] (Dulce y afrutado)',
      'Jupe Banane [Dchup Ba-nán] (12€: Plátano, fresa clarificada, yogur)',
      'Red Moon [Red Mun] (12€: Vodka Ketel One, naranja, Campari)',
      'Do you prefer sweet or sour? [Du iu pri-fér suiit or sáur?]',
      'Twelve euros [Tuélv iú-ros] (12€)',
      'Enjoy your drink! [En-dchói iur drink!] (¡Que disfrute su copa!)'
    ],
    createdAt: Date.now()
  },
  {
    id: 'lovo-tomo1-pitch2',
    title: 'LOVO Tomo I · Pitch Two (B1-B2): La Musa (Storytelling, 4 Estadios & Clarificados)',
    niche: 'Tomo I: La Musa',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Charlotte & Pierre (Art & Cocktail Lovers from Paris)',
      role: 'Clientes parisinos entusiastas del Art Déco y la historia de Josephine Baker',
      avatar: '🎭',
      personality: 'Viajeros cultos apasionados por la cultura parisina de los años 20. Preguntan por la conexión de los cócteles con la vida de Josephine Baker, los 4 estadios (Amarga y Seca, Ácida, Dulce, Códex) y las técnicas de clarificado.',
      voiceGender: 'female'
    },
    userRole: 'Bartender & Storyteller en LOVO Bar',
    context: 'Dos clientes franceses apasionados por Josephine Baker se sientan en la barra. Desean degustar cócteles del Tomo I: La Musa y escuchar la historia detrás de bebidas como Red Moon, Sour Criollo, Jupe Banane, Chez Josephine y Danseur de Rue.',
    initialGreeting: '¡Bonjour! Practicaremos el nivel Pitch Two (B1-B2) del Tomo I: La Musa. Entran dos clientes interesados en la biografía emocional de Josephine Baker:\n\n"Good evening! We saw outside that your bar is dedicated to Josephine Baker. We adore her! Could you explain how your cocktail menu is structured around her life, and what is your favorite story behind a drink?"',
    initialTranslation: '¡Buenas noches! Vimos afuera que vuestro bar está dedicado a Josephine Baker. ¡La adoramos! ¿Podrías explicarnos cómo está estructurada la carta alrededor de su vida y cuál es tu historia favorita detrás de un cóctel?',
    initialTip: "Tip: Explica que el Tomo I divide su vida en 4 estadios emocionales: Amarga y Seca, Ácida, Dulce y Códex. Recomienda por ejemplo 'Jupe Banane' o 'Danseur de Rue': 'Our first volume follows Josephine Baker across four emotional stages: Bitter and Dry, Sour, Sweet, and Codex. I recommend Jupe Banane, celebrating her famous banana skirt in Paris!' [Au-er ferst vól-ium fó-lous Dchóu-se-fiin Béi-ker...]",
    difficulty: 'medium',
    targetEnglishLevel: 'B1',
    objectives: [
      { id: 't1-p2-obj-1', description: 'Explicar los 4 estadios emocionales del Tomo I (Bitter & Dry, Sour, Sweet, Codex) con elegancia', completed: false },
      { id: 't1-p2-obj-2', description: 'Narrar el storytelling de Jupe Banane (12€) o Danseur de Rue (12€) destacando ingredientes clarificados', completed: false },
      { id: 't1-p2-obj-3', description: 'Recomendar Chez Josephine (13€) con champagne o Sour Criollo (12€) con maridaje de raciones', completed: false },
      { id: 't1-p2-obj-4', description: 'Manejar preguntas sobre perfiles dulces vs amargos y sugerir segunda ronda de autor', completed: false }
    ],
    commonObjections: [
      "I love refreshing citrus drinks. Can you explain the difference between Sour Criollo and La Vie Est Belle?",
      "Tell us about her arrival in Paris in 1925. Which drink best captures that glamorous era?",
      "I prefer something completely dry and bitter like a Negroni twist. What would you suggest from the Bitter & Dry stage?"
    ],
    nicheVocabulary: [
      'Four emotional stages [For i-móu-sho-nal stéi-dchis] (Cuatro estadios emocionales)',
      'Bitter & Dry Stage [Bí-ter and Drai Stéidch] (Etapa Amarga y Seca)',
      'Sour Stage / Sweet Stage [Sáur Stéidch / Suiit Stéidch] (Etapa Ácida / Dulce)',
      'Codex Stage [Cóu-deks Stéidch] (Etapa Códex / Legado y madurez)',
      'Clarified banana & strawberry [Clá-ri-faid ba-ná-na and stró-be-ri] (Plátano y fresa clarificados)',
      'Chez Josephine [She Dchóu-se-fiin] (13€: Champagne, fresa, ginebra)',
      'Banana dance in 1925 Paris [Ba-ná-na dans in Pá-ris]',
      'Danseur de Rue [Dan-sér de Rú] (12€: Vodka Ketel One, té sencha, cardamomo)'
    ],
    createdAt: Date.now()
  },
  {
    id: 'lovo-tomo1-pitch3',
    title: 'LOVO Tomo I · Pitch Three (C1-C2): La Musa (Espionaje UV, Alta Mixología & Críticos)',
    niche: 'Tomo I: La Musa',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Julian Montgomery (Cocktail Historian & Spirits Journalist)',
      role: 'Historiador de coctelería internacional y articulista de Tales of the Cocktail',
      avatar: '🕵️',
      personality: 'Experto en coctelería histórica y técnicas botánicas avanzadas. Analiza la consistencia conceptual del menú, hace preguntas minuciosas sobre las tintas invisibles y busca un nivel de elocuencia y precisión técnica nativo.',
      voiceGender: 'male'
    },
    userRole: 'Head Bartender & Director de Sala en LOVO Bar',
    context: 'Julian visita LOVO Bar para escribir una reseña internacional sobre bares conceptuales en Madrid. Se enfoca en la etapa Códex y la labor de Josephine Baker como agente de contraespionaje de la Resistencia Francesa durante la Segunda Guerra Mundial.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch Three (C1-C2) del Tomo I: La Musa. Julian Montgomery se sienta en una esquina de la barra, examina la cristalería y te interpela con mirada inquisitiva:\n\n"Good evening. I have been analyzing how bars around Europe translate historical narratives into liquid form. In Volume I, how do you mathematically and sensorially balance Josephine\'s wartime intelligence work with the botanical formulation of Spy Códex? And what luminescence technology are you applying to the serve?"',
    initialTranslation: 'Buenas noches. He estado analizando cómo los bares europeos traducen narrativas históricas en forma líquida. En el Tomo I, ¿cómo equilibráis matemática y sensorialmente el trabajo de inteligencia en tiempos de guerra de Josephine con la formulación botánica de Spy Códex? ¿Y qué tecnología de luminiscencia aplicáis en el servicio?',
    initialTip: "Tip: Mantén un registro diplomático y sofisticado en inglés C1-C2. Explica la tinta botánica reactiva a luz UV (extracto de saúco y quinina natural) y cómo Josephine pasaba secretos militares en partituras con tinta invisible: 'Good evening, Julian. In Spy Códex, we honor her role in the French Resistance where she smuggled military secrets written in invisible ink across sheet music. We infuse natural botanical quinine and elderflower that react under a UV beam at the table...' [Gud ív-ning, Dchú-lian...]",
    difficulty: 'hard',
    targetEnglishLevel: 'C1',
    objectives: [
      { id: 't1-p3-obj-1', description: 'Articular con maestría en inglés C1 la labor de espionaje de Josephine y la tecnología botánica de Spy Códex (12€)', completed: false },
      { id: 't1-p3-obj-2', description: 'Debatir los matices de la etapa Códex (Oriental Códex, Le Champ Códex, Mediterranean Códex)', completed: false },
      { id: 't1-p3-obj-3', description: 'Justificar el perfil organoléptico (acidez, dilución térmica, tensión alcohólica) con vocabulario de sumillería', completed: false },
      { id: 't1-p3-obj-4', description: 'Elevar la experiencia comercial ofreciendo maridaje con destilados de colección de la cava privada', completed: false }
    ],
    commonObjections: [
      "Is the UV luminescence merely a theatrical gimmick, or does the quinine actually alter the retro-nasal botanical finish?",
      "In Le Champ Códex, why choose aged calvados over traditional Cognac to represent her post-war Normandy estate?",
      "Can you defend how Josephine's transition from the Danse Sauvage to French national hero is reflected across your spirit selections?"
    ],
    nicheVocabulary: [
      'French Resistance Counter-Intelligence [French Ri-sís-tans Caun-ter In-té-li-dchens]',
      'Botanical UV Photoluminescence [Bo-tá-ni-cal Yu-Vii Fóu-tou-lu-mi-né-sens]',
      'Spy Códex [Spai Cóu-deks] (12€: Grey Goose, elderflower, botanical invisible ink)',
      'Organoleptic equilibrium [Or-ga-no-lép-tic i-cui-lí-brium] (Equilibrio organoléptico)',
      'Sheet music encrypted secrets [Shiit miú-sic en-críp-ted sí-crets]',
      'Mediterranean Códex [Me-di-te-réi-nian Cóu-deks] (Fig leaf, bergamot, mastika)',
      'Thermal dilution & mouthfeel [Tér-mal dai-lú-shon and máuz-fiil]',
      'Post-war philanthropic legacy [Póust-uor fi-lan-tró-pic lé-ga-si]'
    ],
    createdAt: Date.now()
  },

  // ==========================================
  // TOMO II: TAXONOMÍA ANIMAL (EL LOBO & GASTRONOMÍA)
  // ==========================================
  {
    id: 'lovo-tomo2-pitch1',
    title: 'LOVO Tomo II · Pitch One (A1-A2): Taxonomía (La Leyenda del Lobo & Pedidos Básicos)',
    niche: 'Tomo II: Taxonomía Animal',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Oliver (Curious Traveler from London)',
      role: 'Turista británico paseando por el Barrio de las Letras',
      avatar: '🐺',
      personality: 'Curioso y conversador. Le llama la atención el nombre del bar "LOVO" y quiere saber por qué está decorado con lobos. Pide un cóctel fresco con ginebra o ron.',
      voiceGender: 'male'
    },
    userRole: 'Bartender / Camarero de LOVO Bar',
    context: 'Oliver entra a LOVO Bar tras pasear por la Calle Echegaray. Abre el Tomo II (Taxonomía Animal) y pregunta sobre la leyenda del lobo y un cóctel refrescante con ginebra.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch One (A1-A2) del Tomo II: Taxonomía Animal. Oliver se acerca a la barra sonriendo:\n\n"Hello! Excuse me, why is this place called LOVO with a V, and why are there wolves everywhere? Also, I would love a fresh gin drink. What do you have?"',
    initialTranslation: '¡Hola! Disculpa, ¿por qué este lugar se llama LOVO con V y por qué hay lobos por todas partes? Además, me encantaría una copa fresca con ginebra. ¿Qué tienes?',
    initialTip: "Tip: Explica que la calle se llamaba antiguamente Calle del Lobo en el siglo XVII y recomienda 'Mowgli' (13€) con Roku Gin: 'Welcome! This street was called Wolf Street in the 17th century. For gin, I recommend Mowgli—it has Roku Gin, pandan, and cardamom. It is very fresh and herbal!' [Uél-cam! Dis striit uos cold Uulf Striit...]",
    difficulty: 'easy',
    targetEnglishLevel: 'A2',
    objectives: [
      { id: 't2-p1-obj-1', description: 'Explicar de forma sencilla por qué se llama LOVO y el origen de la Calle del Lobo', completed: false },
      { id: 't2-p1-obj-2', description: 'Recomendar Mowgli (13€) destacando Roku Gin, pandan y cardamomo', completed: false },
      { id: 't2-p1-obj-3', description: 'Preguntar si prefiere hielo o cóctel en copa corta ("Do you prefer it on the rocks or straight up?")', completed: false },
      { id: 't2-p1-obj-4', description: 'Indicar el precio (13€) y ofrecer aceitunas o aperitivo de la casa', completed: false }
    ],
    commonObjections: [
      "Is Mowgli very sweet, or does it have a dry gin taste?",
      "What is pandan? Does it taste like vanilla or grass?",
      "Can I get a gin and tonic instead, or do you recommend trying Mowgli first?"
    ],
    nicheVocabulary: [
      'Wolf Street legend [Uulf Striit lé-dchend] (Leyenda de la Calle del Lobo)',
      'Calle Echegaray in Madrid [Cá-ye E-che-ga-rái]',
      'Roku Japanese Gin [Ró-cu Dcha-pa-níis Dchin]',
      'Mowgli Cocktail [Móu-gli Cóc-teil] (13€: Roku Gin, pandan, cardamomo)',
      'Fresh and herbal [Fresh and jér-bal] (Fresco y herbal)',
      'On the rocks [On de rocs] (Con cubitos de hielo)',
      'Thirteen euros [Zer-tíin iú-ros] (13€)',
      'House aperitif snacks [Jaus a-pe-ri-tíif snacks] (Aperitivo de la casa)'
    ],
    createdAt: Date.now()
  },
  {
    id: 'lovo-tomo2-pitch2',
    title: 'LOVO Tomo II · Pitch Two (B1-B2): Taxonomía (Coctelería Culinaria & Fábulas)',
    niche: 'Tomo II: Taxonomía Animal',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Liam & Marcus (Foodies & Gastronomic Travelers)',
      role: 'Aficionados a la alta gastronomía y restaurantes con Estrella Michelin',
      avatar: '🥩',
      personality: 'Viajeros culinarios que buscan experiencias gastronómicas líquidas. Les fascinan los ingredientes inusuales como hoja de ostra, salmueras, caldos clarificados y ahumados.',
      voiceGender: 'male'
    },
    userRole: 'Bartender Especialista en Coctelería Gastronómica',
    context: 'Dos comensales buscan experiencias culinarias líquidas. Desean conocer el capítulo El Festín del Tomo II y cócteles como Festín Marino, Festín Oriental, Festín Nórdico y Festín Maya, acompañados de raciones para picar.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch Two (B1-B2) del Tomo II: Taxonomía Animal. Dos comensales apasionados por la cocina se sientan en la barra:\n\n"Hello there! We heard LOVO has a complete volume called Animal Taxonomy dedicated to the wolf and culinary mixology. We love savory, umami, and smoked flavors. What are your most innovative culinary cocktails?"',
    initialTranslation: '¡Hola! Escuchamos que LOVO tiene un volumen completo llamado Taxonomía Animal dedicado al lobo y a la coctelería culinaria. Nos encantan los sabores salinos, umami y ahumados. ¿Cuáles son vuestros cócteles culinarios más innovadores?',
    initialTip: "Tip: Recomienda los cócteles del capítulo El Festín: Festín Marino (12€, hoja de ostra y vermut encurtido) o Festín Oriental (13€, agua clarificada de tomate y huevo de codorniz): 'Welcome! In Volume II, our Gastronomic Feast chapter features Festín Marino with oyster leaf and pickled vermouth, and Festín Oriental with clarified tomato water and marinated quail egg.' [Uél-cam! In vól-ium tuu...]",
    difficulty: 'medium',
    targetEnglishLevel: 'B2',
    objectives: [
      { id: 't2-p2-obj-1', description: 'Describir los ingredientes salinos y técnicas de Festín Marino (12€) y Festín Oriental (13€)', completed: false },
      { id: 't2-p2-obj-2', description: 'Recomendar opciones ahumadas como Festín Maya (13€) con mezcal o Mindfulness (13€)', completed: false },
      { id: 't2-p2-obj-3', description: 'Sugerir maridaje con raciones de jamón ibérico de bellota o quesos artesanos de la carta', completed: false },
      { id: 't2-p2-obj-4', description: 'Explicar las opciones sin gluten o con alérgenos presentes en el menú gastronómico', completed: false }
    ],
    commonObjections: [
      "An oyster leaf in a cocktail? What does it taste like, and how do you achieve that maritime flavor in Festín Marino?",
      "We want to share some food with these drinks. Which Spanish tapas complement umami cocktails best?",
      "Is Festín Maya very spicy with chipotle, or is the smoke smooth and well-balanced?"
    ],
    nicheVocabulary: [
      'Culinary mixology / Umami cocktails [Cú-li-na-ri mik-só-lo-dchi / U-má-mi]',
      'Oyster leaf & pickled vermouth [Óis-ter liif and pí-kold ver-mút] (Hoja de ostra y vermut encurtido)',
      'Clarified tomato water [Clá-ri-faid to-méi-tou uó-ter] (Agua clarificada de tomate)',
      'Marinated quail egg [Má-ri-nei-ted cueil eg] (Huevo de codorniz marinado)',
      'Smoked Mezcal Festín Maya [Smóukt Mes-cál Fes-tíin Má-ya] (13€: Mezcal, chipotle, maíz tostado)',
      'Acorn-fed Iberian ham pairing [Éi-corn fed ai-bí-rian jam pé-ring]',
      'Savory and saline notes [Séi-vo-ri and se-láin nóuts] (Notas salinas y sabrosas)',
      'Chosen pack / Wolfpack philosophy [Chóu-sen pak / Uulf-pak fi-ló-so-fi]'
    ],
    createdAt: Date.now()
  },
  {
    id: 'lovo-tomo2-pitch3',
    title: 'LOVO Tomo II · Pitch Three (C1-C2): Taxonomía (Soberanía del Lobo, Ahumados & Alta Cava)',
    niche: 'Tomo II: Taxonomía Animal',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Lord Alistair Sterling (Master of Spirits & Private Collector)',
      role: 'Sommelier internacional y juez de destilados espirituosos',
      avatar: '👑',
      personality: 'Coleccionista de whiskies Islay y destilados de terroir. Exige análisis de fenoles en partes por millón (PPM), crianza en barrica y una articulación filosófica profunda de la identidad del lobo.',
      voiceGender: 'male'
    },
    userRole: 'Bar Director & Creador de Cartas de LOVO Bar',
    context: 'Lord Alistair busca una degustación de alta complejidad sensorial en LOVO Bar. Desea evaluar el uso de destilados de turba (Islay Scotch) en cócteles como Mindfulness y debatir sobre la metáfora del lobo alfa vs manada comunitaria.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch Three (C1-C2) del Tomo II: Taxonomía Animal. Lord Alistair se sienta erguido, ajusta sus gemelos y te habla con tono pausado y aristocrático:\n\n"Good evening. I rarely frequent cocktail establishments unless they demonstrate a genuine reverence for peated malt and artisanal distillation. How does your Totem chapter conceptually reconcile the aggressiveness of Laphroaig 10 with the botanical subtlety of turmeric honey in Mindfulness? And why should a purist like myself drink peat in a mixed cocktail?"',
    initialTranslation: 'Buenas noches. Raras veces frecuento coctelerías a menos que demuestren una auténtica reverencia por la malta turbada y la destilación artesanal. ¿Cómo concilia conceptualmente vuestro capítulo El Tótem la agresividad de Laphroaig 10 con la sutileza botánica de la miel de cúrcuma en Mindfulness? ¿Y por qué un purista como yo debería beber turba en un cóctel?',
    initialTip: "Tip: Responde con máxima elegancia en inglés C1-C2. Defiende la combinación de Maker's Mark (bourbon de trigo dulce) con Laphroaig 10 (ahumado medicinal de Islay) y jengibre fresco como un puente entre fuerza y equilibrio: 'Good evening, my Lord. In Mindfulness, we do not mask the peat; we frame it. We pair the sweet wheat foundation of Maker\'s Mark with an aromatic wash of Laphroaig 10, softened by cold-pressed turmeric honey and ginger to create a contemplative harmony...' [Gud ív-ning, mai Lord...]",
    difficulty: 'hard',
    targetEnglishLevel: 'C1',
    objectives: [
      { id: 't2-p3-obj-1', description: 'Defender el equilibrio técnico de Mindfulness (13€) combinando Makers Mark, Laphroaig 10 y miel de cúrcuma', completed: false },
      { id: 't2-p3-obj-2', description: 'Articular la filosofía de la manada (the pack) como metáfora de hospitalidad honesta y familia elegida', completed: false },
      { id: 't2-p3-obj-3', description: 'Comparar destilados de agave ahumados (Mezcal Ojo de Tigre) frente a single malts de turba', completed: false },
      { id: 't2-p3-obj-4', description: 'Dirigir con éxito una venta de destilados top-shelf de colección (Hibiki, Macallan, Don Julio 1942)', completed: false }
    ],
    commonObjections: [
      "Does Laphroaig's medicinal iodine overpower the turmeric honey after the third sip?",
      "Many bars use smoke as a cheap sensory disguise. How do you guarantee terroir integrity across your smoked serves?",
      "I am accustomed to drinking my Islay malts neat with two drops of spring water. Convince me to let you serve it chilled."
    ],
    nicheVocabulary: [
      'Peated Islay Single Malt [Píi-ted Ái-la Sing-gol Molt]',
      'Phenolic parts per million (PPM) [Fe-nó-lic parts per mí-lion]',
      'Cold-pressed turmeric honey infusion [Cúrcuma y miel infusionada]',
      'Mindfulness Serve [Máind-ful-nes Serv] (Makers Mark, Laphroaig 10, ginger, turmeric)',
      'Terroir-driven Agave spirits [Mezcales y tequilas con sentido de terroir]',
      'Aromatic rinse vs direct wash [Enjuague aromático vs mezcla directa]',
      'Top-shelf reserve spirits collection [Colección de reserva de alta gama]',
      'Contemplative sensory equilibrium [Equilibrio sensorial contemplativo]'
    ],
    createdAt: Date.now()
  },

  // ==========================================
  // TOMO III: UTOPÍA CULTURAL & WORLD'S 50 BEST BARS
  // ==========================================
  {
    id: 'lovo-tomo3-pitch1',
    title: 'LOVO Tomo III · Pitch One (A1-A2): La Tribu (Culturas del Mundo & Sabores Tropicales)',
    niche: 'Tomo III: La Tribu Arcoíris',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Chloe (Student traveler from Sydney)',
      role: 'Joven viajera australiana en ruta por Europa',
      avatar: '🌈',
      personality: 'Alegre, entusiasta y abierta a nuevos sabores. Le atraen las presentaciones visuales coloridas y los sabores tropicales de América Latina y África.',
      voiceGender: 'female'
    },
    userRole: 'Bartender / Camarero de LOVO Bar',
    context: 'Chloe entra a LOVO Bar y queda fascinada por la portada del Tomo III: La Tribu Arcoíris. Quiere saber qué significa "La Tribu" y pide un cóctel tropical con ron o tequila que no sea demasiado ácido.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch One (A1-A2) del Tomo III: La Tribu Arcoíris. Chloe se sienta en la barra con una gran sonrisa:\n\n"Hi! Wow, this menu cover is gorgeous! What does \'The Rainbow Tribe\' mean? And could you recommend a delicious tropical cocktail with rum or tequila?"',
    initialTranslation: '¡Hola! ¡Guau, la portada de esta carta es hermosa! ¿Qué significa "La Tribu Arcoíris"? ¿Y podrías recomendarme un cóctel tropical delicioso con ron o tequila?',
    initialTip: "Tip: Saluda cordialmente, explica que Josephine Baker adoptó a 12 niños de distintos países como su 'Tribu Arcoíris' y recomienda 'Manabi' (13€) con Ron Bumbu, piña y coco: 'Welcome to LOVO! The Rainbow Tribe honors Josephine Baker\'s 12 adopted children from different cultures. For tropical rum, I recommend Manabi—it has Bumbu Rum, pineapple, and coconut. It is tropical and delicious!' [Uél-cam tu Ló-vo! De Réin-bou Traib ó-nors...]",
    difficulty: 'easy',
    targetEnglishLevel: 'A2',
    objectives: [
      { id: 't3-p1-obj-1', description: 'Explicar de forma sencilla qué es la Tribu Arcoíris de Josephine Baker (12 hijos adoptivos)', completed: false },
      { id: 't3-p1-obj-2', description: 'Recomendar Manabi (13€) o Bötúku (12€) explicando sus ingredientes tropicales', completed: false },
      { id: 't3-p1-obj-3', description: 'Preguntar por alergias a frutas o frutos secos ("Do you have any food allergies?")', completed: false },
      { id: 't3-p1-obj-4', description: 'Indicar el precio con simpatía y atender con agilidad según el protocolo LOVO', completed: false }
    ],
    commonObjections: [
      "Is Manabi served in a special cup, or just in a regular glass?",
      "Does it have dairy, or is the foam made from plant ingredients?",
      "Can I pay with contactless Apple Pay?"
    ],
    nicheVocabulary: [
      'The Rainbow Tribe [De Réin-bou Traib] (La Tribu Arcoíris)',
      'Twelve adopted children [Tuélv a-dóp-ted chíl-dren] (12 hijos adoptivos)',
      'Tropical and refreshing [Tró-pi-cal and ri-fré-shing] (Tropical y refrescante)',
      'Manabi Cocktail [Ma-na-bí Cóc-teil] (13€: Ron Bumbu, piña centrifugada, coco)',
      'Bötúku [Bö-tú-cu] (12€: Ron Arehucas, banana, ginger beer)',
      'Any food allergies? [É-ni fud á-ler-dchis?] (¿Alguna alergia alimentaria?)',
      'Contactless card payment [Cón-tact-les card péi-ment]',
      'Enjoy your tropical cocktail! [En-dchói iur tró-pi-cal cóc-teil!]'
    ],
    createdAt: Date.now()
  },
  {
    id: 'lovo-tomo3-pitch2',
    title: 'LOVO Tomo III · Pitch Two (B1-B2): La Tribu (The World\'s 50 Best Bars & Alérgenos)',
    niche: 'Tomo III: La Tribu Arcoíris',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Sofia & Alex (Global Travelers from New York)',
      role: 'Turistas internacionales que frecuentan los mejores bares del mundo (Handshake, Employees Only)',
      avatar: '🌍',
      personality: 'Clientes neoyorquinos cosmopolitas que conocen bares internacionales como Handshake (#1 del Mundo 2024) y Employees Only. Preguntan por los cócteles hermanados del Tomo III y uno de ellos tiene alergia severa a los cacahuetes y frutos secos.',
      voiceGender: 'female'
    },
    userRole: 'Bartender & Embajador de Marcas Internacionales',
    context: 'Dos clientes de Nueva York reconocen en la carta colaboraciones con Handshake (México), Employees Only (NYC) y Svanen (Oslo). Además, uno de ellos tiene alergia severa al cacahuete y a las nueces. El bartender debe guiarlos con seguridad quirúrgica.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch Two (B1-B2) del Tomo III: La Tribu Arcoíris. Dos clientes de Nueva York se acercan con gran curiosidad:\n\n"Good evening! Wow, we see on your menu cocktails honoring Handshake in Mexico and Employees Only from our hometown NYC! How did these collaborations come together? Also, I have a severe nut and peanut allergy—could you guide us safely through the menu?"',
    initialTranslation: '¡Buenas noches! ¡Guau, vemos en vuestra carta cócteles en honor a Handshake en México y Employees Only de nuestra ciudad, Nueva York! ¿Cómo surgieron estas colaboraciones? Además, tengo alergia severa a los cacahuetes y a los frutos secos, ¿podrías guiarnos de forma segura por la carta?',
    initialTip: "Tip: Agradece su visita, destaca el cóctel EO-Manhattan (15€) o Sencha de Handshake (14€) y advierte de inmediato sobre Boazu (nuez) y Upina Ñawi (cacahuete): 'Welcome! In Volume III we celebrate our Bar Tribe with 7 of the world\'s best bars, including EO-Manhattan. Regarding allergies, avoid Boazu and Upina Ñawi as they contain nuts and peanuts. Sencha or Tomato & Strawberry are completely safe!' [Uél-cam! In vól-ium zrii uii cé-le-breit...]",
    difficulty: 'medium',
    targetEnglishLevel: 'B2',
    objectives: [
      { id: 't3-p2-obj-1', description: 'Explicar el hermanamiento de LOVO Bar con los 7 bares del mundo (Handshake, Svanen, EO, CoChinChina)', completed: false },
      { id: 't3-p2-obj-2', description: 'Recomendar Sencha By Handshake (14€) o EO-Manhattan (15€) con precisión de destilados', completed: false },
      { id: 't3-p2-obj-3', description: 'Gestionar con seguridad quirúrgica las alergias a nueces y cacahuetes (descartando Boazu y Upina Ñawi)', completed: false },
      { id: 't3-p2-obj-4', description: 'Explicar el protocolo de cuenta no dividida y cobrar con elegancia al finalizar', completed: false }
    ],
    commonObjections: [
      "I am strictly allergic to peanuts and walnuts. Please confirm double-check which cocktails and bar snacks I must avoid!",
      "Tell us about Sencha! Handshake was crowned #1 in The World's 50 Best Bars 2024—how is their cocktail made here at LOVO?",
      "Can we order food at the bar? We would love to pair our drinks with your Spanish cheese or acorn-fed Iberian ham selection."
    ],
    nicheVocabulary: [
      'The Rainbow Tribe [De Réin-bou Traib] (La Tribu Arcoíris de Josephine Baker)',
      'World’s 50 Best Bars collaboration [Uorlds Fíf-ti Best Bars co-la-bo-réi-shon]',
      'Handshake Speakeasy Mexico (#1 in the World 2024)',
      'Sencha Cocktail [Sén-cha Cóc-teil] (14€: Dobel Tequila, Sake, Hojicha cordial, Yuzu)',
      'EO-Manhattan [Ii-Ou Man-já-tan] (15€: Michters Rye, Cocchi Rosso, Grand Marnier)',
      'Severe peanut and nut allergy [Se-víer pí-nat and nat á-ler-dchi] (Alergia severa a cacahuetes y nueces)',
      'Cross-contamination prevention [Cros con-ta-mi-néi-shon pri-vén-shon] (Prevención de contaminación cruzada)',
      'Honest Hospitality manifesto [Ó-nest jos-pi-tá-li-ti ma-ni-fés-tou] (Manifiesto de Hospitalidad Honesta)'
    ],
    createdAt: Date.now()
  },
  {
    id: 'lovo-tomo3-pitch3',
    title: 'LOVO Tomo III · Pitch Three (C1-C2): La Tribu (Vanguardia Global & Destilados de Colección)',
    niche: 'Tomo III: La Tribu Arcoíris',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Elena Rostova (International 50 Best Academy Chair & Luxury Consultant)',
      role: 'Presidenta de jurado de The World’s 50 Best Bars y consultora de alta hospitalidad',
      avatar: '💎',
      personality: 'Máxima autoridad global en bares de vanguardia. Evalúa hospitalidad honesta, diplomacia cultural, trazabilidad de ingredientes endémicos y capacidad de upselling con destilados ultra-premium.',
      voiceGender: 'female'
    },
    userRole: 'Bar Manager & Embajador Global de LOVO Bar',
    context: 'Elena visita LOVO Bar para una auditoría sensorial de la carta internacional. Evalúa cómo el Tomo III representa la diversidad cultural sin caer en clichés y solicita una cata maridada con los tequilas y whiskies más exclusivos de la casa.',
    initialGreeting: '¡Hola! Practicaremos el nivel Pitch Three (C1-C2) del Tomo III: La Tribu Arcoíris. Elena toma asiento en el centro de la barra, examina el libro y te habla en un inglés impecable:\n\n"Good evening. I have witnessed bar partnerships across Tokyo, London, and Buenos Aires. Volume III represents an ambitious global manifesto. How do you ensure that cocktails honoring bars like Svanen in Oslo or Handshake in Mexico maintain their indigenous identity while coexisting seamlessly under LOVO’s French Art Déco aesthetic? And what top-shelf spirit flight would you curate to accompany this tasting?"',
    initialTranslation: 'Buenas noches. He presenciado alianzas entre bares en Tokio, Londres y Buenos Aires. El Tomo III representa un ambicioso manifiesto global. ¿Cómo garantizáis que los cócteles en honor a bares como Svanen en Oslo o Handshake en México mantengan su identidad autóctona mientras coexisten armónicamente bajo la estética Art Déco francesa de LOVO? ¿Y qué vuelo de destilados de alta gama curaríais para acompañar esta cata?',
    initialTip: "Tip: Mantén un diálogo de alta diplomacia en inglés C1-C2. Explica que LOVO comparte la técnica de origen respetando la botánica endémica y ofrece un maridaje con destilados de colección como Don Julio 1942 (40€), Casa Dragones (35€) o Hibiki Harmony (15€): 'Good evening, Elena. Volume III is built on Honest Hospitality—we do not replicate drinks; we translate bar philosophies. For instance, Tomato & Strawberry honors Svanen\'s minimalist Nordic clarification, while Sencha embodies Handshake\'s Japanese-Mexican precision. To elevate this journey, I would pair it with a flight featuring Casa Dragones Joven and Don Julio 1942...' [Gud ív-ning, E-lé-na...]",
    difficulty: 'hard',
    targetEnglishLevel: 'C2',
    objectives: [
      { id: 't3-p3-obj-1', description: 'Defender el concepto de Hospitalidad Honesta y la traducción de identidades de los 7 mejores bares del mundo', completed: false },
      { id: 't3-p3-obj-2', description: 'Detallar las técnicas de clarificación nórdica en Tomato & Strawberry by Svanen (15€) y botánicos japoneses en Sencha (14€)', completed: false },
      { id: 't3-p3-obj-3', description: 'Curar una venta sugestiva de destilados ultra-premium: Don Julio 1942 (40€) o Casa Dragones (35€)', completed: false },
      { id: 't3-p3-obj-4', description: 'Cerrar la sesión demostrando soltura ejecutiva bilingüe al nivel de directores de hospitalidad internacional', completed: false }
    ],
    commonObjections: [
      "In Tomato & Strawberry by Svanen, how do you preserve the acidity of fresh tomato water without curdling the spirit base?",
      "Why charge 15€ for an EO-Manhattan when a classic Manhattan costs less? Justify the provenance of Michter's Rye and Cocchi Rosso.",
      "Can your staff articulate the difference between Tequila Casa Dragones Joven and standard blanco tequilas to an American connoisseur?"
    ],
    nicheVocabulary: [
      'Honest Hospitality Manifesto [Ó-nest Jos-pi-tá-li-ti Ma-ni-fés-tou]',
      'The World’s 50 Best Bars Academy [Uorlds Fíf-ti Best Bars A-cá-de-mi]',
      'Nordic clarification & aquavit botanicals [Clarificación nórdica]',
      'Tomato & Strawberry by Svanen Oslo (15€)',
      'Michter’s Kentucky Straight Rye Whiskey [Míck-ters Rái]',
      'Casa Dragones Joven Maestro Tequilero (35€ / serve)',
      'Don Julio 1942 Añejo Tequila (40€ / serve)',
      'Indigenous botanicals & cultural diplomacy [Diplomacia cultural y botánicos autóctonos]'
    ],
    createdAt: Date.now()
  },

  // ==========================================
  // HIGH-TICKET UP-SELLING & ALÉRGENOS AVANZADOS
  // ==========================================
  {
    id: 'lovo-upselling-allergens',
    title: 'LOVO Bar: Up-Selling Maestro & Destilados Top-Shelf (High-Ticket)',
    niche: 'LOVO Bar: Up-Selling & Alérgenos',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'Victoria & Richard (Corporate Executives celebrating a deal)',
      role: 'Directivos internacionales de finanzas celebrando un cierre de negocio en Madrid',
      avatar: '💎',
      personality: 'Clientes de alto poder adquisitivo buscando destilados excepcionales (Don Julio 1942, Hibiki Harmony, Macallan, Casa Dragones, Zacapa 23) y un servicio de barra impecable sin importar el precio.',
      voiceGender: 'female'
    },
    userRole: 'Head Bartender / Bar Manager en LOVO Bar',
    context: 'Una pareja de ejecutivos celebra un éxito empresarial en LOVO Bar. Han terminado su primera ronda y desean pasar a destilados exclusivos de alta gama. Es el momento perfecto para aplicar el Paso 5 del protocolo de LOVO: Up-selling de venta sugestiva.',
    initialGreeting: '¡Hola! Practicaremos el Up-selling de alta gama. Una pareja de ejecutivos termina su primera copa y mira la estantería prémium de la barra:\n\n"That was a wonderful start! We just closed a major international acquisition today and want to celebrate in style. Could you recommend your top-tier tequilas or rare whiskies, and perhaps some exceptional bites to share?"',
    initialTranslation: '¡Ese fue un comienzo maravilloso! Acabamos de cerrar una adquisición internacional importante hoy y queremos celebrarlo por todo lo alto. ¿Podrías recomendarnos tus tequilas de gama alta o whiskies exclusivos, y quizás algunos bocados excepcionales para compartir?',
    initialTip: "Tip: Felicítalos, sugiere destilados de colección de la estantería (Don Julio 1942 a 40€, Casa Dragones a 35€, o Hibiki Harmony a 15€) y ofrece raciones de Jamón Ibérico de bellota: 'Congratulations on your acquisition! To celebrate in style, I highly recommend our Don Julio 1942 or Casa Dragones Joven tequila, paired with our 100% acorn-fed Iberian ham.' [Con-gra-chu-léi-shons! Tu cé-le-breit in stáil, ai jái-li re-co-ménd...]",
    difficulty: 'hard',
    targetEnglishLevel: 'B2',
    objectives: [
      { id: 'up-obj-1', description: 'Felicitar cordialmente y aplicar la técnica de up-selling en 2ª ronda según el protocolo LOVO', completed: false },
      { id: 'up-obj-2', description: 'Prescribir destilados top-shelf: Don Julio 1942 (40€), Casa Dragones (35€), Hibiki (15€) o Macallan (18€)', completed: false },
      { id: 'up-obj-3', description: 'Venta sugestiva de comida: ofrecer jamón ibérico de bellota o selección de quesos para maridar', completed: false },
      { id: 'up-obj-4', description: 'Presentar la cuenta total dividida a partes iguales con elegancia y despedida memorable', completed: false }
    ],
    commonObjections: [
      "We want to try something extraordinarily smooth and complex. How does Don Julio 1942 compare to Casa Dragones Joven?",
      "We are feeling a bit peckish. What savoury dishes from your food menu pair best with aged agave or peated Scotch?",
      "Could we have the bill? We would like to pay by corporate Amex and split the payment."
    ],
    nicheVocabulary: [
      'Congratulations on your success! [Con-gra-chu-léi-shons on iur sac-sés!]',
      'Top-shelf spirits collection [Top-shelf spí-rits co-lék-shon] (Colección de destilados de gama alta)',
      'Don Julio 1942 Añejo Tequila (40€ / glass) [Don Dchú-lio]',
      'Casa Dragones Joven Tequila (35€ / glass) [Cá-sa Dra-gó-nes]',
      'Hibiki Japanese Harmony Whisky (15€ / glass) [Ji-bí-ki]',
      'Acorn-fed 100% Iberian Ham [Éi-corn fed ai-bí-rian jam] (Jamón ibérico 100% bellota)',
      'Artisanal cheese platter pairing [Ar-tí-si-nal chiis plá-ter pé-ring] (Maridaje con tabla de quesos)',
      'Corporate expense bill [Cór-po-reit eks-péns bil] (Factura de gastos corporativos)'
    ],
    createdAt: Date.now()
  },

  // ==========================================
  // ESCENARIO CORPORATIVO DE CONTROL / SERVICIOS
  // ==========================================
  {
    id: 'auxiliar-servicios-administrativos-generales',
    title: 'Auxiliar Administrativo y Servicios Generales: Atención en Oficina Internacional',
    niche: 'Administración & Servicios Generales',
    businessKnowledge: `DOCUMENTO OPERATIVO: MANUAL DE ATENCIÓN EN SEDE CORPORATIVA
1. RECEPCIÓN Y ACREDITACIÓN: Pedir documento oficial, cotejar cita previa en sistema ERP, emitir acreditación de visitante y llamar al anfitrión.
2. SALAS Y REUNIONES: Confirmar disponibilidad en calendario corporativo, revisar proyector HDMI, rotafolios y servicio de cortesía.
3. PAQUETERÍA Y CORRESPONDENCIA: Firmar albaranes de mensajería urgente, clasificar por departamento y archivar acuse de recibo.
4. MANTENIMIENTO E INCIDENCIAS: Reportar climatización, iluminación o suministros de oficina al equipo de mantenimiento mediante ticket urgente.`,
    aiCharacter: {
      name: 'Mr. Arthur Evans & International Visitors',
      role: 'Visitante corporativo internacional y supervisor de área',
      avatar: '🏢',
      personality: 'Tutor interactivo y visitante internacional. Te presenta situaciones habituales de recepción, paquetería, salas de reuniones y reporte de averías. Te guía con explicaciones y pronunciación fonética paso a paso.',
      voiceGender: 'male'
    },
    userRole: 'Auxiliar de Servicios Administrativos y Generales',
    context: 'Trabajas en la sede corporativa de una entidad internacional. Tus tareas combinan recepción y acreditación de visitas, gestión de paquetería/correspondencia, coordinación de salas de reuniones y reporte de incidencias en las instalaciones.',
    initialGreeting: '¡Hola! Bienvenido a tu entrenamiento como Auxiliar de Servicios Administrativos y Generales. Practicaremos las 3 áreas: atención de visitas, gestión de correspondencia e intendencia de instalaciones.\n\nEmpecemos con la primera situación: Entro por la puerta principal de la oficina y me acerco a tu mostrador de recepción:\n\n"Good morning! I have an appointment at 10:00 AM with the Department Director, Mr. Smith. Could you please sign me in and give me a visitor badge? Also, I was told meeting room B is booked for us."',
    initialTranslation: '¡Buenos días! Tengo una cita a las 10:00 AM con el Director del Departamento, el Sr. Smith. ¿Podría registrarme y darme un pase de visitante? Además, me dijeron que la sala de reuniones B está reservada para nosotros.',
    initialTip: "Tip: Saluda con amabilidad, pide su nombre y documento para registrarlo en el sistema y entrégale el pase diciendo: 'Good morning! Welcome. May I see your ID, please? Here is your visitor badge.' [Gud mór-ning! Uél-cam. Méi ai sii iur ai-dii, plis? Jíer is iur ví-si-tor badch.]",
    difficulty: 'easy',
    targetEnglishLevel: 'A2',
    objectives: [
      { id: 'admin-obj-1', description: 'Recepción y acreditación de visitas: Pedir ID, registrar en el sistema y entregar el pase de visitante ("May I see your ID? Here is your visitor badge")', completed: false },
      { id: 'admin-obj-2', description: 'Logística de salas y agenda: Indicar la ubicación de la sala de reuniones ("Meeting room B is on the second floor, down the hall to the right")', completed: false },
      { id: 'admin-obj-3', description: 'Trámite de correspondencia y paquetería: Recepcionar paquete urgente y firmar la entrega ("I will sign for the parcel, log it, and notify Mr. Smith")', completed: false },
      { id: 'admin-obj-4', description: 'Supervisión de instalaciones e incidencias: Atender reporte de avería (climatización / proyector) y avisar a mantenimiento ("I will report the issue to our maintenance team right away")', completed: false }
    ],
    commonObjections: [
      "I forgot my passport in my hotel, but I have a clear photo of my ID on my phone. Can you register me with this digital copy?",
      "The courier is here at the front desk with three urgent packages that need a signature and secure storage. Where should I sign?",
      "Excuse me, the air conditioning in meeting room B is too cold and the HDMI cable is missing. Can you contact maintenance or bring a spare cable?",
      "We ran out of printer paper and whiteboard markers for our corporate presentation. Do you have office supplies in stock?"
    ],
    nicheVocabulary: [
      'Good morning, welcome! [Gud mór-ning, uél-cam!]',
      'May I see your ID, please? [Méi ai sii iur ai-dii, plis?]',
      'Visitor badge / Pass [Ví-si-tor badch / Pas] (Acreditación de visitante)',
      'Sign in the register [Sáin in de ré-dchis-ter] (Firmar en el registro de entrada)',
      'Please take a seat [Plis téik a siit] (Por favor, tome asiento)',
      'Meeting room B, second floor [Míiting rum bii, sé-cond flor] (Sala B, segunda planta)',
      'Down the hall on the right [Daun de jol on de ráit] (Al final del pasillo a la derecha)',
      'Urgent parcel / Courier delivery [Úr-dchent pár-sel / Cú-rier di-lí-ve-ri] (Paquete urgente / Mensajería)',
      'I will log it and notify them [Ai uil log it and nóu-ti-fai dem] (Lo registraré y les avisaré)',
      'Air conditioning / Maintenance team [Er con-dí-sho-ning / Méin-te-nans tiim] (Climatización / Equipo de mantenimiento)',
      'Office supplies stock [Ó-fis sa-pláis stok] (Material de oficina / Reposición)',
      'I will report the incident right away [Ai uil ri-pórt di ín-si-dent ráit a-uéi] (Avisaré de la incidencia de inmediato)'
    ],
    createdAt: Date.now()
  }
];
