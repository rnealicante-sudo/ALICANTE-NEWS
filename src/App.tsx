import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CategoryType,
  ScopeType,
  TimeRangeType,
  ConnectionStatusType,
  NewsApiResponse,
  SourceConfig,
  GroupedNews,
  ThemeType,
  SectionOrderType,
} from './types';
import { INITIAL_SOURCES } from './data/sources';
import { audioNotifier } from './utils/AudioNotifier';
import { DigitalClock } from './components/DigitalClock';
import { RadioBanner } from './components/RadioBanner';
import { Header } from './components/Header';
import { HighlightedNews } from './components/HighlightedNews';
import { FilterBar } from './components/FilterBar';
import { SearchBar } from './components/SearchBar';
import { TeletypeList } from './components/TeletypeList';
import { NewsroomMode } from './components/NewsroomMode';
import { SourcesModal } from './components/SourcesModal';
import { EscaletaModal } from './components/EscaletaModal';
import { TickerBanner } from './components/TickerBanner';
import { MostRecentNewsCard } from './components/MostRecentNewsCard';

const OFFICIAL_SOURCE_IDS = new Set([
  'gva',
  'diputacion',
  'gva112',
  'bomberos',
  'ayto-alicante',
  'ayto-elche',
  'ayto-torrevieja',
  'ayto-benidorm',
]);

