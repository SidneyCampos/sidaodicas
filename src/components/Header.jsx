"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Lock,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  X,
  Zap,
} from "lucide-react";
import NotificationModal from "./NotificationModal";

export default function Header({
  searchQuery = "",
  onSearchChange,
  cuponsCount = 3,
  isCouponsOpen = false,
  onToggleCoupons,
}) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");
  const [showTrustPopover, setShowTrustPopover] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setNotifPermission(Notification.permission);
      }
      // Verifica silenciosamente se /avatar-sidao.png existe antes de exibir para nunca quebrar ícone
      const img = new window.Image();
      img.onload = () => setAvatarLoaded(true);
      img.onerror = () => setAvatarLoaded(false);
      img.src = "/avatar-sidao.png";
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 w-full bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800/90 z-50 shadow-lg shadow-black/40">
        {/* Linha 1: Marca + Busca (Desktop) + Ações Rápidas */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Selo Oficial (Sem truncamento feio no mobile!) */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-0.5 bg-gradient-to-tr from-[#FFE600] via-[#FF9900] to-[#EE4D2D] shadow-md shadow-yellow-500/15">
                {avatarLoaded ? (
                  <img
                    src="/avatar-sidao.png"
                    alt="Sidão Dicas"
                    className="w-full h-full rounded-[10px] object-cover bg-slate-950"
                  />
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-[#FFE600]">
                    <Zap size={20} fill="currentColor" />
                  </div>
                )}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0b1120] rounded-full"
                title="Radar Online"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                  Sidão <span className="text-[#FFE600]">Dicas</span>
                </span>
                <BadgeCheck
                  size={15}
                  className="text-emerald-400 shrink-0"
                  title="Curadoria Oficial Verificada"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 leading-tight mt-0.5">
                Radar Oficial de Ofertas
              </span>
            </div>
          </a>

          {/* Barra de Busca Integrada (Estilo Mercado Livre / Amazon / Shopee - Visível no Desktop na mesma linha) */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl relative">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar em Amazon, Mercado Livre e Shopee..."
                aria-label="Buscar ofertas"
                className="w-full bg-slate-900/95 border border-slate-700/90 focus:border-[#FFE600] focus:outline-none text-sm text-white placeholder-slate-400 pl-10 pr-8 py-2 rounded-xl transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Limpar busca"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}

          {/* Botões de Ação Compactos */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão Rápido de Cupons */}
            {onToggleCoupons && (
              <button
                type="button"
                onClick={onToggleCoupons}
                className={`text-xs font-extrabold py-2 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  isCouponsOpen
                    ? "bg-[#FFE600] text-slate-950 border-[#FFE600]"
                    : "bg-slate-900 hover:bg-slate-800 text-[#FFE600] border-yellow-400/35"
                }`}
                title="Ver Cupons de Desconto Ativos"
              >
                <Ticket size={15} />
                <span className="hidden sm:inline">Cupons</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isCouponsOpen
                      ? "bg-slate-950 text-[#FFE600]"
                      : "bg-[#FFE600] text-slate-950"
                  }`}
                >
                  {cuponsCount}
                </span>
              </button>
            )}

            {/* Botão Alertas (Sem ícone duplicado!) */}
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/90 hover:border-yellow-400/50 text-xs font-bold py-2 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              aria-label="Ativar Alertas de Ofertas"
              title="Ativar Alertas de Ofertas"
            >
              <Bell
                size={16}
                className={
                  notifPermission === "granted"
                    ? "text-emerald-400"
                    : "text-[#FFE600]"
                }
              />
              <span className="hidden sm:inline">Alertas</span>
              {notifPermission !== "granted" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-ping" />
              )}
            </button>

            {/* Botão Grupo VIP WhatsApp */}
            <a
              href="https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1fae54] text-slate-950 text-xs font-black py-2 px-3 sm:px-3.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-green-950/40"
            >
              <MessageCircle size={15} className="fill-slate-950 shrink-0" />
              <span>VIP</span>
              <span className="hidden lg:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Linha 2 (Apenas Mobile): Busca Rápida Estilo App Shopee/Mercado Livre */}
        {onSearchChange && (
          <div className="md:hidden px-3 pb-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar produto, oferta ou cupom..."
                aria-label="Buscar ofertas"
                className="w-full bg-slate-900 border border-slate-700/80 focus:border-[#FFE600] focus:outline-none text-xs text-white placeholder-slate-400 pl-8 pr-8 py-2 rounded-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Micro-Barra Visual Lúdica de Segurança (1 Linha Ultra-Compacta, Zero Textão!) */}
        <div className="bg-slate-950/90 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              <span className="inline-flex items-center gap-1 font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <ShieldCheck size={12} />
                <span>Rota 100% Segura</span>
              </span>

              <span className="text-slate-400 hidden sm:inline">•</span>

              {/* Fluxo visual criativo em vez de parágrafo longo */}
              <div className="inline-flex items-center gap-1 text-slate-300 font-medium">
                <span>Escolha a oferta</span>
                <ArrowRight size={11} className="text-yellow-400 shrink-0" />
                <span>Compre direto na</span>
                <span className="font-black text-[#FF9900]">Amazon</span>,
                <span className="font-black text-[#FFE600]">Meli</span>
                <span>ou</span>
                <span className="font-black text-[#ff6b4a]">Shopee</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTrustPopover((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-yellow-400 shrink-0 cursor-pointer transition-colors"
            >
              <HelpCircle size={12} />
              <span className="underline decoration-dotted">Segurança</span>
            </button>
          </div>

          {/* Mini Popover Visual e Criativo (Só abre se o usuário clicar em "Segurança") */}
          {showTrustPopover && (
            <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 animate-fade-in">
              <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full text-xs">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-yellow-400/15 text-yellow-400 flex items-center justify-center font-black shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-white block">Radar de Preços</strong>
                      <span className="text-slate-400 text-[11px]">
                        Filtramos apenas descontos reais.
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-400/15 text-emerald-400 flex items-center justify-center font-black shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-white block">Zero Dados Aqui</strong>
                      <span className="text-slate-400 text-[11px]">
                        Não somos loja e não pedimos senha/cartão.
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-400/15 text-blue-400 flex items-center justify-center font-black shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-white block">App Oficial</strong>
                      <span className="text-slate-400 text-[11px]">
                        Você finaliza na Amazon, Meli ou Shopee.
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTrustPopover(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 self-end sm:self-center cursor-pointer"
                >
                  Fechar ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onStatusChange={(status) => setNotifPermission(status)}
      />
    </>
  );
}
