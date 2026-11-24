/**
 * NotificationsSection.tsx
 * Habit reminders, goal deadlines, daily task notifications, and preference controls.
 * 
 * Why this exists:
 * Keeps the user accountable with customizable alerts, reminder timestamps, and activity logs
 * without overwhelming the interface.
 */

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Settings2, 
  Clock, 
  CheckCircle2, 
  Target, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { NotificationItem, NotificationSettings, NotificationType } from '../types';

interface NotificationsSectionProps {
  notifications: NotificationItem[];
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notifications,
  settings,
  onUpdateSettings,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'habit' | 'goal' | 'task'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'habit') return n.type === 'habit';
    if (activeFilter === 'goal') return n.type === 'goal';
    if (activeFilter === 'task') return n.type === 'task';
    return true;
  });

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'habit':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'goal':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'task':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'activity':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Notifications & Reminders</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Daily habit cues, goal target deadlines, and scheduled task check-ins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
              showSettings
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* 2. Notification Preferences Drawer */}
      {showSettings && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm backdrop-blur-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notification & Reminder Preferences</h3>
              <p className="text-xs text-slate-500">Configure which triggers and daily alerts appear in your feed</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Done
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Habit Reminders */}
            <label className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3.5 shadow-xs cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Habit Check-In Reminders</span>
                <p className="text-[10px] text-slate-400">Alerts when daily habits are pending</p>
              </div>
              <input
                type="checkbox"
                checked={settings.habitReminders}
                onChange={(e) => onUpdateSettings({ ...settings, habitReminders: e.target.checked })}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
            </label>

            {/* Goal Reminders */}
            <label className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3.5 shadow-xs cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Goal Target Deadlines</span>
                <p className="text-[10px] text-slate-400">Approaching milestones & end dates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.goalReminders}
                onChange={(e) => onUpdateSettings({ ...settings, goalReminders: e.target.checked })}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
            </label>

            {/* Daily Task Reminders */}
            <label className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3.5 shadow-xs cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Daily Task Notifications</span>
                <p className="text-[10px] text-slate-400">Routine timeline & deep work prompts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyTaskReminders}
                onChange={(e) => onUpdateSettings({ ...settings, dailyTaskReminders: e.target.checked })}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
            </label>

            {/* Activity Alerts */}
            <label className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3.5 shadow-xs cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Milestone & Streak Alerts</span>
                <p className="text-[10px] text-slate-400">Celebrations on 7, 14, 21-day streaks</p>
              </div>
              <input
                type="checkbox"
                checked={settings.activityAlerts}
                onChange={(e) => onUpdateSettings({ ...settings, activityAlerts: e.target.checked })}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
            </label>

            {/* Sound Alerts */}
            <label className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3.5 shadow-xs cursor-pointer">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  {settings.soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
                  <span>Notification Sound</span>
                </div>
                <p className="text-[10px] text-slate-400">Subtle chime on new reminder</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
            </label>

            {/* Reminder Time */}
            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white p-3.5 shadow-xs">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">Daily Digest Time</span>
                <p className="text-[10px] text-slate-400">Preferred morning reminder hour</p>
              </div>
              <input
                type="text"
                value={settings.reminderTime}
                onChange={(e) => onUpdateSettings({ ...settings, reminderTime: e.target.value })}
                placeholder="08:00 AM"
                className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-center font-mono text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {([
            ['all', 'All Alerts'],
            ['unread', 'Unread Only'],
            ['habit', 'Habits'],
            ['goal', 'Goals'],
            ['task', 'Daily Tasks']
          ] as const).map(([filterKey, label]) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setActiveFilter(filterKey as typeof activeFilter)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeFilter === filterKey
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Feed</span>
          </button>
        )}
      </div>

      {/* 4. Notification List */}
      <div className="space-y-2.5">
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            onClick={() => onMarkAsRead(n.id)}
            className={`group flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-xs backdrop-blur-xl transition cursor-pointer ${
              n.read
                ? 'border-slate-200/80 bg-white/70 opacity-80 hover:opacity-100'
                : 'border-emerald-200/90 bg-white shadow-sm ring-1 ring-emerald-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-slate-50 p-2 shadow-inner">
                {getTypeIcon(n.type)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-bold ${n.read ? 'text-slate-800' : 'text-slate-950 font-black'}`}>
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(n.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNotification(n.id);
              }}
              aria-label="Delete notification"
              className="p-1 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center text-slate-400">
            <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300 opacity-60" />
            <p className="text-sm font-bold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">No notifications matching your active filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
