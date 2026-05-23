"use client";

import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Esconde a barra de rolagem do body enquanto o splash estiver ativo
    document.body.style.overflow = 'hidden';

    // A tela de splash fica visível por 2 segundos e depois começa a sumir
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Remove do DOM após a animação de fade out (500ms)
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = ''; // Restaura o scroll nativo
      }, 500);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = ''; // Garante limpeza caso o componente desmonte
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Efeito de brilho no fundo */}
        <div className="absolute -inset-4 bg-yellow-400/20 blur-3xl rounded-full animate-pulse w-32 h-32"></div>
        
        {/* Ícone Animado */}
        <div className="bg-yellow-400 text-black p-4 rounded-full shadow-[0_0_40px_rgba(255,234,0,0.4)] animate-bounce mb-6">
          <Zap size={48} fill="currentColor" />
        </div>
        
        {/* Texto com fade e deslize */}
        <h1 className="text-4xl font-black text-white tracking-tight animate-pulse flex items-center gap-2">
          Sidão <span className="text-yellow-400">Dicas</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium tracking-widest text-sm uppercase">
          Carregando ofertas...
        </p>
      </div>
    </div>
  );
}
