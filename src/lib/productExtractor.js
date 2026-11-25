const UA_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const UA_WHATSAPP = "WhatsApp/2.23.20.0";

export function decodeHtmlEntities(text = "") {
  return String(text)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/\s+/g, " ")
    .trim();
}

export function detectStoreFromUrl(targetUrl = "") {
  const lower = String(targetUrl).toLowerCase();
  if (
    lower.includes("amazon.") ||
    lower.includes("link.amazon") ||
    lower.includes("amzn.") ||
    lower.includes("amzlinks.")
  ) {
    return "Amazon";
  }
  if (
    lower.includes("mercadolivre.") ||
    lower.includes("mercadolibre.") ||
    lower.includes("meli.")
  ) {
    return "Mercado Livre";
  }
  if (lower.includes("shopee.")) {
    return "Shopee";
  }
  return null;
}

export function guessCategoryFromTitle(title = "") {
  const t = String(title).toLowerCase();
  if (
    /(playstation|ps5|ps4|xbox|nintendo|switch|gift card|gamer|controle|dualsense|headset|teclado mecânico|mouse gamer|jogo|rtx|gtx|steam|gta)/i.test(
      t
    )
  ) {
    return "Games";
  }
  if (
    /(iphone|samsung|xiaomi|motorola|kindle|notebook|smart tv|tv |fone|bluetooth|jbl|alexa|echo|smartwatch|tablet|ipad|monitor|ssd|carregador|power bank|caixa de som|celular|smartphone)/i.test(
      t
    )
  ) {
    return "Eletrônicos";
  }
  if (
    /(air fryer|fritadeira|aspirador|cafeteira|liquidificador|panela|travesseiro|lençol|cozinha|ferro de passar|ventilador|ar condicionado|chapinha|secador|automotiva|vonixx|limpeza|organizador|microondas|geladeira|creatina|whey|suplemento)/i.test(
      t
    )
  ) {
    return "Casa";
  }
  return "Mais Vendidos";
}

