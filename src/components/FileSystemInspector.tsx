import React, { useState } from 'react';
import { VirtualFile, Vulnerability } from '../types/security';
import { HardDrive, FileText, Lock, Unlock, Eye, ShieldAlert, ShieldCheck, Database, FileCode } from 'lucide-react';

interface FileSystemInspectorProps {
  files: VirtualFile[];
  vulnerabilities: Vulnerability[];
  onTogglePatch: (vulnId: string) => void;
}

export const FileSystemInspector: React.FC<FileSystemInspectorProps> = ({
  files,
  vulnerabilities,
  onTogglePatch,
}) => {
  const [selectedFile, setSelectedFile] = useState<VirtualFile>(files[0]);

  // Check patch states
  const isM1PrefsPatched = vulnerabilities.find((v) => v.id === 'vuln-m1-sharedprefs')?.status === 'patched';
  const isM1DbPatched = vulnerabilities.find((v) => v.id === 'vuln-m1-sqlite-plaintext')?.status === 'patched';
  const isM7Patched = vulnerabilities.find((v) => v.id === 'vuln-m7-manifest-flags')?.status === 'patched';

  // Get active file content based on patch state
  const getFileContent = (file: VirtualFile) => {
    if (file.name === 'user_session.xml') {
      return isM1PrefsPatched && file.patchedContent ? file.patchedContent : file.content;
    }
    if (file.name === 'patient_notes.db') {
      return isM1DbPatched && file.patchedContent ? file.patchedContent : file.content;
    }
    if (file.name === 'AndroidManifest.xml') {
      return isM7Patched && file.patchedContent ? file.patchedContent : file.content;
    }
    return file.content;
  };

  const isFileVulnerable = (file: VirtualFile) => {
    if (file.name === 'user_session.xml') return !isM1PrefsPatched;
    if (file.name === 'patient_notes.db') return !isM1DbPatched;
    if (file.name === 'AndroidManifest.xml') return !isM7Patched;
    return false;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span>Virtual Device Sandbox Storage Browser</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Inspect raw application sandbox files (/data/data/&lt;package&gt;/). Observe plaintext storage vulnerabilities vs hardware-backed AES-256 & SQLCipher encryption.
          </p>
        </div>
      </div>

      {/* Main Grid: File List (4 cols) + Content Viewer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* File Navigator */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Internal Storage Directory
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {files.map((file) => {
              const vulnerable = isFileVulnerable(file);
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {file.name.endsWith('.db') ? (
                    <Database className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
                  ) : file.name.endsWith('.xml') ? (
                    <FileCode className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {file.name}
                      </span>
                      {file.isSensitive && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            vulnerable
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {vulnerable ? 'Cleartext' : 'Encrypted'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                      {file.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Content Preview */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          {/* Content Header */}
          <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {selectedFile.path}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                <span>Perms: {selectedFile.permissions}</span>
                <span aria-hidden="true">·</span>
                <span>Size: {selectedFile.size}</span>
              </div>
            </div>

            {/* Quick Patch Trigger */}
            {selectedFile.isSensitive && (
              <div>
                {selectedFile.name === 'user_session.xml' && (
                  <button
                    onClick={() => onTogglePatch('vuln-m1-sharedprefs')}
                    className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    {isM1PrefsPatched ? 'Revert to Plaintext' : 'Encrypt with Jetpack Security'}
                  </button>
                )}
                {selectedFile.name === 'patient_notes.db' && (
                  <button
                    onClick={() => onTogglePatch('vuln-m1-sqlite-plaintext')}
                    className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    {isM1DbPatched ? 'Revert to Plain SQLite' : 'Encrypt with SQLCipher'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Code Viewer Body */}
          <div className="flex-1 p-4 bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto min-h-[380px]">
            <pre className="whitespace-pre leading-relaxed">
              <code>{getFileContent(selectedFile)}</code>
            </pre>
          </div>

          {/* Vulnerability Explanation Footer */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
            {isFileVulnerable(selectedFile) ? (
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Security Vulnerability Active: </strong>
                  Sensitive customer information in this file is stored without encryption or with world-readable permissions. Anyone with physical access, ADB backup privileges, or root can extract this data.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Protected & Hardened: </strong>
                  This file is encrypted at rest using AES-256 with keys anchored in the hardware KeyStore. Unauthorized readers cannot extract plaintext records.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
