import { useEffect } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, darkMode }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;
  const bgColor = type === 'success'
    ? 'bg-green-600'
    : 'bg-red-600';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]`}>
        {icon}
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
