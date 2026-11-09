import React, { useState } from 'react';
import { NetworkTraffic, Vulnerability } from '../types/security';
import { Activity, ShieldAlert, ShieldCheck, Lock, Unlock, ArrowDown, Send, Globe, RefreshCw } from 'lucide-react';

interface NetworkInspectorProps {
  traffic: NetworkTraffic[];
  vulnerabilities: Vulnerability[];
  onTogglePatch: (vulnId: string) => void;
  onSendSimulatedRequest: () => void;
}

export const NetworkInspector: React.FC<NetworkInspectorProps> = ({
  traffic,
  vulnerabilities,
  onTogglePatch,
  onSendSimulatedRequest,
}) => {
  const [selectedReq, setSelectedReq] = useState<NetworkTraffic>(traffic[0]);

  const isM2Patched = vulnerabilities.find((v) => v.id === 'vuln-m2-cleartext-tls')?.status === 'patched';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span>Network Traffic Interceptor & TLS Analyzer</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Simulate a Man-in-the-Middle (Mitmproxy / Charles Proxy) environment. Evaluate cleartext HTTP traffic, certificate validation bypasses, and SPKI Certificate Pinning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTogglePatch('vuln-m2-cleartext-tls')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs ${
              isM2Patched
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isM2Patched ? 'Revert to Cleartext HTTP' : 'Enforce Cert Pinning & TLS'}
          </button>

          <button
            onClick={onSendSimulatedRequest}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Request</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Request List (5 cols) + Detail Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Request Capture List */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span>Captured Packets</span>
            <span className="font-mono text-neutral-400 text-[11px]">{traffic.length} streams</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {traffic.map((req) => {
              const isSelected = selectedReq.id === req.id;
              const isVulnerable = !req.isEncrypted || (!req.isPinned && !isM2Patched);
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="mt-0.5">
                    {isVulnerable ? (
                      <Unlock className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                          {req.method}
                        </span>
                        <span className="truncate text-neutral-700 dark:text-neutral-300">
                          {req.url.replace('http://', '').replace('https://', '')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400 shrink-0">
                        {req.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                      <span className={isVulnerable ? 'text-rose-500 font-semibold' : 'text-emerald-500'}>
                        {req.protocol}
                      </span>
                      <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="text-neutral-400">{req.app}</span>
                      <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="text-emerald-600 font-bold">{req.responseStatus} OK</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Request Deep-Dive Inspector */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {selectedReq.method} {selectedReq.url}
              </span>
              <div className="text-[11px] text-neutral-400 font-mono">
                Stream ID: {selectedReq.id} · Timestamp: {selectedReq.timestamp}
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                !selectedReq.isEncrypted || !isM2Patched
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {!selectedReq.isEncrypted || !isM2Patched ? 'Plaintext / Intercepted' : 'TLS 1.3 Pinned'}
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Headers */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Request Headers
              </div>
              <div className="p-3 bg-neutral-950 text-neutral-300 font-mono text-xs rounded-lg overflow-x-auto">
                {Object.entries(selectedReq.requestHeaders).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-neutral-500">{key}:</span> {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body */}
            {selectedReq.requestBody && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>Payload Body</span>
                  {!selectedReq.isEncrypted && (
                    <span className="text-[11px] text-rose-600 font-mono">
                      [!] Credentials Exposed in Transit
                    </span>
                  )}
                </div>
                <div className="p-3 bg-neutral-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{selectedReq.requestBody}</pre>
                </div>
              </div>
            )}

            {/* Response Body */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Server Response ({selectedReq.responseStatus} OK)
              </div>
              <div className="p-3 bg-neutral-950 text-neutral-300 font-mono text-xs rounded-lg overflow-x-auto">
                <pre className="whitespace-pre-wrap">{selectedReq.responseBody}</pre>
              </div>
            </div>
          </div>

          {/* Security Alert Footer */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-xs">
            {!selectedReq.isEncrypted || !isM2Patched ? (
              <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>CWE-295 / CWE-319 Risk: </strong>
                  This HTTP request transmits authentication tokens and financial details without encryption or certificate pinning. A rogue Wi-Fi AP or ARP spoofing attacker can steal tokens or alter transaction amounts.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>TLS 1.3 Certificate Pinning Active: </strong>
                  Requests are secured end-to-end with pinned SPKI SHA-256 public keys. Even if a user installs a malicious root certificate authority, the app aborts the handshake immediately.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
