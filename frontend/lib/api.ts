const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestUrl = `${API_BASE_URL}${normalizedEndpoint}`;

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Gagal terhubung ke server API. Pastikan backend aktif dan URL API benar.');
    }

    throw error;
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
