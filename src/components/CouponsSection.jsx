"use client";

import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Clock, Copy, Sparkles, Ticket, X } from "lucide-react";

const STORE_STYLES = {
  Amazon: {
    pill: "bg-[#FF9900]/15 text-[#FF9900] border-[#FF9900]/40",
    topBar: "bg-[#FF9900]",
    dot: "bg-[#FF9900]",
    btn: "bg-[#FF9900] hover:bg-[#e68a00] text-slate-950",
  },
  "Mercado Livre": {
    pill: "bg-[#FFE600]/15 text-[#FFE600] border-[#FFE600]/40",
    topBar: "bg-[#FFE600]",
    dot: "bg-[#FFE600]",
    btn: "bg-[#FFE600] hover:bg-[#f5dc00] text-slate-950",
  },
  Shopee: {
    pill: "bg-[#EE4D2D]/15 text-[#ff6b4a] border-[#EE4D2D]/40",
    topBar: "bg-[#EE4D2D]",
    dot: "bg-[#EE4D2D]",
    btn: "bg-[#EE4D2D] hover:bg-[#d84325] text-white",
  },
};

export default function CouponsSection({ cupons = [], isOpenExternal, onToggleExternal }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const isExpanded = isOpenExternal !== undefined ? isOpenExternal : internalOpen;
  const handleToggle = () => {
    if (onToggleExternal) {
      onToggleExternal(!isExpanded);
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

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
    <section aria-label="Cupons de Desconto Ativos" className="mb-4">
      {/* Barra Compacta de Cupons (Estilo Shopee / Mercado Livre - 1 linha que não ocupa espaço) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800/95 to-slate-900 border border-yellow-400/35 hover:border-yellow-400/70 rounded-xl transition-all shadow-md">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left cursor-pointer"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-yellow-400 text-slate-950 shrink-0 shadow-sm">
              <Ticket size={16} strokeWidth={2.5} />
            </span>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
              <span className="text-xs sm:text-sm font-black text-white truncate">
                🎟️ {cupons.length} Cupons de Desconto Ativos
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                Amazon • Mercado Livre • Shopee
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mini preview dos códigos quando fechado */}
            {!isExpanded && (
              <div className="hidden md:flex items-center gap-1.5">
                {cupons.slice(0, 3).map((c) => (
                  <span
                    key={c.id}
                    className="text-[11px] font-mono font-bold text-yellow-400 bg-slate-950/90 border border-dashed border-yellow-400/40 px-2 py-0.5 rounded"
                  >
                    {c.codigo}
                  </span>
                ))}
              </div>
            )}

            <span className="inline-flex items-center gap-1 bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/30 text-xs font-extrabold px-2.5 py-1 rounded-lg transition-colors">
              <span>{isExpanded ? "Ocultar" : "Pegar Cupons"}</span>
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </div>
        </button>

        {/* Gaveta Expansível de Cupons (Só aparece quando o usuário clica!) */}
        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-700/70 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {cupons.map((cupom) => {
                const style = STORE_STYLES[cupom.loja] || STORE_STYLES.Amazon;
                const isCopied = copiedId === cupom.id;

                return (
                  <article
                    key={cupom.id}
                    className="bg-slate-900/95 border border-slate-700/80 rounded-xl overflow-hidden flex flex-col justify-between p-3 relative"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${style.topBar}`} />

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 pt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded border ${style.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {cupom.loja}
                        </span>

                        {cupom.validade && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock size={10} />
                            {cupom.validade}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-100 font-bold text-xs leading-snug mb-2.5">
                        {cupom.descricao}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 border border-dashed border-yellow-400/50 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">CUPOM:</span>
                        <code className="font-mono font-black text-xs text-yellow-400">
                          {cupom.codigo}
                        </code>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyAndRedirect(cupom)}
                        className={`font-black text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-500 text-slate-950"
                            : style.btn
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} strokeWidth={3} />
                            <span>✅ Código Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copiar e Ir ↗</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
