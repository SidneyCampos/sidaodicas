import { NextResponse } from "next/server";
import { syncAndPersistCoupons } from "../../../../lib/couponAutoSync";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Permite execução automática via Vercel Cron ou com CRON_SECRET opcional
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }

  try {
    const result = await syncAndPersistCoupons();
    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
      totalSynced: result.totalSynced,
      byStore: result.byStore,
    });
  } catch (error) {
    console.error("Erro no cron de cupons:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
