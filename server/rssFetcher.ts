import Parser from 'rss-parser';
import { INITIAL_SOURCES } from '../src/data/sources.js';
import { NewsItem, ConnectionStatusType, NewsLifecycleStatus, SourceStatusDetail } from '../src/types.js';
import {
  stripHtml,
  sanitizeUrl,
  detectCategory,
  detectMunicipality,
  calculateRelevance,
} from '../src/utils/textUtils.js';

const parser = new Parser({
  timeout: 7500,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (TeletipoAlicante-Monitor/3.0)',
    Accept:
      'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

/**
 * Simple deterministic hash for content comparison
 */
function createContentHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Persistent in-memory article database on the server
 */
const articlesDatabase = new Map<string, NewsItem>();

/**
 * Metadata about last sources check
 */
let lastSourcesCheckTimestamp = new Date().toISOString();
let lastCheckNewCount = 0;
let lastCheckUpdatedCount = 0;

/**
 * Status and temporal incident metrics of each authorized source
 */
const sourceStatusMap: Record<string, SourceStatusDetail> = {};

/**
 * Detects if a news item is breaking news based on recency and emergency keywords
 */
function isBreakingNews(title: string, summary: string, publishedAtISO: string): boolean {
  const pubTime = new Date(publishedAtISO).getTime();
  const now = Date.now();
  const hoursOld = (now - pubTime) / (1000 * 60 * 60);

  // Must be recent (less than 3 hours old)
  if (hoursOld > 3) return false;

  const text = `${title} ${summary}`.toLowerCase();
  return /alerta|urgente|última hora|preemergencia|aviso rojo|aviso naranja|incendio|fuego|desalojo|fallece|fallecid|muerto|herido grave|atropello múltiple|accidente grave|corte total|drogas|rescate aéreo|desaparecid|112 cv|speis|aemet/i.test(
    text
  );
}

/**
 * Fetch and synchronize live news from all authorized sources.
 * Accurately tracks response latency, temporal incidents, future timestamp anomalies,
 * and maintains clean synchronization metrics.
 */
export async function fetchLiveNewsFromFeeds(activeSourcesList: string[]) {
  const checkTimestamp = new Date().toISOString();
  const nowMs = Date.now();
  lastSourcesCheckTimestamp = checkTimestamp;

  const activeSources = INITIAL_SOURCES.filter(
    (s) => activeSourcesList.length === 0 || activeSourcesList.includes(s.id)
  );

  let cycleNewCount = 0;
  let cycleUpdatedCount = 0;
  let successfulSourcesCount = 0;
  let totalLatency = 0;
  let measuredLatenciesCount = 0;
  let incidentsCount = 0;

  // Reset status of all previously known articles to 'previous' before checking
  articlesDatabase.forEach((item) => {
    item.status = 'previous';
  });

  const fetchPromises = activeSources.map(async (source) => {
    const startTime = performance.now();
    let futureDatesCorrected = 0;
    let hadInvalidDate = false;

    try {
      const feed = await parser.parseURL(source.rssUrl);
      const elapsedMs = Math.round(performance.now() - startTime);
      totalLatency += elapsedMs;
      measuredLatenciesCount++;

      const sourceArticles: NewsItem[] = [];

      if (feed && feed.items && feed.items.length > 0) {
        for (const item of feed.items.slice(0, 30)) {
          const rawTitle = item.title || '';
          const cleanTitle = stripHtml(rawTitle).trim();
          if (!cleanTitle || cleanTitle.length < 4) continue;

          const rawSummary = item.contentSnippet || item.content || item.summary || '';
          const cleanSummary = stripHtml(rawSummary).slice(0, 350).trim();
          const link = sanitizeUrl(item.link || source.websiteUrl);

          // Original publication timestamp from the RSS item with temporal anomaly checks
          const pubDateStr = item.pubDate || item.isoDate;
          let validPubDate: string;

          if (pubDateStr) {
            const parsed = new Date(pubDateStr);
            const parsedTime = parsed.getTime();

            if (isNaN(parsedTime)) {
              validPubDate = checkTimestamp;
              hadInvalidDate = true;
            } else if (parsedTime > nowMs + 120000) {
              // Temporal anomaly: timestamp from feed is in the future (> 2 minutes ahead)
              // Normalize to current timestamp to preserve chronological teletype order
              validPubDate = checkTimestamp;
              futureDatesCorrected++;
            } else {
              validPubDate = parsed.toISOString();
            }
          } else {
            validPubDate = checkTimestamp;
          }

          const category = detectCategory(cleanTitle, cleanSummary);
          const { municipality, scope, isAlicanteProvincia } = detectMunicipality(
            cleanTitle,
            cleanSummary,
            source.id
          );

          // Unique identifier based on sourceId + link (or normalized title if link is missing)
          const cleanLink = link.split('?')[0].replace(/\/$/, '');
          const articleKey = `${source.id}::${cleanLink || createContentHash(cleanTitle)}`;
          const contentHash = createContentHash(`${cleanTitle}||${cleanSummary}`);
          const breaking = isBreakingNews(cleanTitle, cleanSummary, validPubDate);

          const existing = articlesDatabase.get(articleKey);

          let itemStatus: NewsLifecycleStatus = 'previous';
          let firstSeenAt = checkTimestamp;
          let updatedAt: string | undefined = undefined;

          if (existing) {
            firstSeenAt = existing.firstSeenAt;
            // Check if title or content was modified by the publisher
            if (existing.contentHash !== contentHash) {
              itemStatus = 'updated';
              updatedAt = checkTimestamp;
              cycleUpdatedCount++;
            } else {
              itemStatus = 'previous';
              updatedAt = existing.updatedAt;
            }
          } else {
            // Truly new article discovered in this cycle
            itemStatus = 'new';
            firstSeenAt = checkTimestamp;
            cycleNewCount++;
          }

          const relevanceScore = calculateRelevance(
            1,
            validPubDate,
            category,
            cleanTitle,
            cleanSummary
          );

          const newsItem: NewsItem = {
            id: articleKey,
            title: cleanTitle,
            summary: cleanSummary,
            link,
            source: source.name,
            sourceId: source.id,
            sourceDomain: source.domain,
            publishedAt: validPubDate, // Real original publication date
            updatedAt,
            firstSeenAt,
            lastCheckedAt: checkTimestamp,
            contentHash,
            status: itemStatus,
            category,
            municipality,
            scope,
            isAlicanteProvincia,
            relevanceScore,
            isBreaking: breaking,
          };

          // Save/Update in persistent store
          articlesDatabase.set(articleKey, newsItem);
          sourceArticles.push(newsItem);
        }
      }

      // Determine temporal incident classification
      let incidentType: SourceStatusDetail['incidentType'] = 'none';
      let incidentMessage: string | undefined = undefined;

      if (elapsedMs > 2800) {
        incidentType = 'slow_latency';
        incidentMessage = `Latencia elevada (${elapsedMs} ms)`;
        incidentsCount++;
      } else if (futureDatesCorrected > 0) {
        incidentType = 'invalid_date';
        incidentMessage = `${futureDatesCorrected} fechas futuras normalizadas`;
      } else if (hadInvalidDate) {
        incidentType = 'invalid_date';
        incidentMessage = 'Fechas RSS no estándar ajustadas';
      }

      sourceStatusMap[source.id] = {
        ok: true,
        count: sourceArticles.length,
        lastChecked: checkTimestamp,
        latencyMs: elapsedMs,
        incidentType,
        incidentMessage,
        lastSuccessAt: checkTimestamp,
        futureDatesCorrected,
      };

      if (sourceArticles.length > 0) {
        successfulSourcesCount++;
      }

      return sourceArticles;
    } catch (err: any) {
      const elapsedMs = Math.round(performance.now() - startTime);
      incidentsCount++;

      const isTimeout =
        elapsedMs >= 7000 ||
        err?.message?.includes('timeout') ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ECONNABORTED';

      const incidentType: SourceStatusDetail['incidentType'] = isTimeout
        ? 'timeout'
        : 'feed_unreachable';

      const incidentMessage = isTimeout
        ? `Tiempo de espera agotado (>7s)`
        : `Servidor de origen no disponible (${err?.message?.slice(0, 35) || 'Error de conexión'})`;

      const previousDetail = sourceStatusMap[source.id];

      sourceStatusMap[source.id] = {
        ok: false,
        count: previousDetail?.count || 0,
        error: incidentMessage,
        lastChecked: checkTimestamp,
        latencyMs: elapsedMs,
        incidentType,
        incidentMessage,
        lastSuccessAt: previousDetail?.lastSuccessAt,
        futureDatesCorrected: 0,
      };

      return [];
    }
  });

  await Promise.all(fetchPromises);

  lastCheckNewCount = cycleNewCount;
  lastCheckUpdatedCount = cycleUpdatedCount;

  // Retrieve all valid articles currently stored
  const allStoredArticles = Array.from(articlesDatabase.values());

  // Determine latest publication date across all verified articles
  let latestPublishedAt = checkTimestamp;
  if (allStoredArticles.length > 0) {
    const sortedByDate = [...allStoredArticles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    latestPublishedAt = sortedByDate[0].publishedAt;
  }

  const averageLatencyMs =
    measuredLatenciesCount > 0 ? Math.round(totalLatency / measuredLatenciesCount) : 0;

  let overallStatus: ConnectionStatusType = 'live';
  let statusMessage = 'Fuentes oficiales conectadas y sincronizadas en tiempo real';

  if (successfulSourcesCount === 0 && activeSources.length > 0) {
    if (allStoredArticles.length > 0) {
      overallStatus = 'source_error';
      statusMessage = 'Conexión con fuentes lenta o con incidencias temporales';
    } else {
      overallStatus = 'no_connection';
      statusMessage = 'Sin conexión con las fuentes oficiales';
    }
  } else if (incidentsCount > 0) {
    overallStatus = 'source_error';
    statusMessage = `Sincronizado (${incidentsCount} incidencias temporales / latencias monitorizadas)`;
  }

  return {
    news: allStoredArticles,
    lastSourcesCheck: lastSourcesCheckTimestamp,
    latestPublishedAt,
    newCount: cycleNewCount,
    updatedCount: cycleUpdatedCount,
    totalCount: allStoredArticles.length,
    status: overallStatus,
    statusMessage,
    sourceStatuses: sourceStatusMap,
    temporalIncidentsCount: incidentsCount,
    averageLatencyMs,
  };
}

// Background auto-refresh task every 2.5 minutes (150,000 ms)
setInterval(async () => {
  try {
    const activeIds = INITIAL_SOURCES.map((s) => s.id);
    await fetchLiveNewsFromFeeds(activeIds);
    console.log(
      `[AUTO-FETCH] Sincronización completada a las ${new Date().toLocaleTimeString()} - Total noticias: ${articlesDatabase.size}`
    );
  } catch (e) {
    console.error('[AUTO-FETCH ERROR]', e);
  }
}, 150000);

// Perform initial fetch immediately on server start
fetchLiveNewsFromFeeds(INITIAL_SOURCES.map((s) => s.id)).catch((err) => {
  console.error('[INITIAL-FETCH ERROR]', err);
});

