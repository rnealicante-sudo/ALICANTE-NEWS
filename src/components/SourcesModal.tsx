import React from 'react';
import { SourceConfig } from '../types';
import { X, Check, SlidersHorizontal, Info, ShieldCheck } from 'lucide-react';

interface SourcesModalProps {
  sources: SourceConfig[];
  onToggleSource: (sourceId: string, active: boolean) => void;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({
  sources,
  onToggleSource,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg border border-amber-500/40">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                CONFIGURACIÓN CENTRAL DE FUENTES AUTORIZADAS
              </h3>
              <p className="text-xs text-slate-400">
                Gestión de medios de comunicación profesionales, instituciones y emergencias de Alicante.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Banner */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Solo se autorizan fuentes periodísticas acreditadas, agregaciones oficiales y canales directos de emergencias.
          </span>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sources.map((source) => {
              return (
                <div
                  key={source.id}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                    source.active
                      ? 'bg-slate-800/90 border-slate-700'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-inner shrink-0"
                      style={{ backgroundColor: source.color || '#334155' }}
                    >
                      {source.logoText}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{source.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {source.domain} • <span className="capitalize">{source.type}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleSource(source.id, !source.active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                      source.active
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {source.active ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>ACTIVO</span>
                      </>
                    ) : (
                      <span>DESACTIVADO</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
