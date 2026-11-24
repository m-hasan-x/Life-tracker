/**
 * TipsSection.tsx
 * Comprehensive Personal Development, Productivity, and Public Speaking Guidance Hub.
 * 
 * Why this exists:
 * Delivers curated, actionable daily improvement suggestions, communication frameworks,
 * and habit optimization rules to accelerate user personal growth and speaking confidence.
 */

import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Mic, 
  Zap, 
  Brain, 
  Heart, 
  Plus, 
  CheckCircle2, 
  X,
  Share2,
  Clock
} from 'lucide-react';
import type { TipCategory, TipItem } from '../types';
import { useDebounce } from '../hooks';

interface TipsSectionProps {
  customTips: TipItem[];
  onAddCustomTip: (tip: TipItem) => void;
  onToggleFavorite: (tipId: string) => void;
}

const INITIAL_TIPS: TipItem[] = [
  {
    id: 'tip_speak_1',
    title: 'The 2-Second Strategic Pause in Public Speaking',
    category: 'speaking',
    insight: 'When you feel the urge to say "um", "ah", or "like", replace the filler word with complete silence for 2 seconds.',
    actionableStep: 'During your next MacBook video rehearsal, pause and breathe for 2 full seconds before answering or switching slides.',
    readTime: '2 min read',
    author: 'Presentation Mastery'
  },
  {
    id: 'tip_speak_2',
    title: 'Camera Eye Contact: The Lens is Your Audience',
    category: 'speaking',
    insight: 'Looking at your screen image breaks eye contact with viewers. Staring directly into the MacBook camera lens creates intimate connection.',
    actionableStep: 'Stick a small yellow dot right beside your webcam lens. Look at the dot whenever delivering your core takeaway.',
    readTime: '2 min read',
    author: 'Executive Communication'
  },
  {
    id: 'tip_prod_1',
    title: 'The 90-Minute Ultradian Rhythm Sprint',
    category: 'productivity',
    insight: 'Human focus operates in natural 90-minute waves of alertness followed by 20-minute drops in cognitive energy.',
    actionableStep: 'Structure your morning deep work into one uninterrupted 90-minute block, then take a real walk away from screens.',
    readTime: '3 min read',
    author: 'Cognitive Science'
  },
  {
    id: 'tip_prod_2',
    title: 'The "Two-Minute Rule" for Overcoming Inertia',
    category: 'productivity',
    insight: 'When starting a new habit, it should take less than two minutes to initiate. Scale the habit down until resistance vanishes.',
    actionableStep: 'Read one page, put on your gym shoes, or record 30 seconds. Starting is the only hurdle.',
    readTime: '1 min read',
    author: 'Atomic Habits'
  },
  {
    id: 'tip_mind_1',
    title: 'Identity-Based Habit Formation',
    category: 'mindset',
    insight: 'Do not aim to run a marathon; aim to become a runner. Every check-in on your habit tracker is a vote for your desired self-identity.',
    actionableStep: 'Before beginning any habit today, say: "I am the type of person who consistently follows through on my commitments."',
    readTime: '2 min read',
    author: 'James Clear'
  },
  {
    id: 'tip_mind_2',
    title: 'Stoic Evening Reflection: The Daily Audit',
    category: 'mindset',
    insight: 'Seneca reviewed his entire day before sleeping: What did I improve? Where did I falter? What could I have handled with more grace?',
    actionableStep: 'Open your Daily Routine timeline and write 1 insight you discovered today before turning off the lights.',
    readTime: '2 min read',
    author: 'Stoic Philosophy'
  },
  {
    id: 'tip_well_1',
    title: 'Morning Natural Light Exposure within 30 Minutes',
    category: 'wellness',
    insight: 'Sunlight in your eyes early in the morning sets your circadian clock, spikes healthy cortisol, and primes melatonin release 16 hours later.',
    actionableStep: 'Step outside or look out a bright window for 10 minutes before checking your phone notifications.',
    readTime: '2 min read',
    author: 'Neurobiology'
  },
  {
    id: 'tip_speak_3',
    title: 'Vocal Warmups: Lip Trills and Resonance',
    category: 'speaking',
    insight: 'A tense vocal tract causes flat tone and vocal fatigue. Warming up your lips and diaphragm increases projection and warmth.',
    actionableStep: 'Do 30 seconds of gentle lip trills (fluttering your lips like a motorboat) before starting your video recording session.',
    readTime: '1 min read',
    author: 'Voice Coaching'
  }
];

