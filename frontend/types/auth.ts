'use client';

export type UserRole = 'admin' | 'user' | 'pimpinan' | 'internal' | 'external';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: string;
}
