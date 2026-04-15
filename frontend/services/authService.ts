import { apiRequest } from '@/lib/api';
import type { AuthUser, LoginPayload, UserRole } from '@/types/auth';

const STORAGE_KEY = 'user';

function normalizeRole(role?: string): UserRole {
  switch (role) {
    case 'admin-humas':
      return 'admin';
    case 'pimpinan':
      return 'pimpinan';
    case 'internal':
      return 'internal';
    case 'external':
      return 'external';
    default:
      return 'user';
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem(STORAGE_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function persistUser(user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const selectedRole = normalizeRole(payload.role);
  const hasApiUrl = Boolean(process.env.NEXT_PUBLIC_API_URL);

  if (hasApiUrl) {
    try {
      const response = await apiRequest<{ user?: Partial<AuthUser>; data?: Partial<AuthUser> }>('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const userData = response.user || response.data;
      if (userData?.email) {
        return {
          id: String(userData.id ?? '1'),
          name: userData.name ?? payload.email.split('@')[0],
          email: userData.email,
          role: normalizeRole(userData.role),
        };
      }
    } catch (error) {
      console.warn('Laravel API login gagal, menggunakan fallback lokal.', error);
    }
  }

  if (payload.email === 'admin@example.com' && payload.password === 'admin123') {
    return {
      id: '1',
      name: 'Admin User',
      email: payload.email,
      role: selectedRole === 'user' ? 'admin' : selectedRole,
    };
  }

  throw new Error('Email atau password salah');
}
