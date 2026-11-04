/**
 * Cross-device App Shortcut & Installation utility
 * Supports:
 * - Android Phones & Tablets (PWA Add to Home Screen -> Real app shortcut)
 * - Windows PC & Desktop (PWA Install App -> Native Desktop Shortcut + Start Menu, and server-hosted .url)
 * - iPhone & iPad (iOS Home Screen guide)
 */

export function getDeferredPrompt() {
  if (typeof window !== 'undefined') {
    return window.__navai_deferred_prompt || null;
  }
  return null;
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
  const promptEvent = getDeferredPrompt();

  // 1. If PWA installation is supported (Android phone/tablet, Chrome/Edge on Windows & Mac)
  if (promptEvent) {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('navai_app_installed', 'true');
        window.__navai_deferred_prompt = null;
        return { success: true, type: 'pwa' };
      }
      return { success: false, type: 'dismissed' };
    } catch (err) {
      console.warn('PWA prompt error:', err);
    }
  }

  // 2. On PC / Desktop: download the server-hosted .url shortcut file with application/x-mswinurl headers
  if (!isMobileOrTablet()) {
    try {
      const link = document.createElement('a');
      link.href = '/Nav-AI.url';
      link.download = `${name}.url`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      localStorage.setItem('navai_app_installed', 'true');
      return { success: true, type: 'url_shortcut' };
    } catch (err) {
      console.warn('Static shortcut download error:', err);
    }
  }

  // 3. For iOS devices
  if (isIosDevice()) {
    return { success: false, type: 'ios_guide' };
  }

  // 4. Android phone/tab without prompt event
  if (isMobileOrTablet()) {
    return { success: false, type: 'mobile_menu_guide' };
  }

  return { success: true, type: 'generic' };
}

// Backward compatibility alias
export const downloadAppUrlShortcut = triggerAppInstall;
