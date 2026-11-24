/**
 * HistoryAnalytics.tsx
 * Comprehensive Performance Dashboard, Streak Analytics, and Historical Audit Trail.
 * 
 * Why this exists:
 * Visualizes habit consistency over 7-day, 30-day, and monthly timeframes. Provides
 * actionable feedback on habit completion rates and category focus distribution.
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Layers, 
  Activity, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import type { Habit, DailyRoutine } from '../types';

interface HistoryAnalyticsProps {
  habits: Habit[];
  routines: DailyRoutine[];
}

export const HistoryAnalytics: React.FC<HistoryAnalyticsProps> = ({
  habits,
  routines
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // 1. Metric Calculations
  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const totalCheckins = habits.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0);
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const avgStreak = totalHabits > 0 
      ? (habits.reduce((sum, h) => sum + (h.streak || 0), 0) / totalHabits).toFixed(1) 
      : '0';

    // Best habit
    const topHabit = [...habits].sort((a, b) => b.streak - a.streak)[0]?.name || 'None';

    // 7-day consistency rate
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const checkinsLast7Days = last7Days.map(date => {
      const count = habits.filter(h => h.completedDates?.includes(date)).length;
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return { date, dayName, count };
    });

    // 30-day consistency grid
    const last30Days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push(d.toISOString().split('T')[0]);
    }

    const checkinsLast30Days = last30Days.map(date => {
      const count = habits.filter(h => h.completedDates?.includes(date)).length;
      return { date, count };
    });

    // Category distribution
    const categoriesMap: Record<string, number> = {};
    habits.forEach(h => {
      const cat = h.category || 'cat_general';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (h.completedDates?.length || 0);
    });

    return {
      totalHabits,
      totalCheckins,
      maxStreak,
      avgStreak,
      topHabit,
      checkinsLast7Days,
      checkinsLast30Days,
      categoriesMap
    };
  }, [habits]);

  // Max count in 7 days for bar scaling
  const max7DayCount = Math.max(1, ...stats.checkinsLast7Days.map(d => d.count));

  // Category labels helper
  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'cat_work': return 'Deep Work & Career';
      case 'cat_mind': return 'Mindset & Education';
      case 'cat_body': return 'Physical & Fitness';
      case 'cat_spirit': return 'Reflection & Mindfulness';
      default: return 'General Habits';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Timeframe Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">History & Progress Analytics</h2>
            <p className="text-xs text-slate-500 font-medium">
              Audit trail, habit completion trends, and milestone statistics
            </p>
          </div>
        </div>

        <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1">
          {(['week', 'month', 'all'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                timeframe === tf
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tf === 'week' ? 'Past 7 Days' : tf === 'month' ? 'Past 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Check-Ins</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{stats.totalCheckins}</span>
            <span className="ml-1 text-[11px] font-semibold text-emerald-600">Committed</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Longest Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{stats.maxStreak}</span>
            <span className="ml-1 text-[11px] font-semibold text-amber-600">Days Active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Streak</span>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{stats.avgStreak}</span>
            <span className="ml-1 text-[11px] font-semibold text-slate-500">Days / Habit</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Performing</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <p className="truncate text-sm font-black text-slate-800" title={stats.topHabit}>
              {stats.topHabit}
            </p>
            <span className="text-[10px] font-semibold text-purple-600">Highest Consistency</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts Grid: 7-Day Bar Chart & 30-Day Heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 7-Day Performance Bar Chart */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Completion Velocity</h3>
              <p className="text-xs text-slate-400">Habits completed per day over the past week</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 font-mono">
              {stats.checkinsLast7Days.reduce((s, d) => s + d.count, 0)} Check-ins
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 pt-6 h-48 border-b border-slate-100 pb-2">
            {stats.checkinsLast7Days.map((item) => {
              const heightPercent = Math.max(8, Math.round((item.count / max7DayCount) * 100));
              const isToday = item.date === new Date().toISOString().split('T')[0];
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-32">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                          : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isToday ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {item.dayName}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Past 7 days performance</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Today</span>
          </div>
        </div>

        {/* 30-Day Consistency Grid (Heatmap Matrix) */}
        <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">30-Day Consistency Heatmap</h3>
              <p className="text-xs text-slate-400">Activity density pattern over the last month</p>
            </div>
            <span className="text-xs font-bold text-slate-500">1 Month Scope</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-2">
            {stats.checkinsLast30Days.map((item) => {
              const intensity = item.count === 0 
                ? 'bg-slate-100 border-slate-200' 
                : item.count < 2 
                ? 'bg-emerald-200 border-emerald-300' 
                : item.count < 4 
                ? 'bg-emerald-400 border-emerald-500' 
                : 'bg-emerald-600 border-emerald-700 shadow-xs shadow-emerald-600/20';

              return (
                <div
                  key={item.date}
                  title={`${item.date}: ${item.count} check-ins`}
                  className={`h-8 rounded-lg border flex items-center justify-center font-mono text-[9px] font-bold transition hover:scale-110 cursor-pointer ${
                    item.count > 0 ? 'text-white' : 'text-slate-300'
                  } ${intensity}`}
                >
                  {item.count > 0 ? item.count : ''}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            <span>Less Active</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-slate-100 border border-slate-200" />
              <span className="h-3 w-3 rounded bg-emerald-200" />
              <span className="h-3 w-3 rounded bg-emerald-400" />
              <span className="h-3 w-3 rounded bg-emerald-600" />
            </div>
            <span>More Active</span>
          </div>
        </div>
      </div>

      {/* 4. Category Balance Distribution */}
      <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Life Domain Focus Distribution</h3>
            <p className="text-xs text-slate-400">Check-in distribution across work, mind, body, and mindfulness</p>
          </div>
          <Layers className="h-4 w-4 text-emerald-600" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(['cat_work', 'cat_mind', 'cat_body', 'cat_spirit'] as const).map(catKey => {
            const count = stats.categoriesMap[catKey] || 0;
            const percentage = stats.totalCheckins > 0 
              ? Math.round((count / stats.totalCheckins) * 100) 
              : 0;

            return (
              <div key={catKey} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{getCategoryName(catKey)}</span>
                  <span className="font-mono text-xs font-black text-slate-900">{percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{count} check-ins</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Historical Activity Audit Trail Feed */}
      <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Habit Check-In Audit Trail</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">{habits.length} habits tracked</span>
        </div>

        <div className="divide-y divide-slate-100">
          {habits.map((habit) => (
            <div key={habit.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{habit.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    Category: {getCategoryName(habit.category)} &bull; {habit.frequency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="flex items-center gap-1 font-mono text-xs font-black text-slate-800 justify-end">
                    <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                    {habit.streak} Days
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {habit.completedDates?.length || 0} Total Check-ins
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
