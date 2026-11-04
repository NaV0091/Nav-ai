/**
 * Utility for downloading the Nav AI app shortcut (.url file)
 * and triggering native PWA installation if supported.
 */

let deferredPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function downloadAppUrlShortcut(name = 'Nav AI') {
  const targetUrl = window.location.origin || 'https://nav-ai.web.app';
  const fileContent = `[InternetShortcut]\r\nURL=${targetUrl}/\r\nIconIndex=0\r\nIconFile=${targetUrl}/favicon.ico\r\n`;
  const blob = new Blob([fileContent], { type: 'application/x-mswinurl;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.url`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  // If native PWA install is also available in this browser, trigger it
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        deferredPrompt = null;
      });
    } catch (_) {}
  }

  try {
    localStorage.setItem('navai_app_installed', 'true');
  } catch (_) {}
}
