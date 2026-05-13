import { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import type { AuthUser } from '../App';

const USERS_KEY = 'wallettrack-users';

const readUsers = (): any[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
};

const saveUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export default function UsersModal({
  isOpen,
  onClose,
  onChange,
  pageMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  onChange?: () => void;
  pageMode?: boolean;
}) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) setUsers(readUsers());
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDisabled = (email: string) => {
    const next = users.map(u => u.email === email ? { ...u, disabled: !u.disabled } : u);
    setUsers(next);
    saveUsers(next);
    onChange?.();
  };

  const content = (
    <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manage Users</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><X className="w-4 h-4"/></button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-auto">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users</p>
          ) : users.map((u) => (
            <div key={u.email} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-600 text-white h-9 w-9 flex items-center justify-center font-semibold">{u.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-sm ${u.disabled ? 'text-red-600' : 'text-green-600'}`}>{u.disabled ? 'Disabled' : 'Active'}</div>
                <button onClick={() => toggleDisabled(u.email)} className={`px-3 py-1 rounded ${u.disabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {u.disabled ? 'Enable' : 'Disable'}
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );

  if (pageMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      {content}
    </div>
  );
}
