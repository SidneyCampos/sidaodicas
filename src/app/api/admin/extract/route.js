import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/adminAuth";

function decodeHtmlEntities(text = "") {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .trim();
}

function detectStoreFromUrl(targetUrl = "") {
  const lower = targetUrl.toLowerCase();
  if (lower.includes("amazon.") || lower.includes("amzn.")) {
    return "Amazon";
  }
  if (lower.includes("mercadolivre.") || lower.includes("meli.")) {
    return "Mercado Livre";
  }
  if (lower.includes("shopee.")) {
    return "Shopee";
  }
  return null;
}

function extractMetaTag(html, propertyNames) {
  for (const prop of propertyNames) {
    const regex1 = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i"
    );
    const match1 = html.match(regex1);
    if (match1 && match1[1]) return decodeHtmlEntities(match1[1]);

    const regex2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${prop}["']`,
      "i"
    );
    const match2 = html.match(regex2);
    if (match2 && match2[1]) return decodeHtmlEntities(match2[1]);
  }
  return "";
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Informe uma URL válida para extrair os dados." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    let html = "";
    let finalUrl = url;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      finalUrl = response.url || url;
      html = await response.text();
    } finally {
      clearTimeout(timeoutId);
    }

    const detectedStore =
      detectStoreFromUrl(finalUrl) || detectStoreFromUrl(url);

    let titulo = extractMetaTag(html, ["og:title", "twitter:title", "name"]);

    if (!titulo) {
      const amazonTitleMatch = html.match(
        /<span[^>]+id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i
      );
      if (amazonTitleMatch && amazonTitleMatch[1]) {
        titulo = decodeHtmlEntities(amazonTitleMatch[1].replace(/\s+/g, " "));
      }
    }

    if (!titulo) {
      const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleTagMatch && titleTagMatch[1]) {
        titulo = decodeHtmlEntities(titleTagMatch[1].replace(/\s+/g, " "));
      }
    }

    if (titulo) {
      titulo = titulo
        .replace(/\s*[:|-]\s*Amazon\.com\.br.*$/i, "")
        .replace(/\s*\|\s*Mercado\s*Livre.*$/i, "")
        .replace(/\s*\|\s*Shopee\s*Brasil.*$/i, "")
        .trim();
    }

    let imagemUrl = extractMetaTag(html, [
      "og:image",
      "og:image:secure_url",
      "twitter:image",
      "image",
    ]);

    if (!imagemUrl) {
      const amazonImgMatch =
        html.match(/data-old-hires=["'](https:\/\/[^"']+)["']/i) ||
        html.match(/"hiRes"\s*:\s*"(https:\/\/[^"]+)"/i) ||
        html.match(/"large"\s*:\s*"(https:\/\/[^"]+)"/i);
      if (amazonImgMatch && amazonImgMatch[1]) {
        imagemUrl = decodeHtmlEntities(amazonImgMatch[1]);
      }
    }

    const rawPrice = extractMetaTag(html, [
      "product:price:amount",
      "og:price:amount",
      "price",
    ]);
    const precoSugerido = rawPrice
      ? Number(rawPrice.replace(",", ".")) || null
      : null;

    return NextResponse.json({
      success: Boolean(titulo || imagemUrl),
      titulo: titulo || "",
      imagemUrl: imagemUrl || "",
      loja: detectedStore,
      precoSugerido,
      finalUrl,
    });
  } catch (error) {
    console.warn("Aviso ao extrair URL:", error);
    return NextResponse.json(
      {
        success: false,
        loja: null,
        titulo: "",
        imagemUrl: "",
        error:
          "A loja bloqueou a leitura automática ou o link demorou para responder. Preencha o título e a foto manualmente.",
      },
      { status: 200 }
    );
  }
}
