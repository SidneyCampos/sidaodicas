import { readJsonData, writeJsonData } from "./adminStorage.js";

const PROMOBIT_SOURCES = [
  {
    loja: "Mercado Livre",
    slugMatch: ["mercado-livre", "mercadolivre"],
    url: "https://www.promobit.com.br/cupons/loja/mercado-livre/",
  },
  {
    loja: "Amazon",
    slugMatch: ["amazon"],
    url: "https://www.promobit.com.br/cupons/loja/amazon/",
  },
  {
    loja: "Shopee",
    slugMatch: ["shopee"],
    url: "https://www.promobit.com.br/cupons/loja/shopee/",
  },
];

const DESCONTOSTOP_SOURCES = [
  {
    loja: "Amazon",
    url: "https://descontostop.com.br/loja/cupom-desconto-amazon/",
  },
  {
    loja: "Mercado Livre",
    url: "https://descontostop.com.br/loja/cupom-desconto-mercado-livre/",
  },
  {
    loja: "Shopee",
    url: "https://descontostop.com.br/loja/cupom-desconto-shopee/",
  },
];

const BLOCKED_BRAND_KEYWORDS = [
  "PROMOBIT",
  "PR0M0B1T",
  "PELANDO",
  "CUPONOMIA",
  "MELIUZ",
  "DESCONTOSTOP",
  "RESGATE",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

// Cache em memória (2 horas) para manter a Home instantânea e sempre atualizada automaticamente
let cachedAutoCoupons = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

export async function getAffiliateConfig() {
  const defaults = {
    Amazon: "https://www.amazon.com.br/deals?tag=sidaodicas-20",
    "Mercado Livre": "https://www.mercadolivre.com.br/social/casi3341967",
    Shopee: "https://shopee.com.br/m/cupons-diarios",
    autoSyncEnabled: true,
    lastAutoSyncAt: null,
  };

  try {
    const cfg = await readJsonData("affiliateConfig.json");
    if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
      return { ...defaults, ...cfg };
    }
  } catch {
    // usa padrão
  }
  return defaults;
}

function decodeHtml(text = "") {
  return String(text)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isCleanCouponCode(code = "") {
  const clean = String(code).trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,24}$/.test(clean)) return false;
  if (BLOCKED_BRAND_KEYWORDS.some((kw) => clean.includes(kw))) return false;
  return true;
}

function cleanDescription(title = "", loja = "") {
  return (
    decodeHtml(title)
      .replace(/Promobit/gi, "Sidão Dicas")
      .replace(/Descontos\s*Top/gi, "Sidão Dicas")
      .replace(/\*+$/g, "")
      .trim() || `Desconto ativo em produtos selecionados na ${loja}`
  );
}

function formatValidity(couponUntil) {
  if (!couponUntil) return "Ativo hoje • Uso limitado";
  try {
    const d = new Date(couponUntil);
    if (!Number.isNaN(d.getTime())) {
      const formatted = d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      return `Válido até ${formatted}`;
    }
  } catch {
    // fallback
  }
  return "Ativo hoje • Uso limitado";
}

// FONTE 1: DescontosTop (excelente cobertura para Amazon, Mercado Livre e Shopee)
async function fetchFromDescontosTop(source, affiliateLink) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8500),
    });

    if (!res.ok) return [];
    const html = await res.text();

    // Captura apenas blocos ativos (`coupon-live`)
    const liveBlocks = html.split(/class="[^"]*coupon-live[^"]*"/i).slice(1);
    const items = [];
    const seen = new Set();

    for (const block of liveBlocks) {
      const snippet = block.slice(0, 1400);
      const codeMatch = snippet.match(
        /data-code=["']?([A-Z0-9_-]{3,24})["']?/i
      );
      if (!codeMatch) continue;

      const code = codeMatch[1].trim().toUpperCase();
      if (!isCleanCouponCode(code) || seen.has(code)) continue;

      const titleMatch = snippet.match(
        /<h3[^>]*class="[^"]*coupon-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i
      );
      const rawTitle = titleMatch ? titleMatch[1] : "";
      const descricao = cleanDescription(rawTitle, source.loja);

      seen.add(code);
      items.push({
        id: `auto-${source.loja.toLowerCase().replace(/\s+/g, "")}-${code}`,
        loja: source.loja,
        codigo: code,
        descricao,
        linkAfiliadoLoja: affiliateLink,
        validade: "Ativo hoje • Uso limitado",
        autoSynced: true,
        fonte: "auto",
        atualizadoEm: new Date().toISOString(),
      });

      if (items.length >= 4) break;
    }

    return items;
  } catch (err) {
    console.warn(`Aviso Fonte 1 (${source.loja}):`, err.message);
    return [];
  }
}

