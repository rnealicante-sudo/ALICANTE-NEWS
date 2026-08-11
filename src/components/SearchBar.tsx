import React from 'react';
import { Search, X } from 'lucide-react';
import { ThemeType } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  theme?: ThemeType;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  resultCount,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div className={`${isLight ? 'bg-slate-200 border-b border-slate-300 text-slate-900' : 'bg-[#050608] border-b border-[#1e293b] text-white'} py-3 px-4 transition-colors`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-[#64748b]'}`} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar en el teletipo..."
            className={`block w-full pl-9 pr-8 py-2 rounded text-xs font-medium focus:outline-none focus:border-[#ef4444] ${
              isLight
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-[#0a0f18] border border-[#1e293b] text-white placeholder-[#64748b]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute inset-y-0 right-0 pr-2.5 flex items-center ${
                isLight ? 'text-slate-400 hover:text-slate-900' : 'text-[#64748b] hover:text-white'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={`text-xs font-mono font-bold uppercase tracking-wider self-end sm:self-center ${
          isLight ? 'text-slate-600' : 'text-[#64748b]'
        }`}>
          Mostrando <span className="text-[#ef4444] font-bold">{resultCount}</span> acontecimientos
        </div>
      </div>
    </div>
  );
};

