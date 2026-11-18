import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const CUPONS_PATH = path.join(process.cwd(), "src", "data", "cupons.json");

function isProduction() {
  return process.env.NODE_ENV === "production";
}

async function readCupons() {
  try {
    const raw = await fs.readFile(CUPONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao ler cupons.json:", err);
    return [];
  }
}

async function writeCupons(cupons) {
  await fs.writeFile(CUPONS_PATH, JSON.stringify(cupons, null, 2) + "\n", "utf-8");
}

export async function GET() {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const cupons = await readCupons();
  return NextResponse.json({ cupons });
}

export async function POST(request) {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const cupons = await readCupons();

    const novoCupom = {
      id: Date.now(),
      loja: body.loja || "Amazon",
      codigo: (body.codigo || "").trim().toUpperCase(),
      descricao: (body.descricao || "").trim(),
      linkAfiliadoLoja: (body.linkAfiliadoLoja || "").trim(),
      validade: (body.validade || "Ativo agora • Estoque limitado").trim(),
    };

    const atualizados = [novoCupom, ...cupons];
    await writeCupons(atualizados);

    return NextResponse.json({
      success: true,
      cupom: novoCupom,
      cupons: atualizados,
    });
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return NextResponse.json(
      { error: "Falha ao adicionar cupom." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const cupons = await readCupons();

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

    await writeCupons(atualizados);

    return NextResponse.json({
      success: true,
      cupons: atualizados,
    });
  } catch (error) {
    console.error("Erro ao editar cupom:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar cupom." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
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

    const cupons = await readCupons();
    const atualizados = cupons.filter((item) => String(item.id) !== String(id));
    await writeCupons(atualizados);

    return NextResponse.json({
      success: true,
      cupons: atualizados,
    });
  } catch (error) {
    console.error("Erro ao excluir cupom:", error);
    return NextResponse.json(
      { error: "Falha ao remover cupom." },
      { status: 500 }
    );
  }
}
