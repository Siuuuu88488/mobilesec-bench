import React from 'react';
import { ShieldAlert, Sun, Moon, Play, RefreshCw, User, LogIn, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'bench' | 'device' | 'filesystem' | 'network' | 'manifest' | 'terminal' | 'report' | 'auth' | 'playstore' | 'scanner';
  setActiveTab: (tab: 'bench' | 'device' | 'filesystem' | 'network' | 'manifest' | 'terminal' | 'report' | 'auth' | 'playstore' | 'scanner') => void;
  isDark: boolean;
  toggleTheme: () => void;
  onRunAudit: () => void;
  onPatchAll: () => void;
  allPatched: boolean;
  isAuditing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleTheme,
  onRunAudit,
  onPatchAll,
  allPatched,
  isAuditing,
}) => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-neutral-950 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-950 font-semibold shadow-xs">
          <ShieldAlert className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
        </div>
        <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          MobileSec Bench
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'scanner'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Android Scanner
        </button>
        <button
          onClick={() => setActiveTab('bench')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'bench'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          OWASP Top 10 Lab
        </button>
        <button
          onClick={() => setActiveTab('device')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'device'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Device Simulator
        </button>
        <button
          onClick={() => setActiveTab('filesystem')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'filesystem'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Sandbox Storage
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'network'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Traffic Capture
        </button>
        <button
          onClick={() => setActiveTab('manifest')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'manifest'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Manifest Audit
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'terminal'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Security CLI
        </button>
        <button
          onClick={() => setActiveTab('playstore')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'playstore'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Play Store Ready
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeTab === 'report'
              ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
              : ''
          }`}
        >
          Compliance Report
        </button>
      </nav>

      {/* Zone 3: 1 primary action + theme toggle + PWA install + auth trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <PWAInstallButton />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Google Login Button */}
        {user ? (
          <button
            onClick={() => setActiveTab('auth')}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-xs font-medium text-neutral-800 dark:text-neutral-200"
            title={user.email || 'Auditor Profile'}
          >
            <span className="truncate max-w-[120px] hidden sm:inline">{user.displayName || user.email}</span>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('auth')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={onRunAudit}
          disabled={isAuditing}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-950 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Sandbox...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run Benchmark Audit</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
