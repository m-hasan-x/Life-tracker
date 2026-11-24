import React, { useEffect, useState } from 'react';
import { KeyRound, Leaf, LockKeyhole, Mail } from 'lucide-react';
import type { RegistrationInput } from '../types/auth';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  onAuthenticated?: () => void;
}

const inputClass = 'w-full rounded-xl border border-white/70 bg-white/70 px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10';

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthenticated }) => {
  const { checkUserIdAvailability, signUp, logIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== 'signup' || !username.trim()) {
      setUsernameAvailable(null);
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        setUsernameAvailable(checkUserIdAvailability(username));
      } catch (availabilityError) {
        setUsernameAvailable(null);
        setError(availabilityError instanceof Error ? availabilityError.message : 'Unable to check User ID availability.');
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [username, mode, checkUserIdAvailability]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setUsernameAvailable(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const registration: RegistrationInput = {
          firstName,
          lastName,
          username,
          email,
          phone,
          password
        };
        await signUp(registration);
      } else {
        await logIn(identifier, password);
      }
      onAuthenticated?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-emerald-50 to-teal-100 p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
      </div>
      <section className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/80 bg-white/65 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
        <header className="px-7 pb-5 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-700/20">
            <Leaf className="h-6 w-6" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Maksudul Enterprise Suite</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login' ? 'Sign in to continue to your workspace.' : 'Your personal workspace starts here.'}
          </p>
        </header>

        <div className="mx-7 grid grid-cols-2 rounded-xl border border-white/80 bg-slate-100/70 p-1">
          {(['login', 'signup'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => switchMode(tab)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              aria-pressed={mode === tab}
            >
              {tab === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-7 pb-7 pt-5">
          {mode === 'signup' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5 text-xs font-semibold text-slate-600">
                  First name *
                  <input
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={event => {
                      const value = event.target.value;
                      setFirstName(value ? value.charAt(0).toUpperCase() + value.slice(1) : '');
                    }}
                    className={inputClass}
                    placeholder="Maksudul"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-slate-600">
                  Last name
                  <input autoComplete="family-name" value={lastName} onChange={event => setLastName(event.target.value)} className={inputClass} placeholder="Rahman" />
                </label>
              </div>
              <label className="block space-y-1.5 text-xs font-semibold text-slate-600">
                User ID *
                <div className="relative">
                  <span aria-hidden="true" className="absolute left-3 top-3 text-sm font-bold text-slate-400">@</span>
                  <input
                    required
                    minLength={3}
                    maxLength={30}
                    pattern={'[A-Za-z0-9._\\-]+'}
                    autoComplete="username"
                    value={username}
                    onChange={event => setUsername(event.target.value.replace(/^@+/, ''))}
                    className={`${inputClass} pl-9`}
                    placeholder="your-user-id"
                  />
                </div>
                {usernameAvailable === false && <span className="block text-xs font-medium text-rose-600" role="alert">This User ID is already taken. Please choose another.</span>}
                {usernameAvailable === true && <span className="block text-xs font-medium text-emerald-700">User ID is available.</span>}
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-slate-600">
                Email address *
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className={`${inputClass} pl-9`} placeholder="you@example.com" />
                </div>
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-slate-600">
                Phone number *
                <input required type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} className={inputClass} placeholder="+880 1XXX-XXXXXX" />
              </label>
            </>
          ) : (
            <label className="block space-y-1.5 text-xs font-semibold text-slate-600">
              User ID or email *
              <input required autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} className={inputClass} placeholder="maksudul or you@example.com" />
            </label>
          )}

          <label className="block space-y-1.5 text-xs font-semibold text-slate-600">
            Password *
            <div className="relative">
              {mode === 'login' ? <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" /> : <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />}
              <input required type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} className={`${inputClass} pl-9`} placeholder="Enter your password" />
            </div>
          </label>

          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}

          <button type="submit" disabled={isSubmitting || (mode === 'signup' && usernameAvailable === false)} className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
          <p className="pt-1 text-center text-[10px] leading-relaxed text-slate-400">
            Accounts are stored in this browser. For production use, connect a trusted server-side identity provider.
          </p>
        </form>
      </section>
    </div>
  );
};
