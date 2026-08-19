import React from 'react';
import { ExternalLink } from 'lucide-react';
import { GroupedNews, ThemeType } from '../types';

interface HighlightedNewsProps {
  highlightedItems: GroupedNews[];
  theme?: ThemeType;
}

export const HighlightedNews: React.FC<HighlightedNewsProps> = ({
  highlightedItems,
  theme = 'dark',
}) => {
  if (!highlightedItems || highlightedItems.length === 0) return null;

  const isLight = theme === 'light';

  const formatTimeAgo = (iso: string) => {
    const pub = new Date(iso).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - pub) / (1000 * 60));

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    }
    return `Hace ${Math.floor(diffHours / 24)} d`;
  };

  return (
    <section className={`${isLight ? 'bg-slate-100 border-b border-slate-300' : 'bg-[#050608] border-b border-[#1e293b]'} py-5 px-4 shadow-xl transition-colors`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Title */}
        <div className={`flex items-center justify-between mb-4 pb-2 border-b ${isLight ? 'border-slate-300' : 'border-[#1e293b]'}`}>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500 text-base">⭐</span>
            <h2 className={`text-xs sm:text-sm font-bold uppercase tracking-widest ${isLight ? 'text-slate-800' : 'text-[#94a3b8]'}`}>
              Las noticias más destacadas de hoy
            </h2>
          </div>
          <div className={`flex-1 h-px ${isLight ? 'bg-slate-300' : 'bg-[#1e293b]'} ml-4 hidden sm:block`}></div>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlightedItems.slice(0, 5).map((item, idx) => {
            const isTop1 = idx === 0;
            const borderColors = ['border-[#ef4444]', 'border-[#3b82f6]', 'border-[#22c55e]', 'border-[#eab308]', 'border-[#a855f7]'];
            const categoryBadgeColors: Record<string, string> = {
              sucesos: 'bg-[#ef4444] text-white',
              politica: 'bg-[#3b82f6] text-white',
              sociedad: 'bg-[#22c55e] text-white',
              economia: 'bg-[#eab308] text-slate-950',
              trafico: 'bg-[#f97316] text-white',
            };
            const borderColor = borderColors[idx % borderColors.length];
            const badgeColor = categoryBadgeColors[item.category] || 'bg-[#ef4444] text-white';

            return (
              <div
                key={item.id}
                className={`${
                  isLight
                    ? 'bg-white border-slate-300 shadow-md text-slate-900 hover:bg-slate-50'
                    : 'bg-[#0f172a] shadow-lg text-white hover:bg-[#111c35]'
                } border-l-4 ${borderColor} p-4 rounded-r flex flex-col justify-between transition relative overflow-hidden group ${
                  isTop1 ? 'lg:col-span-1 md:col-span-2' : ''
                }`}
              >
                {/* Header Tag line */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] ${badgeColor} px-2 py-0.5 font-bold uppercase tracking-wider`}>
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>
                      {item.sourcesCount} {item.sourcesCount === 1 ? 'MEDIO' : 'MEDIOS'}
                    </span>
                  </div>

                  {/* Municipality Header if available */}
                  {item.municipality && (
                    <div className="mb-1">
                      <span className="inline-flex items-center gap-1 font-mono font-black text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 border border-amber-500 shadow-sm">
                        <span>📍</span>
                        <span>{item.municipality.toUpperCase()}</span>
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-sm font-bold leading-tight mb-2 uppercase italic transition ${
                    isLight ? 'text-slate-900 group-hover:text-red-700' : 'text-white group-hover:text-[#ef4444]'
                  }`}>
                    {item.mainTitle}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className={`text-[11px] line-clamp-2 leading-normal ${isLight ? 'text-slate-600' : 'text-[#94a3b8]'}`}>
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* Footer Sources */}
                <div className={`pt-3 border-t mt-3 flex items-center justify-between gap-2 text-[10px] ${
                  isLight ? 'border-slate-200' : 'border-[#1e293b]'
                }`}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-bold underline underline-offset-2 flex items-center gap-1 ${
                          isLight ? 'text-slate-900 hover:text-red-600 decoration-slate-300' : 'text-[#e2e8f0] hover:text-[#ef4444] decoration-[#334155]'
                        }`}
                        title={src.title}
                      >
                        <span>{src.source}</span>
                        <ExternalLink className={`w-2.5 h-2.5 ${isLight ? 'text-slate-400' : 'text-[#64748b]'}`} />
                      </a>
                    ))}
                  </div>
                  <span className={`font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>{formatTimeAgo(item.publishedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

