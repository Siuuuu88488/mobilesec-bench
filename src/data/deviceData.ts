import { VirtualFile, NetworkTraffic, DeviceLog } from '../types/security';

export const INITIAL_FILES: VirtualFile[] = [
  {
    name: 'user_session.xml',
    path: '/data/data/com.vaultpay.app/shared_prefs/user_session.xml',
    type: 'file',
    permissions: '-rw-rw-rw- (666 World Readable)',
    size: '412 B',
    isSensitive: true,
    content: `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <!-- VULNERABLE: Sensitive customer PIN and PCI data in plaintext XML -->
    <string name="master_pin">9042</string>
    <string name="user_email">alex.chen@cybersec.org</string>
    <string name="auth_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfODg5MiIsImFkbWluIjp0cnVlfQ...</string>
    <string name="card_number">4532-8812-9901-3421</string>
    <string name="card_expiry">11/29</string>
    <string name="card_cvv">821</string>
    <string name="account_balance">$14,250.00</string>
</map>`,
    patchedContent: `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <!-- SECURE: Encrypted via Jetpack Security EncryptedSharedPreferences (AES-256-GCM) -->
    <string name="__androidx_security_crypto_encrypted_prefs_key_keyset__">AQEBAW4v7...[KEYSTORE_BLOB]</string>
    <string name="__androidx_security_crypto_encrypted_prefs_value_keyset__">AQEBAW4v7...[KEYSTORE_BLOB]</string>
    <string name="Ac7jY9Pq1w==">Afh4kK90+x2LaQ98mYqXw1Z8v4M9kZk1kL7Q==</string>
    <string name="Bv29Lk50=">Afh4wQ90+x2LaQ891m230198v4M902k91kL==</string>
    <string name="Lq981kZ=">Bgh82K01+x98aQ109mZkQ1Z9v8M21kL891Q==</string>
</map>`
  },
  {
    name: 'patient_notes.db',
    path: '/data/data/com.securenotes/databases/notes.db',
    type: 'file',
    permissions: '-rw-rw---- (660 Private)',
    size: '16.0 KB',
    isSensitive: true,
    content: `SQLite format 3
Table: patient_notes
Row 1: [ID: 101] Patient: Jane Doe | SSN: ***-**-6789 | Condition: Type-1 Diabetes, Severe Penicillin Allergy | Rx: Lisinopril 10mg daily
Row 2: [ID: 102] Patient: Marcus Vance | SSN: ***-**-4432 | Condition: Stage 2 Chronic Kidney Disease | Rx: Erythropoietin 4000u
Row 3: [ID: 103] Patient: Elena Rostova | SSN: ***-**-9912 | Condition: Post-Trauma Stress & Anxiety | Rx: Alprazolam 0.5mg PRN`,
    patchedContent: `SQLCipher 4.5.3 (256-bit AES-CBC with HMAC-SHA512)
[CIPHERTEXT DATABASE PAGES]
8a 2f c1 09 de 44 91 b2 c0 98 12 77 e4 55 1a 90  ..A..D....wU..
99 01 fb ca 33 22 18 ff a0 4d 71 e2 39 01 ba cd  ....3"...Mq.9...
ef 12 aa bb cc dd ee ff 00 11 22 33 44 55 66 77  .........."3DUfw
(Raw binary encrypted pages. Decryption requires hardware KeyStore signature)`
  },
  {
    name: 'cloud_files.db',
    path: '/data/data/com.clouddrive/databases/cloud_files.db',
    type: 'file',
    permissions: '-rw-rw---- (660 Private)',
    size: '8.0 KB',
    isSensitive: false,
    content: `SQLite format 3
Table: files
Row 1: [ID: 1] Name: quarterly_financial_audit.pdf | Size: 2.4MB | Owner: CFO
Row 2: [ID: 2] Name: server_deployment_keys.pem | Size: 1.8KB | Owner: DevOps
Row 3: [ID: 3] Name: employee_payroll_2026.xlsx | Size: 450KB | Owner: HR`
  },
  {
    name: 'network_security_config.xml',
    path: '/res/xml/network_security_config.xml',
    type: 'file',
    permissions: '-rw-r--r-- (644 Read Only)',
    size: '380 B',
    isSensitive: true,
    content: `<?xml version="1.0" encoding="utf-8"?>
<!-- VULNERABLE CONFIGURATION: Cleartext HTTP is allowed -->
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" /> <!-- Allows rogue user-installed CA certs -->
        </trust-anchors>
    </base-config>
</network-security-config>`,
    patchedContent: `<?xml version="1.0" encoding="utf-8"?>
<!-- SECURE CONFIGURATION: Cleartext blocked & Strict Pinning -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config>
        <domain includeSubdomains="true">api.vaultpay.com</domain>
        <pin-set expiration="2027-12-31">
            <pin digest="SHA-256">k2v657xBsOwg11+SZqYReHmNXYvTupN93NumYCefGuI=</pin>
            <pin digest="SHA-256">WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18=</pin>
        </pin-set>
    </domain-config>
</network-security-config>`
  },
  {
    name: 'AndroidManifest.xml',
    path: '/AndroidManifest.xml',
    type: 'file',
    permissions: '-rw-r--r-- (644 Read Only)',
    size: '1.8 KB',
    isSensitive: true,
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vaultpay.app">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:debuggable="true"
        android:usesCleartextTraffic="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name">

        <!-- VULNERABLE: Exported admin activity callable by any app -->
        <activity
            android:name=".ui.AdminTransferActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="com.vaultpay.action.EXECUTE_TRANSFER" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <!-- VULNERABLE: Custom deep link scheme without verification -->
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

    </application>
</manifest>`,
    patchedContent: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vaultpay.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />

    <application
        android:allowBackup="false"
        android:debuggable="false"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name">

        <!-- SECURE: Activity restricted to host package -->
        <activity
            android:name=".ui.AdminTransferActivity"
            android:exported="false">
        </activity>

        <!-- SECURE: Android App Links with verified HTTPS domain -->
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

    </application>
</manifest>`
  }
];

