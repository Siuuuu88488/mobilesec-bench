import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuditSummary } from './components/AuditSummary';
import { VulnerabilityList } from './components/VulnerabilityList';
import { DeviceSimulator } from './components/DeviceSimulator';
import { FileSystemInspector } from './components/FileSystemInspector';
import { NetworkInspector } from './components/NetworkInspector';
import { ManifestInspector } from './components/ManifestInspector';
import { RemediationDrawer } from './components/RemediationDrawer';
import { SecurityReportModal } from './components/SecurityReportModal';
import { AuthPage } from './components/AuthPage';
import { SimulatedTerminal } from './components/SimulatedTerminal';
import { PlayStoreDeployHub } from './components/PlayStoreDeployHub';
import { AndroidSecurityScanner } from './components/AndroidSecurityScanner';
import { ReadmeModal } from './components/ReadmeModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { INITIAL_VULNERABILITIES } from './data/vulnerabilities';
import { INITIAL_FILES, INITIAL_TRAFFIC, INITIAL_LOGS } from './data/deviceData';
import { Vulnerability, DeviceLog, NetworkTraffic } from './types/security';
import { ShieldAlert, Sun, Moon, ArrowRight, Smartphone, Terminal, Lock, CheckCircle2, BookOpen } from 'lucide-react';

