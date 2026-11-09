import { Vulnerability } from '../types/security';

export const INITIAL_VULNERABILITIES: Vulnerability[] = [
  {
    id: 'vuln-m1-sharedprefs',
    owaspId: 'M1',
    category: 'M1: Insecure Data Storage',
    title: 'Plaintext Credentials in SharedPreferences',
    targetApp: 'VaultPay',
    severity: 'Critical',
    cwe: 'CWE-312: Cleartext Storage of Sensitive Information',
    cvssScore: 8.6,
    mstgId: 'MSTG-STORAGE-1',
    summary: 'The application stores user Master PIN, session tokens, and card numbers in an unencrypted XML file under /data/data/com.vaultpay.app/shared_prefs/ with insecure file permissions.',
    attackVector: 'An attacker with physical access, root access, or utilizing ADB backup/malicious app with read access can extract the raw XML containing plaintext credentials.',
    impact: 'Full compromise of user credentials, banking PIN, and session hijacking without brute force.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/vaultpay/data/SessionManager.kt',
      language: 'kotlin',
      highlightLineRange: [6, 12],
      snippet: `class SessionManager(context: Context) {
    // VULNERABLE: Using MODE_WORLD_READABLE and plaintext SharedPreferences
    private val prefs = context.getSharedPreferences(
        "user_session",
        Context.MODE_WORLD_READABLE // Deprecated & dangerous
    )

    fun saveUserCredentials(pin: String, authToken: String, cardNumber: String) {
        prefs.edit().apply {
            putString("master_pin", pin)           // Stored in cleartext!
            putString("auth_token", authToken)     // Token exposed!
            putString("card_num", cardNumber)      // PCI-DSS violation!
            apply()
        }
    }
}`,
      explanation: 'SharedPreferences files are stored as plain XML in the app sandbox. If device is rooted, backup is enabled, or legacy permissions are used, sensitive secrets are directly exposed in plaintext.'
    },
    patchedCode: {
      file: 'com/vaultpay/data/SessionManager.kt',
      language: 'kotlin',
      snippet: `import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys

class SessionManager(context: Context) {
    // SECURE: Hardware-backed AndroidKeyStore Master Key & AES-256 GCM encryption
    private val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)

    private val securePrefs = EncryptedSharedPreferences.create(
        "secure_session",
        masterKeyAlias,
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveUserCredentials(pin: String, authToken: String, cardNumber: String) {
        securePrefs.edit().apply {
            putString("master_pin", pin)
            putString("auth_token", authToken)
            putString("card_num", cardNumber)
            apply()
        }
    }
}`,
      explanation: 'Android Jetpack Security EncryptedSharedPreferences automatically encrypts keys with AES-256 SIV and values with AES-256 GCM using a key securely anchored in the Android KeyStore hardware.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb shell cat /data/data/com.vaultpay.app/shared_prefs/user_session.xml',
      description: 'Dumps the application SharedPreferences XML file from the device storage filesystem.',
      vulnerableOutput: `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="master_pin">9042</string>
    <string name="auth_token">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfODg5MiJ9...</string>
    <string name="card_num">4532-8812-9901-3421</string>
    <string name="cvv">821</string>
</map>
[!] ALERT: Plaintext user secrets, PIN, and JWT found in storage.`,
      remediatedOutput: `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="__androidx_security_crypto_encrypted_prefs_key_keyset__">AQEBAW...[ENC]</string>
    <string name="Ac7jY9Pq1w==">Afh4kK90+x2LaQ98mYqXw1Z8v4M9kZk1kL==</string>
    <string name="Bv29Lk50=">Afh4wQ90+x2LaQ891m230198v4M902k==</string>
</map>
[*] SUCCESS: Keys and values are encrypted via AES-256-GCM. No cleartext credentials exposed.`
    },
    remediationAdvice: [
      'Migrate to Android Jetpack EncryptedSharedPreferences or iOS Keychain Services.',
      'Never use deprecated flags like Context.MODE_WORLD_READABLE or MODE_WORLD_WRITEABLE.',
      'Anchor encryption keys in hardware-backed KeyStore (TEE / Secure Enclave).'
    ]
  },
  {
    id: 'vuln-m1-sqlite-plaintext',
    owaspId: 'M1',
    category: 'M1: Insecure Data Storage',
    title: 'Unencrypted SQLite Database with Sensitive Health Records',
    targetApp: 'SecureNotes',
    severity: 'High',
    cwe: 'CWE-311: Missing Encryption of Sensitive Data',
    cvssScore: 7.5,
    mstgId: 'MSTG-STORAGE-2',
    summary: 'The application stores private patient health records, biometric diagnoses, and prescriptions in a standard SQLite database file without encryption at rest.',
    attackVector: 'Reading database file via backup extraction or root file inspection gives instant SQL query access.',
    impact: 'Unauthorized access to confidential HIPAA/GDPR protected health notes and medical histories.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/securenotes/db/NotesDbHelper.kt',
      language: 'kotlin',
      highlightLineRange: [5, 10],
      snippet: `class NotesDbHelper(context: Context) : SQLiteOpenHelper(context, "notes.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        // VULNERABLE: Unencrypted SQLite database storing sensitive diagnoses
        db.execSQL("""
            CREATE TABLE patient_notes (
                id INTEGER PRIMARY KEY,
                patient_name TEXT,
                ssn TEXT,
                medical_history TEXT,
                prescription TEXT
            )
        """)
    }
}`,
      explanation: 'Standard SQLite databases write unencrypted pages to disk. Any reader with file access can dump tables without any key or password.'
    },
    patchedCode: {
      file: 'com/securenotes/db/NotesDbHelper.kt',
      language: 'kotlin',
      snippet: `import net.sqlcipher.database.SQLiteDatabase
import net.sqlcipher.database.SQLiteOpenHelper

class NotesDbHelper(context: Context, private val passphraseProvider: PassphraseProvider) 
    : SQLiteOpenHelper(context, "secure_notes.db", null, 1) {

    fun getSecureDatabase(): SQLiteDatabase {
        // SECURE: Uses SQLCipher with AES-256-CBC full-database encryption
        val dbKey = passphraseProvider.getHardwareKey()
        return getWritableDatabase(dbKey)
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE patient_notes (
                id INTEGER PRIMARY KEY,
                patient_name TEXT,
                ssn TEXT,
                medical_history TEXT,
                prescription TEXT
            )
        """)
    }
}`,
      explanation: 'SQLCipher encrypts all database pages using 256-bit AES in CBC mode with HMAC-SHA512 integrity checks. Database file appears as pseudo-random noise to any unauthorized reader.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb shell sqlite3 /data/data/com.securenotes/databases/notes.db "SELECT * FROM patient_notes;"',
      description: 'Executes SQLite query directly on the raw database file.',
      vulnerableOutput: `1|Jane Doe|***-**-6789|Type-1 Diabetes; Hypertension; Allergies to Penicillin|Lisinopril 10mg daily
2|Marcus Vance|***-**-4432|Stage 2 Chronic Kidney Disease|Erythropoietin 4000u
[!] ALERT: Raw patient records, SSN, and medical history returned in cleartext.`,
      remediatedOutput: `Error: file is not a database (or encrypted with SQLCipher)
[!] sqlite3 returned: 26 (SQLITE_NOTADB)
[*] SUCCESS: SQLCipher header check rejected unauthenticated read. Database pages are 256-bit encrypted.`
    },
    remediationAdvice: [
      'Employ SQLCipher or Room database with encrypted driver.',
      'Protect database passphrases inside AndroidKeyStore or iOS Keychain.',
      'Avoid storing plaintext PII/PHI in local database caches.'
    ]
  },
  {
    id: 'vuln-m2-cleartext-tls',
    owaspId: 'M2',
    category: 'M2: Insecure Communication',
    title: 'Cleartext HTTP Traffic & Disabled TLS Verification',
    targetApp: 'VaultPay',
    severity: 'Critical',
    cwe: 'CWE-295: Improper Certificate Validation',
    cvssScore: 9.0,
    mstgId: 'MSTG-NETWORK-1',
    summary: 'The app explicitly permits cleartext HTTP traffic via network configuration and bypasses X.509 certificate validation using a TrustAllManager, leaving network calls vulnerable to MITM.',
    attackVector: 'Attacker on public WiFi (ARP spoofing / rogue AP) intercepts and manipulates transaction payloads and authorization headers in transit.',
    impact: 'Man-in-the-Middle (MITM) session hijacking, transaction manipulation, and credential theft.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/vaultpay/network/ApiClient.kt',
      language: 'kotlin',
      highlightLineRange: [5, 14],
      snippet: `fun getUnsafeOkHttpClient(): OkHttpClient {
    // VULNERABLE: Disables all TLS certificate verification
    val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
        override fun checkClientTrusted(chain: Array<X509Certificate>?, authType: String?) {}
        override fun checkServerTrusted(chain: Array<X509Certificate>?, authType: String?) {} // Trust ANY certificate!
        override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
    })

    val sslContext = SSLContext.getInstance("SSL")
    sslContext.init(null, trustAllCerts, SecureRandom())

    return OkHttpClient.Builder()
        .sslSocketFactory(sslContext.socketFactory, trustAllCerts[0] as X509TrustManager)
        .hostnameVerifier { _, _ -> true } // Accepts any spoofed hostname!
        .build()
}`,
      explanation: 'Overriding X509TrustManager with blank implementations and returning true in HostnameVerifier completely destroys TLS guarantees. Any self-signed certificate will be blindly trusted.'
    },
    patchedCode: {
      file: 'com/vaultpay/network/ApiClient.kt',
      language: 'kotlin',
      snippet: `import okhttp3.CertificatePinner
import okhttp3.OkHttpClient

fun getHardenedOkHttpClient(): OkHttpClient {
    // SECURE: Enforces strict SHA-256 certificate pinning & TLS 1.3
    val certificatePinner = CertificatePinner.Builder()
        .add("api.vaultpay.com", "sha256/k2v657xBsOwg11+SZqYReHmNXYvTupN93NumYCefGuI=")
        .add("api.vaultpay.com", "sha256/WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18=") // Backup pin
        .build()

    return OkHttpClient.Builder()
        .certificatePinner(certificatePinner)
        // Uses system default trust manager + modern TLS
        .build()
}`,
      explanation: 'Enforces Certificate Pinning with primary and backup SHA-256 SPKI hashes, rejecting rogue CA certificates and proxies.'
    },
    simulation: {
      tool: 'Network Proxy',
      command: 'mitmproxy --listen-port 8080 --mode transparent (intercepting api.vaultpay.com)',
      description: 'Simulates a Man-in-the-Middle interception proxy on the local Wi-Fi router.',
      vulnerableOutput: `[HTTP 200] POST https://api.vaultpay.com/v1/transfer
Request Headers:
  Authorization: Bearer eyJhbGciOi...
  Host: api.vaultpay.com
Request Body:
  {"recipient": "98124018", "amount": 1450.00, "currency": "USD"}
[!] ALERT: Mitmproxy forged certificate accepted! Transfer payload and bearer token intercepted in cleartext.`,
      remediatedOutput: `[TLS HANDSHAKE FAILED]
javax.net.ssl.SSLPeerUnverifiedException: Certificate pinning failure!
  Peer certificate chain:
    sha256/ROGUExyZ... (Untrusted mitmproxy CA)
  Pinned certificates for api.vaultpay.com:
    sha256/k2v657xBsOwg11+SZqYReHmNXYvTupN93NumYCefGuI=
[*] SUCCESS: Connection aborted immediately. MITM interception prevented.`
    },
    remediationAdvice: [
      'Enable res/xml/network_security_config.xml with cleartextTrafficPermitted="false".',
      'Implement strict Certificate Pinning with backup SPKI hashes.',
      'Never accept custom TrustManagers that do not validate the certification chain.'
    ]
  },
  {
    id: 'vuln-m3-biometric-bypass',
    owaspId: 'M3',
    category: 'M3: Insecure Authentication',
    title: 'Client-Side Biometric Authentication Bypass',
    targetApp: 'VaultPay',
    severity: 'High',
    cwe: 'CWE-287: Improper Authentication',
    cvssScore: 8.1,
    mstgId: 'MSTG-AUTH-1',
    summary: 'The application authorizes sensitive transactions purely based on BiometricPrompt onAuthenticationSucceeded callback without wrapping a hardware-backed CryptoObject or validating a server challenge.',
    attackVector: 'A dynamic instrumentation tool like Frida hooks the callback method and forces it to return success without presenting a fingerprint.',
    impact: 'Complete bypass of biometric unlock, allowing unauthorized fund transfers.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/vaultpay/auth/BiometricAuthHelper.kt',
      language: 'kotlin',
      highlightLineRange: [8, 14],
      snippet: `fun promptForBiometric(activity: FragmentActivity, onResult: (Boolean) -> Unit) {
    val prompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            super.onAuthenticationSucceeded(result)
            // VULNERABLE: Pure client-side boolean flag! 
            // Easily hooked via Frida: onAuthenticationSucceeded() -> executeTransfer()
            onResult(true)
        }

        override fun onAuthenticationFailed() {
            onResult(false)
        }
    })
    // Calling authenticate without CryptoObject!
    prompt.authenticate(promptInfo)
}`,
      explanation: 'Without a CryptoObject, biometric success is merely a client-side signal. A simple runtime hook of onAuthenticationSucceeded bypasses the entire biometric check.'
    },
    patchedCode: {
      file: 'com/vaultpay/auth/BiometricAuthHelper.kt',
      language: 'kotlin',
      snippet: `import androidx.biometric.BiometricPrompt
import java.security.Signature

fun promptWithCrypto(activity: FragmentActivity, serverNonce: ByteArray, onVerified: (ByteArray) -> Unit) {
    // SECURE: CryptoObject backed by AndroidKeyStore requiring biometric presence
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val privateKey = keyStore.getKey("TransferAuthKey", null) as PrivateKey

    val signature = Signature.getInstance("SHA256withECDSA").apply {
        initSign(privateKey)
    }

    val cryptoObject = BiometricPrompt.CryptoObject(signature)

    val prompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            // Hardware unlocked the crypto cipher; sign server challenge
            val authenticatedCrypto = result.cryptoObject?.signature ?: return
            authenticatedCrypto.update(serverNonce)
            val signedToken = authenticatedCrypto.sign()
            // Send signed token to backend server for cryptographic verification
            onVerified(signedToken)
        }
    })

    // Authenticate with CryptoObject - OS enforces hardware unlock!
    prompt.authenticate(promptInfo, cryptoObject)
}`,
      explanation: 'Requiring a KeyStore Key initialized with setUserAuthenticationRequired(true) means the cryptographic key cannot sign anything unless the Secure Element/TEE verifies real biometric matching.'
    },
    simulation: {
      tool: 'Frida Script',
      command: 'frida -U -f com.vaultpay -l bypass_biometrics.js --no-pause',
      description: 'Injects a Javascript hook into the Android runtime to trigger onAuthenticationSucceeded artificially.',
      vulnerableOutput: `[*] Attaching Frida to com.vaultpay...
[*] Hooking BiometricPrompt.AuthenticationCallback.onAuthenticationSucceeded...
[+] Injected synthetic AuthenticationResult.
[!] SUCCESS: Biometric dialog bypassed! App executed authorizeTransaction() without biometric input.`,
      remediatedOutput: `[*] Attaching Frida to com.vaultpay...
[*] Attempting to trigger onAuthenticationSucceeded without hardware token...
[!] EXCEPTION: java.security.SignatureException: Key not authorized!
AndroidKeyStore: Key requires authenticated user state. Secure enclave rejected signing.
[*] SUCCESS: Backend rejected request; missing cryptographic signature from TEE.`
    },
    remediationAdvice: [
      'Always bind BiometricPrompt to a BiometricPrompt.CryptoObject initialized with a KeyStore key.',
      'Configure key with setUserAuthenticationRequired(true) and setInvalidatedByBiometricEnrollment(true).',
      'Validate cryptographic signatures on the backend server, not on device.'
    ]
  },
  {
    id: 'vuln-m4-hardcoded-crypto',
    owaspId: 'M4',
    category: 'M4: Insufficient Cryptography',
    title: 'Hardcoded Cryptographic Key & Insecure AES-ECB Mode',
    targetApp: 'SecureNotes',
    severity: 'High',
    cwe: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm',
    cvssScore: 7.9,
    mstgId: 'MSTG-CRYPTO-1',
    summary: 'The application uses a static hardcoded 128-bit AES key in bytecode and executes encryption in ECB mode without an initialization vector, leaking pattern structures and enabling trivial reverse-engineering.',
    attackVector: 'Decompiling APK using Jadx or apktool reveals the static encryption key string in bytecode.',
    impact: 'All encrypted notes can be decrypted offline in bulk across all installations.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/securenotes/crypto/CipherUtil.java',
      language: 'java',
      highlightLineRange: [4, 11],
      snippet: `public class CipherUtil {
    // VULNERABLE: Hardcoded static encryption key in APK source
    private static final String STATIC_KEY = "Sup3rS3cr3tK3y!!"; 

    public static byte[] encrypt(String plaintext) throws Exception {
        // VULNERABLE: ECB mode has no IV; identical blocks produce identical ciphertexts
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        SecretKeySpec keySpec = new SecretKeySpec(STATIC_KEY.getBytes(), "AES");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        return cipher.doFinal(plaintext.getBytes());
    }
}`,
      explanation: 'Hardcoded keys in DEX/APK files are easily recovered with standard decompilers. AES in ECB mode preserves data patterns, which allows replay and ciphertext analysis.'
    },
    patchedCode: {
      file: 'com/securenotes/crypto/CipherUtil.java',
      language: 'java',
      snippet: `import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;

public class CipherUtil {
    // SECURE: Dynamic hardware-backed key generated in AndroidKeyStore with AES-GCM
    private static final String KEY_ALIAS = "NoteMasterKey";

    public static byte[] encrypt(byte[] plaintext, byte[] ivOut) throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        SecretKey secretKey = (SecretKey) keyStore.getKey(KEY_ALIAS, null);

        // SECURE: AES-GCM provides both confidentiality and authentication
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] iv = cipher.getIV();
        System.arraycopy(iv, 0, ivOut, 0, iv.length);
        return cipher.doFinal(plaintext);
    }
}`,
      explanation: 'AES-GCM provides authenticated encryption with associated data (AEAD) and random IVs. The secret key is stored in hardware and never exported to user space.'
    },
    simulation: {
      tool: 'Static Analyzer',
      command: 'jadx -d out/ app-release.apk && grep -rn "AES" out/',
      description: 'Decompiles APK bytecodes to locate hardcoded cryptographic materials.',
      vulnerableOutput: `[jadx] Decompiling classes.dex...
out/sources/com/securenotes/crypto/CipherUtil.java:4: 
    private static final String STATIC_KEY = "Sup3rS3cr3tK3y!!";
out/sources/com/securenotes/crypto/CipherUtil.java:8: 
    Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
[!] ALERT: Hardcoded key found in plaintext! ECB mode detected without IV.`,
      remediatedOutput: `[jadx] Decompiling classes.dex...
out/sources/com/securenotes/crypto/CipherUtil.java: 
    Cipher.getInstance("AES/GCM/NoPadding");
    KeyStore.getInstance("AndroidKeyStore");
[*] SUCCESS: No hardcoded key strings found. Key material generated inside AndroidKeyStore.`
    },
    remediationAdvice: [
      'Store all cryptographic keys in the Android KeyStore or iOS Keychain.',
      'Use AES-GCM (Galois/Counter Mode) with a unique 12-byte IV for every encryption.',
      'Never use AES-ECB mode or static IVs in production.'
    ]
  },
  {
    id: 'vuln-m5-exported-activity',
    owaspId: 'M5',
    category: 'M5: Insecure Authorization',
    title: 'Exported Admin Activity Without Permission Checks',
    targetApp: 'VaultPay',
    severity: 'High',
    cwe: 'CWE-926: Improper Export of Android Application Components',
    cvssScore: 8.3,
    mstgId: 'MSTG-PLATFORM-1',
    summary: 'The AdminTransferActivity is declared with android:exported="true" in AndroidManifest.xml and does not verify caller signature or user session, allowing any untrusted third-party app to execute privileged transfers.',
    attackVector: 'A malicious application on the device fires an Intent targeted at com.vaultpay/.AdminTransferActivity with arbitrary extra fields.',
    impact: 'Privilege escalation and unauthorized money transfers executed in background without user knowledge.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'AndroidManifest.xml',
      language: 'xml',
      highlightLineRange: [4, 9],
      snippet: `<!-- VULNERABLE: AdminTransferActivity is exported to the entire OS without protection -->
<activity
    android:name="com.vaultpay.ui.AdminTransferActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="com.vaultpay.action.EXECUTE_TRANSFER" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>`,
      explanation: 'Declaring android:exported="true" without an android:permission attribute or signature check exposes this internal administrative UI to any application installed on the operating system.'
    },
    patchedCode: {
      file: 'AndroidManifest.xml',
      language: 'xml',
      snippet: `<!-- SECURE: Activity is not exported to other apps, or protected with signature permission -->
<permission 
    android:name="com.vaultpay.permission.ADMIN_TRANSFER" 
    android:protectionLevel="signature" />

<activity
    android:name="com.vaultpay.ui.AdminTransferActivity"
    android:exported="false"
    android:permission="com.vaultpay.permission.ADMIN_TRANSFER">
    <!-- Component is only callable within this app or apps signed with the same keystore -->
</activity>`,
      explanation: 'Setting android:exported="false" restricts invocation exclusively to the host application. If cross-app communication is needed, protectionLevel="signature" restricts it to same-vendor apps.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb shell am start -n com.vaultpay/.ui.AdminTransferActivity --es recipient "attacker@dark.net" --ef amount 5000.0',
      description: 'Sends an explicit Activity Intent directly to the target component.',
      vulnerableOutput: `Starting: Intent { cmp=com.vaultpay/.ui.AdminTransferActivity (has extras) }
ActivityManager: Start proc com.vaultpay for activity com.vaultpay/.ui.AdminTransferActivity
[!] ALERT: AdminTransferActivity launched successfully!
Transfer dialog displayed: Transferring $5000.00 to attacker@dark.net.`,
      remediatedOutput: `Starting: Intent { cmp=com.vaultpay/.ui.AdminTransferActivity (has extras) }
java.lang.SecurityEvent: Permission Denial: starting Intent { cmp=com.vaultpay/.ui.AdminTransferActivity } from pid=1290, uid=2000 not exported from uid 10142
[*] SUCCESS: OS kernel rejected intent. Non-exported component cannot be invoked by external process.`
    },
    remediationAdvice: [
      'Explicitly set android:exported="false" on all activities, services, and receivers that do not require external invocation.',
      'If sharing is required, enforce custom permissions with protectionLevel="signature".',
      'Validate caller identity using getCallingUid() or getCallingPackage().'
    ]
  },
  {
    id: 'vuln-m6-sqli-provider',
    owaspId: 'M6',
    category: 'M6: Client-Side Injection',
    title: 'ContentProvider SQL Injection in File Query',
    targetApp: 'CloudDrive',
    severity: 'High',
    cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvssScore: 8.5,
    mstgId: 'MSTG-PLATFORM-2',
    summary: 'The CloudDrive FileProvider performs unparameterized string concatenation with user-supplied projection or selection arguments, enabling SQL injection through IPC.',
    attackVector: 'A third-party app invokes contentResolver.query() with malicious SQL injection payloads in the selection string.',
    impact: 'Exfiltration of sensitive metadata, files, user accounts, and token tables via SQLite error or union queries.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/clouddrive/provider/FileContentProvider.kt',
      language: 'kotlin',
      highlightLineRange: [6, 12],
      snippet: `override fun query(uri: Uri, projection: Array<String>?, selection: String?, 
                   selectionArgs: Array<String>?, sortOrder: String?): Cursor? {
    val db = dbHelper.readableDatabase

    // VULNERABLE: Direct string concatenation of untrusted selection string!
    val rawQuery = "SELECT * FROM files WHERE user_id = 1 AND (" + selection + ")"
    return db.rawQuery(rawQuery, null) // selectionArgs ignored!
}`,
      explanation: 'Passing unsanitized selection strings directly to rawQuery allows attackers to inject OR clauses, UNION statements, or subqueries that bypass isolation.'
    },
    patchedCode: {
      file: 'com/clouddrive/provider/FileContentProvider.kt',
      language: 'kotlin',
      snippet: `override fun query(uri: Uri, projection: Array<String>?, selection: String?, 
                   selectionArgs: Array<String>?, sortOrder: String?): Cursor? {
    val db = dbHelper.readableDatabase

    // SECURE: Use SQLiteQueryBuilder with strict projection map and parameterized arguments
    val queryBuilder = SQLiteQueryBuilder().apply {
        tables = "files"
        // Enforce user tenant constraint
        appendWhere("user_id = 1")
    }

    return queryBuilder.query(
        db,
        projection,
        selection,      // Parameters bound safely
        selectionArgs,  // User values isolated as variables
        null, null, sortOrder
    )
}`,
      explanation: 'SQLiteQueryBuilder with parameterized selectionArgs ensures user input is treated strictly as data, never as executable SQL instructions.'
    },
    simulation: {
      tool: 'Drozer',
      command: 'run app.provider.query content://com.clouddrive.provider/files --selection "1=1) UNION SELECT id, username, password_hash, token, 1 FROM user_credentials --"',
      description: 'Simulates Drozer dynamic security assessment tool injecting a UNION SELECT payload.',
      vulnerableOutput: `| id | filename              | size   | is_shared | mime_type |
| 1  | admin_backup.enc      | 89128  | false     | application/octet-stream |
| 2  | sysadmin              | hash:e7f8... | token:Bearer_eyJ... | credential_row |
[!] ALERT: SQL Injection successful. User credentials and password hashes leaked via UNION query.`,
      remediatedOutput: `Query error: android.database.sqlite.SQLiteException: near "UNION": syntax error
(query enclosed in parameterized statement)
[*] SUCCESS: Attack payload was treated as literal text in parameterized WHERE clause. No data leaked.`
    },
    remediationAdvice: [
      'Always use parameterized queries with selectionArgs (?) instead of string concatenation.',
      'Utilize SQLiteQueryBuilder with setStrict(true) and whitelisted projection maps.',
      'Set android:exported="false" on ContentProviders if external app sharing is not needed.'
    ]
  },
  {
    id: 'vuln-m6-webview-jsinterface',
    owaspId: 'M6',
    category: 'M6: Client-Side Injection',
    title: 'Insecure WebView with Unrestricted JavaScript Interface',
    targetApp: 'SecureNotes',
    severity: 'Critical',
    cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvssScore: 8.8,
    mstgId: 'MSTG-PLATFORM-3',
    summary: 'The app loads remote untrusted web pages in a WebView with JavaScript enabled and an exposed native Java bridge object that can read local files and execute system commands.',
    attackVector: 'Loading a malicious URL or injecting script via XSS triggers window.AndroidBridge.readLocalFile() or exposes private device APIs.',
    impact: 'Arbitrary local file read, access to private app database, and cross-site scripting leading to device data theft.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/securenotes/ui/NotePreviewActivity.kt',
      language: 'kotlin',
      highlightLineRange: [5, 12],
      snippet: `webView.settings.apply {
    javaScriptEnabled = true
    allowFileAccess = true // VULNERABLE: allows reading file:/// URLs!
    allowUniversalAccessFromFileURLs = true
}

// VULNERABLE: Exposes sensitive device file operations to arbitrary web content
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun readInternalFile(path: String): String {
        return File("/data/data/com.securenotes/$path").readText()
    }
}, "AndroidBridge")

webView.loadUrl(untrustedNoteUrl) // Loads arbitrary external URLs!`,
      explanation: 'Allowing arbitrary URLs to communicate with an exposed JavascriptInterface grants untrusted web content direct access to private native application functions.'
    },
    patchedCode: {
      file: 'com/securenotes/ui/NotePreviewActivity.kt',
      language: 'kotlin',
      snippet: `import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

webView.settings.apply {
    javaScriptEnabled = false // Disabled if not strictly needed
    allowFileAccess = false
    allowContentAccess = false
}

// SECURE: Use WebViewAssetLoader to serve domain-isolated local assets
val assetLoader = WebViewAssetLoader.Builder()
    .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
    .build()

webView.webViewClient = object : WebViewClientCompat() {
    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
        return assetLoader.shouldInterceptRequest(request.url)
    }
}
// Load only trusted HTTPS origin
webView.loadUrl("https://appassets.androidplatform.net/assets/preview.html")`,
      explanation: 'Disables raw file access, restricts scripts, and serves content through domain-scoped WebViewAssetLoader.'
    },
    simulation: {
      tool: 'Frida Script',
      command: 'frida -U -f com.securenotes -e "Java.perform(function() { var wv = Java.use(\'android.webkit.WebView\'); wv.loadUrl.implementation = function(u) { console.log(\'WebView loaded: \' + u); this.loadUrl(u); } });"',
      description: 'Inspects WebView navigation and tests execution of JavaScript bridge exploit.',
      vulnerableOutput: `[WebView] Loaded: http://attacker-site.com/note.html
[JS] Injected: window.AndroidBridge.readInternalFile('databases/notes.db')
[!] ALERT: Native file read returned SQLite database contents to remote web server!`,
      remediatedOutput: `[WebView] Loaded: https://appassets.androidplatform.net/assets/preview.html
[JS] Error: window.AndroidBridge is undefined.
SecurityError: Cross-origin file:/// access blocked by WebViewClient.
[*] SUCCESS: Untrusted remote content cannot execute native Android code.`
    },
    remediationAdvice: [
      'Disable setAllowFileAccess and setAllowUniversalAccessFromFileURLs.',
      'Restrict addJavascriptInterface to trusted origins and strictly vetted APIs.',
      'Use WebViewAssetLoader to load local resources securely.'
    ]
  },
  {
    id: 'vuln-m7-manifest-flags',
    owaspId: 'M7',
    category: 'M7: Security Misconfiguration',
    title: 'Dangerous Manifest Configuration: debuggable & allowBackup',
    targetApp: 'CloudDrive',
    severity: 'Medium',
    cwe: 'CWE-215: Insertion of Sensitive Information Into Debugging Code',
    cvssScore: 6.8,
    mstgId: 'MSTG-STORAGE-3',
    summary: 'The production release AndroidManifest.xml leaves android:debuggable="true" and android:allowBackup="true" enabled, allowing runtime debugger attachment and physical data extraction via ADB backup.',
    attackVector: 'Attacker connects device to computer, runs adb backup, or attaches jdb debugger to execute code within app context.',
    impact: 'Complete extraction of private sandbox storage and memory dumping.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'AndroidManifest.xml',
      language: 'xml',
      highlightLineRange: [3, 6],
      snippet: `<application
    android:name=".CloudDriveApp"
    android:allowBackup="true"       <!-- VULNERABLE: Permits extraction via adb backup -->
    android:debuggable="true"        <!-- VULNERABLE: Leaves JDWP debugger port open in release -->
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name">
</application>`,
      explanation: 'debuggable="true" lets any developer attach Java Debug Wire Protocol (JDWP) to read memory and execute arbitrary code. allowBackup="true" permits dumping private databases and shared_prefs without root.'
    },
    patchedCode: {
      file: 'AndroidManifest.xml',
      language: 'xml',
      snippet: `<application
    android:name=".CloudDriveApp"
    android:allowBackup="false"      <!-- SECURE: Disables ADB file extraction -->
    android:debuggable="false"       <!-- SECURE: Release build prevents debugger attachment -->
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name">
</application>`,
      explanation: 'Setting debuggable="false" closes JDWP listening ports. allowBackup="false" prevents ADB from backing up app private data directory.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb backup -f backup.ab -noapk com.clouddrive && dd if=backup.ab bs=24 skip=1 | zlib-flate -uncompress | tar -tf -',
      description: 'Simulates extracting the app private sandbox through the Android Debug Bridge backup service.',
      vulnerableOutput: `Now unlock your device and confirm the backup operation...
Backup complete: 1.2 MB written to backup.ab
Extracting archive contents:
  apps/com.clouddrive/db/files.db
  apps/com.clouddrive/sp/auth_tokens.xml
  apps/com.clouddrive/f/cached_photos/id_passport.jpg
[!] ALERT: Full application sandbox extracted via ADB backup without root access!`,
      remediatedOutput: `Now unlock your device and confirm the backup operation...
adb: error: package com.clouddrive does not allow backup.
Archive size: 0 bytes.
[*] SUCCESS: Operation rejected by Android Package Manager. Backup disallowed.`
    },
    remediationAdvice: [
      'Ensure android:allowBackup="false" in release AndroidManifest.xml.',
      'Ensure android:debuggable="false" (default in release Gradle builds).',
      'If backup is required, configure fullBackupContent xml to exclude tokens and credentials.'
    ]
  },
  {
    id: 'vuln-m8-insecure-deeplink',
    owaspId: 'M8',
    category: 'M8: Insecure Deep Linking & IPC',
    title: 'Unvalidated Deep Link Scheme Execution',
    targetApp: 'VaultPay',
    severity: 'High',
    cwe: 'CWE-939: Improper Authorization in Handler for Custom URL Scheme',
    cvssScore: 7.8,
    mstgId: 'MSTG-PLATFORM-4',
    summary: 'The application registers a custom URI scheme vaultpay:// and automatically processes sensitive transaction actions without re-authenticating the user or validating the origin.',
    attackVector: 'A malicious website or message contains <a href="vaultpay://transfer?amount=1000&recipient=attacker">Click Here</a> which automatically triggers a fund transfer upon click.',
    impact: 'Cross-Site Request Forgery (CSRF) via mobile deep links resulting in unauthorized financial transactions.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/vaultpay/ui/DeepLinkHandlerActivity.kt',
      language: 'kotlin',
      highlightLineRange: [5, 12],
      snippet: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val uri = intent.data

    // VULNERABLE: Directly executes money transfer from deep link query params!
    if (uri != null && uri.scheme == "vaultpay" && uri.host == "transfer") {
        val recipient = uri.getQueryParameter("recipient")
        val amount = uri.getQueryParameter("amount")?.toDoubleOrNull() ?: 0.0

        // Transfers money immediately without user confirmation or biometric auth!
        transferService.executeTransfer(recipient, amount)
        finish()
    }
}`,
      explanation: 'Custom URL schemes have no origin verification in mobile browsers. Any web page or app can invoke vaultpay:// and supply arbitrary parameters.'
    },
    patchedCode: {
      file: 'com/vaultpay/ui/DeepLinkHandlerActivity.kt',
      language: 'kotlin',
      snippet: `override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val uri = intent.data ?: return

    // SECURE: Enforce Android App Links (verified domain HTTPS) + Require User Confirmation
    if (uri.scheme == "https" && uri.host == "pay.vaultpay.com") {
        val recipient = uri.getQueryParameter("recipient")
        val amount = uri.getQueryParameter("amount")?.toDoubleOrNull() ?: 0.0

        // NEVER execute automatically: Display confirmation sheet and require Biometric/PIN
        showTransferConfirmationDialog(
            recipient = recipient,
            amount = amount,
            onUserConfirmed = {
                authenticateWithBiometrics {
                    transferService.executeTransfer(recipient, amount)
                }
            }
        )
    }
}`,
      explanation: 'Uses verified Android App Links (assetlinks.json) on HTTPS instead of custom schemes, and strictly requires explicit user re-authentication before executing state-changing actions.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb shell am start -a android.intent.action.VIEW -d "vaultpay://transfer?amount=999.00&recipient=fraudster@bank.com"',
      description: 'Sends a simulated custom URL scheme intent to trigger the deep link listener.',
      vulnerableOutput: `Starting: Intent { act=android.intent.action.VIEW dat=vaultpay://transfer?amount=999.00&recipient=fraudster@bank.com }
[!] ALERT: Deep link processed without confirmation dialog!
Transfer of $999.00 to fraudster@bank.com dispatched to payment gateway.`,
      remediatedOutput: `Starting: Intent { act=android.intent.action.VIEW dat=vaultpay://transfer?amount=999.00&recipient=fraudster@bank.com }
[!] Rejected custom URI scheme vaultpay://. Only verified App Links (https://pay.vaultpay.com) accepted.
[*] User prompt displayed: "Confirm $999.00 transfer with Biometric scan?". Operation pending authorization.`
    },
    remediationAdvice: [
      'Migrate from custom schemes to Android App Links or Universal Links with domain verification.',
      'Never trigger destructive or financial state transitions directly from deep link parameters.',
      'Always prompt for user confirmation and re-authenticate via PIN/Biometrics.'
    ]
  },
  {
    id: 'vuln-m9-missing-anti-tamper',
    owaspId: 'M9',
    category: 'M9: Reverse Engineering & Anti-Tampering',
    title: 'Lack of Root Detection and Runtime Integrity Verification',
    targetApp: 'VaultPay',
    severity: 'Medium',
    cwe: 'CWE-353: Missing Support for Integrity Check',
    cvssScore: 6.5,
    mstgId: 'MSTG-RESILIENCE-1',
    summary: 'The banking application lacks root detection, ptrace anti-debugging, and package signature integrity verification, enabling attackers to inspect memory and hook sensitive routines with Magisk and Frida.',
    attackVector: 'Attacker runs the app on a rooted device with Magisk or an emulator with root binaries (/system/xbin/su) to bypass security controls.',
    impact: 'Dynamic instrumentation and debugging allows runtime tampering with payment calculations and security flags.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/vaultpay/security/IntegrityCheck.kt',
      language: 'kotlin',
      highlightLineRange: [3, 8],
      snippet: `class IntegrityCheck {
    // VULNERABLE: No checks for root binaries, test-keys, or active debuggers
    fun isDeviceSecure(context: Context): Boolean {
        // Dummy stub returning true!
        return true
    }
}`,
      explanation: 'Without root detection and runtime integrity verification, the application runs freely inside compromised environments where memory can be modified on the fly.'
    },
    patchedCode: {
      file: 'com/vaultpay/security/IntegrityCheck.kt',
      language: 'kotlin',
      snippet: `import com.google.android.play.core.integrity.StandardIntegrityManager

class IntegrityCheck {
    // SECURE: Multi-layered root checks, Play Integrity API, and ptrace anti-debug
    fun isDeviceSecure(context: Context): Boolean {
        val rootPaths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su"
        )
        val hasSuBinary = rootPaths.any { File(it).exists() }
        val hasTestKeys = Build.TAGS != null && Build.TAGS.contains("test-keys")
        val isDebuggerAttached = Debug.isDebuggerConnected()

        if (hasSuBinary || hasTestKeys || isDebuggerAttached) {
            return false
        }
        return true
    }
}`,
      explanation: 'Checks for known root binaries, dangerous build tags, attached debuggers, and integrates with the Google Play Integrity API for hardware attestation.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb shell "which su && ls -la /system/xbin/su"',
      description: 'Checks device filesystem for root superuser binary.',
      vulnerableOutput: `/system/xbin/su
-rwsr-xr-x 1 root root 75328 2026-01-01 12:00 /system/xbin/su
[!] ALERT: App launched without warning on rooted environment! No anti-tampering active.`,
      remediatedOutput: `/system/xbin/su detected.
[!] App Security Alert: "Device integrity compromised (Root detected). VaultPay cannot run on rooted firmware."
[*] App terminated safely (exit code 1). Sensitive crypto keys destroyed from memory.`
    },
    remediationAdvice: [
      'Implement multi-layered root and jailbreak detection checks.',
      'Utilize Google Play Integrity API for remote hardware attestation.',
      'Employ code obfuscation (R8/ProGuard) and anti-tamper runtime checks.'
    ]
  },
  {
    id: 'vuln-m10-extraneous-backdoor',
    owaspId: 'M10',
    category: 'M10: Extraneous Functionality',
    title: 'Developer Test Backdoor and Hidden Debug Menu in Release',
    targetApp: 'SecureNotes',
    severity: 'High',
    cwe: 'CWE-489: Active Debug Code in Production',
    cvssScore: 7.7,
    mstgId: 'MSTG-CODE-1',
    summary: 'A developer backdoor activity (DevDebugActivity) was left compiled in the release build. When triggered with a specific intent extra, it wipes user PINs and dumps memory contents to SDCard.',
    attackVector: 'Attacker inspects decompiled strings and launches com.securenotes/.DevDebugActivity with extra "dev_master_override=true".',
    impact: 'Instant PIN reset and extraction of application memory snapshots.',
    status: 'vulnerable',
    vulnerableCode: {
      file: 'com/securenotes/debug/DevDebugActivity.kt',
      language: 'kotlin',
      highlightLineRange: [5, 12],
      snippet: `class DevDebugActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // VULNERABLE: Developer backdoor accidentally shipped in production build
        if (intent.getBooleanExtra("dev_master_override", false)) {
            // Wipes PIN protection and unlocks all private notes!
            SessionManager(this).clearMasterPin()
            Toast.makeText(this, "DEV OVERRIDE: PIN Cleared!", Toast.LENGTH_LONG).show()
            startActivity(Intent(this, MainActivity::class.java))
        }
    }
}`,
      explanation: 'Debug backdoors, master passwords, and testing activities frequently slip into release builds if not strictly separated into test build variants.'
    },
    patchedCode: {
      file: 'build.gradle.kts',
      language: 'kotlin',
      snippet: `// SECURE: Place debug utilities strictly in src/debug/ source set, stripped from release
