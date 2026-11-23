"use client";

import React, { useMemo, useState } from "react";
import { Check, Clock, Copy, Sparkles, Ticket, X } from "lucide-react";

const STORE_DOT = {
  Amazon: "bg-amber-400",
  "Mercado Livre": "bg-yellow-300",
  Shopee: "bg-orange-500",
};

export default function CouponsSection({ cupons = [], isOpen = false, onClose }) {
  const [copiedId, setCopiedId] = useState(null);
  const [storeFilter, setStoreFilter] = useState("Todas");

  const filteredCoupons = useMemo(() => {
    if (storeFilter === "Todas") return cupons;
    return cupons.filter(
      (c) => c.loja && c.loja.toLowerCase() === storeFilter.toLowerCase()
    );
  }, [cupons, storeFilter]);

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Central de Cupons de Desconto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[85vh] bg-[#0e1422] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#facc15]/15 text-[#facc15] flex items-center justify-center">
              <Ticket size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Cupons de Desconto Ativos
              </h2>
              <p className="text-xs text-slate-400">
                Atualizados automaticamente • Copie e aplique na loja oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Fechar cupons"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filtro Rápido por Loja dentro do Modal */}
        <div className="px-5 py-3 border-b border-white/[0.05] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {["Todas", "Amazon", "Mercado Livre", "Shopee"].map((store) => {
            const active = storeFilter === store;
            return (
              <button
                key={store}
                type="button"
                onClick={() => setStoreFilter(store)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-white text-slate-950"
                    : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {store}
              </button>
            );
          })}
        </div>

        {/* Lista Limpa de Cupons */}
        <div className="p-5 overflow-y-auto space-y-3">
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((cupom) => {
              const dotClass = STORE_DOT[cupom.loja] || "bg-slate-400";
              const isCopied = copiedId === cupom.id;

              return (
                <article
                  key={cupom.id}
                  className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                        {cupom.loja}
                      </span>

                      {cupom.validade && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          • <Clock size={11} /> {cupom.validade}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      {cupom.descricao}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <code className="font-mono font-bold text-xs sm:text-sm text-[#facc15] bg-black/40 border border-dashed border-[#facc15]/40 px-3 py-2 rounded-lg tracking-wider">
                      {cupom.codigo}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleCopyAndRedirect(cupom)}
                      className={`text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                        isCopied
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-[#facc15] hover:bg-yellow-300 text-slate-950"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} strokeWidth={3} />
                          <span>Copiado!</span>
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
            })
          ) : (
            <div className="text-center py-10 text-sm text-slate-400">
              Nenhum cupom ativo encontrado para esta loja no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
