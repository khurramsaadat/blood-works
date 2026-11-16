"use client";

import { useEffect } from "react";

export default function PwaRegistrar() {
  useEffect(() => {
    // Only production builds ship the static service worker; in dev, Next
    // serves Turbopack assets that would be cached stale.
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
