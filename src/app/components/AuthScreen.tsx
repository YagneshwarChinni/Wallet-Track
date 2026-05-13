import { useState, type FormEvent } from 'react';
import { ArrowRight, LockKeyhole, Mail, UserRound, WalletCards } from 'lucide-react';
import type { AuthUser } from '../App';

type AuthScreenProps = {
  onAuthSuccess: (user: AuthUser) => void;
};

const USERS_KEY = 'wallettrack-users';
const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readUsers = (): AuthUser[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedUsers = localStorage.getItem(USERS_KEY);

  if (!storedUsers) {
    return [];
  }

  try {
    return JSON.parse(storedUsers);
  } catch {
    return [];
  }
};

const saveUsers = (users: AuthUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const clearAllTransactionData = () => {
  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (key && key.includes('wallettrack-transactions')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('wallettrack-transactions');
};

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = normalizeEmail(email);
    const users = readUsers();

    if (isLogin) {
      const matchedUser = users.find((user) => user.email === normalizedEmail && user.password === password);

      if (!matchedUser) {
        setError('Invalid email or password.');
        return;
      }

      if ((matchedUser as any).disabled) {
        setError('This account has been disabled. Contact the administrator.');
        return;
      }

      onAuthSuccess(matchedUser);
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const existingUser = users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      setError('An account with this email already exists.');
      return;
    }

    const now = new Date().toISOString();

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      disabled: false,
      provider: 'Email',
      createdAt: now,
      lastSignInAt: now,
    } as any;

    saveUsers([...users, newUser]);
    clearAllTransactionData();

    // Open mail client to notify admin about the new signup
    try {
      const subject = encodeURIComponent('New WalletTrack signup');
      const body = encodeURIComponent(`A new user signed up:\n\nName: ${newUser.name}\nEmail: ${newUser.email}\n\nYou can manage users in the admin panel.`);
      window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;
    } catch (e) {
      // ignore
    }

    onAuthSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.22),_transparent_45%)]" />
            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 ring-1 ring-cyan-300/30">
                  <WalletCards className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">WalletTrack</p>
                  <h1 className="text-2xl font-semibold text-white">Track money with clarity</h1>
                </div>
              </div>

              <div className="max-w-lg space-y-5">
                <p className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
                  Sign in, add your expenses, and keep every transaction in one place.
                </p>
                <p className="text-base leading-7 text-slate-300">
                  Create a personal account, save your own dashboard locally, and record both income and expenses without leaving the app.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Secure login', 'Local account storage for this demo app'],
                ['Expense tracking', 'Add purchases, bills, and recurring costs'],
                ['Transaction history', 'Keep income and spending in one ledger'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-950/50 p-6 sm:p-10">
            <div className="mx-auto flex max-w-md flex-col justify-center">
              <div className="mb-8 lg:hidden">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 ring-1 ring-cyan-300/30">
                  <WalletCards className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-semibold text-white">WalletTrack</h1>
                <p className="mt-2 text-sm text-slate-400">Sign in to manage your expenses and transactions.</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Account access</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {isLogin ? 'Welcome back' : 'Create your account'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                        <UserRound className="h-4 w-4 text-cyan-300" />
                        Full name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Mail className="h-4 w-4 text-cyan-300" />
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                      <LockKeyhole className="h-4 w-4 text-cyan-300" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Repeat your password"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                        required={!isLogin}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-cyan-300"
                  >
                    {isLogin ? 'Sign in' : 'Create account'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>

                <p className="mt-6 text-center text-xs leading-6 text-slate-400">
                  This demo stores accounts and transactions locally in your browser.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}