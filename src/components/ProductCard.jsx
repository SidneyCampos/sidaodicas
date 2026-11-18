"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Clock, Copy, ExternalLink, ShieldCheck } from "lucide-react";

const STORE_CONFIG = {
  Amazon: {
    badgeLabel: "Vendido na Amazon",
    badgeClass: "bg-amber-500 text-slate-950",
    dotClass: "bg-slate-950",
    ctaClass: "bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-400/15",
  },
  "Mercado Livre": {
    badgeLabel: "Oficial Mercado Livre",
    badgeClass: "bg-yellow-300 text-slate-950",
    dotClass: "bg-blue-900",
    ctaClass: "bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-400/15",
  },
  Shopee: {
    badgeLabel: "Achado Shopee",
    badgeClass: "bg-orange-500 text-white",
    dotClass: "bg-white",
    ctaClass: "bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-400/15",
  },
};

export default function ProductCard({ product }) {
  const [couponCopied, setCouponCopied] = useState(false);

  const precoAntigo = product.precoAntigo ?? product.precoOriginal ?? 0;
  const precoAtual = product.precoAtual ?? product.precoDesconto ?? 0;
  const imagemUrl = product.imagemUrl ?? product.urlImagem ?? "";
  const loja = product.loja || "Amazon";
  const destaqueTag = product.destaqueTag ?? product.tag ?? "Oferta Verificada";
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
    badgeClass: "bg-yellow-400 text-slate-950",
    dotClass: "bg-slate-950",
    ctaClass: "bg-yellow-400 hover:bg-yellow-300 text-slate-950",
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
    <article className="bg-slate-800/90 rounded-2xl overflow-hidden shadow-xl border border-slate-700/80 hover:border-yellow-400/60 flex flex-col group relative transition-all duration-300 hover:-translate-y-1">
      {/* Barra de Topo do Card: Selo da Loja Oficial + Destaque Tag */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-700/70 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm ${storeInfo.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${storeInfo.dotClass}`} />
          {storeInfo.badgeLabel}
        </span>

        {destaqueTag && (
          <span className="text-[11px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full truncate">
            {destaqueTag}
          </span>
        )}
      </div>

      {/* Imagem do Produto com Fundo Branco Limpo e Efeito Suave de Zoom */}
      <div className="relative w-full h-56 bg-white overflow-hidden flex items-center justify-center p-5">
        {descontoPercentual > 0 && (
          <span className="absolute top-3 right-3 z-10 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
            -{descontoPercentual}% OFF
          </span>
        )}

        <img
          src={imagemUrl}
          alt={product.titulo}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Corpo do Card */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Metadados: Categoria + Verificado Em */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-semibold mb-2">
            <span className="uppercase tracking-wider text-yellow-400/90 font-bold">
              {product.categoria || "Oferta"}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Clock size={12} />
              {verificadoEm}
            </span>
          </div>

          {/* Título do Produto */}
          <h3 className="text-slate-100 font-bold text-base leading-snug line-clamp-2 mb-4 group-hover:text-yellow-400 transition-colors">
            {product.titulo}
          </h3>

          {/* Mini-tag de Cupom Opcional (Click-to-Copy) */}
          {cupomOpcional && (
            <button
              type="button"
              onClick={handleCopyCoupon}
              title="Clique para copiar o cupom"
              className={`w-full mb-4 px-3 py-2 rounded-xl border border-dashed text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                couponCopied
                  ? "bg-emerald-950/80 border-emerald-400 text-emerald-300"
                  : "bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/60 text-yellow-300"
              }`}
            >
              <span className="truncate">
                {couponCopied
                  ? `✅ Cupom ${cupomOpcional} copiado!`
                  : `🎟️ Use o cupom: ${cupomOpcional}`}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] uppercase bg-slate-900/80 px-2 py-0.5 rounded text-slate-200 shrink-0">
                {couponCopied ? <Check size={12} /> : <Copy size={12} />}
                {couponCopied ? "Copiado" : "Copiar"}
              </span>
            </button>
          )}
        </div>

        <div>
          {/* Bloco de Preço e Economia */}
          <div className="bg-slate-900/75 border border-slate-700/60 rounded-xl p-3.5 mb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              {precoAntigo > precoAtual ? (
                <span className="text-slate-400 text-xs sm:text-sm line-through font-medium">
                  De: {formatPrice(precoAntigo)}
                </span>
              ) : (
                <span className="text-slate-400 text-xs">Preço verificado</span>
              )}

              {descontoPercentual > 0 && (
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black px-2 py-0.5 rounded-md">
                  -{descontoPercentual}% OFF
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-slate-300 font-bold">Por:</span>
              <span className="text-2xl sm:text-3xl font-black text-[#facc15] tracking-tight">
                {formatPrice(precoAtual)}
              </span>
            </div>
          </div>

          {/* Selo de Confiança da Loja Oficial */}
          <div className="flex items-start gap-1.5 text-xs text-emerald-400 font-medium mb-4 leading-snug">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>
              ✓ Compra garantida direto no site/app oficial da{" "}
              <strong className="text-white">{loja}</strong>
            </span>
          </div>

          {/* CTA de Alta Conversão */}
          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#facc15] hover:bg-yellow-300 text-slate-950 font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-yellow-400/15 active:scale-95 text-sm sm:text-base"
          >
            <span>Ver Oferta na {loja} ↗</span>
          </a>
        </div>
      </div>
    </article>
  );
}
