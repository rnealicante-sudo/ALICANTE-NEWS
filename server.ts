import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchLiveNewsFromFeeds } from './server/rssFetcher.js';
import { groupNewsItems, selectHighlightedNews } from './src/utils/grouping.js';
import { INITIAL_SOURCES } from './src/data/sources.js';
import { NewsApiResponse } from './src/types.js';

let activeSourceIds = INITIAL_SOURCES.map((s) => s.id);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'TELETIPO ALICANTE' });
  });

  // Get Sources
  app.get('/api/sources', (req, res) => {
    const sourcesWithState = INITIAL_SOURCES.map((s) => ({
      ...s,
      active: activeSourceIds.includes(s.id),
    }));
    res.json(sourcesWithState);
  });

  // Toggle Source
  app.post('/api/sources/toggle', (req, res) => {
    const { sourceId, active } = req.body;
    if (sourceId) {
      if (active) {
        if (!activeSourceIds.includes(sourceId)) activeSourceIds.push(sourceId);
      } else {
        activeSourceIds = activeSourceIds.filter((id) => id !== sourceId);
      }
    }
    res.json({ success: true, activeSourceIds });
  });

  // Get News Endpoint
  app.get('/api/news', async (req, res) => {
    try {
      const { news, status, statusMessage, sourceStatuses } =
        await fetchLiveNewsFromFeeds(activeSourceIds);

      // Perform news grouping
      const groupedNews = groupNewsItems(news);

      // Select top highlighted news
      const highlightedNews = selectHighlightedNews(groupedNews, 5);

      const response: NewsApiResponse = {
        timestamp: new Date().toISOString(),
        status,
        statusMessage,
        sourceStatuses,
        news,
        groupedNews,
        highlightedNews,
      };

      res.json(response);
    } catch (error: any) {
      console.error('Error in /api/news:', error);
      res.status(500).json({
        timestamp: new Date().toISOString(),
        status: 'no_connection',
        statusMessage: 'Sin conexión con las fuentes',
        sourceStatuses: {},
        news: [],
        groupedNews: [],
        highlightedNews: [],
      });
    }
  });

  // Vite development or production static handler
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TELETIPO ALICANTE] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
