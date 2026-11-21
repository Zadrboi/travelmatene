"use client";
import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // In development mode, ensure stale service worker caches don't corrupt Next.js dev bundles or HMR
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
        return;
      }

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.info("[TravelMateNE] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[TravelMateNE] Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
