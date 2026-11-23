"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellRing, CheckCircle2, ShieldCheck, Sparkles, X, AlertCircle } from "lucide-react";

/**
 * ============================================================================
 * INTEGRAÇÃO FUTURA COM ONESIGNAL (Web Push em Segundo Plano - Windows/Android)
 * ============================================================================
 * Para ativar notificações Web Push mesmo com o navegador fechado via OneSignal:
 *
 * 1. Instale o SDK ou adicione o script no <head> do `src/app/layout.js`:
 *    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
 *
 * 2. Inicialize o OneSignal com o seu `appId` abaixo:
 *    window.OneSignalDeferred = window.OneSignalDeferred || [];
 *    OneSignalDeferred.push(async function(OneSignal) {
 *      await OneSignal.init({
 *        appId: "INSIRA_SEU_ONESIGNAL_APP_ID_AQUI", // <--- TODO: Substituir pelo App ID do OneSignal
 *        safari_web_id: "web.onesignal.auto.xxxx",
 *        notifyButton: { enable: false },
 *        allowLocalhostAsSecureOrigin: true,
 *      });
 *    });
 *
 * 3. Na função `handleEnableNotifications` abaixo, além do `Notification.requestPermission()`,
 *    chame: `await window.OneSignal?.Slidedown?.promptPush();` ou `await window.OneSignal?.Notifications?.requestPermission();`
 * ============================================================================
 */

export default function NotificationModal({ isOpen, onClose, onStatusChange }) {
  const [permission, setPermission] = useState("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([
    "Cupons Relâmpago",
    "Menor Preço 30 Dias",
    "Eletrônicos & Games",
  ]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  }, [isOpen]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  const triggerWelcomeNotification = async () => {
    try {
      const title = "🔔 Radar Sidão Dicas Ativado!";
      const options = {
        body: "Você receberá alertas de ofertas verificadas e cupons da Amazon, Mercado Livre e Shopee.",
        icon: "/icon-512.png",
        badge: "/icon-512.png",
      };

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return;
        }
      }
      new Notification(title, options);
    } catch (err) {
      console.warn("Não foi possível disparar a notificação de boas-vindas:", err);
    }
  };

  const handleEnableNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setIsRequesting(true);
    try {
      // TODO: Futuro OneSignal Web Push Integration
      // const ONESIGNAL_APP_ID = "INSIRA_SEU_ONESIGNAL_APP_ID_AQUI";
      // if (window.OneSignal) { await window.OneSignal.Notifications.requestPermission(); }

      const result = await Notification.requestPermission();
      setPermission(result);
      if (onStatusChange) onStatusChange(result);

      if (result === "granted") {
        localStorage.setItem(
          "sidao_notification_prefs",
          JSON.stringify({
            enabled: true,
            categories: selectedCategories,
            updatedAt: new Date().toISOString(),
          })
        );
        await triggerWelcomeNotification();
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-notification-title"
    >
      <div className="bg-[#121820] border border-[#e7d7bf]/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#d89643]/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b95a3] hover:text-[#f2ede4] p-1.5 rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Fechar modal de notificações"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho do Modal */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d89643]/15 border border-[#d89643]/30 flex items-center justify-center text-[#e5ad5e] shrink-0">
            <BellRing size={24} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#e5ad5e] bg-[#d89643]/10 px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles size={11} /> Curadoria em Tempo Real
            </span>
            <h3 id="modal-notification-title" className="text-lg font-bold text-[#f2ede4] leading-tight">
              Ativar Alertas de Ofertas
            </h3>
          </div>
        </div>

        <p className="text-[#929ca8] text-sm leading-relaxed mb-5">
          Receba um aviso discreto quando encontrarmos{" "}
          <strong className="text-[#f2ede4]">cupons ativos</strong> ou{" "}
          <strong className="text-[#e5ad5e]">quedas reais de preço</strong> nas lojas oficiais.
        </p>

        {/* Seleção de Interesses */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8b95a3] mb-2.5">
            O que você quer acompanhar?
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Cupons Relâmpago",
              "Menor Preço 30 Dias",
              "Eletrônicos & Games",
              "Casa & Cozinha",
            ].map((category) => {
              const active = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-[#d89643]/15 border-[#d89643]/60 text-[#e5ad5e]"
                      : "bg-white/[0.03] border-white/[0.08] text-[#8b95a3] hover:text-[#f2ede4]"
                  }`}
                >
                  <span>{active ? "✓" : "+"}</span>
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado da Permissão */}
        {permission === "granted" ? (
          <div className="bg-[#132922]/70 border border-[#2f9e75]/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <CheckCircle2 className="text-[#5ed3a2] shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-[#c7eedf] leading-relaxed">
              <strong className="block text-sm text-[#5ed3a2] mb-0.5">
                Alertas ativos neste dispositivo
              </strong>
              Suas preferências estão salvas. Você pode enviar um teste abaixo.
            </div>
          </div>
        ) : permission === "denied" ? (
          <div className="bg-[#2a2013]/70 border border-[#d89643]/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertCircle className="text-[#e5ad5e] shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-[#f2dec0] leading-relaxed">
              <strong className="block text-sm text-[#e5ad5e] mb-0.5">
                Notificações bloqueadas no navegador
              </strong>
              Clique no ícone de cadeado ao lado do endereço do site e altere{" "}
              <strong>Notificações</strong> para <strong>Permitir</strong>.
            </div>
          </div>
        ) : permission === "unsupported" ? (
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-5 text-xs text-[#929ca8]">
            Seu navegador atual não suporta notificações Web nativas. Entre no nosso{" "}
            <strong className="text-[#5ed3a2]">Grupo VIP do WhatsApp</strong> para receber as ofertas.
          </div>
        ) : null}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {permission === "granted" ? (
            <button
              type="button"
              onClick={triggerWelcomeNotification}
              className="flex-1 bg-[#d89643] hover:bg-[#e5ad5e] text-[#0b0f14] font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Bell size={17} />
              <span>Enviar Alerta de Teste</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isRequesting || permission === "unsupported"}
              className="flex-1 bg-[#d89643] hover:bg-[#e5ad5e] disabled:opacity-50 text-[#0b0f14] font-bold py-3 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <BellRing size={17} />
              <span>{isRequesting ? "Ativando..." : "Ativar Alertas"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-white/[0.05] hover:bg-white/[0.1] text-[#929ca8] hover:text-[#f2ede4] font-semibold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {/* Garantia Anti-Spam */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-[#8b95a3]">
          <ShieldCheck size={14} className="text-[#5ed3a2] shrink-0" />
          <span>Zero spam. Apenas ofertas reais selecionadas pelo Sidão.</span>
        </div>
      </div>
    </div>
  );
}
