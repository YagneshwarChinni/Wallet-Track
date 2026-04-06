import { X, Command } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose, darkMode }: any) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['⌘', 'N'], description: 'Add new transaction', windows: 'Ctrl + N' },
    { keys: ['⌘', 'D'], description: 'Toggle dark mode', windows: 'Ctrl + D' },
    { keys: ['⌘', 'E'], description: 'Export as JSON', windows: 'Ctrl + E' },
    { keys: ['⌘', '⇧', 'E'], description: 'Export as CSV', windows: 'Ctrl + Shift + E' },
    { keys: ['⌘', 'K'], description: 'Focus search', windows: 'Ctrl + K' },
    { keys: ['ESC'], description: 'Close modals', windows: 'ESC' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl max-w-md w-full p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Command className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        darkMode
                          ? 'bg-gray-600 text-gray-200 border border-gray-500'
                          : 'bg-white text-gray-700 border border-gray-300 shadow-sm'
                      }`}
                    >
                      {key}
                    </kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className={`mx-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            On Windows/Linux, use <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd> instead of <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">⌘</kbd>
          </p>
        </div>
      </div>
    </div>
  );
}
