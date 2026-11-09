import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  FileText,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'desktop' | 'readme'>('android');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  const appUrl = 'https://ais-pre-piddlkeezebv5gxbes52if-751126202575.asia-east1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=0a0a0a&color=10b981&margin=1`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (label === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedCommand(label);
      setTimeout(() => setCopiedCommand(null), 2000);
    }
  };

  const handleDownloadReadme = () => {
    fetch('/README.md')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.text();
      })
      .then((text) => {
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        // Fallback: direct programmatic markdown download
        const fallbackText = `# MobileSec Bench — Mobile Vulnerability Test Bench\n\nApp URL: ${appUrl}\n\nSee repository for complete instructions.`;
        const blob = new Blob([fallbackText], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Access & Installation Guide</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Instructions to install or run on Android devices, Desktop computers, and Local dev
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReadme}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors"
              title="Download README.md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download README</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live App URL Quick Share Banner */}
        <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold">Live URL:</span>
            <span className="font-mono truncate">{appUrl}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyToClipboard(appUrl, 'url')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-md font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copied URL!' : 'Copy Link'}</span>
            </button>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 bg-white dark:bg-neutral-900 text-sm">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 py-3 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'android'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Run on Android</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 py-3 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'desktop'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>💻 Run on Desktop</span>
          </button>
          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-2 py-3 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'readme'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 Full README.md</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'android' && (
            <div className="space-y-6 text-sm">
              {/* Method 1: Scan QR or Instant PWA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 items-center">
                <div className="flex flex-col items-center text-center p-3 bg-neutral-950 rounded-xl border border-neutral-800 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="Scan with Android camera"
                    className="w-44 h-44 rounded-lg bg-neutral-950 p-1"
                  />
                  <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scan with Android Camera</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Recommended (Fastest)
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Option 1: 1-Tap Instant Install on Android (Chrome)
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Installs directly to your Android launcher as a standalone native-feeling application with full hardware telemetry access:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                    <li>Scan the QR code with your Android camera, or open <strong>Google Chrome</strong> and enter the link.</li>
                    <li>Tap the <strong>"Install on Device"</strong> button in the top navigation bar.</li>
                    <li>Alternatively: tap the <strong>three dots (⋮)</strong> in Chrome &gt; select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
                    <li>Confirm installation. The app icon will appear in your app drawer and home screen.</li>
                  </ol>
                </div>
              </div>

              {/* Method 2: Google Play Store TWA (Bubblewrap) */}
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Option 2: Build Native Android Package (.apk / .aab)</span>
                  </h3>
                  <span className="text-xs font-mono text-neutral-500">Google Bubblewrap CLI</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Generate a signed <strong>.aab (Android App Bundle)</strong> ready for Google Play Console submission or an installable <strong>.apk</strong>:
                </p>

                <div className="relative rounded-lg bg-neutral-950 p-4 font-mono text-xs text-neutral-200 overflow-x-auto border border-neutral-800">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `npm i -g @bubblewrap/cli\nbubblewrap init --manifest="${appUrl}/manifest.json"\nbubblewrap build`,
                        'bubblewrap'
                      )
                    }
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                    title="Copy commands"
                  >
                    {copiedCommand === 'bubblewrap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="text-xs leading-relaxed">
{`# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize project from your live manifest
bubblewrap init --manifest="${appUrl}/manifest.json"

# 3. Build signed Android App Bundle (.aab) & APK
bubblewrap build

# 4. Sideload directly to connected phone:
adb install app-release-signed.apk`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-6 text-sm">
              {/* Option 1: Standalone Desktop PWA */}
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Zero Install
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Option 1: Run as Standalone Desktop App (Mac, Windows, Linux)
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  You can run MobileSec Bench in a dedicated, borderless window with taskbar and dock integration:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  <li>Open <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Brave</strong> on your desktop.</li>
                  <li>Visit: <code className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-mono text-[11px]">{appUrl}</code></li>
                  <li>Look at the address bar: click the <strong>Install icon</strong> (monitor with down arrow) or select <strong>Menu (⋮) &gt; Save and Share &gt; Install MobileSec Bench</strong>.</li>
                  <li>The app will launch in its own standalone desktop window.</li>
                </ol>
              </div>

              {/* Option 2: Local Developer Run */}
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span>Option 2: Run Locally from Source Code</span>
                  </h3>
                  <span className="text-xs font-mono text-neutral-500">Node.js + Vite</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Clone the repository, install dependencies, and run locally on port 3000:
                </p>

                <div className="relative rounded-lg bg-neutral-950 p-4 font-mono text-xs text-neutral-200 overflow-x-auto border border-neutral-800">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `git clone https://github.com/your-username/mobile-vulnerable-test-bench.git\ncd mobile-vulnerable-test-bench\nnpm install\ncp .env.example .env\nnpm run dev`,
                        'localdev'
                      )
                    }
                    className="absolute top-3 right-3 p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                    title="Copy commands"
                  >
                    {copiedCommand === 'localdev' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="text-xs leading-relaxed">
{`# 1. Clone repository
git clone https://github.com/your-username/mobile-vulnerable-test-bench.git
cd mobile-vulnerable-test-bench

# 2. Install dependencies
npm install

# 3. Setup environment configuration
cp .env.example .env

# 4. Start local development server
npm run dev

# App available at: http://localhost:3000`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg text-xs">
                <span className="font-mono text-neutral-600 dark:text-neutral-300">File: /README.md (Root Directory)</span>
                <button
                  onClick={handleDownloadReadme}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download File</span>
                </button>
              </div>

              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 font-mono text-xs text-neutral-800 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
{`# MobileSec Bench — Mobile Vulnerability Test Bench 🛡️📱

> Interactive Android Security Test Bench, OWASP Mobile Top 10 Diagnostic Lab, Live Device Telemetry Scanner & Play Store Ready TWA.

## 🚀 Live Demo & Web App
- Hosted Web App: ${appUrl}
- Authentication: Google Sign-In with Firebase Auth

## 📱 How to Run or Install on Android
Method 1: Instant Installation on Android (Chrome / Brave / Edge)
1. Open Google Chrome on your Android smartphone or tablet.
2. Visit: ${appUrl}
3. Tap "Install on Device" or Chrome menu (⋮) > "Add to Home screen" / "Install app".
4. Confirm by tapping Install.

Method 2: Build Native Android Package (.apk / .aab) via Google Bubblewrap
1. npm install -g @bubblewrap/cli
2. bubblewrap init --manifest="${appUrl}/manifest.json"
3. bubblewrap build
4. adb install app-release-signed.apk

## 💻 How to Run on Desktop (Mac, Windows, Linux)
Option 1: Run as a Standalone Desktop App (Chrome / Edge)
1. Open Google Chrome or Microsoft Edge.
2. Go to: ${appUrl}
3. Click the Install icon in the address bar.

Option 2: Run Locally from Source Code
1. git clone <repo_url>
2. npm install
3. cp .env.example .env
4. npm run dev
5. Open http://localhost:3000

## 🔍 Features & Diagnostic Capabilities
- Real-time CPU, GPU, Battery, Network, and Storage Hardware Telemetry
- Host Security Audit (WebRTC local IP leaks, WebCrypto algorithms, TEE Enclaves)
- APK & AndroidManifest.xml SAST scanner
- WebADB Physical USB Probe for live device debugging
- 10 OWASP Mobile Top 10 interactive test suites with side-by-side code diffs
- Google Play Store Deployment Hub with 100% readiness scorecard

## 📄 License
Apache 2.0 License`}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs">
          <div className="flex items-center gap-2 text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ready for Android, Desktop, and Google Play Store</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
