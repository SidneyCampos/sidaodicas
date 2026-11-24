import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreen from "../components/SplashScreen";
import InstallPrompt from "../components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sidaodicas.vercel.app"
).replace(/\/$/, "");

export const viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sidão Dicas Ofertas | Produtos Selecionados & Cupons",
    template: "%s | Sidão Dicas Ofertas",
  },
  description:
    "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee. Cupons ativos atualizados diariamente.",
  keywords: [
    "Sidão Dicas",
    "Sidão Dicas Ofertas",
    "ofertas do dia",
    "promoções amazon",
    "cupons mercado livre",
    "achados shopee",
    "cupom de desconto",
    "produtos selecionados",
  ],
  authors: [{ name: "Sidão Dicas Ofertas" }],
  creator: "Sidão Dicas Ofertas",
  alternates: {
    canonical: "/",
  },
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
    title: "Sidão Dicas Ofertas | Produtos Selecionados & Cupons",
    description:
      "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.",
    url: SITE_URL,
    siteName: "Sidão Dicas Ofertas",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/studio-banner.jpg",
        width: 894,
        height: 142,
        alt: "Sidão Dicas Ofertas — Curadoria Oficial",
      },
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Sidão Dicas Ofertas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sidão Dicas Ofertas | Produtos Selecionados & Cupons",
    description:
      "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.",
    images: ["/studio-banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://m.media-amazon.com" />
        <link rel="preconnect" href="https://http2.mlstatic.com" />
        <link rel="preconnect" href="https://down-br.img.susercontent.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0b0f14] text-[#f2ede4]">
        <SplashScreen />
        {children}
        <InstallPrompt />

        {/* Registro do Service Worker do PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
