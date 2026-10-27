export interface TepicMenuItem {
  id: string;
  category: 'antojitos' | 'tacos' | 'principales' | 'cocteles' | 'vinos';
  name: string;
  price: string;
  description_es: string;
  description_en: string;
  origin_story: string;
  pairing_tip_en: string;
  phonetic_pitch_es: string;
  allergens: string[];
  isGlutenFree: boolean;
  isChefSpecial?: boolean;
  spiciness: 'none' | 'mild' | 'medium' | 'hot';
}

export const TEPIC_MENU_ITEMS: TepicMenuItem[] = [
  // 1. Antojitos
  {
    id: 'tepic-guacamole',
    category: 'antojitos',
    name: 'Guacamole Tradicional Tepic',
    price: '16,00 €',
    description_es: 'Aguacate Hass seleccionado, cebolla tierna, cilantro, tomate y lima fresca. Acompañado de totopos caseros.',
    description_en: 'Fresh Hass avocado, sweet onion, fresh cilantro, tomato, and key lime. Served in volcanic stone with artisanal corn chips.',
    origin_story: 'Receta ancestral mexicana servida en molcajete de piedra volcánica.',
    pairing_tip_en: 'May I start you off with our fresh handmade Guacamole for the table to share?',
    phonetic_pitch_es: 'Uúd iu láik tu trái áu-er fresh jóum-méid Gua-ca-mó-le tu sher?',
    allergens: [],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-panuchos',
    category: 'antojitos',
    name: 'Panuchos Yucatecos (3 uds.)',
    price: '16,50 €',
    description_es: 'Tortillas de maíz fritas rellenas de frijol negro colado con cochinita pibil y cebolla morada encurtida.',
    description_en: 'Crispy fried corn tortillas stuffed with refried black beans, topped with slow-roasted pork and pickled red onions.',
    origin_story: 'Bocadillo tradicional de la península de Yucatán.',
    pairing_tip_en: 'I recommend our Panuchos from Yucatán, topped with slow-roasted achiote pork.',
    phonetic_pitch_es: 'Ai re-co-mend áu-er Pa-nú-chos from Iu-ca-tán uid slóu-róus-tid pork.',
    allergens: [],
    isGlutenFree: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-sopecitos',
    category: 'antojitos',
    name: 'Sopecitos de Maíz (3 uds.)',
    price: '16,50 €',
    description_es: 'Base de masa de maíz con bordes pellizcados, frijoles refritos y opción de flor de calabaza o pastor.',
    description_en: 'Thick handmade corn patties with pinched edges, refried beans, with squash blossom or pastor pork.',
    origin_story: 'Antojito de mercado central de la Ciudad de México.',
    pairing_tip_en: 'Our Sopecitos with squash blossoms are a wonderful vegetarian option to begin with.',
    phonetic_pitch_es: 'Áu-er So-pe-cí-tos ar a uón-der-ful vedch-i-té-rian óp-shon tu be-guín.',
    allergens: ['Lácteos'],
    isGlutenFree: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-flautas',
    category: 'antojitos',
    name: 'Flautas Crujientes de Pollo (3 uds.)',
    price: '17,50 €',
    description_es: 'Tortillas de maíz doradas y crujientes rellenas de pechuga de pollo, crema agria, salsa verde y queso cotija.',
    description_en: 'Rolled and crispy golden corn tortillas filled with shredded chicken, Mexican sour cream, tomatillo salsa, and cotija cheese.',
    origin_story: 'Un clásico popular del centro de México.',
    pairing_tip_en: 'Our crispy chicken Flautas pair wonderfully with a fresh draft beer or our house margarita.',
    phonetic_pitch_es: 'Áu-er cris-pi chík-en Fláu-tas per uón-der-ful-li uid a fresh draft bír.',
    allergens: ['Lácteos'],
    isGlutenFree: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-aguachile',
    category: 'antojitos',
    name: 'Aguachile Verde de Camarón',
    price: '26,50 €',
    description_es: 'Langostinos frescos marinados al momento en jugo de lima verde, cilantro, chile serrano y pepino crujiente.',
    description_en: 'Fresh raw prawns marinated in freshly squeezed lime juice, serrano chili, crisp cucumber, and red onion.',
    origin_story: 'Receta de la costa del Pacífico de Sinaloa y Nayarit.',
    pairing_tip_en: 'The Aguachile is vibrant, zesty, and spicy—magnificent when paired with an Albariño white wine.',
    phonetic_pitch_es: 'De A-gua-chí-le is vái-brant and spái-si, mag-ní-fi-sent uid an Al-ba-rí-ño uáit uáin.',
    allergens: ['Crustáceos'],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'hot'
  },

  // 2. Tacos de Autor
  {
    id: 'tepic-taco-pastor',
    category: 'tacos',
    name: 'Tacos al Pastor Tradicionales',
    price: '29,00 €',
    description_es: 'Cerdo marinado en adobo casero de chiles secos y especias, cocinado en trompo, piña caramelizada, cebolla y cilantro.',
    description_en: 'Marinated pork roasted on a vertical spit, topped with grilled caramelized pineapple, onions, and fresh cilantro.',
    origin_story: 'El taco más emblemático de México, cocinado al fuego vivo con piña asada.',
    pairing_tip_en: 'You must taste our signature Tacos al Pastor—sweet pineapple perfectly balances the savory adobo pork.',
    phonetic_pitch_es: 'Iu mast téist áu-er síg-na-chur Tá-cos al Pas-tor—suít páin-á-pel per-fect-li bál-an-ses de pork.',
    allergens: [],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-taco-cochinita',
    category: 'tacos',
    name: 'Tacos de Cochinita Pibil (Yucatán)',
    price: '28,50 €',
    description_es: 'Cerdo desmigado cocinado lentamente durante 8 horas en hoja de plátano con pasta de achiote y cebolla morada encurtida.',
    description_en: 'Slow-cooked shredded pork roasted for 8 hours in banana leaves with achiote spice and pickled red onions.',
    origin_story: 'Herencia maya cocinada bajo tierra en el estado de Yucatán.',
    pairing_tip_en: 'Our Cochinita Pibil is slow-roasted for 8 hours, incredibly tender and aromatic.',
    phonetic_pitch_es: 'Áu-er Co-chi-ní-ta Pi-bíl is slóu-róus-tid for éit áu-ers, in-créd-i-bli tén-der.',
    allergens: [],
    isGlutenFree: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-taco-gobernador',
    category: 'tacos',
    name: 'Tacos Gobernador de Camarón (Sinaloa)',
    price: '29,50 €',
    description_es: 'Camarones salteados con pimientos y chile poblano, cubiertos con queso Oaxaca fundido en tortilla dorada.',
    description_en: 'Sautéed prawns with sweet bell peppers and poblano chili, topped with melted Oaxaca cheese in toasted corn tortilla.',
    origin_story: 'Nacido en Mazatlán, Sinaloa, para agasajar a un gobernador que amaba los camarones con queso.',
    pairing_tip_en: 'The Gobernador tacos feature juicy prawns with melted Oaxaca cheese, a guest favorite.',
    phonetic_pitch_es: 'De Go-ber-na-dór tá-cos fít-chur dchú-si próns uid mél-ted Oa-já-ca chís.',
    allergens: ['Crustáceos', 'Lácteos'],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-taco-baja',
    category: 'tacos',
    name: 'Tacos Baja California de Pescado',
    price: '29,00 €',
    description_es: 'Pescado blanco crujiente en tempura ligera, mayonesa artesanal de chile chipotle, col lombarda y lima.',
    description_en: 'Crispy tempura white fish, artisanal smoky chipotle mayonnaise, pickled red cabbage, and fresh lime.',
    origin_story: 'Estilo Ensenada, Baja California, meca del taco de pescado en México.',
    pairing_tip_en: 'Our Baja fish tacos offer a crispy crunch with smoky chipotle mayo. Ideal with a Mezcalita.',
    phonetic_pitch_es: 'Áu-er Bá-ja fish tá-cos ó-fer a cris-pi crunch uid smóu-ki chi-pót-le méi-o.',
    allergens: ['Pescado', 'Huevo'],
    isGlutenFree: false,
    spiciness: 'mild'
  },

  // 3. Principales
  {
    id: 'tepic-enmoladas',
    category: 'principales',
    name: 'Enmoladas con Mole Poblano Casero',
    price: '26,90 €',
    description_es: 'Tortillas de maíz rellenas de pollo deshebrado, bañadas en mole poblano artesanal (más de 25 ingredientes con cacao y chiles secos), sésamo y queso.',
    description_en: 'Corn tortillas filled with shredded chicken, drenched in authentic homemade Mole Poblano (over 25 ingredients with Mexican dark cacao and dry chiles), sesame seeds, and cheese.',
    origin_story: 'Puebla de los Ángeles, la cumbre del mestizaje culinario de México.',
    pairing_tip_en: 'Our Mole Poblano is our masterpiece, made with rich Mexican dark chocolate and roasted chiles.',
    phonetic_pitch_es: 'Áu-er Mó-le Po-blá-no is áu-er mas-ter-pís, méid uid rich Méx-i-can dark chó-co-lat.',
    allergens: ['Frutos secos', 'Lácteos', 'Sésamo'],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'medium'
  },
  {
    id: 'tepic-pozole',
    category: 'principales',
    name: 'Pozole Rojo Tradicional',
    price: '22,00 €',
    description_es: 'Caldo ancestral de granos de maíz cacahuazintle con cerdo tierno, rábano, orégano, lechuga y lima.',
    description_en: 'Ancestral red broth made with heirloom white corn and tender pork, served with radishes, oregano, and lime.',
    origin_story: 'Plato festivo prehispánico de Guerrero y Jalisco.',
    pairing_tip_en: 'The Pozole is a warm, deeply comforting ancestral corn stew enjoyed at Mexican celebrations.',
    phonetic_pitch_es: 'De Po-só-le is a uórm, díp-li cóm-for-ting an-cés-tral corn stiú.',
    allergens: [],
    isGlutenFree: true,
    spiciness: 'mild'
  },

  // 4. Coctelería de Autor
  {
    id: 'tepic-margarita',
    category: 'cocteles',
    name: 'Margarita Tepic de Autor',
    price: '12,00 €',
    description_es: 'Tequila 100% de agave azul, Cointreau, lima fresca recién exprimida y sal ahumada de gusano en el ribete. Opciones: Clásica, Mango o Tamarindo.',
    description_en: '100% blue agave tequila, premium Cointreau, freshly squeezed key lime, and artisanal worm salt rim. Options: Classic, Mango, or Tamarind.',
    origin_story: 'El cóctel firma de Tepic con balance perfecto entre acidez cítrica y dulzor de agave.',
    pairing_tip_en: 'Would you like to start with our signature Tepic Margarita? We can prepare it classic or with tropical mango.',
    phonetic_pitch_es: 'Uúd iu láik tu start uid áu-er síg-na-chur Té-pic Mar-ga-rí-ta?',
    allergens: [],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'none'
  },
  {
    id: 'tepic-mezcalita',
    category: 'cocteles',
    name: 'Mezcalita Artesanal de Oaxaca',
    price: '13,00 €',
    description_es: 'Mezcal Espadín joven artesanal de Oaxaca, zumo de lima, néctar de agave orgánico y escarchado de sal de chiles.',
    description_en: 'Artisanal young Espadín Mezcal from Oaxaca, fresh lime juice, organic agave nectar, and chili salt rim.',
    origin_story: 'Destilación tradicional en alambiques de cobre y hornos cónicos de tierra.',
    pairing_tip_en: 'If you enjoy smoky flavors, our artisanal Mezcalita pairs extraordinarily well with tacos and mole.',
    phonetic_pitch_es: 'If iu en-dchói smóu-ki fléi-vors, áu-er ar-tí-sa-nal Mes-ca-lí-ta pers ex-tra-ór-di-na-ri-li uél.',
    allergens: [],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'mild'
  },
  {
    id: 'tepic-paloma',
    category: 'cocteles',
    name: 'Paloma Clásica Tepic',
    price: '12,00 €',
    description_es: 'Tequila reposado 100% agave, refresco artesanal de pomelo rosa (grapefruit), lima y sal marina rosa.',
    description_en: '100% blue agave reposado tequila, artisanal pink grapefruit soda, key lime, and pink sea salt.',
    origin_story: 'El cóctel más bebido en las cantinas de Jalisco.',
    pairing_tip_en: 'Our Paloma is crisp, fizzy, and exceptionally refreshing on a warm evening.',
    phonetic_pitch_es: 'Áu-er Pa-ló-ma is crisp, fíz-zi, and ex-sép-shon-al-li re-fresh-ing.',
    allergens: [],
    isGlutenFree: true,
    spiciness: 'none'
  },
  {
    id: 'tepic-mocktail-coco',
    category: 'cocteles',
    name: 'Beso de Coco (Sin Alcohol)',
    price: '11,00 €',
    description_es: 'Puré cremoso de coco, piña asada caramelizada y toque de lima ácida.',
    description_en: 'Creamy coconut purée, roasted caramelized pineapple, and a touch of tart key lime.',
    origin_story: 'Mocktail refrescante inspirado en las playas de Nayarit.',
    pairing_tip_en: 'We also offer our delicious non-alcoholic Beso de Coco mocktail.',
    phonetic_pitch_es: 'Uii ól-so ó-fer áu-er de-lí-shus non al-co-hól-ic Bé-so de Có-co moc-teil.',
    allergens: [],
    isGlutenFree: true,
    spiciness: 'none'
  },

  // 5. Vinos & Digestivos
  {
    id: 'tepic-vino-blanco',
    category: 'vinos',
    name: 'Albariño Rías Baixas / Verdejo Rueda',
    price: '28,00 € / Copa: 5,50 €',
    description_es: 'Vinos blancos españoles de marcada acidez y notas cítricas, elegidos para limpiar el paladar entre bocados especiados.',
    description_en: 'Crisp Spanish white wines with lively acidity and citrus notes, handpicked to cleanse the palate between spiced bites.',
    origin_story: 'Selección exclusiva de la bodega de Tepic para maridar con mariscos y ceviches.',
    pairing_tip_en: 'A crisp Albariño white wine cuts wonderfully through the richness of our fish tacos and guacamole.',
    phonetic_pitch_es: 'A crisp Al-ba-rí-ño uáit uáin cuts uón-der-ful-li thru de rich-nes of áu-er fish tá-cos.',
    allergens: ['Sulfitos'],
    isGlutenFree: true,
    spiciness: 'none'
  },
  {
    id: 'tepic-vino-tinto',
    category: 'vinos',
    name: 'Ribera del Duero Crianza / Rioja de Autor',
    price: '34,00 € / Copa: 6,50 €',
    description_es: 'Tintos elegantes con notas de fruta negra madura y barrica sutil, con taninos pulidos que armonizan con el mole y solomillo.',
    description_en: 'Elegant Spanish red wines with ripe black fruit and subtle French oak, featuring soft tannins that harmonize with mole and beef.',
    origin_story: 'Maridaje estelar recomendado por nuestro sumiller para carnes y moles.',
    pairing_tip_en: 'Our Ribera del Duero red wine offers ripe fruit and soft tannins that harmonize with our Mole Poblano.',
    phonetic_pitch_es: 'Áu-er Ri-bé-ra del Dué-ro red uáin ó-fers ráip frut and soft tán-nins.',
    allergens: ['Sulfitos'],
    isGlutenFree: true,
    spiciness: 'none'
  },
  {
    id: 'tepic-cafe-olla',
    category: 'cocteles',
    name: 'Café de Olla Tradicional Mexicano',
    price: '4,50 €',
    description_es: 'Café de altura infusionado en olla de barro con canela en rama y piloncillo (azúcar de caña morena no refinada).',
    description_en: 'Single-origin Mexican coffee slow-infused in clay pots with raw piloncillo cane sugar and whole cinnamon sticks.',
    origin_story: 'El broche de oro tradicional tras una sobremesa mexicana.',
    pairing_tip_en: 'To finish your dinner, can I suggest our traditional clay-pot Café de Olla with cinnamon and piloncillo?',
    phonetic_pitch_es: 'Tu fín-ish iur dín-ner, can ai sug-dchést áu-er tra-dí-sho-nal clei-pot Ca-fé de Ó-ia?',
    allergens: [],
    isGlutenFree: true,
    isChefSpecial: true,
    spiciness: 'none'
  }
];
