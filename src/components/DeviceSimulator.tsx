import React, { useState } from 'react';
import { Vulnerability, DeviceLog } from '../types/security';
import {
  Smartphone,
  Fingerprint,
  Lock,
  Unlock,
  Send,
  CreditCard,
  FileText,
  Cloud,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  Wifi,
  Battery,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface DeviceSimulatorProps {
  vulnerabilities: Vulnerability[];
  onTogglePatch: (vulnId: string) => void;
  onInspectVuln: (vuln: Vulnerability) => void;
  deviceLogs: DeviceLog[];
  onAddLog: (log: Omit<DeviceLog, 'id' | 'timestamp'>) => void;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  vulnerabilities,
  onTogglePatch,
  onInspectVuln,
  deviceLogs,
  onAddLog,
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [activeApp, setActiveApp] = useState<'vaultpay' | 'notes' | 'clouddrive'>('vaultpay');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [transferAmount, setTransferAmount] = useState('250.00');
  const [transferRecipient, setTransferRecipient] = useState('emma.watson@pay.com');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);
  const [notesSearch, setNotesSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isExportedAdminOpen, setIsExportedAdminOpen] = useState(false);
  const [webViewExploitActive, setWebViewExploitActive] = useState(false);

  // Vulnerability states
  const isM1Patched = vulnerabilities.find((v) => v.id === 'vuln-m1-sharedprefs')?.status === 'patched';
  const isM2Patched = vulnerabilities.find((v) => v.id === 'vuln-m2-cleartext-tls')?.status === 'patched';
  const isM3Patched = vulnerabilities.find((v) => v.id === 'vuln-m3-biometric-bypass')?.status === 'patched';
  const isM5Patched = vulnerabilities.find((v) => v.id === 'vuln-m5-exported-activity')?.status === 'patched';
  const isM6SqlPatched = vulnerabilities.find((v) => v.id === 'vuln-m6-sqli-provider')?.status === 'patched';
  const isM6WvPatched = vulnerabilities.find((v) => v.id === 'vuln-m6-webview-jsinterface')?.status === 'patched';
  const isM8Patched = vulnerabilities.find((v) => v.id === 'vuln-m8-insecure-deeplink')?.status === 'patched';

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '9042') {
      setIsAuthenticated(true);
      onAddLog({
        level: isM1Patched ? 'I' : 'SEC',
        tag: 'VaultPayAuth',
        app: 'VaultPay',
        message: isM1Patched
          ? 'User authenticated via master PIN. Session stored in EncryptedSharedPreferences (AES-256).'
          : 'User PIN authenticated. Written to /shared_prefs/user_session.xml with MODE_WORLD_READABLE!'
      });
    } else {
      onAddLog({
        level: 'W',
        tag: 'VaultPayAuth',
        app: 'VaultPay',
        message: `Failed authentication attempt with PIN: ${pinInput}`
      });
    }
  };

  const handleBiometricAuth = () => {
    if (isM3Patched) {
      setIsAuthenticated(true);
      onAddLog({
        level: 'I',
        tag: 'BiometricPrompt',
        app: 'VaultPay',
        message: 'Biometric validated with AndroidKeyStore CryptoObject. Server signature challenge verified.'
      });
    } else {
      // Vulnerable: client-side boolean flag
      setIsAuthenticated(true);
      onAddLog({
        level: 'SEC',
        tag: 'BiometricPrompt',
        app: 'VaultPay',
        message: '[VULNERABILITY] Client-side onAuthenticationSucceeded() triggered without CryptoObject. Easily hookable via Frida!'
      });
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (!isM2Patched) {
      setTransferSuccessMsg(`Transfer of $${amountNum.toFixed(2)} sent via cleartext HTTP!`);
      onAddLog({
        level: 'SEC',
        tag: 'VaultPayNetwork',
        app: 'VaultPay',
        message: `[VULNERABILITY] Dispatched $${amountNum.toFixed(2)} to ${transferRecipient} over unencrypted HTTP (http://api.vaultpay.com/v1/transfer). MITM interceptable!`
      });
    } else {
      setTransferSuccessMsg(`Transfer of $${amountNum.toFixed(2)} secured via TLS 1.3 & Cert Pinning.`);
      onAddLog({
        level: 'I',
        tag: 'VaultPayNetwork',
        app: 'VaultPay',
        message: `Dispatched $${amountNum.toFixed(2)} to ${transferRecipient} over HTTPS with SHA-256 certificate pinning.`
      });
    }

    setTimeout(() => setTransferSuccessMsg(null), 4000);
  };

  const handleTriggerExportedActivity = () => {
    if (isM5Patched) {
      onAddLog({
        level: 'I',
        tag: 'ActivityManager',
        app: 'System',
        message: 'Blocked external intent invocation to com.vaultpay.ui.AdminTransferActivity. (android:exported="false")'
      });
      alert('Security Denial: Activity is not exported (android:exported="false"). External intent blocked!');
    } else {
      setIsExportedAdminOpen(true);
      onAddLog({
        level: 'SEC',
        tag: 'ActivityManager',
        app: 'VaultPay',
        message: '[VULNERABILITY] AdminTransferActivity launched via external implicit Intent! Zero permission check enforced.'
      });
    }
  };

  const handleDeepLinkSimulation = () => {
    if (isM8Patched) {
      onAddLog({
        level: 'I',
        tag: 'IntentFilter',
        app: 'VaultPay',
        message: 'Deep link scheme vaultpay:// rejected. Only verified Android App Links (https://pay.vaultpay.com) permitted with biometrics.'
      });
      alert('Hardened: Insecure scheme rejected! Verified HTTPS App Links required with user authentication.');
    } else {
      onAddLog({
        level: 'SEC',
        tag: 'DeepLinkHandler',
        app: 'VaultPay',
        message: '[VULNERABILITY] Processed unauthenticated deep link: vaultpay://transfer?amount=5000&recipient=attacker@dark.net without re-auth!'
      });
      alert('Vulnerability Triggered! Deep link executed $5,000.00 transfer to attacker without requiring PIN or biometric verification!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Column: Device Simulator Hardware Frame (5 cols) */}
      <div className="lg:col-span-5 flex flex-col items-center">
        {/* Device Controls Bar */}
        <div className="w-full max-w-[340px] flex items-center justify-between mb-3 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setPlatform('android')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                platform === 'android'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Pixel 8 (Android)
            </button>
            <button
              onClick={() => setPlatform('ios')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                platform === 'ios'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              iPhone 15 (iOS)
            </button>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Physical Smartphone Frame */}
        <div className="w-full max-w-[340px] bg-neutral-900 dark:bg-neutral-950 p-3 rounded-[40px] shadow-2xl border-4 border-neutral-700 dark:border-neutral-800 relative">
          {/* Hardware buttons */}
          <div className="absolute -left-1.5 top-24 w-1 h-10 bg-neutral-600 rounded-l-sm" />
          <div className="absolute -left-1.5 top-36 w-1 h-10 bg-neutral-600 rounded-l-sm" />
          <div className="absolute -right-1.5 top-28 w-1 h-14 bg-neutral-600 rounded-r-sm" />

          {/* Internal Screen Container */}
          <div className="w-full h-[580px] bg-neutral-900 text-neutral-100 rounded-[30px] overflow-hidden flex flex-col relative select-none">
            {/* Status Bar */}
            <div className="h-7 px-5 flex items-center justify-between text-[11px] font-mono tracking-tight text-neutral-300 bg-neutral-950/80 shrink-0">
              <span>09:41</span>
              {/* Dynamic Island / Camera hole */}
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-800" />
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* App Header Bar in Mobile */}
            <div className="px-4 py-2.5 bg-neutral-800/90 border-b border-neutral-700/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {activeApp === 'vaultpay' && (
                  <>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-neutral-100">VaultPay Mobile</span>
                  </>
                )}
                {activeApp === 'notes' && (
                  <>
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold text-neutral-100">SecureNotes Vault</span>
                  </>
                )}
                {activeApp === 'clouddrive' && (
                  <>
                    <Cloud className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-neutral-100">CloudDrive Sync</span>
                  </>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-[10px]">
                {activeApp === 'vaultpay' && (
                  <span
                    className={`font-mono ${
                      isM1Patched && isM2Patched && isM3Patched ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isM1Patched && isM2Patched && isM3Patched ? 'Hardened' : 'Vulnerable'}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Viewport Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 text-neutral-200">
              {/* APP 1: VAULTPAY */}
              {activeApp === 'vaultpay' && (
                <div className="space-y-4">
                  {!isAuthenticated ? (
                    /* Locked View */
                    <div className="flex flex-col items-center justify-center pt-8 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                        <Lock className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">VaultPay Lockscreen</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Master PIN: <span className="font-mono text-emerald-400">9042</span>
                        </p>
                      </div>

                      <form onSubmit={handlePinSubmit} className="w-full space-y-2.5">
                        <div className="relative">
                          <input
                            type={showPin ? 'text' : 'password'}
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="Enter 4-digit PIN"
                            maxLength={4}
                            className="w-full text-center tracking-widest font-mono text-base bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPin(!showPin)}
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                          >
                            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors"
                        >
                          Unlock with PIN
                        </button>
                      </form>

                      <div className="pt-2">
                        <button
                          onClick={handleBiometricAuth}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg mx-auto transition-colors"
                        >
                          <Fingerprint className="w-4 h-4 text-emerald-400" />
                          <span>Simulate Biometric Scan</span>
                        </button>
                        {!isM3Patched && (
                          <div className="text-[10px] text-rose-400 mt-1">
                            M3: Client-side flag (Frida bypassable)
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Authenticated FinTech App View */
                    <div className="space-y-3.5">
                      {/* Balance Card */}
                      <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400">Total Available</div>
                        <div className="text-xl font-bold font-mono text-white tabular-nums">$14,250.00</div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                          <span>Card: •••• 3421</span>
                          <span className={isM1Patched ? 'text-emerald-400' : 'text-rose-400'}>
                            {isM1Patched ? 'Encrypted Prefs' : 'Cleartext XML'}
                          </span>
                        </div>
                      </div>

                      {/* Transfer Form */}
                      <form onSubmit={handleTransfer} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                        <div className="text-xs font-semibold text-white">Quick Transfer</div>
                        <div>
                          <label className="text-[10px] text-neutral-400">Recipient</label>
                          <input
                            type="text"
                            value={transferRecipient}
                            onChange={(e) => setTransferRecipient(e.target.value)}
                            className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400">Amount ($)</label>
                          <input
                            type="text"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            className="w-full text-xs font-mono bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-100"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3 h-3" />
                          <span>Dispatch Transfer</span>
                        </button>
                        {transferSuccessMsg && (
                          <div className="text-[10px] text-center text-emerald-400 font-mono mt-1">
                            {transferSuccessMsg}
                          </div>
                        )}
                      </form>

                      {/* Diagnostic Vulnerability Triggers in App */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                          Sandbox Test Hooks
                        </div>
                        <button
                          onClick={handleTriggerExportedActivity}
                          className="w-full text-left px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-neutral-300 flex items-center justify-between transition-colors"
                        >
                          <span>M5: Launch Exported Admin UI</span>
                          <ExternalLink className="w-3 h-3 text-neutral-500" />
                        </button>
                        <button
                          onClick={handleDeepLinkSimulation}
                          className="w-full text-left px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-neutral-300 flex items-center justify-between transition-colors"
                        >
                          <span>M8: Execute Deep Link URL</span>
                          <ArrowRight className="w-3 h-3 text-neutral-500" />
                        </button>
                      </div>

                      <button
                        onClick={() => setIsAuthenticated(false)}
                        className="w-full py-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                      >
                        Lock Session
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* APP 2: SECURENOTES */}
              {activeApp === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Patient Clinical Records</span>
                    <span
                      className={`text-[10px] font-mono ${
                        vulnerabilities.find((v) => v.id === 'vuln-m1-sqlite-plaintext')?.status === 'patched'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {vulnerabilities.find((v) => v.id === 'vuln-m1-sqlite-plaintext')?.status === 'patched'
                        ? 'SQLCipher 256'
                        : 'Plaintext SQLite'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-neutral-300 font-medium">
                        <span>Jane Doe</span>
                        <span className="text-[10px] font-mono text-neutral-500">SSN: ***-**-6789</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Type-1 Diabetes; Severe Penicillin Allergy; Prescribed Lisinopril 10mg daily.
                      </p>
                    </div>

                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-neutral-300 font-medium">
                        <span>Marcus Vance</span>
                        <span className="text-[10px] font-mono text-neutral-500">SSN: ***-**-4432</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Stage 2 Chronic Kidney Disease; Erythropoietin 4000u weekly.
                      </p>
                    </div>
                  </div>

                  {/* WebView exploit button */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2">
                    <button
                      onClick={() => {
                        if (isM6WvPatched) {
                          alert('Hardened: WebView JavaScript interface disabled & file:/// access blocked by asset loader.');
                        } else {
                          setWebViewExploitActive(true);
                          onAddLog({
                            level: 'SEC',
                            tag: 'WebViewBridge',
                            app: 'SecureNotes',
                            message: '[VULNERABILITY] window.AndroidBridge.readInternalFile() executed! Leaked private SQLite database.'
                          });
                        }
                      }}
                      className="w-full py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] text-neutral-300 flex items-center justify-between"
                    >
                      <span>M6: Test WebView JS Bridge</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </button>
                    {webViewExploitActive && !isM6WvPatched && (
                      <div className="p-2 bg-rose-950/40 border border-rose-800/60 rounded text-[10px] text-rose-300 font-mono">
                        [!] Exploit Succeeded: Injected JS extracted local database via exposed AndroidBridge.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* APP 3: CLOUDDRIVE */}
              {activeApp === 'clouddrive' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Protected Files</span>
                    <span className="text-[10px] font-mono text-neutral-500">ContentProvider</span>
                  </div>

                  {/* SQL Injection Demo */}
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                    <div className="text-[11px] text-neutral-300">File Query Filter:</div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="e.g. quarterly"
                        className="flex-1 text-xs bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-white"
                      />
                      <button
                        onClick={() => {
                          if (isM6SqlPatched) {
                            alert('Secure: Parameterized selectionArgs protected against SQL injection.');
                            onAddLog({
                              level: 'I',
                              tag: 'ContentProvider',
                              app: 'CloudDrive',
                              message: 'Query executed with SQLiteQueryBuilder. Injection payload safely bound.'
                            });
                          } else {
                            alert('Vulnerability Detected! Injected: \' OR \'1\'=\'1 dumps entire files database across all users!');
                            onAddLog({
                              level: 'SEC',
                              tag: 'ContentProvider',
                              app: 'CloudDrive',
                              message: '[VULNERABILITY] ContentProvider SQL Injection exploited via raw string concatenation!'
                            });
                          }
                        }}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-medium rounded"
                      >
                        Inject SQL
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                      <span className="text-neutral-300">financial_audit_2026.pdf</span>
                      <span className="text-[10px] font-mono text-neutral-500">2.4 MB</span>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                      <span className="text-neutral-300">server_keys.pem</span>
                      <span className="text-[10px] font-mono text-rose-400">1.8 KB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar / App Switcher */}
            <div className="h-12 bg-neutral-950 border-t border-neutral-800/80 px-6 flex items-center justify-around shrink-0">
              <button
                onClick={() => setActiveApp('vaultpay')}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeApp === 'vaultpay' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[9px] font-medium">VaultPay</span>
              </button>

              <button
                onClick={() => setActiveApp('notes')}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeApp === 'notes' ? 'text-sky-400' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-[9px] font-medium">Notes</span>
              </button>

              <button
                onClick={() => setActiveApp('clouddrive')}
                className={`flex flex-col items-center gap-0.5 transition-colors ${
                  activeApp === 'clouddrive' ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span className="text-[9px] font-medium">Cloud</span>
              </button>
            </div>

            {/* Android / iOS Home Indicator */}
            <div className="h-4 bg-neutral-950 flex items-center justify-center shrink-0">
              <div className="w-28 h-1 bg-neutral-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Device Diagnostics & Vulnerability Mapping (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Device Active Security Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Active Sandbox App: {activeApp === 'vaultpay' ? 'VaultPay Mobile' : activeApp === 'notes' ? 'SecureNotes' : 'CloudDrive'}
              </h3>
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              Target Package: com.{activeApp}.app
            </div>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
            Interact with the simulated mobile device on the left to trigger client-side workflows, authentication events, deep link handlers, and data storage operations. Vulnerabilities tied to the active app are tracked in real-time below.
          </p>

          {/* Associated Vulnerabilities Table */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <div className="bg-neutral-50 dark:bg-neutral-800/60 px-3 py-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 grid grid-cols-12 gap-2">
              <span className="col-span-2">ID</span>
              <span className="col-span-6">Vulnerability Title</span>
              <span className="col-span-2 text-center">Status</span>
              <span className="col-span-2 text-right">Action</span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {vulnerabilities
                .filter(
                  (v) =>
                    (activeApp === 'vaultpay' && v.targetApp === 'VaultPay') ||
                    (activeApp === 'notes' && v.targetApp === 'SecureNotes') ||
                    (activeApp === 'clouddrive' && v.targetApp === 'CloudDrive')
                )
                .map((vuln) => (
                  <div
                    key={vuln.id}
                    className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <span className="col-span-2 font-mono text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      {vuln.owaspId}
                    </span>
                    <span className="col-span-6 font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {vuln.title}
                    </span>
                    <span className="col-span-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded font-medium ${
                          vuln.status === 'patched'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                        }`}
                      >
                        {vuln.status === 'patched' ? 'Hardened' : 'Vulnerable'}
                      </span>
                    </span>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => onInspectVuln(vuln)}
                        className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white underline underline-offset-2"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Live Device Logcat / Diagnostics Stream */}
        <div className="flex-1 min-h-[220px] p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-mono">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Device Logcat (Virtual adb logcat -v time)</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">
              {deviceLogs.length} events recorded
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] max-h-56">
            {deviceLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 text-neutral-400 hover:text-neutral-200">
                <span className="text-neutral-600 shrink-0 select-none">{log.timestamp}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[10px] shrink-0 font-bold ${
                    log.level === 'SEC'
                      ? 'bg-rose-900/60 text-rose-300'
                      : log.level === 'W'
                      ? 'bg-amber-900/60 text-amber-300'
                      : log.level === 'E'
                      ? 'bg-red-950 text-red-400'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-neutral-500 shrink-0">[{log.tag}]</span>
                <span
                  className={
                    log.level === 'SEC'
                      ? 'text-rose-400 font-semibold'
                      : log.level === 'W'
                      ? 'text-amber-300'
                      : 'text-neutral-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
