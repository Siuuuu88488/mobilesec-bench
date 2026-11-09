import React, { useState } from 'react';
import { Vulnerability } from '../types/security';
import {
  X,
  Code2,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  RotateCcw,
  Copy,
  Check,
  Play,
  FileCode,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface RemediationDrawerProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
  onTogglePatch: (vulnId: string) => void;
}

export const RemediationDrawer: React.FC<RemediationDrawerProps> = ({
  vulnerability,
  onClose,
  onTogglePatch,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'exploit' | 'owasp'>('code');
  const [copiedVulnerable, setCopiedVulnerable] = useState(false);
  const [copiedPatched, setCopiedPatched] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  if (!vulnerability) return null;

  const handleCopy = (text: string, isVulnerable: boolean) => {
    navigator.clipboard.writeText(text);
    if (isVulnerable) {
      setCopiedVulnerable(true);
      setTimeout(() => setCopiedVulnerable(false), 2000);
    } else {
      setCopiedPatched(true);
      setTimeout(() => setCopiedPatched(false), 2000);
    }
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationLog('Initializing simulated security test runner...');
    setTimeout(() => {
      setSimulationLog(
        vulnerability.status === 'vulnerable'
          ? vulnerability.simulation.vulnerableOutput
          : vulnerability.simulation.remediatedOutput
      );
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Drawer Container */}
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                {vulnerability.owaspId}
              </span>
              <span className="text-xs font-mono text-neutral-500">{vulnerability.mstgId}</span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-xs font-mono text-neutral-500">Target: {vulnerability.targetApp}</span>
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {vulnerability.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePatch(vulnerability.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shadow-xs ${
                vulnerability.status === 'patched'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {vulnerability.status === 'patched' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert to Vulnerable</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Apply Security Patch</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Diff & Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('exploit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'exploit'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulated Exploit Test</span>
          </button>
          <button
            onClick={() => setActiveTab('owasp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'owasp'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>OWASP MSTG Standards</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: CODE COMPARISON */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              {/* Vulnerable Block */}
              <div className="border border-rose-200 dark:border-rose-950 rounded-xl overflow-hidden bg-rose-50/20 dark:bg-rose-950/10">
                <div className="px-4 py-2 bg-rose-100/50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-950 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-semibold text-rose-800 dark:text-rose-300">
                      Vulnerable Implementation ({vulnerability.vulnerableCode.file})
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(vulnerability.vulnerableCode.snippet, true)}
                    className="flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200"
                  >
                    {copiedVulnerable ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedVulnerable ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto">
                  <pre className="leading-relaxed whitespace-pre">
                    <code>{vulnerability.vulnerableCode.snippet}</code>
                  </pre>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 border-t border-rose-200 dark:border-rose-950 text-xs text-neutral-600 dark:text-neutral-400">
                  <strong className="text-rose-600 dark:text-rose-400">Flaw Analysis: </strong>
                  {vulnerability.vulnerableCode.explanation}
                </div>
              </div>

              {/* Secure Patched Block */}
              <div className="border border-emerald-200 dark:border-emerald-950 rounded-xl overflow-hidden bg-emerald-50/20 dark:bg-emerald-950/10">
                <div className="px-4 py-2 bg-emerald-100/50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-950 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Remediated & Hardened Implementation ({vulnerability.patchedCode.file})
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(vulnerability.patchedCode.snippet, false)}
                    className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200"
                  >
                    {copiedPatched ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPatched ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto">
                  <pre className="leading-relaxed whitespace-pre">
                    <code>{vulnerability.patchedCode.snippet}</code>
                  </pre>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 border-t border-emerald-200 dark:border-emerald-950 text-xs text-neutral-600 dark:text-neutral-400">
                  <strong className="text-emerald-600 dark:text-emerald-400">Remediation Mechanism: </strong>
                  {vulnerability.patchedCode.explanation}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLOIT SIMULATION */}
          {activeTab === 'exploit' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Audit Tool: {vulnerability.simulation.tool}
                  </span>
                  <span className="font-mono text-neutral-500">
                    Status: {vulnerability.status === 'patched' ? 'Hardened (Pass)' : 'Vulnerable (Fail)'}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {vulnerability.simulation.description}
                </p>
                <div className="pt-2 font-mono text-[11px] bg-neutral-950 text-emerald-400 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between">
                  <span className="truncate">{vulnerability.simulation.command}</span>
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] rounded font-medium shrink-0 ml-2"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isSimulating ? 'Testing...' : 'Execute Test'}</span>
                  </button>
                </div>
              </div>

              {/* Terminal Output */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-mono text-xs min-h-[220px] text-neutral-300">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800 text-neutral-500 text-[11px]">
                  <span>Virtual Execution Console</span>
                  <span>{vulnerability.simulation.tool}</span>
                </div>

                <pre className="whitespace-pre-wrap leading-relaxed">
                  {simulationLog || (
                    <span className="text-neutral-500">
                      Click "Execute Test" above to run this security diagnostic against the virtual device sandbox.
                    </span>
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: OWASP & COMPLIANCE */}
          {activeTab === 'owasp' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Standards & Metric Mapping
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-neutral-400">OWASP Category:</span>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">{vulnerability.category}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">CWE Identifier:</span>
                    <p className="font-medium font-mono text-neutral-800 dark:text-neutral-200">{vulnerability.cwe}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">CVSS 3.1 Base Score:</span>
                    <p className="font-bold font-mono text-rose-600 dark:text-rose-400">{vulnerability.cvssScore} / 10.0</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">MSTG Checkpoint:</span>
                    <p className="font-medium font-mono text-neutral-800 dark:text-neutral-200">{vulnerability.mstgId}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Attack Surface & Real-World Impact
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-200">Attack Vector: </strong>
                  {vulnerability.attackVector}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-900 dark:text-neutral-200">Impact: </strong>
                  {vulnerability.impact}
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2.5">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Remediation Checklist for Mobile Engineers
                </h4>
                <ul className="space-y-2">
                  {vulnerability.remediationAdvice.map((advice, i) => (
                    <li key={i} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
