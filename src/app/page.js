import React from "react";
import OffersShowcase from "../components/OffersShowcase";
import Footer from "../components/Footer";
import { readJsonData } from "../lib/adminStorage";
import { getFreshCouponsForHome } from "../lib/couponAutoSync";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sidão Dicas & Ofertas | Radar de Ofertas Verificadas em Tempo Real",
  description:
    "Curadoria oficial de ofertas verificadas e cupons de desconto ativos para Amazon, Mercado Livre e Shopee. Redirecionamento 100% seguro para as lojas oficiais.",
  openGraph: {
    title: "Sidão Dicas & Ofertas | Curadoria Oficial Verificada",
    description:
      "Economize com segurança! Monitoramos preços e cupons em tempo real nas páginas oficiais da Amazon, Mercado Livre e Shopee.",
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
    <div className="min-h-screen flex flex-col bg-[#090d16] text-white font-sans">
      {/* Vitrine Clean com Header Unificado, Filtros Minimalistas e Modal de Cupons */}
      <OffersShowcase
        ofertas={Array.isArray(ofertas) ? ofertas : []}
        cupons={Array.isArray(cupons) ? cupons : []}
      />

      {/* Rodapé Resumido com Segurança, Afiliados e Redes Sociais */}
      <Footer />
    </div>
  );
}
