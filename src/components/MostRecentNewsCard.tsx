import React, { useEffect, useState } from 'react';
import { GroupedNews, ThemeType } from '../types';
import { Radio, ExternalLink, Bell, CheckCircle2, Flame, MapPin, Clock } from 'lucide-react';
import { audioNotifier } from '../utils/AudioNotifier';

interface MostRecentNewsCardProps {
  newsItem: GroupedNews | null;
  theme?: ThemeType;
  soundEnabled?: boolean;
  hasNewAlert?: boolean;
}

export const MostRecentNewsCard: React.FC<MostRecentNewsCardProps> = ({
  newsItem,
  theme = 'dark',
  soundEnabled = true,
  hasNewAlert = false,
}) => {
  const [pulse, setPulse] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    if (hasNewAlert || newsItem?.isNew) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [hasNewAlert, newsItem?.id, newsItem?.isNew]);

  if (!newsItem) {
    return null;
  }

  const formatExactTime = (iso: string) => {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const getMinutesAgo = (iso: string) => {
    const pubTime = new Date(iso).getTime();
    const now = Date.now();
    const mins = Math.floor((now - pubTime) / 60000);
    if (mins <= 0) return 'Justo ahora';
    if (mins === 1) return 'Hace 1 min';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    return `Hace ${hours} h`;
  };

  const mainSource = newsItem.sources[0];
  const isMultiSource = newsItem.sourcesCount > 1;

  const handleReplayChime = () => {
    if (soundEnabled) {
      audioNotifier.playNewsChime();
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 my-4">
      <div
        className={`relative overflow-hidden rounded-xl border transition-all duration-500 shadow-xl ${
          pulse
            ? isLight
              ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-400/40'
              : 'bg-[#151a2d] border-[#ef4444] ring-4 ring-[#ef4444]/30'
            : isLight
              ? 'bg-gradient-to-r from-slate-50 via-white to-red-50/30 border-red-200'
              : 'bg-gradient-to-r from-[#0d121f] via-[#0a0f18] to-[#121829] border-red-950/80'
        }`}
      >
        {/* Animated accent line */}
        <div className={`h-1.5 w-full ${pulse ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse' : 'bg-[#ef4444]'}`} />

        <div className="p-4 sm:p-5">
          {/* Top Label & Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h2 className="font-mono font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 text-red-600 dark:text-red-500">
                <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                NOTICIA MÁS RECIENTE
              </h2>
              {pulse && (
                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Bell className="w-3 h-3" /> ¡ACABA DE ENTRAR!
                </span>
              )}
            </div>

            {/* Sound Notice Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReplayChime}
                title="Volver a escuchar señal sonora de teletipo"
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-[#182030] hover:bg-[#202b40] text-slate-200 border-[#2d3a54]'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>Escuchar aviso sonoro</span>
              </button>
            </div>
          </div>

          {/* Main Display Grid: Hora, Medio & Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Metadata Sidebar Column (Hora y Medio) */}
            <div className={`lg:col-span-4 p-3.5 rounded-lg border font-mono space-y-2.5 ${
              isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-[#060a12] border-[#1b2538]'
            }`}>
              {/* 1. HORA */}
              <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                <span className={`text-[11px] uppercase font-semibold flex items-center gap-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  HORA DE ENTRADA:
                </span>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-red-600 dark:text-red-400 block">
                    {formatExactTime(newsItem.publishedAt)}
                  </span>
                  <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ({getMinutesAgo(newsItem.publishedAt)})
                  </span>
                </div>
              </div>

              {/* 2. MEDIO / FUENTE */}
              <div className="flex flex-col gap-1">
                <span className={`text-[11px] uppercase font-semibold ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  MEDIO / FUENTE ORIGINAL:
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-black font-sans uppercase px-2 py-1 rounded border ${
                    isLight
                      ? 'bg-white text-slate-900 border-slate-300'
                      : 'bg-[#121927] text-white border-[#2b3952]'
                  }`}>
                    {mainSource?.source || 'Fuente Acreditada'}
                  </span>
                  {mainSource?.link && (
                    <a
                      href={mainSource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      <span>Ir al medio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* 3. CONTRAST / MULTI-SOURCE BADGE */}
              <div className="pt-1">
                {isMultiSource ? (
                  <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded p-2 text-[11px] font-sans font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>CONTRASTADA EN {newsItem.sourcesCount} MEDIOS</span>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded p-2 text-[11px] font-sans font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>FUENTE OFICIAL / VERIFICADA</span>
                  </div>
                )}
              </div>
            </div>

            {/* News Headline & Summary Column */}
            <div className="lg:col-span-8 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                  isLight ? 'bg-red-100 text-red-800' : 'bg-red-950/80 text-red-300 border border-red-800/50'
                }`}>
                  {newsItem.category}
                </span>

                {newsItem.municipality && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#151c2c] text-slate-300 border-[#2b3a54]'
                  }`}>
                    <MapPin className="w-3 h-3 text-red-500" />
                    {newsItem.municipality}
                  </span>
                )}
              </div>

              <h3 className={`text-base sm:text-lg lg:text-xl font-extrabold leading-tight tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {newsItem.mainTitle}
              </h3>

              {newsItem.summary && (
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {newsItem.summary}
                </p>
              )}

              {/* Coverage Media List */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs border-t border-slate-200/60 dark:border-slate-800">
                <span className={`text-[11px] font-mono font-bold uppercase ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Medios que cubren esta noticia:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {newsItem.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                          : 'bg-[#151d2c] hover:bg-[#1d283c] text-slate-200 border-[#2d3b52]'
                      }`}
                    >
                      <span>{src.source}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
