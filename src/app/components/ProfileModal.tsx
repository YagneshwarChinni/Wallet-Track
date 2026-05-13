import { useEffect, useState, type FormEvent } from 'react';
import { UserRound, Mail, LockKeyhole, Shield, X } from 'lucide-react';
import type { AuthUser } from '../App';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: AuthUser, previousEmail: string) => string | null;
  currentUser: AuthUser;
  darkMode: boolean;
  canAccessAdmin: boolean;
  pageMode?: boolean;
};

const ADMIN_EMAIL = 'yagneshwarchinni@gmail.com';

export default function ProfileModal({
  isOpen,
  onClose,
  onSave,
  currentUser,
  darkMode,
  canAccessAdmin,
  pageMode,
}: ProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const hasAccountChanges =
    name.trim() !== currentUser.name || email.trim().toLowerCase() !== currentUser.email.toLowerCase() || newPassword.length > 0;

  const isAdminEmail = currentUser.email.toLowerCase() === ADMIN_EMAIL;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    if (!normalizedEmail) {
      setError('Email is required.');
      return;
    }

    const passwordChangeRequested = trimmedNewPassword.length > 0;
    const emailChangeRequested = normalizedEmail !== currentUser.email.toLowerCase();

    if ((emailChangeRequested || passwordChangeRequested) && trimmedCurrentPassword !== currentUser.password) {
      setError('Enter your current password to confirm this change.');
      return;
    }

    if (passwordChangeRequested) {
      if (trimmedNewPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }

      if (trimmedNewPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
    }

    const updatedUser: AuthUser = {
      name: trimmedName,
      email: normalizedEmail,
      password: passwordChangeRequested ? trimmedNewPassword : currentUser.password,
    };

    const result = onSave(updatedUser, currentUser.email);

    if (result) {
      setError(result);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const content = (
    <div
      className={`w-full max-w-xl rounded-[1.75rem] border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} shadow-2xl`}
      onClick={(event) => event.stopPropagation()}
    >
        <div className={`flex items-start justify-between border-b p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <p className={`text-xs uppercase tracking-[0.24em] ${darkMode ? 'text-cyan-300/70' : 'text-blue-600/70'}`}>
              Profile
            </p>
            <h3 className={`mt-1 text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Your account details
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-2 ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} transition-colors`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`rounded-2xl border p-4 ${darkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-semibold text-white">
                {currentUser.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-lg font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser.name}</p>
                <p className={`truncate text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentUser.email}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-cyan-400/15 text-cyan-500">
                <Shield className="h-3.5 w-3.5" />
                {isAdminEmail ? 'Admin account' : canAccessAdmin ? 'Admin access' : 'Viewer'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <UserRound className="h-4 w-4 text-blue-600" />
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                }`}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <Mail className="h-4 w-4 text-blue-600" />
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                }`}
                placeholder="you@example.com"
              />
              <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Admin access is reserved for {ADMIN_EMAIL}.
              </p>
            </div>

            <div>
              <label className={`mb-2 flex items-center gap-2 text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <LockKeyhole className="h-4 w-4 text-blue-600" />
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                }`}
                placeholder="Required for email or password changes"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
                    darkMode
                      ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                  }`}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
                    darkMode
                      ? 'border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500'
                      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'
                  }`}
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {!hasAccountChanges && (
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Change at least one field to update your profile.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-2xl border px-4 py-3 font-medium transition-colors ${
                  darkMode
                    ? 'border-gray-700 text-gray-200 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Save profile
              </button>
            </div>
          </form>
        </div>
    </div>
  );

  if (pageMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      {content}
    </div>
  );
}