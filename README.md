# MobileSec Bench — Mobile Vulnerability Test Bench 🛡️📱

> **Interactive Android Security Test Bench, OWASP Mobile Top 10 Diagnostic Lab, Live Device Telemetry Scanner & Play Store Ready TWA.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web%20%7C%20Desktop-green.svg)](#)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple.svg)](#)
[![Play Store TWA](https://img.shields.io/badge/Google%20Play-TWA%20Ready-brightgreen.svg)](#)

---

## 📌 GitHub Repository Quick Info

- **Repository Description (About Section):**  
  > *All-in-one Mobile Security Test Bench & Android vulnerability scanner. Test OWASP Mobile Top 10 exploits, extract real-time hardware telemetry, audit APK manifests, and run as an installable Android TWA or Desktop app with Google Auth.*
- **Topics / Tags:**  
  `android-security`, `vulnerability-scanner`, `owasp-mobile`, `pwa`, `twa`, `play-store`, `hardware-telemetry`, `react`, `typescript`, `firebase-auth`, `webrtc-audit`

---

## 🚀 Live Demo & Web App

- **Hosted Web App:** [Launch MobileSec Bench](https://ais-pre-piddlkeezebv5gxbes52if-751126202575.asia-east1.run.app)
- **Default Auditor Login:** `morselsmoney@gmail.com` *(or any Google Account)*

---

## 📱 How to Run or Install on Android

You have two quick ways to run MobileSec Bench on Android: as an **instant PWA** or as an **installed APK / Play Store Bundle (.aab)**.

---

### Method 1: Instant Installation on Android (Chrome / Brave / Edge)
*No compilation or command line needed.*

1. Open **Google Chrome** on your Android smartphone or tablet.
2. Visit the hosted web app URL:
   ```
   https://ais-pre-piddlkeezebv5gxbes52if-751126202575.asia-east1.run.app
   ```
3. Tap the **"Install on Device"** button in the top navigation bar, OR:
   - Tap the **three dots menu (⋮)** in the top-right corner of Chrome.
   - Tap **"Add to Home screen"** or **"Install app"**.
4. Confirm by tapping **Install**.
5. The app will install as a native-feeling standalone application on your Android home screen and app drawer with splash screen and full offline caching.

---

### Method 2: Build Native Android Package (.apk / .aab) via Google Bubblewrap
*Create a signed Android package for side-loading (`.apk`) or uploading to the Google Play Console (`.aab`).*

#### Prerequisites:
- **Node.js** (v18 or higher)
- **Java Development Kit (JDK 17+)** & **Android SDK** (Bubblewrap will guide you if missing)

#### Step-by-Step Build Commands:

```bash
# 1. Install Google Bubblewrap CLI globally
npm install -g @bubblewrap/cli

# 2. Create a new directory for the Android packaging
mkdir mobilesec-android-twa && cd mobilesec-android-twa

# 3. Initialize the TWA project pointing to your live URL
bubblewrap init --manifest="https://ais-pre-piddlkeezebv5gxbes52if-751126202575.asia-east1.run.app/manifest.json"

# (Bubblewrap will prompt for application name, package ID: com.mobilesec.bench, and keystore generation)

# 4. Build the signed Android App Bundle (.aab) and APK (.apk)
bubblewrap build

# 5. Output files generated:
# - app-release-signed.aab (Upload this to Google Play Console)
# - app-release-signed.apk (Directly installable on any Android phone)
```

#### Installing the APK on your Android Device:
```bash
# Enable USB Debugging on your phone, connect via USB, then run:
adb install app-release-signed.apk
```

---

## 💻 How to Run on Desktop (Mac, Windows, Linux)

You can run MobileSec Bench on your desktop either in your browser as a standalone windowed desktop PWA or locally by running the source code.

---

### Option 1: Run as a Standalone Desktop App (Chrome / Edge)
1. Open Google Chrome or Microsoft Edge on your computer.
2. Go to:
   ```
   https://ais-pre-piddlkeezebv5gxbes52if-751126202575.asia-east1.run.app
   ```
3. Look at the right side of the URL address bar:
   - Click the **Install icon (monitor with a down arrow)** or click **Settings (⋮) > Save and share > Install MobileSec Bench**.
4. The application now runs in its own dedicated, chromeless desktop window with desktop taskbar/dock integration.

---

### Option 2: Run Locally from Source Code

#### Prerequisites:
- **Git**
- **Node.js** (v18.x or v20.x+)
- **npm** or **bun**

#### Steps:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mobile-vulnerable-test-bench.git
cd mobile-vulnerable-test-bench

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env
```

Your `.env` file template:
```env
# Optional Gemini API Key for AI features
GEMINI_API_KEY="your-gemini-api-key"

# Base application URL
APP_URL="http://localhost:3000"
```

#### Start Local Development Server:
```bash
npm run dev
```

The app will start at:
```
http://localhost:3000
```
Open your browser and navigate to `http://localhost:3000`.

#### Build for Production:
```bash
npm run build
npm run preview
```

---

## 🔑 Login & Authentication Guide

When you launch the app, you will see the **Security Auditor Access Gateway**:

1. **Continue with Google**:
   - Authenticate with your personal or corporate Google account via Firebase Google OAuth.
2. **Instant Auditor Mode (`morselsmoney@gmail.com`)**:
   - Built-in one-click verified session for immediate testing, avoiding popup blockers in sandboxed browser environments.
3. **Continue without account**:
   - Preview all diagnostic tools and security labs in read-only guest mode.

*All user audit sessions and saved vulnerability test results sync securely to Cloud Firestore.*

---

## 🔍 Features & Diagnostic Capabilities

| Module | What It Does |
|---|---|
| 📱 **Hardware & System Telemetry** | Real-time extraction of CPU architecture, core counts, RAM memory estimate, unmasked WebGL GPU renderer, battery charge level & discharging rates, network connection speed (RTT, downlink), and storage quota. |
| 🛡️ **Host Security Audit** | Live WebRTC local network candidate IP leak detection, WebCrypto algorithm support, Hardware Biometrics / TEE enclave availability, Widevine DRM security level, and origin sandbox checks. |
| 📦 **APK & Manifest SAST** | Analyzes uploaded `AndroidManifest.xml` files for dangerous security misconfigurations (`debuggable`, `allowBackup`, `usesCleartextTraffic`, exported components, risky permissions). |
| 🔌 **WebADB & Physical USB Probe** | Direct WebUSB connection to physical Android devices to run ADB diagnostic checks directly from the browser without installing Android Studio. |
| 🧪 **OWASP Mobile Top 10 Labs** | 10 interactive scenarios with live exploitable apps (VaultPay, SecureNotes, CloudDrive), side-by-side **Vulnerable vs. Patched** Kotlin/Java code diffs, and remediation steps. |
| 🚀 **Google Play Store Deploy Hub** | 100% Play Store audit scorecard, Digital Asset Links (`assetlinks.json`) generator, and step-by-step submission checklist. |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Tooling:** Vite 8, tsx, ESLint
- **Security & Cloud:** Firebase Auth (Google OAuth), Google Cloud Firestore
- **Mobile Packaging:** Progressive Web App (PWA), Trusted Web Activity (TWA), Bubblewrap CLI
- **APIs:** Battery Status API, Network Information API, WebGL Debug Info, WebRTC RTCPeerConnection, WebCrypto API, WebUSB / WebADB

---

## 📄 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.
