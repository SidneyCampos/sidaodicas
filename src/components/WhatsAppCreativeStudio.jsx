"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Download,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { calculateDiscountPercentage } from "./ProductCard";

const CARD_THEMES = [
  {
    id: "rosa",
    label: "🌸 Rosa Viral",
    bgTop: "#FDE2EE",
    bgBottom: "#FBCFE8",
    titleColor: "#18181B",
    oldPriceColor: "#71717A",
    strikeColor: "#DC2626",
    priceLabelColor: "#BE185D",
    priceColor: "#BE185D",
    badgeBg: "#BE185D",
    badgeText: "#FFFFFF",
    footerBg: "#111827",
    footerText: "#FACC15",
  },
  {
    id: "sidao",
    label: "💛 Amarelo Sidão",
    bgTop: "#FEF9C3",
    bgBottom: "#FDE047",
    titleColor: "#0F172A",
    oldPriceColor: "#475569",
    strikeColor: "#DC2626",
    priceLabelColor: "#0F172A",
    priceColor: "#0F172A",
    badgeBg: "#16A34A",
    badgeText: "#FFFFFF",
    footerBg: "#0F172A",
    footerText: "#FACC15",
  },
  {
    id: "shopee",
    label: "🧡 Shopee",
    bgTop: "#FFEDD5",
    bgBottom: "#FED7AA",
    titleColor: "#1C1917",
    oldPriceColor: "#78716C",
    strikeColor: "#DC2626",
    priceLabelColor: "#EA580C",
    priceColor: "#DC2626",
    badgeBg: "#EE4D2D",
    badgeText: "#FFFFFF",
    footerBg: "#18181B",
    footerText: "#FACC15",
  },
  {
    id: "dark",
    label: "🌙 Dark Premium",
    bgTop: "#0F172A",
    bgBottom: "#1E293B",
    titleColor: "#F8FAFC",
    oldPriceColor: "#94A3B8",
    strikeColor: "#EF4444",
    priceLabelColor: "#FACC15",
    priceColor: "#FACC15",
    badgeBg: "#16A34A",
    badgeText: "#FFFFFF",
    footerBg: "#020617",
    footerText: "#FACC15",
  },
];

