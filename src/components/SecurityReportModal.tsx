import React from 'react';
import { Vulnerability } from '../types/security';
import { X, Download, Printer, ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface SecurityReportModalProps {
  vulnerabilities: Vulnerability[];
  onClose: () => void;
}

export const SecurityReportModal: React.FC<SecurityReportModalProps> = ({
  vulnerabilities,
  onClose,
}) => {
  const total = vulnerabilities.length;
  const patched = vulnerabilities.filter((v) => v.status === 'patched').length;
  const vulnerable = total - patched;
  const scorePercent = Math.round((patched / total) * 100);

  const critical = vulnerabilities.filter((v) => v.severity === 'Critical' && v.status === 'vulnerable').length;
  const high = vulnerabilities.filter((v) => v.severity === 'High' && v.status === 'vulnerable').length;
  const medium = vulnerabilities.filter((v) => v.severity === 'Medium' && v.status === 'vulnerable').length;

  const downloadMarkdownReport = () => {
    const lines = [
      `# Mobile Application Security Assessment & OWASP Top 10 Audit Report`,
      `**Generated:** ${new Date().toISOString()}`,
      `**Scope:** MobileSec Bench Sandbox Applications (com.vaultpay.app, com.securenotes, com.clouddrive)`,
      `**Audit Standard:** OWASP Mobile Top 10 (M1 - M10) & OWASP MSTG`,
      ``,
      `## 1. Executive Summary`,
      `- **Overall Security Posture:** ${scorePercent}% Remediated (${patched}/${total} Test Cases Passed)`,
      `- **Critical Vulnerabilities:** ${critical}`,
      `- **High Vulnerabilities:** ${high}`,
      `- **Medium Vulnerabilities:** ${medium}`,
      ``,
      `## 2. OWASP Mobile Top 10 Benchmark Matrix`,
      `| ID | Category | Target App | Severity | CVSS | Status |`,
      `|---|---|---|---|---|---|`,
      ...vulnerabilities.map(
        (v) =>
          `| ${v.owaspId} | ${v.title} | ${v.targetApp} | ${v.severity} | ${v.cvssScore} | ${
            v.status === 'patched' ? 'PASS (Hardened)' : 'FAIL (Vulnerable)'
          } |`
      ),
      ``,
      `## 3. Detailed Findings & Remediation Guidance`,
      ...vulnerabilities.map(
        (v) =>
          `### ${v.owaspId}: ${v.title}\n- **CWE:** ${v.cwe}\n- **MSTG Ref:** ${v.mstgId}\n- **Status:** ${
            v.status === 'patched' ? 'Hardened / Resolved' : 'Vulnerable'
          }\n- **Impact:** ${v.impact}\n- **Remediation:**\n${v.remediationAdvice
            .map((a) => `  * ${a}`)
            .join('\n')}\n`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile_security_assessment_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900">
              <FileText className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Mobile Security Audit Assessment Report
              </h3>
              <p className="text-xs text-neutral-500 font-mono">
                OWASP Mobile Top 10 · MSTG Compliance Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadMarkdownReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Markdown</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-700 dark:text-neutral-300">
          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider">Overall Posture</div>
              <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                {scorePercent}%
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                {patched} / {total} Tests Hardened
              </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider">Critical Flaws</div>
              <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                {critical}
              </div>
              <div className="text-[11px] text-neutral-400">Immediate Remediation</div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider">High Flaws</div>
              <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                {high}
              </div>
              <div className="text-[11px] text-neutral-400">High Risk Exposure</div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider">Scope Coverage</div>
              <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                M1 - M10
              </div>
              <div className="text-[11px] text-neutral-400">Full Top 10 Coverage</div>
            </div>
          </div>

          {/* Compliance Matrix Table */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-800">
              OWASP Mobile Top 10 Benchmark Matrix
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {vulnerabilities.map((v) => (
                <div
                  key={v.id}
                  className="px-4 py-3 grid grid-cols-12 gap-3 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-xs"
                >
                  <div className="col-span-1 font-mono font-bold text-neutral-900 dark:text-neutral-100">
                    {v.owaspId}
                  </div>
                  <div className="col-span-6 space-y-0.5">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{v.title}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">{v.mstgId} · {v.targetApp}</div>
                  </div>
                  <div className="col-span-2 text-center font-mono">
                    CVSS {v.cvssScore.toFixed(1)}
                  </div>
                  <div className="col-span-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-mono rounded font-medium ${
                        v.status === 'patched'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {v.status === 'patched' ? 'PASS (Hardened)' : 'FAIL (Vulnerable)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
