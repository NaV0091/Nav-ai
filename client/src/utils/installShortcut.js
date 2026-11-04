/**
 * Cross-device App Shortcut & Installation utility
 * Supports:
 * - Android Phones & Tablets (PWA Add to Home Screen)
 * - Windows PC & Desktop (PWA Install App & Windows .url shortcut)
 * - iPhone & iPad (iOS Home Screen guidance)
 */

let deferredPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function isPwaInstallable() {
  return Boolean(deferredPrompt);
}

export function isIosDevice() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

export function isMobileOrTablet() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|tablet|mobile/.test(ua);
}

export async function triggerAppInstall(name = 'Nav AI') {
  // 1. If PWA installation is supported by the browser (Android phone/tablet, Chrome/Edge desktop)
  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('navai_app_installed', 'true');
        deferredPrompt = null;
        return { success: true, type: 'pwa' };
      }
    } catch (_) {}
  }

  // 2. On desktop (Windows/Mac/Linux), download the Windows/Desktop Internet Shortcut (.url)
  if (!isMobileOrTablet()) {
    try {
      const targetUrl = window.location.origin || 'https://nav-ai.web.app';
      const fileContent = `[InternetShortcut]\r\nURL=${targetUrl}/\r\nIconIndex=0\r\nIconFile=${targetUrl}/favicon.ico\r\nHotKey=0\r\nIDList=\r\n`;
      const blob = new Blob([fileContent], { type: 'application/x-mswinurl;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}.url`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      localStorage.setItem('navai_app_installed', 'true');
      return { success: true, type: 'url_shortcut' };
    } catch (err) {
      console.warn('URL shortcut download error:', err);
    }
  }

  // 3. For iOS devices without beforeinstallprompt
  if (isIosDevice()) {
    return { success: false, type: 'ios_guide' };
  }

  // Fallback for any other device
  return { success: true, type: 'generic' };
}

// Backward compatibility alias
export const downloadAppUrlShortcut = triggerAppInstall;
