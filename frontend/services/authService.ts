import { apiRequest } from '@/lib/api';
import type { AuthUser, LoginPayload, RegisterPayload, UserRole } from '@/types/auth';

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

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await apiRequest<{ user?: Partial<AuthUser>; data?: Partial<AuthUser> }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const userData = response.user || response.data;
  if (!userData?.email) {
    throw new Error('Registrasi gagal diproses');
  }

  return {
    id: String(userData.id ?? ''),
    name: userData.name ?? payload.name,
    username: userData.username ?? payload.username,
    email: userData.email,
    institution_name: userData.institution_name ?? payload.institution_name,
    phone: userData.phone ?? payload.phone,
    position: userData.position ?? payload.position,
    account_type: userData.account_type ?? payload.account_type,
    approval_status: userData.approval_status as 'active' | 'pending' | 'rejected' | undefined,
    role: normalizeRole(userData.role ?? payload.role ?? 'external'),
  };
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const selectedRole = normalizeRole(payload.role);
  const hasApiUrl = Boolean(process.env.NEXT_PUBLIC_API_URL);
  const apiPayload = {
    ...payload,
    role: selectedRole === 'user' ? payload.role : selectedRole,
  };

  if (hasApiUrl) {
    try {
      const response = await apiRequest<{ user?: Partial<AuthUser>; data?: Partial<AuthUser> }>('/login', {
        method: 'POST',
        body: JSON.stringify(apiPayload),
      });

      const userData = response.user || response.data;
      if (userData?.email) {
        return {
          id: String(userData.id ?? '1'),
          name: userData.name ?? payload.email.split('@')[0],
          username: userData.username,
          email: userData.email,
          institution_name: userData.institution_name,
          phone: userData.phone,
          position: userData.position,
          account_type: userData.account_type,
          approval_status: userData.approval_status as 'active' | 'pending' | 'rejected' | undefined,
          role: normalizeRole(userData.role),
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const isNetworkIssue = /fetch|network|failed to fetch|load failed/i.test(message);

      if (!isNetworkIssue) {
        throw error;
      }

      console.warn('Laravel API login gagal, menggunakan fallback lokal.', error);
    }
  }

  const demoAccounts: Record<string, AuthUser> = {
    'admin@polibatam.ac.id': {
      id: '1',
      name: 'Admin Sikerma',
      username: 'admin.sikerma',
      email: 'admin@polibatam.ac.id',
      approval_status: 'active',
      role: 'admin',
    },
    'pimpinan@polibatam.ac.id': {
      id: '2',
      name: 'Pimpinan Polibatam',
      username: 'pimpinan.polibatam',
      email: 'pimpinan@polibatam.ac.id',
      approval_status: 'active',
      role: 'pimpinan',
    },
    'internal@polibatam.ac.id': {
      id: '3',
      name: 'User Internal',
      username: 'internal.polibatam',
      email: 'internal@polibatam.ac.id',
      approval_status: 'active',
      role: 'internal',
    },
    'external@mitra.com': {
      id: '4',
      name: 'Mitra Eksternal',
      username: 'mitra.eksternal',
      email: 'external@mitra.com',
      approval_status: 'active',
      role: 'external',
    },
  };

  const matchedDemoUser = demoAccounts[payload.email.toLowerCase()];
  if (matchedDemoUser && payload.password === 'Sikerma#2026') {
    if (selectedRole !== 'user' && matchedDemoUser.role !== selectedRole) {
      throw new Error('Role yang dipilih tidak sesuai dengan akun ini');
    }

    return matchedDemoUser;
  }

  throw new Error('Email atau password salah');
}
