import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser, RegistrationInput, StoredAccount, UserPassport } from '../types/auth';
import { EMPTY_USER_PASSPORT } from '../types/auth';
import { api, reportSyncError } from '../services/api';

const USERS_STORAGE_KEY = 'maksudul_auth_users_v1';
const SESSION_STORAGE_KEY = 'maksudul_auth_session_v1';
const USER_ID_TAKEN_MESSAGE = 'This User ID is already taken. Please choose another.';

interface AuthContextValue {
  user: AuthUser | null;
  passport: UserPassport | null;
  isLoading: boolean;
  checkUserIdAvailability: (username: string) => boolean;
  signUp: (input: RegistrationInput) => Promise<void>;
  logIn: (identifier: string, password: string) => Promise<void>;
  logOut: () => void;
  updateUser: (updatedUser: AuthUser) => void;
  updatePassport: (updatedPassport: UserPassport) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readAccounts = (): StoredAccount[] => {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Stored account data is invalid. Clear the local account records and try again.');
  }
  return (parsed as StoredAccount[]).map(account => ({
    ...account,
    passport: {
      ...EMPTY_USER_PASSPORT,
      ...account.passport,
      academicSubjects: Array.isArray(account.passport?.academicSubjects) ? account.passport.academicSubjects : [],
      customFields: Array.isArray(account.passport?.customFields) ? account.passport.customFields : []
    }
  }));
};

const writeAccounts = (accounts: StoredAccount[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();
const canonicalUsername = (username: string) => `@${normalizeUsername(username).replace(/^@+/, '')}`;
const usernameKey = (username: string) => normalizeUsername(username).replace(/^@+/, '');

const hasLegacyUserRecord = (username: string): boolean => {
  const raw = localStorage.getItem('app_user_v2');
  if (!raw) return false;
  try {
    const legacyUser: { username?: unknown } = JSON.parse(raw);
    return typeof legacyUser.username === 'string'
      && usernameKey(legacyUser.username) === usernameKey(username);
  } catch {
    throw new Error('The existing local user record is invalid and could not be checked.');
  }
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

const sha256 = (input: Uint8Array): Uint8Array => {
  const constants = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  const bitLength = input.length * 8;
  const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(input);
  padded[input.length] = 0x80;
  const dataView = new DataView(padded.buffer);
  dataView.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  dataView.setUint32(paddedLength - 4, bitLength >>> 0);

  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]);
  const schedule = new Uint32Array(64);
  const rotateRight = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits));

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      schedule[index] = dataView.getUint32(offset + index * 4);
    }
    for (let index = 16; index < 64; index += 1) {
      const x = schedule[index - 15];
      const y = schedule[index - 2];
      const sigma0 = rotateRight(x, 7) ^ rotateRight(x, 18) ^ (x >>> 3);
      const sigma1 = rotateRight(y, 17) ^ rotateRight(y, 19) ^ (y >>> 10);
      schedule[index] = (schedule[index - 16] + sigma0 + schedule[index - 7] + sigma1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = state;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choice + constants[index] + schedule[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) >>> 0;
      [h, g, f, e, d, c, b, a] = [g, f, e, (d + temp1) >>> 0, c, b, a, (temp1 + temp2) >>> 0];
    }
    state[0] = (state[0] + a) >>> 0;
    state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0;
    state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0;
    state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0;
    state[7] = (state[7] + h) >>> 0;
  }

  const digest = new Uint8Array(32);
  const digestView = new DataView(digest.buffer);
  state.forEach((value, index) => digestView.setUint32(index * 4, value));
  return digest;
};

const createSalt = (): Uint8Array => {
  const salt = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(salt);
  for (let index = 0; index < salt.length; index += 1) salt[index] = Math.floor(Math.random() * 256);
  return salt;
};

const hashPassword = async (password: string, salt?: Uint8Array, algorithm?: StoredAccount['credentialAlgorithm']) => {
  const passwordSalt = salt ?? createSalt();
  if (!globalThis.crypto?.subtle || algorithm === 'sha256-fallback') {
    const saltedPassword = new TextEncoder().encode(`${toHex(passwordSalt)}:${password}`);
    return { salt: toHex(passwordSalt), hash: toHex(sha256(saltedPassword)), algorithm: 'sha256-fallback' as const };
  }

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await globalThis.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: new Uint8Array(passwordSalt).buffer,
    iterations: 310_000,
    hash: 'SHA-256'
  }, keyMaterial, 256);

  return { salt: toHex(passwordSalt), hash: toHex(new Uint8Array(bits)), algorithm: 'pbkdf2-sha256' as const };
};

