import React from 'react';
import { Radio, ExternalLink } from 'lucide-react';
import { ThemeType } from '../types';

interface RadioBannerProps {
  theme?: ThemeType;
}

export const RadioBanner: React.FC<RadioBannerProps> = ({ theme = 'dark' }) => {
  const radioUrl = 'https://rnealicante-sudo.github.io/revoxmix-mobile/';
  const isLight = theme === 'light';

  return (
    <div className={`${isLight ? 'bg-slate-200 border-b border-slate-300 text-slate-900' : 'bg-[#0a0f18] border-b border-[#1e293b] text-white'} px-4 py-2.5 shadow-md transition-colors`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`${isLight ? 'bg-red-100 text-red-600 border border-red-300' : 'bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444]'} p-2 rounded-full shrink-0`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-black text-xs tracking-widest uppercase ${isLight ? 'text-red-700' : 'text-white'}`}>
                EMISORAS DE RADIO DE ALICANTE EN DIRECTO
              </span>
              <span className="bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-widest animate-pulse">
                EN DIRECTO
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-[#94a3b8]'}`}>
              Cadena SER, COPE, Onda Cero, RNE y más emisoras locales
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href={radioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm shadow transition flex items-center space-x-1.5"
          >
            <span>Escuchar Radios en Directo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};


