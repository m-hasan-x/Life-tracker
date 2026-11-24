import React, { useState } from 'react';
import { Building2, Plus, Tag, Trash2, X } from 'lucide-react';
import type { AccountBalance, CountrySelection } from '../types';

interface FinanceLedgerProps {
  country: CountrySelection;
  onCountryChange: (country: CountrySelection) => void;
  accounts: AccountBalance[];
  onAddAccount: (name: string, type: 'Bank' | 'MobileBanking') => void;
  onDeleteAccount?: (name: string) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory?: (category: string) => void;
}

const inputClass = 'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10';

export const FinanceLedger: React.FC<FinanceLedgerProps> = ({
  country,
  onCountryChange,
  accounts,
  onAddAccount,
  onDeleteAccount,
  categories = [],
  onAddCategory,
  onDeleteCategory
}) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'Bank' | 'MobileBanking'>('Bank');
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const addAccount = () => {
    const name = accountName.trim();
    if (!name) return;
    if (accounts.some(account => account.name.toLowerCase() === name.toLowerCase())) {
      setError('An account with this name already exists.');
      return;
    }
    onAddAccount(name, accountType);
    setAccountName('');
    setError('');
  };

  const addCategory = () => {
    const name = categoryName.trim();
    if (!name) return;
    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      setError('This category already exists.');
      return;
    }
    onAddCategory(name);
    setCategoryName('');
    setError('');
  };

  return (
    <section className="grid gap-4 xl:grid-cols-2" aria-label="Financial settings">
      {/* Account Settings */}
      <div className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Building2 className="h-4 w-4 text-emerald-700" />
              Financial Settings & Custom Accounts
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Configure local banking institutions and currency display parameters.
            </p>
          </div>
          <select
            aria-label="Financial country"
            value={country}
            onChange={event => onCountryChange(event.target.value as CountrySelection)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-400"
          >
            <option>United States</option>
            <option>Bangladesh</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            aria-label="Account type"
            value={accountType}
            onChange={event => setAccountType(event.target.value as 'Bank' | 'MobileBanking')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700"
          >
            <option value="Bank">Bank Account</option>
            <option value="MobileBanking">Mobile Banking</option>
          </select>
          <input
            value={accountName}
            onChange={event => setAccountName(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addAccount();
              }
            }}
            placeholder="e.g. Standard Chartered / bKash"
            aria-label="New bank account name"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addAccount}
            disabled={!accountName.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>

        {error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}

        <div className="mt-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Accounts ({accounts.length})
          </span>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pt-1">
            {accounts.map(acc => (
              <span
                key={acc.name}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs"
              >
                <span>{acc.name}</span>
                <span className="rounded bg-slate-200/70 px-1 py-0.5 text-[9px] font-mono uppercase text-slate-500">
                  {acc.type}
                </span>
                {onDeleteAccount && (
                  <button
                    type="button"
                    onClick={() => onDeleteAccount(acc.name)}
                    aria-label={`Delete ${acc.name}`}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Categories */}
      <div className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Tag className="h-4 w-4 text-emerald-700" />
              Dynamic Transaction Categories
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Create, customize, and manage income & expense categories.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={categoryName}
            onChange={event => setCategoryName(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCategory();
              }
            }}
            placeholder="Add a custom category (e.g. Software, Tutoring, Gym)"
            aria-label="Custom category name"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCategory}
            disabled={!categoryName.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        <div className="mt-4 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available Categories ({categories.length})
          </span>
          <div className="mt-1 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {categories.map(category => (
              <span
                key={category}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
              >
                <span>{category}</span>
                {onDeleteCategory && (
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(category)}
                    aria-label={`Delete category ${category}`}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
