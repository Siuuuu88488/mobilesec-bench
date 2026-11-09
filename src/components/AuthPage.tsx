import React, { useState, useEffect } from 'react';
import { useAuth, SavedAuditSession } from '../context/AuthContext';
import {
  ShieldAlert,
  CheckCircle2,
  Mail,
  LogOut,
  AlertCircle,
  Database,
  Save,
  Clock,
  BookOpen
} from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
  onEnterGuest?: () => void;
  onOpenReadme?: () => void;
  onSignOut?: () => void;
  currentScore?: number;
  patchedCount?: number;
  totalCount?: number;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onEnterGuest,
  onOpenReadme,
  onSignOut,
  currentScore = 20,
  patchedCount = 2,
  totalCount = 10
}) => {
  const {
    profile,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearError,
    saveAuditToFirestore,
    getSavedAuditSessions
  } = useAuth();

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedAuditSession[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      getSavedAuditSessions().then(setSavedSessions);
    }
  }, [profile]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    if (onSuccess && profile) {
      onSuccess();
    }
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

  // Authenticated View
  if (profile) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xl shadow-xs">
                  {(profile.displayName || profile.email || 'A')[0].toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {profile.displayName}
                  </h2>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-semibold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Google Authenticated</span>
                  </span>
                </div>
                {profile.email && (
                  <p className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{profile.email}</span>
                  </p>
                )}
                <div className="text-[11px] text-neutral-400 font-mono">
                  Cloud UID: {profile.uid}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCurrentAudit}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Current Audit'}</span>
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  onSignOut?.();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
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

  // Not authenticated: Clean Google Sign In
  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 space-y-5">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Sign in with Google
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Authenticate using your Google account to sync OWASP security audit benchmarks and persistent sandbox state to Cloud Firestore.
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-xs text-rose-600 hover:text-rose-900 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Google Authentication Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Guest Mode Explorer & README links */}
        <div className="pt-2 flex flex-col items-center gap-2.5">
          {onEnterGuest && (
            <button
              type="button"
              onClick={onEnterGuest}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Continue without account (Guest Auditor Preview) &rarr;
            </button>
          )}

          {onOpenReadme && (
            <button
              type="button"
              onClick={onOpenReadme}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4 font-medium transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>How to install & run on Android or Desktop (README) &rarr;</span>
            </button>
          )}
        </div>

        {/* Feature Checkpoints */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Secure Google Sign-In with Firebase Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Real-time persistence in Cloud Firestore (ai-studio-mobilesecbenchmo)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>OWASP Mobile Top 10 interactive testbench & TWA packaging</span>
          </div>
        </div>
      </div>
    </div>
  );
};
