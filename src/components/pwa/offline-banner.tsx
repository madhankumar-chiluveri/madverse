"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    setOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-foreground text-background text-center text-xs py-1.5 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5" />
      You&apos;re offline. Changes will sync when reconnected.
    </div>
  );
}
