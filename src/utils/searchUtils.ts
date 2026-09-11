export interface SearchableProduct {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  subcategory?: string | null;
  subCategory?: string | null;
  brand?: string | null;
  brandName?: string | null;
  size?: string | null;
  color?: string | null;
  colour?: string | null;
  aliases?: string[] | null;
  [key: string]: any;
}

// Common Sri Lankan / Hardware Shop Typos and Synonym Map
const HARDWARE_SYNONYM_MAP: Record<string, string> = {
  elbo: 'elbow',
  elboo: 'elbow',
  elboww: 'elbow',
  elb: 'elbow',
  couplng: 'coupling',
  cplg: 'coupling',
  copling: 'coupling',
  reducor: 'reducer',
  reducr: 'reducer',
  reduc: 'reducer',
  nipl: 'nipple',
  nipll: 'nipple',
  pvc: 'pvc',
  upvc: 'pvc',
  cpvc: 'pvc',
  valv: 'valve',
  valeb: 'valve',
  valve: 'valve',
  tapp: 'tap',
  scre: 'screw',
  skrew: 'screw',
  skrews: 'screw',
  screws: 'screw',
  nail: 'nail',
  nails: 'nail',
  blt: 'bolt',
  bolts: 'bolt',
  washr: 'washer',
  washers: 'washer',
  socket: 'socket',
  sockt: 'socket',
};

/**
 * Normalizes search text by converting units, handling quotes/hyphens, and replacing common typos.
 */
