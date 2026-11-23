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
  Zap,
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
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setNotifPermission(Notification.permission);
      }
      const img = new window.Image();
      img.onload = () => setAvatarLoaded(true);
      img.onerror = () => setAvatarLoaded(false);
      img.src = "/avatar-sidao.png";
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 w-full bg-[#090d16]/90 backdrop-blur-xl border-b border-white/[0.06] z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Identidade Limpa e Minimalista */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 p-0.5 flex items-center justify-center overflow-hidden">
              {avatarLoaded ? (
                <img
                  src="/avatar-sidao.png"
                  alt="Sidão Dicas"
                  className="w-full h-full rounded-[9px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[9px] bg-[#facc15] text-slate-950 flex items-center justify-center">
                  <Zap size={18} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Sidão <span className="text-[#facc15]">Dicas</span>
              </span>
              <BadgeCheck
                size={15}
                className="text-emerald-400 shrink-0"
                title="Curadoria Oficial Verificada"
              />
            </div>
          </a>

          {/* Busca Clean (Desktop) */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-lg relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produto, loja ou cupom..."
                aria-label="Buscar ofertas"
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/[0.08] focus:border-white/25 focus:outline-none text-sm text-white placeholder-slate-500 pl-10 pr-8 py-2 rounded-full transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Ações Discretas e Organizadas (Sem competição de cores) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão Único de Cupons (Abre Modal Limpo) */}
            {onOpenCoupons && (
              <button
                type="button"
                onClick={onOpenCoupons}
                className="text-xs font-semibold py-2 px-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ver Cupons de Desconto Ativos"
              >
                <Ticket size={14} className="text-[#facc15]" />
                <span>Cupons</span>
                {cuponsCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#facc15] text-slate-950 px-1.5 py-0.2 rounded-full">
                    {cuponsCount}
                  </span>
                )}
              </button>
            )}

            {/* Favoritos / Salvos (Aumenta permanência na página) */}
            {onToggleSavedOnly && (
              <button
                type="button"
                onClick={onToggleSavedOnly}
                className={`relative p-2 sm:px-3 sm:py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showSavedOnly
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300"
                }`}
                title="Ofertas Salvas"
                aria-label="Ofertas Salvas"
              >
                <Heart
                  size={15}
                  className={showSavedOnly ? "fill-rose-400 text-rose-400" : ""}
                />
                {savedCount > 0 && (
                  <span className="text-[10px] font-bold">{savedCount}</span>
                )}
              </button>
            )}

            {/* Alertas (Ícone discreto) */}
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer"
              aria-label="Ativar Alertas de Ofertas"
              title="Alertas de Ofertas"
            >
              <Bell
                size={16}
                className={
                  notifPermission === "granted" ? "text-emerald-400" : ""
                }
              />
            </button>

            {/* Grupo VIP WhatsApp */}
            <a
              href="https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold py-2 px-3 sm:px-3.5 rounded-full flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle size={14} className="shrink-0" />
              <span className="hidden sm:inline">Grupo VIP</span>
              <span className="sm:hidden">VIP</span>
            </a>
          </div>
        </div>

        {/* Busca Mobile Clean */}
        {onSearchChange && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produto ou loja..."
                aria-label="Buscar ofertas"
                className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-white/25 focus:outline-none text-xs text-white placeholder-slate-500 pl-9 pr-8 py-2 rounded-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
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
