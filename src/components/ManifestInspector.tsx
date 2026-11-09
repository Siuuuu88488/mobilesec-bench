import React, { useState } from 'react';
import { Vulnerability } from '../types/security';
import { FileCode, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, Wrench, RotateCcw } from 'lucide-react';

interface ManifestInspectorProps {
  vulnerabilities: Vulnerability[];
  onTogglePatch: (vulnId: string) => void;
}

export const ManifestInspector: React.FC<ManifestInspectorProps> = ({
  vulnerabilities,
  onTogglePatch,
}) => {
  const isM7Patched = vulnerabilities.find((v) => v.id === 'vuln-m7-manifest-flags')?.status === 'patched';
  const isM5Patched = vulnerabilities.find((v) => v.id === 'vuln-m5-exported-activity')?.status === 'patched';
  const isM8Patched = vulnerabilities.find((v) => v.id === 'vuln-m8-insecure-deeplink')?.status === 'patched';

  const [activeView, setActiveView] = useState<'annotated' | 'diff'>('annotated');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span>AndroidManifest.xml Security & Permissions Auditor</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Static analysis of package components, intent filters, debug flags, backup configurations, and exported attack surfaces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePatch('vuln-m7-manifest-flags')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs ${
              isM7Patched
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isM7Patched ? 'Revert Debug/Backup Flags' : 'Harden Manifest Flags'}
          </button>
        </div>
      </div>

      {/* Audit Findings Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Finding 1: debuggable & allowBackup */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Debug & Backup Flags
            </span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isM7Patched
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isM7Patched ? 'Hardened (false)' : 'Vulnerable (true)'}
            </span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
            android:debuggable allows JDWP debugging; android:allowBackup permits adb backup filesystem extraction.
          </p>
          <div className="pt-1 font-mono text-[10px] text-neutral-500">
            CWE-215 · OWASP M7
          </div>
        </div>

        {/* Finding 2: Exported Activities */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Exported Admin Activity
            </span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isM5Patched
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isM5Patched ? 'Private (exported=false)' : 'Exported to All Apps'}
            </span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
            AdminTransferActivity declared without permission filter; external apps can execute privileged transfers.
          </p>
          <div className="pt-1 font-mono text-[10px] text-neutral-500">
            CWE-926 · OWASP M5
          </div>
        </div>

        {/* Finding 3: Custom Deep Link Scheme */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Custom URI Scheme
            </span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isM8Patched
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isM8Patched ? 'Verified App Links' : 'Unvalidated URI'}
            </span>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed">
            vaultpay:// scheme can be triggered by malicious websites to invoke state-changing transactions.
          </p>
          <div className="pt-1 font-mono text-[10px] text-neutral-500">
            CWE-939 · OWASP M8
          </div>
        </div>
      </div>

      {/* Code Viewer: Manifest Content */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col">
        <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
            /app/src/main/AndroidManifest.xml
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            Package: com.vaultpay.app
          </span>
        </div>

        <div className="p-5 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto min-h-[420px]">
          <pre className="whitespace-pre leading-relaxed">
            <code>
{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vaultpay.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />

    <application
        android:name=".VaultPayApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
`}
{isM7Patched ? (
  <span className="text-emerald-400 font-bold">
{`        <!-- [HARDENED] Debugging & Backup strictly disabled in release -->
        android:allowBackup="false"
        android:debuggable="false"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
`}
  </span>
) : (
  <span className="text-rose-400 font-bold">
{`        <!-- [VULNERABILITY M7] debuggable and allowBackup enabled! -->
        android:allowBackup="true"
        android:debuggable="true"
        android:usesCleartextTraffic="true"
`}
  </span>
)}
{`        >
        <activity
            android:name=".ui.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
`}
{isM5Patched ? (
  <span className="text-emerald-400 font-bold">
{`
        <!-- [HARDENED] Component private to application -->
        <activity
            android:name=".ui.AdminTransferActivity"
            android:exported="false">
        </activity>
`}
  </span>
) : (
  <span className="text-rose-400 font-bold">
{`
        <!-- [VULNERABILITY M5] Exported Activity without permission checks! -->
        <activity
            android:name=".ui.AdminTransferActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="com.vaultpay.action.EXECUTE_TRANSFER" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>
`}
  </span>
)}
{isM8Patched ? (
  <span className="text-emerald-400 font-bold">
{`
        <!-- [HARDENED] Verified Android App Link (HTTPS assetlinks.json) -->
        <activity
            android:name=".ui.DeepLinkHandlerActivity"
            android:exported="true">
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="pay.vaultpay.com" android:pathPrefix="/transfer" />
            </intent-filter>
        </activity>
`}
  </span>
) : (
  <span className="text-rose-400 font-bold">
{`
        <!-- [VULNERABILITY M8] Unvalidated custom scheme vaultpay:// -->
        <activity
            android:name=".ui.DeepLinkHandlerActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="vaultpay" android:host="transfer" />
            </intent-filter>
        </activity>
`}
  </span>
)}
{`
    </application>
</manifest>`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
