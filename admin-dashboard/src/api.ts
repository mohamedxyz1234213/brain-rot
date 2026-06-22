import type {
  AdminChallenge,
  AdminManualRoast,
  AdminPayload,
  AdminSession,
  ChallengeInput,
  ManualRoastInput,
  SubscriptionUpdateInput,
  UserUpdateInput,
} from './types';

const API_URL = import.meta.env.VITE_ADMIN_API_URL;
const STORAGE_KEY = 'brainrot_admin_session';

let sessionToken = loadStoredSession()?.token || '';

function requireApiUrl() {
  if (!API_URL) {
    throw new Error('Admin API URL is not configured. Set VITE_ADMIN_API_URL for this deployment.');
  }
  return API_URL;
}

function loadStoredSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AdminSession) {
  sessionToken = session.token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession() {
  return loadStoredSession();
}

export function clearStoredSession() {
  sessionToken = '';
  localStorage.removeItem(STORAGE_KEY);
}

const headers = () => ({
  'Content-Type': 'application/json',
  ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
});

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${requireApiUrl()}${path}`, {
    ...options,
    headers: { ...headers(), ...options?.headers },
  });

  if (response.status === 401 || response.status === 403) {
    clearStoredSession();
    throw new Error('Your admin session is no longer authorized. Sign in again.');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body || response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const session = await request<AdminSession>('/admin/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(session);
  return session;
}

export async function fetchAdminPayload(): Promise<AdminPayload> {
  return request<AdminPayload>('/admin/dashboard');
}

export async function updateUser(userId: string, data: UserUpdateInput) {
  return request('/admin/users/' + encodeURIComponent(userId), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(userId: string) {
  return request('/admin/users/' + encodeURIComponent(userId), { method: 'DELETE' });
}

export async function updateSubscription(userId: string, data: SubscriptionUpdateInput) {
  return request('/admin/subscriptions/' + encodeURIComponent(userId), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function createChallenge(data: ChallengeInput) {
  return request<AdminChallenge>('/admin/challenges', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateChallenge(id: string, data: Partial<ChallengeInput>) {
  return request<AdminChallenge>('/admin/challenges/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteChallenge(id: string) {
  return request('/admin/challenges/' + encodeURIComponent(id), { method: 'DELETE' });
}

export async function createManualRoast(data: ManualRoastInput) {
  return request<AdminManualRoast>('/admin/roasts', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateManualRoast(id: string, data: Partial<ManualRoastInput>) {
  return request<AdminManualRoast>('/admin/roasts/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteManualRoast(id: string) {
  return request('/admin/roasts/' + encodeURIComponent(id), { method: 'DELETE' });
}
