import React from 'react';
import {
  RefreshCw,
  Pause,
  Play,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Tv,
  AlertTriangle,
  WifiOff,
  Radio,
  Sun,
  Moon,
  ArrowUpDown,
  Mic,
} from 'lucide-react';
import { ConnectionStatusType, ThemeType, SectionOrderType } from '../types';

interface HeaderProps {
  status: ConnectionStatusType;
  statusMessage: string;
  lastUpdatedISO: string;
  isPaused: boolean;
  soundEnabled: boolean;
  theme: ThemeType;
  sectionOrder: SectionOrderType;
  hasNewItems?: boolean;
  onRefresh: () => void;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onToggleSectionOrder: () => void;
  onOpenSourcesModal: () => void;
  onToggleNewsroomMode: () => void;
  onOpenEscaletaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  lastUpdatedISO,
  isPaused,
  soundEnabled,
  theme,
  sectionOrder,
  hasNewItems = false,
  onRefresh,
  onTogglePause,
  onToggleSound,
  onToggleTheme,
  onToggleSectionOrder,
  onOpenSourcesModal,
  onToggleNewsroomMode,
  onOpenEscaletaModal,
}) => {
  const isLight = theme === 'light';

  const formatUpdatedTime = (iso: string) => {
    if (!iso) return 'Cargando...';
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${hh}:${mm}:${ss} (${day}/${month})`;
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'live':
        return (
          <div className={`flex items-center space-x-1.5 ${isLight ? 'bg-emerald-100 border border-emerald-500 text-emerald-800' : 'bg-[#000] border border-[#22c55e] text-[#22c55e]'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
            </span>
            <span>EN DIRECTO</span>
          </div>
        );
      case 'updating':
      case 'connecting':
        return (
          <div className={`flex items-center space-x-1.5 ${isLight ? 'bg-amber-100 border border-amber-500 text-amber-800' : 'bg-[#000] border border-[#f59e0b] text-[#f59e0b]'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>{status === 'connecting' ? 'CONECTANDO...' : 'ACTUALIZANDO...'}</span>
          </div>
        );
      case 'source_error':
        return (
          <div className={`flex items-center space-x-1.5 ${isLight ? 'bg-amber-100 border border-amber-500 text-amber-800' : 'bg-[#000] border border-[#f59e0b] text-[#f59e0b]'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
            <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
            <span>AVISO DE FUENTE</span>
          </div>
        );
      case 'no_connection':
      default:
        return (
          <div className={`flex items-center space-x-1.5 ${isLight ? 'bg-red-100 border border-red-500 text-red-800' : 'bg-[#000] border border-[#ef4444] text-[#ef4444]'} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
            <WifiOff className="w-3 h-3" />
            <span>SIN CONEXIÓN</span>
          </div>
        );
    }
  };

  const isLogoFlashing = hasNewItems || status === 'updating';

  return (
    <header className={`${isLight ? 'bg-white border-b border-slate-200 text-slate-900' : 'bg-[#0a0f18] border-b border-[#1e293b] text-white'} p-4 shrink-0 shadow-lg transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Main Title & Slogan with Flashing Logo on New News */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className={`p-2.5 rounded-sm shadow-lg shrink-0 transition-all duration-300 ${
              isLogoFlashing
                ? 'bg-red-600 ring-4 ring-red-400/60 animate-bounce'
                : 'bg-[#ef4444]'
            }`}>
              <Radio className={`w-6 h-6 text-white ${isLogoFlashing ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className={`text-xl sm:text-2xl font-black tracking-widest uppercase transition-opacity ${
                  isLogoFlashing ? 'animate-pulse text-red-600' : isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  ÚLTIMOS TELETIPOS <span className="text-[#ef4444]">ALICANTE</span>
                </h1>
                {renderStatusBadge()}
              </div>
              <p className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>
                La actualidad de Alicante, en directo
              </p>
            </div>
          </div>

          {/* Right Controls & Refresh Info */}
          <div className={`flex flex-wrap items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#050608] border-[#1e293b]'}`}>
            {/* Status & Last Updated */}
            <div className="flex flex-col text-right px-2 hidden xl:flex">
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-[#64748b]'}`}>
                Sincronizado
              </span>
              <span className="text-xs font-mono font-bold text-[#ef4444]">
                {formatUpdatedTime(lastUpdatedISO)}
              </span>
            </div>

            <div className={`h-8 w-px hidden xl:block ${isLight ? 'bg-slate-300' : 'bg-[#1e293b]'}`} />

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={status === 'updating' || status === 'connecting'}
              className={`${isLight ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#e2e8f0] border-[#334155]'} px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition flex items-center space-x-1 border shadow-sm disabled:opacity-50`}
              title="Actualizar noticias manualmente"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#ef4444] ${
                  status === 'updating' ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">↻ ACTUALIZAR</span>
            </button>

            {/* Pause / Resume Auto-refresh */}
            <button
              onClick={onTogglePause}
              className={`px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition flex items-center space-x-1 border shadow-sm ${
                isPaused
                  ? 'bg-[#ef4444] text-white border-[#ef4444]'
                  : isLight
                  ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#e2e8f0] border-[#334155]'
              }`}
              title={isPaused ? 'Reanudar actualización' : 'Pausar actualización'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-white fill-current" />
                  <span className="hidden sm:inline">▶ REANUDAR</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#ef4444]" />
                  <span className="hidden sm:inline">⏸ PAUSAR</span>
                </>
              )}
            </button>

            {/* Theme Switcher Toggle (FONDO BLANCO / LETRAS OSCURAS vs MODO OSCURO) */}
            <button
              onClick={onToggleTheme}
              className={`px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition flex items-center space-x-1.5 border shadow-sm ${
                isLight
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                  : 'bg-white text-slate-900 border-white hover:bg-slate-100'
              }`}
              title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Fondo Blanco y Letras Oscuras'}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300" />
                  <span>MODO OSCURO</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>FONDO BLANCO</span>
                </>
              )}
            </button>

            {/* Section Order Toggle (Destacadas vs Últimas Noticias) */}
            <button
              onClick={onToggleSectionOrder}
              className={`${
                sectionOrder === 'featured-first'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isLight
                  ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#e2e8f0] border-[#334155]'
              } px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition flex items-center space-x-1 border shadow-sm`}
              title="Cambiar orden de lo que quieres ver primero (Últimas Noticias o Destacadas)"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ef4444]" />
              <span>
                {sectionOrder === 'featured-first' ? 'VER PRIMERO: DESTACADAS' : 'VER PRIMERO: ÚLTIMAS NOTICIAS'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded text-xs font-bold transition border shadow-sm ${
                soundEnabled
                  ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'bg-[#000] text-[#22c55e] border-[#22c55e]'
                  : isLight ? 'bg-white text-slate-400 border-slate-300' : 'bg-[#0f172a] text-[#64748b] border-[#334155]'
              }`}
              title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#22c55e]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#64748b]" />
              )}
            </button>

            {/* Sources Config Modal */}
            <button
              onClick={onOpenSourcesModal}
              className={`${isLight ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-[#0f172a] hover:bg-[#1e293b] text-[#e2e8f0] border-[#334155]'} px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition border flex items-center space-x-1`}
              title="Configurar fuentes de medios"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="hidden md:inline">Fuentes</span>
            </button>

            {/* TV Newsroom Mode */}
            <button
              onClick={onToggleNewsroomMode}
              className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-1.5 rounded-sm text-[11px] font-black tracking-widest uppercase flex items-center space-x-1.5 shadow"
              title="Abrir modo pantalla completa para televisión o monitores"
            >
              <Tv className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">MODO REDACCIÓN</span>
            </button>

            {/* Radio Escaleta & Bulletin Mode */}
            <button
              onClick={onOpenEscaletaModal}
              className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-sm text-[11px] font-black tracking-widest uppercase flex items-center space-x-1.5 shadow border border-amber-400"
              title="Abrir modo escaleta y boletín de radio con lectura por voz (TTS)"
            >
              <Mic className="w-4 h-4 text-black animate-pulse" />
              <span className="hidden sm:inline">MODO ESCALETA</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


