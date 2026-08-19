import React, { useState, useMemo } from 'react';
import { SourceConfig, SourceStatusDetail, ThemeType } from '../types';
import {
  X,
  Check,
  SlidersHorizontal,
  ShieldCheck,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Zap,
  CheckCircle2,
  XCircle,
  Radio,
  Building2,
  ShieldAlert,
  Newspaper,
  Landmark,
} from 'lucide-react';

interface SourcesModalProps {
  sources: SourceConfig[];
  sourceStatuses?: Record<string, SourceStatusDetail>;
  temporalIncidentsCount?: number;
  averageLatencyMs?: number;
  lastSourcesCheck?: string;
  theme?: ThemeType;
  onToggleSource: (sourceId: string, active: boolean) => void;
  onToggleAllSources?: (active: boolean) => void;
  onSelectOnlyOfficial?: () => void;
  onRefreshSources?: () => void;
  onClose: () => void;
}

type FilterCategory = 'all' | 'institucion' | 'emergencias' | 'medios' | 'ayuntamientos' | 'incidencias';

export const SourcesModal: React.FC<SourcesModalProps> = ({
  sources,
  sourceStatuses = {},
  temporalIncidentsCount = 0,
  averageLatencyMs = 0,
  lastSourcesCheck,
  theme = 'dark',
  onToggleSource,
  onToggleAllSources,
  onSelectOnlyOfficial,
  onRefreshSources,
  onClose,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const isLight = theme === 'light';

  // Calculate high-level metrics
  const totalCount = sources.length;
  const activeCount = sources.filter((s) => s.active).length;

  const sourcesWithIncidents = useMemo(() => {
    return sources.filter((s) => {
      const status = sourceStatuses[s.id];
      if (!status) return false;
      return !status.ok || (status.incidentType && status.incidentType !== 'none');
    });
  }, [sources, sourceStatuses]);

  // Filter sources based on category and search
  const filteredSources = useMemo(() => {
    return sources.filter((source) => {
      const status = sourceStatuses[source.id];
      const matchesSearch =
        searchQuery.trim() === '' ||
        source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.type.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'institucion') return source.type === 'institución';
      if (selectedFilter === 'emergencias') return source.type === 'emergencias';
      if (selectedFilter === 'medios') return source.type === 'media';
      if (selectedFilter === 'ayuntamientos') return source.type === 'ayuntamiento';
      if (selectedFilter === 'incidencias') {
        return !status || !status.ok || (status.incidentType && status.incidentType !== 'none');
      }

      return true;
    });
  }, [sources, sourceStatuses, selectedFilter, searchQuery]);

  const handleRefresh = async () => {
    if (onRefreshSources) {
      setIsRefreshing(true);
      await onRefreshSources();
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const formatCheckTime = (isoString?: string) => {
    if (!isoString) return '--:--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const renderIncidentBadge = (detail?: SourceStatusDetail) => {
    if (!detail) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600">
          <span>PENDIENTE</span>
        </span>
      );
    }

    if (!detail.ok) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
          <XCircle className="w-3 h-3 text-red-400" />
          <span>{detail.incidentType === 'timeout' ? 'TIMEOUT (>7s)' : 'NO DISPONIBLE'}</span>
        </span>
      );
    }

    if (detail.incidentType === 'slow_latency') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>LATENCIA ({detail.latencyMs}ms)</span>
        </span>
      );
    }

    if (detail.incidentType === 'invalid_date') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>FECHAS AJUSTADAS</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>SINCRONIZADA ({detail.latencyMs ? `${detail.latencyMs}ms` : 'OK'})</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`${
          isLight ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-[#0b0f19] text-white border-slate-800'
        } border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`${
            isLight ? 'bg-white border-slate-200' : 'bg-[#070a12] border-slate-800/80'
          } px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0`}
        >
          <div className="flex items-center space-x-3">
            <div className="bg-red-600/20 text-red-500 p-2.5 rounded-xl border border-red-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider">
                  MONITOR DE FUENTES OFICIALES, MEDIOS E INCIDENCIAS
                </h3>
                <span className="hidden sm:inline-block bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                  TIEMPO REAL
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Diagnóstico de latencia, disponibilidad y sincronización telemática de organismos y prensa.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onRefreshSources && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                } p-2 rounded-xl transition border border-slate-700/50 flex items-center space-x-1.5 text-xs font-bold disabled:opacity-50`}
                title="Comprobar latencias y estado de todas las fuentes ahora"
              >
                <RefreshCw className={`w-4 h-4 text-red-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Testear Fuentes</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`${
                isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-slate-800 text-slate-400'
              } p-2 rounded-xl transition`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Telemetry Dashboard Banner */}
        <div
          className={`${
            isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-[#0d1322] border-slate-800'
          } px-4 sm:px-6 py-3 border-b grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs font-mono`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Fuentes Activas</div>
              <div className="font-bold text-sm">
                <span className="text-emerald-500">{activeCount}</span> / {totalCount}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Incidencias Temporales</div>
              <div className="font-bold text-sm">
                <span className={sourcesWithIncidents.length > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                  {sourcesWithIncidents.length} detectadas
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Latencia Media</div>
              <div className="font-bold text-sm text-purple-400">
                {averageLatencyMs > 0 ? `${averageLatencyMs} ms` : 'Medición en curso'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Último Chequeo</div>
              <div className="font-bold text-sm text-slate-300">{formatCheckTime(lastSourcesCheck)}</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          className={`${
            isLight ? 'bg-white border-slate-200' : 'bg-[#080c16] border-slate-800'
          } px-4 sm:px-6 py-3 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0`}
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                selectedFilter === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Todas ({totalCount})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('institucion')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                selectedFilter === 'institucion'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Instituciones</span>
            </button>

            <button
              onClick={() => setSelectedFilter('emergencias')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                selectedFilter === 'emergencias'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergencias</span>
            </button>

            <button
              onClick={() => setSelectedFilter('medios')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                selectedFilter === 'medios'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Medios</span>
            </button>

            <button
              onClick={() => setSelectedFilter('ayuntamientos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                selectedFilter === 'ayuntamientos'
                  ? 'bg-red-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Ayuntamientos</span>
            </button>

            <button
              onClick={() => setSelectedFilter('incidencias')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                selectedFilter === 'incidencias'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isLight
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Incidencias ({sourcesWithIncidents.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar organismo o medio..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-900 focus:bg-white focus:border-red-500'
                  : 'bg-[#0f172a] border-slate-700 text-white focus:border-red-500 focus:bg-[#131d35]'
              } outline-none`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sources Grid List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredSources.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-slate-400">
                No se encontraron fuentes para el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSources.map((source) => {
                const statusDetail = sourceStatuses[source.id];
                const isOperative = statusDetail?.ok ?? true;
                const hasIncident =
                  statusDetail && (!statusDetail.ok || (statusDetail.incidentType && statusDetail.incidentType !== 'none'));

                return (
                  <div
                    key={source.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                      hasIncident
                        ? isLight
                          ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                          : 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                        : source.active
                        ? isLight
                          ? 'bg-white border-slate-200 shadow-sm'
                          : 'bg-[#0f172a]/90 border-slate-800'
                        : isLight
                        ? 'bg-slate-200/50 border-slate-300 opacity-60'
                        : 'bg-[#070a12]/60 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Source Icon & Info */}
                      <div className="flex items-start space-x-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-inner shrink-0 tracking-tighter"
                          style={{ backgroundColor: source.color || '#334155' }}
                        >
                          {source.logoText}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="font-bold text-sm truncate">{source.name}</h4>
                            <a
                              href={source.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-red-400 transition"
                              title="Abrir web oficial"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span className="truncate">{source.domain}</span>
                            <span>•</span>
                            <span className="capitalize font-semibold text-slate-300">{source.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Toggle Button */}
                      <button
                        onClick={() => onToggleSource(source.id, !source.active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                          source.active
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {source.active ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>ACTIVA</span>
                          </>
                        ) : (
                          <span>DESACTIVADA</span>
                        )}
                      </button>
                    </div>

                    {/* Bottom: Diagnostics & Incident Telemetry */}
                    <div
                      className={`mt-3 pt-2.5 border-t ${
                        isLight ? 'border-slate-200' : 'border-slate-800/80'
                      } flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono`}
                    >
                      <div className="flex items-center space-x-2">{renderIncidentBadge(statusDetail)}</div>

                      <div className="flex items-center space-x-3 text-slate-400">
                        {statusDetail?.count !== undefined && (
                          <span>
                            Noticias: <strong className="text-slate-200">{statusDetail.count}</strong>
                          </span>
                        )}

                        {statusDetail?.lastChecked && (
                          <span>
                            Chequeo: <strong>{formatCheckTime(statusDetail.lastChecked)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notice if there is a specific error message */}
                    {statusDetail?.incidentMessage && (
                      <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{statusDetail.incidentMessage}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`${
            isLight ? 'bg-white border-slate-200' : 'bg-[#070a12] border-slate-800'
          } px-4 sm:px-6 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0`}
        >
          <div className="flex items-center space-x-2 text-xs">
            {onToggleAllSources && (
              <>
                <button
                  onClick={() => onToggleAllSources(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Activar Todas
                </button>
                <button
                  onClick={() => onToggleAllSources(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Desactivar Todas
                </button>
              </>
            )}

            {onSelectOnlyOfficial && (
              <button
                onClick={onSelectOnlyOfficial}
                className="px-3 py-1.5 rounded-lg font-bold transition bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30"
              >
                Solo Oficiales
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider px-6 py-2 rounded-xl transition shadow-md w-full sm:w-auto"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
