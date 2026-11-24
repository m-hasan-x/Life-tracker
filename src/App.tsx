import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  BookOpen, 
  Receipt, 
  Clock, 
  Film, 
  Timer, 
  User as UserIcon, 
  Plus, 
  ArrowRightLeft, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Coins, 
  Download, 
  Flame, 
  Calendar, 
  Layers, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  DollarSign,
  Target,
  Bell,
  Lightbulb,
  BarChart3
} from 'lucide-react';

import { 
  Transaction, 
  AccountBalance, 
  CountrySelection, 
  StudySession, 
  DailyRoutine, 
  Habit, 
  HabitStack, 
  MediaLog,
  Goal,
  NotificationItem,
  NotificationSettings,
  TipItem
} from './types';

import { FinanceModal } from './components/FinanceModal';
import { FinanceLedger } from './components/FinanceLedger';
import { StudyAndPlan } from './components/StudyAndPlan';
import { HabitTracker } from './components/HabitTracker';
import { MediaStudio } from './components/MediaStudio';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { UserPassport } from './components/UserPassport';
import { TipsSection } from './components/TipsSection';
import { NotificationsSection } from './components/NotificationsSection';
import { HistoryAnalytics } from './components/HistoryAnalytics';
import { GoalsSection } from './components/GoalsSection';
import { ExpenseTrackerSection } from './components/ExpenseTrackerSection';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { AuthUser } from './types/auth';
import { api, reportSyncError } from './services/api';

