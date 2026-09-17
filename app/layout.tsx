import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your new website",
  description: "Built with Business Brain.",
};

/**
 * Google Analytics is opt-in via NEXT_PUBLIC_GA_MEASUREMENT_ID env var.
 * Unset on draft sites (no analytics). Set automatically at go-live.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Ads click capture. When a visitor lands from an ad, Google appends
 * gclid / gbraid / wbraid to the URL. Remember it in a first-party cookie for
 * 90 days (Google will not accept older clicks); the contact route reads the
 * cookie server-side and forwards it with the lead, so a deal WON weeks later
 * can be reported back to Google as a conversion. Without this Google only
 * ever learns that a form was filled in. Best-effort: never breaks the page.
 */
const CLICK_CAPTURE = `
(function(){try{var q=new URLSearchParams(location.search),k=['gclid','gbraid','wbraid'];
for(var i=0;i<k.length;i++){var v=q.get(k[i]);if(v&&/^[A-Za-z0-9_-]{8,200}$/.test(v)){
var r={id:v,kind:k[i],ts:new Date().toISOString(),landing:location.href.slice(0,500)};
document.cookie='bb_click='+encodeURIComponent(JSON.stringify(r))+'; max-age='+(90*86400)+'; path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');break;}}}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="bb-click-capture" strategy="beforeInteractive">{CLICK_CAPTURE}</Script>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
