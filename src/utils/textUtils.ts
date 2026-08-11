import { CategoryType, RelevanceWeights } from '../types';
import { MUNICIPALITIES_ALICANTE, DEFAULT_RELEVANCE_WEIGHTS } from '../data/sources';

/**
 * Strips HTML tags safely and decodes common entities
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Validates and sanitizes URLs to permit HTTP and HTTPS only
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return '#';
}

/**
 * Categorizes a news item using keyword analysis
 */
export function detectCategory(title: string, summary: string): CategoryType {
  const text = `${title} ${summary}`.toLowerCase();

  // Sucesos / Emergencias / Incendios / Accidentes / Rescates
  if (
    /incendio|fuego|desalojo|accidente|choque|colisión|herido|fallecid|fallece|muerte|muere|atropello|rescate|detenido|policía|guardia civil|bomberos|drogas|robo|hurto|sucesos|112|alerta|emergencia|susto|ahogado/i.test(
      text
    )
  ) {
    return 'sucesos';
  }

  // Tráfico y Transporte
  if (
    /tráfico|carretera|a-7|ap-7|n-332|retenciones|obras|autovía|tram|autobús|estación|vuelo|aeropuerto|altet|miguel hernández|renfe|ave|puerto|embotellamiento|circulación/i.test(
      text
    )
  ) {
    return 'trafico';
  }

  // Política / Ayuntamiento / Pleno
  if (
    /ayuntamiento|alcalde|alcaldesa|pleno|pp|psoe|vox|compromís|concejal|diputación|consell|generalitat|partido|moción|elecciones|gobierno|portavoz|presupuestos/i.test(
      text
    )
  ) {
    return 'politica';
  }

  // Economía / Empresas / Comercio / Empleo
  if (
    /economía|empresa|comercio|empleo|paro|pyme|inversión|mercado|puerto de alicante|turismo empresarial|subida|precios|impuestos|pib|proyectos/i.test(
      text
    )
  ) {
    return 'economia';
  }

  // Sanidad / Salud / Hospitales
  if (
    /sanidad|hospital|médico|salud|urgencias|centro de salud|médica|pacientes|quirófano|listas de espera|virus|vacuna|doctor/i.test(
      text
    )
  ) {
    return 'sanidad';
  }

  // Educación / Universidad / Colegios
  if (
    /universidad de alicante|ua|umh|universidad miguel hernández|colegio|escuela|alumnos|profesores|docentes|educación|fp|instituto|becas/i.test(
      text
    )
  ) {
    return 'educacion';
  }

  // Deportes
  if (
    /hércules|hercules|elche cf|lucentum|baloncesto|fútbol|partido|derbi|liga|maratón|regata|pádel|tenis|triatlón|medalla|entrenador|fichaje/i.test(
      text
    )
  ) {
    return 'deportes';
  }

  // Cultura / Fiestas / Hogueras / Semana Santa
  if (
    /fogueres|hogueras|moros y cristianos|fiesta|concierto|teatro|museo|marq|mubag|exposición|cine|música|artista|patrimonio|festival|semana santa/i.test(
      text
    )
  ) {
    return 'cultura';
  }

  // Turismo
  if (
    /turismo|hotel|hoteles|playa|turistas|ocupación|vuelos|crucero|cruceros|hostelería|benidorm|costa blanca/i.test(
      text
    )
  ) {
    return 'turismo';
  }

  // Medio Ambiente / Agua / El Tiempo / AEMET
  if (
    /medio ambiente|agua|trasvase|dANA|aemet|lluvia|temporal|sequía|parque natural|serra gelada|paraje|reciclaje|contaminación/i.test(
      text
    )
  ) {
    return 'medio-ambiente';
  }

  // Sociedad
  if (
    /vecinos|barrio|asociación|sociedad|premios|voluntarios|solidaridad|sindicato|manifestación|protesta/i.test(
      text
    )
  ) {
    return 'sociedad';
  }

  // Check municipality to decide scope
  if (/alicante ciudad|capital|barrio de/i.test(text)) {
    return 'alicante-ciudad';
  }

  return 'provincia';
}

/**
 * Detects municipality in title and summary
 */
export function detectMunicipality(
  title: string,
  summary: string
): { municipality?: string; scope: 'ciudad' | 'provincia' } {
  const text = `${title} ${summary}`.toLowerCase();

  for (const m of MUNICIPALITIES_ALICANTE) {
    const nameLower = m.name.toLowerCase();

    // Check specific name matches
    if (text.includes(nameLower)) {
      return {
        municipality: m.name,
        scope: m.scope,
      };
    }
  }

  // Special aliases
  if (text.includes('capital') || text.includes('alacant') || text.includes('explanada') || text.includes('postiguet')) {
    return { municipality: 'Alicante', scope: 'ciudad' };
  }
  if (text.includes('elx') || text.includes('palmeral') || text.includes('martínez valero')) {
    return { municipality: 'Elche', scope: 'provincia' };
  }
  if (text.includes('san vicente') || text.includes('san vicent')) {
    return { municipality: 'San Vicente del Raspeig', scope: 'provincia' };
  }
  if (text.includes('vega baja') || text.includes('orihuela')) {
    return { municipality: 'Orihuela', scope: 'provincia' };
  }
  if (text.includes('marina alta') || text.includes('dénia') || text.includes('denia')) {
    return { municipality: 'Denia', scope: 'provincia' };
  }
  if (text.includes('marina baixa') || text.includes('benidorm')) {
    return { municipality: 'Benidorm', scope: 'provincia' };
  }

  return { scope: 'provincia' };
}

