/**
 * Universal App Shortcut & Installation utility
 * Supports:
 * - Windows PC & Desktop: Native PWA install (creates Desktop .lnk shortcut & Start Menu entry) + address bar (⊞) guide
 * - Android Phones & Tablets: Native PWA install (places app icon directly on home screen)
 * - iPhone & iPad: Safari Share (↑) -> Add to Home Screen guide
 * 
 * Never downloads .url files through JavaScript, preventing browser security .download renaming.
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

export function isStandaloneApp() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    localStorage.getItem('navai_app_installed') === 'true'
  );
}

export async function triggerAppInstall() {
  let promptEvent = getDeferredPrompt();

  // If prompt not yet available, wait briefly for navai:pwa-ready event
  if (!promptEvent && typeof window !== 'undefined') {
    promptEvent = await new Promise((resolve) => {
      let resolved = false;
      const handler = () => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('navai:pwa-ready', handler);
          resolve(getDeferredPrompt());
        }
      };
      window.addEventListener('navai:pwa-ready', handler);
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.removeEventListener('navai:pwa-ready', handler);
          resolve(getDeferredPrompt());
        }
      }, 500);
    });
  }

  // 1. Native PWA installation (Supported on Chrome/Edge on Windows, Android phones & tablets)
  if (promptEvent) {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') {
        localStorage.setItem('navai_app_installed', 'true');
        window.__navai_deferred_prompt = null;
        return { success: true, type: 'pwa', outcome: 'accepted' };
      }
      return { success: false, type: 'pwa', outcome: 'dismissed' };
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  }

  // 2. iOS devices (Safari)
  if (isIosDevice()) {
    return {
      success: false,
      type: 'ios_guide',
      message: 'Tap the Share icon (↑) in Safari and choose "Add to Home Screen".'
    };
  }

  // 3. Android phone/tablet fallback if prompt is not triggered
  if (isMobileOrTablet()) {
    return {
      success: false,
      type: 'mobile_guide',
      message: 'Tap the browser menu (⋮) at top right and select "Install app" or "Add to Home screen".'
    };
  }

  // 4. Windows PC / Desktop fallback
  return {
    success: false,
    type: 'desktop_guide',
    message: 'Click the Install icon (⊞) in your browser address bar (top right) or browser menu (⋮) -> Install Nav AI.'
  };
}

// Backward compatibility alias
export const downloadAppUrlShortcut = triggerAppInstall;
