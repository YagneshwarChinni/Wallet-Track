import { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import Charts from './Charts';
import Transactions from './Transactions';
import Insights from './Insights';
import RoleSwitcher from './RoleSwitcher';
import AddTransactionModal from './AddTransactionModal';
import ProfileModal from './ProfileModal';
import Toast from './Toast';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import AboutModal from './AboutModal';
import { Plus, Download, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from './nani/useKeyboardShortcuts';
import { getFormattedVersion } from './nani/BuildInfo';
import type { AuthUser } from '../App';

const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';

// Mock transaction data
export const initialTransactions = [
  { id: 1, date: '2026-04-05', amount: 3200, category: 'Salary', type: 'Income', description: 'Monthly salary' },
  { id: 2, date: '2026-04-04', amount: -85, category: 'Groceries', type: 'Expense', description: 'Weekly groceries' },
  { id: 3, date: '2026-04-03', amount: -1200, category: 'Rent', type: 'Expense', description: 'Monthly rent' },
  { id: 4, date: '2026-04-02', amount: -45, category: 'Transportation', type: 'Expense', description: 'Gas' },
  { id: 5, date: '2026-04-01', amount: -120, category: 'Entertainment', type: 'Expense', description: 'Movie tickets & dinner' },
  { id: 6, date: '2026-03-30', amount: 500, category: 'Freelance', type: 'Income', description: 'Design project' },
  { id: 7, date: '2026-03-28', amount: -65, category: 'Utilities', type: 'Expense', description: 'Internet bill' },
  { id: 8, date: '2026-03-25', amount: -200, category: 'Shopping', type: 'Expense', description: 'Clothes' },
  { id: 9, date: '2026-03-20', amount: 3200, category: 'Salary', type: 'Income', description: 'Monthly salary' },
  { id: 10, date: '2026-03-18', amount: -90, category: 'Groceries', type: 'Expense', description: 'Weekly groceries' },
  { id: 11, date: '2026-03-15', amount: -150, category: 'Healthcare', type: 'Expense', description: 'Doctor visit' },
  { id: 12, date: '2026-03-10', amount: -55, category: 'Transportation', type: 'Expense', description: 'Gas' },
  { id: 13, date: '2026-03-05', amount: 3200, category: 'Salary', type: 'Income', description: 'Monthly salary' },
  { id: 14, date: '2026-03-03', amount: -1200, category: 'Rent', type: 'Expense', description: 'Monthly rent' },
  { id: 15, date: '2026-02-28', amount: -80, category: 'Entertainment', type: 'Expense', description: 'Concert tickets' },
];

type DashboardProps = {
  currentUser: AuthUser;
  onSignOut: () => void;
  onUpdateProfile: (updatedUser: AuthUser, previousEmail: string) => string | null;
};

export default function Dashboard({ currentUser, onSignOut, onUpdateProfile }: DashboardProps) {
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
  const [darkMode, setDarkMode] = useState(() => readStoredPreference('darkmode', 'false') === 'true');
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
    if (window.confirm('Are you sure you want to reset all data? This will restore the demo transactions.')) {
      setTransactions(initialTransactions);
      setToast({ message: 'Data reset to demo transactions!', type: 'success' });
    }
  };

  useEffect(() => {
    if (!canAccessAdmin && role !== 'Viewer') {
      setRole('Viewer');
    }
  }, [canAccessAdmin, role]);

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
              onClick={() => setShowProfile(true)}
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
          <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} font-medium`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </a>
          <a href="#transactions" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} transition-colors font-medium`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Transactions
          </a>
          <a href="#insights" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} transition-colors font-medium`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-4">
          <div className={`text-xs text-center pb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {getFormattedVersion()}
          </div>

          <button
            onClick={() => setShowShortcuts(true)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} transition-colors text-sm`}
            title="View keyboard shortcuts"
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
            onClick={() => setShowProfile(true)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
            title="Profile"
          >
            👤
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h2>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your complete financial overview at a glance
            </p>
          </div>

          <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfile(true)}
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
                    Reset Demo Data
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
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
                onClick={() => setShowAbout(true)}
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
    </div>
  );
}