/**
 * ExpenseTrackerSection.tsx
 * Personal Financial Ledger, Daily Expense Tracker & Income Manager.
 * 
 * Why this exists:
 * Tracks daily expenses and income, calculates real-time remaining net balance,
 * provides custom category filtering, and supports editing and deleting transactions.
 */

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Search,
  Eye,
  ArrowRightLeft,
  Calendar,
  X,
  CreditCard,
  Building2
} from 'lucide-react';
import type { AccountBalance, CountrySelection, Transaction, TransactionType } from '../types';
import { useDebounce } from '../hooks';

interface ExpenseTrackerSectionProps {
  transactions: Transaction[];
  accounts: AccountBalance[];
  exchangeRate: number;
  country: CountrySelection;
  categories: string[];
  onSaveTransaction: (tx: Transaction, updatedAccounts?: AccountBalance[]) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewReceipt: (imgUrl: string) => void;
}

export const ExpenseTrackerSection: React.FC<ExpenseTrackerSectionProps> = ({
  transactions,
  accounts,
  exchangeRate,
  country,
  categories,
  onSaveTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onViewReceipt
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'expense' | 'income'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [category, setCategory] = useState(categories[0] || 'Personal');
  const [purpose, setPurpose] = useState('');
  const [platform, setPlatform] = useState(accounts[0]?.name || 'Standard Account');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Financial KPI Aggregations
  const summary = useMemo(() => {
    let totalIncomeBDT = 0;
    let totalExpenseBDT = 0;

    transactions.forEach(tx => {
      const bdtAmount = tx.currency === 'USD' ? tx.amount * exchangeRate : tx.amount;
      if (tx.type === 'income' || tx.type === 'deposit') {
        totalIncomeBDT += bdtAmount;
      } else if (tx.type === 'expense') {
        totalExpenseBDT += bdtAmount;
      }
    });

    const netBalanceBDT = totalIncomeBDT - totalExpenseBDT;
    const netBalanceUSD = netBalanceBDT / exchangeRate;

    return {
      totalIncomeBDT,
      totalExpenseBDT,
      netBalanceBDT,
      netBalanceUSD,
      totalTransactions: transactions.length
    };
  }, [transactions, exchangeRate]);

  // Open creation modal
  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setFormType('expense');
    setAmount('');
    setCurrency('BDT');
    setCategory(categories[0] || 'Personal');
    setPurpose('');
    setPlatform(accounts[0]?.name || 'Standard Account');
    setDate(new Date().toISOString().split('T')[0]);
    setReceiptImage(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormType(tx.type);
    setAmount(String(tx.amount));
    setCurrency(tx.currency);
    setCategory(tx.category);
    setPurpose(tx.purpose);
    setPlatform(tx.platform);
    setDate(tx.date);
    setReceiptImage(tx.receiptImage || null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const amountUSD = currency === 'USD' ? numAmount : numAmount / exchangeRate;

    if (editingTransaction) {
      const updated: Transaction = {
        ...editingTransaction,
        type: formType,
        amount: numAmount,
        currency,
        amountUSD: parseFloat(amountUSD.toFixed(2)),
        category,
        purpose: purpose.trim() || 'General Expense',
        platform,
        date,
        receiptImage
      };
      onUpdateTransaction(updated);
    } else {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        type: formType,
        amount: numAmount,
        currency,
        amountUSD: parseFloat(amountUSD.toFixed(2)),
        category,
        purpose: purpose.trim() || 'General Expense',
        platform,
        date,
        receiptImage,
        createdAt: new Date().toISOString()
      };
      onSaveTransaction(newTx);
    }

    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 250);

  // Memoized filtered transactions calculation
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterType === 'expense' && tx.type !== 'expense') return false;
      if (filterType === 'income' && tx.type !== 'income' && tx.type !== 'deposit') return false;
      const query = debouncedQuery.toLowerCase().trim();
      if (query) {
        const matchPurpose = tx.purpose?.toLowerCase().includes(query);
        const matchCategory = tx.category?.toLowerCase().includes(query);
        const matchPlatform = tx.platform?.toLowerCase().includes(query);
        return matchPurpose || matchCategory || matchPlatform;
      }
      return true;
    });
  }, [transactions, filterType, debouncedQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Expense Tracker & Financial Ledger</h2>
            <p className="text-xs text-slate-500 font-medium">
              Record daily expenses, track cashflow, and monitor real-time net balances
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* 2. Key Financial Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Inflow / Income</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-emerald-600 font-mono">
            +৳{summary.totalIncomeBDT.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </h3>
          <p className="text-[11px] font-mono font-semibold text-slate-400">
            ≈ ${(summary.totalIncomeBDT / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Outflow / Expenses</span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <h3 className="text-xl font-black text-rose-600 font-mono">
            -৳{summary.totalExpenseBDT.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </h3>
          <p className="text-[11px] font-mono font-semibold text-slate-400">
            ≈ ${(summary.totalExpenseBDT / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </p>
        </div>

        {/* Remaining Net Balance */}
        <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl space-y-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Remaining Net Balance</span>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </div>
          <h3 className={`text-xl font-black font-mono ${summary.netBalanceBDT >= 0 ? 'text-slate-900' : 'text-rose-700'
            }`}>
            ৳{summary.netBalanceBDT.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </h3>
          <p className="text-[11px] font-mono font-semibold text-teal-700">
            ≈ ${summary.netBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </p>
        </div>
      </div>

      {/* 3. Filter Pills & Keyword Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl">
        <div className="flex gap-1.5">
          {(['ALL', 'expense', 'income'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${filterType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {t === 'ALL' ? 'All Records' : t === 'expense' ? 'Expenses Only' : 'Income Only'}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* 4. Transactions Ledger Table */}
      <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
          <span className="text-xs text-slate-400 font-semibold">{filtered.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5">Account / Platform</th>
                <th className="py-2.5">Category & Purpose</th>
                <th className="py-2.5">Receipt</th>
                <th className="py-2.5 text-right">Amount</th>
                <th className="py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tx => {
                const isInc = tx.type === 'income' || tx.type === 'deposit';
                const isExp = tx.type === 'expense';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono text-slate-500">{tx.date}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${isInc
                          ? 'bg-emerald-100 text-emerald-800'
                          : isExp
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-700">{tx.platform}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-800 block">{tx.category}</span>
                      <span className="text-[11px] text-slate-500">{tx.purpose}</span>
                    </td>
                    <td className="py-3">
                      {tx.receiptImage ? (
                        <button
                          type="button"
                          onClick={() => onViewReceipt(tx.receiptImage!)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono font-bold">
                      <span className={isInc ? 'text-emerald-600' : isExp ? 'text-rose-600' : 'text-slate-800'}>
                        {isInc ? '+' : isExp ? '-' : ''}
                        {tx.currency === 'BDT' ? `৳${tx.amount.toLocaleString()}` : `$${tx.amount.toLocaleString()}`}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        ≈ ${tx.amountUSD.toLocaleString()} USD
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tx)}
                          title="Edit transaction"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete transaction"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-8 text-center text-slate-400">
            <Receipt className="mx-auto mb-2 h-7 w-7 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No transactions found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Record Transaction" above to add your first expense or income.</p>
          </div>
        )}
      </div>

      {/* 5. Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/80 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as TransactionType)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                    <option value="deposit">Deposit (+)</option>
                    <option value="transfer">Transfer (⇄)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'BDT' | 'USD')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Groceries, Tech"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account</label>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="e.g. Bank Account / Cash"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose / Note</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Weekly book purchase or project invoice"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt / Slip Attachment</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
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
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  {editingTransaction ? 'Update Record' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
