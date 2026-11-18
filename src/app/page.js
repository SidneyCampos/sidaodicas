import React from "react";
import Header from "../components/Header";
import OffersShowcase from "../components/OffersShowcase";
import Footer from "../components/Footer";
import ofertas from "../data/ofertas.json";
import cupons from "../data/cupons.json";
import { BadgeCheck, Lock, ShieldCheck, Store } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white font-sans">
      {/* Header Oficial com Avatar, Selo Verificado, Alertas e Grupo VIP */}
      <Header />

      {/* Barra de Transparência e Segurança (Abaixo do Header) */}
      <div className="bg-slate-900/95 border-b border-emerald-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-start sm:items-center justify-center gap-3 text-xs sm:text-sm text-slate-200">
          <div className="flex items-center gap-1.5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck size={18} className="text-emerald-400" />
            <Lock size={15} className="text-emerald-400 hidden sm:inline" />
          </div>
          <p className="leading-relaxed text-center sm:text-left">
            <strong className="text-emerald-400 font-bold">
              🔒 Redirecionamento 100% Seguro:
            </strong>{" "}
            O Sidão Dicas não é uma loja e nunca pede seus dados bancários. Nós monitoramos preços e redirecionamos você diretamente para as páginas oficiais da{" "}
            <strong className="text-white">Amazon</strong>,{" "}
            <strong className="text-white">Mercado Livre</strong> e{" "}
            <strong className="text-white">Shopee</strong>.
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-grow px-4 pt-8 sm:pt-10 max-w-6xl w-full mx-auto">
        {/* Hero Section focado em Credibilidade e Curadoria */}
        <section className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/40 text-[#facc15] text-xs sm:text-sm font-black px-4 py-1.5 rounded-full mb-5 shadow-sm">
            <span>⚡ Radar de Ofertas Verificadas em Tempo Real</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight text-white tracking-tight">
            Curadoria Oficial de{" "}
            <span className="text-[#facc15]">Descontos &amp; Cupons</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Nossa equipe monitora variações de preço e testa cupons diariamente para você comprar sempre pelo menor valor direto nas maiores lojas oficiais do Brasil.
          </p>

          {/* Selos Rápidos de Confiança */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-300">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
              <BadgeCheck size={15} className="text-emerald-400" />
              Histórico de Preços Analisado
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl">
              <Store size={15} className="text-yellow-400" />
              Links Diretos: Amazon, Mercado Livre e Shopee
            </span>
          </div>
        </section>

        {/* Seção de Cupons Ativos + Vitrine com Filtros e Cards de Produtos */}
        <OffersShowcase ofertas={ofertas} cupons={cupons} />
      </main>

      {/* Rodapé Profissional com Avisos Legais e Redes Sociais */}
      <Footer />
    </div>
  );
}
