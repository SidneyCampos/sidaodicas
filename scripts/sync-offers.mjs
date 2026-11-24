import { syncAndAuditAllOffers } from "../src/lib/offerAutoSync.js";

async function main() {
  console.log("🤖 Iniciando auditoria diária de preços e disponibilidade das ofertas...");
  const result = await syncAndAuditAllOffers();

  console.log(`✅ Verificadas: ${result.checkedCount} | Ativas: ${result.activeCount}`);
  if (result.priceChanges.length > 0) {
    console.log("💰 Preços atualizados:");
    for (const c of result.priceChanges) {
      console.log(`   - [${c.loja}] ${c.titulo}: R$ ${c.de} -> R$ ${c.para}`);
    }
  }
  if (result.removedOffers.length > 0) {
    console.log("🗑️ Ofertas removidas (indisponíveis):");
    for (const r of result.removedOffers) {
      console.log(`   - [${r.loja}] ${r.titulo} (${r.motivo})`);
    }
  }
  if (result.skippedOffers.length > 0) {
    console.log("ℹ️ Mantidas sem alteração:");
    for (const s of result.skippedOffers) {
      console.log(`   - [${s.loja || "Loja"}] ${s.titulo} (${s.motivo})`);
    }
  }
}

main().catch((err) => {
  console.error("❌ Erro na auditoria diária de ofertas:", err);
  process.exit(1);
});