function DashboardApp() {
  const { profile, signOut } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'bench' | 'device' | 'filesystem' | 'network' | 'manifest' | 'terminal' | 'report' | 'auth' | 'playstore' | 'scanner'
  >('scanner');
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(INITIAL_VULNERABILITIES);
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>(INITIAL_LOGS);
  const [traffic, setTraffic] = useState<NetworkTraffic[]>(INITIAL_TRAFFIC);
  const [activeVuln, setActiveVuln] = useState<Vulnerability | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  // Sync theme with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleTogglePatch = (vulnId: string) => {
    setVulnerabilities((prev) =>
      prev.map((v) => {
        if (v.id === vulnId) {
          const nextStatus = v.status === 'vulnerable' ? 'patched' : 'vulnerable';
          const time = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
          setDeviceLogs((logs) => [
            {
              id: `log-${Date.now()}`,
              timestamp: time,
              level: nextStatus === 'patched' ? 'I' : 'SEC',
              tag: 'SecPatchManager',
              app: v.targetApp,
              message:
                nextStatus === 'patched'
                  ? `[HARDENED] Applied security patch for ${v.owaspId}: ${v.title}.`
                  : `[REVERTED] Vulnerability ${v.owaspId} restored to vulnerable baseline.`
            },
            ...logs
          ]);
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );

    if (activeVuln && activeVuln.id === vulnId) {
      setActiveVuln((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'vulnerable' ? 'patched' : 'vulnerable'
            }
          : null
      );
    }
  };

  const handlePatchAll = () => {
    setVulnerabilities((prev) => prev.map((v) => ({ ...v, status: 'patched' })));
    const time = new Date().toTimeString().split(' ')[0];
    setDeviceLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: time,
        level: 'I',
        tag: 'SecHardeningSuite',
        app: 'System',
        message: 'All 10 OWASP Mobile Top 10 vulnerabilities successfully hardened.'
      },
      ...logs
    ]);
  };

  const handleResetAll = () => {
    setVulnerabilities(INITIAL_VULNERABILITIES);
    const time = new Date().toTimeString().split(' ')[0];
    setDeviceLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: time,
        level: 'SEC',
        tag: 'SecHardeningSuite',
        app: 'System',
        message: 'Sandbox state reset to initial vulnerable baseline.'
      },
      ...logs
    ]);
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    const time = new Date().toTimeString().split(' ')[0];
    setDeviceLogs((logs) => [
      {
        id: `log-${Date.now()}`,
        timestamp: time,
        level: 'I',
        tag: 'AuditEngine',
        app: 'System',
        message: 'Running comprehensive OWASP MSTG benchmark scan across virtual sandbox...'
      },
      ...logs
    ]);

    setTimeout(() => {
      setIsAuditing(false);
      const vulnerableCount = vulnerabilities.filter((v) => v.status === 'vulnerable').length;
      const patchedCount = vulnerabilities.length - vulnerableCount;
      const timeFinished = new Date().toTimeString().split(' ')[0];

      setDeviceLogs((logs) => [
        {
          id: `log-${Date.now()}`,
          timestamp: timeFinished,
          level: vulnerableCount > 0 ? 'SEC' : 'I',
          tag: 'AuditEngine',
          app: 'System',
          message: `Audit scan completed: ${vulnerableCount} vulnerabilities flagged, ${patchedCount} hardened.`
        },
        ...logs
      ]);
    }, 1200);
  };

  const handleAddLog = (newLog: Omit<DeviceLog, 'id' | 'timestamp'>) => {
    const time = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    setDeviceLogs((prev) => [
      {
        ...newLog,
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: time
      },
      ...prev
    ]);
  };

  const handleSendSimulatedRequest = () => {
    const isM2Patched = vulnerabilities.find((v) => v.id === 'vuln-m2-cleartext-tls')?.status === 'patched';
    const time = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
    const newReq: NetworkTraffic = {
      id: `req-${Date.now().toString().slice(-4)}`,
      timestamp: time,
      app: 'VaultPay',
      method: 'POST',
      url: isM2Patched ? 'https://api.vaultpay.com/v1/auth/verify_pin' : 'http://api.vaultpay.com/v1/auth/verify_pin',
      protocol: isM2Patched ? 'HTTPS/TLS 1.3' : 'HTTP/1.1',
      isEncrypted: isM2Patched,
      isPinned: isM2Patched,
      requestHeaders: {
        Host: 'api.vaultpay.com',
        'User-Agent': 'VaultPay-Client/1.2',
        Authorization: 'Bearer eyJhbGciOiJIUzI1Ni...'
      },
      requestBody: '{"auth_challenge": "9a01bf2", "pin": "9042"}',
      responseStatus: 200,
      responseBody: '{"verified": true, "session_renewed": true}'
    };

    setTraffic((prev) => [newReq, ...prev]);
    handleAddLog({
      level: isM2Patched ? 'I' : 'SEC',
      tag: 'NetworkClient',
      app: 'VaultPay',
      message: isM2Patched
        ? 'Dispatched verify_pin over TLS 1.3 with Certificate Pinning (Pass).'
        : '[VULNERABILITY] Transmitted verify_pin payload over plaintext HTTP (Fail).'
    });
  };

  const allPatched = vulnerabilities.every((v) => v.status === 'patched');
  const isAuthenticated = !!profile || guestMode;

  const currentScore = Math.round(
    (vulnerabilities.filter((v) => v.status === 'patched').length / vulnerabilities.length) * 100
  );
  const patchedCount = vulnerabilities.filter((v) => v.status === 'patched').length;

  // FLOW 1: If not authenticated, render Login/Signup Gateway page first!
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between font-sans transition-colors antialiased">
        {/* Minimal Gateway Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              MobileSec Bench
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsReadmeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Guide & README</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Login / Signup Gateway Screen */}
        <div className="py-10 px-4">
          <AuthPage
            onSuccess={() => setGuestMode(true)}
            onEnterGuest={() => setGuestMode(true)}
            onOpenReadme={() => setIsReadmeOpen(true)}
            currentScore={currentScore}
            patchedCount={patchedCount}
            totalCount={vulnerabilities.length}
          />
        </div>

        {/* Footer */}
        <footer className="py-6 px-4 text-center text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
          MobileSec Bench · OWASP Mobile Security Testing Guide (MSTG) & Google Play Store Ready (TWA)
        </footer>

        {/* Access Guide / README Modal */}
        <ReadmeModal isOpen={isReadmeOpen} onClose={() => setIsReadmeOpen(false)} />
      </div>
    );
  }

  // FLOW 2: Authenticated / Guest: Full Security Operations Dashboard!
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors antialiased">
      {/* 3-Zone Header following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'report') {
            setIsReportOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onRunAudit={handleRunAudit}
        onPatchAll={handlePatchAll}
        allPatched={allPatched}
        isAuditing={isAuditing}
        onOpenReadme={() => setIsReadmeOpen(true)}
      />

      {/* Main Audit Summary Strip */}
      <AuditSummary
        vulnerabilities={vulnerabilities}
        onPatchAll={handlePatchAll}
        onResetAll={handleResetAll}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Primary Workspace Viewport */}
      <main className="flex-1 pb-12">
        {activeTab === 'auth' && (
          <div className="py-8">
            <AuthPage
              onSuccess={() => setActiveTab('bench')}
              onOpenReadme={() => setIsReadmeOpen(true)}
              currentScore={currentScore}
              patchedCount={patchedCount}
              totalCount={vulnerabilities.length}
            />
          </div>
        )}

        {activeTab === 'scanner' && (
          <AndroidSecurityScanner />
        )}

        {activeTab === 'bench' && (
          <VulnerabilityList
            vulnerabilities={vulnerabilities}
            onInspectVuln={(vuln) => setActiveVuln(vuln)}
            onTogglePatch={handleTogglePatch}
          />
        )}

        {activeTab === 'device' && (
          <DeviceSimulator
            vulnerabilities={vulnerabilities}
            onTogglePatch={handleTogglePatch}
            onInspectVuln={(vuln) => setActiveVuln(vuln)}
            deviceLogs={deviceLogs}
            onAddLog={handleAddLog}
          />
        )}

        {activeTab === 'filesystem' && (
          <FileSystemInspector
            files={INITIAL_FILES}
            vulnerabilities={vulnerabilities}
            onTogglePatch={handleTogglePatch}
          />
        )}

        {activeTab === 'network' && (
          <NetworkInspector
            traffic={traffic}
            vulnerabilities={vulnerabilities}
            onTogglePatch={handleTogglePatch}
            onSendSimulatedRequest={handleSendSimulatedRequest}
          />
        )}

        {activeTab === 'manifest' && (
          <ManifestInspector
            vulnerabilities={vulnerabilities}
            onTogglePatch={handleTogglePatch}
          />
        )}

        {activeTab === 'terminal' && (
          <SimulatedTerminal
            vulnerabilities={vulnerabilities}
            onTogglePatch={handleTogglePatch}
          />
        )}

        {activeTab === 'playstore' && (
          <PlayStoreDeployHub />
        )}
      </main>

      {/* In-Depth Code Remediation & Exploit Simulation Drawer */}
      <RemediationDrawer
        vulnerability={activeVuln}
        onClose={() => setActiveVuln(null)}
        onTogglePatch={handleTogglePatch}
      />

      {/* Executive Security Assessment Report Modal */}
      {isReportOpen && (
        <SecurityReportModal
          vulnerabilities={vulnerabilities}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Access Guide & README Modal */}
      <ReadmeModal
        isOpen={isReadmeOpen}
        onClose={() => setIsReadmeOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
