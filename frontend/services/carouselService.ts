import { apiRequest, API_BASE_URL } from '@/lib/api';

export type CarouselImageItem = {
  id: number;
  title: string | null;
  image_path: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

type CarouselListResponse = {
  data: CarouselImageItem[];
  max_images: number;
};

type CarouselStoreResponse = {
  message: string;
  data: CarouselImageItem;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function buildApiBaseUrlCandidates(): string[] {
  const configured = normalizeBaseUrl(API_BASE_URL);
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

const API_BASE_URL_CANDIDATES = buildApiBaseUrlCandidates();

export async function getCarouselImages(): Promise<CarouselImageItem[]> {
  const response = await apiRequest<CarouselListResponse>('/carousel-images');
  return response.data.slice(0, response.max_images || 7);
}

export async function uploadCarouselImage(payload: { file: File; title?: string; sortOrder?: number }): Promise<CarouselImageItem> {
  const formData = new FormData();
  formData.append('image', payload.file);

  if (payload.title) {
    formData.append('title', payload.title);
  }

  if (typeof payload.sortOrder === 'number') {
    formData.append('sort_order', String(payload.sortOrder));
  }

  let response: Response | null = null;
  let lastError: unknown = null;

  for (const baseUrl of API_BASE_URL_CANDIDATES) {
    try {
      response = await fetch(`${baseUrl}/admin/carousel-images`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });
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
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

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
        : 'Upload gambar carousel gagal.');

    throw new Error(message);
  }

  return (body as CarouselStoreResponse).data;
}

export async function updateCarouselSortOrder(id: number, sortOrder: number): Promise<void> {
  await apiRequest(`/admin/carousel-images/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ sort_order: sortOrder }),
  });
}

export async function deleteCarouselImage(id: number): Promise<void> {
  await apiRequest(`/admin/carousel-images/${id}`, {
    method: 'DELETE',
  });
}
