import type { AccountBalance, Transaction, Habit, DailyRoutine, MediaLog } from '../types';
import type { AuthUser, RegistrationInput, UserPassport } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface FinanceSnapshot {
  transactions: Transaction[];
  accounts: AccountBalance[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers
      }
    });
  } catch {
    return null;
  }

  const body: unknown = await response.json().catch(() => null);
  if (body === null) {
    if (!response.ok) return null;
    throw new Error('The local API returned an invalid response.');
  }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error
      : `Local API request failed (${response.status}).`;
    throw new Error(message);
  }
  return body as T;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const api = {
  // Authentication
  register: async (input: RegistrationInput): Promise<AuthUser | null> => {
    const response = await post<{ user: AuthUser }>('/auth/register', input);
    return response?.user ?? null;
  },

  login: async (identifier: string, password: string): Promise<AuthUser | null> => {
    const response = await post<{ user: AuthUser }>('/auth/login', { identifier, password });
    return response?.user ?? null;
  },

  // Passport & Academic Profiles
  getPassport: async (userId: string): Promise<UserPassport | null> => {
    const response = await request<{ passport: UserPassport | null }>(`/passport/${encodeURIComponent(userId)}`);
    if (!response) return null;
    const academicResponse = await request<{ academic: Partial<UserPassport> | null }>(`/academic/${encodeURIComponent(userId)}`);
    return response.passport && academicResponse?.academic
      ? { ...response.passport, ...academicResponse.academic }
      : response.passport;
  },

  savePassport: async (userId: string, passport: UserPassport): Promise<boolean> => {
    const passportResponse = await post<{ saved: boolean }>('/passport/save', { userId, passport });
    const academicResponse = await post<{ saved: boolean }>('/academic/save', { userId, academic: passport });
    return Boolean(passportResponse && academicResponse);
  },

  // Financial Ledger
  getFinance: (userId: string) =>
    request<FinanceSnapshot>(`/finance/${encodeURIComponent(userId)}`),

  saveAccounts: async (userId: string, accounts: AccountBalance[]): Promise<boolean> => {
    const response = await post<{ saved: boolean }>('/finance/bank', { userId, accounts });
    return Boolean(response);
  },

  saveTransaction: async (userId: string, transaction: Transaction): Promise<boolean> => {
    const response = await post<{ saved: boolean }>('/finance/transaction', { userId, transaction });
    return Boolean(response);
  },

  deleteTransaction: async (userId: string, transactionId: string): Promise<boolean> => {
    const response = await request<{ deleted: boolean }>(
      `/finance/transaction/${encodeURIComponent(transactionId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
    return Boolean(response?.deleted);
  },

  // Habits
  getHabits: (userId: string) =>
    request<{ habits: Habit[] }>(`/habits/${encodeURIComponent(userId)}`),

  saveHabit: async (userId: string, habit: Partial<Habit>): Promise<boolean> => {
    const response = await post<{ saved: boolean }>('/habits', { userId, habit });
    return Boolean(response);
  },

  deleteHabit: async (userId: string, habitId: string): Promise<boolean> => {
    const response = await request<{ deleted: boolean }>(
      `/habits/${encodeURIComponent(habitId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
    return Boolean(response?.deleted);
  },

  // Study & Routine Auto-Sync
  syncStudyRoutine: async (userId: string, session: unknown): Promise<{ synced: boolean; routineText: string } | null> => {
    return post<{ synced: boolean; routineText: string }>('/study/sync-routine', { userId, session });
  },

  getRoutines: (userId: string) =>
    request<{ routines: DailyRoutine[] }>(`/routines/${encodeURIComponent(userId)}`),

  // Media Logs
  getLogs: (userId: string) =>
    request<{ logs: MediaLog[] }>(`/logs/${encodeURIComponent(userId)}`),

  saveLog: async (userId: string, log: Partial<MediaLog>): Promise<boolean> => {
    const response = await post<{ saved: boolean }>('/logs', { userId, log });
    return Boolean(response);
  },

  deleteLog: async (userId: string, logId: string): Promise<boolean> => {
    const response = await request<{ deleted: boolean }>(
      `/logs/${encodeURIComponent(logId)}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
    return Boolean(response?.deleted);
  },

  // Currency Rates
  getCurrencyRates: () =>
    request<{ base_currency: string; rates: Record<string, number> }>('/currency/rates')
};

export function reportSyncError(error: unknown, area: string): void {
  if (error instanceof Error) {
    console.error(`Unable to sync ${area} with the local API; browser storage remains available.`, error);
  }
}
