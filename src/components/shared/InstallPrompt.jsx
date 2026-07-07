import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
}

/**
 * Custom install banner. Android/Chrome gets the real native prompt via
 * beforeinstallprompt; iOS Safari doesn't expose that API, so we show
 * manual "Share > Add to Home Screen" instructions instead.
 */
export function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isIOS() && !isStandalone() && !sessionStorage.getItem("ios-install-dismissed")) {
      setShowIOSHint(true);
    }
  }, []);

  const visible = (isInstallable || showIOSHint) && !dismissed;

  const dismiss = () => {
    setDismissed(true);
    if (showIOSHint) sessionStorage.setItem("ios-install-dismissed", "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl border border-border bg-surface-elevated p-4 shadow-card md:left-auto md:right-4 md:w-80"
        >
          <button onClick={dismiss} className="absolute top-3 right-3 text-foreground-subtle">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pr-4">
            <div className="h-9 w-9 rounded-xl bg-sun/15 flex items-center justify-center shrink-0">
              {showIOSHint ? <Share className="h-4 w-4 text-sun" /> : <Download className="h-4 w-4 text-sun" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pasang Surya Center</p>
              {showIOSHint ? (
                <p className="text-xs text-foreground-muted mt-0.5">
                  Ketuk ikon Share, lalu pilih "Add to Home Screen" agar bisa diakses seperti aplikasi.
                </p>
              ) : (
                <>
                  <p className="text-xs text-foreground-muted mt-0.5 mb-2">
                    Akses lebih cepat dari layar utama, bahkan saat offline.
                  </p>
                  <Button size="sm" onClick={() => promptInstall().then(dismiss)}>
                    Pasang sekarang
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
