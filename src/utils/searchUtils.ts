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
  [key: string]: any;
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

  // Short tokens (<= 3 chars) require exact match or substring
  if (token.length <= 3) return false;

  // For longer words, check against candidate words
  const candidateWords = candidate.split(/\s+/).filter(Boolean);
  const maxDistance = token.length > 7 ? 2 : 1;

  for (const word of candidateWords) {
    if (word.length <= 2) continue;
    // Length difference check
    if (Math.abs(word.length - token.length) > maxDistance) continue;

    const dist = levenshteinDistance(token, word);
    if (dist <= maxDistance) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if query tokens exist (exact or fuzzy/typo match) in the product text fields and returns a relevance score.
 */
export function matchAndScoreProduct<T extends SearchableProduct>(
  product: T,
  searchQuery: string
): { matches: boolean; score: number } {
  const query = (searchQuery || '').trim().toLowerCase();
  if (!query) {
    return { matches: true, score: 0 };
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { matches: true, score: 0 };
  }

  const name = (product.name || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  const barcode = (product.barcode || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const subcategory = (product.subcategory || product.subCategory || '').toLowerCase();
  const brand = (product.brand || product.brandName || '').toLowerCase();

  const combinedText = `${name} ${sku} ${barcode} ${brand} ${category} ${subcategory}`;

  // Check if EVERY token is present either exactly or fuzzy/typo matched
  let totalScore = 0;
  let exactMatchCount = 0;
  let fuzzyMatchCount = 0;

  for (const token of tokens) {
    if (combinedText.includes(token)) {
      exactMatchCount++;
      totalScore += 50;
    } else if (isFuzzyTokenMatch(token, combinedText)) {
      fuzzyMatchCount++;
      totalScore += 20; // Lower bonus for fuzzy/typo match
    } else {
      // Token failed both exact and fuzzy match
      return { matches: false, score: 0 };
    }
  }

  // 2. Compute Relevance Score
  if (name === query) {
    totalScore += 1000;
  } else if (name.startsWith(query)) {
    totalScore += 500;
  } else if (name.includes(query)) {
    totalScore += 300;
  }

  if (sku === query || barcode === query) {
    totalScore += 800;
  } else if (sku.includes(query) || barcode.includes(query)) {
    totalScore += 400;
  }

  tokens.forEach(token => {
    if (name.startsWith(token)) {
      totalScore += 100;
    } else if (name.includes(token)) {
      totalScore += 50;
    }
    if (brand.includes(token)) {
      totalScore += 30;
    }
    if (subcategory.includes(token)) {
      totalScore += 20;
    }
  });

  return { matches: true, score: totalScore };
}
