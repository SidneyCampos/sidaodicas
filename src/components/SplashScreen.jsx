"use client";

import React, { useEffect, useState } from "react";

/**
 * SplashScreen exibido APENAS quando o usuário abre o App instalado (PWA Standalone).
 * No navegador comum (acesso vindo de Google, Instagram, YouTube), o site abre
 * instantaneamente (0ms de bloqueio), maximizando LCP e nota no PageSpeed/SEO.
 */
export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (!isStandalone) return;

    setShow(true);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = "";
      }, 280);
    }, 450);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0f14] transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-8 bg-[#d89643]/15 blur-3xl rounded-full w-40 h-40 pointer-events-none" />

        <div className="relative w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#a86f28] via-[#e5ad5e] to-[#d89643] shadow-2xl mb-4">
          <img
            src="/avatar-sidao.png"
            alt=""
            width={80}
            height={80}
            className="w-full h-full rounded-full object-cover bg-[#121820]"
          />
        </div>

        <p className="text-2xl font-bold text-[#f2ede4] tracking-tight">
          Sidão Dicas <span className="text-[#e5ad5e] font-semibold">Ofertas</span>
        </p>
        <p className="text-[#929ca8] mt-1.5 text-xs tracking-widest uppercase">
          Curadoria selecionada
        </p>
      </div>
    </div>
  );
}
