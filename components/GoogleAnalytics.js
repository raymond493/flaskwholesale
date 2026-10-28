"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const measurementId = "G-8F6QJSYSNT";
export default function GoogleAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args) { window.dataLayer.push(args); };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {send_page_view:false, page_location:location.origin + location.pathname});
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (link && /^(https?:)?\/\/(wa\.me|api\.whatsapp\.com)\//i.test(link.href)) window.gtag?.("event", "whatsapp_click");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => {
    if (pathname) window.gtag?.("event", "page_view", {page_location:location.origin + pathname, page_path:pathname});
  }, [pathname]);
  return null;
}
