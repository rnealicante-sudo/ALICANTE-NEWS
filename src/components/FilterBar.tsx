import React from 'react';
import { CategoryType, ScopeType, TimeRangeType, ThemeType } from '../types';
import { Clock, MapPin, Tag, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: CategoryType;
  selectedTimeRange: TimeRangeType;
  selectedScope: ScopeType;
  onlyOfficialSources: boolean;
  theme?: ThemeType;
  onSelectCategory: (cat: CategoryType) => void;
  onSelectTimeRange: (range: TimeRangeType) => void;
  onSelectScope: (scope: ScopeType) => void;
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
  onlyOfficialSources,
  theme = 'dark',
  onSelectCategory,
  onSelectTimeRange,
  onSelectScope,
  onToggleOnlyOfficialSources,
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`${isLight ? 'bg-slate-100 border-b border-slate-300' : 'bg-[#0a0f18] border-b border-[#1e293b]'} p-4 space-y-3 transition-colors`}>
      <div className="max-w-7xl mx-auto space-y-3">
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
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span className={`text-[10px] font-black uppercase tracking-widest mr-1 hidden sm:inline ${
              isLight ? 'text-slate-600' : 'text-[#64748b]'
            }`}>
              Ámbito:
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

          {/* Time Range Filter */}
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span className={`text-[10px] font-black uppercase tracking-widest mr-1 hidden sm:inline ${
              isLight ? 'text-slate-600' : 'text-[#64748b]'
            }`}>
              Periodo:
            </span>
            <div className="flex items-center space-x-1">
              {(
                [
                  { id: '2h', label: '2 HORAS' },
                  { id: '24h', label: '24 HORAS' },
                  { id: '48h', label: '48 HORAS' },
                  { id: '72h', label: '72 HORAS' },
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

        {/* Official Sources Banner Notice when active */}
        {onlyOfficialSources && (
          <div className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs ${
            isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>FILTRO DE VERIFICACIÓN OFICIAL ACTIVADO:</strong> Mostrando únicamente comunicados e informaciones de Ayuntamientos, Generalitat Valenciana (GVA), 112 CV, Consorcio Provincial de Bomberos y Diputación de Alicante.
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono shrink-0">
              <a href="https://twitter.com/GVA112" target="_blank" rel="noopener noreferrer" className="underline hover:text-white flex items-center space-x-0.5">
                <span>@GVA112</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://twitter.com/AlicanteAyto" target="_blank" rel="noopener noreferrer" className="underline hover:text-white flex items-center space-x-0.5">
                <span>@AlicanteAyto</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-400">
          <div className={`flex items-center space-x-1.5 shrink-0 text-[10px] font-black tracking-widest uppercase mr-1 ${
            isLight ? 'text-slate-600' : 'text-[#64748b]'
          }`}>
            <Tag className="w-3.5 h-3.5 text-[#ef4444]" />
            <span>CATEGORÍAS:</span>
          </div>

          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 border shadow-sm ${
                  isSelected
                    ? isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-[#1e293b] text-white border-[#334155]'
                    : isLight ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] border-[#1e293b]'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

