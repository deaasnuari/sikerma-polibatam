import { apiRequest } from '@/lib/api';

export interface MasterRuangLingkup {
  id: number;
  nama_ruang_lingkup: string;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface MasterRuangLingkupPayload {
  nama_ruang_lingkup: string;
  aktif?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function getMasterRuangLingkup(filters?: {
  aktif?: boolean;
  search?: string;
}): Promise<MasterRuangLingkup[]> {
  const params = new URLSearchParams();

  if (filters?.aktif !== undefined) params.append('aktif', String(filters.aktif));
  if (filters?.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = queryString ? `/master/ruang-lingkup?${queryString}` : '/master/ruang-lingkup';

  const response = await apiRequest<ApiResponse<MasterRuangLingkup[]>>(url);
  return response.data || [];
}

export async function createMasterRuangLingkup(payload: MasterRuangLingkupPayload): Promise<MasterRuangLingkup> {
  const response = await apiRequest<ApiResponse<MasterRuangLingkup>>('/master/ruang-lingkup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.data) {
    throw new Error('Gagal membuat master ruang lingkup');
  }

  return response.data;
}

export async function updateMasterRuangLingkup(id: number, payload: Partial<MasterRuangLingkupPayload>): Promise<MasterRuangLingkup> {
  const response = await apiRequest<ApiResponse<MasterRuangLingkup>>(`/master/ruang-lingkup/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!response.data) {
    throw new Error('Gagal mengubah master ruang lingkup');
  }

  return response.data;
}

export async function deleteMasterRuangLingkup(id: number): Promise<boolean> {
  const response = await apiRequest<ApiResponse<null>>(`/master/ruang-lingkup/${id}`, {
    method: 'DELETE',
  });

  if (response.success !== true) {
    throw new Error(response.message || 'Gagal menghapus master ruang lingkup');
  }

  return true;
}
