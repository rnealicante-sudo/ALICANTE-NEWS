import React from 'react';
import { GroupedNews, ThemeType } from '../types';
import { Radio, ExternalLink, Zap } from 'lucide-react';

interface TickerBannerProps {
  newsGroups: GroupedNews[];
  theme?: ThemeType;
}

export const TickerBanner: React.FC<TickerBannerProps> = ({ newsGroups, theme = 'dark' }) => {
  if (!newsGroups || newsGroups.length === 0) return null;

  const isLight = theme === 'light';

  // Take the 10 most recent news groups
  const recentItems = newsGroups.slice(0, 10);

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`border-b shadow-lg transition-colors overflow-hidden ${
      isLight ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-[#030406] border-[#1e293b] text-[#e2e8f0]'
    }`}>
      {/* Ticker Container with Fixed Left Badge & Scrolling Track */}
      <div className="max-w-full flex items-center h-11 relative">
        
        {/* Fixed Left Live Badge */}
        <div className="z-10 shrink-0 bg-[#ef4444] text-white px-3.5 h-full flex items-center space-x-2 font-mono font-black text-xs uppercase tracking-widest shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="hidden sm:inline">ÚLTIMO TELETIPO</span>
          <span className="sm:hidden">EN DIRECTO</span>
        </div>

        {/* Marquee Track Container */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          
          {/* Continuous CSS Smooth Infinite Horizontal Scroll */}
          <div className="animate-ticker flex items-center space-x-6 whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer">
            
            {/* Render items twice to ensure endless continuous loop */}
            {[...recentItems, ...recentItems].map((item, idx) => {
              const mainSource = item.sources[0]?.source || 'REDACCIÓN';
              const timeStr = formatTime(item.publishedAt);

              return (
                <a
                  key={`${item.id}-${idx}`}
                  href={item.sources[0]?.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-2.5 px-3 py-1 rounded border transition group ${
                    isLight
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
                      : 'bg-[#0d1320] hover:bg-[#162035] border-[#1e293b] text-[#e2e8f0]'
                  }`}
                  title={`Ver noticia en ${mainSource}`}
                >
                  {/* Time Cell */}
                  <span className="bg-[#ef4444] text-white text-[10px] font-mono font-black px-1.5 py-0.5 rounded shadow-sm">
                    {timeStr}
                  </span>

                  {/* Source Cell */}
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                    {mainSource}
                  </span>

                  {/* Headline Scrolling Text */}
                  <span className="text-xs font-bold tracking-tight group-hover:text-red-400 transition">
                    {item.mainTitle}
                  </span>

                  {/* External icon */}
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-red-400 transition shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Embedded Custom Keyframes for Smooth Marquee */}
      <style>{`
        @keyframes tickerScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          display: inline-flex;
          animation: tickerScroll 110s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};
