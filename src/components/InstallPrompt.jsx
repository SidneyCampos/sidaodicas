"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intercepta o evento nativo de instalação
    const handleBeforeInstallPrompt = (e) => {
      // Impede o prompt padrão do Chrome de aparecer imediatamente
      e.preventDefault();
      // Salva o evento para acionarmos depois através do nosso próprio botão
      setDeferredPrompt(e);
      // Exibe a nossa interface personalizada (sempre que o app não estiver instalado)
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Oculta se o usuário instalar o app
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostra o prompt nativo
    deferredPrompt.prompt();
    
    // Aguarda a resposta do usuário (Aceitou ou não)
    const { outcome } = await deferredPrompt.userChoice;
    
    // Independentemente do resultado, não podemos usar esse prompt novamente
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 z-50 animate-slide-up">
      <div className="bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 max-w-5xl mx-auto backdrop-blur-md bg-opacity-95">
        
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm sm:text-base">
            Instale o App Oficial
          </span>
          <span className="text-slate-400 text-xs sm:text-sm">
            Acesso mais rápido e sem travamentos.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleInstallClick}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-black px-4 py-2 rounded-xl text-sm flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Instalar</span>
          </button>
          
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