export default function App() {
  // Local Storage Initialization
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('teletipo_sound') !== 'false';
  });
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => {
    return (localStorage.getItem('teletipo_category') as CategoryType) || 'todas';
  });
  const [selectedScope, setSelectedScope] = useState<ScopeType>(() => {
    return (localStorage.getItem('teletipo_scope') as ScopeType) || 'todas';
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeType>(() => {
    return (localStorage.getItem('teletipo_time') as TimeRangeType) || '72h';
  });
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('teletipo_theme') as ThemeType) || 'dark';
  });
  const [sectionOrder, setSectionOrder] = useState<SectionOrderType>(() => {
    return (localStorage.getItem('teletipo_order') as SectionOrderType) || 'featured-first';
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [newsroomMode, setNewsroomMode] = useState<boolean>(() => {
    return localStorage.getItem('teletipo_newsroom') === 'true';
  });
  const [onlyOfficialSources, setOnlyOfficialSources] = useState<boolean>(() => {
    return localStorage.getItem('teletipo_only_official') === 'true';
  });
  const [showEscaletaModal, setShowEscaletaModal] = useState<boolean>(false);

  // State
  const [status, setStatus] = useState<ConnectionStatusType>('connecting');
  const [statusMessage, setStatusMessage] = useState<string>('Conectando con las fuentes...');
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string>('');
  const [groupedNews, setGroupedNews] = useState<GroupedNews[]>([]);
  const [highlightedNews, setHighlightedNews] = useState<GroupedNews[]>([]);
  const [mostRecentNewsItem, setMostRecentNewsItem] = useState<GroupedNews | null>(null);
  const [sources, setSources] = useState<SourceConfig[]>(INITIAL_SOURCES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);
  const [hasNewItemsState, setHasNewItemsState] = useState<boolean>(false);

  const knownNewsIdsRef = useRef<Set<string>>(new Set());

  // Save Preferences
  useEffect(() => {
    localStorage.setItem('teletipo_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('teletipo_category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('teletipo_scope', selectedScope);
  }, [selectedScope]);

  useEffect(() => {
    localStorage.setItem('teletipo_time', selectedTimeRange);
  }, [selectedTimeRange]);

  useEffect(() => {
    localStorage.setItem('teletipo_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('teletipo_order', sectionOrder);
  }, [sectionOrder]);

  useEffect(() => {
    localStorage.setItem('teletipo_newsroom', String(newsroomMode));
  }, [newsroomMode]);

  useEffect(() => {
    localStorage.setItem('teletipo_only_official', String(onlyOfficialSources));
  }, [onlyOfficialSources]);

  // Fetch News from Backend
  const fetchNews = useCallback(async () => {
    try {
      setStatus((prev) => (prev === 'live' ? 'updating' : 'connecting'));
      const res = await fetch('/api/news');

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: NewsApiResponse = await res.json();

      // Detect new items
      let hasNewItems = false;
      const currentIds = new Set<string>();

      data.groupedNews.forEach((group) => {
        currentIds.add(group.id);
        if (knownNewsIdsRef.current.size > 0 && !knownNewsIdsRef.current.has(group.id)) {
          group.isNew = true;
          hasNewItems = true;
        }
      });

      // Update known ids
      knownNewsIdsRef.current = currentIds;

      setGroupedNews(data.groupedNews);
      setHighlightedNews(data.highlightedNews);
      
      if (data.groupedNews && data.groupedNews.length > 0) {
        // Sort all groups strictly by publishedAt timestamp descending
        const sortedByTime = [...data.groupedNews].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        const newestFresh = sortedByTime.find((g) => g.isNew);
        const absoluteNewest = newestFresh || sortedByTime[0];
        setMostRecentNewsItem(absoluteNewest);
      }

      setStatus(data.status);
      setStatusMessage(data.statusMessage);
      setLastUpdatedISO(data.timestamp);

      if (hasNewItems) {
        setHasNewItemsState(true);
        setTimeout(() => setHasNewItemsState(false), 8000);

        // Play chime if new news arrived and sound is enabled
        if (soundEnabled) {
          audioNotifier.playNewsChime();
        }
      }
    } catch (err: any) {
      console.error('Error fetching news:', err);
      setStatus('no_connection');
      setStatusMessage('Sin conexión con las fuentes');
    }
  }, [soundEnabled]);

  // Fetch on Mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 60-Second Auto Refresh Timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      fetchNews();
    }, 60000);

    return () => clearInterval(interval);
  }, [isPaused, fetchNews]);

  // Toggle Source Status
  const handleToggleSource = async (sourceId: string, active: boolean) => {
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, active } : s))
    );

    try {
      await fetch('/api/sources/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, active }),
      });
      fetchNews();
    } catch (e) {
      console.error('Error toggling source:', e);
    }
  };

  // Filter Grouped News
  const filteredGroupedNews = groupedNews.filter((group) => {
    // 1. Time filter
    const pubTime = new Date(group.publishedAt).getTime();
    const now = Date.now();
    const hoursDiff = (now - pubTime) / (1000 * 60 * 60);

    let maxHours = 72;
    if (selectedTimeRange === '2h') maxHours = 2;
    if (selectedTimeRange === '24h') maxHours = 24;
    if (selectedTimeRange === '48h') maxHours = 48;

    if (hoursDiff > maxHours) return false;

    // 2. Scope filter
    if (selectedScope === 'ciudad' && group.scope !== 'ciudad') return false;
    if (selectedScope === 'provincia' && group.scope !== 'provincia') return false;

    // 3. Category filter
    if (selectedCategory !== 'todas') {
      if (selectedCategory === 'alicante-ciudad') {
        if (group.scope !== 'ciudad') return false;
      } else if (selectedCategory === 'provincia') {
        if (group.scope !== 'provincia') return false;
      } else if (group.category !== selectedCategory) {
        return false;
      }
    }

    // 4. Official Sources Filter
    if (onlyOfficialSources) {
      const isOfficialGroup = group.sources.some(
        (s) =>
          OFFICIAL_SOURCE_IDS.has(s.sourceId) ||
          /ayuntamiento|diputación|generalitat|gva|bomberos|112/i.test(s.source)
      );
      if (!isOfficialGroup) return false;
    }

    // 5. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = group.mainTitle.toLowerCase().includes(q);
      const matchSummary = group.summary.toLowerCase().includes(q);
      const matchCategory = group.category.toLowerCase().includes(q);
      const matchMunicipality = group.municipality?.toLowerCase().includes(q);
      const matchSource = group.sources.some((s) => s.source.toLowerCase().includes(q));

      if (!matchTitle && !matchSummary && !matchCategory && !matchMunicipality && !matchSource) {
        return false;
      }
    }

    return true;
  });

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen font-sans antialiased flex flex-col selection:bg-[#ef4444] selection:text-white transition-colors ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#050608] text-[#e2e8f0]'
    }`}>
      {/* 1. Top Digital Clock */}
      <DigitalClock theme={theme} />

      {/* Ticker Marquee Banner (Último Teletipo Animado - Justo debajo de Central Telegráfica de Noticias) */}
      <TickerBanner newsGroups={groupedNews} theme={theme} />

      {/* 2. Radios Banner */}
      <RadioBanner theme={theme} />

      {/* 3. Header */}
      <Header
        status={status}
        statusMessage={statusMessage}
        lastUpdatedISO={lastUpdatedISO}
        isPaused={isPaused}
        soundEnabled={soundEnabled}
        theme={theme}
        sectionOrder={sectionOrder}
        hasNewItems={hasNewItemsState}
        onRefresh={fetchNews}
        onTogglePause={() => setIsPaused(!isPaused)}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onToggleSectionOrder={() => setSectionOrder(sectionOrder === 'featured-first' ? 'teletype-first' : 'featured-first')}
        onOpenSourcesModal={() => setShowSourcesModal(true)}
        onToggleNewsroomMode={() => setNewsroomMode(true)}
        onOpenEscaletaModal={() => setShowEscaletaModal(true)}
      />

      {/* Dedicated Section: NOTICIA MÁS RECIENTE (Muestra la hora y el medio con sonido de alerta) */}
      <MostRecentNewsCard
        newsItem={mostRecentNewsItem}
        theme={theme}
        soundEnabled={soundEnabled}
        hasNewAlert={hasNewItemsState}
      />

      {/* 4. Filter Controls */}
      <FilterBar
        selectedCategory={selectedCategory}
        selectedTimeRange={selectedTimeRange}
        selectedScope={selectedScope}
        onlyOfficialSources={onlyOfficialSources}
        theme={theme}
        onSelectCategory={setSelectedCategory}
        onSelectTimeRange={setSelectedTimeRange}
        onSelectScope={setSelectedScope}
        onToggleOnlyOfficialSources={() => setOnlyOfficialSources(!onlyOfficialSources)}
      />

      {/* 5. Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredGroupedNews.length}
        theme={theme}
      />

      {/* Render Main Content according to chosen Section Order */}
      {sectionOrder === 'featured-first' ? (
        <>
          {/* Highlighted News First */}
          <HighlightedNews highlightedItems={highlightedNews} theme={theme} />
          {/* Teletype List Second */}
          <TeletypeList newsGroups={filteredGroupedNews} theme={theme} />
        </>
      ) : (
        <>
          {/* Teletype List First */}
          <TeletypeList newsGroups={filteredGroupedNews} theme={theme} />
          {/* Highlighted News Second */}
          <HighlightedNews highlightedItems={highlightedNews} theme={theme} />
        </>
      )}

      {/* Footer */}
      <footer className={`${isLight ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-[#050608] border-[#1e293b] text-slate-500'} border-t py-6 text-center text-xs font-mono mt-auto transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold">
            CENTRAL TELEGRÁFICA DE NOTICIAS DE ALICANTE BY REVOX
          </p>
          <p>
            Fuentes autorizadas: SER Alicante, COPE Alicante, Onda Cero Alicante, RTVE Alicante, Agencia EFE, Europa Press, Diario INFORMACIÓN, Alicante Plaza, Las Provincias, Levante-EMV, ABC, EL PAÍS, EL MUNDO, La Vanguardia, elDiario.es, El Confidencial.
          </p>
          <p className="text-[10px] opacity-70">
            © 2026 TELETIPO ALICANTE. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* TV Newsroom Fullscreen Mode Modal */}
      {newsroomMode && (
        <NewsroomMode
          status={status}
          lastUpdatedISO={lastUpdatedISO}
          highlightedItems={highlightedNews}
          newsGroups={filteredGroupedNews}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onCloseNewsroomMode={() => setNewsroomMode(false)}
        />
      )}

      {/* Sources Manager Modal */}
      {showSourcesModal && (
        <SourcesModal
          sources={sources}
          onToggleSource={handleToggleSource}
          onClose={() => setShowSourcesModal(false)}
        />
      )}

      {/* Radio Escaleta Modal */}
      <EscaletaModal
        isOpen={showEscaletaModal}
        newsGroups={filteredGroupedNews}
        theme={theme}
        onClose={() => setShowEscaletaModal(false)}
      />
    </div>
  );
}

