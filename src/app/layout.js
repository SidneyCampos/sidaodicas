import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SplashScreen from "../components/SplashScreen";
import InstallPrompt from "../components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Sidão Dicas Ofertas | Produtos Selecionados & Cupons",
  description:
    "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sidão Dicas",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Sidão Dicas Ofertas | Curadoria Oficial",
    description:
      "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f14] text-[#f2ede4]">
        <SplashScreen />
        {children}
        <InstallPrompt />

        {/* Script para registrar o Service Worker exigido pelo PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `
          }}
        />
        
      </body>
    </html>
  );
}
