import React from 'react';
import type { UserPassport } from '../types/auth';

interface AcademicSelectorProps {
  value: Pick<UserPassport, 'academicCountry' | 'academicLevel' | 'academicGroup' | 'academicSubjects'>;
  onChange: (value: Pick<UserPassport, 'academicCountry' | 'academicLevel' | 'academicGroup' | 'academicSubjects'>) => void;
}

const fieldClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10';
const scienceSubjects = ['Physics', 'Chemistry', 'Higher Math', 'ICT', 'Biology'];

export const AcademicSelector: React.FC<AcademicSelectorProps> = ({ value, onChange }) => {
  const update = (patch: Partial<AcademicSelectorProps['value']>) => onChange({ ...value, ...patch });

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/60 p-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Academic Profile</h3>
        <p className="mt-0.5 text-xs text-slate-500">Choose your country and academic track.</p>
      </div>
      <label className="block text-xs font-semibold text-slate-600">
        Country
        <select
          value={value.academicCountry}
          onChange={event => update({
            academicCountry: event.target.value as UserPassport['academicCountry'],
            academicLevel: '',
            academicGroup: '',
            academicSubjects: []
          })}
          className={fieldClass}
        >
          <option>United States</option>
          <option>Bangladesh</option>
        </select>
      </label>
      {value.academicCountry === 'Bangladesh' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Academic Level
            <select
              value={value.academicLevel}
              onChange={event => update({
                academicLevel: event.target.value as UserPassport['academicLevel'],
                academicGroup: '',
                academicSubjects: []
              })}
              className={fieldClass}
            >
              <option value="">Select a level</option>
              <option>JSC</option>
              <option>SSC</option>
              <option>HSC</option>
            </select>
          </label>
          {value.academicLevel === 'HSC' && (
            <label className="block text-xs font-semibold text-slate-600">
              Group
              <select
                value={value.academicGroup}
                onChange={event => {
                  const group = event.target.value as UserPassport['academicGroup'];
                  update({
                    academicGroup: group,
                    academicSubjects: group === 'Science' ? scienceSubjects : []
                  });
                }}
                className={fieldClass}
              >
                <option value="">Select a group</option>
                <option>Science</option>
                <option>Arts</option>
                <option>Commerce</option>
              </select>
            </label>
          )}
        </div>
      )}
      {value.academicGroup === 'Science' && (
        <div className="flex flex-wrap gap-2" aria-label="Science subjects">
          {value.academicSubjects.map(subject => (
            <span key={subject} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{subject}</span>
          ))}
        </div>
      )}
    </section>
  );
};
