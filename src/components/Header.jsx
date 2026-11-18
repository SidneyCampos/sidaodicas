"use client";

import React, { useState, useEffect } from "react";
import { BadgeCheck, Bell, MessageCircle, Zap } from "lucide-react";
import NotificationModal from "./NotificationModal";

export default function Header() {
  const [avatarError, setAvatarError] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 w-full bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/90 z-50 shadow-lg shadow-slate-950/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Identidade Visual: Avatar Oficial + Nome + Selo de Curadoria */}
          <a href="#" className="flex items-center gap-3 group min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 shadow-md shadow-yellow-500/20">
                {!avatarError ? (
                  <img
                    src="/avatar-sidao.png"
                    alt="Sidão Dicas & Ofertas"
                    onError={() => setAvatarError(true)}
                    className="w-full h-full rounded-full object-cover bg-slate-900"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-yellow-400 font-black text-base tracking-tighter">
                    <Zap size={22} className="text-yellow-400" fill="currentColor" />
                  </div>
                )}
              </div>
              {/* Indicador Online / Radar Ativo */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"
                title="Radar de Ofertas Online"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight truncate group-hover:text-yellow-400 transition-colors">
                  Sidão Dicas <span className="text-yellow-400">&amp; Ofertas</span>
                </h1>
              </div>

              <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400">
                <BadgeCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">Curadoria Oficial Verificada</span>
              </div>
            </div>
          </a>

          {/* Ações: Botão Alertas + Grupo VIP WhatsApp */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-yellow-400/50 text-xs sm:text-sm font-bold py-2.5 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              aria-label="Ativar Alertas de Ofertas"
            >
              <Bell
                size={17}
                className={
                  notifPermission === "granted"
                    ? "text-emerald-400"
                    : "text-yellow-400"
                }
              />
              <span>🔔 Alertas</span>
              {notifPermission !== "granted" && (
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              )}
            </button>

            <a
              href="https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1fae54] text-slate-950 text-xs sm:text-sm font-black py-2.5 px-3.5 sm:px-5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-950/50"
            >
              <MessageCircle size={18} className="fill-slate-950" />
              <span className="hidden md:inline">Entrar no Grupo VIP (WhatsApp)</span>
              <span className="md:hidden">Grupo VIP</span>
            </a>
          </div>
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
