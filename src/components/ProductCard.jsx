"use client";

import React, { useState } from "react";
import { Check, Clock, Copy, ExternalLink, ShieldCheck } from "lucide-react";

const STORE_CONFIG = {
  Amazon: {
    badgeLabel: "Vendido na Amazon",
    shortLabel: "Amazon",
    badgeClass: "bg-[#FF9900] text-slate-950",
    borderHover: "hover:border-[#FF9900]/70",
    ctaClass:
      "bg-[#FF9900] hover:bg-[#e68a00] text-slate-950 shadow-amber-500/15",
  },
  "Mercado Livre": {
    badgeLabel: "Oficial Mercado Livre",
    shortLabel: "Mercado Livre",
    badgeClass: "bg-[#FFE600] text-slate-950",
    borderHover: "hover:border-[#FFE600]/70",
    ctaClass:
      "bg-[#FFE600] hover:bg-[#f2da00] text-slate-950 shadow-yellow-400/15",
  },
  Shopee: {
    badgeLabel: "Achado Shopee",
    shortLabel: "Shopee",
    badgeClass: "bg-[#EE4D2D] text-white",
    borderHover: "hover:border-[#EE4D2D]/70",
    ctaClass:
      "bg-[#EE4D2D] hover:bg-[#d94122] text-white shadow-orange-500/20",
  },
};

export default function ProductCard({ product }) {
  const [couponCopied, setCouponCopied] = useState(false);

  const precoAntigo = product.precoAntigo ?? product.precoOriginal ?? 0;
  const precoAtual = product.precoAtual ?? product.precoDesconto ?? 0;
  const imagemUrl = product.imagemUrl ?? product.urlImagem ?? "";
  const loja = product.loja || "Amazon";
  const destaqueTag = product.destaqueTag ?? product.tag ?? "Oferta do Dia";
  const verificadoEm = product.verificadoEm || "Verificado hoje";
  const cupomOpcional = product.cupomOpcional || "";
  const linkAfiliado = product.linkAfiliado || "#";

  const descontoPercentual =
    product.descontoPercentual ??
    (precoAntigo > precoAtual
      ? Math.round(((precoAntigo - precoAtual) / precoAntigo) * 100)
      : 0);

  const storeInfo = STORE_CONFIG[loja] || {
    badgeLabel: `Oficial ${loja}`,
    shortLabel: loja,
    badgeClass: "bg-[#FFE600] text-slate-950",
    borderHover: "hover:border-yellow-400/60",
    ctaClass: "bg-[#FFE600] hover:bg-yellow-300 text-slate-950",
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleCopyCoupon = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cupomOpcional) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cupomOpcional);
      }
    } catch (err) {
      console.warn("Erro ao copiar cupom do produto:", err);
    }

    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 3000);
  };

  return (
    <article
      className={`bg-slate-900/95 rounded-2xl overflow-hidden shadow-lg border border-slate-800 ${storeInfo.borderHover} flex flex-col group relative transition-all duration-200 hover:-translate-y-1`}
    >
      {/* Área da Foto com Fundo Branco Puro (Padrão Mercado Livre / Amazon) */}
      <a
        href={linkAfiliado}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-full h-40 sm:h-48 bg-white overflow-hidden flex items-center justify-center p-3 sm:p-4 block"
      >
        {/* Selo da Loja Oficial no Topo Esquerdo */}
        <span
          className={`absolute top-2 left-2 z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-tight px-2 py-0.5 rounded-md shadow-sm ${storeInfo.badgeClass}`}
        >
          <span className="sm:hidden">{storeInfo.shortLabel}</span>
          <span className="hidden sm:inline">{storeInfo.badgeLabel}</span>
        </span>

        {/* Badge de % OFF no Topo Direito (Estilo Shopee / Meli) */}
        {descontoPercentual > 0 && (
          <span className="absolute top-2 right-2 z-10 bg-emerald-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-sm">
            -{descontoPercentual}% OFF
          </span>
        )}

        <img
          src={imagemUrl}
          alt={product.titulo}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </a>

      {/* Corpo do Card Enxuto e Focado em Conversão */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between gap-2">
        <div>
          {/* Linha de Destaque Tag + Tempo */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-300 truncate">
              {destaqueTag}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
              <Clock size={10} />
              {verificadoEm}
            </span>
          </div>

          {/* Título do Produto */}
          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-slate-100 font-bold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#FFE600] transition-colors">
              {product.titulo}
            </h3>
          </a>
        </div>

        <div className="pt-1">
          {/* Bloco de Preço Estilo Mercado Livre (Preço riscado + Preço Gigante + % Verde) */}
          <div className="mb-2">
            {precoAntigo > precoAtual && (
              <span className="block text-slate-400 text-[11px] sm:text-xs line-through leading-none mb-0.5">
                {formatPrice(precoAntigo)}
              </span>
            )}

            <div className="flex items-baseline flex-wrap gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none">
                {formatPrice(precoAtual)}
              </span>
              {descontoPercentual > 0 && (
                <span className="text-[11px] sm:text-xs font-black text-emerald-400">
                  {descontoPercentual}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Mini-tag de Cupom Opcional (Click-to-Copy estilo Voucher Shopee) */}
          {cupomOpcional && (
            <button
              type="button"
              onClick={handleCopyCoupon}
              title="Clique para copiar o cupom"
              className={`w-full mb-2 px-2.5 py-1.5 rounded-lg border border-dashed text-[11px] font-bold flex items-center justify-between gap-1 transition-all cursor-pointer ${
                couponCopied
                  ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
                  : "bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/50 text-yellow-300"
              }`}
            >
              <span className="truncate">
                {couponCopied
                  ? `✅ ${cupomOpcional} copiado!`
                  : `🎟️ Use o cupom: ${cupomOpcional}`}
              </span>
              <Copy size={11} className="shrink-0" />
            </button>
          )}

          {/* Garantia curta de Loja Oficial */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-400/90 font-medium mb-2.5 truncate">
            <ShieldCheck size={12} className="shrink-0 text-emerald-400" />
            <span className="truncate">
              ✓ Compra garantida direto no site/app oficial da {loja}
            </span>
          </div>

          {/* Botão CTA Direto com a Identidade da Loja */}
          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md active:scale-95 text-xs sm:text-sm ${storeInfo.ctaClass}`}
          >
            <span>Ver Oferta na {storeInfo.shortLabel} ↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}
