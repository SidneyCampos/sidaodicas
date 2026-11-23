import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/adminAuth";
import { readJsonData, writeJsonData } from "../../../../lib/adminStorage";

const FILENAME = "cupons.json";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const cupons = await readJsonData(FILENAME);
  return NextResponse.json({ cupons });
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const cupons = await readJsonData(FILENAME);

    const novoCupom = {
      id: Date.now(),
      loja: body.loja || "Amazon",
      codigo: (body.codigo || "").trim().toUpperCase(),
      descricao: (body.descricao || "").trim(),
      linkAfiliadoLoja: (body.linkAfiliadoLoja || "").trim(),
      validade: (body.validade || "Ativo agora • Estoque limitado").trim(),
    };

    const atualizados = [novoCupom, ...cupons];
    await writeJsonData(
      FILENAME,
      atualizados,
      `Novo cupom: ${novoCupom.codigo}`
    );

    return NextResponse.json({
      success: true,
      cupom: novoCupom,
      cupons: atualizados,
    });
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao adicionar cupom." },
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
    const cupons = await readJsonData(FILENAME);

    const atualizados = cupons.map((item) => {
      if (String(item.id) !== String(body.id)) return item;
      return {
        ...item,
        loja: body.loja || item.loja,
        codigo:
          body.codigo !== undefined
            ? body.codigo.trim().toUpperCase()
            : item.codigo,
        descricao:
          body.descricao !== undefined
            ? body.descricao.trim()
            : item.descricao,
        linkAfiliadoLoja:
          body.linkAfiliadoLoja !== undefined
            ? body.linkAfiliadoLoja.trim()
            : item.linkAfiliadoLoja,
        validade:
          body.validade !== undefined ? body.validade.trim() : item.validade,
      };
    });

    await writeJsonData(
      FILENAME,
      atualizados,
      "Cupom atualizado via Painel Admin"
    );

    return NextResponse.json({
      success: true,
      cupons: atualizados,
    });
  } catch (error) {
    console.error("Erro ao editar cupom:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao atualizar cupom." },
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
        { error: "ID do cupom não informado." },
        { status: 400 }
      );
    }

    const cupons = await readJsonData(FILENAME);
    const atualizados = cupons.filter((item) => String(item.id) !== String(id));
    await writeJsonData(
      FILENAME,
      atualizados,
      "Cupom removido via Painel Admin"
    );

    return NextResponse.json({
      success: true,
      cupons: atualizados,
    });
  } catch (error) {
    console.error("Erro ao excluir cupom:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao remover cupom." },
      { status: 500 }
    );
  }
}
