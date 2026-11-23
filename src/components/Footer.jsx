import React from "react";
import {
  BadgeCheck,
  ExternalLink,
  Info,
  Lock,
  ShieldCheck,
  Zap,
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "WhatsApp VIP",
    href: "https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS",
    colorClass: "hover:border-emerald-500/60 hover:text-emerald-400",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/sidaodicas",
    colorClass: "hover:border-pink-500/60 hover:text-pink-400",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@sidaodicas",
    colorClass: "hover:border-cyan-400/60 hover:text-cyan-300",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@sidaodicas",
    colorClass: "hover:border-red-500/60 hover:text-red-400",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/sidaodicas",
    colorClass: "hover:border-blue-500/60 hover:text-blue-400",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#060910] border-t border-white/[0.06] text-slate-400 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Linha Principal: Identidade + Redes Sociais */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-800/70">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#FFE600] text-slate-950 flex items-center justify-center font-black">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                Sidão Dicas <span className="text-[#FFE600]">&amp; Ofertas</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <BadgeCheck size={11} /> Curadoria Verificada
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitoramento diário de promoções e cupons com redirecionamento direto para Amazon, Mercado Livre e Shopee.
            </p>
          </div>

          <nav aria-label="Redes Sociais do Sidão Dicas" className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition-all ${social.colorClass}`}
              >
                <span>{social.name}</span>
                <ExternalLink size={11} />
              </a>
            ))}
          </nav>
        </div>

        {/* Informações Resumidas de Segurança, Afiliados e Estoque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-slate-800/70 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200">Segurança &amp; Afiliados:</strong> O Sidão Dicas não é uma loja e nunca solicita dados bancários. Participamos dos programas oficiais{" "}
              <strong className="text-slate-300">Amazon Associados</strong>,{" "}
              <strong className="text-slate-300">Mercado Livre Afiliados</strong> e{" "}
              <strong className="text-slate-300">Shopee</strong>, redirecionando você sempre para o site ou app oficial.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-[#FFE600] shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200">Preços &amp; Estoque:</strong> As ofertas e cupons são verificados em tempo real, mas os valores e estoques podem sofrer alterações a qualquer momento conforme as regras de cada loja parceira.
            </p>
          </div>
        </div>

        {/* Direitos */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© {currentYear} Sidão Dicas &amp; Ofertas. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1 text-slate-400">
            <Lock size={12} className="text-emerald-400" />
            <span>Redirecionamento 100% Oficial • Amazon • Mercado Livre • Shopee</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
