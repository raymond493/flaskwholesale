"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { productCode } from "@/coffee/lib/catalog";

const measurementId = "G-8F6QJSYSNT";
export default function GoogleAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
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
    if (!pathname) return;
    const slug = pathname.startsWith("/coffee-mug/") ? pathname.split("/")[2] : "";
    const code = productCode(slug);
    const title = code && !document.title.startsWith(code) ? `${code} · ${document.title}` : document.title;
    window.gtag?.("event", "page_view", {page_location:location.origin + pathname, page_path:pathname, page_title:title, ...(code ? {product_model:code} : {})});
    if (code) window.gtag?.("event", "view_item", {items:[{item_id:code,item_name:title,item_category:"Coffee Mug"}]});
  }, [pathname]);
  return null;
}
