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
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-notification-title"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow decorativo superior */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Fechar modal de notificações"
        >
          <X size={20} />
        </button>

        {/* Cabeçalho do Modal */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
            <BellRing size={26} className="animate-bounce" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles size={12} /> Radar em Tempo Real
            </span>
            <h3 id="modal-notification-title" className="text-xl font-black text-white leading-tight">
              🔔 Ativar Notificações de Ofertas
            </h3>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-5">
          Seja avisado no celular ou computador assim que nossa curadoria encontrar{" "}
          <strong className="text-white">cupons ativos</strong> ou{" "}
          <strong className="text-yellow-400">quedas históricas de preço</strong> nas lojas oficiais.
        </p>

        {/* Seleção de Interesses */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            O que você quer receber?
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
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-yellow-400/15 border-yellow-400 text-yellow-300"
                      : "bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200"
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
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-emerald-200 leading-relaxed">
              <strong className="block text-sm text-emerald-300 mb-0.5">
                Alertas já estão ativos neste dispositivo!
              </strong>
              Suas preferências estão salvas. Você também pode testar o envio de um alerta abaixo.
            </div>
          </div>
        ) : permission === "denied" ? (
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-amber-200 leading-relaxed">
              <strong className="block text-sm text-amber-300 mb-0.5">
                Notificações bloqueadas no navegador
              </strong>
              Clique no ícone de cadeado ao lado do endereço do site na barra do navegador e altere{" "}
              <strong>Notificações</strong> para <strong>Permitir</strong>.
            </div>
          </div>
        ) : permission === "unsupported" ? (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-5 text-xs text-slate-300">
            Seu navegador atual não suporta notificações Web nativas. Recomendamos entrar no nosso{" "}
            <strong className="text-emerald-400">Grupo VIP do WhatsApp</strong> para receber os alertas!
          </div>
        ) : null}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {permission === "granted" ? (
            <button
              type="button"
              onClick={triggerWelcomeNotification}
              className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Bell size={18} />
              <span>Enviar Alerta de Teste</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isRequesting || permission === "unsupported"}
              className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-slate-950 font-black py-3.5 px-5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-400/10"
            >
              <BellRing size={18} />
              <span>{isRequesting ? "Ativando..." : "Ativar Alertas Agora"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl text-sm transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Garantia Anti-Spam */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Zero spam. Apenas ofertas reais verificadas pela nossa equipe.</span>
        </div>
      </div>
    </div>
  );
}
