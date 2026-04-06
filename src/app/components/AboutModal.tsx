import { X } from 'lucide-react';
import { getBuildInfo } from './nani/BuildInfo';

export default function AboutModal({ isOpen, onClose, darkMode }: any) {
  if (!isOpen) return null;

  const buildInfo = getBuildInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-2xl max-w-lg w-full p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-blue-600">Wallet</span>Track
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Personal Finance Manager
            </p>
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

        {/* Content */}
        <div className="space-y-6">
          {/* Version Info */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Version</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {buildInfo.version}
                </p>
              </div>
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Build</p>
                <p className={`font-mono text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {buildInfo.buildNumber}
                </p>
              </div>
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Release Date</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {buildInfo.buildDate}
                </p>
              </div>
              <div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Environment</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                  {buildInfo.environment}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              WalletTrack is a comprehensive personal finance management tool designed to help you
              track expenses, analyze spending patterns, and gain insights into your financial health.
              Built with modern web technologies and a focus on user experience.
            </p>
          </div>

          {/* Company Info */}
          <div className={`pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Developed by <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nani Technologies</span>
            </p>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2024-2026 Nani Technologies. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 pt-2">
            <a
              href="#"
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              Documentation
            </a>
            <a
              href="#"
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              Release Notes
            </a>
            <a
              href="#"
              className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
