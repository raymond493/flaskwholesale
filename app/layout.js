import "@/src/styles.css";
import "@/src/content.css";
import "@/src/recent-work.css";
import { CurrencyProvider } from "@/coffee/components/currency-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(site.origin),
  title: { default: "FlaskWholesale", template: "%s | FlaskWholesale" },
  description: "Custom stainless steel bottles, tumblers, mugs, shakers, jugs and can coolers with OEM, private-label and low-MOQ support.",
  icons: { icon: [{url:"/brand/flaskwholesale-favicon-v1.png",sizes:"32x32",type:"image/png"},{url:"/brand/flaskwholesale-icon-v1.png",sizes:"192x192",type:"image/png"}], apple: [{url:"/brand/flaskwholesale-apple-v1.png",sizes:"180x180",type:"image/png"}] },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><CurrencyProvider><Header /><main>{children}</main><Footer /></CurrencyProvider></body></html>;
}
