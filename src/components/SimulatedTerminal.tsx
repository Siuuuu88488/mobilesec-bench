import React, { useState, useRef, useEffect } from 'react';
import { Vulnerability } from '../types/security';
import { Terminal as TerminalIcon, Play, Trash2, HelpCircle, CornerDownLeft, ShieldAlert, ShieldCheck } from 'lucide-react';

interface SimulatedTerminalProps {
  vulnerabilities: Vulnerability[];
  onTogglePatch: (vulnId: string) => void;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  isError?: boolean;
  status?: 'pass' | 'fail' | 'info';
  timestamp: string;
}

export const SimulatedTerminal: React.FC<SimulatedTerminalProps> = ({
  vulnerabilities,
  onTogglePatch,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'uname -a && getprop ro.build.version.release',
      output: 'Linux localhost 6.1.25-android14-g921 #1 SMP PREEMPT Android 14 (API 34) aarch64',
      status: 'info',
      timestamp: '11:50:01'
    },
    {
      id: 'init-2',
      command: 'echo "MobileSec Bench Security CLI v2.4 initialized. Type \'help\' for available diagnostic commands."',
      output: 'MobileSec Bench Security CLI v2.4 initialized. Type \'help\' for available diagnostic commands.',
      status: 'info',
      timestamp: '11:50:02'
    }
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const time = new Date().toTimeString().split(' ')[0];
    let output = '';
    let status: 'pass' | 'fail' | 'info' = 'info';

    const lower = trimmed.toLowerCase();

    if (lower === 'help') {
      output = `MobileSec Bench Interactive Audit CLI Commands:
  - adb shell cat <path>             : Inspect sandbox storage file
  - adb shell am start <intent>       : Send Intent to activity
  - frida -U -f <pkg> -l <script>    : Inject dynamic instrumentation hooks
  - mitmproxy                        : Intercept active HTTP/TLS network requests
  - adb backup                       : Extract app sandbox archive
  - drozer app.provider.query <uri>  : Test ContentProvider SQL injection
  - jadx -d out/ app-release.apk     : Decompile APK bytecode to analyze hardcoded keys
  - adb shell which su               : Check for root binaries in /system/xbin/
  - patch all / revert all           : Batch patch or revert all vulnerabilities
  - clear                            : Clear terminal screen`;
    } else if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower === 'patch all') {
      vulnerabilities.forEach((v) => {
        if (v.status === 'vulnerable') onTogglePatch(v.id);
      });
      output = '[+] Applied security hardening patches to all 10 OWASP Mobile Top 10 vulnerabilities.';
      status = 'pass';
    } else if (lower === 'revert all') {
      vulnerabilities.forEach((v) => {
        if (v.status === 'patched') onTogglePatch(v.id);
      });
      output = '[!] Reverted sandbox to initial vulnerable baseline.';
      status = 'fail';
    } else if (lower.includes('cat') && lower.includes('user_session.xml')) {
      const isM1Patched = vulnerabilities.find((v) => v.id === 'vuln-m1-sharedprefs')?.status === 'patched';
      if (!isM1Patched) {
        output = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="master_pin">9042</string>
    <string name="auth_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfODg5MiJ9...</string>
    <string name="card_num">4532-8812-9901-3421</string>
    <string name="cvv">821</string>
</map>
[!] VULNERABILITY DETECTED (M1): Cleartext credentials & PIN exposed in SharedPreferences!`;
        status = 'fail';
      } else {
        output = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="__androidx_security_crypto_encrypted_prefs_key_keyset__">AQEBAW4v7...[ENC]</string>
    <string name="Ac7jY9Pq1w==">Afh4kK90+x2LaQ98mYqXw1Z8v4M9kZk1kL==</string>
</map>
[*] PASS (M1): Credentials encrypted at rest with hardware-backed AES-256-GCM.`;
        status = 'pass';
      }
    } else if (lower.includes('am start') && lower.includes('admintransferactivity')) {
      const isM5Patched = vulnerabilities.find((v) => v.id === 'vuln-m5-exported-activity')?.status === 'patched';
      if (!isM5Patched) {
        output = `Starting: Intent { cmp=com.vaultpay/.ui.AdminTransferActivity (has extras) }
ActivityManager: Start proc com.vaultpay for activity com.vaultpay/.ui.AdminTransferActivity
[!] VULNERABILITY DETECTED (M5): AdminTransferActivity successfully launched without permission!`;
        status = 'fail';
      } else {
        output = `Starting: Intent { cmp=com.vaultpay/.ui.AdminTransferActivity (has extras) }
java.lang.SecurityException: Permission Denial: starting Intent { cmp=com.vaultpay/.ui.AdminTransferActivity } from pid=1290, uid=2000 not exported from uid 10142
[*] PASS (M5): Component is private (android:exported="false"). External intent blocked.`;
        status = 'pass';
      }
    } else if (lower.includes('frida') && lower.includes('bypass_biometrics')) {
      const isM3Patched = vulnerabilities.find((v) => v.id === 'vuln-m3-biometric-bypass')?.status === 'patched';
      if (!isM3Patched) {
        output = `[*] Attaching Frida to com.vaultpay...
[*] Hooking BiometricPrompt.AuthenticationCallback.onAuthenticationSucceeded...
[+] Synthetic callback injected.
[!] VULNERABILITY DETECTED (M3): Biometric check bypassed! No hardware CryptoObject required.`;
        status = 'fail';
      } else {
        output = `[*] Attaching Frida to com.vaultpay...
[*] Attempting to trigger onAuthenticationSucceeded without CryptoObject...
[!] EXCEPTION: java.security.SignatureException: Key not authorized! AndroidKeyStore rejected unauthenticated sign request.
[*] PASS (M3): Hardware-backed biometric authentication enforced.`;
        status = 'pass';
      }
    } else if (lower.includes('mitmproxy')) {
      const isM2Patched = vulnerabilities.find((v) => v.id === 'vuln-m2-cleartext-tls')?.status === 'patched';
      if (!isM2Patched) {
        output = `[HTTP 200] POST http://api.vaultpay.com/v1/transfer
Request Headers: Authorization: Bearer eyJhbGciOi...
Request Body: {"recipient": "98124018", "amount": 1450.00}
[!] VULNERABILITY DETECTED (M2): Plaintext HTTP connection intercepted. Host accepted forged certificate.`;
        status = 'fail';
      } else {
        output = `[TLS HANDSHAKE FAILED]
javax.net.ssl.SSLPeerUnverifiedException: Certificate pinning failure!
Peer certificate chain rejected by pinned SPKI hash sha256/k2v657xBsOwg11+SZqYReHmNXYvTupN93NumYCefGuI=
[*] PASS (M2): Certificate Pinning & TLS 1.3 successfully thwarted MITM attack.`;
        status = 'pass';
      }
    } else if (lower.includes('adb backup')) {
      const isM7Patched = vulnerabilities.find((v) => v.id === 'vuln-m7-manifest-flags')?.status === 'patched';
      if (!isM7Patched) {
        output = `Now unlock your device and confirm the backup operation...
Backup complete: 1.2 MB written to backup.ab
Extracting archive contents:
  apps/com.clouddrive/db/files.db
  apps/com.clouddrive/sp/auth_tokens.xml
[!] VULNERABILITY DETECTED (M7): Full app sandbox exported via adb backup!`;
        status = 'fail';
      } else {
        output = `Now unlock your device and confirm the backup operation...
adb: error: package com.clouddrive does not allow backup.
[*] PASS (M7): android:allowBackup="false" enforced. Operation aborted by OS.`;
        status = 'pass';
      }
    } else if (lower.includes('drozer')) {
      const isM6Patched = vulnerabilities.find((v) => v.id === 'vuln-m6-sqli-provider')?.status === 'patched';
      if (!isM6Patched) {
        output = `| id | filename         | size   | is_shared | mime_type |
| 1  | admin_backup.enc | 89128  | false     | application/octet-stream |
| 2  | sysadmin         | hash:e7f8... | token:Bearer_eyJ... | credential_row |
[!] VULNERABILITY DETECTED (M6): SQL injection leaked user credentials via UNION SELECT!`;
        status = 'fail';
      } else {
        output = `Query executed using parameterized statement.
Zero leaked rows returned.
[*] PASS (M6): Parameterized SQLiteQueryBuilder treated injection input safely.`;
        status = 'pass';
      }
    } else if (lower.includes('which su')) {
      const isM9Patched = vulnerabilities.find((v) => v.id === 'vuln-m9-missing-anti-tamper')?.status === 'patched';
      if (!isM9Patched) {
        output = `/system/xbin/su
[!] VULNERABILITY DETECTED (M9): Device root binary detected, but app launched without warning. Zero anti-root checks active.`;
        status = 'fail';
      } else {
        output = `/system/xbin/su
Security Event: Root environment detected by IntegrityCheck. Security keys wiped; application execution terminated safely.
[*] PASS (M9): Multi-layered anti-tamper & root defense active.`;
        status = 'pass';
      }
    } else {
      output = `Command executed: ${trimmed}\nExit code 0. [Hint: Type 'help' to view mobile security test commands]`;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: trimmed,
        output,
        status,
        timestamp: time
      }
    ]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    }
  };

  const sampleCommands = [
    { label: 'Dump SharedPreferences', cmd: 'adb shell cat /data/data/com.vaultpay.app/shared_prefs/user_session.xml' },
    { label: 'Test Exported Activity', cmd: 'adb shell am start -n com.vaultpay/.ui.AdminTransferActivity' },
    { label: 'Bypass Biometrics (Frida)', cmd: 'frida -U -f com.vaultpay -l bypass_biometrics.js' },
    { label: 'Mitmproxy Capture', cmd: 'mitmproxy --listen-port 8080' },
    { label: 'ADB Backup Extraction', cmd: 'adb backup -f backup.ab com.clouddrive' },
    { label: 'ContentProvider SQLi', cmd: 'drozer app.provider.query content://com.clouddrive.provider/files' },
    { label: 'Check Root su binary', cmd: 'adb shell which su' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span>Interactive Mobile Security CLI Sandbox</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Execute simulated ADB, Frida, Drozer, and Mitmproxy commands in real time. Commands interact with your active vulnerability states.
          </p>
        </div>

        <button
          onClick={() => setHistory([])}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Console</span>
        </button>
      </div>

      {/* Quick Launch Buttons */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-neutral-400 dark:text-neutral-500 text-xs self-center">Quick Runs:</span>
        {sampleCommands.map((sc, i) => (
          <button
            key={i}
            onClick={() => executeCommand(sc.cmd)}
            className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md font-mono text-[11px] transition-colors"
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Terminal Screen Frame */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Terminal Titlebar */}
        <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="ml-2 text-neutral-300 font-semibold">auditor@mobilesec-bench:~</span>
          </div>
          <span className="text-[11px] text-neutral-500">Android Debug Bridge & Runtime Sandbox</span>
        </div>

        {/* Scrollable Command Stream */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-neutral-300 space-y-3.5">
          {history.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-white font-semibold">{item.command}</span>
                <span className="text-[10px] text-neutral-600 ml-auto">{item.timestamp}</span>
              </div>
              <div
                className={`p-2.5 rounded-lg border leading-relaxed whitespace-pre-wrap text-[11px] ${
                  item.status === 'fail'
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    : item.status === 'pass'
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                }`}
              >
                {item.output}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Input Prompt */}
        <div className="p-3 bg-neutral-900/80 border-t border-neutral-800 flex items-center gap-2 text-xs font-mono">
          <span className="text-emerald-400 font-bold select-none">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'help', run adb commands, or click quick buttons..."
            className="flex-1 bg-transparent text-white placeholder-neutral-500 focus:outline-none font-mono"
            autoFocus
          />
          <button
            onClick={() => executeCommand(inputVal)}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
