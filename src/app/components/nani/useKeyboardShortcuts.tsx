import { useEffect } from 'react';

export function useKeyboardShortcuts(callbacks: {
  onNewTransaction?: () => void;
  onToggleTheme?: () => void;
  onExportJSON?: () => void;
  onExportCSV?: () => void;
  onSearch?: () => void;
}) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + N: New Transaction
      if (isCmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        callbacks.onNewTransaction?.();
      }

      // Cmd/Ctrl + D: Toggle Dark Mode
      if (isCmdOrCtrl && e.key === 'd') {
        e.preventDefault();
        callbacks.onToggleTheme?.();
      }

      // Cmd/Ctrl + E: Export JSON
      if (isCmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        callbacks.onExportJSON?.();
      }

      // Cmd/Ctrl + Shift + E: Export CSV
      if (isCmdOrCtrl && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        callbacks.onExportCSV?.();
      }

      // Cmd/Ctrl + K: Search (Focus search)
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        callbacks.onSearch?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [callbacks]);
}
