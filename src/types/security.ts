export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type OWASPCategory =
  | 'M1: Insecure Data Storage'
  | 'M2: Insecure Communication'
  | 'M3: Insecure Authentication'
  | 'M4: Insufficient Cryptography'
  | 'M5: Insecure Authorization'
  | 'M6: Client-Side Injection'
  | 'M7: Security Misconfiguration'
  | 'M8: Insecure Deep Linking & IPC'
  | 'M9: Reverse Engineering & Anti-Tampering'
  | 'M10: Extraneous Functionality';

export type AppTarget = 'VaultPay' | 'SecureNotes' | 'CloudDrive';

export type VulnStatus = 'vulnerable' | 'patched';

export interface CodeBlock {
  file: string;
  language: 'kotlin' | 'java' | 'swift' | 'xml';
  snippet: string;
  highlightLineRange?: [number, number];
  explanation: string;
}

export interface ExploitSimulation {
  tool: 'ADB Shell' | 'Frida Script' | 'Network Proxy' | 'Drozer' | 'Static Analyzer';
  command: string;
  description: string;
  vulnerableOutput: string;
  remediatedOutput: string;
}

export interface Vulnerability {
  id: string;
  owaspId: string; // e.g. M1, M2...
  category: OWASPCategory;
  title: string;
  targetApp: AppTarget;
  severity: Severity;
  cwe: string;
  cvssScore: number;
  mstgId: string; // OWASP MSTG standard identifier e.g. MSTG-STORAGE-1
  summary: string;
  attackVector: string;
  impact: string;
  status: VulnStatus;
  vulnerableCode: CodeBlock;
  patchedCode: CodeBlock;
  simulation: ExploitSimulation;
  remediationAdvice: string[];
}

export interface DeviceLog {
  id: string;
  timestamp: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E' | 'SEC';
  tag: string;
  message: string;
  app: string;
}

export interface VirtualFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  permissions: string;
  size: string;
  content?: string;
  patchedContent?: string;
  isSensitive?: boolean;
}

export interface NetworkTraffic {
  id: string;
  timestamp: string;
  app: AppTarget;
  method: 'GET' | 'POST' | 'PUT';
  url: string;
  protocol: 'HTTP/1.1' | 'HTTPS/TLS 1.3';
  isEncrypted: boolean;
  isPinned: boolean;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseStatus: number;
  responseBody: string;
}
