"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart, Star } from "lucide-react";

const STORE_ACCENT = {
  Amazon: {
    dot: "bg-amber-400",
    shortLabel: "Amazon",
  },
  "Mercado Livre": {
    dot: "bg-yellow-300",
    shortLabel: "Mercado Livre",
  },
  Shopee: {
    dot: "bg-orange-500",
    shortLabel: "Shopee",
  },
};

export function formatRelativeVerifiedTime(criadoEm, fallbackText) {
  if (!criadoEm) {
    return fallbackText || "Hoje";
  }

  const parsed = new Date(criadoEm).getTime();
  if (Number.isNaN(parsed)) {
    return fallbackText || "Hoje";
  }

  const diffMs = Date.now() - parsed;
  if (diffMs < 0) {
    return "Agora";
  }

  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 2) {
    return "Agora";
  }
  if (diffMin < 60) {
    return `há ${diffMin} min`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Ontem";
  }

  return "Hoje";
}

export function calculateDiscountPercentage(
  precoAntigo,
  precoAtual,
  manualPercent
) {
  const manual = Number(manualPercent);
  if (!Number.isNaN(manual) && manual > 0) {
    return Math.round(manual);
  }
  const oldVal = Number(precoAntigo);
  const newVal = Number(precoAtual);
  if (
    !Number.isNaN(oldVal) &&
    !Number.isNaN(newVal) &&
    oldVal > newVal &&
    oldVal > 0
  ) {
    return Math.round(((oldVal - newVal) / oldVal) * 100);
  }
  return 0;
}

export default function ProductCard({ product, isSaved = false, onToggleSave }) {
  const [couponCopied, setCouponCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const precoAntigo = Number(product.precoAntigo ?? product.precoOriginal ?? 0);
  const precoAtual = Number(product.precoAtual ?? product.precoDesconto ?? 0);
  const imagemUrl = product.imagemUrl ?? product.urlImagem ?? "";
  const loja = product.loja || "Amazon";
  const cupomOpcional = product.cupomOpcional || "";
  const linkAfiliado = product.linkAfiliado || "#";
  const nota = product.nota || "";

  const [relativeTime, setRelativeTime] = useState(() =>
    product.criadoEm
      ? formatRelativeVerifiedTime(product.criadoEm, product.verificadoEm)
      : "Hoje"
  );

  useEffect(() => {
    setRelativeTime(
      formatRelativeVerifiedTime(product.criadoEm, product.verificadoEm)
    );
  }, [product.criadoEm, product.verificadoEm]);

  const descontoPercentual = calculateDiscountPercentage(
    precoAntigo,
    precoAtual,
    product.descontoPercentual
  );

  const storeStyle = STORE_ACCENT[loja] || {
    dot: "bg-slate-400",
    shortLabel: loja,
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
      console.warn("Erro ao copiar cupom:", err);
    }

    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  return (
    <article className="bg-[#111827]/80 hover:bg-[#141c2f] rounded-2xl border border-white/[0.06] hover:border-white/[0.14] flex flex-col group transition-all duration-200 overflow-hidden">
      {/* 1. Foto Limpa (Apenas 1 badge de desconto no canto + coração discreto de salvar) */}
      <div className="relative p-2.5 pb-0">
        <a
          href={linkAfiliado}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-full h-40 sm:h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center p-4 block"
        >
          {descontoPercentual > 0 && (
            <span className="absolute top-2.5 right-2.5 z-10 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
              -{descontoPercentual}%
            </span>
          )}

          {!imgError && imagemUrl ? (
            <img
              src={imagemUrl}
              alt={product.titulo}
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              {storeStyle.shortLabel}
            </span>
          )}
        </a>

        {/* Botão Discreto de Salvar Oferta (Retenção do usuário) */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleSave(product.id);
            }}
            aria-label={isSaved ? "Remover dos salvos" : "Salvar oferta"}
            title={isSaved ? "Salvo" : "Salvar para ver depois"}
            className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isSaved
                ? "bg-rose-500 text-white shadow-md"
                : "bg-slate-900/65 text-white/80 hover:bg-slate-900 hover:text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            }`}
          >
            <Heart size={14} className={isSaved ? "fill-white" : ""} />
          </button>
        )}
      </div>

      {/* 2. Conteúdo Enxuto e Respirado ("Trust Trio": Loja • Nota/Tempo • Preço) */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          {/* Metadados silenciosos (Sem poluição visual!) */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-1.5">
            <span className="inline-flex items-center gap-1.5 font-medium truncate">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${storeStyle.dot}`} />
              <span className="truncate">{storeStyle.shortLabel}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-slate-500 shrink-0">
              {nota && (
                <span className="inline-flex items-center gap-0.5 text-slate-400 font-medium">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  {nota}
                </span>
              )}
              <span className="hidden sm:inline">{relativeTime}</span>
            </span>
          </div>

          {/* Título Limpo */}
          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-slate-100 font-semibold text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {product.titulo}
            </h3>
          </a>
        </div>

        {/* 3. Hierarquia de Preço Única + Cupom Discreto + CTA Coeso */}
        <div className="space-y-2.5 pt-1">
          <div>
            {precoAntigo > precoAtual && (
              <span className="block text-slate-500 text-[11px] sm:text-xs line-through">
                {formatPrice(precoAntigo)}
              </span>
            )}
            <span className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-none">
              {formatPrice(precoAtual)}
            </span>
          </div>

          {/* Mini chip discreto de cupom (somente se existir) */}
          {cupomOpcional && (
            <button
              type="button"
              onClick={handleCopyCoupon}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between gap-1.5 transition-colors cursor-pointer ${
                couponCopied
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-white/[0.03] hover:bg-white/[0.07] border-dashed border-white/15 text-slate-300"
              }`}
            >
              <span className="truncate font-mono">
                {couponCopied ? `Copiado: ${cupomOpcional}` : `Cupom: ${cupomOpcional}`}
              </span>
              {couponCopied ? (
                <Check size={12} className="shrink-0 text-emerald-400" />
              ) : (
                <Copy size={11} className="shrink-0 text-slate-400" />
              )}
            </button>
          )}

          {/* CTA Unificado e Elegante (Acende em Amarelo Sidão no hover) */}
          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.07] hover:bg-[#facc15] text-white hover:text-slate-950 border border-white/[0.08] hover:border-[#facc15] font-bold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
          >
            <span>Ir para {storeStyle.shortLabel}</span>
            <ArrowUpRight size={14} className="shrink-0" />
          </a>
        </div>
      </div>
    </article>
  );
}
