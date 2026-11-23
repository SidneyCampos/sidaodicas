import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "../../../../lib/adminAuth";
import { readJsonData, writeJsonData } from "../../../../lib/adminStorage";

const FILENAME = "ofertas.json";

function calcDiscount(precoAntigo, precoAtual) {
  const oldP = Number(precoAntigo);
  const newP = Number(precoAtual);
  if (!Number.isNaN(oldP) && !Number.isNaN(newP) && oldP > newP && oldP > 0) {
    return Math.round(((oldP - newP) / oldP) * 100);
  }
  return 0;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ofertas = await readJsonData(FILENAME, { bypassCache: true });
  return NextResponse.json({ ofertas });
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ofertas = await readJsonData(FILENAME);

    const precoAntigo = Number(body.precoAntigo) || 0;
    const precoAtual = Number(body.precoAtual) || 0;
    const descontoPercentual = calcDiscount(precoAntigo, precoAtual);
    const nowIso = new Date().toISOString();

    const novaOferta = {
      id: Date.now(),
      titulo: (body.titulo || "").trim(),
      subtitulo: (body.subtitulo || "").trim(),
      precoAntigo,
      precoAtual,
      descontoPercentual,
      loja: body.loja || "Amazon",
      categoria: body.categoria || "Mais Vendidos",
      cupomOpcional: (body.cupomOpcional || "").trim().toUpperCase(),
      destaqueTag: body.destaqueTag || "OFERTA VERIFICADA",
      nota: (body.nota || "").trim(),
      vendidos: (body.vendidos || "").trim(),
      imagemUrl: (body.imagemUrl || "").trim(),
      linkAfiliado: (body.linkAfiliado || "").trim(),
      verificadoEm: "Verificado agora",
      criadoEm: nowIso,
    };

    const atualizadas = [novaOferta, ...ofertas];
    await writeJsonData(
      FILENAME,
      atualizadas,
      `Nova oferta: ${novaOferta.titulo.slice(0, 40)}`
    );
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      oferta: novaOferta,
      ofertas: atualizadas,
    });
  } catch (error) {
    console.error("Erro ao adicionar oferta:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao salvar a nova oferta." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ofertas = await readJsonData(FILENAME);

    // Ação: Mover oferta para o topo
    if (body.action === "move_to_top" && body.id !== undefined) {
      const targetIndex = ofertas.findIndex(
        (item) => String(item.id) === String(body.id)
      );
      if (targetIndex === -1) {
        return NextResponse.json(
          { error: "Oferta não encontrada." },
          { status: 404 }
        );
      }

      const target = {
        ...ofertas[targetIndex],
        criadoEm: new Date().toISOString(),
        verificadoEm: "Verificado agora",
      };

      const remaining = ofertas.filter(
        (item) => String(item.id) !== String(body.id)
      );
      const atualizadas = [target, ...remaining];
      await writeJsonData(
        FILENAME,
        atualizadas,
        `Oferta movida para o topo: ${target.titulo.slice(0, 40)}`
      );
      revalidatePath("/");

      return NextResponse.json({
        success: true,
        ofertas: atualizadas,
      });
    }

    // Ação: Editar dados de uma oferta existente
    const targetId = body.id;
    const atualizadas = ofertas.map((item) => {
      if (String(item.id) !== String(targetId)) return item;

      const precoAntigo = Number(body.precoAntigo ?? item.precoAntigo) || 0;
      const precoAtual = Number(body.precoAtual ?? item.precoAtual) || 0;

      return {
        ...item,
        titulo: body.titulo !== undefined ? body.titulo.trim() : item.titulo,
        subtitulo:
          body.subtitulo !== undefined
            ? body.subtitulo.trim()
            : item.subtitulo || "",
        precoAntigo,
        precoAtual,
        descontoPercentual: calcDiscount(precoAntigo, precoAtual),
        loja: body.loja || item.loja,
        categoria: body.categoria || item.categoria,
        cupomOpcional:
          body.cupomOpcional !== undefined
            ? body.cupomOpcional.trim().toUpperCase()
            : item.cupomOpcional,
        destaqueTag: body.destaqueTag || item.destaqueTag,
        nota: body.nota !== undefined ? body.nota.trim() : item.nota || "",
        vendidos:
          body.vendidos !== undefined
            ? body.vendidos.trim()
            : item.vendidos || "",
        imagemUrl:
          body.imagemUrl !== undefined ? body.imagemUrl.trim() : item.imagemUrl,
        linkAfiliado:
          body.linkAfiliado !== undefined
            ? body.linkAfiliado.trim()
            : item.linkAfiliado,
        criadoEm: new Date().toISOString(),
        verificadoEm: "Verificado agora",
      };
    });

    await writeJsonData(
      FILENAME,
      atualizadas,
      "Oferta editada via Painel Admin"
    );
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      ofertas: atualizadas,
    });
  } catch (error) {
    console.error("Erro ao atualizar oferta:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar a oferta." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID da oferta não informado." },
        { status: 400 }
      );
    }

    const ofertas = await readJsonData(FILENAME);
    const atualizadas = ofertas.filter((item) => String(item.id) !== String(id));
    await writeJsonData(
      FILENAME,
      atualizadas,
      "Oferta removida via Painel Admin"
    );
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      ofertas: atualizadas,
    });
  } catch (error) {
    console.error("Erro ao remover oferta:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao excluir a oferta." },
      { status: 500 }
    );
  }
}
