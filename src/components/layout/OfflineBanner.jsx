import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/** Thin banner that appears whenever the browser goes offline. */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-warning/15 text-warning text-xs font-medium overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 py-2">
            <WifiOff className="h-3.5 w-3.5" />
            Kamu sedang offline — perubahan akan tersinkron saat online kembali.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
