import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "../../../../../lib/adminAuth";
import { syncAndAuditAllOffers } from "../../../../../lib/offerAutoSync";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const result = await syncAndAuditAllOffers();
    revalidatePath("/");

    const parts = [
      `✅ ${result.checkedCount} ofertas auditadas`,
      `${result.priceChanges.length} preço(s) atualizado(s)`,
      `${result.removedOffers.length} indisponível(is) excluída(s)`,
    ];

    const detailLines = [];
    for (const c of result.priceChanges) {
      detailLines.push(
        `💰 Preço alterado (${c.loja}): ${c.titulo.slice(0, 48)} — R$ ${c.de.toFixed(
          2
        )} → R$ ${c.para.toFixed(2)}`
      );
    }
    for (const r of result.removedOffers) {
      detailLines.push(
        `🗑️ Excluída (${r.loja}): ${r.titulo.slice(0, 48)} — ${r.motivo}`
      );
    }
    for (const s of result.skippedOffers) {
      detailLines.push(
        `ℹ️ Mantida (${s.loja || "Loja"}): ${s.titulo.slice(0, 48)} — ${s.motivo}`
      );
    }

    return NextResponse.json({
      success: true,
      message: parts.join(" • "),
      details: detailLines.join("\n"),
      ...result,
    });
  } catch (error) {
    console.error("Erro ao auditar ofertas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Falha ao atualizar preços das ofertas.",
      },
      { status: 500 }
    );
  }
}
