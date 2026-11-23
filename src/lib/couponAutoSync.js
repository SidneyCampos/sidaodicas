import { readJsonData, writeJsonData } from "./adminStorage.js";

const SOURCES = [
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

const BLOCKED_BRAND_KEYWORDS = [
  "PROMOBIT",
  "PR0M0B1T",
  "PELANDO",
  "CUPONOMIA",
  "MELIUZ",
  "CUPO",
  "RESGATE",
];

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

function isCleanCouponCode(code = "") {
  const clean = String(code).trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,24}$/.test(clean)) return false;
  if (BLOCKED_BRAND_KEYWORDS.some((kw) => clean.includes(kw))) return false;
  return true;
}

function cleanDescription(title = "", loja = "") {
  return String(title)
    .replace(/Promobit/gi, "Sidão Dicas")
    .replace(/\s+/g, " ")
    .trim() || `Desconto ativo em produtos selecionados na ${loja}`;
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

async function fetchStoreLiveCoupons(source, affiliateLink) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
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

      // Confirma que o cupom pertence mesmo a essa loja (evita cross-promoções)
      const slug = String(c.storeSlug || c.storeName || "").toLowerCase();
      const matchesStore = source.slugMatch.some((s) => slug.includes(s));
      if (!matchesStore) continue;

      // Ignora cupons expirados
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
        atualizadoEm: new Date().toISOString(),
      });

      if (valid.length >= 4) break;
    }

    return valid;
  } catch (err) {
    console.warn(`Aviso ao sincronizar cupons (${source.loja}):`, err.message);
    return [];
  }
}

export async function fetchLiveCouponsAllStores() {
  const config = await getAffiliateConfig();
  const results = await Promise.all(
    SOURCES.map((src) =>
      fetchStoreLiveCoupons(src, config[src.loja] || "https://www.amazon.com.br")
    )
  );
  return results.flat();
}

export async function syncAndPersistCoupons() {
  const [liveCoupons, existingCoupons, config] = await Promise.all([
    fetchLiveCouponsAllStores(),
    readJsonData("cupons.json"),
    getAffiliateConfig(),
  ]);

  // Mantém cupons criados manualmente pelo admin (sem autoSynced) + adiciona os novos sincronizados
  const manualCoupons = (Array.isArray(existingCoupons) ? existingCoupons : []).filter(
    (c) => !c.autoSynced
  );

  const manualCodes = new Set(
    manualCoupons.map((c) => String(c.codigo || "").toUpperCase())
  );

  const merged = [
    ...manualCoupons,
    ...liveCoupons.filter((c) => !manualCodes.has(c.codigo)),
  ];

  // Atualiza cache em memória
  cachedAutoCoupons = merged;
  cachedAtMs = Date.now();

  if (liveCoupons.length > 0) {
    await writeJsonData(
      "cupons.json",
      merged,
      `Sincronizacao automatica de ${liveCoupons.length} cupons ativos`
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
      "Mercado Livre": liveCoupons.filter((c) => c.loja === "Mercado Livre").length,
      Shopee: liveCoupons.filter((c) => c.loja === "Shopee").length,
    },
  };
}

/**
 * Usado pela Home (`src/app/page.js`):
 * Garante que os cupons do site estejam sempre frescos (auto-atualizados a cada 2h)
 * sem bloquear o carregamento se alguma fonte externa oscilar.
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
      const merged = [...manual, ...live.filter((c) => !manualCodes.has(c.codigo))];
      cachedAutoCoupons = merged;
      cachedAtMs = Date.now();
      return merged;
    }
  } catch {
    // fallback para cupons.json salvo
  }

  return Array.isArray(saved) ? saved : [];
}
