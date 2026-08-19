import React from 'react';
import { CategoryType, ScopeType, TimeRangeType, ThemeType, GeoFilterMode } from '../types';
import { Clock, MapPin, ShieldCheck, Globe, Building2 } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: CategoryType;
  selectedTimeRange: TimeRangeType;
  selectedScope: ScopeType;
  geoFilterMode: GeoFilterMode;
  onlyOfficialSources: boolean;
  theme?: ThemeType;
  onSelectCategory: (cat: CategoryType) => void;
  onSelectTimeRange: (range: TimeRangeType) => void;
  onSelectScope: (scope: ScopeType) => void;
  onSelectGeoFilterMode: (mode: GeoFilterMode) => void;
  onToggleOnlyOfficialSources: () => void;
}

export const CATEGORIES_LIST: Array<{ id: CategoryType; label: string; emoji: string }> = [
  { id: 'todas', label: 'Todas las noticias', emoji: '📰' },
  { id: 'sucesos', label: 'Sucesos y Emergencias', emoji: '🚨' },
  { id: 'politica', label: 'Política y Gobierno', emoji: '🏛️' },
  { id: 'economia', label: 'Economía y Empleo', emoji: '💼' },
  { id: 'trafico', label: 'Tráfico y Transporte', emoji: '🚦' },
  { id: 'alicante-ciudad', label: 'Alicante Ciudad', emoji: '🏙️' },
  { id: 'provincia', label: 'Provincia de Alicante', emoji: '🗺️' },
  { id: 'deportes', label: 'Deportes', emoji: '⚽' },
  { id: 'cultura', label: 'Cultura y Fiestas', emoji: '🎭' },
  { id: 'sociedad', label: 'Sociedad', emoji: '👥' },
  { id: 'turismo', label: 'Turismo y Hostelería', emoji: '🏖️' },
  { id: 'sanidad', label: 'Sanidad y Salud', emoji: '🏥' },
  { id: 'educacion', label: 'Educación y Universidad', emoji: '🎓' },
  { id: 'medio-ambiente', label: 'Medio Ambiente y El Tiempo', emoji: '🌱' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  selectedTimeRange,
  selectedScope,
  geoFilterMode,
  onlyOfficialSources,
  theme = 'dark',
  onSelectCategory,
  onSelectTimeRange,
  onSelectScope,
  onSelectGeoFilterMode,
  onToggleOnlyOfficialSources,
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`${isLight ? 'bg-slate-100 border-b border-slate-300' : 'bg-[#0a0f18] border-b border-[#1e293b]'} p-4 space-y-3 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* PRIMARY GEO FILTER: GENERALES vs ALICANTE Y PROVINCIA */}
        <div className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
          isLight ? 'bg-white border-slate-300' : 'bg-[#030509] border-[#1e293b]'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-500 font-mono">
              MODO DE VISUALIZACIÓN:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* GENERALES BUTTON */}
            <button
              onClick={() => onSelectGeoFilterMode('generales')}
              className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 border shadow-sm ${
                geoFilterMode === 'generales'
                  ? 'bg-blue-600 text-white border-blue-500 ring-2 ring-blue-400/50 shadow-md scale-105'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 border-[#1e293b]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>GENERALES (Cualquier lugar / España y Mundo)</span>
            </button>

            {/* ALICANTE Y PROVINCIA BUTTON */}
            <button
              onClick={() => onSelectGeoFilterMode('alicante_provincia')}
              className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 border shadow-sm ${
                geoFilterMode === 'alicante_provincia'
                  ? 'bg-[#ef4444] text-white border-red-500 ring-2 ring-red-400/50 shadow-md scale-105'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 border-[#1e293b]'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>ALICANTE Y PROVINCIA (Poblaciones resaltadas)</span>
            </button>
          </div>
        </div>

        {/* Top Controls: Time range, Scope & Official Sources Button */}
        <div className={`flex flex-wrap items-center justify-between gap-3 p-2.5 rounded border ${
          isLight ? 'bg-white border-slate-300' : 'bg-[#050608] border-[#1e293b]'
        }`}>
          
          {/* Official Sources Dedicated Toggle Button */}
          <button
            onClick={onToggleOnlyOfficialSources}
            className={`px-3.5 py-1.5 rounded-md text-xs font-black uppercase tracking-wider transition flex items-center space-x-2 border shadow-sm ${
              onlyOfficialSources
                ? 'bg-amber-500 text-black border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-[#0f172a] hover:bg-[#1e293b] text-amber-400 border-amber-500/40'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${onlyOfficialSources ? 'text-black' : 'text-amber-500'}`} />
            <span>
              {onlyOfficialSources ? '✓ MOSTRANDO SOLO FUENTES OFICIALES' : 'SOLO FUENTES OFICIALES Y ORGANISMOS'}
            </span>
          </button>
          
          {/* Scope Filter */}
          {geoFilterMode === 'alicante_provincia' && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#ef4444] shrink-0" />
              <span className={`text-[10px] font-black uppercase tracking-widest mr-1 hidden sm:inline ${
                isLight ? 'text-slate-600' : 'text-[#64748b]'
              }`}>
                Ámbito Alicante:
              </span>
              <div className="flex items-center space-x-1">
                {(
                  [
                    { id: 'todas', label: 'TODA LA PROVINCIA' },
                    { id: 'ciudad', label: 'ALICANTE CIUDAD' },
                    { id: 'provincia', label: 'RESTO PROVINCIA' },
                  ] as const
                ).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScope(sc.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                      selectedScope === sc.id
                        ? 'bg-[#ef4444] text-white shadow-sm'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-[#0f172a] text-[#94a3b8] hover:text-white border border-[#1e293b]'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Range Filter */}
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span className={`text-[10px] font-black uppercase tracking-widest mr-1 hidden sm:inline ${
              isLight ? 'text-slate-600' : 'text-[#64748b]'
            }`}>
              Antigüedad:
            </span>
            <div className="flex items-center space-x-1">
              {(
                [
                  { id: '2h', label: '2H' },
                  { id: '24h', label: '24H' },
                  { id: '48h', label: '48H' },
                  { id: '72h', label: '72H' },
                ] as const
              ).map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => onSelectTimeRange(tr.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                    selectedTimeRange === tr.id
                      ? 'bg-[#ef4444] text-white shadow-sm'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-[#0f172a] text-[#94a3b8] hover:text-white border border-[#1e293b]'
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Category Carousel / Grid */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 border shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-[#ef4444] text-white border-[#ef4444] shadow'
                  : isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] border-[#1e293b] text-[#94a3b8] hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
