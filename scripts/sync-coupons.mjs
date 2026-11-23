import { syncAndPersistCoupons } from "../src/lib/couponAutoSync.js";

async function main() {
  console.log("🤖 Iniciando sincronização automática diária de cupons...");
  const result = await syncAndPersistCoupons();
  console.log(
    `✅ Concluído! ${result.totalSynced} cupons ativos sincronizados:`,
    result.byStore
  );
}

main().catch((err) => {
  console.error("❌ Erro na sincronização automática de cupons:", err);
  process.exit(1);
});
