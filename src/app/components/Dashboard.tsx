import { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import Charts from './Charts';
import Transactions from './Transactions';
import Insights from './Insights';
import RoleSwitcher from './RoleSwitcher';
import AddTransactionModal from './AddTransactionModal';
import ProfileModal from './ProfileModal';
import UsersModal from './UsersModal';
import Toast from './Toast';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import AboutModal from './AboutModal';
import { Plus, Download, Keyboard, Search, Users, RefreshCw, Mail, Shield } from 'lucide-react';
import { useKeyboardShortcuts } from './nani/useKeyboardShortcuts';
import { getFormattedVersion } from './nani/BuildInfo';
import type { AppPage, AuthUser } from '../App';

const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';
const USERS_KEY = 'wallettrack-users';

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

const formatDateTime = (value?: string) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

type DashboardProps = {
  currentUser: AuthUser;
  onSignOut: () => void;
  onUpdateProfile: (updatedUser: AuthUser, previousEmail: string) => string | null;
  page: AppPage;
  onNavigate: (page: AppPage) => void;
};

export default function Dashboard({ currentUser, onSignOut, onUpdateProfile, page, onNavigate }: DashboardProps) {
  const canAccessAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL;
  const getUserStorageKey = (field: string) => {
    const emailKey = currentUser.email.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `wallettrack-${field}-${emailKey}`;
  };

  const readStoredTransactions = () => {
    const saved = localStorage.getItem(getUserStorageKey('transactions'));

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }

    const legacySaved = localStorage.getItem('wallettrack-transactions');

    if (legacySaved) {
      try {
        return JSON.parse(legacySaved);
      } catch {
        return [];
      }
    }

    return [];
  };

  const readStoredPreference = (field: string, fallback: string) => {
    return localStorage.getItem(getUserStorageKey(field)) ?? localStorage.getItem(`wallettrack-${field}`) ?? fallback;
  };

  const [transactions, setTransactions] = useState(readStoredTransactions);
  const [role, setRole] = useState(() => (canAccessAdmin ? readStoredPreference('role', 'Admin') : 'Viewer'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => readStoredPreference('darkmode', 'false') === 'true');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AuthUser[]>(() => (canAccessAdmin ? readUsers() : []));
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('All Roles');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All Status');

  // Handler functions (defined before useKeyboardShortcuts to avoid initialization errors)
  const handleAddTransaction = (newTransaction: any) => {
    const transaction = {
      ...newTransaction,
      id: Date.now(),
      amount: newTransaction.type === 'Expense' ? -Math.abs(newTransaction.amount) : Math.abs(newTransaction.amount)
    };
    setTransactions((previousTransactions) => [transaction, ...previousTransactions]);
    setIsModalOpen(false);
    setToast({ message: 'Transaction added successfully!', type: 'success' });
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((previousTransactions) => previousTransactions.filter((t: any) => t.id !== id));
    setToast({ message: 'Transaction deleted successfully!', type: 'success' });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Exported as JSON successfully!', type: 'success' });
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const csvData = transactions.map((t: any) => [
      t.date,
      t.type,
      t.category,
      t.description,
      t.amount
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map((row: any) => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Exported as CSV successfully!', type: 'success' });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all transaction data? This cannot be undone.')) {
      const currentTransactionsKey = getUserStorageKey('transactions');

      setTransactions([]);
      localStorage.removeItem(currentTransactionsKey);
      localStorage.removeItem('wallettrack-transactions');
      setToast({ message: 'All transaction data cleared!', type: 'success' });
    }
  };

  useEffect(() => {
    if (!canAccessAdmin && role !== 'Viewer') {
      setRole('Viewer');
    }
  }, [canAccessAdmin, role]);

  useEffect(() => {
    if (canAccessAdmin) {
      setAdminUsers(readUsers());
    } else {
      setAdminUsers([]);
    }
  }, [canAccessAdmin, currentUser.email]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTransaction: () => {
      if (!isModalOpen) {
        setIsModalOpen(true);
      }
    },
    onToggleTheme: () => setDarkMode(!darkMode),
    onExportJSON: handleExportJSON,
    onExportCSV: handleExportCSV,
    onSearch: () => {
      // Focus search input if exists
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
  });

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(getUserStorageKey('transactions'), JSON.stringify(transactions));
  }, [transactions]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem(getUserStorageKey('darkmode'), JSON.stringify(darkMode));
  }, [darkMode]);

  // Save role preference
  useEffect(() => {
    localStorage.setItem(getUserStorageKey('role'), role);
  }, [role]);

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const totalBalance = totalIncome - totalExpenses;
  const adminActiveUsers = adminUsers.filter((user) => !user.disabled);
  const filteredAdminUsers = adminUsers.filter((user) => {
    const searchValue = adminSearch.trim().toLowerCase();
    const matchesSearch =
      !searchValue ||
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);
    const matchesRole =
      adminRoleFilter === 'All Roles' ||
      (adminRoleFilter === 'Admin' && user.email.toLowerCase() === ADMIN_EMAIL) ||
      (adminRoleFilter === 'User' && user.email.toLowerCase() !== ADMIN_EMAIL);
    const matchesStatus =
      adminStatusFilter === 'All Status' ||
      (adminStatusFilter === 'Active' && !user.disabled) ||
      (adminStatusFilter === 'Disabled' && Boolean(user.disabled));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const refreshAdminUsers = () => {
    setAdminUsers(readUsers());
    setToast({ message: 'User directory refreshed.', type: 'success' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const backButton = (
    <button
      onClick={() => onNavigate('overview')}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        darkMode
          ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      Back to Overview
    </button>
  );

  if (page === 'transactions') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                Transactions
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Transaction Page
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Browse and manage your transaction history on its own page.
              </p>
            </div>
            {backButton}
          </div>

          <Transactions
            transactions={transactions}
            darkMode={darkMode}
            onDelete={handleDeleteTransaction}
            isAdmin={canAccessAdmin && role === 'Admin'}
          />
        </div>
      </div>
    );
  }

  if (page === 'analytics') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                Analytics
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Analytics Page
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View your balance, chart, and insights without leaving this page.
              </p>
            </div>
            {backButton}
          </div>

          <SummaryCards totalBalance={totalBalance} totalIncome={totalIncome} totalExpenses={totalExpenses} darkMode={darkMode} />
          <Charts transactions={transactions} darkMode={darkMode} />
          <Insights transactions={transactions} darkMode={darkMode} />
        </div>
      </div>
    );
  }

  if (page === 'profile') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                Profile
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Profile Page
              </h1>
            </div>
            {backButton}
          </div>

          <ProfileModal
            isOpen={true}
            onClose={() => onNavigate('overview')}
            onSave={onUpdateProfile}
            currentUser={currentUser}
            darkMode={darkMode}
            canAccessAdmin={canAccessAdmin}
            pageMode
          />
        </div>
      </div>
    );
  }

  if (page === 'add-transaction') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                Add Transaction
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Add Transaction Page
              </h1>
            </div>
            {backButton}
          </div>

          <AddTransactionModal
            isOpen={true}
            onClose={() => onNavigate('overview')}
            onAdd={handleAddTransaction}
            darkMode={darkMode}
            pageMode
          />
        </div>
      </div>
    );
  }

  if (page === 'shortcuts') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                Shortcuts
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Keyboard Shortcuts
              </h1>
            </div>
            {backButton}
          </div>

          <KeyboardShortcutsModal isOpen={true} onClose={() => onNavigate('overview')} darkMode={darkMode} pageMode />
        </div>
      </div>
    );
  }

  if (page === 'about') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                About
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                About Page
              </h1>
            </div>
            {backButton}
          </div>

          <AboutModal isOpen={true} onClose={() => onNavigate('overview')} darkMode={darkMode} pageMode />
        </div>
      </div>
    );
  }

  if (page === 'users' || page === 'admin') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
                Admin
              </p>
              <h1 className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {page === 'users' ? 'Users Page' : 'Admin Dashboard'}
              </h1>
              <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage accounts and access from a dedicated screen.
              </p>
            </div>
            {backButton}
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className={`rounded-[1.5rem] border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-5`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</p>
              <p className={`mt-2 text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{adminUsers.length}</p>
            </div>
            <div className={`rounded-[1.5rem] border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-5`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Admin Access</p>
              <p className={`mt-2 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser.email}</p>
            </div>
            <div className={`rounded-[1.5rem] border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-5`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Refresh Users</p>
              <button onClick={refreshAdminUsers} className="mt-3 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white">Refresh</button>
            </div>
          </div>

          <UsersModal isOpen={true} onClose={() => onNavigate('overview')} onChange={refreshAdminUsers} pageMode />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-colors duration-300 hidden lg:block z-40`}>
        <div className="p-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-blue-600">Wallet</span>Track
          </h1>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Personal Finance Manager
          </p>
        </div>

        <div className="px-6 pb-2">
          <div className={`${darkMode ? 'bg-gray-700/70 text-gray-100' : 'bg-gray-100 text-gray-700'} rounded-xl px-4 py-3`}>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Signed in as</p>
            <p className="mt-1 text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs opacity-75 truncate">{currentUser.email}</p>
            <button
              onClick={() => onNavigate('profile')}
              className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Profile
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          <button
            onClick={() => onNavigate('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${page === 'overview' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')} font-medium`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${page === 'transactions' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')} transition-colors font-medium`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Transactions
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${page === 'analytics' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600') : (darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')} transition-colors font-medium`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-4">
          <div className={`text-xs text-center pb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {getFormattedVersion()}
          </div>

          <button
            onClick={() => onNavigate('shortcuts')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} transition-colors text-sm`}
            title="Open keyboard shortcuts page"
          >
            <Keyboard className="w-4 h-4" />
            <span>Shortcuts</span>
          </button>

          <RoleSwitcher role={role} setRole={setRole} darkMode={darkMode} canAccessAdmin={canAccessAdmin} />

          <button
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} transition-colors text-sm`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-13v1m0 8v1m0 4h-3m3-4h-3m3-4h-3" />
            </svg>
            <span>Sign out</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} transition-colors text-sm`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Profile Page</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`lg:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between sticky top-0 z-30`}>
        <div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-blue-600">Wallet</span>Track
          </h1>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleSwitcher role={role} setRole={setRole} darkMode={darkMode} canAccessAdmin={canAccessAdmin} />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onSignOut}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
            title="Sign out"
          >
            ⎋
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
            title="Profile"
          >
            👤
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        {canAccessAdmin && (
          <section className="mb-8 space-y-6 rounded-[2rem] border border-cyan-500/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_34%),linear-gradient(180deg,_rgba(15,23,42,0.96)_0%,_rgba(15,23,42,0.82)_100%)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.34)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-200">
                  <Shield className="h-3.5 w-3.5" />
                  Admin board
                </div>
                <h3 className="mt-4 text-3xl font-semibold text-white">Admin Dashboard</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Review local users, track account access, and manage the workspace from a dedicated admin view.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('users')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Manage Users
                </button>
                <button
                  onClick={refreshAdminUsers}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/15 px-4 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Users
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Total Users</p>
                    <p className="mt-2 text-4xl font-semibold text-white">{adminUsers.length}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-400">Admin Access</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-white">{currentUser.email}</p>
                    <p className="text-sm text-slate-400">Administrator account</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm text-slate-400">Refresh Users</p>
                <p className="mt-3 text-base font-medium text-white">Sync latest profile rows</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={refreshAdminUsers}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={() => onNavigate('users')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
                  >
                    Open Board
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={adminSearch}
                  onChange={(event) => setAdminSearch(event.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <select
                value={adminRoleFilter}
                onChange={(event) => setAdminRoleFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              >
                <option value="All Roles">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>

              <select
                value={adminStatusFilter}
                onChange={(event) => setAdminStatusFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/60">
              <div className="border-b border-white/10 px-5 py-4">
                <h4 className="text-lg font-semibold text-white">Users</h4>
              </div>

              <div className="overflow-x-auto">
                {filteredAdminUsers.length === 0 ? (
                  <div className="px-5 py-16 text-center text-sm text-slate-400">
                    No users match the current filters.
                  </div>
                ) : (
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-medium">Name</th>
                        <th className="px-5 py-4 font-medium">Email</th>
                        <th className="px-5 py-4 font-medium">Provider</th>
                        <th className="px-5 py-4 font-medium">Role</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Created</th>
                        <th className="px-5 py-4 font-medium">Last Sign In</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-200">
                      {filteredAdminUsers.map((user) => {
                        const isAdminUser = user.email.toLowerCase() === ADMIN_EMAIL;

                        return (
                          <tr key={user.email} className="transition-colors hover:bg-white/5">
                            <td className="px-5 py-4 font-medium text-white">{user.name}</td>
                            <td className="px-5 py-4 text-slate-300">{user.email}</td>
                            <td className="px-5 py-4 text-slate-300">{user.provider ?? 'Email'}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${isAdminUser ? 'bg-cyan-400/15 text-cyan-200' : 'bg-white/10 text-slate-200'}`}>
                                {isAdminUser ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${user.disabled ? 'bg-red-400/15 text-red-200' : 'bg-emerald-400/15 text-emerald-200'}`}>
                                {user.disabled ? 'Disabled' : 'Active'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-300">{formatDateTime(user.createdAt)}</td>
                            <td className="px-5 py-4 text-slate-300">{formatDateTime(user.lastSignInAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400">
                <span>
                  Showing {filteredAdminUsers.length} of {adminUsers.length} users
                </span>
                <span>{adminActiveUsers.length} active accounts</span>
              </div>
            </div>
          </section>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {canAccessAdmin ? 'Overview' : 'Dashboard'}
            </h2>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {canAccessAdmin ? `Administrator: ${currentUser.email}` : 'Your complete financial overview at a glance'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Profile
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <Download className="w-5 h-5" />
                Export
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 ${
                darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <button
                  onClick={handleExportJSON}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  } rounded-t-lg transition-colors`}
                >
                  Export as JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  Export as CSV
                </button>
                {role === 'Admin' && (
                  <button
                    onClick={handleResetData}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-50'
                    } rounded-b-lg transition-colors border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    Clear All Data
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate('add-transaction')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Transaction Page
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          darkMode={darkMode}
        />

        {/* Charts */}
        <Charts transactions={transactions} darkMode={darkMode} />

        {/* Insights */}
        <Insights transactions={transactions} darkMode={darkMode} />

        {/* Transactions */}
        <Transactions
          transactions={transactions}
          darkMode={darkMode}
          onDelete={handleDeleteTransaction}
          isAdmin={canAccessAdmin && role === 'Admin'}
        />

        {/* Footer */}
        <div className={`mt-12 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2026 WalletTrack. All rights reserved.
              </p>
              <button
                onClick={() => onNavigate('about')}
                className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'} transition-colors`}
              >
                About
              </button>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Privacy Policy
              </a>
              <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Terms of Service
              </a>
              <a href="#" className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Support
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTransaction}
          darkMode={darkMode}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          darkMode={darkMode}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        darkMode={darkMode}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        darkMode={darkMode}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onSave={onUpdateProfile}
        currentUser={currentUser}
        darkMode={darkMode}
        canAccessAdmin={canAccessAdmin}
      />
      <UsersModal isOpen={usersOpen} onClose={() => setUsersOpen(false)} onChange={refreshAdminUsers} />
    </div>
  );
}