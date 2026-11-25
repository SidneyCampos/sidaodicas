"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart, Share2, Star } from "lucide-react";

const STORE_ACCENT = {
  Amazon: {
    dot: "bg-[#d89643]",
    shortLabel: "Amazon",
  },
  "Mercado Livre": {
    dot: "bg-[#e3c15f]",
    shortLabel: "Mercado Livre",
  },
  Shopee: {
    dot: "bg-[#d96c4a]",
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

export default function ProductCard({
  product,
  isSaved = false,
  onToggleSave,
  onNotify,
}) {
  const [couponCopied, setCouponCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const precoAntigo = Number(product.precoAntigo ?? product.precoOriginal ?? 0);
  const precoAtual = Number(product.precoAtual ?? product.precoDesconto ?? 0);
  const precoObs = (product.precoObs || "").trim();
  const imagemUrl = product.imagemUrl ?? product.urlImagem ?? "";
  const loja = product.loja || "Amazon";
  const cupomOpcional = product.cupomOpcional || "";
  const linkAfiliado = product.linkAfiliado || "#";
  const nota = product.nota || "";
  const verifiedTimestamp = product.ultimaVerificacaoEm || product.criadoEm;

  const [relativeTime, setRelativeTime] = useState(() =>
    verifiedTimestamp
      ? formatRelativeVerifiedTime(verifiedTimestamp, product.verificadoEm)
      : "Hoje"
  );

  useEffect(() => {
    setRelativeTime(
      formatRelativeVerifiedTime(verifiedTimestamp, product.verificadoEm)
    );
  }, [verifiedTimestamp, product.verificadoEm]);

  const descontoPercentual = calculateDiscountPercentage(
    precoAntigo,
    precoAtual,
    product.descontoPercentual
  );

  const storeStyle = STORE_ACCENT[loja] || {
    dot: "bg-[#94a0ad]",
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
    if (onNotify) onNotify(`Cupom ${cupomOpcional} copiado!`);
    setTimeout(() => setCouponCopied(false), 2500);
  };

  const handleShareOffer = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareText = `Olha essa oferta no Sidão Dicas: ${product.titulo} por ${formatPrice(
      precoAtual
    )} na ${storeStyle.shortLabel}!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.titulo,
          text: shareText,
          url: linkAfiliado,
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${linkAfiliado}`);
        if (onNotify) onNotify("Link da oferta copiado para compartilhar!");
      }
    } catch {
      // Usuário cancelou o compartilhamento nativo
    }
  };

  return (
    <article className="bg-[#121820] hover:bg-[#151c26] rounded-2xl border border-[#e7d7bf]/[0.08] hover:border-[#d89643]/40 flex flex-col group transition-all duration-300 overflow-hidden shadow-lg shadow-black/25">
      {/* 1. Moldura Fotográfica em Off-White Suave */}
      <div className="relative p-2.5 pb-0">
        <a
          href={linkAfiliado}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver oferta: ${product.titulo} na ${storeStyle.shortLabel}`}
          className="relative w-full h-40 sm:h-48 bg-[#faf9f6] rounded-xl overflow-hidden flex items-center justify-center p-4 block"
        >
          {descontoPercentual > 0 && (
            <span
              className="absolute top-2.5 right-2.5 z-10 bg-[#121820]/90 text-[#e5ad5e] border border-[#d89643]/35 text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm"
              aria-label={`${descontoPercentual}% de desconto`}
            >
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
              decoding="async"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-500">
              {storeStyle.shortLabel}
            </span>
          )}
        </a>

        {/* Ações Rápidas Discretas: Salvar + Compartilhar (Retenção & Alcance Orgânico) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(product.id, product.titulo);
              }}
              aria-pressed={isSaved}
              aria-label={
                isSaved
                  ? `Remover ${product.titulo} dos salvos`
                  : `Salvar ${product.titulo}`
              }
              title={isSaved ? "Salvo nos favoritos" : "Salvar para ver depois"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isSaved
                  ? "bg-[#d89643] text-[#0b0f14] shadow-md"
                  : "bg-[#121820]/70 text-[#f2ede4]/90 hover:bg-[#121820] hover:text-[#f2ede4] opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              }`}
            >
              <Heart
                size={14}
                aria-hidden="true"
                className={isSaved ? "fill-[#0b0f14]" : ""}
              />
            </button>
          )}

          <button
            type="button"
            onClick={handleShareOffer}
            aria-label={`Compartilhar oferta: ${product.titulo}`}
            title="Compartilhar oferta"
            className="w-8 h-8 rounded-full bg-[#121820]/70 text-[#f2ede4]/90 hover:bg-[#121820] hover:text-[#e5ad5e] flex items-center justify-center transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Share2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 2. Conteúdo Editorial Limpo (Contraste WCAG AA) */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#94a0ad] mb-1.5">
            <span className="inline-flex items-center gap-1.5 font-medium truncate">
              <span
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${storeStyle.dot}`}
              />
              <span className="truncate">{storeStyle.shortLabel}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-[#8f9aa8] shrink-0">
              {nota && (
                <span
                  className="inline-flex items-center gap-0.5 text-[#c0c8d2] font-medium"
                  aria-label={`Nota ${nota} de 5`}
                >
                  <Star
                    size={10}
                    aria-hidden="true"
                    className="fill-[#d89643] text-[#d89643]"
                  />
                  {nota}
                </span>
              )}
              <span className="hidden sm:inline">{relativeTime}</span>
            </span>
          </div>

          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-[#ede7dc] font-medium text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {product.titulo}
            </h3>
          </a>
        </div>

        {/* 3. Preço + Cupom Discreto + CTA Coeso */}
        <div className="space-y-2.5 pt-1">
          <div>
            {precoAntigo > precoAtual && (
              <span className="block text-[#8f9aa8] text-[11px] sm:text-xs line-through">
                <span className="sr-only">Preço anterior: </span>
                {formatPrice(precoAntigo)}
              </span>
            )}
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-bold text-[#f7f3ec] tracking-tight leading-none">
                <span className="sr-only">Preço atual: </span>
                {formatPrice(precoAtual)}
              </span>
              {precoObs && (
                <span className="text-[11px] font-medium text-[#e5ad5e]">
                  {precoObs}
                </span>
              )}
            </div>
          </div>

          {cupomOpcional && (
            <button
              type="button"
              onClick={handleCopyCoupon}
              aria-label={`Copiar cupom ${cupomOpcional}`}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-between gap-1.5 transition-colors cursor-pointer ${
                couponCopied
                  ? "bg-[#182e24] border-[#2f9e75]/45 text-[#7ae0ae]"
                  : "bg-[#0d1218]/70 hover:bg-[#1a222d] border-dashed border-[#d89643]/40 text-[#e5ad5e]"
              }`}
            >
              <span className="truncate font-mono">
                {couponCopied
                  ? `Copiado: ${cupomOpcional}`
                  : `Cupom: ${cupomOpcional}`}
              </span>
              {couponCopied ? (
                <Check size={12} aria-hidden="true" className="shrink-0 text-[#7ae0ae]" />
              ) : (
                <Copy size={11} aria-hidden="true" className="shrink-0 text-[#d89643]" />
              )}
            </button>
          )}

          <a
            href={linkAfiliado}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ir para ${storeStyle.shortLabel} ver ${product.titulo} (abre em nova aba)`}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1b222c] hover:bg-[#d89643] text-[#f2ede4] hover:text-[#0b0f14] border border-[#e7d7bf]/[0.1] hover:border-[#d89643] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
          >
            <span>Ir para {storeStyle.shortLabel}</span>
            <ArrowUpRight size={14} aria-hidden="true" className="shrink-0" />
          </a>
        </div>
      </div>
    </article>
  );
}
