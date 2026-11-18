"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
const INSTALLED_KEY = "sidao_pwa_installed";
const DISMISSED_AT_KEY = "sidao_pwa_dismissed_at";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Verificação rigorosa se o PWA já está instalado ou rodando em modo Standalone
    const checkIsInstalledOrStandalone = () => {
      const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = window.navigator.standalone === true;
      const isAndroidTwa = document.referrer.includes("android-app://");
      const isSavedAsInstalled = localStorage.getItem(INSTALLED_KEY) === "true";

      if (isDisplayStandalone || isIOSStandalone || isAndroidTwa) {
        localStorage.setItem(INSTALLED_KEY, "true");
        return true;
      }

      return isSavedAsInstalled;
    };

    // Verifica se o usuário fechou o aviso ("Agora não") nos últimos 3 dias
    const checkIsRecentlyDismissed = () => {
      const dismissedAt = localStorage.getItem(DISMISSED_AT_KEY);
      if (!dismissedAt) return false;
      const elapsed = Date.now() - Number(dismissedAt);
      return !Number.isNaN(elapsed) && elapsed < THREE_DAYS_IN_MS;
    };

    // Se já estiver instalado ou dentro da janela de 3 dias de silêncio, oculta completamente
    if (checkIsInstalledOrStandalone() || checkIsRecentlyDismissed()) {
      setIsVisible(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();

      // Revalida no momento do disparo do evento
      if (checkIsInstalledOrStandalone() || checkIsRecentlyDismissed()) {
        setIsVisible(false);
        return;
      }

      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);

    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "true");
      setIsVisible(false);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSED_AT_KEY, Date.now().toString());
    } catch (err) {
      console.warn("Não foi possível salvar preferência do PWA:", err);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 z-50">
      <div className="bg-slate-900/95 border border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl mx-auto backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
            <Smartphone size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm sm:text-base">
              Instale o App Sidão Dicas &amp; Ofertas
            </span>
            <span className="text-slate-400 text-xs sm:text-sm">
              Acesso rápido ao radar de preços e cupons direto na sua tela inicial.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Agora não
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-[#facc15] hover:bg-yellow-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-transform cursor-pointer shadow-md shadow-yellow-400/10"
          >
            <Download size={16} />
            <span>Instalar App</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fechar aviso de instalação"
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