export function formatBRLPrice(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function buildViralWhatsAppCopy(offer = {}) {
  const titulo = (offer.titulo || "Produto em Oferta").trim();
  const subtitulo = (offer.subtitulo || "").trim();
  const loja = offer.loja || "Loja Oficial";
  const precoAntigo = Number(offer.precoAntigo) || 0;
  const precoAtual = Number(offer.precoAtual) || 0;
  const desconto = calculateDiscountPercentage(
    precoAntigo,
    precoAtual,
    offer.descontoPercentual
  );
  const economia = precoAntigo > precoAtual ? precoAntigo - precoAtual : 0;
  const nota = (offer.nota || "").trim();
  const vendidos = (offer.vendidos || "").trim();
  const cupom = (offer.cupomOpcional || "").trim().toUpperCase();
  const link = (offer.linkAfiliado || "").trim();

  let headline = `🔥 *${(
    offer.destaqueTag || "OFERTA VERIFICADA"
  ).toUpperCase()} NA ${loja.toUpperCase()}* 😱`;
  if (vendidos) {
    const cleanSold = vendidos
      .replace(/vendidos/i, "")
      .replace(/compras/i, "")
      .trim()
      .toUpperCase();
    headline = `🔥 *${cleanSold} JÁ COMPRARAM* 😱`;
  }

  const lines = [
    headline,
    `👇 *TOCA AQUI E GARANTE O SEU* 👇`,
    link || "[Cole o link de afiliado]",
    ``,
    `🛍️ *${titulo}*`,
  ];

  if (subtitulo) {
    lines.push(`✨ ${subtitulo}`);
  }

  lines.push(``);

  if (precoAntigo > precoAtual && precoAtual > 0) {
    lines.push(`😱 Era ~${formatBRLPrice(precoAntigo)}~`);
    lines.push(
      `🥳 *AGORA: ${formatBRLPrice(precoAtual)}*${
        desconto > 0 ? ` (-${desconto}% OFF)` : ""
      }`
    );
    lines.push(`💸 Economia de ${formatBRLPrice(economia)}`);
  } else if (precoAtual > 0) {
    lines.push(`🥳 *AGORA: ${formatBRLPrice(precoAtual)}*`);
  }

  if (cupom) {
    lines.push(`🎟️ Use o cupom: *${cupom}*`);
  }

  lines.push(``);

  if (nota) {
    lines.push(`⭐ ${nota} de nota`);
  }

  lines.push(`⏳ *Estoque limitado* — esse preço some sem aviso!`);
  lines.push(`💌 Encaminha pra quem precisa ver isso 💛`);

  return lines.join("\n");
}

export function buildInstagramCaption(offer = {}) {
  const titulo = (offer.titulo || "Produto em Oferta").trim();
  const subtitulo = (offer.subtitulo || "").trim();
  const loja = offer.loja || "Loja Oficial";
  const categoria = offer.categoria || "Mais Vendidos";
  const precoAntigo = Number(offer.precoAntigo) || 0;
  const precoAtual = Number(offer.precoAtual) || 0;
  const desconto = calculateDiscountPercentage(
    precoAntigo,
    precoAtual,
    offer.descontoPercentual
  );
  const economia = precoAntigo > precoAtual ? precoAntigo - precoAtual : 0;
  const nota = (offer.nota || "").trim();
  const vendidos = (offer.vendidos || "").trim();
  const cupom = (offer.cupomOpcional || "").trim().toUpperCase();

  const storeHashtag =
    loja === "Amazon"
      ? "#amazonbrasil #achadosamazon"
      : loja === "Mercado Livre"
      ? "#mercadolivre #achadosmercadolivre"
      : "#shopee #achadinhosshopee #shopeebrasil";

  const catHashtag =
    categoria === "Games"
      ? "#games #gamer #setupgamer"
      : categoria === "Eletrônicos"
      ? "#eletronicos #tecnologia #tech"
      : categoria === "Casa"
      ? "#casa #utilidadesdomesticas #dicasdecasa"
      : "#maisvendidos #imperdivel";

  const lines = [
    `🚨 ACHADO DO DIA ${
      desconto > 0 ? `COM ${desconto}% OFF ` : ""
    }NA ${loja.toUpperCase()}! 🔥`,
    ``,
    `✨ ${titulo}`,
  ];

  if (subtitulo) {
    lines.push(`💡 ${subtitulo}`);
  }

  lines.push(``);

  if (precoAntigo > precoAtual && precoAtual > 0) {
    lines.push(`❌ De ${formatBRLPrice(precoAntigo)}`);
    lines.push(`✅ Por apenas ${formatBRLPrice(precoAtual)}!`);
    lines.push(`💸 Você economiza ${formatBRLPrice(economia)} hoje!`);
  } else if (precoAtual > 0) {
    lines.push(`✅ Por apenas ${formatBRLPrice(precoAtual)}!`);
  }

  if (cupom) {
    lines.push(`🎟️ Aplique o cupom: ${cupom}`);
  }

  if (vendidos || nota) {
    const proof = [
      vendidos ? `🔥 ${vendidos}` : null,
      nota ? `⭐ Nota ${nota} de 5` : null,
    ]
      .filter(Boolean)
      .join("  •  ");
    lines.push(``);
    lines.push(proof);
  }

  lines.push(
    ``,
    `👇 COMO GARANTIR ESSA OFERTA:`,
    `💬 Comente "QUERO" que te envio o link no Direct, ou acesse direto pelo LINK NA BIO / STORIES!`,
    ``,
    `⚠️ Atenção: os preços e estoques podem mudar a qualquer momento na loja oficial.`,
    `📌 Salve este post para não perder e marque alguém que precisa ver isso! 💛`,
    ``,
    `#sidaodicas #promocao #ofertasdodia #achadinhos #desconto ${storeHashtag} ${catHashtag}`
  );

  return lines.join("\n");
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapTextLines(ctx, text, maxWidth, maxLines = 2) {
  const words = String(text || "").trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    const usedWords = lines.join(" ").split(/\s+/).length;
    if (usedWords < words.length) {
      while (
        ctx.measureText(last + "...").width > maxWidth &&
        last.length > 3
      ) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = last.trim() + "...";
    }
  }

  return lines;
}

export default function WhatsAppCreativeStudio({ offer }) {
  const canvasRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState("rosa");
  const [textTab, setTextTab] = useState("whatsapp");

  const [customWaCopy, setCustomWaCopy] = useState("");
  const [isWaEdited, setIsWaEdited] = useState(false);

  const [customIgCopy, setCustomIgCopy] = useState("");
  const [isIgEdited, setIsIgEdited] = useState(false);

  const [copiedMode, setCopiedMode] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isRenderingCanvas, setIsRenderingCanvas] = useState(false);

  const generatedWaCopy = buildViralWhatsAppCopy(offer);
  const generatedIgCopy = buildInstagramCaption(offer);

  useEffect(() => {
    if (!isWaEdited) setCustomWaCopy(generatedWaCopy);
  }, [generatedWaCopy, isWaEdited]);

  useEffect(() => {
    if (!isIgEdited) setCustomIgCopy(generatedIgCopy);
  }, [generatedIgCopy, isIgEdited]);

  useEffect(() => {
    setIsWaEdited(false);
    setIsIgEdited(false);
    setCustomWaCopy(buildViralWhatsAppCopy(offer));
    setCustomIgCopy(buildInstagramCaption(offer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer.linkAfiliado, offer.id]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme =
      CARD_THEMES.find((t) => t.id === selectedTheme) || CARD_THEMES[0];

    const renderCard = async () => {
      setIsRenderingCanvas(true);
      setImageLoadError(false);

      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, theme.bgTop);
      grad.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const cardX = 86;
      const cardY = 52;
      const cardW = W - cardX * 2;
      const cardH = 515;

      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 14;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 38);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      if (offer.imagemUrl) {
        try {
          const proxiedUrl = `/api/admin/image-proxy?url=${encodeURIComponent(
            offer.imagemUrl
          )}`;
          const img = await new Promise((resolve, reject) => {
            const el = new window.Image();
            el.crossOrigin = "anonymous";
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Falha ao carregar foto"));
            el.src = proxiedUrl;
          });

          if (cancelled) return;

          const pad = 34;
          const maxW = cardW - pad * 2;
          const maxH = cardH - pad * 2;
          const scale = Math.min(maxW / img.width, maxH / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = cardX + (cardW - drawW) / 2;
          const drawY = cardY + (cardH - drawH) / 2;

          ctx.save();
          drawRoundedRect(ctx, cardX + 8, cardY + 8, cardW - 16, cardH - 16, 32);
          ctx.clip();
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        } catch {
          if (!cancelled) setImageLoadError(true);
          ctx.fillStyle = "#94A3B8";
          ctx.font = "700 30px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            "Foto não carregou — verifique a URL da imagem",
            W / 2,
            cardY + cardH / 2
          );
        }
      } else {
        ctx.fillStyle = "#94A3B8";
        ctx.font = "700 32px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Cole um link ou URL da foto do produto",
          W / 2,
          cardY + cardH / 2
        );
      }

      if (cancelled) return;

      const precoAntigo = Number(offer.precoAntigo) || 0;
      const precoAtual = Number(offer.precoAtual) || 0;
      const desconto = calculateDiscountPercentage(
        precoAntigo,
        precoAtual,
        offer.descontoPercentual
      );

      const storeLabel = (offer.loja || "OFERTA").toUpperCase();
      ctx.font = "900 24px system-ui, -apple-system, sans-serif";
      const storeTextW = ctx.measureText(storeLabel).width;
      const storePillW = storeTextW + 44;
      const storePillBg =
        offer.loja === "Amazon"
          ? "#FF9900"
          : offer.loja === "Mercado Livre"
          ? "#FFE600"
          : offer.loja === "Shopee"
          ? "#EE4D2D"
          : "#111827";
      const storePillColor =
        offer.loja === "Shopee" ? "#FFFFFF" : "#0F172A";

      drawRoundedRect(ctx, cardX + 24, cardY + 24, storePillW, 46, 14);
      ctx.fillStyle = storePillBg;
      ctx.fill();
      ctx.fillStyle = storePillColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(storeLabel, cardX + 24 + storePillW / 2, cardY + 48);

      if (desconto > 0) {
        const offText = `-${desconto}% OFF`;
        ctx.font = "900 28px system-ui, -apple-system, sans-serif";
        const offW = ctx.measureText(offText).width + 44;
        drawRoundedRect(ctx, cardX + cardW - offW - 24, cardY + 24, offW, 50, 14);
        ctx.fillStyle = theme.badgeBg;
        ctx.fill();
        ctx.fillStyle = theme.badgeText;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(offText, cardX + cardW - offW / 2 - 24, cardY + 50);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = theme.titleColor;
      ctx.font = "800 40px system-ui, -apple-system, sans-serif";

      const titleLines = wrapTextLines(
        ctx,
        offer.titulo || "Título do Produto em Oferta",
        W - 120,
        2
      );
      let cursorY = 632;
      for (const line of titleLines) {
        ctx.fillText(line, W / 2, cursorY);
        cursorY += 50;
      }

      if (precoAntigo > precoAtual && precoAtual > 0) {
        const deText = "de ";
        const oldValText = formatBRLPrice(precoAntigo);
        ctx.font = "700 36px system-ui, -apple-system, sans-serif";
        const deW = ctx.measureText(deText).width;
        const valW = ctx.measureText(oldValText).width;
        const totalW = deW + valW;
        const startX = (W - totalW) / 2;
        const oldY = cursorY + 18;

        ctx.textAlign = "left";
        ctx.fillStyle = theme.oldPriceColor;
        ctx.fillText(deText, startX, oldY);
        ctx.fillText(oldValText, startX + deW, oldY);

        ctx.strokeStyle = theme.strikeColor;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(startX + deW - 6, oldY - 12);
        ctx.lineTo(startX + deW + valW + 6, oldY - 12);
        ctx.stroke();

        cursorY = oldY + 14;
      } else {
        cursorY += 20;
      }

      const porText = "por ";
      const currentValText =
        precoAtual > 0 ? formatBRLPrice(precoAtual) : "R$ --,--";

      ctx.font = "800 44px system-ui, -apple-system, sans-serif";
      const porW = ctx.measureText(porText).width;

      ctx.font = "900 104px system-ui, -apple-system, sans-serif";
      const curW = ctx.measureText(currentValText).width;

      const priceStartX = (W - (porW + curW)) / 2;
      const priceY = Math.min(cursorY + 98, 902);

      ctx.textAlign = "left";
      ctx.font = "800 44px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = theme.priceLabelColor;
      ctx.fillText(porText, priceStartX, priceY - 8);

      ctx.font = "900 104px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = theme.priceColor;
      ctx.fillText(currentValText, priceStartX + porW, priceY);

      if (offer.cupomOpcional) {
        const cupomLabel = `🎟️ CUPOM: ${offer.cupomOpcional.toUpperCase()}`;
        ctx.font = "900 26px monospace";
        const cw = ctx.measureText(cupomLabel).width + 44;
        drawRoundedRect(ctx, (W - cw) / 2, priceY + 20, cw, 44, 12);
        ctx.fillStyle = "#111827";
        ctx.fill();
        ctx.fillStyle = "#FACC15";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cupomLabel, W / 2, priceY + 42);
      }

      const footerH = 92;
      const footerY = H - footerH;
      ctx.fillStyle = theme.footerBg;
      ctx.fillRect(0, footerY, W, footerH);

      const footerParts = [];
      if (offer.vendidos) footerParts.push(offer.vendidos);
      else footerParts.push("oferta verificada");

      if (offer.nota) footerParts.push(`nota ${offer.nota} de 5`);
      else footerParts.push(`oficial ${offer.loja || "Sidão Dicas"}`);

      footerParts.push("estoque limitado");

      const footerLine = footerParts.join("  •  ");
      ctx.fillStyle = theme.footerText;
      ctx.font = "800 32px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(footerLine, W / 2, footerY + footerH / 2);

      if (!cancelled) setIsRenderingCanvas(false);
    };

    renderCard();
    return () => {
      cancelled = true;
    };
  }, [
    offer.titulo,
    offer.precoAntigo,
    offer.precoAtual,
    offer.descontoPercentual,
    offer.imagemUrl,
    offer.loja,
    offer.nota,
    offer.vendidos,
    offer.cupomOpcional,
    selectedTheme,
  ]);

  const handleCopyText = async (mode) => {
    const textToCopy = mode === "ig" ? customIgCopy : customWaCopy;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 3000);
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const slug = (offer.titulo || "oferta-sidao")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32);
    link.download = `sidao-dicas-${slug}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedMode("img");
        setTimeout(() => setCopiedMode(null), 3000);
      } else {
        handleDownloadImage();
      }
    } catch {
      handleDownloadImage();
    }
  };

  return (
    <div className="bg-slate-950/95 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#FFE600]" />
            <span>Kit Pronto: Arte PNG + Texto WhatsApp &amp; Instagram</span>
          </h3>
          <p className="text-xs text-slate-400">
            Copie a imagem e as legendas prontas para postar no WhatsApp, Reels, Feed ou Stories!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CARD_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedTheme === theme.id
                  ? "bg-[#FFE600] text-slate-950 border-[#FFE600]"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="flex flex-col gap-3">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full max-w-[400px] aspect-square rounded-xl shadow-xl"
            />
            {isRenderingCanvas && (
              <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center rounded-2xl">
                <RefreshCw size={24} className="animate-spin text-[#FFE600]" />
              </div>
            )}
          </div>

          {imageLoadError && (
            <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-400" />
              <span>
                A foto não pôde ser desenhada na arte. Verifique se a URL da Imagem é válida.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyImage}
              className={`font-black text-xs sm:text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                copiedMode === "img"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-[#FFE600] hover:bg-yellow-300 text-slate-950 shadow-md"
              }`}
            >
              {copiedMode === "img" ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>✅ Imagem Copiada!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>📋 Copiar Imagem</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs sm:text-sm py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download size={16} />
              <span>⬇️ Baixar PNG</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTextTab("whatsapp")}
              className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                textTab === "whatsapp"
                  ? "bg-[#25D366] text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageCircle size={15} />
              <span>📲 Texto WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setTextTab("instagram")}
              className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                textTab === "instagram"
                  ? "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera size={15} />
              <span>📸 Legenda Instagram</span>
            </button>
          </div>

          {textTab === "whatsapp" ? (
            <>
              <div className="bg-[#0b141a] border border-emerald-900/50 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    Formatado para Grupo VIP / WhatsApp
                  </span>
                  {isWaEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsWaEdited(false);
                        setCustomWaCopy(generatedWaCopy);
                      }}
                      className="text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer"
                    >
                      ↺ Restaurar
                    </button>
                  )}
                </div>

                <textarea
                  rows={12}
                  value={customWaCopy}
                  onChange={(e) => {
                    setIsWaEdited(true);
                    setCustomWaCopy(e.target.value);
                  }}
                  className="w-full bg-[#111b21] border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-3 text-xs sm:text-sm text-slate-100 leading-relaxed resize-y"
                />
              </div>

              <button
                type="button"
                onClick={() => handleCopyText("wa")}
                className={`w-full font-black text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  copiedMode === "wa"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-[#25D366] hover:bg-[#1fae54] text-slate-950 shadow-lg"
                }`}
              >
                {copiedMode === "wa" ? (
                  <>
                    <Check size={17} strokeWidth={3} />
                    <span>✅ Texto WhatsApp Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={17} />
                    <span>📲 Copiar Texto WhatsApp</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-pink-400">
                    Legenda Pronta para Feed / Reels / Stories
                  </span>
                  {isIgEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsIgEdited(false);
                        setCustomIgCopy(generatedIgCopy);
                      }}
                      className="text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer"
                    >
                      ↺ Restaurar
                    </button>
                  )}
                </div>

                <textarea
                  rows={12}
                  value={customIgCopy}
                  onChange={(e) => {
                    setIsIgEdited(true);
                    setCustomIgCopy(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 focus:outline-none rounded-xl p-3 text-xs sm:text-sm text-slate-100 leading-relaxed resize-y"
                />
              </div>

              <button
                type="button"
                onClick={() => handleCopyText("ig")}
                className={`w-full font-black text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                  copiedMode === "ig"
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:brightness-110 text-white shadow-lg"
                }`}
              >
                {copiedMode === "ig" ? (
                  <>
                    <Check size={17} strokeWidth={3} />
                    <span>✅ Legenda Instagram Copiada!</span>
                  </>
                ) : (
                  <>
                    <Camera size={17} />
                    <span>📸 Copiar Legenda Instagram</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
