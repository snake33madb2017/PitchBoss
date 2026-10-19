import type { Scenario } from '../types';

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'lovo-bar-staff-hospitality',
    title: 'Staff LOVO Bar: Atención a Clientes Internacionales (Nivel A1 / Principiante)',
    niche: 'Coctelería & Hospitalidad (LOVO Bar Madrid)',
    aiCharacter: {
      name: 'James & Sarah (LOVO Bar)',
      role: 'Clientes extranjeros y guía en LOVO Bar (Calle Echegaray 20)',
      avatar: '🍸',
      personality: 'Tutor empático y cercano. Te guía en español, te explica la situación, interpreta a clientes extranjeros y te ayuda a pronunciar las frases en inglés paso a paso.',
      voiceGender: 'male'
    },
    userRole: 'Camarero / Bartender de LOVO Bar',
    context: 'Estás en LOVO Bar (Calle Echegaray 20, Madrid). Tu tutor te guía en español paso a paso para atender clientes internacionales con frases cortas de nivel A1.',
    initialGreeting: '¡Hola! Bienvenido a tu entrenamiento en LOVO Bar. Yo seré tu cliente internacional y tu tutor. Empecemos: entro al bar y me acerco a ti.\n\nHello! Good evening, a table for two, please!',
    initialTranslation: '¡Hola! Buenas noches, ¿una mesa para dos, por favor?',
    initialTip: "Tip: Saluda y pregúntales si prefieren mesa o barra diciendo: 'Welcome to LOVO Bar! Table or bar?' [Uél-cam tu Lovo Bar! Téibol or bar?]",
    difficulty: 'easy',
    targetEnglishLevel: 'A1',
    objectives: [
      { id: 'obj-1', description: 'Dar la bienvenida y ubicar a los clientes ("Welcome to Lovo Bar! Table or bar?")', completed: false },
      { id: 'obj-2', description: 'Recomendar un cóctel de Lovo Bar ("I recommend the Bubi or Manabi cocktail / Sweet or fresh?")', completed: false },
      { id: 'obj-3', description: 'Ofrecer comida o alternativa sin alcohol ("We have Iberian Ham, cheese board or 0.0 cocktails")', completed: false },
      { id: 'obj-4', description: 'Indicar los baños y cobrar la cuenta ("Restrooms are downstairs / Card or cash?")', completed: false }
    ],
    commonObjections: [
      "We don't speak Spanish, could you recommend something sweet and fruity from your cocktail menu?",
      "Do you have any snacks or tapas like Iberian ham or a cheese board to pair with the drinks?",
      "Excuse me, where are the restrooms? And could we have the bill to pay by credit card?"
    ],
    nicheVocabulary: [
      'Welcome to Lovo Bar [Uél-cam tu Lovo Bar]',
      'Table or bar? [Téibol or bar?]',
      'What would you like to drink? [Uát uud iu laik tu drink?]',
      'Bubi Cocktail (Dulce, plátano, cacao y ginger beer)',
      'Manabi Cocktail (Afrutado, piña, coco y toque picante)',
      'Cocktail 0,0: Josephine Baker (Sin alcohol)',
      'Jamón Ibérico & Cheese Board [Tapas y placeres]',
      'One moment, please [Uán móment, plis]',
      'Restrooms are downstairs [Rest-rums ar daun-stérs]',
      'Card or cash? [Card or cash?]',
      'Have a great night! [Jav a greit náit!]'
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
