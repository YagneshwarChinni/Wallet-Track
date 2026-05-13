import { Shield, Eye } from 'lucide-react';

export default function RoleSwitcher({ role, setRole, darkMode, canAccessAdmin }: any) {
  return (
    <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-lg p-1 border`}>
      <div className="flex gap-1">
        <button
          onClick={() => setRole('Viewer')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            role === 'Viewer'
              ? 'bg-white text-gray-900 shadow-sm'
              : darkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          Viewer
        </button>
        <button
          onClick={() => {
            if (canAccessAdmin) {
              setRole('Admin');
            }
          }}
          disabled={!canAccessAdmin}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            canAccessAdmin
              ? role === 'Admin'
                ? 'bg-white text-gray-900 shadow-sm'
                : darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              : darkMode
                ? 'text-gray-500 opacity-60 cursor-not-allowed'
                : 'text-gray-400 opacity-60 cursor-not-allowed'
          }`}
          title={canAccessAdmin ? 'Admin access' : 'Admin access is restricted'}
        >
          <Shield className="w-4 h-4" />
          {canAccessAdmin ? 'Admin' : 'Locked'}
        </button>
      </div>
    </div>
  );
}