/**
 * Stemming / Tokenization for text similarity Jaccard index calculation
 */
function getNormalizedTokens(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^\w\s]/gi, ' '); // remove punctuation

  const stopwords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'a', 'ante',
    'bajo', 'con', 'contra', 'en', 'entre', 'hacia', 'hasta', 'para', 'por', 'según',
    'sin', 'sobre', 'tras', 'que', 'y', 'o', 'pero', 'mas', 'si', 'no', 'su', 'sus',
    'se', 'al', 'por', 'como', 'más', 'este', 'esta', 'estos', 'estas', 'tras', 'para',
    'con', 'del', 'las', 'por', 'los', 'un', 'una'
  ]);

  const words = clean.split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w));
  return new Set(words);
}

/**
 * Extracts key proper entities and numeric identifiers (e.g. "a7", "112", "crevillent", "elche", "canalejas")
 */
function getKeyEntities(text: string): Set<string> {
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const words = clean.split(/\s+/);
  const keyEntities = new Set<string>();

  words.forEach((w) => {
    if (
      w.length >= 4 ||
      /^(a7|ap7|n332|112|ua|umh|efe|gva|c4|c3)$/i.test(w) ||
      /\d+/.test(w)
    ) {
      keyEntities.add(w.replace(/[^\w]/g, ''));
    }
  });

  return keyEntities;
}

/**
 * Calculates Jaccard & entity similarity between two text strings (0.0 to 1.0)
 */
export function computeSimilarity(text1: string, text2: string): number {
  const tokens1 = getNormalizedTokens(text1);
  const tokens2 = getNormalizedTokens(text2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  });

  const unionSize = tokens1.size + tokens2.size - intersectionCount;
  const tokenJaccard = intersectionCount / unionSize;

  // Key entities overlap check
  const entities1 = getKeyEntities(text1);
  const entities2 = getKeyEntities(text2);

  let sharedEntities = 0;
  entities1.forEach((e) => {
    if (e.length >= 3 && entities2.has(e)) {
      sharedEntities++;
    }
  });

  // If they share 2+ key entities (e.g. "crevillent" & "incendio", "elche" & "a7", "explanada" & "canalejas")
  if (sharedEntities >= 2 && tokenJaccard >= 0.18) {
    return Math.max(tokenJaccard + 0.25, 0.55);
  } else if (sharedEntities >= 1 && tokenJaccard >= 0.25) {
    return Math.max(tokenJaccard + 0.15, 0.42);
  }

  return tokenJaccard;
}

/**
 * Calculates the relevance score based on the centralized formula in Section 19
 */
export function calculateRelevance(
  sourcesCount: number,
  publishedAtISO: string,
  category: CategoryType,
  title: string,
  summary: string,
  customWeights: RelevanceWeights = DEFAULT_RELEVANCE_WEIGHTS
): number {
  let score = 0;

  // 1. Multi-source bonus
  if (sourcesCount >= 4) {
    score += customWeights.multiSource4Plus;
  } else if (sourcesCount === 3) {
    score += customWeights.multiSource3;
  } else if (sourcesCount === 2) {
    score += customWeights.multiSource2;
  }

  // 2. Recency
  const pubTime = new Date(publishedAtISO).getTime();
  const now = Date.now();
  const hoursOld = Math.max(0, (now - pubTime) / (1000 * 60 * 60));

  if (hoursOld <= 2) {
    score += customWeights.recencyUnder2Hours;
  }

  // 3. Category & Keyword Bonuses
  const text = `${title} ${summary}`.toLowerCase();

  if (category === 'sucesos') {
    score += customWeights.sucesosCategory;
  }

  if (category === 'trafico' || /tráfico|retenciones|carretera|a-7|ap-7/i.test(text)) {
    score += customWeights.traficoCategory;
  }

  if (/alerta|aemet|112|emergencia|dANA|temporal|fuego|incendio/i.test(text)) {
    score += customWeights.weatherAlert;
  }

  if (category === 'politica' || /ayuntamiento|alcalde|pleno/i.test(text)) {
    score += customWeights.ayuntamientoCategory;
  }

  if (category === 'sanidad') {
    score += customWeights.sanidadCategory;
  }

  if (category === 'economia') {
    score += customWeights.economiaCategory;
  }

  // 4. Age Penalty (gradual decrease past 12 hours)
  if (hoursOld > 12) {
    const penaltyHours = hoursOld - 12;
    score -= penaltyHours * customWeights.agePenaltyPerHourPast12;
  }

  return Math.max(0, Math.round(score * 10) / 10);
}