// FONTE 2: Promobit (__NEXT_DATA__ estruturado para Mercado Livre, Amazon e Shopee)
async function fetchFromPromobit(source, affiliateLink) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8500),
    });

    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );
    if (!match || !match[1]) return [];

    const parsed = JSON.parse(match[1]);
    const rawCoupons = [];

    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node.couponCode === "string" && node.couponTitle) {
        rawCoupons.push(node);
        return;
      }
      Object.values(node).forEach(walk);
    };

    walk(parsed);

    const seenCodes = new Set();
    const valid = [];

    for (const c of rawCoupons) {
      const code = String(c.couponCode || "").trim().toUpperCase();
      if (!isCleanCouponCode(code) || seenCodes.has(code)) continue;

      const slug = String(c.storeSlug || c.storeName || "").toLowerCase();
      const matchesStore = source.slugMatch.some((s) => slug.includes(s));
      if (!matchesStore) continue;

      const statusName = String(c.couponStatusName || "").toLowerCase();
      if (statusName.includes("expir") || statusName.includes("encerr")) {
        continue;
      }

      if (c.couponUntil) {
        const exp = new Date(c.couponUntil).getTime();
        if (!Number.isNaN(exp) && exp < Date.now() - 86400000) continue;
      }

      seenCodes.add(code);
      valid.push({
        id: `auto-${source.loja.toLowerCase().replace(/\s+/g, "")}-${code}`,
        loja: source.loja,
        codigo: code,
        descricao: cleanDescription(c.couponTitle, source.loja),
        linkAfiliadoLoja: affiliateLink,
        validade: formatValidity(c.couponUntil),
        autoSynced: true,
        fonte: "auto",
        atualizadoEm: new Date().toISOString(),
      });

      if (valid.length >= 4) break;
    }

    return valid;
  } catch (err) {
    console.warn(`Aviso Fonte 2 (${source.loja}):`, err.message);
    return [];
  }
}

export async function fetchLiveCouponsAllStores() {
  const config = await getAffiliateConfig();

  const [dtResults, pbResults] = await Promise.all([
    Promise.all(
      DESCONTOSTOP_SOURCES.map((src) =>
        fetchFromDescontosTop(
          src,
          config[src.loja] || "https://www.amazon.com.br"
        )
      )
    ),
    Promise.all(
      PROMOBIT_SOURCES.map((src) =>
        fetchFromPromobit(src, config[src.loja] || "https://www.amazon.com.br")
      )
    ),
  ]);

  // Combina as 2 fontes por loja, remove duplicados e limita aos 5 melhores cupons por loja (15 total)
  const storesOrder = ["Amazon", "Mercado Livre", "Shopee"];
  const allCombined = [...dtResults.flat(), ...pbResults.flat()];
  const finalCoupons = [];

  for (const loja of storesOrder) {
    const seenForStore = new Set();
    let count = 0;
    for (const c of allCombined) {
      if (c.loja !== loja) continue;
      if (seenForStore.has(c.codigo)) continue;
      seenForStore.add(c.codigo);
      finalCoupons.push(c);
      count++;
      if (count >= 5) break;
    }
  }

  return finalCoupons;
}

export async function syncAndPersistCoupons() {
  const [liveCoupons, existingCoupons, config] = await Promise.all([
    fetchLiveCouponsAllStores(),
    readJsonData("cupons.json", { bypassCache: true }),
    getAffiliateConfig(),
  ]);

  const manualCoupons = (
    Array.isArray(existingCoupons) ? existingCoupons : []
  ).filter((c) => !c.autoSynced);

  const manualCodes = new Set(
    manualCoupons.map((c) => String(c.codigo || "").toUpperCase())
  );

  const merged = [
    ...manualCoupons,
    ...liveCoupons.filter((c) => !manualCodes.has(c.codigo)),
  ];

  cachedAutoCoupons = merged;
  cachedAtMs = Date.now();

  if (liveCoupons.length > 0) {
    await writeJsonData(
      "cupons.json",
      merged,
      `Sincronizacao automatica diaria: ${liveCoupons.length} cupons ativos`
    );
    await writeJsonData(
      "affiliateConfig.json",
      { ...config, lastAutoSyncAt: new Date().toISOString() },
      "Atualizacao de timestamp de cupons automaticos"
    );
  }

  return {
    totalSynced: liveCoupons.length,
    totalManual: manualCoupons.length,
    cupons: merged,
    byStore: {
      Amazon: liveCoupons.filter((c) => c.loja === "Amazon").length,
      "Mercado Livre": liveCoupons.filter((c) => c.loja === "Mercado Livre")
        .length,
      Shopee: liveCoupons.filter((c) => c.loja === "Shopee").length,
    },
  };
}

/**
 * Usado pela Home (`src/app/page.js`):
 * Garante que os cupons do site estejam sempre frescos (auto-atualizados a cada 2h)
 * além da sincronização automática diária do GitHub Actions.
 */
export async function getFreshCouponsForHome() {
  const saved = await readJsonData("cupons.json");
  const config = await getAffiliateConfig();

  if (config.autoSyncEnabled === false) {
    return Array.isArray(saved) ? saved : [];
  }

  if (cachedAutoCoupons && Date.now() - cachedAtMs < CACHE_TTL_MS) {
    return cachedAutoCoupons;
  }

  try {
    const live = await fetchLiveCouponsAllStores();
    if (live.length > 0) {
      const manual = (Array.isArray(saved) ? saved : []).filter(
        (c) => !c.autoSynced
      );
      const manualCodes = new Set(
        manual.map((c) => String(c.codigo || "").toUpperCase())
      );
      const merged = [
        ...manual,
        ...live.filter((c) => !manualCodes.has(c.codigo)),
      ];
      cachedAutoCoupons = merged;
      cachedAtMs = Date.now();
      return merged;
    }
  } catch {
    // fallback para cupons.json salvo
  }

  return Array.isArray(saved) ? saved : [];
}