export function parseBRLNumber(raw = "") {
  if (typeof raw === "number")
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  const cleaned = String(raw)
    .replace(/R\$/gi, "")
    .replace(/\s+/g, "")
    .trim();
  if (!cleaned) return null;

  if (cleaned.includes(",")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(normalized);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  const parts = cleaned.split(".");
  if (parts.length === 2 && parts[1].length === 3) {
    const num = parseFloat(cleaned.replace(/\./g, ""));
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  const num = parseFloat(cleaned);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function extractMetaTag(html, propertyNames) {
  for (const prop of propertyNames) {
    const regex1 = new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${prop}["'][^>]+content=["']([\\s\\S]*?)["']`,
      "i"
    );
    const match1 = html.match(regex1);
    if (match1 && match1[1]) return decodeHtmlEntities(match1[1]);

    const regex2 = new RegExp(
      `<meta[^>]+content=["']([\\s\\S]*?)["'][^>]+(?:property|name|itemprop)=["']${prop}["']`,
      "i"
    );
    const match2 = html.match(regex2);
    if (match2 && match2[1]) return decodeHtmlEntities(match2[1]);
  }
  return "";
}

async function safeFetchHtml(url, userAgent, timeoutMs = 11000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": userAgent,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: controller.signal,
    });
    const html = await res.text();
    return { ok: res.ok, status: res.status, finalUrl: res.url || url, html };
  } catch (err) {
    return { ok: false, status: 0, finalUrl: url, html: "", error: err.message };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// EXTRATOR AMAZON (100% HTML público, sem precisar de chave de API)
// ============================================================================
function parseAmazon(desktopRes, waRes) {
  const desktopHtml = desktopRes.html || "";
  const waHtml = waRes.html || "";

  const out = {
    titulo: "",
    subtitulo: "",
    imagemUrl: "",
    precoAtual: null,
    precoAntigo: null,
    precoObs: "",
    nota: "",
    vendidos: "",
    destaqueTag: "OFERTA VERIFICADA",
    isUnavailable: false,
    unavailableReason: "",
  };

  if (desktopRes.status === 404 || desktopRes.status === 410) {
    out.isUnavailable = true;
    out.unavailableReason = `Link Amazon retornou HTTP ${desktopRes.status}`;
    return out;
  }

  if (
    /id=["']outOfStock["']/i.test(desktopHtml) ||
    /Temporariamente fora de estoque/i.test(desktopHtml) ||
    /Não disponível\.\s*<\/span>/i.test(desktopHtml) ||
    /Não sabemos quando ou se este item estará disponível novamente/i.test(
      desktopHtml
    )
  ) {
    out.isUnavailable = true;
    out.unavailableReason =
      "Produto marcado como indisponível/sem estoque na Amazon";
  }

  out.titulo =
    extractMetaTag(waHtml, ["og:title", "twitter:title"]) ||
    decodeHtmlEntities(
      desktopHtml.match(
        /<span[^>]+id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i
      )?.[1] || ""
    ) ||
    extractMetaTag(desktopHtml, ["og:title", "title"]) ||
    decodeHtmlEntities(
      desktopHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""
    );

  if (out.titulo) {
    out.titulo = out.titulo
      .replace(/\s*[:|-]\s*Amazon\.com\.br.*$/i, "")
      .trim();
  }

  const dynamicImgMatch =
    desktopHtml.match(
      /id=["']landingImage["'][^>]*data-a-dynamic-image=["']([^"']+)["']/i
    ) ||
    desktopHtml.match(
      /data-a-dynamic-image=["']([^"']+)["'][^>]*id=["']landingImage["']/i
    );

  if (dynamicImgMatch && dynamicImgMatch[1]) {
    try {
      const parsedImgs = JSON.parse(decodeHtmlEntities(dynamicImgMatch[1]));
      const entries = Object.entries(parsedImgs).sort(
        (a, b) => (b[1]?.[0] || 0) - (a[1]?.[0] || 0)
      );
      if (entries.length > 0) out.imagemUrl = entries[0][0];
    } catch {
      // fallback
    }
  }

  if (!out.imagemUrl) {
    const hiRes =
      desktopHtml.match(/data-old-hires=["'](https:\/\/[^"']+)["']/i)?.[1] ||
      desktopHtml.match(/"hiRes"\s*:\s*"(https:\/\/[^"]+)"/i)?.[1] ||
      desktopHtml.match(/"large"\s*:\s*"(https:\/\/[^"]+)"/i)?.[1] ||
      extractMetaTag(waHtml, ["og:image", "og:image:secure_url"]) ||
      extractMetaTag(desktopHtml, ["og:image"]);
    if (hiRes) out.imagemUrl = decodeHtmlEntities(hiRes);
  }

  const priceToPayBlock = desktopHtml.match(
    /priceToPay[\s\S]{0,450}?(?:a-offscreen|aok-offscreen)["'][^>]*>([^<]+)</i
  );
  if (priceToPayBlock && priceToPayBlock[1]) {
    const firstPrice = priceToPayBlock[1].match(/R\$\s*[\d.,]+/i)?.[0];
    if (firstPrice) out.precoAtual = parseBRLNumber(firstPrice);
  }
  if (!out.precoAtual) {
    const priceAmountMatch = desktopHtml.match(/"priceAmount"\s*:\s*([\d.]+)/i);
    if (priceAmountMatch) out.precoAtual = parseBRLNumber(priceAmountMatch[1]);
  }
  if (!out.precoAtual) {
    const corePriceMatch = desktopHtml.match(
      /corePriceDisplay_desktop_feature_div[\s\S]{0,900}?a-offscreen["'][^>]*>([^<]+)</i
    );
    if (corePriceMatch && corePriceMatch[1]) {
      const p = corePriceMatch[1].match(/R\$\s*[\d.,]+/i)?.[0];
      if (p) out.precoAtual = parseBRLNumber(p);
    }
  }

  const basisPriceBlock = desktopHtml.match(
    /basisPrice[\s\S]{0,450}?a-offscreen["'][^>]*>([^<]+)</i
  );
  if (basisPriceBlock && basisPriceBlock[1]) {
    const oldVal = basisPriceBlock[1].match(/R\$\s*[\d.,]+/i)?.[0];
    if (oldVal) out.precoAntigo = parseBRLNumber(oldVal);
  }
  if (!out.precoAntigo) {
    const strikeMatch = desktopHtml.match(
      /data-a-strike=["']true["'][\s\S]{0,200}?a-offscreen["'][^>]*>([^<]+)</i
    );
    if (strikeMatch && strikeMatch[1]) {
      const oldVal = strikeMatch[1].match(/R\$\s*[\d.,]+/i)?.[0];
      if (oldVal) out.precoAntigo = parseBRLNumber(oldVal);
    }
  }

  const ratingMatch =
    desktopHtml.match(
      /id=["']acrPopover["'][^>]+title=["']([\d.,]+)\s*de\s*5/i
    ) || desktopHtml.match(/([\d.,]+)\s*de\s*5\s*estrelas/i);
  if (ratingMatch && ratingMatch[1]) {
    out.nota = ratingMatch[1].replace(".", ",");
  }

  const boughtMatch = desktopHtml.match(
    /id=["']social-proofing-faceout-title-tk_bought["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i
  );
  if (boughtMatch && boughtMatch[1]) {
    out.vendidos = decodeHtmlEntities(boughtMatch[1])
      .replace(/^Mais de\s+/i, "+")
      .replace(/\s+no mês passado.*$/i, "")
      .trim();
  } else {
    const reviewsMatch = desktopHtml.match(
      /id=["']acrCustomerReviewText["'][^>]*>([^<]+)</i
    );
    if (reviewsMatch && reviewsMatch[1]) {
      const cleanCount = decodeHtmlEntities(reviewsMatch[1])
        .replace(/[()]/g, "")
        .trim();
      if (cleanCount) out.vendidos = `${cleanCount} avaliações`;
    }
  }

  const bulletsBlock = desktopHtml.match(
    /id=["']feature-bullets["'][\s\S]{0,2000}/i
  )?.[0];
  if (bulletsBlock) {
    const firstBullet = bulletsBlock.match(
      /<span class=["']a-list-item["'][^>]*>([\s\S]*?)<\/span>/i
    )?.[1];
    if (firstBullet) {
      const cleanBullet = decodeHtmlEntities(
        firstBullet.replace(/<[^>]+>/g, " ")
      );
      if (cleanBullet.length > 12) {
        out.subtitulo =
          cleanBullet.length > 130
            ? cleanBullet.slice(0, 127).trim() + "..."
            : cleanBullet;
      }
    }
  }

  if (out.precoAntigo && out.precoAtual && out.precoAntigo > out.precoAtual) {
    const pct = Math.round(
      ((out.precoAntigo - out.precoAtual) / out.precoAntigo) * 100
    );
    if (pct >= 25) out.destaqueTag = "MENOR PREÇO EM 30 DIAS";
  }

  return out;
}

// ============================================================================
// EXTRATOR MERCADO LIVRE (100% HTML/JSON público, sem precisar de chave de API)
// Mantém padrão antigo (HTML poly-card/PDP) + novo padrão (JSON card-featured)
// ============================================================================
function extractMeliAmount(htmlSnippet = "") {
  const frac = htmlSnippet.match(
    /andes-money-amount__fraction[^>]*>([\d.]+)</i
  )?.[1];
  if (!frac) return null;
  const cents = htmlSnippet.match(
    /andes-money-amount__cents[^>]*>(\d+)</i
  )?.[1];
  const combined = cents ? `${frac},${cents}` : frac;
  return parseBRLNumber(combined);
}

function formatBRLCompact(num) {
  const value = Number(num);
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function extractMeliFeaturedPolycard(html = "") {
  const marker = '"id":"card-featured"';
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return null;

  const polycardsIdx = html.indexOf('"polycards":[', markerIdx);
  if (polycardsIdx === -1 || polycardsIdx - markerIdx > 6000) return null;

  const start = polycardsIdx + '"polycards":'.length;
  let depth = 0;
  let end = -1;
  let inStr = false;
  let esc = false;

  for (let i = start; i < html.length && i - start < 40000; i++) {
    const ch = html[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) return null;

  try {
    const parsed = JSON.parse(html.slice(start, end));
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
  } catch {
    return null;
  }
}

function parseMeliInstallmentsJson(installmentsObj) {
  if (!installmentsObj || !installmentsObj.text) return "";
  let text = String(installmentsObj.text);
  const values = Array.isArray(installmentsObj.values)
    ? installmentsObj.values
    : [];

  for (const val of values) {
    if (!val?.key) continue;
    let replacement = "";
    if (val.type === "price" && val.price?.value) {
      replacement = formatBRLCompact(val.price.value);
    } else if (val.type === "label" && val.label?.text) {
      replacement = val.label.text;
    }
    text = text.replace(new RegExp(`\\{${val.key}\\}`, "g"), replacement);
  }

  return text
    .replace(/\{[^}]+\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMercadoLivre(desktopRes, waRes) {
  const desktopHtml = desktopRes.html || "";
  const waHtml = waRes.html || "";

  const out = {
    titulo: "",
    subtitulo: "",
    imagemUrl: "",
    precoAtual: null,
    precoAntigo: null,
    precoObs: "",
    nota: "",
    vendidos: "",
    destaqueTag: "OFERTA VERIFICADA",
    isUnavailable: false,
    unavailableReason: "",
    isCatalogProduct:
      /\/p\/MLB\d+/i.test(desktopHtml) ||
      /\/p\/MLB\d+/i.test(desktopRes.finalUrl || ""),
  };

  if (desktopRes.status === 404 || desktopRes.status === 410) {
    out.isUnavailable = true;
    out.unavailableReason = `Link Mercado Livre retornou HTTP ${desktopRes.status}`;
    return out;
  }

  if (
    /Publicação pausada/i.test(desktopHtml) ||
    /Anúncio pausado/i.test(desktopHtml) ||
    /Publicação finalizada/i.test(desktopHtml) ||
    /Este produto não está disponível/i.test(desktopHtml) ||
    /Sem estoque disponível/i.test(desktopHtml)
  ) {
    out.isUnavailable = true;
    out.unavailableReason = "Anúncio pausado ou sem estoque no Mercado Livre";
  }

  // PADRÃO NOVO: JSON estruturado do card-featured (inclui preço exato, Pix, parcelamento limpo e loja)
  const polycard = extractMeliFeaturedPolycard(desktopHtml);
  const components = Array.isArray(polycard?.components)
    ? polycard.components
    : [];
  let sellerFromJson = "";
  let installmentsFromJson = "";

  if (components.length > 0) {
    const titleComp = components.find((c) => c.type === "title")?.title;
    if (titleComp?.text) out.titulo = decodeHtmlEntities(titleComp.text);

    const priceComp = components.find((c) => c.type === "price")?.price;
    if (priceComp) {
      if (priceComp.current_price?.value) {
        out.precoAtual = parseBRLNumber(priceComp.current_price.value);
      }
      if (priceComp.previous_price?.value) {
        out.precoAntigo = parseBRLNumber(priceComp.previous_price.value);
      }
      const discountLabel = priceComp.discount_label?.text || "";
      if (/no\s*pix/i.test(discountLabel)) {
        out.precoObs = "no Pix";
      }
      installmentsFromJson = parseMeliInstallmentsJson(priceComp.installments);
    }

    const sellerComp = components.find((c) => c.type === "seller")?.seller;
    if (sellerComp?.text) {
      const cleanSeller = decodeHtmlEntities(
        sellerComp.text.replace(/\{[^}]+\}/g, "").replace(/^Por\s+/i, "")
      );
      const isOfficial = Array.isArray(sellerComp.values)
        ? sellerComp.values.some(
            (v) =>
              v.key === "icon_cockade" ||
              /loja oficial/i.test(v.icon?.alt_text || "")
          )
        : false;
      if (cleanSeller) {
        sellerFromJson = isOfficial
          ? `Loja oficial (${cleanSeller})`
          : `Vendido por ${cleanSeller}`;
      }
    }

    const reviewComp = components.find(
      (c) => c.type === "review_compacted"
    )?.review_compacted;
    if (Array.isArray(reviewComp?.values)) {
      const ratingVal = reviewComp.values.find(
        (v) => v.key === "label"
      )?.label?.text;
      if (ratingVal && /^[\d.,]+$/.test(ratingVal.trim())) {
        out.nota = ratingVal.trim().replace(".", ",");
      }
      const soldVal = reviewComp.values.find(
        (v) => v.key === "label2"
      )?.label?.text;
      if (soldVal) {
        const cleanSold = decodeHtmlEntities(soldVal)
          .replace(/^\|?\s*/, "")
          .replace(/(\d)(mil)/gi, "$1 $2")
          .trim();
        if (cleanSold) out.vendidos = cleanSold;
      }
    }

    const highlightComp = components.find(
      (c) => c.type === "highlight"
    )?.highlight;
    if (highlightComp?.text && /mais vendido/i.test(highlightComp.text)) {
      out.destaqueTag = "MAIS VENDIDO";
    }
  }

  // PADRÃO ANTIGO (mantido integralmente como fallback para HTML poly-card / PDP / meta tags)
  const xlargeIdx = desktopHtml.indexOf("poly-card--xlarge");
  const featuredBlock =
    xlargeIdx !== -1
      ? desktopHtml.slice(xlargeIdx, xlargeIdx + 5500)
      : desktopHtml;

  if (!out.titulo) {
    out.titulo =
      extractMetaTag(waHtml, ["og:title"]) ||
      decodeHtmlEntities(
        featuredBlock.match(
          /class=["'][^"']*poly-component__title[^"']*["'][^>]*>([\s\S]*?)<\/a>/i
        )?.[1] || ""
      ) ||
      decodeHtmlEntities(
        desktopHtml.match(
          /class=["'][^"']*ui-pdp-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i
        )?.[1] || ""
      ) ||
      extractMetaTag(desktopHtml, ["twitter:title", "og:title", "title"]);
  }

  if (out.titulo) {
    out.titulo = out.titulo
      .replace(/\s*\|\s*Mercado\s*Livre.*$/i, "")
      .replace(/\s*-\s*R\$\s*[\d.,]+$/i, "")
      .trim();
  }

  out.imagemUrl =
    extractMetaTag(waHtml, ["og:image"]) ||
    decodeHtmlEntities(
      featuredBlock.match(
        /class=["'][^"']*poly-component__picture[^"']*["'][^>]+src=["']([^"']+)["']/i
      )?.[1] || ""
    ) ||
    extractMetaTag(desktopHtml, ["og:image", "twitter:image", "image"]);

  if (!out.precoAntigo) {
    const prevPriceBlock = featuredBlock.match(
      /andes-money-amount--previous[\s\S]{0,600}?<\/s>/i
    )?.[0];
    if (prevPriceBlock) out.precoAntigo = extractMeliAmount(prevPriceBlock);
  }

  if (!out.precoAtual) {
    const currentPriceBlock =
      featuredBlock.match(/poly-price__current[\s\S]{0,700}?<\/div>/i)?.[0] ||
      featuredBlock.match(/ui-pdp-price__second-line[\s\S]{0,700}?<\/div>/i)?.[0];
    if (currentPriceBlock) {
      out.precoAtual = extractMeliAmount(currentPriceBlock);
      if (!out.precoObs && /no\s*pix/i.test(currentPriceBlock)) {
        out.precoObs = "no Pix";
      }
    }
  }

  if (!out.precoAtual) {
    const ogTitleOrDesc =
      extractMetaTag(desktopHtml, ["og:title", "og:description"]) || "";
    const priceInMeta = ogTitleOrDesc.match(/-\s*R\$\s*([\d.,]+)/i)?.[1];
    if (priceInMeta) out.precoAtual = parseBRLNumber(priceInMeta);
  }

  if (!out.precoObs && /OFF\s+no\s+Pix/i.test(featuredBlock)) {
    out.precoObs = "no Pix";
  }

  if (!out.nota) {
    const ratingMatch =
      featuredBlock.match(/Classificação\s*([\d.,]+)\s*de\s*5/i) ||
      featuredBlock.match(
        /poly-component__review-compacted[\s\S]{0,300}?>([\d.,]+)<\/span>/i
      ) ||
      desktopHtml.match(/ui-pdp-review__rating[^>]*>([\d.,]+)</i);
    if (ratingMatch && ratingMatch[1]) {
      out.nota = ratingMatch[1].replace(".", ",");
    }
  }

  if (!out.vendidos) {
    const soldMatch =
      featuredBlock.match(
        /(\+?[\d.,]+\s*mil\s*vendidos|\+?[\d.,]+\s*vendidos)/i
      ) ||
      featuredBlock.match(/Mais de\s*([\d.,]+\s*mil?)\s*produtos vendidos/i);
    if (soldMatch && soldMatch[1]) {
      let sold = decodeHtmlEntities(soldMatch[1])
        .replace(/(\d)(mil)/gi, "$1 $2")
        .trim();
      if (!/vendidos/i.test(sold)) sold = `+${sold} vendidos`;
      out.vendidos = sold;
    }
  }

  const highlightMatch = featuredBlock.match(
    /poly-component__highlight[^>]*>([^<]+)</i
  )?.[1];
  if (highlightMatch && /mais vendido/i.test(highlightMatch)) {
    out.destaqueTag = "MAIS VENDIDO";
  }

  const sellerHtml = decodeHtmlEntities(
    featuredBlock
      .match(/poly-component__seller[^>]*>([\s\S]*?)<\/span>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ") || ""
  ).replace(/^Por\s+/i, "");

  const installmentsHtml = decodeHtmlEntities(
    featuredBlock
      .match(/poly-price__installments[^>]*>([\s\S]*?)<\/span>\s*<\/div>/i)?.[1]
      ?.replace(/<[^>]+>/g, " ") || ""
  ).replace(/(\d)\s*,\s*(\d)/g, "$1,$2");

  const finalSeller =
    sellerFromJson || (sellerHtml ? `Loja oficial (${sellerHtml})` : "");
  const finalInstallments = installmentsFromJson || installmentsHtml;

  const subParts = [];
  if (finalSeller) subParts.push(finalSeller);
  if (finalInstallments) {
    subParts.push(
      /^ou\s+/i.test(finalInstallments)
        ? finalInstallments
        : `Parcelamento em ${finalInstallments}`
    );
  }
  if (subParts.length > 0) out.subtitulo = subParts.join(" • ");

  return out;
}

// ============================================================================
// EXTRATOR SHOPEE (100% HTML/OpenGraph público, sem depender de chave de API)
// ============================================================================
function parseShopee(desktopRes, waRes) {
  const desktopHtml = desktopRes.html || "";
  const waHtml = waRes.html || "";

  const out = {
    titulo: "",
    subtitulo: "",
    imagemUrl: "",
    precoAtual: null,
    precoAntigo: null,
    precoObs: "",
    nota: "",
    vendidos: "",
    destaqueTag: "OFERTA VERIFICADA",
    isUnavailable: false,
    unavailableReason: "",
  };

  if (
    (desktopRes.status === 404 || desktopRes.status === 410) &&
    (waRes.status === 404 || waRes.status === 410)
  ) {
    out.isUnavailable = true;
    out.unavailableReason = "Link Shopee retornou página inexistente (404)";
    return out;
  }

  const waDesc =
    extractMetaTag(waHtml, ["og:description", "description"]) ||
    extractMetaTag(desktopHtml, ["og:description", "description"]);

  const fullTitleMatch = waDesc.match(
    /^Compre\s+([\s\S]+?)\s+na\s+Shopee\s+Brasil!?/i
  );
  if (fullTitleMatch && fullTitleMatch[1]) {
    out.titulo = decodeHtmlEntities(fullTitleMatch[1]);
  } else {
    out.titulo =
      extractMetaTag(waHtml, ["og:title", "twitter:title"]) ||
      extractMetaTag(desktopHtml, ["og:title", "twitter:title"]);
  }

  if (out.titulo) {
    out.titulo = out.titulo.replace(/\s*\|\s*Shopee\s*Brasil.*$/i, "").trim();
  }

  if (waDesc) {
    const afterPrefix = waDesc
      .replace(/^Compre\s+[\s\S]+?\s+na\s+Shopee\s+Brasil!?\s*/i, "")
      .trim();
    if (afterPrefix) {
      const firstSentence = afterPrefix
        .split(/[-–—]{4,}|\n|📦|✅|🛠|🚛/)[0]
        .trim();
      if (firstSentence.length > 10) {
        out.subtitulo =
          firstSentence.length > 135
            ? firstSentence.slice(0, 132).trim() + "..."
            : firstSentence;
      }
    }
  }

  out.imagemUrl =
    extractMetaTag(waHtml, ["og:image", "og:square_image", "twitter:image"]) ||
    extractMetaTag(desktopHtml, ["og:image", "twitter:image"]);

  if (
    /Produto não encontrado|Este produto não existe|item foi excluído/i.test(
      waHtml + desktopHtml
    )
  ) {
    out.isUnavailable = true;
    out.unavailableReason = "Produto removido ou inexistente na Shopee";
  }

  // Tenta extrair preço de meta tags caso a Shopee exponha no HTML público
  const rawMetaPrice = extractMetaTag(waHtml, [
    "product:price:amount",
    "og:price:amount",
  ]);
  if (rawMetaPrice) out.precoAtual = parseBRLNumber(rawMetaPrice);

  return out;
}

// ============================================================================
// FUNÇÃO PRINCIPAL EXPORTADA (Usada no /admin e no Robô Diário de Ofertas)
// ============================================================================
export async function extractProductFromUrl(rawUrl) {
  const trimmedUrl = String(rawUrl || "").trim();

  const [desktopRes, waRes] = await Promise.all([
    safeFetchHtml(trimmedUrl, UA_DESKTOP),
    safeFetchHtml(trimmedUrl, UA_WHATSAPP),
  ]);

  const detectedStore =
    detectStoreFromUrl(trimmedUrl) ||
    detectStoreFromUrl(desktopRes.finalUrl) ||
    detectStoreFromUrl(waRes.finalUrl);

  let extracted = {
    titulo: "",
    subtitulo: "",
    imagemUrl: "",
    precoAtual: null,
    precoAntigo: null,
    nota: "",
    vendidos: "",
    destaqueTag: "OFERTA VERIFICADA",
    isUnavailable: false,
    unavailableReason: "",
  };

  if (detectedStore === "Amazon") {
    extracted = parseAmazon(desktopRes, waRes);
  } else if (detectedStore === "Mercado Livre") {
    extracted = parseMercadoLivre(desktopRes, waRes);
  } else if (detectedStore === "Shopee") {
    extracted = parseShopee(desktopRes, waRes);
  } else {
    extracted.titulo =
      extractMetaTag(waRes.html, ["og:title", "twitter:title"]) ||
      extractMetaTag(desktopRes.html, ["og:title", "twitter:title"]);
    extracted.imagemUrl =
      extractMetaTag(waRes.html, ["og:image", "twitter:image"]) ||
      extractMetaTag(desktopRes.html, ["og:image", "twitter:image"]);
    extracted.subtitulo = extractMetaTag(waRes.html, [
      "og:description",
      "description",
    ]).slice(0, 130);
    if (desktopRes.status === 404 || desktopRes.status === 410) {
      extracted.isUnavailable = true;
      extracted.unavailableReason = `Link retornou HTTP ${desktopRes.status}`;
    }
  }

  const categoria = guessCategoryFromTitle(extracted.titulo);

  const loadedFields = [];
  const missingFields = [];

  if (detectedStore) loadedFields.push("Loja");
  else missingFields.push("Loja");

  if (extracted.titulo) loadedFields.push("Título");
  else missingFields.push("Título do Produto");

  if (extracted.imagemUrl) loadedFields.push("Foto");
  else missingFields.push("URL da Imagem (Foto)");

  if (extracted.precoAtual) loadedFields.push("Preço Atual");
  else missingFields.push("Preço Atual");

  if (extracted.precoAntigo) loadedFields.push("Preço Antigo");
  else missingFields.push("Preço Antigo (Opcional)");

  if (extracted.nota) loadedFields.push("Nota");
  else missingFields.push("Nota (Estrelas)");

  if (extracted.vendidos) loadedFields.push("Vendidos");
  else missingFields.push("Qtd. Vendidos");

  if (extracted.subtitulo) loadedFields.push("Resumo/Benefício");

  let warningMessage = "";
  if (missingFields.length > 0) {
    if (detectedStore === "Shopee" && !extracted.precoAtual) {
      warningMessage =
        "A Shopee não coloca preço, nota e vendidos no HTML público (sem API oficial da Shopee, carregamos automaticamente Loja, Título, Foto e Resumo). Preencha apenas os campos destacados acima.";
    } else {
      warningMessage = `Alguns dados não foram encontrados automaticamente na página (${missingFields.join(
        ", "
      )}). Preencha esses campos manualmente abaixo.`;
    }
  }

  return {
    success: loadedFields.length > 0,
    loja: detectedStore || "Amazon",
    categoria,
    titulo: extracted.titulo,
    subtitulo: extracted.subtitulo,
    imagemUrl: extracted.imagemUrl,
    precoAtual: extracted.precoAtual,
    precoAntigo: extracted.precoAntigo,
    precoObs: extracted.precoObs || "",
    nota: extracted.nota,
    vendidos: extracted.vendidos,
    destaqueTag: extracted.destaqueTag,
    isUnavailable: Boolean(extracted.isUnavailable),
    unavailableReason: extracted.unavailableReason || "",
    isCatalogProduct: Boolean(extracted.isCatalogProduct),
    priceHint:
      detectedStore === "Mercado Livre"
        ? "No Mercado Livre, produtos de catálogo mudam de vendedor e preço ao longo do dia (e podem variar no Pix ou por CEP). Nosso robô recheca a cada 2h — ou marque 'Travar preço manual' se quiser fixar um valor específico."
        : "",
    loadedFields,
    missingFields,
    warningMessage,
    finalUrl: desktopRes.finalUrl || waRes.finalUrl || trimmedUrl,
  };
}
