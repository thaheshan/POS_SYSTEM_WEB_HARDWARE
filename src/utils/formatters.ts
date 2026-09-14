export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // If already absolute URL or data/blob URI, return as-is
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:')
  ) {
    return cleanUrl;
  }

  // Retrieve backend API base URL or fallback to localhost:8080
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  let backendOrigin = 'http://localhost:8080';
  try {
    const parsed = new URL(apiBase);
    backendOrigin = parsed.origin;
  } catch {
    /* fallback to http://localhost:8080 */
  }

  const relativePath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${backendOrigin}${relativePath}`;
};