export const INITIAL_TRAFFIC: NetworkTraffic[] = [
  {
    id: 'req-001',
    timestamp: '11:42:04.120',
    app: 'VaultPay',
    method: 'POST',
    url: 'http://api.vaultpay.com/v1/auth/login',
    protocol: 'HTTP/1.1',
    isEncrypted: false,
    isPinned: false,
    requestHeaders: {
      'Host': 'api.vaultpay.com',
      'User-Agent': 'VaultPay-Android/1.0.4',
      'Content-Type': 'application/json'
    },
    requestBody: '{"email":"alex.chen@cybersec.org","pin":"9042","device_id":"SM-S918B"}',
    responseStatus: 200,
    responseBody: '{"status":"ok","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","account_id":"ACC-8892"}'
  },
  {
    id: 'req-002',
    timestamp: '11:42:15.340',
    app: 'VaultPay',
    method: 'POST',
    url: 'http://api.vaultpay.com/v1/transfer',
    protocol: 'HTTP/1.1',
    isEncrypted: false,
    isPinned: false,
    requestHeaders: {
      'Host': 'api.vaultpay.com',
      'Authorization': 'Bearer eyJhbGciOi...',
      'Content-Type': 'application/json'
    },
    requestBody: '{"from_acc":"ACC-8892","recipient":"target@merchant.com","amount":500.00,"currency":"USD"}',
    responseStatus: 200,
    responseBody: '{"tx_id":"TX-990234","status":"COMPLETED","balance":13750.00}'
  },
  {
    id: 'req-003',
    timestamp: '11:42:48.890',
    app: 'SecureNotes',
    method: 'GET',
    url: 'https://notes.securecloud.io/sync/patient_batch_1',
    protocol: 'HTTPS/TLS 1.3',
    isEncrypted: true,
    isPinned: false,
    requestHeaders: {
      'Host': 'notes.securecloud.io',
      'Authorization': 'Bearer note_sync_tok_9918'
    },
    responseStatus: 200,
    responseBody: '{"sync_count": 3, "timestamp": 1731152568}'
  }
];

export const INITIAL_LOGS: DeviceLog[] = [
  {
    id: 'log-1',
    timestamp: '11:40:01.042',
    level: 'I',
    tag: 'ActivityManager',
    app: 'system',
    message: 'Start proc 14210:com.vaultpay.app/u0a210 for activity com.vaultpay.ui.MainActivity'
  },
  {
    id: 'log-2',
    timestamp: '11:40:02.115',
    level: 'SEC',
    tag: 'VaultPaySession',
    app: 'VaultPay',
    message: '[VULNERABILITY] Credentials written to SharedPreferences using MODE_WORLD_READABLE'
  },
  {
    id: 'log-3',
    timestamp: '11:40:05.420',
    level: 'W',
    tag: 'SecurityEnforcer',
    app: 'VaultPay',
    message: 'Cleartext HTTP traffic permitted for host api.vaultpay.com (Strict TLS bypass active)'
  },
  {
    id: 'log-4',
    timestamp: '11:40:10.880',
    level: 'SEC',
    tag: 'BiometricCheck',
    app: 'VaultPay',
    message: 'BiometricPrompt succeeded without CryptoObject signature verification'
  },
  {
    id: 'log-5',
    timestamp: '11:40:15.302',
    level: 'I',
    tag: 'SecureNotesDB',
    app: 'SecureNotes',
    message: 'Initialized SQLite database at /data/data/com.securenotes/databases/notes.db (SQLCipher inactive)'
  }
];
