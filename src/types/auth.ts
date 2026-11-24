import type { CountrySelection, User } from './index';

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserPassport {
  avatar: string | null;
  location: string;
  age: number | null;
  heightCm: number | null;
  bankBalances: string;
  hscTargets: string;
  fitnessRoutine: string;
  academicCountry: CountrySelection;
  academicLevel: 'JSC' | 'SSC' | 'HSC' | '';
  academicGroup: 'Science' | 'Arts' | 'Commerce' | '';
  academicSubjects: string[];
  customFields: Array<{ id: string; label: string; value: string }>;
  isComplete: boolean;
}

export interface AuthUser extends User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface StoredAccount {
  user: AuthUser;
  passwordSalt: string;
  passwordHash: string;
  credentialAlgorithm?: 'pbkdf2-sha256' | 'sha256-fallback';
  passport: UserPassport;
}

export const EMPTY_USER_PASSPORT: UserPassport = {
  avatar: null,
  location: '',
  age: null,
  heightCm: null,
  bankBalances: '',
  hscTargets: '',
  fitnessRoutine: '',
  academicCountry: 'United States',
  academicLevel: '',
  academicGroup: '',
  academicSubjects: [],
  customFields: [],
  isComplete: false
};
