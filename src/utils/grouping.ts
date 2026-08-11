import { NewsItem, GroupedNews, RelevanceWeights } from '../types';
import { computeSimilarity, calculateRelevance } from './textUtils';
import { DEFAULT_RELEVANCE_WEIGHTS } from '../data/sources';

/**
 * Normalizes title string for exact comparison
 */
function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Group news items that refer to the same event from different or same media outlets,
 * ensuring no duplicate news from the same media or identical headlines.
 */
export function groupNewsItems(
  items: NewsItem[],
  customWeights: RelevanceWeights = DEFAULT_RELEVANCE_WEIGHTS,
  similarityThreshold = 0.22
): GroupedNews[] {
  // 1. Intra-source and exact-title pre-deduplication pass:
  // If an item from the SAME source (or exact same title) appears multiple times,
  // keep only the freshest one.
  const deduplicatedItems: NewsItem[] = [];
  const seenKeys = new Map<string, NewsItem>(); // sourceId + normalizedTitle or link

  // Sort by publishedAt descending so we see freshest first
  const initialSorted = [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  for (const item of initialSorted) {
    const normTitle = normalizeTitle(item.title);
    const sourceKey = `${item.sourceId}::${normTitle.slice(0, 40)}`;
    const linkKey = item.link;

    let isDuplicate = false;

    for (const existing of deduplicatedItems) {
      // Check if exact same link
      if (existing.link && existing.link === linkKey) {
        isDuplicate = true;
        break;
      }

      // Check if same source with near-identical title
      if (existing.sourceId === item.sourceId) {
        const sim = computeSimilarity(existing.title, item.title);
        if (sim >= 0.20 || normalizeTitle(existing.title) === normTitle) {
          isDuplicate = true;
          break;
        }
      }

      // Check if identical title across any source
      if (normalizeTitle(existing.title) === normTitle) {
        // Same exact headline across feeds - keep existing (freshest)
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      deduplicatedItems.push(item);
    }
  }

  // 2. Main Grouping logic across media sources:
  const sorted = [...deduplicatedItems].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const groups: GroupedNews[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (assigned.has(item.id)) continue;

    // Start a new group with this item
    const currentGroupItems: NewsItem[] = [item];
    assigned.add(item.id);

    // Look for matching items from other sources published within 48 hours
    const itemTime = new Date(item.publishedAt).getTime();

    for (let j = i + 1; j < sorted.length; j++) {
      const candidate = sorted[j];
      if (assigned.has(candidate.id)) continue;

      const candidateTime = new Date(candidate.publishedAt).getTime();
      const hoursDiff = Math.abs(itemTime - candidateTime) / (1000 * 60 * 60);

      if (hoursDiff <= 48) {
        // Compare title and summary similarity
        const titleSim = computeSimilarity(item.title, candidate.title);
        const combinedSim = computeSimilarity(
          `${item.title} ${item.summary}`,
          `${candidate.title} ${candidate.summary}`
        );

        const maxSim = Math.max(titleSim, combinedSim);

        // Group if similarity exceeds threshold
        if (maxSim >= similarityThreshold) {
          currentGroupItems.push(candidate);
          assigned.add(candidate.id);
        }
      }
    }

    // Build the GroupedNews structure
    // Pick the most detailed / complete real title among the grouped items
    const sortedGroupTitles = [...currentGroupItems].sort(
      (a, b) => b.title.length - a.title.length
    );
    const bestRealTitle = sortedGroupTitles[0].title;
    const bestSummary = sortedGroupTitles[0].summary || item.summary;

    // Build unique source links (Ensure 1 entry per media outlet)
    const sourceMap = new Map<
      string,
      { source: string; sourceId: string; link: string; title: string; publishedAt: string }
    >();

    currentGroupItems.forEach((gi) => {
      if (
        !sourceMap.has(gi.sourceId) ||
        new Date(gi.publishedAt) > new Date(sourceMap.get(gi.sourceId)!.publishedAt)
      ) {
        sourceMap.set(gi.sourceId, {
          source: gi.source,
          sourceId: gi.sourceId,
          link: gi.link,
          title: gi.title,
          publishedAt: gi.publishedAt,
        });
      }
    });

    const sources = Array.from(sourceMap.values());
    const newestPublishDate = currentGroupItems.reduce(
      (max, p) => (new Date(p.publishedAt) > new Date(max) ? p.publishedAt : max),
      item.publishedAt
    );

    const isNew = currentGroupItems.some((gi) => gi.isNew);

    const relevanceScore = calculateRelevance(
      sources.length,
      newestPublishDate,
      item.category,
      bestRealTitle,
      bestSummary,
      customWeights
    );

    groups.push({
      id: `group-${item.id}`,
      mainTitle: bestRealTitle,
      summary: bestSummary,
      category: item.category,
      publishedAt: newestPublishDate,
      scope: item.scope,
      municipality: item.municipality,
      sourcesCount: sources.length,
      sources,
      items: currentGroupItems,
      relevanceScore,
      isNew,
    });
  }

  // Sort groups strictly by publishedAt descending (freshest first)
  return groups.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Filter top 3-5 highlighted news of the day (highest relevance)
 */
export function selectHighlightedNews(
  groups: GroupedNews[],
  maxCount = 5
): GroupedNews[] {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  // Filter items from last 24-30 hours
  const todayGroups = groups.filter((g) => {
    const pubTime = new Date(g.publishedAt).getTime();
    return now - pubTime <= twentyFourHours * 1.25;
  });

  // Sort by relevanceScore descending, then by sourcesCount descending, then recency
  const sortedByRelevance = [...todayGroups].sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    if (b.sourcesCount !== a.sourcesCount) {
      return b.sourcesCount - a.sourcesCount;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  if (sortedByRelevance.length < 3) {
    // If fewer than 3 today, fallback to all groups sorted by relevance
    return [...groups]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxCount);
  }

  return sortedByRelevance.slice(0, maxCount);
}