export const TipsSection: React.FC<TipsSectionProps> = ({
  customTips,
  onAddCustomTip,
  onToggleFavorite
}) => {
  const [activeCategory, setActiveCategory] = useState<TipCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New tip form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TipCategory>('productivity');
  const [newInsight, setNewInsight] = useState('');
  const [newAction, setNewAction] = useState('');

  // Combine initial preset tips and user-added custom tips
  const allTips = useMemo(() => [...customTips, ...INITIAL_TIPS], [customTips]);

  // Debounced search query to prevent laggy re-filtering on fast keystrokes
  const debouncedQuery = useDebounce(searchQuery, 250);

  // Memoized filter calculation for optimal React performance
  const filteredTips = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();
    return allTips.filter(tip => {
      const matchCategory = activeCategory === 'all' || tip.category === activeCategory;
      const matchSearch = !query || 
        tip.title.toLowerCase().includes(query) ||
        tip.insight.toLowerCase().includes(query) ||
        tip.actionableStep.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [allTips, activeCategory, debouncedQuery]);

  const handleCreateTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInsight.trim()) return;

    const newTip: TipItem = {
      id: `custom_tip_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      insight: newInsight.trim(),
      actionableStep: newAction.trim() || 'Apply this insight to your next daily routine.',
      readTime: '2 min read',
      author: 'Personal Rule',
      isFavorite: true
    };

    onAddCustomTip(newTip);
    setNewTitle('');
    setNewInsight('');
    setNewAction('');
    setIsAddModalOpen(false);
  };

  const getCategoryBadge = (category: TipCategory) => {
    switch (category) {
      case 'speaking':
        return { label: 'Speaking & Speech', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'productivity':
        return { label: 'Productivity', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'mindset':
        return { label: 'Mindset & Growth', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'wellness':
        return { label: 'Wellness & Energy', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Habit Rule', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Daily Growth Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 md:p-8 text-white shadow-lg shadow-emerald-700/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Daily Personal Growth Guidance</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Micro-Insights for Macro Performance
          </h2>
          <p className="text-sm text-emerald-50 leading-relaxed">
            Curated frameworks to sharpen your communication, maintain laser productivity,
            and transform daily habits into long-term personal mastery.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-md transition hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4" />
              <span>Record Personal Principle</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-emerald-100">
              <Clock className="h-3.5 w-3.5" />
              <span>{allTips.length} actionable principles available</span>
            </div>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* 2. Controls: Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl">
        <div className="flex flex-wrap gap-1.5">
          {([
            ['all', 'All Insights', Sparkles],
            ['speaking', 'Public Speaking', Mic],
            ['productivity', 'Productivity', Zap],
            ['mindset', 'Mindset', Brain],
            ['wellness', 'Wellness', Heart]
          ] as const).map(([cat, label, Icon]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat as TipCategory)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search insights..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {/* 3. Tips Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTips.map((tip) => {
          const badge = getCategoryBadge(tip.category);
          return (
            <div
              key={tip.id}
              className="flex flex-col justify-between rounded-2xl border border-white/80 bg-white/85 p-5 shadow-xs backdrop-blur-xl transition hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                    {badge.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(tip.id)}
                    aria-label="Bookmark tip"
                    className="text-slate-400 hover:text-emerald-600 transition"
                  >
                    {tip.isFavorite ? (
                      <BookmarkCheck className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {tip.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tip.insight}
                </p>

                {/* Actionable Step Pill */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Actionable Next Step:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-900">
                    {tip.actionableStep}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                <span>By {tip.author}</span>
                <span>{tip.readTime}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTips.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center text-slate-400">
          <Lightbulb className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-600">No matching guidance found</p>
          <p className="text-xs text-slate-400 mt-1">Try another category or clear your search query.</p>
        </div>
      )}

      {/* 4. Add Custom Principle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/80 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Personal Principle</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTip} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Principle / Rule Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Speak in Headlines First, Then Details"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as TipCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="speaking">Speaking & Communication</option>
                  <option value="productivity">Productivity & Deep Work</option>
                  <option value="mindset">Mindset & Habits</option>
                  <option value="wellness">Wellness & Energy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Core Insight / Explanation *</label>
                <textarea
                  rows={3}
                  required
                  value={newInsight}
                  onChange={(e) => setNewInsight(e.target.value)}
                  placeholder="Why this rule works and how it improves your daily life..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actionable Practice Step</label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Rehearse opening conclusion in 15 seconds"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  Save Principle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