android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
        debug {
            // DevDebugActivity only exists in debug build variant!
        }
    }
}`,
      explanation: 'Moving testing activities strictly into src/debug directory and enabling ProGuard/R8 dead code stripping ensures no backdoors exist in release APKs.'
    },
    simulation: {
      tool: 'ADB Shell',
      command: 'adb shell am start -n com.securenotes/.DevDebugActivity --ez dev_master_override true',
      description: 'Invokes the hidden developer debug activity with the master bypass flag.',
      vulnerableOutput: `Starting: Intent { cmp=com.securenotes/.DevDebugActivity (has extras) }
[!] ALERT: DevDebugActivity executed!
Toast message: "DEV OVERRIDE: PIN Cleared!"
App unlocked directly to private patient records without entering PIN.`,
      remediatedOutput: `Starting: Intent { cmp=com.securenotes/.DevDebugActivity (has extras) }
Error type 3: Error: Activity class {com.securenotes/.DevDebugActivity} does not exist.
[*] SUCCESS: Debug backdoor was completely stripped from release APK.`
    },
    remediationAdvice: [
      'Isolate all testing and staging code strictly inside src/debug source sets.',
      'Audit APK bytecode with decompilers before publishing to Google Play / App Store.',
      'Enable R8 code shrinking and remove all test backdoor intent listeners.'
    ]
  }
];
