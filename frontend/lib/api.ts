const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api/backend';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function buildApiBaseUrlCandidates(): string[] {
  const configured = normalizeBaseUrl(rawApiBaseUrl);
  const candidates = [
    configured,
    configured.startsWith('/')
      ? configured
      : configured.endsWith('/api')
        ? configured
        : `${configured}/api`,
    'http://127.0.0.1:8000/api',
    'http://localhost:8000/api',
  ];

  return Array.from(new Set(candidates.map(normalizeBaseUrl)));
}

const API_BASE_URL = normalizeBaseUrl(rawApiBaseUrl);
const API_BASE_URL_CANDIDATES = buildApiBaseUrlCandidates();

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let response: Response | null = null;
  let lastError: unknown = null;

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      const candidateResponse = await fetch(`${baseUrl}${normalizedEndpoint}`, {
        ...options,
        headers: {
            Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      // Jika kandidat relative proxy gagal (404/5xx),
      // coba kandidat berikutnya seperti URL backend langsung.
      const isRelativeCandidate = baseUrl.startsWith('/');
      const shouldFallbackToNextCandidate =
        !candidateResponse.ok &&
        isRelativeCandidate &&
        (candidateResponse.status === 404 || candidateResponse.status >= 500);

      if (shouldFallbackToNextCandidate) {
        response = candidateResponse;
        continue;
      }

      response = candidateResponse;
      break;
    } catch (error) {
      lastError = error;

      if (!(error instanceof TypeError)) {
        throw error;
      }
    }
  }

  if (!response) {
    if (lastError instanceof TypeError) {
      throw new Error('Gagal terhubung ke server API. Pastikan backend aktif dan URL API benar.');
    }

    throw lastError;
  }

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const validationMessage =
      typeof body === 'object' && body !== null && 'errors' in body && body.errors
        ? Object.values(body.errors as Record<string, string[]>)
            .flat()
            .find(Boolean)
        : undefined;

    const message =
      validationMessage ||
      (typeof body === 'object' && body !== null && 'message' in body
        ? String(body.message)
        : 'Request gagal diproses');

    throw new Error(String(message));
  }

  return body as T;
}

export { API_BASE_URL };
