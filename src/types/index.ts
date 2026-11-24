export interface User {
  username: string;
  displayName: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ActiveSession {
  username: string;
  displayName: string;
  role: string;
  loginTime: string;
}

export type CountrySelection = 'United States' | 'Bangladesh';
export type AccountKind = 'Bank' | 'MobileBanking' | 'Cash' | 'Vault';
export type TransactionType = 'expense' | 'income' | 'deposit' | 'transfer';
export type CurrencyCode = 'BDT' | 'USD';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  amountUSD: number;
  platform: string;
  bankName?: string;
  accountNumber?: string;
  recipient?: string;
  sender?: string;
  recipientBank?: string;
  transferDestination?: 'myAccount' | 'anotherAccount';
  fromAccount?: string;
  toAccount?: string;
  category: string;
  purpose: string;
  receiptImage?: string | null;
  fileName?: string;
  createdAt: string;
}

export interface AccountBalance {
  id: string;
  name: string;
  type: AccountKind;
  accountNumber: string;
  balanceBDT: number;
  balanceUSD: number;
}

export interface HSCChapter {
  id: number;
  number: number;
  titleEnglish: string;
  completed: boolean;
  notes?: string;
}

export interface HSCBook {
  id: string;
  nameEnglish: string;
  subject: string;
  paper: 1 | 2;
  chapters: HSCChapter[];
  color: string;
}

export interface StudySession {
  id: string;
  date: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  chapterTitle: string;
  durationHours: number;
  notes: string;
  timestamp: string;
}

export interface DailyRoutine {
  id: string;
  date: string;
  dailySchedule: string;
  sleep: number;
  study: number;
  book: string;
  chapterNotes: string;
  books: string;
  gym: number;
  prayer: number;
  sports: number;
  work: number;
  dietLog: string;
  goodDeeds: string;
  learned: string;
  savedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  timeSchedule: string;
  streak: number;
  completedDates: string[];
  attachType: 'file' | 'link' | 'note';
  attachFileName: string;
  attachFileData: string | null;
  createdAt: string;
}

export interface HabitStack {
  id: string;
  current: string;
  newHabit: string;
}

export interface MediaLog {
  id: string;
  type: 'voice' | 'video';
  topic: string;
  language: string;
  timestamp: string;
  rating: number; // 1-5
  notes: string;
  mediaUrl: string; // Base64, Object URL, or IndexedDB reference
  durationSeconds: number;
}

// ============================================================================
// 1. PERSONAL GOALS ENGINE
// ============================================================================
export type GoalTimeframe = 'daily' | 'weekly' | 'long_term';
export type GoalStatus = 'pending' | 'in_progress' | 'completed';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: GoalTimeframe;
  targetDate: string;
  progress: number; // 0 to 100
  status: GoalStatus;
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// 2. NOTIFICATIONS & REMINDERS
// ============================================================================
export type NotificationType = 'habit' | 'goal' | 'task' | 'activity' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

export interface NotificationSettings {
  habitReminders: boolean;
  goalReminders: boolean;
  dailyTaskReminders: boolean;
  activityAlerts: boolean;
  soundEnabled: boolean;
  reminderTime: string; // e.g. "08:00 AM"
}

// ============================================================================
// 3. PERSONAL DEVELOPMENT & COMMUNICATION TIPS
// ============================================================================
export type TipCategory = 'all' | 'productivity' | 'speaking' | 'mindset' | 'habits' | 'wellness';

export interface TipItem {
  id: string;
  title: string;
  category: TipCategory;
  insight: string;
  actionableStep: string;
  readTime: string;
  author: string;
  isFavorite?: boolean;
}

