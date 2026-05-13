import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';

export type AuthUser = {
  name: string;
  email: string;
  password: string;
};

const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';
const SESSION_KEY = 'wallettrack-session-user';
const USERS_KEY = 'wallettrack-users';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readUsers = (): AuthUser[] => {
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

const getUserStorageKey = (field: string, email: string) => {
  const emailKey = normalizeEmail(email).replace(/[^a-z0-9]+/g, '-');
  return `wallettrack-${field}-${emailKey}`;
};

const migrateUserStorage = (previousEmail: string, nextEmail: string) => {
  const fields = ['transactions', 'darkmode', 'role'];

  fields.forEach((field) => {
    const previousKey = getUserStorageKey(field, previousEmail);
    const nextKey = getUserStorageKey(field, nextEmail);
    const storedValue = localStorage.getItem(previousKey);

    if (storedValue !== null) {
      localStorage.setItem(nextKey, storedValue);
      localStorage.removeItem(previousKey);
    }
  });
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);

    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    setIsReady(true);
  }, []);

  const handleAuthSuccess = (user: AuthUser) => {
    const normalizedUser = {
      ...user,
      email: normalizeEmail(user.email),
    };

    setCurrentUser(normalizedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedUser));
  };

  const handleProfileUpdate = (updatedUser: AuthUser, previousEmail: string) => {
    const normalizedPreviousEmail = normalizeEmail(previousEmail);
    const normalizedNextEmail = normalizeEmail(updatedUser.email);

    if (normalizedNextEmail === ADMIN_EMAIL && normalizedPreviousEmail !== ADMIN_EMAIL) {
      return 'Admin access is restricted to yagneshwarchinni@gmail.com.';
    }

    const users = readUsers();
    const emailTaken = users.some(
      (user) => user.email === normalizedNextEmail && user.email !== normalizedPreviousEmail
    );

    if (emailTaken) {
      return 'That email is already in use.';
    }

    const normalizedUser = {
      ...updatedUser,
      email: normalizedNextEmail,
    };

    const nextUsers = users.some((user) => user.email === normalizedPreviousEmail)
      ? users.map((user) => (user.email === normalizedPreviousEmail ? normalizedUser : user))
      : [...users, normalizedUser];

    saveUsers(nextUsers);

    if (normalizedPreviousEmail !== normalizedNextEmail) {
      migrateUserStorage(normalizedPreviousEmail, normalizedNextEmail);
    }

    setCurrentUser(normalizedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedUser));

    return null;
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
          <p className="text-sm text-white/70">Loading WalletTrack...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Dashboard
      key={currentUser.email}
      currentUser={currentUser}
      onSignOut={handleSignOut}
      onUpdateProfile={handleProfileUpdate}
    />
  );
}