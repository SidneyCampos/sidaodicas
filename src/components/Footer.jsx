import React from "react";
import {
  BadgeCheck,
  ExternalLink,
  Info,
  Lock,
  ShieldCheck,
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "YouTube",
    href: "https://youtube.com/@SidãoDicasOfertas",
  },
  {
    name: "WhatsApp VIP",
    href: "https://chat.whatsapp.com/C1Ryp7KvesNEgmowEZu2TS",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/sidaodicas",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@sidaodicas",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/sidaodicas",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080b0f] border-t border-[#e7d7bf]/[0.07] text-[#8b95a3] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-9">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-[#e7d7bf]/[0.06]">
          <div className="flex items-center gap-3.5 max-w-md">
            <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8c5a22] via-[#e5ad5e] to-[#d89643] shrink-0">
              <img
                src="/avatar-sidao.png"
                alt="Sidão Dicas Ofertas"
                className="w-full h-full rounded-full object-cover bg-[#121820]"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-base font-bold text-[#f2ede4] tracking-tight">
                  Sidão Dicas{" "}
                  <span className="text-[#e5ad5e] font-semibold">Ofertas</span>
                </span>
                <BadgeCheck size={14} className="text-[#d89643]" />
              </div>
              <p className="text-xs text-[#8b95a3] leading-relaxed">
                Dicas e ofertas dos melhores produtos selecionados pra você na Amazon, Mercado Livre e Shopee.
              </p>
            </div>
          </div>

          <nav
            aria-label="Redes Sociais do Sidão Dicas"
            className="flex flex-wrap gap-2"
          >
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#121820] hover:bg-[#19212c] border border-[#e7d7bf]/[0.08] hover:border-[#d89643]/40 text-[#b4bdc8] hover:text-[#f2ede4] text-xs font-medium px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-all"
              >
                <span>{social.name}</span>
                <ExternalLink size={11} className="text-[#e5ad5e]" />
              </a>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-[#e7d7bf]/[0.06] text-xs leading-relaxed">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-[#5ed3a2] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#d5dce4]">
                Segurança &amp; Afiliados:
              </strong>{" "}
              O Sidão Dicas não é uma loja e nunca solicita dados bancários.
              Participamos dos programas oficiais{" "}
              <strong className="text-[#d5dce4]">Amazon Associados</strong>,{" "}
              <strong className="text-[#d5dce4]">
                Mercado Livre Afiliados
              </strong>{" "}
              e <strong className="text-[#d5dce4]">Shopee</strong>,
              redirecionando você sempre para a loja oficial.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-[#e5ad5e] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#d5dce4]">Preços &amp; Estoque:</strong>{" "}
              As ofertas e cupons são verificados diariamente, porém os valores
              e estoques podem sofrer alterações a qualquer momento conforme a
              disponibilidade de cada loja parceira.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6e7885]">
          <p>
            © {currentYear} Sidão Dicas Ofertas (@SidãoDicasOfertas). Todos os
            direitos reservados.
          </p>
          <p className="inline-flex items-center gap-1 text-[#8b95a3]">
            <Lock size={12} className="text-[#5ed3a2]" />
            <span>
              Redirecionamento 100% Oficial • Amazon • Mercado Livre • Shopee
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
