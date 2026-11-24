/**
 * GoalsSection.tsx
 * Personal Goal Setting, Milestone Tracking, and Timeline Management.
 * 
 * Why this exists:
 * Empowers the user to establish daily, weekly, and long-term objectives with progress
 * sliders, target deadlines, editing, and completion celebration.
 */

import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Sparkles, 
  X, 
  Flag,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import type { Goal, GoalStatus, GoalTimeframe } from '../types';

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'long_term' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal Growth');
  const [timeframe, setTimeframe] = useState<GoalTimeframe>('weekly');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [progress, setProgress] = useState(0);

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setCategory('Personal Growth');
    setTimeframe('weekly');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setTargetDate(d.toISOString().split('T')[0]);
    setProgress(0);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category);
    setTimeframe(goal.timeframe);
    setTargetDate(goal.targetDate);
    setProgress(goal.progress);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const status: GoalStatus = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending';

    if (editingGoal) {
      const updated: Goal = {
        ...editingGoal,
        title: title.trim(),
        description: description.trim(),
        category,
        timeframe,
        targetDate,
        progress,
        status,
        completedAt: progress >= 100 ? (editingGoal.completedAt || new Date().toISOString()) : undefined
      };
      onUpdateGoal(updated);
    } else {
      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        timeframe,
        targetDate,
        progress,
        status,
        createdAt: new Date().toISOString(),
        completedAt: progress >= 100 ? new Date().toISOString() : undefined
      };
      onAddGoal(newGoal);
    }

    setIsModalOpen(false);
  };

  const handleQuickProgress = (goal: Goal, increment: number) => {
    const newProgress = Math.min(100, Math.max(0, goal.progress + increment));
    const status: GoalStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending';
    onUpdateGoal({
      ...goal,
      progress: newProgress,
      status,
      completedAt: newProgress >= 100 ? new Date().toISOString() : undefined
    });
  };

  // Filtering
  const filteredGoals = goals.filter(g => {
    if (activeFilter === 'completed') return g.status === 'completed';
    if (activeFilter === 'daily') return g.timeframe === 'daily';
    if (activeFilter === 'weekly') return g.timeframe === 'weekly';
    if (activeFilter === 'long_term') return g.timeframe === 'long_term';
    return true;
  });

  const completedCount = goals.filter(g => g.status === 'completed').length;
  const inProgressCount = goals.filter(g => g.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/20">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Personal Goals & Targets</h2>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black text-purple-800">
                {completedCount} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Daily habits anchor milestones, goals drive the destination
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {([
            ['all', 'All Goals', goals.length],
            ['daily', 'Daily Targets', goals.filter(g => g.timeframe === 'daily').length],
            ['weekly', 'Weekly Milestones', goals.filter(g => g.timeframe === 'weekly').length],
            ['long_term', 'Long-Term Vision', goals.filter(g => g.timeframe === 'long_term').length],
            ['completed', 'Completed', completedCount]
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key as typeof activeFilter)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeFilter === key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span>{label}</span>
              <span className="rounded-full bg-slate-200/60 px-1.5 py-0.2 text-[9px] font-mono">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredGoals.map((goal) => {
          const isDone = goal.status === 'completed';
          return (
            <div
              key={goal.id}
              className={`flex flex-col justify-between rounded-3xl border p-5 shadow-xs backdrop-blur-xl transition ${
                isDone
                  ? 'border-emerald-200/80 bg-emerald-50/40 opacity-90'
                  : 'border-white/80 bg-white/85 hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      goal.timeframe === 'daily'
                        ? 'bg-blue-100 text-blue-800'
                        : goal.timeframe === 'weekly'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {goal.timeframe === 'long_term' ? 'Long-Term' : goal.timeframe}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                      {goal.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(goal)}
                      title="Edit Goal"
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      title="Delete Goal"
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress Bar & Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-mono text-emerald-700">{goal.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${goal.progress}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-600'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Increment Controls */}
                {!isDone && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickProgress(goal, 10)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      +10%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickProgress(goal, 25)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition"
                    >
                      +25%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickProgress(goal, 100)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition ml-auto"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Complete</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Target: {goal.targetDate}
                </span>
                <span className="font-semibold text-slate-500">
                  {isDone ? 'Goal Achieved ✓' : 'In Progress'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center text-slate-400">
          <Target className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No goals found</p>
          <p className="text-xs text-slate-400 mt-0.5">Click "Create New Goal" above to define your targets.</p>
        </div>
      )}

      {/* 4. Create / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/80 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingGoal ? 'Edit Goal' : 'Define New Goal Target'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master React & Systems Architecture"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why this matters and how you plan to achieve it..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as GoalTimeframe)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="daily">Daily Target</option>
                    <option value="weekly">Weekly Milestone</option>
                    <option value="long_term">Long-Term Vision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Domain Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Career & Engineering">Career & Engineering</option>
                  <option value="Academic & Study">Academic & Study</option>
                  <option value="Speaking & Presentation">Speaking & Presentation</option>
                  <option value="Health & Athletics">Health & Athletics</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Initial Progress</label>
                  <span className="font-mono text-xs font-bold text-purple-700">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:bg-purple-700"
                >
                  {editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
