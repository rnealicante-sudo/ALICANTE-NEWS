import React, { useState, useEffect } from 'react';
import { GroupedNews, ConnectionStatusType } from '../types';
import { Tv, X, RefreshCw, Volume2, VolumeX, Radio, Clock, Layers, Star } from 'lucide-react';

interface NewsroomModeProps {
  status: ConnectionStatusType;
  lastUpdatedISO: string;
  highlightedItems: GroupedNews[];
  newsGroups: GroupedNews[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onCloseNewsroomMode: () => void;
}

export const NewsroomMode: React.FC<NewsroomModeProps> = ({
  status,
  lastUpdatedISO,
  highlightedItems,
  newsGroups,
  soundEnabled,
  onToggleSound,
  onCloseNewsroomMode,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle highlights automatically every 8 seconds
  useEffect(() => {
    if (highlightedItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev + 1) % highlightedItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [highlightedItems.length]);

  const currentHighlight = highlightedItems[activeHighlightIndex] || highlightedItems[0];

  const formatTime = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const formatDate = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return d.toLocaleDateString('es-ES', options).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col font-sans overflow-hidden select-none">
      {/* Top TV Header Bar */}
      <header className="bg-gradient-to-r from-red-950 via-slate-950 to-red-950 border-b-2 border-red-600 px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 p-2 rounded-lg border border-red-500 shadow-lg animate-pulse">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase">
                ÚLTIMOS TELETIPOS ALICANTE
              </h1>
              <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded tracking-widest uppercase animate-pulse">
                REDACCIÓN TV
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              SISTEMA DE MONITOREO DE NOTICIAS EN TIEMPO REAL
            </p>
          </div>
        </div>

        {/* Live Clock & Exit */}
        <div className="flex items-center space-x-6">
          <div className="text-right hidden md:block">
            <div className="text-xs text-amber-400 font-semibold font-mono">
              {formatDate(time)}
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-widest">
              {formatTime(time)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSound}
              className="bg-slate-900 border border-slate-700 text-slate-300 p-2.5 rounded-xl hover:bg-slate-800 transition"
              title="Sonido"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>

            <button
              onClick={onCloseNewsroomMode}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold border border-red-500 shadow-lg flex items-center space-x-2 transition"
            >
              <X className="w-5 h-5" />
              <span>SALIR DE MODO TV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content TV Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Column: Big Featured Highlight */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-900/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-bl-xl uppercase tracking-widest flex items-center space-x-1.5 shadow-md">
            <Star className="w-4 h-4 fill-white" />
            <span>NOTICIA DESTACADA DE HOY</span>
          </div>

          {currentHighlight ? (
            <div className="mt-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 my-2">
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded uppercase">
                    {currentHighlight.category}
                  </span>
                  {currentHighlight.sourcesCount > 1 && (
                    <span className="bg-red-950 border border-red-700 text-red-300 font-bold text-xs px-2.5 py-0.5 rounded flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{currentHighlight.sourcesCount} MEDIOS</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mt-4 tracking-tight">
                  {currentHighlight.mainTitle}
                </h2>

                <p className="text-base text-slate-300 mt-4 leading-relaxed line-clamp-6 font-medium">
                  {currentHighlight.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-6 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Publican:</span>
                  {currentHighlight.sources.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1 rounded"
                    >
                      {s.source}
                    </span>
                  ))}
                </div>

                {highlightedItems.length > 1 && (
                  <div className="flex space-x-1">
                    {highlightedItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveHighlightIndex(idx)}
                        className={`h-2.5 rounded-full transition-all ${
                          idx === activeHighlightIndex
                            ? 'w-6 bg-red-500'
                            : 'w-2.5 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Cargando noticias destacadas...
            </div>
          )}
        </div>

        {/* Right Column: Live TV Teletype Feed Stream */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-widest">
                TELETIPO ÚLTIMA HORA
              </h3>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold bg-slate-900 px-3 py-1 rounded border border-slate-800">
              Actualización automática cada 60s
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {newsGroups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-400 bg-black px-2 py-0.5 rounded border border-slate-800">
                      {new Date(group.publishedAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                      {group.category}
                    </span>
                    {group.sourcesCount > 1 && (
                      <span className="bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded text-[10px] border border-red-800">
                        {group.sourcesCount} MEDIOS
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-bold text-white leading-snug">
                  {group.mainTitle}
                </h4>

                <div className="mt-2 text-xs text-slate-400 font-medium flex flex-wrap items-center gap-1.5">
                  <span>Fuentes:</span>
                  {group.sources.map((s, idx) => (
                    <span key={idx} className="text-slate-300 font-bold">
                      {s.source}{idx < group.sources.length - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Ticker Marquee */}
      <div className="bg-red-700 text-white border-t border-red-500 py-2.5 px-4 font-mono font-bold text-sm tracking-widest flex items-center space-x-4 overflow-hidden">
        <span className="bg-black text-amber-400 px-3 py-1 rounded text-xs shrink-0 font-black">
          🔴 TELETIPO ALICANTE EN DIRECTO
        </span>
        <div className="whitespace-nowrap animate-marquee flex space-x-8">
          {newsGroups.slice(0, 10).map((g, idx) => (
            <span key={idx} className="inline-flex items-center space-x-2">
              <span className="text-amber-300">•</span>
              <span>{g.mainTitle}</span>
              <span className="text-xs text-red-200">({g.sources.map(s => s.source).join(', ')})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
