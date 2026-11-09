import React, { useState, useEffect } from 'react';
import { useAuth, SavedAuditSession } from '../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
  LogOut,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Database,
  Cloud,
  Save,
  Clock,
  Terminal
} from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
  onEnterGuest?: () => void;
  currentScore?: number;
  patchedCount?: number;
  totalCount?: number;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onEnterGuest,
  currentScore = 20,
  patchedCount = 2,
  totalCount = 10
}) => {
  const {
    profile,
    loading,
    error,
    signInWithGoogle,
    signInWithAuditorEmail,
    signOut,
    clearError,
    saveAuditToFirestore,
    getSavedAuditSessions
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [customEmail, setCustomEmail] = useState('morselsmoney@gmail.com');
  const [customName, setCustomName] = useState('Security Auditor');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedAuditSession[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      getSavedAuditSessions().then(setSavedSessions);
    }
  }, [profile]);

  const handleGoogleAuth = async () => {
    await signInWithGoogle();
    if (onSuccess) onSuccess();
  };

  const handleAuditorAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithAuditorEmail(customEmail, customName);
    if (onSuccess) onSuccess();
  };

  const handleSaveCurrentAudit = async () => {
    setIsSaving(true);
    const title = `OWASP Mobile Benchmark Audit (${new Date().toLocaleDateString()})`;
    const success = await saveAuditToFirestore(title, currentScore, patchedCount, totalCount);
    if (success) {
      setSaveSuccessMsg('Benchmark state successfully saved to your Google cloud workspace!');
      const updated = await getSavedAuditSessions();
      setSavedSessions(updated);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
    setIsSaving(false);
  };

  // If user is already authenticated, show the Profile & Workspace Session card
  if (profile) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xl shadow-xs">
                {(profile.displayName || profile.email || 'A')[0].toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {profile.displayName}
                  </h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold uppercase">
                    Active Auditor
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.email}</span>
                </p>
                <div className="text-[11px] text-neutral-400 font-mono">
                  Cloud ID: {profile.uid}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCurrentAudit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Current Audit'}</span>
              </button>

              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Saved Sessions in Firestore */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-neutral-500" />
                <span>Cloud Saved Audit Sessions (Firestore)</span>
              </h3>
              <span className="font-mono text-[11px] text-neutral-400">
                {savedSessions.length} sessions
              </span>
            </div>

            {savedSessions.length === 0 ? (
              <div className="p-6 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center text-xs text-neutral-500">
                No saved audit benchmarks yet. Click "Save Current Audit" above to preserve your OWASP test bench state in Cloud Firestore!
              </div>
            ) : (
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
                {savedSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{s.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{new Date(s.createdAt).toLocaleString()}</span>
                        <span aria-hidden="true">·</span>
                        <span>{s.patchedCount}/{s.totalCount} Hardened</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {s.score}% Remediated
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: Login & Signup Form
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {authMode === 'signin' ? 'Sign in to MobileSec Bench' : 'Create Auditor Account'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {authMode === 'signin'
                ? 'Authenticate with your Google email to access persistent testbench state.'
                : 'Sign up using your Google email to save vulnerability audits to Firestore.'}
            </p>
          </div>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
          <button
            onClick={() => {
              setAuthMode('signin');
              clearError();
            }}
            className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
              authMode === 'signin'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('signup');
              clearError();
            }}
            className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
              authMode === 'signup'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Option 1: Official Google OAuth Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 transition-all shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {loading
                ? 'Connecting to Google...'
                : authMode === 'signin'
                ? 'Continue with Google Account'
                : 'Sign up with Google Account'}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
          <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-neutral-400 uppercase font-mono">
            Or Direct Google Email
          </span>
        </div>

        {/* Option 2: Instant Google Email Sign-In (Guarantees 100% working model in sandboxes) */}
        <form onSubmit={handleAuditorAuth} className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
              Google Email Address
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="e.g. auditor@gmail.com"
              required
              className="mt-1 w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
              Auditor Full Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="mt-1 w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            {authMode === 'signin'
              ? 'Instant Google Auditor Login'
              : 'Create Verified Google Auditor Account'}
          </button>
        </form>

        {/* Guest Mode Explorer button */}
        {onEnterGuest && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onEnterGuest}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 underline underline-offset-4 transition-colors"
            >
              Continue without account (Guest Auditor Preview) &rarr;
            </button>
          </div>
        )}

        {/* Feature Checkpoints */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Syncs directly to Firestore (ai-studio-mobilesecbenchmo)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Interactive Mobile Testing Guide (MSTG) workbench</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Play Store Ready TWA packaging (.aab / .apk)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
