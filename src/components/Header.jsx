"use client";

import React, { useState, useEffect } from "react";
import {
  BadgeCheck,
  Bell,
  Heart,
  MessageCircle,
  Search,
  Ticket,
  X,
} from "lucide-react";
import NotificationModal from "./NotificationModal";

export default function Header({
  searchQuery = "",
  onSearchChange,
  cuponsCount = 0,
  onOpenCoupons,
  savedCount = 0,
  showSavedOnly = false,
  onToggleSavedOnly,
}) {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  return (
    <>
      {/* Link de acessibilidade para pular direto às ofertas via teclado (WCAG 2.1 A) */}
      <a
        href="#conteudo-ofertas"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:bg-[#d89643] focus:text-[#0b0f14] focus:font-bold focus:text-xs focus:px-4 focus:py-2.5 focus:rounded-xl focus:shadow-xl"
      >
        Pular para as ofertas
      </a>

      <header className="sticky top-0 w-full bg-[#0b0f14]/90 backdrop-blur-xl border-b border-[#e7d7bf]/[0.07] z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Identidade Coerente com o Canal do YouTube (@SidãoDicasOfertas) */}
          <a
            href="#conteudo-ofertas"
            className="flex items-center gap-3 shrink-0 group"
            aria-label="Sidão Dicas Ofertas — Ir para a vitrine"
          >
            <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8c5a22] via-[#e5ad5e] to-[#d89643] shadow-md shadow-black/40 shrink-0">
              <img
                src="/avatar-sidao.png"
                alt="Foto de Sidão Dicas Ofertas"
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover bg-[#121820]"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] sm:text-base font-bold text-[#f2ede4] tracking-tight leading-none group-hover:text-white transition-colors">
                  Sidão Dicas{" "}
                  <span className="text-[#e5ad5e] font-semibold">Ofertas</span>
                </span>
                <BadgeCheck
                  size={14}
                  aria-hidden="true"
                  className="text-[#d89643] shrink-0"
                />
              </div>
              <span className="text-[11px] text-[#94a0ad] font-medium tracking-wide mt-0.5 hidden sm:block">
                @SidãoDicasOfertas
              </span>
            </div>
          </a>

          {/* Busca Minimalista Estilo Estúdio (Desktop) */}
          {onSearchChange && (
            <div role="search" className="hidden md:flex flex-1 max-w-md relative">
              <Search
                size={15}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a0ad] pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produto, loja ou cupom..."
                aria-label="Buscar ofertas por produto, loja ou cupom"
                className="w-full bg-[#121820]/90 hover:bg-[#161e28] focus:bg-[#161e28] border border-[#e7d7bf]/[0.1] focus:border-[#d89643]/60 focus:outline-none text-sm text-[#f2ede4] placeholder-[#8f9aa8] pl-10 pr-8 py-2 rounded-full transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a0ad] hover:text-[#f2ede4] cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Ações Discretas em Tons Quentes e Neutros */}
          <nav
            aria-label="Ações principais"
            className="flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            {onOpenCoupons && (
              <button
                type="button"
                onClick={onOpenCoupons}
                className="text-xs font-semibold py-2 px-3 rounded-full bg-[#121820] hover:bg-[#1a222d] text-[#f2ede4] border border-[#e7d7bf]/[0.1] hover:border-[#d89643]/45 flex items-center gap-1.5 transition-all cursor-pointer"
                aria-label={`Abrir cupons de desconto ativos (${cuponsCount} disponíveis)`}
              >
                <Ticket size={14} aria-hidden="true" className="text-[#e5ad5e]" />
                <span>Cupons</span>
                {cuponsCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#d89643]/20 text-[#e5ad5e] border border-[#d89643]/30 px-1.5 py-0.2 rounded-full">
                    {cuponsCount}
                  </span>
                )}
              </button>
            )}

            {onToggleSavedOnly && (
              <button
                type="button"
                onClick={onToggleSavedOnly}
                aria-pressed={showSavedOnly}
                className={`relative p-2 sm:px-3 sm:py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showSavedOnly
                    ? "bg-[#d89643]/15 border-[#d89643]/55 text-[#e5ad5e]"
                    : "bg-[#121820] hover:bg-[#1a222d] border-[#e7d7bf]/[0.1] text-[#a5b0bd] hover:text-[#f2ede4]"
                }`}
                aria-label={`Filtrar ofertas salvas (${savedCount} salvas)`}
                title="Ofertas Salvas"
              >
                <Heart
                  size={15}
                  aria-hidden="true"
                  className={
                    showSavedOnly ? "fill-[#e5ad5e] text-[#e5ad5e]" : ""
                  }
                />
                {savedCount > 0 && (
                  <span className="text-[10px] font-bold">{savedCount}</span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-2 rounded-full bg-[#121820] hover:bg-[#1a222d] text-[#a5b0bd] hover:text-[#f2ede4] border border-[#e7d7bf]/[0.1] transition-all cursor-pointer"
              aria-label="Ativar alertas de ofertas no navegador"
              title="Alertas de Ofertas"
            >
              <Bell
                size={15}
                aria-hidden="true"
                className={notifPermission === "granted" ? "text-[#5ed3a2]" : ""}
              />
            </button>

            <a
              href="https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#182e24] hover:bg-[#1f3d2f] text-[#7ae0ae] border border-[#2f9e75]/35 text-xs font-semibold py-2 px-3 sm:px-3.5 rounded-full flex items-center gap-1.5 transition-colors"
              aria-label="Entrar no Grupo VIP do WhatsApp (abre em nova aba)"
            >
              <MessageCircle size={14} aria-hidden="true" className="shrink-0" />
              <span className="hidden sm:inline">Grupo VIP</span>
              <span className="sm:hidden">VIP</span>
            </a>
          </nav>
        </div>

        {/* Busca Mobile */}
        {onSearchChange && (
          <div role="search" className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a0ad] pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produto ou loja..."
                aria-label="Buscar ofertas por produto ou loja"
                className="w-full bg-[#121820] border border-[#e7d7bf]/[0.1] focus:border-[#d89643]/60 focus:outline-none text-xs text-[#f2ede4] placeholder-[#8f9aa8] pl-9 pr-8 py-2 rounded-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a0ad] hover:text-[#f2ede4]"
                  aria-label="Limpar busca"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onStatusChange={(status) => setNotifPermission(status)}
      />
    </>
  );
}
