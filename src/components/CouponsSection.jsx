"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Clock, Copy, Ticket, X } from "lucide-react";

const STORE_DOT = {
  Amazon: "bg-[#d89643]",
  "Mercado Livre": "bg-[#e3c15f]",
  Shopee: "bg-[#d96c4a]",
};

export default function CouponsSection({
  cupons = [],
  isOpen = false,
  onClose,
  onNotify,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [storeFilter, setStoreFilter] = useState("Todas");

  // Acessibilidade de teclado: fecha com tecla Esc e trava scroll do fundo
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
    if (onNotify) onNotify(`Cupom ${cupom.codigo} copiado!`);
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
      aria-labelledby="cupons-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[85vh] bg-[#10161e] border border-[#e7d7bf]/12 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#e7d7bf]/[0.07] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d89643]/15 text-[#e5ad5e] border border-[#d89643]/25 flex items-center justify-center">
              <Ticket size={16} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="cupons-modal-title"
                className="text-base font-bold text-[#f2ede4] leading-tight"
              >
                Cupons Selecionados
              </h2>
              <p className="text-xs text-[#94a0ad]">
                Atualizados automaticamente • Copie e aplique na loja oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#94a0ad] hover:text-[#f2ede4] hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Fechar janela de cupons"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          role="group"
          aria-label="Filtrar cupons por loja"
          className="px-5 py-3 border-b border-[#e7d7bf]/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          {["Todas", "Amazon", "Mercado Livre", "Shopee"].map((store) => {
            const active = storeFilter === store;
            return (
              <button
                key={store}
                type="button"
                aria-pressed={active}
                onClick={() => setStoreFilter(store)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[#d89643] text-[#0b0f14] font-bold"
                    : "bg-white/[0.04] text-[#9ca7b4] hover:text-[#f2ede4] hover:bg-white/[0.08]"
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
              const dotClass = STORE_DOT[cupom.loja] || "bg-[#94a0ad]";
              const isCopied = copiedId === cupom.id;

              return (
                <article
                  key={cupom.id}
                  className="bg-[#151c26]/80 hover:bg-[#19222e] border border-[#e7d7bf]/[0.08] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#d5dce4]">
                        <span
                          aria-hidden="true"
                          className={`w-2 h-2 rounded-full ${dotClass}`}
                        />
                        {cupom.loja}
                      </span>

                      {cupom.validade && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8f9aa8]">
                          • <Clock size={11} aria-hidden="true" />{" "}
                          {cupom.validade}
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
                      aria-label={`Copiar cupom ${cupom.codigo} e ir para ${cupom.loja}`}
                      className={`text-xs font-bold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                        isCopied
                          ? "bg-[#2f9e75] text-[#0b0f14]"
                          : "bg-[#d89643] hover:bg-[#e5ad5e] text-[#0b0f14]"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} strokeWidth={3} aria-hidden="true" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} aria-hidden="true" />
                          <span>Copiar e Ir ↗</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-10 text-sm text-[#94a0ad]">
              Nenhum cupom ativo encontrado para esta loja no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
