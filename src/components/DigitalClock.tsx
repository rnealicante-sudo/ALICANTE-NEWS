import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { ThemeType } from '../types';

interface DigitalClockProps {
  theme?: ThemeType;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({ theme = 'dark' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const isLight = theme === 'light';

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const formatDate = (d: Date) => {
    const days = [
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIÉRCOLES',
      'JUEVES',
      'VIERNES',
      'SÁBADO',
    ];
    const months = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ];

    const dayName = days[d.getDay()];
    const dayNum = d.getDate();
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();

    return `${dayName}, ${dayNum} DE ${monthName} DE ${year}`;
  };

  return (
    <div className={`${isLight ? 'bg-slate-900 text-slate-100 border-b border-slate-800' : 'bg-[#050608] text-[#e2e8f0] border-b border-[#1e293b]'} px-4 py-2 flex flex-wrap items-center justify-between text-xs tracking-wider font-mono shadow-inner transition-colors`}>
      <div className="flex items-center space-x-2 text-[#ef4444] font-bold uppercase tracking-widest">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
        </span>
        <span>
          CENTRAL TELEGRÁFICA DE NOTICIAS DE ALICANTE{' '}
          <span className="text-amber-400 font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
            BY REVOX
          </span>
        </span>
      </div>

      <div className="flex items-center space-x-6 my-1 sm:my-0">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-[#ef4444]" />
          <span className="font-semibold text-slate-200">{formatDate(time)}</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-black border border-slate-800 px-2.5 py-0.5 rounded text-[#ef4444] font-bold text-sm tracking-widest shadow-sm">
          <Clock className="w-3.5 h-3.5 text-[#ef4444] animate-pulse" />
          <span>{formatTime(time)}</span>
        </div>
      </div>
    </div>
  );
};

