import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncAndAuditAllOffers } from "../../../../lib/offerAutoSync";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  try {
    const result = await syncAndAuditAllOffers();
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      auditedAt: new Date().toISOString(),
      checkedCount: result.checkedCount,
      activeCount: result.activeCount,
      updatedPrices: result.priceChanges.length,
      removedCount: result.removedOffers.length,
    });
  } catch (error) {
    console.error("Erro no cron de ofertas:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
