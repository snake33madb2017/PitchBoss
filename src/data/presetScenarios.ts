import type { Scenario } from '../types';
import { LOVO_BAR_MASTER_KNOWLEDGE } from './lovoBarKnowledge';

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'lovo-bar-staff-hospitality',
    title: 'Coctelería LOVO Bar - Madrid (Atención Internacional & Carta Oficial)',
    niche: 'Coctelería Emocional & Hospitalidad (LOVO Bar - Calle Echegaray 20, Madrid)',
    businessKnowledge: LOVO_BAR_MASTER_KNOWLEDGE,
    aiCharacter: {
      name: 'James & Sarah (Clientes Internacionales en LOVO Bar)',
      role: 'Clientes extranjeros en barra y tutor bilingüe en LOVO Bar',
      avatar: '🍸',
      personality: 'Tutor interactivo y cliente internacional. Habla en inglés cuando actúa como cliente en barra (preguntando por cócteles de autor, recomendaciones, destilados premium y comida) y te guía en español con corrección fonética inmediata y consejos prácticos basados en el protocolo oficial de LOVO Bar.',
      voiceGender: 'male'
    },
    userRole: 'Bartender / Camarero de LOVO Bar',
    context: 'Estás atendiendo en la barra de LOVO Bar (Calle Echegaray 20, Madrid). Conoces al detalle la filosofía de Coctelería Emocional inspirada en Joséphine Baker, los espacios de La Caza y La Cueva, el protocolo de 8 pasos (bienvenida en 40s, posavasos, agua de cortesía, sugerencias en pizarra, elaboración visible, up-selling de calidad, cuenta no fraccionada) y toda la carta oficial (Las Tribus como Bubi o Manabi, Animal Tótem, Lovo Lovers, Long Drinks, destilados y comida).',
    initialGreeting: '¡Hola! Bienvenido a tu entrenamiento en LOVO Bar. Hoy pondrás en práctica la atención en barra con clientes internacionales usando la carta real y los 8 pasos de hospitalidad.\n\nEntro a LOVO Bar por primera vez, me siento en la barra y te miro con curiosidad:\n\n"Good evening! It’s our first time here at LOVO Bar. Could you tell us what this place is about, and what would you recommend to start?"',
    initialTranslation: '¡Buenas noches! Es nuestra primera vez aquí en LOVO Bar. ¿Podrías contarnos de qué trata el local y qué nos recomendarías para empezar?',
    initialTip: "Tip: Aplica el Paso 1 del protocolo LOVO (Welcome): saluda en menos de 40s, extiende los posavasos, ofrece agua de bienvenida y explica que es una coctelería emocional inspirada en Josephine Baker: 'Welcome to LOVO! We are an emotional cocktail bar inspired by Josephine Baker. Here is some water to welcome you. Would you like to explore our menu?' [Uél-cam tu Ló-vo! Uii ar an i-móu-sho-nal cóc-teil bar...]",
    difficulty: 'easy',
    targetEnglishLevel: 'A1',
    objectives: [
      { id: 'obj-1', description: 'Bienvenida en 40s y presentación LOVO: Saludar, servir agua de cortesía y explicar la Coctelería Emocional inspirada en Josephine Baker', completed: false },
      { id: 'obj-2', description: 'Toma de comanda e indagación de gustos: Preguntar por preferencias (dulce, cítrico, afrutado, picante) y recomendar cócteles de la carta (Bubi, Manabi, Jupe Banane)', completed: false },
      { id: 'obj-3', description: 'Up-selling de calidad & Alergias: Consultar intolerancias y ofrecer up-selling en 2ª ronda (Bourbon/Rye superior, Negroni week o tablas de jamón ibérico/quesos)', completed: false },
      { id: 'obj-4', description: 'Cuenta dividida y despedida calurosa: Entregar la cuenta total dividida a partes iguales y despedir con agradecimiento según el protocolo', completed: false }
    ],
    commonObjections: [
      "It's our first time at LOVO Bar. Could you explain the concept and recommend a signature cocktail that is fruity and slightly spicy?",
      "I have a peanut and gluten allergy. Which signature cocktails or food bites from your menu are completely safe for me?",
      "For our second round, can you recommend a high-end Bourbon or a premium Rye whiskey from your top shelf?",
      "Could we have the bill, please? We would like to pay by credit card and split the total equally."
    ],
    nicheVocabulary: [
      'Welcome to LOVO Bar! [Uél-cam tu Ló-vo Bar!] (Bienvenida)',
      'Emotional Cocktail Bar [I-móu-sho-nal Cóc-teil Bar] (Coctelería emocional)',
      'Complimentary welcome water [Com-pli-mén-ta-ri uél-cam uó-ter] (Agua de bienvenida)',
      'Bubi Cocktail [Bú-bi Cóc-teil] (12€: Ron Arehucas, plátano, cacao, ginger beer - Dulce)',
      'Manabi Cocktail [Ma-na-bí Cóc-teil] (13€: Ron Bumbu, piña, coco, picante - Afrutado)',
      'Samurai Cocktail [Sa-mu-rái Cóc-teil] (15€: Hibiki Harmony, pandan, nori - Umami)',
      'Jupe Banane [Dchup Ba-nán] (12€: Grey Goose, plátano maduro, frambuesa)',
      'La Caza & La Cueva [Event and cocktail spaces for up to 50 guests]',
      'Do you have any food allergies or intolerances? [Du iu jav é-ni fud á-ler-dchis?]',
      'Up-selling: Premium Bourbon or Rye [Prí-mium Bór-bon or Rai]',
      'We divide the total bill equally [Uii di-váid de tóu-tal bil í-cua-li]',
      'Thank you for visiting LOVO, have a wonderful night! [Jav a uán-der-ful náit!]'
    ],
    createdAt: Date.now()
  },
  {
    id: 'auxiliar-servicios-administrativos-generales',
    title: 'Auxiliar Administrativo y Servicios Generales: Atención en Oficina Internacional',
    niche: 'Administración & Servicios Generales (Office & Facilities Support)',
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