const fromHex = (value: string): Uint8Array => {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw new Error('Stored account credentials are invalid.');
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const sessionUser = (): { user: AuthUser | null; passport: UserPassport | null } => {
  const username = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!username) return { user: null, passport: null };
  const account = readAccounts().find(item => usernameKey(item.user.username) === usernameKey(username));
  if (!account) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return { user: null, passport: null };
  }
  return { user: account.user, passport: account.passport };
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [initialSession] = useState(sessionUser);
  const [user, setUser] = useState<AuthUser | null>(initialSession.user);
  const [passport, setPassport] = useState<UserPassport | null>(initialSession.passport);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void api.getPassport(user.username).then(remotePassport => {
      if (!active || !remotePassport) return;
      const mergedPassport = { ...EMPTY_USER_PASSPORT, ...remotePassport };
      const accounts = readAccounts();
      const updatedAccounts = accounts.map(account => account.user.username === user.username
        ? { ...account, passport: mergedPassport, user: { ...account.user, avatar: mergedPassport.avatar } }
        : account);
      writeAccounts(updatedAccounts);
      setPassport(mergedPassport);
      const activeAccount = updatedAccounts.find(account => account.user.username === user.username);
      if (activeAccount) setUser(activeAccount.user);
    }).catch(error => reportSyncError(error, 'passport data'));
    return () => {
      active = false;
    };
  }, [user?.username]);

  const checkUserIdAvailability = useCallback((username: string) => {
    const normalized = usernameKey(username);
    if (!normalized) return false;
    return !readAccounts().some(account => usernameKey(account.user.username) === normalized)
      && !hasLegacyUserRecord(canonicalUsername(normalized));
  }, []);

  const signUp = useCallback(async (input: RegistrationInput) => {
    const username = canonicalUsername(input.username);
    const normalizedUsername = usernameKey(username);
    const email = input.email.trim().toLowerCase();
    const accounts = readAccounts();

    if (!checkUserIdAvailability(normalizedUsername)) throw new Error(USER_ID_TAKEN_MESSAGE);
    if (accounts.some(account => account.user.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }

    const remoteUser = await api.register({ ...input, username });
    const credentials = await hashPassword(input.password);
    const latestAccounts = readAccounts();
    if (!checkUserIdAvailability(normalizedUsername)
      || latestAccounts.some(account => usernameKey(account.user.username) === normalizedUsername)) {
      throw new Error(USER_ID_TAKEN_MESSAGE);
    }
    if (latestAccounts.some(account => account.user.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }
    const firstName = input.firstName.trim().charAt(0).toUpperCase()
      + input.firstName.trim().slice(1);
    const user: AuthUser = {
      ...remoteUser,
      username,
      firstName,
      lastName: input.lastName.trim(),
      displayName: [firstName, input.lastName.trim()].filter(Boolean).join(' '),
      email,
      phone: input.phone.trim(),
      avatar: null,
      role: 'Member',
      createdAt: new Date().toISOString()
    };
    const account: StoredAccount = {
      user,
      passwordSalt: credentials.salt,
      passwordHash: credentials.hash,
      credentialAlgorithm: credentials.algorithm,
      passport: { ...EMPTY_USER_PASSPORT }
    };

    writeAccounts([...latestAccounts, account]);
    localStorage.setItem(SESSION_STORAGE_KEY, username);
    setUser(user);
    setPassport(account.passport);
  }, [checkUserIdAvailability]);

  const logIn = useCallback(async (identifier: string, password: string) => {
    const normalizedIdentifier = usernameKey(identifier);
    const account = readAccounts().find(item =>
      usernameKey(item.user.username) === normalizedIdentifier
      || item.user.email.toLowerCase() === identifier.trim().toLowerCase()
    );
    if (account) {
      const supplied = await hashPassword(password, fromHex(account.passwordSalt), account.credentialAlgorithm);
      if (supplied.hash === account.passwordHash) {
        localStorage.setItem(SESSION_STORAGE_KEY, account.user.username);
        setUser(account.user);
        setPassport(account.passport);
        return;
      }
    }

    const remoteUser = await api.login(identifier, password);
    if (!remoteUser) throw new Error('User ID or email and password do not match.');

    const credentials = await hashPassword(password);
    const remotePassport = await api.getPassport(remoteUser.username);
    const accountPassport = { ...EMPTY_USER_PASSPORT, ...(remotePassport ?? {}) };
    const storedAccount: StoredAccount = {
      user: remoteUser,
      passwordSalt: credentials.salt,
      passwordHash: credentials.hash,
      credentialAlgorithm: credentials.algorithm,
      passport: accountPassport
    };
    const accounts = readAccounts().filter(item => usernameKey(item.user.username) !== usernameKey(remoteUser.username));
    writeAccounts([...accounts, storedAccount]);
    localStorage.setItem(SESSION_STORAGE_KEY, remoteUser.username);
    setUser(remoteUser);
    setPassport(accountPassport);
  }, []);

  const logOut = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setPassport(null);
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    const accounts = readAccounts();
    const currentAccount = accounts.find(account => account.user.username === user?.username);
    if (!currentAccount) throw new Error('The active account could not be found.');
    const updatedAccounts = accounts.map(account => account.user.username === user?.username
      ? { ...account, user: updatedUser, passport: { ...account.passport, avatar: updatedUser.avatar } }
      : account);
    writeAccounts(updatedAccounts);
    setUser(updatedUser);
    const activeAccount = updatedAccounts.find(account => account.user.username === updatedUser.username);
    if (activeAccount) setPassport(activeAccount.passport);
  }, [user]);

  const updatePassport = useCallback((updatedPassport: UserPassport) => {
    if (!user) throw new Error('The active account could not be found.');
    const accounts = readAccounts();
    const currentAccount = accounts.find(account => account.user.username === user.username);
    if (!currentAccount) throw new Error('The active account could not be found.');
    const completePassport = { ...updatedPassport, isComplete: true };
    const updatedAccounts = accounts.map(account => account.user.username === user.username
      ? {
          ...account,
          passport: completePassport,
          user: { ...account.user, avatar: completePassport.avatar }
        }
      : account);
    writeAccounts(updatedAccounts);
    const activeAccount = updatedAccounts.find(account => account.user.username === user.username);
    if (activeAccount) setUser(activeAccount.user);
    setPassport(completePassport);
    void api.savePassport(user.username, completePassport).catch(error => reportSyncError(error, 'passport data'));
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    passport,
    isLoading: false,
    checkUserIdAvailability,
    signUp,
    logIn,
    logOut,
    updateUser,
    updatePassport
  }), [user, passport, checkUserIdAvailability, signUp, logIn, logOut, updateUser, updatePassport]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
};
