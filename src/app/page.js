import React from "react";
import OffersShowcase from "../components/OffersShowcase";
import Footer from "../components/Footer";
import { readJsonData } from "../lib/adminStorage";
import { getFreshCouponsForHome } from "../lib/couponAutoSync";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sidão Dicas Ofertas | Produtos Selecionados & Cupons",
  description:
    "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee. Redirecionamento 100% oficial.",
  openGraph: {
    title: "Sidão Dicas Ofertas | Curadoria Oficial",
    description:
      "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.",
    type: "website",
    locale: "pt_BR",
  },
};

export default async function Home() {
  const [ofertas, cupons] = await Promise.all([
    readJsonData("ofertas.json"),
    getFreshCouponsForHome(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f14] text-[#f2ede4] font-sans">
      <OffersShowcase
        ofertas={Array.isArray(ofertas) ? ofertas : []}
        cupons={Array.isArray(cupons) ? cupons : []}
      />

      <Footer />
    </div>
  );
}
