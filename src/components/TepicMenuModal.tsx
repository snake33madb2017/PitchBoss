import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Wheat,
  Flame,
  Award,
  UtensilsCrossed,
  Wine,
  GlassWater,
  Info,
  ExternalLink
} from 'lucide-react';
import { TEPIC_MENU_ITEMS, type TepicMenuItem } from '../data/tepicMenuData';

interface TepicMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDishForTraining?: (dishName: string, pitchPhrase: string) => void;
}

export const TepicMenuModal: React.FC<TepicMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectDishForTraining
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'antojitos' | 'tacos' | 'principales' | 'cocteles' | 'vinos'>('all');
  const [activeDietFilter, setActiveDietFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return TEPIC_MENU_ITEMS.filter((item) => {
      // Category
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;

      // Diet & tag filters
      if (activeDietFilter === 'gluten-free' && !item.isGlutenFree) return false;
      if (activeDietFilter === 'chef-special' && !item.isChefSpecial) return false;
      if (activeDietFilter === 'no-spicy' && item.spiciness !== 'none' && item.spiciness !== 'mild') return false;
      if (activeDietFilter === 'spicy' && (item.spiciness === 'none' || item.spiciness === 'mild')) return false;
      if (activeDietFilter === 'vegetarian' && item.allergens.includes('Mariscos') && item.allergens.includes('Pescado')) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchEs = item.description_es.toLowerCase().includes(q);
        const matchEn = item.description_en.toLowerCase().includes(q);
        const matchStory = item.origin_story.toLowerCase().includes(q);
        const matchAllergens = item.allergens.some((a) => a.toLowerCase().includes(q));
        if (!matchName && !matchEs && !matchEn && !matchStory && !matchAllergens) return false;
      }

      return true;
    });
  }, [activeCategory, activeDietFilter, searchQuery]);

  const handleCopyPitch = (item: TepicMenuItem) => {
    navigator.clipboard.writeText(item.pairing_tip_en);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
    if (onSelectDishForTraining) {
      onSelectDishForTraining(item.name, item.pairing_tip_en);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in font-sans">
      <div 
        className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-[#B39964]/40 shadow-black/80"
        style={{ backgroundColor: '#1A1917' }}
      >
        {/* TOP HEADER: Tepic Authentic Cantera Slate & Ochre Gold */}
        <header 
          className="relative px-5 sm:px-7 py-4 sm:py-5 border-b border-[#38342D] flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ backgroundColor: '#21201E' }}
        >
          {/* Brand Info with Official Tepic Logo */}
          <div className="flex items-center gap-4">
            <div 
              className="px-2.5 py-1.5 rounded-2xl flex items-center justify-center shadow-lg bg-[#FAF7F2] border border-[#B39964]/60 shrink-0"
              title="Restaurante Tepic · Madrid"
            >
              <img 
                src="/images/logos/tepic-logo.png" 
                alt="Logo Oficial Restaurante Tepic" 
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-white">
                  RESTAURANTE TEPIC
                </h1>
                <span 
                  className="px-2.5 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 border shadow-sm"
                  style={{ backgroundColor: '#2E281E', color: '#E8D4A2', borderColor: '#B39964' }}
                >
                  <Award className="w-3.5 h-3.5 text-[#B39964]" /> Michelin Bib Gourmand
                </span>
                <span 
                  className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full border"
                  style={{ backgroundColor: '#1E3327', color: '#A7F3D0', borderColor: '#2D7D52' }}
                >
                  Oasis Mexicano · Ayala 14
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-0.5 font-normal text-stone-300">
                Carta Oficial & Protocolo de Pitch en Inglés · Barrio de Salamanca, Madrid
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* External Official Link */}
            <a
              href="https://www.tepic.es/carta/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#38342D] bg-[#282622] hover:bg-[#322F2A] text-stone-300 hover:text-white transition"
              title="Abrir web oficial de Tepic"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#B39964]" />
              <span>tepic.es</span>
            </a>

            {/* Language Switch */}
            <div className="flex items-center rounded-xl p-1 border border-[#38342D] bg-[#171614] text-xs font-bold">
              <button
                onClick={() => setLang('es')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'es' ? 'bg-[#B39964] text-stone-950 shadow font-black' : 'text-stone-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  lang === 'en' ? 'bg-[#B39964] text-stone-950 shadow font-black' : 'text-stone-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#38342D] bg-[#282622] hover:bg-[#38342D] text-stone-300 hover:text-white transition"
              title="Cerrar carta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* CONTROLS BAR: Category Tabs, Search & Diet Filters */}
        <div className="p-4 sm:p-5 border-b border-[#38342D] space-y-3" style={{ backgroundColor: '#1E1D1A' }}>
          {/* Main Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                activeCategory === 'all'
                  ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md font-black'
                  : 'bg-[#282622] text-stone-300 border-[#38342D] hover:border-[#B39964]/50 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Toda la Carta ({TEPIC_MENU_ITEMS.length})
            </button>
            <button
              onClick={() => setActiveCategory('antojitos')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                activeCategory === 'antojitos'
                  ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md font-black'
                  : 'bg-[#282622] text-stone-300 border-[#38342D] hover:border-[#B39964]/50 hover:text-white'
              }`}
            >
              🥑 Antojitos & Entrantes
            </button>
            <button
              onClick={() => setActiveCategory('tacos')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                activeCategory === 'tacos'
                  ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md font-black'
                  : 'bg-[#282622] text-stone-300 border-[#38342D] hover:border-[#B39964]/50 hover:text-white'
              }`}
            >
              🌮 Tacos de Autor (Maíz Nixtamalizado)
            </button>
            <button
              onClick={() => setActiveCategory('principales')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                activeCategory === 'principales'
                  ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md font-black'
                  : 'bg-[#282622] text-stone-300 border-[#38342D] hover:border-[#B39964]/50 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" /> Platos Fuertes & Moles
            </button>
            <button
              onClick={() => setActiveCategory('cocteles')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                activeCategory === 'cocteles'
                  ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md font-black'
                  : 'bg-[#282622] text-stone-300 border-[#38342D] hover:border-[#B39964]/50 hover:text-white'
              }`}
            >
              <GlassWater className="w-4 h-4" /> Mezcales & Coctelería
            </button>
            <button
              onClick={() => setActiveCategory('vinos')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                activeCategory === 'vinos'
                  ? 'bg-[#B39964] text-stone-950 border-[#B39964] shadow-md font-black'
                  : 'bg-[#282622] text-stone-300 border-[#38342D] hover:border-[#B39964]/50 hover:text-white'
              }`}
            >
              <Wine className="w-4 h-4" /> Vinos Seleccionados
            </button>
          </div>

          {/* Search + Dietary Pill Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B39964]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar taco, tequila, mole, alérgenos..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#171614] border border-[#38342D] text-white text-xs sm:text-sm placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B39964]/30 focus:border-[#B39964] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-0.5 no-scrollbar text-xs">
              <button
                onClick={() => setActiveDietFilter('all')}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  activeDietFilter === 'all'
                    ? 'bg-[#B39964] text-stone-950 font-bold border-[#B39964]'
                    : 'bg-[#282622] text-stone-300 border-[#38342D] hover:bg-[#322F2A]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveDietFilter(activeDietFilter === 'gluten-free' ? 'all' : 'gluten-free')}
                className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1 whitespace-nowrap ${
                  activeDietFilter === 'gluten-free'
                    ? 'bg-[#1E3327] text-[#A7F3D0] font-bold border-[#2D7D52]'
                    : 'bg-[#282622] text-stone-300 border-[#38342D] hover:bg-[#322F2A]'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-emerald-400" /> Sin Gluten (Maíz 100%)
              </button>
              <button
                onClick={() => setActiveDietFilter(activeDietFilter === 'chef-special' ? 'all' : 'chef-special')}
                className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1 whitespace-nowrap ${
                  activeDietFilter === 'chef-special'
                    ? 'bg-[#332A1C] text-[#FDE68A] font-bold border-[#B39964]'
                    : 'bg-[#282622] text-stone-300 border-[#38342D] hover:bg-[#322F2A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B39964]" /> Estrellas de la Casa
              </button>
              <button
                onClick={() => setActiveDietFilter(activeDietFilter === 'no-spicy' ? 'all' : 'no-spicy')}
                className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1 whitespace-nowrap ${
                  activeDietFilter === 'no-spicy'
                    ? 'bg-[#1E3327] text-[#A7F3D0] font-bold border-[#2D7D52]'
                    : 'bg-[#282622] text-stone-300 border-[#38342D] hover:bg-[#322F2A]'
                }`}
              >
                Suave / Sin Picante
              </button>
              <button
                onClick={() => setActiveDietFilter(activeDietFilter === 'spicy' ? 'all' : 'spicy')}
                className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1 whitespace-nowrap ${
                  activeDietFilter === 'spicy'
                    ? 'bg-[#3A1E1E] text-[#FECACA] font-bold border-red-500/60'
                    : 'bg-[#282622] text-stone-300 border-[#38342D] hover:bg-[#322F2A]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400" /> Picante Auténtico
              </button>
            </div>
          </div>
        </div>

        {/* MAIN BODY: Grid of Cards (High Contrast Cantera Stone & Mexican Gold) */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain" style={{ backgroundColor: '#151412' }}>
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#24221E] flex items-center justify-center text-[#B39964] mb-3">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No se encontraron platos ni bebidas</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                Prueba buscando otros términos o elimina los filtros de búsqueda aplicados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#38342D] p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-200 group hover:border-[#B39964]/70"
                  style={{ backgroundColor: '#21201E' }}
                >
                  <div>
                    {/* Header Row: Title & Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 
                          className="font-serif font-black text-base sm:text-lg leading-tight text-white group-hover:text-[#FDE68A] transition"
                        >
                          {item.name}
                        </h3>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#B39964] mt-1">
                          {item.category === 'antojitos' && 'Antojito Tradicional'}
                          {item.category === 'tacos' && 'Taco de Autor · 100% Maíz'}
                          {item.category === 'principales' && 'Plato Fuerte · Cocina Ancestral'}
                          {item.category === 'cocteles' && 'Coctel de Mezcal / Tequila'}
                          {item.category === 'vinos' && 'Vino Seleccionado'}
                        </p>
                      </div>
                      <div 
                        className="font-serif font-black text-base whitespace-nowrap px-3 py-1 rounded-xl shadow-sm"
                        style={{ backgroundColor: '#2E281E', color: '#F3E5AB', border: '1px solid #B39964' }}
                      >
                        {item.price}
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                      {item.isChefSpecial && (
                        <span 
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border"
                          style={{ backgroundColor: '#2E281E', color: '#FDE68A', borderColor: '#B39964' }}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-[#B39964]" /> Recomendación del Chef
                        </span>
                      )}
                      {item.isGlutenFree && (
                        <span 
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border"
                          style={{ backgroundColor: '#1A2B20', color: '#A7F3D0', borderColor: '#2D7D52' }}
                        >
                          <Wheat className="w-2.5 h-2.5" /> Sin Gluten
                        </span>
                      )}
                      {item.spiciness !== 'none' && (
                        <span 
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 border ${
                            item.spiciness === 'hot'
                              ? 'bg-red-950/60 text-red-300 border-red-500/50'
                              : item.spiciness === 'medium'
                              ? 'bg-amber-950/60 text-amber-200 border-amber-500/50'
                              : 'bg-emerald-950/60 text-emerald-200 border-emerald-500/50'
                          }`}
                        >
                          <Flame className="w-2.5 h-2.5" />
                          {item.spiciness === 'hot' && 'Picante Alto'}
                          {item.spiciness === 'medium' && 'Picante Medio'}
                          {item.spiciness === 'mild' && 'Picante Suave'}
                        </span>
                      )}
                    </div>

                    {/* Description: 100% High Contrast Crisp Ivory */}
                    <p className="text-xs text-stone-200 mt-3 leading-relaxed font-normal">
                      {lang === 'es' ? item.description_es : item.description_en}
                    </p>

                    {/* Origin Story / Anecdote */}
                    {item.origin_story && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#171614] border border-[#38342D] flex items-start gap-2 text-[11px] text-stone-300">
                        <Info className="w-3.5 h-3.5 text-[#B39964] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item.origin_story}</span>
                      </div>
                    )}
                  </div>

                  {/* Pitch Script & Phonetic Assistant Box */}
                  <div className="mt-4 pt-3 border-t border-[#38342D] space-y-2">
                    <div 
                      className="p-3.5 rounded-xl border relative shadow-md"
                      style={{ backgroundColor: '#171614', borderColor: '#B39964' }}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1.5 text-[#FDE68A]">
                          <Sparkles className="w-3.5 h-3.5 text-[#B39964]" /> Frase de Venta en Inglés (Pitch):
                        </span>
                        <button
                          onClick={() => handleCopyPitch(item)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#282622] hover:bg-[#38342D] text-[#F3E5AB] transition font-bold border border-[#B39964]/40"
                          title="Copiar frase al portapapeles"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300 text-[10px]">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#B39964]" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-white italic leading-relaxed">
                        "{item.pairing_tip_en}"
                      </p>
                      {item.phonetic_pitch_es && (
                        <p className="text-[11px] text-[#FDE68A] font-mono mt-2 bg-[#25221B] border border-[#B39964]/30 p-2 rounded-lg leading-snug">
                          🗣️ {item.phonetic_pitch_es}
                        </p>
                      )}
                    </div>

                    {/* Allergens Footer */}
                    {item.allergens.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 pt-1">
                        <span className="font-bold text-[#B39964]">Alérgenos:</span>
                        <span className="text-stone-300">{item.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER BAR: Summary & Up-selling Protocol Quick Reminder */}
        <footer 
          className="px-6 py-3.5 border-t border-[#38342D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ backgroundColor: '#21201E', color: '#E2DDD5' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#B39964]">Protocolo Tepic en Sala:</span>
            <span className="text-stone-300">1. Saludo y mesa/barra · 2. Ofrecer Margarita Tepic · 3. Guacamole al centro · 4. Comanda de Tacos · 5. Digestivo de Mezcal</span>
          </div>
          <div className="text-[11px] text-stone-400 font-mono">
            Mostrando {filteredItems.length} de {TEPIC_MENU_ITEMS.length} referencias
          </div>
        </footer>
      </div>
    </div>
  );
};
