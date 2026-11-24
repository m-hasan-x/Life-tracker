import React, { useRef, useState } from 'react';
import { ArrowLeftRight, Building2, CheckCircle, Eye, Plus, PlusCircle, Trash2, Upload, Wallet, X } from 'lucide-react';
import type { AccountBalance, CountrySelection, CurrencyCode, Transaction, TransactionType } from '../types';

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTransaction: (transaction: Transaction, updatedAccounts?: AccountBalance[]) => void;
  accounts: AccountBalance[];
  exchangeRate?: number;
  country: CountrySelection;
  categories: string[];
  onAddCategory: (category: string) => void;
}

const expenseCategories = ['Food & Dining', 'Rent', 'Utilities', 'Books', 'Gadgets', 'Medical', 'Transportation', 'Personal Care', 'Other'];
const incomeCategories = ['Salary', 'Freelance & Contracts', 'Business Income', 'Investment Returns', 'Bonus & Gifts', 'Other'];
const depositCategories = ['Monthly DPS', 'Emergency Fund', 'FDR / Fixed Deposit', 'Custom Scheme'];
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10';

export const FinanceModal: React.FC<FinanceModalProps> = ({
  isOpen,
  onClose,
  onSaveTransaction,
  accounts,
  exchangeRate = 120,
  country,
  categories = [],
  onAddCategory
}) => {
  const [mode, setMode] = useState<TransactionType>('expense');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState<CurrencyCode>('BDT');
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [purpose, setPurpose] = useState('');
  const [sender, setSender] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [destinationType, setDestinationType] = useState<'myAccount' | 'anotherAccount'>('myAccount');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [customScheme, setCustomScheme] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const amountValue = Number(amount);
  const convertedUSD = currency === 'USD' ? amountValue : amountValue / exchangeRate;
  const availableAccounts = accounts.map(account => account.name);

  const changeMode = (nextMode: TransactionType) => {
    setMode(nextMode);
    setError('');
    if (nextMode === 'expense') setCategory(expenseCategories[0]);
    if (nextMode === 'income') setCategory(incomeCategories[0]);
    if (nextMode === 'deposit') setCategory(depositCategories[0]);
  };

  const handleReceipt = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for the receipt.');
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Receipt images must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('The selected receipt could not be read.');
        return;
      }
      setReceiptImage(reader.result);
      setReceiptFileName(file.name);
      setError('');
    };
    reader.onerror = () => setError('The selected receipt could not be read.');
    reader.readAsDataURL(file);
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value) return;
    onAddCategory(value);
    setCategory(value);
    setNewCategory('');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if ((mode === 'income' || mode === 'deposit') && platform !== 'Cash in Hand' && !platform) {
      setError(mode === 'income' ? 'Choose an account or select Hand Cash.' : 'Choose an account for this deposit.');
      return;
    }

    let updatedAccounts: AccountBalance[] | undefined;
    if (mode === 'transfer') {
      if (!fromAccount) {
        setError('Choose a source account.');
        return;
      }
      if (destinationType === 'myAccount' && (!toAccount || fromAccount === toAccount)) {
        setError('Choose a different destination account.');
        return;
      }
      if (destinationType === 'anotherAccount' && (!recipientName.trim() || !recipientBank.trim() || !recipientAccountNumber.trim())) {
        setError('Recipient name, recipient bank, and account number are required for an external transfer.');
        return;
      }
      if (destinationType === 'myAccount') {
        const source = accounts.find(account => account.name === fromAccount);
        const transferBDT = currency === 'BDT' ? amountValue : amountValue * exchangeRate;
        const transferUSD = currency === 'USD' ? amountValue : amountValue / exchangeRate;
        if (source && source.balanceBDT < transferBDT) {
          setError('The source account does not have enough balance for this transfer.');
          return;
        }
        updatedAccounts = accounts.map(account => {
          if (account.name === fromAccount) {
            return { ...account, balanceBDT: account.balanceBDT - transferBDT, balanceUSD: Number((account.balanceUSD - transferUSD).toFixed(2)) };
          }
          if (account.name === toAccount) {
            return { ...account, balanceBDT: account.balanceBDT + transferBDT, balanceUSD: Number((account.balanceUSD + transferUSD).toFixed(2)) };
          }
          return account;
        });
      }
    }

    const transaction: Transaction = {
      id: `TXN-${Date.now().toString(36).toUpperCase()}`,
      date,
      type: mode,
      amount: amountValue,
      currency,
      amountUSD: Number(convertedUSD.toFixed(2)),
      platform: mode === 'transfer'
        ? destinationType === 'myAccount' ? `${fromAccount} → ${toAccount}` : `${fromAccount} → ${recipientName}`
        : platform || 'Unspecified',
      bankName: mode === 'deposit' ? platform || undefined : mode === 'transfer' && destinationType === 'anotherAccount' ? recipientBank : undefined,
      recipientBank: mode === 'transfer' && destinationType === 'anotherAccount' ? recipientBank : undefined,
      accountNumber: mode === 'deposit' ? accountNumber || undefined : mode === 'transfer' && destinationType === 'anotherAccount' ? recipientAccountNumber : undefined,
      recipient: mode === 'expense' ? sender || undefined : mode === 'income' ? sender || undefined : mode === 'transfer' && destinationType === 'anotherAccount' ? recipientName : undefined,
      sender: mode === 'income' ? sender || undefined : undefined,
      transferDestination: mode === 'transfer' ? destinationType : undefined,
      fromAccount: mode === 'transfer' ? fromAccount : undefined,
      toAccount: mode === 'transfer' && destinationType === 'myAccount' ? toAccount : undefined,
      category: mode === 'transfer' ? 'Account Transfer' : mode === 'deposit' && category === 'Custom Scheme' ? customScheme.trim() || 'Custom Scheme' : category,
      purpose: purpose.trim() || '',
      receiptImage,
      fileName: receiptFileName || undefined,
      createdAt: new Date().toISOString()
    };

    onSaveTransaction(transaction, updatedAccounts);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-5">
        <section className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl backdrop-blur-2xl">
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200/70 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                {mode === 'transfer' ? <ArrowLeftRight className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </span>
              <div>
                <h2 className="font-bold text-slate-900">{mode === 'transfer' ? 'Transfer Funds' : 'Financial Ledger Entry'}</h2>
                <p className="text-xs text-slate-500">Record a {mode} transaction.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close transaction form" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100/80 p-1 sm:grid-cols-4">
                {(['expense', 'income', 'deposit', 'transfer'] as const).map(type => (
                  <button key={type} type="button" onClick={() => changeMode(type)} className={`rounded-xl px-2 py-2.5 text-xs font-bold capitalize transition ${mode === type ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Amount
                  <div className="mt-1 flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <select aria-label="Currency" value={currency} onChange={event => setCurrency(event.target.value as CurrencyCode)} className="border-r border-slate-200 bg-slate-50 px-2 text-xs font-bold">
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                    </select>
                    <input type="number" step="0.01" min="0.01" required value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00" className="min-w-0 flex-1 px-3 py-2.5 text-base font-bold text-slate-800 outline-none" />
                  </div>
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Date
                  <input type="date" required value={date} onChange={event => setDate(event.target.value)} className={`${fieldClass} mt-1`} />
                </label>
              </div>

              {amountValue > 0 && country === 'Bangladesh' && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  Exchange rate: 1 USD = {exchangeRate} BDT · Estimated value: {currency === 'BDT' ? `$${convertedUSD.toFixed(2)} USD` : `৳${(amountValue * exchangeRate).toLocaleString('en-US')} BDT`}
                </p>
              )}

              {mode !== 'transfer' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-600">
                    {mode === 'income' ? 'Received Into' : mode === 'deposit' ? 'Deposit Account' : 'Account or Platform'}
                    <select value={platform} onChange={event => setPlatform(event.target.value)} className={`${fieldClass} mt-1`}>
                      <option value="">Select an account</option>
                      {availableAccounts.map(account => <option key={account}>{account}</option>)}
                      {mode !== 'deposit' && <option value="Cash in Hand">Hand Cash</option>}
                    </select>
                    {(mode === 'income' || mode === 'deposit') && <span className="mt-1 block font-normal text-slate-400">{mode === 'income' ? 'Select Hand Cash to record cash income without a bank.' : 'Account numbers and transaction IDs are optional.'}</span>}
                  </label>
                  {mode === 'expense' && (
                    <label className="text-xs font-semibold text-slate-600">
                      Expense Category
                      <select value={category} onChange={event => setCategory(event.target.value)} className={`${fieldClass} mt-1`}>
                        {[...new Set([...expenseCategories, ...categories])].map(item => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  )}
                  {mode === 'income' && (
                    <>
                      <label className="text-xs font-semibold text-slate-600">
                        Income Category
                        <select value={category} onChange={event => setCategory(event.target.value)} className={`${fieldClass} mt-1`}>
                          {[...new Set([...incomeCategories, ...categories])].map(item => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                      <label className="text-xs font-semibold text-slate-600">
                        Sender Details (optional)
                        <input value={sender} onChange={event => setSender(event.target.value)} placeholder="e.g. Client or employer" className={`${fieldClass} mt-1`} />
                      </label>
                    </>
                  )}
                  {mode === 'expense' && (
                    <label className="text-xs font-semibold text-slate-600">
                      Payee (optional)
                      <input value={sender} onChange={event => setSender(event.target.value)} placeholder="e.g. Store or service" className={`${fieldClass} mt-1`} />
                    </label>
                  )}
                  {mode === 'deposit' && (
                    <>
                      <label className="text-xs font-semibold text-slate-600">
                        Savings Scheme
                        <select value={category} onChange={event => setCategory(event.target.value)} className={`${fieldClass} mt-1`}>
                          {depositCategories.map(item => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                      {category === 'Custom Scheme' && <label className="text-xs font-semibold text-slate-600">Custom Scheme Name<input required value={customScheme} onChange={event => setCustomScheme(event.target.value)} placeholder="e.g. Education Fund" className={`${fieldClass} mt-1`} /></label>}
                      <label className="text-xs font-semibold text-slate-600">
                        Account Number / Last 4 Digits / TxID (optional)
                        <input value={accountNumber} onChange={event => setAccountNumber(event.target.value)} placeholder="Optional reference" className={`${fieldClass} mt-1`} />
                      </label>
                    </>
                  )}
                  {mode !== 'deposit' && (
                    <label className="text-xs font-semibold text-slate-600">
                      Add Custom Category
                      <span className="mt-1 flex gap-2">
                        <input value={newCategory} onChange={event => setNewCategory(event.target.value)} placeholder="e.g. Childcare" className={`${fieldClass} mt-0`} />
                        <button type="button" onClick={addCategory} disabled={!newCategory.trim()} aria-label="Add custom category" className="rounded-xl bg-slate-900 px-3 text-white disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                      </span>
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Source Account
                      <select required value={fromAccount} onChange={event => setFromAccount(event.target.value)} className={`${fieldClass} mt-1`}>
                        <option value="">Select source</option>
                        {availableAccounts.map(account => <option key={account}>{account}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                      Destination
                      <select value={destinationType} onChange={event => setDestinationType(event.target.value as 'myAccount' | 'anotherAccount')} className={`${fieldClass} mt-1`}>
                        <option value="myAccount">My Account</option>
                        <option value="anotherAccount">Another Account</option>
                      </select>
                    </label>
                  </div>
                  {destinationType === 'myAccount' ? (
                    <label className="block text-xs font-semibold text-slate-700">
                      Destination Account
                      <select required value={toAccount} onChange={event => setToAccount(event.target.value)} className={`${fieldClass} mt-1`}>
                        <option value="">Select destination</option>
                        {availableAccounts.filter(account => account !== fromAccount).map(account => <option key={account}>{account}</option>)}
                      </select>
                    </label>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold text-slate-700">Recipient Name<input required value={recipientName} onChange={event => setRecipientName(event.target.value)} placeholder="Full name" className={`${fieldClass} mt-1`} /></label>
                      <label className="text-xs font-semibold text-slate-700">Recipient Bank<input required value={recipientBank} onChange={event => setRecipientBank(event.target.value)} placeholder="e.g. American International Bank" className={`${fieldClass} mt-1`} /></label>
                      <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Account Number<input required value={recipientAccountNumber} onChange={event => setRecipientAccountNumber(event.target.value)} placeholder="Recipient account number" className={`${fieldClass} mt-1`} /></label>
                    </div>
                  )}
                  <p className="flex items-center gap-2 text-xs text-blue-800"><Wallet className="h-4 w-4" />My Account transfers update both account balances.</p>
                </div>
              )}

              <label className="block text-xs font-semibold text-slate-600">
                Memo / Notes (optional)
                <input value={purpose} onChange={event => setPurpose(event.target.value)} placeholder="Add an optional note" className={`${fieldClass} mt-1`} />
              </label>

              <div>
                <span className="block text-xs font-semibold text-slate-600">Receipt image (optional)</span>
                {receiptImage ? (
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <button type="button" onClick={() => setLightboxImage(receiptImage)} className="h-12 w-12 overflow-hidden rounded-lg" aria-label="Preview receipt">
                      <img src={receiptImage} alt="Receipt preview" className="h-full w-full object-cover" />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-700">{receiptFileName}</span>
                    <button type="button" onClick={() => { setReceiptImage(null); setReceiptFileName(''); if (fileInput.current) fileInput.current.value = ''; }} aria-label="Remove receipt" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInput.current?.click()} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-xs font-semibold text-slate-600 hover:border-emerald-400">
                    <Upload className="h-4 w-4" /> Upload receipt image
                  </button>
                )}
                <input ref={fileInput} type="file" accept="image/*" onChange={handleReceipt} className="hidden" />
              </div>

              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
              <footer className="flex justify-end gap-2 border-t border-slate-200/70 pt-4">
                <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 hover:bg-emerald-700">
                  <PlusCircle className="h-4 w-4" /> Save {mode === 'transfer' ? 'Transfer' : 'Transaction'}
                </button>
              </footer>
            </form>
          </div>
        </section>
      </div>
      {lightboxImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-h-[90vh] max-w-4xl rounded-2xl bg-white p-3" onClick={event => event.stopPropagation()}>
            <img src={lightboxImage} alt="Receipt full view" className="max-h-[80vh] max-w-full rounded-xl object-contain" />
            <button type="button" onClick={() => setLightboxImage(null)} aria-label="Close receipt preview" className="absolute right-4 top-4 rounded-full bg-slate-900/70 p-2 text-white"><Eye className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </>
  );
};
