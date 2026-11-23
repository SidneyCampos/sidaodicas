"use client";

import React, { useMemo, useState } from "react";
import { Check, Clock, Copy, Ticket, X } from "lucide-react";

const STORE_DOT = {
  Amazon: "bg-[#d89643]",
  "Mercado Livre": "bg-[#e3c15f]",
  Shopee: "bg-[#d96c4a]",
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Central de Cupons de Desconto"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[85vh] bg-[#10161e] border border-[#e7d7bf]/12 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#e7d7bf]/[0.07] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d89643]/15 text-[#e5ad5e] border border-[#d89643]/25 flex items-center justify-center">
              <Ticket size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f2ede4] leading-tight">
                Cupons Selecionados
              </h2>
              <p className="text-xs text-[#8b95a3]">
                Atualizados automaticamente • Copie e aplique na loja oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#8b95a3] hover:text-[#f2ede4] hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Fechar cupons"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#e7d7bf]/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {["Todas", "Amazon", "Mercado Livre", "Shopee"].map((store) => {
            const active = storeFilter === store;
            return (
              <button
                key={store}
                type="button"
                onClick={() => setStoreFilter(store)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[#d89643] text-[#0b0f14] font-bold"
                    : "bg-white/[0.04] text-[#929ca8] hover:text-[#f2ede4] hover:bg-white/[0.08]"
                }`}
              >
                {store}
              </button>
            );
          })}
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map((cupom) => {
              const dotClass = STORE_DOT[cupom.loja] || "bg-[#8b95a3]";
              const isCopied = copiedId === cupom.id;

              return (
                <article
                  key={cupom.id}
                  className="bg-[#151c26]/80 hover:bg-[#19222e] border border-[#e7d7bf]/[0.07] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d5dce4]">
                        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                        {cupom.loja}
                      </span>

                      {cupom.validade && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#6e7885]">
                          • <Clock size={11} /> {cupom.validade}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-[#f2ede4] leading-snug">
                      {cupom.descricao}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <code className="font-mono font-bold text-xs sm:text-sm text-[#e5ad5e] bg-[#0b0f14] border border-dashed border-[#d89643]/40 px-3 py-2 rounded-lg tracking-wider">
                      {cupom.codigo}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleCopyAndRedirect(cupom)}
                      className={`text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                        isCopied
                          ? "bg-[#2f9e75] text-[#0b0f14]"
                          : "bg-[#d89643] hover:bg-[#e5ad5e] text-[#0b0f14]"
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
            <div className="text-center py-10 text-sm text-[#8b95a3]">
              Nenhum cupom ativo encontrado para esta loja no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
