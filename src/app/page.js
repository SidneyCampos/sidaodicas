import React from "react";
import OffersShowcase from "../components/OffersShowcase";
import Footer from "../components/Footer";
import ofertas from "../data/ofertas.json";
import cupons from "../data/cupons.json";

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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-white font-sans">
      {/* Header Unificado + Barra de Cupons Retrátil + Vitrine Imediata de Produtos */}
      <OffersShowcase ofertas={ofertas} cupons={cupons} />

      {/* Rodapé Resumido com Segurança, Afiliados e Redes Sociais */}
      <Footer />
    </div>
  );
}
