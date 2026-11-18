"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink, Ticket, Clock, ShieldCheck } from "lucide-react";

const STORE_STYLES = {
  Amazon: {
    badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    accentBorder: "hover:border-amber-500/50",
    topBar: "bg-gradient-to-r from-amber-500 to-orange-400",
    dot: "bg-amber-400",
    label: "Amazon Brasil Oficial",
  },
  "Mercado Livre": {
    badgeBg: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
    accentBorder: "hover:border-yellow-400/50",
    topBar: "bg-gradient-to-r from-yellow-400 to-amber-300",
    dot: "bg-yellow-400",
    label: "Mercado Livre Oficial",
  },
  Shopee: {
    badgeBg: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    accentBorder: "hover:border-orange-500/50",
    topBar: "bg-gradient-to-r from-orange-500 to-red-500",
    dot: "bg-orange-500",
    label: "Shopee Oficial",
  },
};

export default function CouponsSection({ cupons = [] }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyAndRedirect = async (cupom) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cupom.codigo);
      }
    } catch (err) {
      console.warn("Erro ao copiar cupom:", err);
    }

    setCopiedId(cupom.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === cupom.id ? null : prev));
    }, 3000);

    if (cupom.linkAfiliadoLoja) {
      window.open(cupom.linkAfiliadoLoja, "_blank", "noopener,noreferrer");
    }
  };

  if (!cupons || cupons.length === 0) return null;

  return (
    <section aria-labelledby="cupons-heading" className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2
            id="cupons-heading"
            className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5"
          >
            <span>🎟️ Cupons de Desconto Ativos</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Clique para copiar o código automaticamente e abrir a página oficial da promoção.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
          <ShieldCheck size={14} />
          <span>Testados pela Curadoria</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cupons.map((cupom) => {
          const style = STORE_STYLES[cupom.loja] || STORE_STYLES.Amazon;
          const isCopied = copiedId === cupom.id;

          return (
            <article
              key={cupom.id}
              className={`bg-slate-800/80 border border-slate-700/80 ${style.accentBorder} rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5`}
            >
              {/* Barra Superior com a cor da loja */}
              <div className={`h-1.5 w-full ${style.topBar}`} />

              <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-4">
                <div>
                  {/* Topo: Loja + Validade */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-md border ${style.badgeBg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      {cupom.loja}
                    </span>

                    {cupom.validade && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock size={12} />
                        {cupom.validade}
                      </span>
                    )}
                  </div>

                  {/* Descrição do benefício */}
                  <p className="text-slate-100 font-bold text-sm sm:text-base leading-snug">
                    {cupom.descricao}
                  </p>
                </div>

                {/* Código Pontilhado + Botão Copiar e Ir para a Loja */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <div className="flex items-center justify-between bg-slate-900/90 border-2 border-dashed border-yellow-400/50 rounded-xl px-3.5 py-2">
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className="text-yellow-400 shrink-0" />
                      <span className="text-xs text-slate-400 font-medium">CÓDIGO:</span>
                    </div>
                    <code className="font-mono font-black text-sm sm:text-base text-yellow-400 tracking-wider">
                      {cupom.codigo}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAndRedirect(cupom)}
                    className={`w-full font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      isCopied
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : "bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-md shadow-yellow-400/10"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={16} strokeWidth={3} />
                        <span>✅ Código Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copiar e Ir para a Loja ↗</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
