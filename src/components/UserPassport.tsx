import React, { useEffect, useRef, useState } from 'react';
import { Camera, MapPin, Plus, Trash2, X } from 'lucide-react';
import type { UserPassport as PassportData } from '../types/auth';
import { AcademicSelector } from './AcademicSelector';

interface UserPassportProps {
  isOpen: boolean;
  onboarding?: boolean;
  username: string;
  passport: PassportData;
  onClose: () => void;
  onSave: (passport: PassportData) => void;
  onChange?: (passport: PassportData) => void;
}

const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10';

export const UserPassport: React.FC<UserPassportProps> = ({
  isOpen,
  onboarding = false,
  username,
  passport,
  onClose,
  onSave,
  onChange
}) => {
  const [form, setForm] = useState<PassportData>(passport);
  const [error, setError] = useState('');
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(passport), [passport]);

  if (!isOpen) return null;

  const update = <K extends keyof PassportData>(key: K, value: PassportData[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your avatar.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar images must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('The selected image could not be read.');
        return;
      }
      update('avatar', reader.result);
      setError('');
    };
    reader.onerror = () => setError('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    savePassport();
  };

  const savePassport = () => {
    try {
      onSave({ ...form, isComplete: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The passport could not be saved.');
    }
  };

  const skipOnboarding = () => savePassport();
  const addCustomField = () => {
    const label = customFieldLabel.trim();
    if (!label || form.customFields.some(field => field.label.toLowerCase() === label.toLowerCase())) return;
    setForm(current => ({
      ...current,
      customFields: [...current.customFields, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, label, value: '' }]
    }));
    setCustomFieldLabel('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/30 backdrop-blur-sm animate-fade-in">
      {!onboarding && <button type="button" className="absolute inset-0 cursor-default" aria-label="Close passport" onClick={onClose} />}
      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-white/80 bg-white/85 shadow-2xl backdrop-blur-2xl">
        <header className="flex items-start justify-between border-b border-white/80 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Personal profile</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">User Passport</h2>
            <p className="mt-1 text-xs text-slate-500">Linked to <span className="font-semibold text-slate-700">{username.startsWith('@') ? username : `@${username}`}</span></p>
          </div>
          {!onboarding && <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>}
        </header>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {onboarding && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
              <strong>Welcome to your workspace.</strong> Add any details you want your AI assistants to remember. Sensitive details are sent to selected AI providers when you chat.
            </div>
          )}

          <section className="flex items-center gap-4 rounded-2xl border border-white bg-white/65 p-4 shadow-sm">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
              {form.avatar ? <img src={form.avatar} alt="Passport avatar" className="h-full w-full object-cover" /> : <span className="text-xl font-bold">{username.replace(/^@/, '').charAt(0).toUpperCase()}</span>}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Profile photo</p>
              <p className="mt-0.5 text-xs text-slate-500">Optional, up to 2 MB.</p>
              <button type="button" onClick={() => fileInput.current?.click()} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                <Camera className="h-3.5 w-3.5" /> Choose image
              </button>
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-slate-600">Age
              <input type="number" min="1" max="120" value={form.age ?? ''} onChange={event => update('age', event.target.value ? Number(event.target.value) : null)} className={fieldClass} placeholder="Years" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Height (cm)
              <input type="number" min="1" max="300" value={form.heightCm ?? ''} onChange={event => update('heightCm', event.target.value ? Number(event.target.value) : null)} className={fieldClass} placeholder="e.g. 172" />
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-600">Location / address
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input value={form.location} onChange={event => update('location', event.target.value)} className={`${fieldClass} pl-9`} placeholder="City, country (or general area)" />
            </div>
          </label>

          <AcademicSelector
            value={{
              academicCountry: form.academicCountry,
              academicLevel: form.academicLevel,
              academicGroup: form.academicGroup,
              academicSubjects: form.academicSubjects
            }}
            onChange={academic => {
              const updated = { ...form, ...academic };
              setForm(updated);
              onChange?.(updated);
            }}
          />

          <label className="block text-xs font-semibold text-slate-600">Current bank balances
            <textarea rows={2} value={form.bankBalances} onChange={event => update('bankBalances', event.target.value)} className={fieldClass} placeholder="Optional. Include only details you are comfortable sharing with AI providers." />
          </label>
          <label className="block text-xs font-semibold text-slate-600">HSC science syllabus targets
            <textarea rows={2} value={form.hscTargets} onChange={event => update('hscTargets', event.target.value)} className={fieldClass} placeholder="Subjects, chapters, exam dates, or study goals" />
          </label>
          <label className="block text-xs font-semibold text-slate-600">Gym / sprinting routine
            <textarea rows={2} value={form.fitnessRoutine} onChange={event => update('fitnessRoutine', event.target.value)} className={fieldClass} placeholder="Schedule, goals, limitations, and preferences" />
          </label>

          <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/60 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Custom Passport Fields</h3>
              <p className="mt-0.5 text-xs text-slate-500">Add details such as a diet plan, sleep schedule, or hobbies.</p>
            </div>
            {form.customFields.map(field => (
              <div key={field.id} className="flex items-end gap-2">
                <label className="min-w-0 flex-1 text-xs font-semibold text-slate-600">
                  {field.label}
                  <input
                    value={field.value}
                    onChange={event => setForm(current => ({
                      ...current,
                      customFields: current.customFields.map(item => item.id === field.id ? { ...item, value: event.target.value } : item)
                    }))}
                    className={fieldClass}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Remove ${field.label}`}
                  onClick={() => setForm(current => ({ ...current, customFields: current.customFields.filter(item => item.id !== field.id) }))}
                  className="mb-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={customFieldLabel}
                onChange={event => setCustomFieldLabel(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomField();
                  }
                }}
                className={`${fieldClass} mt-0`}
                placeholder="e.g. Sleep Schedule"
                aria-label="Custom field name"
              />
              <button type="button" onClick={addCustomField} disabled={!customFieldLabel.trim()} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white disabled:opacity-50">
                <Plus className="h-4 w-4" /> Add Custom Field
              </button>
            </div>
          </section>

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}

          <div className="sticky bottom-0 flex gap-2 border-t border-slate-200/70 bg-white/90 py-4">
            {onboarding ? (
              <button type="button" onClick={skipOnboarding} className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200">Skip for now</button>
            ) : (
              <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
            )}
            <button type="submit" className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 hover:bg-emerald-700">
              {onboarding ? 'Save & continue' : 'Save passport'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