const EnterpriseApp: React.FC<{ user: AuthUser }> = ({ user }) => {
  const { passport, updatePassport, updateUser, logOut } = useAuth();
  const getStorageKey = (key: string) => `app_${user.username}_${key.replace(/^app_/, '')}`;
  const readUserStorage = (key: string) => localStorage.getItem(getStorageKey(key));
  const writeUserStorage = (key: string, value: string) => localStorage.setItem(getStorageKey(key), value);

  // Navigation across all 9 unified productivity workspaces
  const [activeTab, setActiveTab] = useState<
    'habits' | 'goals' | 'analytics' | 'tips' | 'notifications' | 'media' | 'finance' | 'study' | 'routines'
  >('habits');
  
  // User Profile
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(() => passport?.isComplete === false);

  // Exchange rate & Currency Engine
  const exchangeRate = 120; // 1 USD = 120 BDT

  // Accounts & Finances
  const [accounts, setAccounts] = useState<AccountBalance[]>(() => {
    const saved = readUserStorage('app_accounts_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = readUserStorage('app_transactions_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeFilter, setFinanceFilter] = useState<'ALL' | 'expense' | 'income' | 'deposit' | 'transfer'>('ALL');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [financialCountry, setFinancialCountry] = useState<CountrySelection>(() => (
    readUserStorage('app_financial_country_v1') === 'Bangladesh' ? 'Bangladesh' : 'United States'
  ));
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = readUserStorage('app_financial_categories_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const financeState = useRef({ accounts, transactions });
  financeState.current = { accounts, transactions };

  // 6 Core Sample Habits (Personal Development System)
  const initialSampleHabits: Habit[] = [
    {
      id: 'hab_sample_1',
      name: 'Daily Book Reading (30 Mins)',
      category: 'cat_mind',
      frequency: 'daily',
      timeSchedule: '07:30 AM - 08:00 AM',
      streak: 5,
      completedDates: [new Date().toISOString().split('T')[0]],
      attachType: 'note',
      attachFileName: 'Atomic Habits Notes',
      attachFileData: '1% improvement daily compounds exponentially over a year.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'hab_sample_2',
      name: 'Physical Workout & Exercise (45 Mins)',
      category: 'cat_health',
      frequency: 'daily',
      timeSchedule: '05:00 PM - 05:45 PM',
      streak: 4,
      completedDates: [new Date().toISOString().split('T')[0]],
      attachType: 'note',
      attachFileName: 'Strength Routine',
      attachFileData: 'Push-ups, core conditioning, calisthenics, and 3L hydration.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'hab_sample_3',
      name: 'Learning a New Skill (Web Architecture & TypeScript)',
      category: 'cat_learning',
      frequency: 'daily',
      timeSchedule: '08:30 PM - 09:30 PM',
      streak: 6,
      completedDates: [new Date().toISOString().split('T')[0]],
      attachType: 'link',
      attachFileName: 'System Documentation',
      attachFileData: 'https://react.dev',
      createdAt: new Date().toISOString()
    },
    {
      id: 'hab_sample_4',
      name: 'Speaking Practice & Presentation Rehearsal',
      category: 'cat_growth',
      frequency: 'daily',
      timeSchedule: '09:45 PM - 10:15 PM',
      streak: 3,
      completedDates: [new Date().toISOString().split('T')[0]],
      attachType: 'note',
      attachFileName: 'Vocal Modulation',
      attachFileData: 'Maintain steady pace, articulate consonants, and rehearse on camera in Media Studio.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'hab_sample_5',
      name: 'Productivity Deep Work Session (2 Hours)',
      category: 'cat_work',
      frequency: 'daily',
      timeSchedule: '09:00 AM - 11:00 AM',
      streak: 7,
      completedDates: [new Date().toISOString().split('T')[0]],
      attachType: 'note',
      attachFileName: 'Deep Work Flow',
      attachFileData: 'Zero-distraction sprint with phone in Do-Not-Disturb mode.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'hab_sample_6',
      name: 'Daily Reflection & Evening Journaling',
      category: 'cat_mind',
      frequency: 'daily',
      timeSchedule: '10:30 PM - 10:50 PM',
      streak: 8,
      completedDates: [new Date().toISOString().split('T')[0]],
      attachType: 'note',
      attachFileName: 'Day In Review',
      attachFileData: 'Reflect on 3 daily wins, 1 lesson learned, and target plan for tomorrow.',
      createdAt: new Date().toISOString()
    }
  ];

  // Habits State (preserves any existing user habits if already saved)
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = readUserStorage('app_habits_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved habits:', e);
      }
    }
    return initialSampleHabits;
  });

  // Goals State
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = readUserStorage('app_goals_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved goals:', e);
      }
    }
    return [
      {
        id: 'goal_init_1',
        title: 'Master HSC Physics Dynamics & Calculus Problem Sets',
        description: 'Complete 50 Board Creative Questions and achieve 100% conceptual mastery.',
        timeframe: 'daily',
        progress: 65,
        targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        status: 'active',
        category: 'Academic',
        createdAt: new Date().toISOString()
      },
      {
        id: 'goal_init_2',
        title: 'Record 3 Camera Speaking Practice Rehearsals',
        description: 'Conduct video speech recordings in Media Studio to refine vocal clarity and pacing.',
        timeframe: 'weekly',
        progress: 40,
        targetDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        status: 'active',
        category: 'Communication',
        createdAt: new Date().toISOString()
      },
      {
        id: 'goal_init_3',
        title: 'Secure Golden A+ (GPA 5.0) in HSC Board Examination',
        description: 'Consistent top-tier academic score across Physics, Chemistry, and Higher Mathematics.',
        timeframe: 'long-term',
        progress: 55,
        targetDate: '2027-06-30',
        status: 'active',
        category: 'Milestone',
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = readUserStorage('app_notifications_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Failed to parse saved notifications:', e);
      }
    }
    return [
      {
        id: 'notif_init_1',
        title: 'Speaking Practice Reminder',
        message: 'Open MacBook Media Studio to practice your 5-minute English presentation.',
        type: 'activity',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        actionTab: 'media'
      },
      {
        id: 'notif_init_2',
        title: 'HSC Study Session Goal',
        message: 'Calculus Differentiation chapter session logged: keep up the momentum!',
        type: 'study',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        read: false,
        actionTab: 'study'
      },
      {
        id: 'notif_init_3',
        title: 'Daily Evening Reflection',
        message: 'Remember to complete your daily routine timeline before concluding the night.',
        type: 'habit',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        read: true,
        actionTab: 'routines'
      }
    ];
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = readUserStorage('app_notif_settings_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved notification settings:', e);
      }
    }
    return {
      habitReminders: true,
      goalDeadlines: true,
      dailyTasks: true,
      activityUpdates: true,
      soundEnabled: true,
      reminderTime: '21:00'
    };
  });

  // Custom Tips State
  const [customTips, setCustomTips] = useState<TipItem[]>(() => {
    const saved = readUserStorage('app_custom_tips_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [habitStacks, setHabitStacks] = useState<HabitStack[]>(() => {
    const saved = readUserStorage('app_habit_stacks_v2');
    return saved ? JSON.parse(saved) : [
      { id: 'stk_1', current: 'Morning Espresso', newHabit: 'Review 10 Physics formula flashcards' }
    ];
  });

  // Study & Plan State
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = readUserStorage('app_study_sessions_v2');
    return saved ? JSON.parse(saved) : [
      {
        id: 'std_init_1',
        date: new Date().toISOString().split('T')[0],
        bookId: 'math_1',
        bookName: 'Higher Mathematics Paper 1',
        chapterNumber: 9,
        chapterTitle: 'Differentiation (Calculus)',
        durationHours: 2.5,
        notes: 'Mastered chain rule and tangent slopes for HSC board exams',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Daily Routines State
  const [routines, setRoutines] = useState<DailyRoutine[]>(() => {
    const saved = readUserStorage('app_routines_v2');
    return saved ? JSON.parse(saved) : [
      {
        id: 'rtn_1',
        date: new Date().toISOString().split('T')[0],
        dailySchedule: '07:00 Meditation, 08:00 Code Architecture, 10:30 HSC Calculus, 17:00 Gym',
        sleep: 7.5,
        study: 4.5,
        book: 'Higher Mathematics Paper 1',
        chapterNotes: 'Chapter 9: Differentiation CQ Problem Sets Completed',
        books: 'Higher Math 1st Paper, Physics 1st Paper',
        gym: 1.25,
        prayer: 1.5,
        sports: 0.5,
        work: 3.5,
        dietLog: 'Oats, Bananas, 3L Water, Grilled Chicken, Almonds',
        goodDeeds: 'Helped junior student with calculus equations',
        learned: 'Stateful React Hooks architecture and V8 engine execution',
        savedAt: new Date().toISOString()
      }
    ];
  });

  // Media Logs State
  const [mediaLogs, setMediaLogs] = useState<MediaLog[]>(() => {
    const saved = readUserStorage('app_media_logs_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [isMediaStudioOpen, setIsMediaStudioOpen] = useState(false);

  // XP & Level
  const [xp, setXp] = useState(75);
  const userLevel = Math.floor(xp / 100) + 1;

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep workspace records isolated to the signed-in account.
  useEffect(() => {
    writeUserStorage('app_accounts_v2', JSON.stringify(accounts));
  }, [accounts, user.username]);

  useEffect(() => {
    writeUserStorage('app_transactions_v2', JSON.stringify(transactions));
  }, [transactions, user.username]);

  useEffect(() => {
    let active = true;
    void api.getFinance(user.username).then(snapshot => {
      if (!active || !snapshot) return;
      const currentFinance = financeState.current;

      const mergedTransactionMap = new Map(snapshot.transactions.map(transaction => [transaction.id, transaction]));
      currentFinance.transactions.forEach(transaction => mergedTransactionMap.set(transaction.id, transaction));
      const mergedTransactions = [...mergedTransactionMap.values()];
      setTransactions(mergedTransactions);
      currentFinance.transactions.forEach(transaction => {
        void api.saveTransaction(user.username, transaction)
          .catch(error => reportSyncError(error, 'transaction data'));
      });

      const mergedAccountMap = new Map(snapshot.accounts.map(account => [account.name.toLowerCase(), account]));
      currentFinance.accounts.forEach(account => mergedAccountMap.set(account.name.toLowerCase(), account));
      const mergedAccounts = [...mergedAccountMap.values()];
      setAccounts(mergedAccounts);
      if (currentFinance.accounts.length > 0 || snapshot.accounts.length === 0) {
        void api.saveAccounts(user.username, mergedAccounts)
          .catch(error => reportSyncError(error, 'bank account data'));
      }
    }).catch(error => reportSyncError(error, 'finance data'));
    return () => {
      active = false;
    };
  }, [user.username]);

  useEffect(() => {
    writeUserStorage('app_financial_country_v1', financialCountry);
  }, [financialCountry, user.username]);

  useEffect(() => {
    writeUserStorage('app_financial_categories_v1', JSON.stringify(customCategories));
  }, [customCategories, user.username]);

  useEffect(() => {
    writeUserStorage('app_habits_v2', JSON.stringify(habits));
  }, [habits, user.username]);

  useEffect(() => {
    writeUserStorage('app_habit_stacks_v2', JSON.stringify(habitStacks));
  }, [habitStacks, user.username]);

  useEffect(() => {
    writeUserStorage('app_study_sessions_v2', JSON.stringify(studySessions));
  }, [studySessions, user.username]);

  useEffect(() => {
    writeUserStorage('app_routines_v2', JSON.stringify(routines));
  }, [routines, user.username]);

  useEffect(() => {
    writeUserStorage('app_media_logs_v2', JSON.stringify(mediaLogs));
  }, [mediaLogs, user.username]);

  useEffect(() => {
    writeUserStorage('app_goals_v1', JSON.stringify(goals));
  }, [goals, user.username]);

  useEffect(() => {
    writeUserStorage('app_notifications_v1', JSON.stringify(notifications));
  }, [notifications, user.username]);

  useEffect(() => {
    writeUserStorage('app_notif_settings_v1', JSON.stringify(notificationSettings));
  }, [notificationSettings, user.username]);

  useEffect(() => {
    writeUserStorage('app_custom_tips_v1', JSON.stringify(customTips));
  }, [customTips, user.username]);

  // Aggregate Vault Balance Calculations
  const totalAssetsBDT = accounts.reduce((sum, a) => sum + a.balanceBDT, 0);
  const totalAssetsUSD = accounts.reduce((sum, a) => sum + a.balanceUSD, 0);

  // Goals Action Handlers
  const handleAddGoal = (goal: Goal) => {
    setGoals(prev => [goal, ...prev]);
    setXp(prev => prev + 25);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    if (updatedGoal.status === 'completed') {
      setXp(prev => prev + 50);
    }
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Custom Tips Action Handlers
  const handleAddTip = (tip: TipItem) => {
    setCustomTips(prev => [tip, ...prev]);
    setXp(prev => prev + 20);
  };

  const handleToggleFavoriteTip = (tipId: string) => {
    setCustomTips(prev => prev.map(t => t.id === tipId ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  // Notifications Action Handlers
  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    void api.saveTransaction(user.username, updatedTx)
      .catch(error => reportSyncError(error, 'transaction data'));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleAddAccount = (name: string, type: 'Bank' | 'MobileBanking') => {
    const updatedAccounts = [...accounts, {
      id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      type,
      accountNumber: '',
      balanceBDT: 0,
      balanceUSD: 0
    }];
    setAccounts(updatedAccounts);
    void api.saveAccounts(user.username, updatedAccounts)
      .catch(error => reportSyncError(error, 'bank account data'));
  };

  const handleAddCategory = (category: string) => {
    setCustomCategories(current => current.some(item => item.toLowerCase() === category.toLowerCase())
      ? current
      : [...current, category]);
  };

  const handleDeleteAccount = (name: string) => {
    const updated = accounts.filter(acc => acc.name.toLowerCase() !== name.toLowerCase());
    setAccounts(updated);
    void api.saveAccounts(user.username, updated)
      .catch(error => reportSyncError(error, 'bank account data'));
  };

  const handleDeleteCategory = (category: string) => {
    const updated = customCategories.filter(item => item.toLowerCase() !== category.toLowerCase());
    setCustomCategories(updated);
    writeUserStorage('app_financial_categories_v1', JSON.stringify(updated));
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(current => current.filter(tx => tx.id !== transactionId));
    void api.deleteTransaction(user.username, transactionId)
      .catch(error => reportSyncError(error, 'transaction data'));
  };

  // Keep media practice logs isolated and synced with SQLite backend
  useEffect(() => {
    writeUserStorage('app_media_logs_v2', JSON.stringify(mediaLogs));
  }, [mediaLogs, user.username]);

  useEffect(() => {
    let active = true;
    void api.getLogs(user.username).then(res => {
      if (!active || !res?.logs) return;
      setMediaLogs(current => {
        const map = new Map(res.logs.map(l => [l.id, l]));
        current.forEach(l => map.set(l.id, l));
        return [...map.values()];
      });
    }).catch(error => reportSyncError(error, 'media practice logs'));
    return () => { active = false; };
  }, [user.username]);

  const handleSaveMediaLog = (newLog: MediaLog) => {
    setMediaLogs(current => [newLog, ...current]);
    void api.saveLog(user.username, newLog)
      .catch(error => reportSyncError(error, 'media practice log'));
  };

  const handleDeleteMediaLog = (id: string) => {
    setMediaLogs(current => current.filter(m => m.id !== id));
    void api.deleteLog(user.username, id)
      .catch(error => reportSyncError(error, 'media practice log'));
  };

  // AUTO-SYNC ENGINE: Append formatted entry to Daily Routine timeline
  const handleAutoSyncToDailyRoutine = (entry: {
    text: string;
    studyHours: number;
    book: string;
    chapterNotes: string;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const existingRoutine = routines.find(r => r.date === today);

    if (existingRoutine) {
      const updatedRoutines = routines.map(r => {
        if (r.date === today) {
          return {
            ...r,
            study: parseFloat((r.study + entry.studyHours).toFixed(2)),
            dailySchedule: r.dailySchedule ? `${r.dailySchedule}, ${entry.text}` : entry.text,
            chapterNotes: r.chapterNotes ? `${r.chapterNotes} | ${entry.chapterNotes}` : entry.chapterNotes,
            books: r.books ? `${r.books}, ${entry.book}` : entry.book,
            savedAt: new Date().toISOString()
          };
        }
        return r;
      });
      setRoutines(updatedRoutines);
    } else {
      const newRoutine: DailyRoutine = {
        id: `rtn_${Date.now()}`,
        date: today,
        dailySchedule: entry.text,
        sleep: 7.0,
        study: entry.studyHours,
        book: entry.book,
        chapterNotes: entry.chapterNotes,
        books: entry.book,
        gym: 1.0,
        prayer: 1.5,
        sports: 0.5,
        work: 3.0,
        dietLog: 'Nutritious meals & hydration',
        goodDeeds: 'Daily productive learning',
        learned: entry.text,
        savedAt: new Date().toISOString()
      };
      setRoutines([newRoutine, ...routines]);
    }

    setXp(prev => prev + 25);
  };

  const handleSaveTransaction = (newTx: Transaction, updatedAccounts?: AccountBalance[]) => {
    setTransactions([newTx, ...transactions]);
    void api.saveTransaction(user.username, newTx)
      .catch(error => reportSyncError(error, 'transaction data'));
    if (updatedAccounts) {
      setAccounts(updatedAccounts);
      void api.saveAccounts(user.username, updatedAccounts)
        .catch(error => reportSyncError(error, 'bank account data'));
    } else {
      // Normal income or expense balance updates
      const isIncome = newTx.type === 'income';
      const isExpense = newTx.type === 'expense';
      const isDeposit = newTx.type === 'deposit';

      if (isIncome || isExpense || isDeposit) {
        const changeBDT = newTx.currency === 'BDT' ? newTx.amount : newTx.amount * exchangeRate;
        const changeUSD = newTx.currency === 'USD' ? newTx.amount : newTx.amount / exchangeRate;

        const updated = accounts.map(acc => {
          if (acc.name === newTx.platform || acc.name === newTx.bankName) {
            const factor = isIncome ? 1 : -1;
            return {
              ...acc,
              balanceBDT: acc.balanceBDT + (changeBDT * factor),
              balanceUSD: parseFloat((acc.balanceUSD + (changeUSD * factor)).toFixed(2))
            };
          }
          return acc;
        });
        setAccounts(updated);
        void api.saveAccounts(user.username, updated)
          .catch(error => reportSyncError(error, 'bank account data'));
      }
    }
    setXp(prev => prev + 15);
  };

  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id === id) {
        const completed = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: completed 
            ? h.completedDates.filter(d => d !== today)
            : [...h.completedDates, today],
          streak: completed ? Math.max(0, h.streak - 1) : h.streak + 1
        };
      }
      return h;
    });
    setHabits(updated);
  };

  const filteredTransactions = transactions.filter(t => {
    if (financeFilter === 'ALL') return true;
    return t.type === financeFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      
      {/* 1. TOP UNIVERSAL HEADER */}
      <header className="sticky top-0 z-40 glass-header px-6 py-3 flex items-center justify-between shadow-xs">
        
        {/* Left: Brand Identity & Live Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              🌱
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 leading-none">Maksudul</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Productivity OS</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-lg text-xs font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        {/* Center: Private multi-currency vault summary */}
        <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 bg-white/70 border border-slate-200/80 rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-500">Asset Vault:</span>
            <span className="text-sm font-black text-slate-800 font-mono">
              {isBalanceVisible ? `৳${totalAssetsBDT.toLocaleString('en-US', { minimumFractionDigits: 0 })} BDT` : '••••••'}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              {isBalanceVisible ? `(≈ $${totalAssetsUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD)` : ''}
            </span>
            <button type="button" onClick={() => setIsBalanceVisible(value => !value)} aria-label={isBalanceVisible ? 'Hide Balance' : 'Show Balance'} aria-pressed={isBalanceVisible} title={isBalanceVisible ? 'Hide Balance' : 'Show Balance'} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
              {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {financialCountry === 'Bangladesh' && <div className="text-[11px] font-semibold text-slate-400 border-l border-slate-200 pl-4">
            Rate: <strong>1 USD = {exchangeRate} BDT</strong>
          </div>}
        </div>

        {/* Right: Notification Bell, User Passport & Profile Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-xl border transition ${
              activeTab === 'notifications'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:text-emerald-700'
            }`}
            title="Notifications & Reminders"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsPassportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-emerald-700"
            title="Open User Passport"
          >
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Passport</span>
          </button>

          {/* Top-Right Profile Avatar: Strictly launches ProfileModal with NO superimposed 'M' overlay */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
            title="Open Profile Settings"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 shadow-sm">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black">
                  {(user.displayName || 'M').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="hidden md:block text-xs font-bold text-slate-700">
              {user.displayName || 'Maksudul'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Workspace Navigation */}
      <nav aria-label="Workspace navigation" className="sticky top-14 z-30 flex gap-1 overflow-x-auto border-b border-white/80 bg-white/80 px-3 py-2 backdrop-blur-xl md:hidden">
        {([
          ['habits', 'Habits', CheckCircle2],
          ['goals', 'Goals', Target],
          ['analytics', 'Analytics', BarChart3],
          ['media', 'Speaking', Film],
          ['tips', 'Tips', Lightbulb],
          ['notifications', 'Alerts', Bell],
          ['finance', 'Expenses', Receipt],
          ['study', 'Study', BookOpen],
          ['routines', 'Routine', Calendar]
        ] as const).map(([tab, label, Icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-current={activeTab === tab ? 'page' : undefined}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {tab === 'notifications' && unreadNotificationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        ))}
      </nav>

      {/* 2. MAIN LAYOUT (SIDEBAR + WORKSPACE) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Left Sidebar Menu */}
        <aside className="w-60 shrink-0 hidden md:flex flex-col gap-1.5">
          <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>

          <button
            onClick={() => setActiveTab('habits')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'habits' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Habit Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'goals' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Goals System</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>History & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'media' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Speaking Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tips' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Growth Tips</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notifications' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {unreadNotificationsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'notifications' ? 'bg-white text-emerald-800' : 'bg-rose-500 text-white'
              }`}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'finance' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expense Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'study' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study & Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('routines')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'routines' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Routine & Logs</span>
          </button>

          {/* Quick Balance Transfer Banner in Sidebar */}
          <div className="mt-auto p-4 bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Quick Transfer</span>
            </div>
            <p className="text-[11px] text-slate-500">Move funds between your configured accounts.</p>
            <button
              onClick={() => setIsFinanceModalOpen(true)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Transfer Funds
            </button>
          </div>
        </aside>

        {/* Workspace Active Pane */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: HABITS */}
          {activeTab === 'habits' && (
            <HabitTracker
              habits={habits}
              habitStacks={habitStacks}
              onToggleHabit={handleToggleHabit}
              onAddHabit={(h) => setHabits([h, ...habits])}
              onDeleteHabit={(id) => setHabits(habits.filter(h => h.id !== id))}
              onAddHabitStack={(s) => setHabitStacks([s, ...habitStacks])}
              onDeleteHabitStack={(id) => setHabitStacks(habitStacks.filter(s => s.id !== id))}
              onAddXp={(pts) => setXp(prev => prev + pts)}
            />
          )}

          {/* TAB 2: GOALS */}
          {activeTab === 'goals' && (
            <GoalsSection
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {/* TAB 3: HISTORY & ANALYTICS */}
          {activeTab === 'analytics' && (
            <HistoryAnalytics
              habits={habits}
              routines={routines}
            />
          )}

          {/* TAB 4: GROWTH & PRODUCTIVITY TIPS */}
          {activeTab === 'tips' && (
            <TipsSection
              customTips={customTips}
              onAddCustomTip={handleAddTip}
              onToggleFavorite={handleToggleFavoriteTip}
            />
          )}

          {/* TAB 5: NOTIFICATIONS & REMINDERS */}
          {activeTab === 'notifications' && (
            <NotificationsSection
              notifications={notifications}
              settings={notificationSettings}
              onUpdateSettings={setNotificationSettings}
              onMarkAsRead={handleMarkNotifRead}
              onMarkAllAsRead={handleMarkAllNotifsRead}
              onDeleteNotification={handleDeleteNotification}
              onClearAll={handleClearAllNotifs}
            />
          )}

          {/* TAB 6: SPEAKING PRACTICE & MEDIA STUDIO */}
          {activeTab === 'media' && (
            <MediaStudio
              isOpen={true}
              isStandalone={true}
              onClose={() => setActiveTab('habits')}
              mediaLogs={mediaLogs}
              onSaveMediaLog={handleSaveMediaLog}
              onDeleteMediaLog={handleDeleteMediaLog}
            />
          )}

          {/* TAB 7: EXPENSE TRACKER */}
          {activeTab === 'finance' && (
            <ExpenseTrackerSection
              transactions={transactions}
              accounts={accounts}
              exchangeRate={exchangeRate}
              country={financialCountry}
              categories={customCategories}
              onSaveTransaction={handleSaveTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onViewReceipt={(imgUrl) => setLightboxImg(imgUrl)}
            />
          )}

          {/* TAB 8: STUDY & PLAN (AUTO-SYNC ENGINE) */}
          {activeTab === 'study' && (
            <StudyAndPlan
              onSyncToDailyRoutine={handleAutoSyncToDailyRoutine}
              studySessions={studySessions}
              onAddStudySession={(s) => setStudySessions([s, ...studySessions])}
            />
          )}

          {/* TAB 9: DAILY ROUTINE & AUTO-SYNCED REFLECTION LOGS */}
          {activeTab === 'routines' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Daily Routine & Reflection Logs</h3>
                    <p className="text-xs text-slate-500">
                      Chronological day reviews automatically synced with your study sessions and habits
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Auto-Sync Active
                  </span>
                </div>

                <div className="space-y-4">
                  {routines.map(r => (
                    <div key={r.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold font-mono text-slate-800">{r.date}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">Sleep: <strong>{r.sleep}h</strong></span>
                          <span className="text-emerald-600 font-bold">Study: <strong>{r.study}h</strong></span>
                          <span className="text-purple-600 font-bold">Work: <strong>{r.work}h</strong></span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700">
                        <p><strong>Timeline:</strong> {r.dailySchedule}</p>
                        {r.chapterNotes && <p><strong>Study Notes:</strong> {r.chapterNotes}</p>}
                        {r.dietLog && <p className="text-slate-500"><strong>Diet & Health:</strong> {r.dietLog}</p>}
                        {r.learned && <p className="text-purple-700 font-medium"><strong>Daily Insight:</strong> {r.learned}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. MODALS */}
      
      {/* Finance Modal with Balance Transfer & Fluid Lightbox */}
      <FinanceModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        onSaveTransaction={handleSaveTransaction}
        accounts={accounts}
        exchangeRate={exchangeRate}
        country={financialCountry}
        categories={customCategories}
        onAddCategory={handleAddCategory}
      />

      {/* Media Studio Modal */}
      {isMediaStudioOpen && (
        <MediaStudio
          isOpen={isMediaStudioOpen}
          onClose={() => setIsMediaStudioOpen(false)}
          mediaLogs={mediaLogs}
          onSaveMediaLog={handleSaveMediaLog}
          onDeleteMediaLog={handleDeleteMediaLog}
        />
      )}

      {/* Top Header Profile Modal Trigger: Strictly opens clean profile drawer without 'M' text overlays */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => updateUser({ ...user, ...updated })}
        onLogout={() => {
          setIsProfileOpen(false);
          logOut();
        }}
        stats={{
          habitsCount: habits.length,
          routinesCount: routines.length,
          txCount: transactions.length
        }}
      />

      {passport && (
        <UserPassport
          isOpen={isPassportOpen}
          onboarding={!passport.isComplete}
          username={user.username}
          passport={passport}
          onChange={updatePassport}
          onClose={() => {
            if (passport.isComplete) setIsPassportOpen(false);
          }}
          onSave={updatedPassport => {
            updatePassport(updatedPassport);
            setIsPassportOpen(false);
          }}
        />
      )}

      {/* Fluid Standalone Lightbox Modal */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700/50 flex flex-col items-center"
          >
            <div className="w-full overflow-hidden flex items-center justify-center p-2">
              <img
                src={lightboxImg}
                alt="Document Full View"
                className="receipt-preview max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-xl block m-0 shadow-sm"
              />
            </div>
            <button
              onClick={() => setLightboxImg(null)}
              className="py-1 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg mt-1"
            >
              Close Lightbox
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  return user ? <EnterpriseApp user={user} /> : <AuthModal />;
};

export const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
