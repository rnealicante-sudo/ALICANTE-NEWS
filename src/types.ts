export type CategoryType =
  | 'todas'
  | 'sucesos'
  | 'politica'
  | 'economia'
  | 'trafico'
  | 'alicante-ciudad'
  | 'provincia'
  | 'deportes'
  | 'cultura'
  | 'sociedad'
  | 'turismo'
  | 'sanidad'
  | 'educacion'
  | 'medio-ambiente';

export type ScopeType = 'todas' | 'ciudad' | 'provincia';

export type TimeRangeType = '2h' | '24h' | '48h' | '72h';

export type ConnectionStatusType =
  | 'connecting'
  | 'updating'
  | 'live'
  | 'no_connection'
  | 'source_error';

export type NewsLifecycleStatus = 'new' | 'updated' | 'previous';
export type NewsScope = 'ciudad' | 'provincia' | 'general';
export type GeoFilterMode = 'generales' | 'alicante_provincia';

export interface SourceConfig {
  id: string;
  name: string;
  domain: string;
  type: 'media' | 'institución' | 'emergencias' | 'ayuntamiento';
  rssUrl: string;
  websiteUrl: string;
  color: string;
  textColor?: string;
  logoText: string;
  active: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  sourceId: string;
  sourceDomain: string;
  publishedAt: string; // ISO 8601 original publication date from source
  updatedAt?: string; // ISO 8601 when modified by media
  firstSeenAt: string; // ISO 8601 when first ingested by aggregator
  lastCheckedAt: string; // ISO 8601 when last checked in source
  contentHash: string;
  status: NewsLifecycleStatus;
  category: CategoryType;
  municipality?: string;
  scope: NewsScope;
  isAlicanteProvincia?: boolean;
  groupId?: string;
  relevanceScore: number;
  isBreaking?: boolean;
}

export interface GroupedNews {
  id: string;
  mainTitle: string;
  summary: string;
  category: CategoryType;
  publishedAt: string; // Original earliest/newest publication date from verified sources
  updatedAt?: string;
  firstSeenAt: string;
  status: NewsLifecycleStatus;
  isNew?: boolean;
  scope: NewsScope;
  municipality?: string;
  isAlicanteProvincia?: boolean;
  sourcesCount: number;
  isBreaking?: boolean;
  sources: Array<{
    source: string;
    sourceId: string;
    link: string;
    title: string;
    publishedAt: string;
    updatedAt?: string;
  }>;
  items: NewsItem[];
  relevanceScore: number;
}

export interface RelevanceWeights {
  multiSource4Plus: number;
  multiSource3: number;
  multiSource2: number;
  recencyUnder2Hours: number;
  sucesosCategory: number;
  traficoCategory: number;
  weatherAlert: number;
  ayuntamientoCategory: number;
  transporteCategory: number;
  sanidadCategory: number;
  economiaCategory: number;
  agePenaltyPerHourPast12: number;
}

export interface SourceStatusDetail {
  ok: boolean;
  count: number;
  error?: string;
  lastChecked?: string;
  latencyMs?: number;
  incidentType?: 'none' | 'timeout' | 'slow_latency' | 'invalid_date' | 'feed_unreachable' | 'parse_error';
  incidentMessage?: string;
  lastSuccessAt?: string;
  futureDatesCorrected?: number;
}

export interface NewsApiResponse {
  timestamp: string; // Server response timestamp
  lastSourcesCheck: string; // "Última comprobación de fuentes: HH:MM:SS"
  latestPublishedAt: string; // "Última noticia publicada: HH:MM:SS"
  newCount: number; // Count of newly detected items in this cycle
  updatedCount: number; // Count of items updated by media in this cycle
  totalCount: number;
  status: ConnectionStatusType;
  statusMessage: string;
  sourceStatuses: Record<string, SourceStatusDetail>;
  temporalIncidentsCount?: number;
  averageLatencyMs?: number;
  news: NewsItem[];
  groupedNews: GroupedNews[];
  highlightedNews: GroupedNews[];
}

export type ThemeType = 'dark' | 'light';
export type SectionOrderType = 'featured-first' | 'teletype-first';

export interface UserPreferences {
  soundEnabled: boolean;
  selectedCategory: CategoryType;
  selectedScope: ScopeType;
  selectedTimeRange: TimeRangeType;
  selectedSourceId: string;
  newsroomMode: boolean;
  activeSources: string[];
  theme: ThemeType;
  sectionOrder: SectionOrderType;
}
