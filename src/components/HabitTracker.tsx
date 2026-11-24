import React, { useState, useRef } from 'react';
import { 
  Check, 
  Flame, 
  Paperclip, 
  Plus, 
  Wind, 
  Layers, 
  X, 
  Download, 
  ExternalLink,
  Calendar,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Habit, HabitStack } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  habitStacks: HabitStack[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
  onAddHabitStack: (stack: HabitStack) => void;
  onDeleteHabitStack: (id: string) => void;
  onAddXp: (amount: number) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  habitStacks,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onAddHabitStack,
  onDeleteHabitStack,
  onAddXp
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Habit | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('cat_work');
  const [frequency, setFrequency] = useState('daily');
  const [timeSchedule, setTimeSchedule] = useState('08:00 AM - 09:30 AM');
  const [attachType, setAttachType] = useState<'file' | 'link' | 'note'>('file');
  const [attachFileName, setAttachFileName] = useState('');
  const [attachFileData, setAttachFileData] = useState<string | null>(null);

  // Stacking Form State
  const [stackCurrent, setStackCurrent] = useState('');
  const [stackNew, setStackNew] = useState('');

  // 3-Minute Breathing Reset State
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [breathingSeconds, setBreathingSeconds] = useState(180);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: `hab_${Date.now()}`,
      name: name.trim(),
      category,
      frequency,
      timeSchedule: timeSchedule.trim(),
      streak: 0,
      completedDates: [],
      attachType,
      attachFileName: attachFileName || (attachType === 'note' ? 'Checklist Note' : ''),
      attachFileData,
      createdAt: new Date().toISOString()
    };

    onAddHabit(newHabit);
    onAddXp(15);
    setIsAddModalOpen(false);
    setName('');
    setAttachFileData(null);
    setAttachFileName('');
  };

  const handleCreateStack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stackCurrent.trim() || !stackNew.trim()) return;

    onAddHabitStack({
      id: `stk_${Date.now()}`,
      current: stackCurrent.trim(),
      newHabit: stackNew.trim()
    });
    setStackCurrent('');
    setStackNew('');
  };

  const toggleBreathing = () => {
    if (isBreathingRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsBreathingRunning(false);
    } else {
      setIsBreathingRunning(true);
      timerRef.current = window.setInterval(() => {
        setBreathingSeconds(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsBreathingRunning(false);
            onAddXp(20);
            return 180;
          }
          const current = 180 - prev;
          const phase = current % 19;
          if (phase < 4) setBreathPhase('Inhale');
          else if (phase < 11) setBreathPhase('Hold');
          else setBreathPhase('Exhale');

          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Habit Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-slate-800">Daily Core Habits</h3>
          <p className="text-xs text-slate-500 font-medium">Build consistency with streaks, stacks & reference documents</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsBreathingOpen(!isBreathingOpen)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200/70 transition-all flex items-center gap-1.5"
          >
            <Wind className="w-4 h-4 text-emerald-600" />
            <span>3-Min Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* 3-Minute Breathing Banner */}
      {isBreathingOpen && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white transition-all duration-700 ${
              breathPhase === 'Inhale' 
                ? 'bg-emerald-600 scale-110 shadow-lg shadow-emerald-500/30' 
                : breathPhase === 'Hold' 
                ? 'bg-teal-600 scale-100' 
                : 'bg-emerald-700 scale-90'
            }`}>
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Anti-Procrastination Reset</span>
              <h4 className="text-xl font-black text-slate-800">{breathPhase} &bull; {Math.floor(breathingSeconds / 60)}:{String(breathingSeconds % 60).padStart(2, '0')}</h4>
              <p className="text-xs text-slate-500">4s Inhale &bull; 7s Hold &bull; 8s Exhale cycle for deep focus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBreathing}
              className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700"
            >
              {isBreathingRunning ? 'Pause' : 'Start Focus Breathing'}
            </button>
            <button
              onClick={() => { setIsBreathingOpen(false); if (timerRef.current) clearInterval(timerRef.current); }}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map(h => {
          const isDoneToday = h.completedDates.includes(todayStr);

          return (
            <div 
              key={h.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isDoneToday 
                  ? 'bg-white/95 border-emerald-300 shadow-sm' 
                  : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleHabit(h.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isDoneToday 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'border-2 border-slate-300 hover:border-emerald-500 bg-white'
                      }`}
                    >
                      {isDoneToday && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold leading-tight ${isDoneToday ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {h.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">{h.timeSchedule}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteHabit(h.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Attachment badge */}
                {h.attachFileName && (
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment(h)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[180px]">{h.attachFileName}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {h.streak} days
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium capitalize text-[10px]">
                  {h.frequency}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Habit Stacking Builder */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Habit Stacking Engine</h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">Link habits sequentially for automatic flow</span>
        </div>

        <form onSubmit={handleCreateStack} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1">After I currently...</label>
            <input
              type="text"
              required
              value={stackCurrent}
              onChange={(e) => setStackCurrent(e.target.value)}
              placeholder="e.g. Finish morning espresso"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1">I will immediately...</label>
            <input
              type="text"
              required
              value={stackNew}
              onChange={(e) => setStackNew(e.target.value)}
              placeholder="e.g. Solve 5 Higher Math CQ questions"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Stack Habit</span>
            </button>
          </div>
        </form>

        {habitStacks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {habitStacks.map(stk => (
              <div key={stk.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
                <span>After <strong>{stk.current}</strong> &rarr; <strong>{stk.newHabit}</strong></span>
                <button
                  onClick={() => onDeleteHabitStack(stk.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE HABIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Schedule New Habit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Habit Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Physics 1st Paper Problem Solving"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="cat_work">Deep Work & Code</option>
                    <option value="cat_mind">Learning & Study (HSC)</option>
                    <option value="cat_health">Fitness & Health</option>
                    <option value="cat_spirit">Spiritual & Namaz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Schedule</label>
                <input
                  type="text"
                  value={timeSchedule}
                  onChange={(e) => setTimeSchedule(e.target.value)}
                  placeholder="e.g. 08:00 AM - 10:00 AM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Attachment Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Reference (Optional)</label>
                <div className="flex gap-4 text-xs font-medium text-slate-600 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="attachType"
                      checked={attachType === 'file'}
                      onChange={() => setAttachType('file')}
                    />
                    <span>File / Document</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="attachType"
                      checked={attachType === 'link'}
                      onChange={() => setAttachType('link')}
                    />
                    <span>URL Link</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="attachType"
                      checked={attachType === 'note'}
                      onChange={() => setAttachType('note')}
                    />
                    <span>Checklist Note</span>
                  </label>
                </div>

                {attachType === 'file' && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500"
                  />
                )}

                {attachType === 'link' && (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={attachFileData || ''}
                    onChange={(e) => {
                      setAttachFileData(e.target.value);
                      setAttachFileName(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                )}

                {attachType === 'note' && (
                  <textarea
                    rows={3}
                    placeholder="Bullet points or key formula reference"
                    value={attachFileData || ''}
                    onChange={(e) => {
                      setAttachFileData(e.target.value);
                      setAttachFileName('Quick Checklist Note');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                >
                  Schedule Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLUID ATTACHMENT LIGHTBOX MODAL */}
      {selectedAttachment && (
        <div 
          onClick={() => setSelectedAttachment(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-4 border border-slate-200 flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">{selectedAttachment.attachFileName}</h4>
              </div>
              <button
                onClick={() => setSelectedAttachment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex items-center justify-center p-2">
              {selectedAttachment.attachFileData?.startsWith('data:image/') ? (
                <img
                  src={selectedAttachment.attachFileData}
                  alt={selectedAttachment.attachFileName}
                  className="receipt-preview max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-xl block m-0 shadow-sm"
                />
              ) : selectedAttachment.attachType === 'link' ? (
                <div className="text-center p-8 space-y-3">
                  <ExternalLink className="w-8 h-8 mx-auto text-emerald-600" />
                  <p className="text-xs text-slate-600">Attached Resource Link:</p>
                  <a
                    href={selectedAttachment.attachFileData || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Open Resource in New Tab
                  </a>
                </div>
              ) : (
                <div className="w-full p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                  {selectedAttachment.attachFileData || 'No preview available.'}
                </div>
              )}
            </div>

            {selectedAttachment.attachFileData && selectedAttachment.attachType === 'file' && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <a
                  href={selectedAttachment.attachFileData}
                  download={selectedAttachment.attachFileName || 'habit_doc'}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Copy</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

