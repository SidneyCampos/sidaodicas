import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const OFERTAS_PATH = path.join(process.cwd(), "src", "data", "ofertas.json");

function isProduction() {
  return process.env.NODE_ENV === "production";
}

async function readOfertas() {
  try {
    const raw = await fs.readFile(OFERTAS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao ler ofertas.json:", err);
    return [];
  }
}

async function writeOfertas(ofertas) {
  await fs.writeFile(OFERTAS_PATH, JSON.stringify(ofertas, null, 2) + "\n", "utf-8");
}

function calcDiscount(precoAntigo, precoAtual) {
  const oldP = Number(precoAntigo);
  const newP = Number(precoAtual);
  if (!Number.isNaN(oldP) && !Number.isNaN(newP) && oldP > newP && oldP > 0) {
    return Math.round(((oldP - newP) / oldP) * 100);
  }
  return 0;
}

export async function GET() {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const ofertas = await readOfertas();
  return NextResponse.json({ ofertas });
}

export async function POST(request) {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const ofertas = await readOfertas();

    const precoAntigo = Number(body.precoAntigo) || 0;
    const precoAtual = Number(body.precoAtual) || 0;
    const descontoPercentual = calcDiscount(precoAntigo, precoAtual);
    const nowIso = new Date().toISOString();

    const novaOferta = {
      id: Date.now(),
      titulo: (body.titulo || "").trim(),
      precoAntigo,
      precoAtual,
      descontoPercentual,
      loja: body.loja || "Amazon",
      categoria: body.categoria || "Mais Vendidos",
      cupomOpcional: (body.cupomOpcional || "").trim().toUpperCase(),
      destaqueTag: body.destaqueTag || "OFERTA VERIFICADA",
      imagemUrl: (body.imagemUrl || "").trim(),
      linkAfiliado: (body.linkAfiliado || "").trim(),
      verificadoEm: "Verificado agora",
      criadoEm: nowIso,
    };

    const atualizadas = [novaOferta, ...ofertas];
    await writeOfertas(atualizadas);

    return NextResponse.json({
      success: true,
      oferta: novaOferta,
      ofertas: atualizadas,
    });
  } catch (error) {
    console.error("Erro ao adicionar oferta:", error);
    return NextResponse.json(
      { error: "Falha ao salvar a nova oferta." },
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
    const ofertas = await readOfertas();

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
      await writeOfertas(atualizadas);

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

    await writeOfertas(atualizadas);

    return NextResponse.json({
      success: true,
      ofertas: atualizadas,
    });
  } catch (error) {
    console.error("Erro ao atualizar oferta:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar a oferta." },
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
        { error: "ID da oferta não informado." },
        { status: 400 }
      );
    }

    const ofertas = await readOfertas();
    const atualizadas = ofertas.filter((item) => String(item.id) !== String(id));
    await writeOfertas(atualizadas);

    return NextResponse.json({
      success: true,
      ofertas: atualizadas,
    });
  } catch (error) {
    console.error("Erro ao remover oferta:", error);
    return NextResponse.json(
      { error: "Falha ao excluir a oferta." },
      { status: 500 }
    );
  }
}
