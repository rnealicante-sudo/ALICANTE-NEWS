import React, { useState } from 'react';
import { GroupedNews, ThemeType, GeoFilterMode } from '../types';
import { ExternalLink, Layers, ChevronDown, ChevronUp, Globe, Building2 } from 'lucide-react';
import { parseMunicipalityChunks } from '../utils/textUtils';

interface TeletypeListProps {
  newsGroups: GroupedNews[];
  theme?: ThemeType;
  geoFilterMode?: GeoFilterMode;
  onSelectGeoFilterMode?: (mode: GeoFilterMode) => void;
}

export const TeletypeList: React.FC<TeletypeListProps> = ({
  newsGroups,
  theme = 'dark',
  geoFilterMode = 'alicante_provincia',
  onSelectGeoFilterMode,
}) => {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const isLight = theme === 'light';
  const isAlicanteMode = geoFilterMode === 'alicante_provincia';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatDateShort = (iso: string) => {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedGroupId(expandedGroupId === id ? null : id);
  };

  /**
   * Helper component to render text with highlighted municipalities/towns
   */
  const HighlightedText: React.FC<{ text: string; targetMun?: string }> = ({ text, targetMun }) => {
    if (!isAlicanteMode) {
      return <span>{text}</span>;
    }

    const chunks = parseMunicipalityChunks(text, targetMun);
    return (
      <span>
        {chunks.map((chunk, i) => {
          if (chunk.isMunicipality) {
            return (
              <mark
                key={i}
                className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-sm inline-block mx-0.5 border border-amber-300 transition-transform hover:scale-105"
                title={`Población: ${chunk.text}`}
              >
                📍 {chunk.text}
              </mark>
            );
          }
          return <React.Fragment key={i}>{chunk.text}</React.Fragment>;
        })}
      </span>
    );
  };

  if (!newsGroups || newsGroups.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1">
        <div className={`${
          isLight ? 'bg-white border-slate-300' : 'bg-[#0a0f18] border-[#1e293b]'
        } rounded-lg border overflow-hidden flex flex-col shadow-lg transition-colors p-8 text-center space-y-3`}>
          <p className="text-base font-semibold text-slate-300">
            No se han encontrado noticias para el filtro {isAlicanteMode ? 'de Alicante y Provincia' : 'general'}.
          </p>
          <p className="text-xs text-slate-400">
            Prueba a cambiar entre los modos "GENERALES" y "ALICANTE Y PROVINCIA", o seleccionar "Todas las noticias" en categorías.
          </p>
          {onSelectGeoFilterMode && (
            <div className="pt-3 flex justify-center gap-2">
              <button
                onClick={() => onSelectGeoFilterMode('generales')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                Ver noticias Generales
              </button>
              <button
                onClick={() => onSelectGeoFilterMode('alicante_provincia')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                Ver Alicante y Provincia
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 flex-1">
      {/* Feed Container */}
      <div className={`${
        isLight ? 'bg-white border-slate-300' : 'bg-[#0a0f18] border-[#1e293b]'
      } rounded-lg border overflow-hidden flex flex-col shadow-lg transition-colors`}>
        
        {/* Header Bar */}
        <div className={`${
          isLight ? 'bg-slate-200 border-slate-300 text-slate-900' : 'bg-[#1e293b] border-[#1e293b] text-white'
        } p-3.5 flex flex-wrap items-center justify-between gap-3 border-b`}>
          <div className="flex items-center space-x-2">
            <span className="text-[#ef4444] text-lg animate-pulse">🔴</span>
            <h2 className="font-bold uppercase tracking-tight text-sm font-sans">
              ÚLTIMAS NOTICIAS - {isAlicanteMode ? 'ALICANTE Y PROVINCIA' : 'NOTICIAS GENERALES'}
            </h2>
          </div>

          {/* Quick Toggle Buttons in Header */}
          {onSelectGeoFilterMode && (
            <div className="flex items-center space-x-1.5 bg-black/30 p-1 rounded-md border border-slate-700/50">
              <button
                onClick={() => onSelectGeoFilterMode('generales')}
                className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider flex items-center space-x-1 transition ${
                  geoFilterMode === 'generales'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>GENERALES</span>
              </button>
              <button
                onClick={() => onSelectGeoFilterMode('alicante_provincia')}
                className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider flex items-center space-x-1 transition ${
                  geoFilterMode === 'alicante_provincia'
                    ? 'bg-[#ef4444] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>ALICANTE Y PROVINCIA</span>
              </button>
            </div>
          )}

          <div className={`flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-wider ${
            isLight ? 'text-slate-600' : 'text-[#94a3b8]'
          }`}>
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></span>
            <span>EN DIRECTO</span>
          </div>
        </div>

        {/* Highlight Notice Banner if Alicante mode is active */}
        {isAlicanteMode && (
          <div className={`px-4 py-1.5 text-[11px] font-bold border-b flex items-center justify-between ${
            isLight ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-amber-950/30 text-amber-300 border-amber-800/50'
          }`}>
            <span className="flex items-center gap-1.5">
              <span>📍</span>
              <span>Modo <strong>Alicante y Provincia</strong> activo: Mostrando únicamente noticias locales con nombres de población resaltados en el texto.</span>
            </span>
          </div>
        )}

        {/* Feed List */}
        <div className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#1e293b]'}`}>
          {newsGroups.map((group) => {
            const isGrouped = group.sourcesCount > 1;
            const isExpanded = expandedGroupId === group.id;

            return (
              <article
                key={group.id}
                className={`p-4 transition ${
                  isLight
                    ? group.isNew
                      ? 'bg-amber-50/70 border-l-4 border-l-[#ef4444]'
                      : 'bg-white hover:bg-slate-50'
                    : group.isNew
                      ? 'bg-[#0c1221] border-l-4 border-l-[#ef4444]'
                      : 'bg-[#0a0f18] hover:bg-[#0c1221]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Time & Sources Badge */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-2 shrink-0 sm:w-28 font-mono">
                    <span className="text-sm font-bold text-[#ef4444]">{formatTime(group.publishedAt)} h</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>{formatDateShort(group.publishedAt)}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-sans font-bold ${
                      isLight ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-[#1e293b] text-[#94a3b8]'
                    }`}>
                      {group.category}
                    </span>
                  </div>

                  {/* Main Article Body */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {group.municipality && (
                      <div className="mb-1">
                        <span className="inline-flex items-center gap-1 font-mono font-black text-xs uppercase tracking-wide px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 border border-amber-500 shadow-sm">
                          <span>📍</span>
                          <span>{group.municipality.toUpperCase()}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm sm:text-base font-bold leading-snug tracking-tight ${
                        isLight ? 'text-slate-900' : 'text-[#e2e8f0]'
                      }`}>
                        <HighlightedText text={group.mainTitle} targetMun={group.municipality} />
                      </h3>
                      
                      {isGrouped ? (
                        <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          ✓ CONTRASTADA ({group.sourcesCount} MEDIOS)
                        </span>
                      ) : (
                        <span className="bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          FUENTE VERIFICADA
                        </span>
                      )}
                    </div>

                    {group.summary && (
                      <p className={`text-xs font-sans leading-relaxed ${
                        isLight ? 'text-slate-600' : 'text-[#94a3b8]'
                      }`}>
                        <HighlightedText text={group.summary} targetMun={group.municipality} />
                      </p>
                    )}

                    {/* Sources & Links Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>Medios:</span>
                        {group.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`border-b text-[11px] font-bold transition flex items-center gap-1 ${
                              isLight
                                ? 'text-slate-900 border-slate-400 hover:border-[#ef4444] hover:text-[#ef4444]'
                                : 'text-white border-[#334155] hover:border-[#ef4444] hover:text-[#ef4444]'
                            }`}
                            title={src.title}
                          >
                            <span>{src.source}</span>
                            <ExternalLink className={`w-2.5 h-2.5 ${isLight ? 'text-slate-400' : 'text-[#64748b]'}`} />
                          </a>
                        ))}
                      </div>

                      {isGrouped && (
                        <button
                          onClick={() => toggleExpand(group.id)}
                          className="text-[11px] font-bold text-[#ef4444] hover:underline flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{isExpanded ? 'Ocultar comparativa' : 'Comparar titulares'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Expanded Group Details */}
                    {isGrouped && isExpanded && (
                      <div className={`mt-3 p-3 rounded border space-y-2 animate-fadeIn text-xs ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#050608] border-[#1e293b]'
                      }`}>
                        <h4 className={`text-[10px] font-black text-[#ef4444] uppercase tracking-widest border-b pb-1 ${
                          isLight ? 'border-slate-300' : 'border-[#1e293b]'
                        }`}>
                          Comparativa de titulares por medio de comunicación:
                        </h4>
                        {group.items.map((gi, idx) => (
                          <div key={idx} className={`border-b pb-1.5 last:border-0 ${isLight ? 'border-slate-200' : 'border-[#0f172a]'}`}>
                            <div className="flex items-center justify-between mb-0.5 text-[10px]">
                              <span className={`font-bold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>{gi.source}</span>
                              <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>{formatTime(gi.publishedAt)}</span>
                            </div>
                            <p className={`italic font-medium ${isLight ? 'text-slate-800' : 'text-[#e2e8f0]'}`}>
                              "<HighlightedText text={gi.title} targetMun={gi.municipality} />"
                            </p>
                            <a
                              href={gi.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-[10px] text-[#ef4444] hover:underline mt-0.5 font-bold"
                            >
                              <span>Noticia completa en {gi.source}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};
