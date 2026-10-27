import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import {
  LOVO_ALL_COCKTAILS,
  type LovoCocktail
} from '../data/lovoTrilogyData';

interface LovoMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCocktailForTraining?: (cocktailName: string, phrase: string) => void;
}

export const LovoMenuModal: React.FC<LovoMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectCocktailForTraining
}) => {
  const [activeVolume, setActiveVolume] = useState<'all' | 'tomo1' | 'tomo2' | 'tomo3'>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [viewMode, setViewMode] = useState<'cards' | 'book'>('cards');
  const [selectedCocktail, setSelectedCocktail] = useState<LovoCocktail | null>(null);
  const [selectedSpreadImg, setSelectedSpreadImg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter cocktails
  const filteredCocktails = useMemo(() => {
    return LOVO_ALL_COCKTAILS.filter((c) => {
      // Volume
      if (activeVolume !== 'all' && c.volume !== activeVolume) return false;

      // Filter pills
      if (activeFilter === 'spirit-gin' && !c.base_spirits.some((s) => s.toLowerCase().includes('gin'))) return false;
      if (activeFilter === 'spirit-ron' && !c.base_spirits.some((s) => s.toLowerCase().includes('ron') || s.toLowerCase().includes('rum'))) return false;
      if (activeFilter === 'spirit-agave' && !c.base_spirits.some((s) => s.toLowerCase().includes('mezcal') || s.toLowerCase().includes('tequila'))) return false;
      if (activeFilter === 'spirit-whisky' && !c.base_spirits.some((s) => s.toLowerCase().includes('whisky') || s.toLowerCase().includes('whiskey') || s.toLowerCase().includes('bourbon') || s.toLowerCase().includes('scotch') || s.toLowerCase().includes('rye'))) return false;
      if (activeFilter === 'spirit-vodka' && !c.base_spirits.some((s) => s.toLowerCase().includes('vodka'))) return false;
      if (activeFilter === 'taste-bitter' && !c.tasting_notes.some((n) => n.toLowerCase().includes('amargo') || n.toLowerCase().includes('seco'))) return false;
      if (activeFilter === 'taste-sour' && !c.tasting_notes.some((n) => n.toLowerCase().includes('ácido') || n.toLowerCase().includes('cítrico') || n.toLowerCase().includes('sour'))) return false;
      if (activeFilter === 'taste-sweet' && !c.tasting_notes.some((n) => n.toLowerCase().includes('dulce') || n.toLowerCase().includes('tropical') || n.toLowerCase().includes('afrutado'))) return false;
      if (activeFilter === 'taste-smoke' && !c.tasting_notes.some((n) => n.toLowerCase().includes('ahumado') || n.toLowerCase().includes('turba'))) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchStage = c.stage.toLowerCase().includes(q) || c.stage_en.toLowerCase().includes(q);
        const matchIngr = c.ingredients_es.some((i) => i.toLowerCase().includes(q)) || c.ingredients_en.some((i) => i.toLowerCase().includes(q));
        const matchStory = c.story_es.toLowerCase().includes(q) || c.story_en.toLowerCase().includes(q);
        const matchSpirit = c.base_spirits.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchStage && !matchIngr && !matchStory && !matchSpirit) return false;
      }

      return true;
    });
  }, [activeVolume, activeFilter, searchQuery]);

  // Handle Copy Phrase to Clipboard
  const handleCopyPitchPhrase = (cocktail: LovoCocktail) => {
    const phrase = `I would recommend our ${cocktail.name} from ${cocktail.volume_title}. It features ${cocktail.ingredients_en.join(', ')}.`;
    navigator.clipboard.writeText(phrase);
    setCopiedId(cocktail.id);
    setTimeout(() => setCopiedId(null), 3000);
    if (onSelectCocktailForTraining) {
      onSelectCocktailForTraining(cocktail.name, phrase);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[920px] bg-[#0A0D14] border border-[#D3A548]/40 rounded-2xl flex flex-col shadow-2xl shadow-black/90 overflow-hidden text-[#E2E8F0]">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2A344A] bg-[#000000] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-black border border-[#D3A548]/50 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-black">
              <img src="/images/logos/lovo-logo.webp" alt="LOVO Bar Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-black text-[#D3A548] uppercase tracking-wider">
                  Carta Trilogía LOVO Bar
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#D3A548]/20 text-[#D3A548] border border-[#D3A548]/40 px-2 py-0.5 rounded-full shrink-0">
                  71 Signature Cocktails
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Coctelería Emocional · Inspirada en Josephine Baker · Calle Echegaray 20, Madrid
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode */}
            <div className="inline-flex rounded-lg border border-[#2A344A] bg-[#0E121B] p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-[#D3A548] text-black shadow-md font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🍸</span>
                <span className="hidden sm:inline">Cócteles</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('book')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'book' ? 'bg-[#D3A548] text-black shadow-md font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📖</span>
                <span className="hidden sm:inline">Libro Spread</span>
              </button>
            </div>

            {/* Language Switch */}
            <div className="inline-flex rounded-lg border border-[#2A344A] bg-[#0E121B] p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  lang === 'es' ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1.5 rounded-md transition-all ${
                  lang === 'en' ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-[#2A344A] bg-[#0E121B] hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Volume Tabs + Search + Filter Pills */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#2A344A] bg-[#12161F] flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Volume Tabs */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveVolume('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeVolume === 'all'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                    : 'bg-[#1C2331] text-zinc-300 border-[#2A344A] hover:border-zinc-500'
                }`}
              >
                Todos (71)
              </button>
              <button
                type="button"
                onClick={() => setActiveVolume('tomo1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeVolume === 'tomo1'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                    : 'bg-[#1C2331] text-zinc-300 border-[#2A344A] hover:border-zinc-500'
                }`}
              >
                Tomo I: La Musa (24)
              </button>
              <button
                type="button"
                onClick={() => setActiveVolume('tomo2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeVolume === 'tomo2'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                    : 'bg-[#1C2331] text-zinc-300 border-[#2A344A] hover:border-zinc-500'
                }`}
              >
                Tomo II: Taxonomía (24)
              </button>
              <button
                type="button"
                onClick={() => setActiveVolume('tomo3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeVolume === 'tomo3'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                    : 'bg-[#1C2331] text-zinc-300 border-[#2A344A] hover:border-zinc-500'
                }`}
              >
                Tomo III: La Tribu (23)
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'es' ? 'Buscar cóctel, ingrediente, destilado...' : 'Search cocktail, ingredient, spirit...'}
                className="w-full bg-[#0E121B] border border-[#2A344A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold uppercase text-zinc-500 shrink-0">Filtrar:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'spirit-gin', label: 'Gin' },
              { id: 'spirit-ron', label: 'Ron' },
              { id: 'spirit-agave', label: 'Mezcal / Tequila' },
              { id: 'spirit-whisky', label: 'Whisky' },
              { id: 'spirit-vodka', label: 'Vodka' },
              { id: 'taste-bitter', label: 'Amargo / Seco' },
              { id: 'taste-sour', label: 'Cítrico / Ácido' },
              { id: 'taste-sweet', label: 'Dulce / Tropical' },
              { id: 'taste-smoke', label: 'Ahumado' }
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                  activeFilter === pill.id
                    ? 'bg-zinc-700 text-white border-zinc-500'
                    : 'bg-[#171D2A] text-zinc-400 hover:text-white border-[#2A344A]'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Scrollable with reliable flex shrinking */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0E121B] overscroll-contain">
          {viewMode === 'cards' ? (
            /* Cards View */
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                <div>
                  Mostrando <span className="font-bold text-amber-400">{filteredCocktails.length}</span> cócteles
                </div>
                <div className="text-[11px] text-zinc-500 hidden sm:block">
                  💡 Haz clic en cualquier cóctel para ver su receta y copiar la recomendación en inglés para la llamada con IA
                </div>
              </div>

              {filteredCocktails.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-4xl block mb-2">🍸</span>
                  <p className="text-base font-bold text-white uppercase">No se encontraron cócteles</p>
                  <p className="text-xs text-zinc-400 mt-1">Prueba a limpiar la búsqueda o cambiar de volumen.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredCocktails.map((cocktail) => (
                    <div
                      key={cocktail.id}
                      onClick={() => setSelectedCocktail(cocktail)}
                      className="group bg-[#171D2A] border border-[#2A344A] hover:border-amber-400/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
                    >
                      {/* Image header */}
                      <div className="relative h-44 bg-zinc-950 overflow-hidden">
                        <img
                          src={cocktail.cocktail_image}
                          alt={cocktail.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171D2A] via-transparent to-black/30"></div>
                        
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-black/80 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                            {cocktail.volume === 'tomo1' ? 'Tomo I' : cocktail.volume === 'tomo2' ? 'Tomo II' : 'Tomo III'}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-black/80 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                            {lang === 'es' ? cocktail.stage : cocktail.stage_en}
                          </span>
                        </div>

                        <div className="absolute bottom-2 right-2 bg-amber-400 text-zinc-950 px-2 py-0.5 rounded font-black text-xs">
                          {cocktail.price}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors mb-1.5">
                            {cocktail.name}
                          </h3>
                          <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed mb-3">
                            {lang === 'es' ? cocktail.story_es : cocktail.story_en}
                          </p>
                        </div>

                        <div>
                          {/* Tasting Notes */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {cocktail.tasting_notes.slice(0, 3).map((note, idx) => (
                              <span
                                key={idx}
                                className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#0E121B] text-zinc-300 border border-[#2A344A]"
                              >
                                {note}
                              </span>
                            ))}
                          </div>

                          {/* Quick pitch action */}
                          <div className="pt-2 border-t border-[#2A344A] flex items-center justify-between text-[11px]">
                            <span className="text-zinc-500 truncate max-w-[140px]">
                              {(lang === 'es' ? cocktail.ingredients_es : cocktail.ingredients_en).slice(0, 2).join(', ')}...
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPitchPhrase(cocktail);
                              }}
                              className="inline-flex items-center gap-1 text-amber-400 hover:text-white font-bold transition-colors"
                              title="Copiar recomendación en inglés para la llamada"
                            >
                              {copiedId === cocktail.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Pitch EN</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Book Spreads View */
            <div>
              <div className="mb-4 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                  Páginas Editoriales Escaneadas en Alta Definición
                </span>
                <p className="text-xs text-zinc-400 max-w-xl mx-auto">
                  Haz clic en cualquier página para verla en pantalla completa con la estética Art Déco original de los libros de cócteles LOVO.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeVolume === 'all' || activeVolume === 'tomo1'
                  ? Array.from({ length: 31 }, (_, i) => ({ tomo: 'Tomo I: La Musa', num: i + 1, path: `/images/menu/spreads/tomo1_p${String(i + 1).padStart(2, '0')}.jpg` }))
                  : []
                )
                  .concat(
                    activeVolume === 'all' || activeVolume === 'tomo2'
                      ? Array.from({ length: 31 }, (_, i) => ({ tomo: 'Tomo II: Taxonomía', num: i + 1, path: `/images/menu/spreads/tomo2_p${String(i + 1).padStart(2, '0')}.jpg` }))
                      : []
                  )
                  .concat(
                    activeVolume === 'all' || activeVolume === 'tomo3'
                      ? Array.from({ length: 30 }, (_, i) => ({ tomo: 'Tomo III: La Tribu', num: i + 1, path: `/images/menu/spreads/tomo3_p${String(i + 1).padStart(2, '0')}.jpg` }))
                      : []
                  )
                  .map((spread, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSpreadImg(spread.path)}
                      className="group bg-[#171D2A] border border-[#2A344A] hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer transition-all shadow-md"
                    >
                      <div className="aspect-[4/3] bg-zinc-950 overflow-hidden relative">
                        <img
                          src={spread.path}
                          alt={`${spread.tomo} - Pág ${spread.num}`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute bottom-2 left-2 bg-black/85 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700">
                          {spread.tomo} · Pág. {spread.num}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-[#2A344A] bg-[#171D2A] flex flex-wrap items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>📍 LOVO Bar Madrid</span>
            <span>•</span>
            <span>🐺 Calle del Lobo (Echegaray 20)</span>
            <span>•</span>
            <span>🌟 Musa Josephine Baker</span>
          </div>
          <div className="text-zinc-500">
            Base de Conocimiento sincronizada con el motor de IA de PitchBoss
          </div>
        </div>
      </div>

      {/* COCKTAIL DETAIL SUB-MODAL */}
      {selectedCocktail && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedCocktail(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#171D2A] border border-[#2A344A] rounded-2xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setSelectedCocktail(null)}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-lg bg-black/80 hover:bg-black text-zinc-300 hover:text-white flex items-center justify-center border border-zinc-700 transition-colors shadow-lg cursor-pointer"
              title="Cerrar detalle"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left: Image (Responsive height on mobile, full height on desktop) */}
            <div className="relative w-full md:w-5/12 h-52 sm:h-64 md:h-auto min-h-0 shrink-0 bg-zinc-950 overflow-hidden">
              <img
                src={selectedCocktail.cocktail_image}
                alt={selectedCocktail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171D2A] via-transparent to-black/40"></div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/85 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/30 truncate">
                  {selectedCocktail.volume_title}
                </span>
                <span className="text-sm sm:text-base font-black bg-amber-400 text-zinc-950 px-3 py-1 rounded-md shadow-md shrink-0">
                  {selectedCocktail.price}
                </span>
              </div>
            </div>

            {/* Right: Story, Mixology & Pinned Actions */}
            <div className="w-full md:w-7/12 min-h-0 flex-1 flex flex-col justify-between overflow-hidden bg-[#171D2A]">
              {/* Scrollable Details Area */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    {lang === 'es' ? selectedCocktail.stage : selectedCocktail.stage_en}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    {selectedCocktail.name}
                  </h2>
                </div>

                {/* Story */}
                <div className="bg-[#0E121B] border border-[#2A344A] p-3.5 rounded-xl">
                  <h4 className="text-[11px] font-bold uppercase text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <span>📜</span> <span>{lang === 'es' ? 'Relato & Simbolismo' : 'Story & Lore'}</span>
                  </h4>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    {lang === 'es' ? selectedCocktail.story_es : selectedCocktail.story_en}
                  </p>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                    <span>🧪</span> <span>{lang === 'es' ? 'Ingredientes & Alquimia' : 'Ingredients & Recipe'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-200">
                    {(lang === 'es' ? selectedCocktail.ingredients_es : selectedCocktail.ingredients_en).map(
                      (ingr, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-amber-400 text-[10px]">◆</span>
                          <span>{ingr}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Tasting Notes */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase text-zinc-400 mb-1.5">Notas de Cata</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCocktail.tasting_notes.map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pinned Bottom Action Footer: Always visible, never cut off */}
              <div className="shrink-0 p-4 border-t border-[#2A344A] bg-[#12161F]/95 backdrop-blur-md space-y-2">
                <button
                  type="button"
                  onClick={() => handleCopyPitchPhrase(selectedCocktail)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer"
                >
                  {copiedId === selectedCocktail.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-950" />
                      <span>¡Frase de recomendación copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar frase de pitch en inglés</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpreadImg(selectedCocktail.spread_image);
                  }}
                  className="w-full py-2 bg-[#0E121B] hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl border border-[#2A344A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Ver página original en el libro impreso</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPREAD FULLSCREEN MODAL */}
      {selectedSpreadImg && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-3 bg-black/95 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedSpreadImg(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedSpreadImg(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center hover:bg-amber-400 hover:text-zinc-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[92vh] overflow-auto rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={selectedSpreadImg} alt="Original Book Spread" className="w-full h-auto rounded-xl border border-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
};