export function normalizeHardwareSearchTerm(rawInput: string): string[] {
  let cleaned = (rawInput || '')
    .toLowerCase()
    .trim()
    .replace(/["”]/g, 'inch') // Replace quotes with inch
    .replace(/([0-9]+)\s*mm/g, '$1mm $1') // 200mm -> 200mm 200
    .replace(/([0-9]+)\s*cm/g, '$1cm $1') // 20cm -> 20cm 20
    .replace(/([0-9]+)\s*(inch|in)/g, '$1inch $1in $1'); // 2inch -> 2inch 2in 2

  const rawTokens = cleaned.split(/[\s,/-]+/).filter(Boolean);
  const normalizedTokens: string[] = [];

  for (const token of rawTokens) {
    normalizedTokens.push(token);
    // Replace mapped synonym if exists
    if (HARDWARE_SYNONYM_MAP[token]) {
      normalizedTokens.push(HARDWARE_SYNONYM_MAP[token]);
    }
  }

  return Array.from(new Set(normalizedTokens));
}

/**
 * Calculates Levenshtein Distance between two strings.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Returns true if candidate string is a fuzzy match for token based on allowed edit distance.
 */
function isFuzzyTokenMatch(token: string, candidate: string): boolean {
  if (candidate.includes(token)) return true;

  if (token.length <= 3) return false;

  const candidateWords = candidate.split(/\s+/).filter(Boolean);
  const maxDistance = token.length > 7 ? 2 : 1;

  for (const word of candidateWords) {
    if (word.length <= 2) continue;
    if (Math.abs(word.length - token.length) > maxDistance) continue;

    const dist = levenshteinDistance(token, word);
    if (dist <= maxDistance) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if query tokens exist (exact, alias, dimension, or fuzzy match) and calculates relevance score.
 */
export function matchAndScoreProduct<T extends SearchableProduct>(
  product: T,
  searchQuery: string
): { matches: boolean; score: number } {
  const rawQuery = (searchQuery || '').trim();
  if (!rawQuery) {
    return { matches: true, score: 0 };
  }

  const normalizedTokens = normalizeHardwareSearchTerm(rawQuery);
  if (normalizedTokens.length === 0) {
    return { matches: true, score: 0 };
  }

  const name = (product.name || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const barcode = (product.barcode || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const subcategory = (product.subcategory || product.subCategory || '').toLowerCase();
  const brand = (product.brand || product.brandName || '').toLowerCase();
  const size = (product.size || '').toLowerCase();
  const color = (product.color || product.colour || '').toLowerCase();
  const customAliases = (product.aliases || []).map((a: string) => a.toLowerCase()).join(' ');

  const combinedText = `${name} ${sku} ${barcode} ${brand} ${category} ${subcategory} ${size} ${color} ${customAliases}`.toLowerCase();

  // ── ALL WORDS MUST MATCH (prevents false positives) ───────────────────────
  // e.g. "electric mixer 1050w" must not match every Electrical & Lighting
  // product just because the category name contains "electric".
  // For multi-word queries every raw word the user typed must have at least
  // one hit (exact or fuzzy) somewhere in the product's combined text.
  const rawBaseTokens = rawQuery
    .toLowerCase()
    .replace(/[""]/g, 'inch')
    .split(/[\s,/-]+/)
    .filter(Boolean);

  if (rawBaseTokens.length > 1) {
    for (const rawToken of rawBaseTokens) {
      const forms: string[] = [rawToken];
      if (HARDWARE_SYNONYM_MAP[rawToken]) forms.push(HARDWARE_SYNONYM_MAP[rawToken]);
      const mmM = rawToken.match(/^(\d+)mm$/);          if (mmM) forms.push(mmM[1]);
      const cmM = rawToken.match(/^(\d+)cm$/);          if (cmM) forms.push(cmM[1]);
      const inM = rawToken.match(/^(\d+)(inch|in)$/);   if (inM) forms.push(inM[1]);
      const anyHit = forms.some(
        f => combinedText.includes(f) || isFuzzyTokenMatch(f, combinedText)
      );
      if (!anyHit) return { matches: false, score: 0 };
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  let totalScore = 0;
  let matchedTokens = 0;

  // Extract any numbers from search query for size weighting (e.g. 200 in "elbo 200")
  const numbersInQuery = rawQuery.match(/\b\d+(\.\d+)?\b/g) || [];

  for (const token of normalizedTokens) {
    if (combinedText.includes(token)) {
      matchedTokens++;
      totalScore += 80;
    } else if (isFuzzyTokenMatch(token, combinedText)) {
      matchedTokens++;
      totalScore += 35;
    }
  }

  // If no tokens matched, return no match
  if (matchedTokens === 0) {
    return { matches: false, score: 0 };
  }

  // 1. Exact Full Match Bonuses
  const cleanRaw = rawQuery.toLowerCase();
  if (name === cleanRaw) {
    totalScore += 1200;
  } else if (name.startsWith(cleanRaw)) {
    totalScore += 600;
  } else if (name.includes(cleanRaw)) {
    totalScore += 350;
  }

  if (sku === cleanRaw || barcode === cleanRaw) {
    totalScore += 1000;
  } else if (sku.includes(cleanRaw) || barcode.includes(cleanRaw)) {
    totalScore += 500;
  }

  // 2. Hardware Dimension / Size Weighting (+600 bonus)
  // Ensures searching "elbo 200" ranks "PVC Elbow 200mm" #1 over 160mm or 250mm
  for (const numStr of numbersInQuery) {
    const numRegex = new RegExp(`\\b${numStr}(mm|cm|m|inch|in|")?\\b`, 'i');
    if (numRegex.test(name) || numRegex.test(size)) {
      totalScore += 600;
    } else if (combinedText.includes(numStr)) {
      totalScore += 300;
    }
  }

  // 3. Brand & Field Attribute Weighting
  normalizedTokens.forEach((token) => {
    if (name.includes(token)) {
      totalScore += 100;
    }
    if (brand && brand.includes(token)) {
      totalScore += 400; // Strong brand match
    }
    if (subcategory && subcategory.includes(token)) {
      totalScore += 150;
    }
    if (color && color.includes(token)) {
      totalScore += 200;
    }
  });

  return { matches: true, score: totalScore };
}
