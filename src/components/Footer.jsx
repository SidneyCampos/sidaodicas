import React from "react";
import {
  BadgeCheck,
  ExternalLink,
  Info,
  Lock,
  MessageCircle,
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
    <footer className="bg-slate-950 border-t border-slate-800/90 text-slate-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Topo do Rodapé: Marca + Redes Sociais */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Sidão Dicas <span className="text-yellow-400">&amp; Ofertas</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <BadgeCheck size={12} /> Verificado
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Portal independente de curadoria de promoções, cupons de desconto e monitoramento de preços nas maiores lojas oficiais do Brasil.
            </p>
          </div>

          {/* Redes Sociais */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Acompanhe o Sidão Dicas nas Redes
            </p>
            <nav aria-label="Redes Sociais do Sidão Dicas" className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all ${social.colorClass}`}
                >
                  <span>{social.name}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Avisos Legais: Programas de Afiliados & Variação de Preços/Estoque */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-b border-slate-800/80 text-xs leading-relaxed">
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5">
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2 mb-2">
              <ShieldCheck size={17} className="text-yellow-400 shrink-0" />
              <span>Transparência e Programas de Afiliados</span>
            </h3>
            <p className="text-slate-400">
              O <strong className="text-slate-200">Sidão Dicas &amp; Ofertas</strong> participa de programas oficiais de publicidade de afiliados, incluindo o{" "}
              <strong className="text-slate-200">Programa de Associados da Amazon</strong>,{" "}
              <strong className="text-slate-200">Programa de Afiliados do Mercado Livre</strong> e{" "}
              <strong className="text-slate-200">Programa de Afiliados Shopee</strong>. Ao clicar nos links e realizar uma compra nas lojas parceiras, podemos receber uma pequena comissão sem nenhum custo adicional para você.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5">
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2 mb-2">
              <Info size={17} className="text-yellow-400 shrink-0" />
              <span>Aviso sobre Preços, Cupons e Estoque</span>
            </h3>
            <p className="text-slate-400">
              Não somos uma loja virtual e não realizamos vendas diretas. Todas as ofertas publicadas passam por verificação, porém{" "}
              <strong className="text-slate-200">
                os preços, condições de parcelamento, frete e validade dos cupons podem sofrer alterações a qualquer momento
              </strong>{" "}
              conforme a disponibilidade de estoque de cada loja oficial (Amazon, Mercado Livre ou Shopee).
            </p>
          </div>
        </div>

        {/* Rodapé Inferior: Direitos e Segurança */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} <strong className="text-slate-300">Sidão Dicas &amp; Ofertas</strong>. Todos os direitos reservados.
          </p>
          <p className="inline-flex items-center gap-1.5 text-slate-400">
            <Lock size={13} className="text-emerald-400" />
            <span>Navegação segura • Redirecionamento exclusivo para lojas oficiais</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
