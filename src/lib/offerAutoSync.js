import { readJsonData, writeJsonData } from "./adminStorage.js";
import { extractProductFromUrl } from "./productExtractor.js";

function calcDiscount(precoAntigo, precoAtual) {
  const oldP = Number(precoAntigo);
  const newP = Number(precoAtual);
  if (!Number.isNaN(oldP) && !Number.isNaN(newP) && oldP > newP && oldP > 0) {
    return Math.round(((oldP - newP) / oldP) * 100);
  }
  return 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Audita TODAS as ofertas ativas em `src/data/ofertas.json`:
 * - Atualiza preços automaticamente (ex: caiu de R$ 129 para R$ 104!)
 * - Recalcula a % de desconto
 * - Atualiza nota e qtd. vendidos quando disponível
 * - Exclui automaticamente ofertas cujo link ficou indisponível / sem estoque / 404
 * - Nunca exclui por erro temporário de rede (segurança contra falso positivo)
 */
export async function syncAndAuditAllOffers() {
  const existing = await readJsonData("ofertas.json", { bypassCache: true });
  const ofertas = Array.isArray(existing) ? existing : [];

  const updatedList = [];
  const priceChanges = [];
  const removedOffers = [];
  const skippedOffers = [];

  for (let i = 0; i < ofertas.length; i++) {
    const offer = ofertas[i];

    if (!offer.linkAfiliado || !/^https?:\/\//i.test(offer.linkAfiliado)) {
      updatedList.push(offer);
      skippedOffers.push({ id: offer.id, titulo: offer.titulo, motivo: "Sem URL válida" });
      continue;
    }

    try {
      const live = await extractProductFromUrl(offer.linkAfiliado);

      // 1. Link explicitamente indisponível / esgotado / pausado -> EXCLUIR do site!
      if (live.isUnavailable) {
        removedOffers.push({
          id: offer.id,
          titulo: offer.titulo,
          loja: offer.loja,
          motivo: live.unavailableReason || "Indisponível na loja",
        });
        continue;
      }

      let nextOffer = {
        ...offer,
        ultimaVerificacaoEm: new Date().toISOString(),
      };

      // 2. Se encontrou preço novo na loja, atualiza com inteligência!
      if (live.precoAtual && live.precoAtual > 0) {
        const prevAtual = Number(offer.precoAtual) || 0;
        const prevAntigo = Number(offer.precoAntigo) || 0;
        const newAtual = Number(live.precoAtual);

        let newAntigo = prevAntigo;
        if (live.precoAntigo && live.precoAntigo > newAtual) {
          newAntigo = Number(live.precoAntigo);
        } else if (newAtual < prevAtual) {
          // Preço caiu (ex: R$ 129 -> R$ 104): preserva o preço maior anterior como referência!
          newAntigo = Math.max(prevAntigo, prevAtual);
        } else if (newAntigo > 0 && newAtual >= newAntigo) {
          // Preço subiu acima do antigo riscado: remove preço riscado enganoso
          newAntigo = 0;
        }

        const newDiscount = calcDiscount(newAntigo, newAtual);

        if (Math.abs(newAtual - prevAtual) >= 0.01) {
          priceChanges.push({
            id: offer.id,
            titulo: offer.titulo,
            loja: offer.loja,
            de: prevAtual,
            para: newAtual,
          });
        }

        nextOffer = {
          ...nextOffer,
          precoAtual: newAtual,
          precoAntigo: newAntigo,
          descontoPercentual: newDiscount,
          verificadoEm: "Verificado hoje",
        };
      } else {
        skippedOffers.push({
          id: offer.id,
          titulo: offer.titulo,
          loja: offer.loja,
          motivo:
            offer.loja === "Shopee"
              ? "Shopee não expõe preço no HTML público (mantido preço cadastrado)"
              : "Preço não retornado nesta checagem (mantido preço atual)",
        });
      }

      // Atualiza prova social se encontrada
      if (live.nota) nextOffer.nota = live.nota;
      if (live.vendidos) nextOffer.vendidos = live.vendidos;

      updatedList.push(nextOffer);
    } catch (err) {
      // Erro de rede temporário -> mantém a oferta segura!
      updatedList.push(offer);
      skippedOffers.push({
        id: offer.id,
        titulo: offer.titulo,
        loja: offer.loja,
        motivo: `Erro temporário: ${err.message}`,
      });
    }

    // Pausa educada de 600ms entre requisições para não disparar rate limit nas lojas
    if (i < ofertas.length - 1) {
      await sleep(600);
    }
  }

  const hasChanges = priceChanges.length > 0 || removedOffers.length > 0;
  if (hasChanges || ofertas.length > 0) {
    await writeJsonData(
      "ofertas.json",
      updatedList,
      `Auditoria diaria de ofertas: ${priceChanges.length} precos atualizados, ${removedOffers.length} indisponiveis removidas`
    );
  }

  return {
    checkedCount: ofertas.length,
    activeCount: updatedList.length,
    priceChanges,
    removedOffers,
    skippedOffers,
    ofertas: updatedList,
  };
}
