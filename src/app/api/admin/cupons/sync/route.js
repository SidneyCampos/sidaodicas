import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../../lib/adminAuth";
import { writeJsonData } from "../../../../../lib/adminStorage";
import {
  getAffiliateConfig,
  syncAndPersistCoupons,
} from "../../../../../lib/couponAutoSync";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const config = await getAffiliateConfig();
  return NextResponse.json({ config });
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    // Se o usuário enviou novos links padrão de afiliado, salva antes de sincronizar
    if (body.config) {
      const current = await getAffiliateConfig();
      const updatedConfig = {
        ...current,
        Amazon: (body.config.Amazon || current.Amazon).trim(),
        "Mercado Livre": (
          body.config["Mercado Livre"] || current["Mercado Livre"]
        ).trim(),
        Shopee: (body.config.Shopee || current.Shopee).trim(),
        autoSyncEnabled:
          body.config.autoSyncEnabled !== undefined
            ? Boolean(body.config.autoSyncEnabled)
            : true,
      };
      await writeJsonData(
        "affiliateConfig.json",
        updatedConfig,
        "Atualizacao dos links de afiliado para cupons automaticos"
      );

      if (body.onlySaveConfig) {
        return NextResponse.json({
          success: true,
          config: updatedConfig,
          message: "✅ Links padrão de afiliado salvos com sucesso!",
        });
      }
    }

    const result = await syncAndPersistCoupons();
    const updatedConfig = await getAffiliateConfig();

    return NextResponse.json({
      success: true,
      ...result,
      config: updatedConfig,
      message:
        result.totalSynced > 0
          ? `🤖 ${result.totalSynced} cupons ativos encontrados automaticamente (Amazon: ${result.byStore.Amazon}, Mercado Livre: ${result.byStore["Mercado Livre"]}, Shopee: ${result.byStore.Shopee}) usando os seus links de afiliado!`
          : "Nenhum cupom público novo encontrado neste momento. Seus cupons atuais foram mantidos.",
    });
  } catch (error) {
    console.error("Erro na sincronização automática de cupons:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao buscar cupons automaticamente.",
      },
      { status: 500 }
    );
  }
}
