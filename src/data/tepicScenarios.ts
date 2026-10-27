import type { Scenario } from '../types';
import { TEPIC_MASTER_KNOWLEDGE } from './tepicKnowledge';

export const TEPIC_SCENARIOS: Scenario[] = [
  {
    id: 'tepic-pitch1',
    title: 'Tepic · Pitch One: Bienvenida, Mesa o Barra y Primeros Tacos',
    niche: 'Restaurante Tepic · Michelin Bib Gourmand',
    workspaceId: 'tepic-madrid',
    aiCharacter: {
      name: 'Oliver & Emma (Pareja de Londres)',
      role: 'Clientes ingleses en Tepic Madrid (Ayala 14)',
      avatar: '🥑',
      personality: 'Turistas amables y con apetito, recién llegados del Barrio de Salamanca. Quieren probar comida mexicana auténtica pero necesitan guía con las opciones y bebidas.',
      voiceGender: 'female'
    },
    userRole: 'Camarero de Sala / Barra en Restaurante Tepic',
    context: 'Oliver y Emma entran al Restaurante Tepic (Ayala 14). No tienen reserva y dudan entre tomar una copa en la barra o sentarse a cenar. Conoces la carta oficial: Guacamole (16€), Tacos al Pastor (29€), Tacos Cochinita Pibil (28,50€) y Margaritas de autor (12€). Tu misión es recibirles con calidez, ubicarles, sugerir un cóctel de bienvenida con Guacamole y tomar su comanda de tacos.',
    initialGreeting: 'Good evening! We don’t have a reservation, but we heard this is the best authentic Mexican restaurant in Madrid. Do you have a table for two?',
    initialTranslation: '¡Buenas noches! No tenemos reserva, pero hemos oído que este es el mejor restaurante mexicano auténtico de Madrid. ¿Tienen mesa para dos?',
    initialTip: 'Tip Pitch One: Saluda cordialmente en inglés y ofréceles mesa o barra: "Good evening! Welcome to Tepic. Yes, table or bar, please?" [Gud ív-ning! Uél-cam tu Té-pic. Ies, téibol or bar, plis?]',
    difficulty: 'easy',
    targetEnglishLevel: 'A1',
    objectives: [
      { id: 'tepic1-obj-1', description: 'Saludar con calidez en inglés mencionando Tepic y ofrecer mesa o asiento en barra', completed: false },
      { id: 'tepic1-obj-2', description: 'Sugerir la Margarita Tepic de autor (12€) o bebida refrescante para empezar', completed: false },
      { id: 'tepic1-obj-3', description: 'Up-selling: Ofrecer el Guacamole casero con totopos (16€) para compartir al centro', completed: false },
      { id: 'tepic1-obj-4', description: 'Recomendar los Tacos al Pastor (29€) o Cochinita Pibil (28,50€) y tomar la comanda', completed: false }
    ],
    commonObjections: [
      'Is the food very spicy? We are a bit sensitive to hot chili peppers.',
      'Are the tortillas gluten-free? Emma has a mild wheat intolerance.',
      'Could we have a classic Margarita and maybe a beer to start?'
    ],
    nicheVocabulary: [
      'Welcome to Tepic! [Uél-cam tu Té-pic!]',
      'Table or bar? [Téibol or bar?]',
      'Our signature Tepic Margarita (12€) [Áu-er síg-na-chur Té-pic Mar-ga-rí-ta]',
      'Fresh homemade Guacamole with corn chips (16€) [Fresh jóum-méid Gua-ca-mó-le]',
      'Traditional tacos al Pastor with pork and pineapple (29€) [Tá-cos al Pas-tor]',
      '100% nixtamalized corn tortillas, gluten-free [Glú-ten fri tor-tí-ias]'
    ],
    businessKnowledge: TEPIC_MASTER_KNOWLEDGE,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'tepic-pitch2',
    title: 'Tepic · Pitch Two: Especialidades del Chef, Alérgenos & Mezcal Artesanal',
    niche: 'Restaurante Tepic · Michelin Bib Gourmand',
    workspaceId: 'tepic-madrid',
    aiCharacter: {
      name: 'Marcus & Chloe (Directores de Silicon Valley)',
      role: 'Ejecutivos gastronómicos exigentes cenando en Tepic',
      avatar: '🌮',
      personality: 'Clientes cosmopolitas y apasionados de los destilados de agave. Preguntan en detalle por las técnicas culinarias, los pescados frescos de los tacos y los alérgenos.',
      voiceGender: 'male'
    },
    userRole: 'Jefe de Rango / Bartender Senior en Tepic',
    context: 'Marcus y Chloe se sientan en el salón principal de Tepic. Quieren explorar la parte marina y gourmet de la carta: Tacos Gobernador con camarones (29,50€), Tacos Baja California de pescado crujiente (29€) y Aguachile verde (26,50€). Quieren saber sobre el picante, el origen del mezcal de Oaxaca y cómo se elabora la masa de maíz.',
    initialGreeting: 'Good evening! We are really excited to be here. We love genuine regional Mexican food, not Tex-Mex. What seafood tacos and specialty mezcal would you recommend tonight?',
    initialTranslation: '¡Buenas noches! Estamos muy emocionados de estar aquí. Nos encanta la comida mexicana regional auténtica, no el Tex-Mex. ¿Qué tacos de pescado/marisco y qué mezcal especial nos recomiendas para esta noche?',
    initialTip: 'Tip Pitch Two: Destaca los Tacos Gobernador de Sinaloa y los Baja California, y sugiere una Mezcalita artesanal con sal de gusano: "I highly recommend our Tacos Gobernador with sautéed prawns and Oaxaca cheese, paired with our artisanal Mezcalita from Oaxaca."',
    difficulty: 'medium',
    targetEnglishLevel: 'B1',
    objectives: [
      { id: 'tepic2-obj-1', description: 'Explicar con soltura la diferencia entre los Tacos Gobernador (Sinaloa) y los Tacos Baja California (pescado en tempura)', completed: false },
      { id: 'tepic2-obj-2', description: 'Recomendar el Aguachile verde de camarón (26,50€) aclarando el nivel de picante y frescura', completed: false },
      { id: 'tepic2-obj-3', description: 'Presentar la Mezcalita de Oaxaca (13€) con mezcal Espadín y sal de chiles artesanal', completed: false },
      { id: 'tepic2-obj-4', description: 'Verificar alérgenos (mariscos, gluten, lácteos) con protocolo impecable de sala', completed: false }
    ],
    commonObjections: [
      'We noticed you have tacos with cheese. Can they be prepared dairy-free for my partner?',
      'Can you explain the difference between tequila and artisanal mezcal in simple terms?',
      'Is the Aguachile too spicy to enjoy with a white wine?'
    ],
    nicheVocabulary: [
      'Sautéed prawns with poblano peppers and melted Oaxaca cheese [Gobernador]',
      'Crispy battered white fish with chipotle mayo and red cabbage [Baja California]',
      'Fresh raw prawns marinated in lime juice with serrano chili [Aguachile]',
      'Artisanal smoky Mezcal Espadín from Oaxaca (13€) [Mes-cal Es-pa-dín]',
      'Nixtamalization: ancient Mexican process making corn easier to digest and aromatic'
    ],
    businessKnowledge: TEPIC_MASTER_KNOWLEDGE,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'tepic-pitch3',
    title: 'Tepic · Pitch Three: Experiencia Michelin Bib Gourmand, Enmoladas & Maridaje',
    niche: 'Restaurante Tepic · Michelin Bib Gourmand',
    workspaceId: 'tepic-madrid',
    aiCharacter: {
      name: 'Chef Julian & Sommelier Beatrice',
      role: 'Críticos gastronómicos de Nueva York visitando Madrid',
      avatar: '🍷',
      personality: 'Muy sofisticados, conocedores de la alta cocina internacional y la Guía Michelin. Buscan la complejidad del Mole Poblano tradicional, la carta de vinos y destilados añejos.',
      voiceGender: 'female'
    },
    userRole: 'Maitre / Sumiller Principal en Restaurante Tepic',
    context: 'Cena de degustación para una pareja de expertos gastronómicos en Tepic. Preguntan por la distinción Bib Gourmand de Tepic, la complejidad histórica del Mole Poblano casero (más de 25 ingredientes con cacao y chiles secos) en las Enmoladas (26,90€), y buscan un maridaje de vinos blancos y tintos españoles con postres caseros y café de olla tradicional.',
    initialGreeting: 'Good evening. We booked specifically because of Tepic’s Michelin Bib Gourmand recognition. We are particularly interested in the historical complexity of your Mole Poblano and how you pair Mexican spices with your wine list.',
    initialTranslation: 'Buenas noches. Reservamos específicamente por el reconocimiento Bib Gourmand de Tepic. Estamos muy interesados en la complejidad histórica de su mole poblano y cómo maridan las especias mexicanas con su carta de vinos.',
    initialTip: 'Tip Pitch Three: Comunica con elegancia la historia del mole poblano (chocolate amargo, frutos secos y chiles ahumados) y sugiere un maridaje contrastado con vino tinto con crianza o blanco estructurado.',
    difficulty: 'hard',
    targetEnglishLevel: 'C1',
    objectives: [
      { id: 'tepic3-obj-1', description: 'Narrar con maestría el concepto Michelin Bib Gourmand de Tepic y el legado del maíz nixtamalizado', completed: false },
      { id: 'tepic3-obj-2', description: 'Describir los más de 25 ingredientes del Mole Poblano artesanal de las Enmoladas (26,90€)', completed: false },
      { id: 'tepic3-obj-3', description: 'Up-selling: Sugerir maridaje de vinos (Albariño para entrantes, Ribera del Duero para el mole)', completed: false },
      { id: 'tepic3-obj-4', description: 'Cierre de alto ticket: Ofrecer degustación de mezcal de guarda con Café de Olla tradicional (4,50€)', completed: false }
    ],
    commonObjections: [
      'Some people find mole overly sweet due to chocolate. How does your chef balance acidity and umami?',
      'Wouldn’t high tannins in a red wine clash aggressively with Mexican chili capsaicin?',
      'Can you recommend a digestif that represents the finest artisanal distillation in Mexico?'
    ],
    nicheVocabulary: [
      'Michelin Bib Gourmand: exceptional cuisine at accessible value',
      'Artisanal Mole Poblano with bitter Mexican cacao, dried chiles, and spices',
      'Enmoladas: corn tortillas filled with shredded chicken and drenched in rich mole',
      'Wine pairing balance: crisp acidity to cut through richness, low tannins for spice',
      'Traditional clay-pot Café de Olla with piloncillo raw cane sugar and cinnamon (4,50€)'
    ],
    businessKnowledge: TEPIC_MASTER_KNOWLEDGE,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];
