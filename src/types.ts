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
  publishedAt: string; // ISO 8601 string
  category: CategoryType;
  municipality?: string;
  scope: 'ciudad' | 'provincia';
  groupId?: string;
  relevanceScore: number;
  isNew?: boolean;
}

export interface GroupedNews {
  id: string;
  mainTitle: string;
  summary: string;
  category: CategoryType;
  publishedAt: string;
  scope: 'ciudad' | 'provincia';
  municipality?: string;
  sourcesCount: number;
  sources: Array<{
    source: string;
    sourceId: string;
    link: string;
    title: string;
    publishedAt: string;
  }>;
  items: NewsItem[];
  relevanceScore: number;
  isNew?: boolean;
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

export interface NewsApiResponse {
  timestamp: string;
  status: ConnectionStatusType;
  statusMessage: string;
  sourceStatuses: Record<string, { ok: boolean; count: number; error?: string }>;
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
