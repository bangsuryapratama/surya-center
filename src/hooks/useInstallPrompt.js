import { useEffect, useState } from "react";

/**
 * Captures the browser's `beforeinstallprompt` event (Android/Chrome) so we
 * can show our own custom "Install to Home Screen" card instead of relying
 * on the native mini-infobar. iOS Safari does not fire this event — iOS
 * users are shown manual "Add to Home Screen" instructions instead (see
 * InstallPrompt.jsx for the platform check).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, promptInstall };
}
