import React from 'react';
import { Vulnerability } from '../types/security';
import { ShieldCheck, ShieldAlert, Wrench, RotateCcw, AlertTriangle } from 'lucide-react';

interface AuditSummaryProps {
  vulnerabilities: Vulnerability[];
  onPatchAll: () => void;
  onResetAll: () => void;
  onOpenReport: () => void;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({
  vulnerabilities,
  onPatchAll,
  onResetAll,
  onOpenReport,
}) => {
  const total = vulnerabilities.length;
  const patchedCount = vulnerabilities.filter((v) => v.status === 'patched').length;
  const vulnerableCount = total - patchedCount;
  
  const criticalCount = vulnerabilities.filter(
    (v) => v.severity === 'Critical' && v.status === 'vulnerable'
  ).length;
  const highCount = vulnerabilities.filter(
    (v) => v.severity === 'High' && v.status === 'vulnerable'
  ).length;
  const mediumCount = vulnerabilities.filter(
    (v) => v.severity === 'Medium' && v.status === 'vulnerable'
  ).length;

  const percentage = Math.round((patchedCount / total) * 100);

  // Determine posture grade
  let grade = 'F';
  let gradeColor = 'text-rose-600 dark:text-rose-400';
  if (percentage === 100) {
    grade = 'A+';
    gradeColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (percentage >= 80) {
    grade = 'B';
    gradeColor = 'text-teal-600 dark:text-teal-400';
  } else if (percentage >= 50) {
    grade = 'C';
    gradeColor = 'text-amber-600 dark:text-amber-400';
  } else if (percentage >= 25) {
    grade = 'D';
    gradeColor = 'text-orange-600 dark:text-orange-400';
  }

  return (
    <div className="p-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Summary Metrics with Tabular Numerals */}
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xl font-mono tabular-nums">
              <span className={gradeColor}>{grade}</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium">
                Security Posture
              </div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 font-mono tabular-nums">
                {percentage}% Remediated ({patchedCount}/{total})
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

          {/* Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" />
              <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{criticalCount}</span>
              <span>Critical</span>
            </div>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-amber-500 inline-block" />
              <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{highCount}</span>
              <span>High</span>
            </div>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-sky-500 inline-block" />
              <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{mediumCount}</span>
              <span>Medium</span>
            </div>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
              <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{patchedCount}</span>
              <span>Hardened</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2.5">
          {vulnerableCount > 0 ? (
            <button
              onClick={onPatchAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Apply All Hardening Patches</span>
            </button>
          ) : (
            <button
              onClick={onResetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Vulnerable Baseline</span>
            </button>
          )}

          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
