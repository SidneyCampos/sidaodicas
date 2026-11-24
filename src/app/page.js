import React from "react";
import OffersShowcase from "../components/OffersShowcase";
import Footer from "../components/Footer";
import { readJsonData } from "../lib/adminStorage";
import { getFreshCouponsForHome } from "../lib/couponAutoSync";

export const dynamic = "force-dynamic";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://sidaodicas.vercel.app"
).replace(/\/$/, "");

export default async function Home() {
  const [rawOfertas, rawCupons] = await Promise.all([
    readJsonData("ofertas.json"),
    getFreshCouponsForHome(),
  ]);

  const ofertas = Array.isArray(rawOfertas) ? rawOfertas : [];
  const cupons = Array.isArray(rawCupons) ? rawCupons : [];

  // Dados Estruturados JSON-LD (Schema.org) para Rich Results no Google
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Sidão Dicas Ofertas",
        url: SITE_URL,
        logo: `${SITE_URL}/avatar-sidao.png`,
        sameAs: [
          "https://youtube.com/@SidãoDicasOfertas",
          "https://instagram.com/sidaodicas",
          "https://tiktok.com/@sidaodicas",
          "https://facebook.com/sidaodicas",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Sidão Dicas Ofertas",
        description:
          "Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.",
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "ItemList",
        name: "Ofertas Selecionadas do Dia",
        numberOfItems: ofertas.length,
        itemListElement: ofertas.slice(0, 12).map((item, idx) => {
          const productSchema = {
            "@type": "Product",
            name: item.titulo,
            image: item.imagemUrl,
            offers: {
              "@type": "Offer",
              priceCurrency: "BRL",
              price: Number(item.precoAtual) || 0,
              availability: "https://schema.org/InStock",
              url: item.linkAfiliado,
              seller: {
                "@type": "Organization",
                name: item.loja || "Loja Oficial",
              },
            },
          };

          if (item.nota) {
            const ratingNum = parseFloat(String(item.nota).replace(",", "."));
            if (!Number.isNaN(ratingNum) && ratingNum > 0) {
              productSchema.aggregateRating = {
                "@type": "AggregateRating",
                ratingValue: ratingNum,
                bestRating: 5,
                ratingCount: 50,
              };
            }
          }

          return {
            "@type": "ListItem",
            position: idx + 1,
            item: productSchema,
          };
        }),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f14] text-[#f2ede4] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <OffersShowcase ofertas={ofertas} cupons={cupons} />

      <Footer />
    </div>
  );
}
