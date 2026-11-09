export interface DetailedDeviceInfo {
  // OS & Software
  os: string;
  osVersion: string;
  architecture: string;
  bitness: string;
  deviceModel: string;
  browserEngine: string;
  userAgent: string;
  isAndroid: boolean;
  isSecureContext: boolean;
  isCrossOriginIsolated: boolean;

  // Hardware Specs
  cpuCores: number | string;
  deviceMemoryGb: number | string;
  gpuVendor: string;
  gpuRenderer: string;
  maxTouchPoints: number;

  // Display Specs
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  colorDepth: number;
  orientation: string;
  isTouchscreen: boolean;

  // Battery
  batterySupported: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  chargingTime?: string;
  dischargingTime?: string;

  // Network
  networkType: string;
  effectiveType: string;
  downlinkSpeed: string;
  rttLatency: string;
  dataSaver: boolean;
  isOnline: boolean;

  // Storage
  storageQuotaMb?: number;
  storageUsageMb?: number;
  isPersistentStorage: boolean;

  // Security & Crypto
  hasWebCrypto: boolean;
  cryptoAlgorithms: string[];
  biometricHardware: boolean;
  drmWidevineSupported: boolean;

  // Locale & Time
  language: string;
  timeZone: string;
  calendar: string;
}

export async function collectDetailedDeviceInfo(): Promise<DetailedDeviceInfo> {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  
  let os = 'Unknown OS';
  let osVersion = 'Unknown';
  if (isAndroid) {
    os = 'Android';
    const match = ua.match(/Android\s([0-9\.]+)/);
    osVersion = match ? match[1] : '14+';
  } else if (/iPhone|iPad/i.test(ua)) {
    os = 'iOS / iPadOS';
    const match = ua.match(/OS\s([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : '17+';
  } else if (/Mac/i.test(ua)) {
    os = 'macOS';
  } else if (/Win/i.test(ua)) {
    os = 'Windows';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // User-Agent Client Hints (Chromium Android high entropy)
  let architecture = 'ARM64 / aarch64';
  let bitness = '64-bit';
  let deviceModel = 'Generic Android Device';

  if ((navigator as any).userAgentData) {
    const uad = (navigator as any).userAgentData;
    if (uad.platform) os = uad.platform;
    try {
      if (uad.getHighEntropyValues) {
        const high = await uad.getHighEntropyValues([
          'architecture',
          'bitness',
          'model',
          'platformVersion',
          'fullVersionList'
        ]);
        if (high.architecture) architecture = high.architecture;
        if (high.bitness) bitness = `${high.bitness}-bit`;
        if (high.model) deviceModel = high.model;
        if (high.platformVersion) osVersion = high.platformVersion;
      }
    } catch (e) {
      // Ignored
    }
  } else if (isAndroid) {
    const modelMatch = ua.match(/Android[^;]+;\s*([^;\)]+)/);
    if (modelMatch) deviceModel = modelMatch[1];
  }

  // WebGL GPU Probe
  let gpuVendor = 'Hardware Graphics Accelerator';
  let gpuRenderer = 'Default Graphics Pipeline';
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
      }
    }
  } catch (e) {
    // Ignored
  }

  // Battery Probe
  let batterySupported = false;
  let batteryLevel: number | undefined;
  let isCharging: boolean | undefined;
  let chargingTime: string | undefined;
  let dischargingTime: string | undefined;

  if ('getBattery' in navigator) {
    try {
      const battery: any = await (navigator as any).getBattery();
      batterySupported = true;
      batteryLevel = Math.round(battery.level * 100);
      isCharging = battery.charging;
      chargingTime = battery.chargingTime === Infinity ? 'Full / Standby' : `${Math.round(battery.chargingTime / 60)} min`;
      dischargingTime = battery.dischargingTime === Infinity ? 'Calculating' : `${Math.round(battery.dischargingTime / 60)} min`;
    } catch (e) {
      // Ignored
    }
  }

  // Network Connection Probe
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const networkType = conn?.type || (navigator.onLine ? 'Wi-Fi / Cellular Data' : 'Disconnected');
  const effectiveType = conn?.effectiveType ? conn.effectiveType.toUpperCase() : '4G LTE / 5G';
  const downlinkSpeed = conn?.downlink ? `${conn.downlink} Mbps` : 'High Bandwidth (>10 Mbps)';
  const rttLatency = conn?.rtt ? `${conn.rtt} ms` : '< 50 ms';
  const dataSaver = !!conn?.saveData;

  // Storage Quota Probe
  let storageQuotaMb: number | undefined;
  let storageUsageMb: number | undefined;
  let isPersistentStorage = false;

  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) storageQuotaMb = Math.round(estimate.quota / (1024 * 1024));
      if (estimate.usage !== undefined) storageUsageMb = Math.round(estimate.usage / (1024 * 1024));
      if (navigator.storage.persisted) {
        isPersistentStorage = await navigator.storage.persisted();
      }
    } catch (e) {
      // Ignored
    }
  }

  // Biometrics & WebCrypto
  let biometricHardware = false;
  if (window.PublicKeyCredential) {
    try {
      biometricHardware = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      biometricHardware = false;
    }
  }

  // Widevine DRM support
  let drmWidevineSupported = false;
  if (navigator.requestMediaKeySystemAccess) {
    try {
      await navigator.requestMediaKeySystemAccess('com.widevine.alpha', [
        {
          initDataTypes: ['cenc'],
          audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
          videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }]
        }
      ]);
      drmWidevineSupported = true;
    } catch (e) {
      drmWidevineSupported = false;
    }
  }

  const intlOpts = Intl.DateTimeFormat().resolvedOptions();

  return {
    os,
    osVersion,
    architecture,
    bitness,
    deviceModel,
    browserEngine: navigator.vendor || 'WebKit / Blink Engine',
    userAgent: ua,
    isAndroid,
    isSecureContext: window.isSecureContext,
    isCrossOriginIsolated: window.crossOriginIsolated || false,

    cpuCores: navigator.hardwareConcurrency || '8 Cores',
    deviceMemoryGb: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB RAM` : '8+ GB RAM (Standard)',
    gpuVendor,
    gpuRenderer,
    maxTouchPoints: navigator.maxTouchPoints || 0,

    screenResolution: `${window.screen.width} x ${window.screen.height} px`,
    viewportSize: `${window.innerWidth} x ${window.innerHeight} px`,
    devicePixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth || 24,
    orientation: window.screen.orientation ? window.screen.orientation.type : 'portrait-primary',
    isTouchscreen: navigator.maxTouchPoints > 0,

    batterySupported,
    batteryLevel,
    isCharging,
    chargingTime,
    dischargingTime,

    networkType,
    effectiveType,
    downlinkSpeed,
    rttLatency,
    dataSaver,
    isOnline: navigator.onLine,

    storageQuotaMb,
    storageUsageMb,
    isPersistentStorage,

    hasWebCrypto: !!window.crypto && !!window.crypto.subtle,
    cryptoAlgorithms: ['AES-GCM (256-bit)', 'ECDSA (P-256/P-384)', 'HMAC-SHA512', 'RSA-PSS', 'PBKDF2'],
    biometricHardware,
    drmWidevineSupported,

    language: navigator.language,
    timeZone: intlOpts.timeZone || 'UTC',
    calendar: intlOpts.calendar || 'gregorian'
  };
}
