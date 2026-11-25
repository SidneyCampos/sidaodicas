import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "../../../../lib/adminAuth";
import {
  getStorageDiagnostics,
  mutateJsonData,
  readJsonData,
} from "../../../../lib/adminStorage";

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

  const storageStatus = getStorageDiagnostics();
  try {
    const ofertas = await readJsonData(FILENAME, { bypassCache: true });
    return NextResponse.json({
      ofertas: Array.isArray(ofertas) ? ofertas : [],
      storageStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Falha ao carregar ofertas.",
        ofertas: [],
        storageStatus,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();

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
      precoObs: (body.precoObs || "").trim(),
      precoTravado: Boolean(body.precoTravado),
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

    // Mutação atômica: sempre lê a versão mais fresca do GitHub/disco antes de adicionar!
    const atualizadas = await mutateJsonData(
      FILENAME,
      (current) => {
        const list = Array.isArray(current) ? current : [];
        return [novaOferta, ...list];
      },
      `Nova oferta: ${novaOferta.titulo.slice(0, 40)}`
    );

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      oferta: novaOferta,
      ofertas: atualizadas,
      storageStatus: getStorageDiagnostics(),
    });
  } catch (error) {
    console.error("Erro ao adicionar oferta:", error);
    return NextResponse.json(
      {
        error: error.message || "Falha ao salvar a nova oferta.",
        storageStatus: getStorageDiagnostics(),
      },
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

    // Ação: Mover oferta para o topo
    if (body.action === "move_to_top" && body.id !== undefined) {
      let found = false;
      const atualizadas = await mutateJsonData(
        FILENAME,
        (current) => {
          const list = Array.isArray(current) ? current : [];
          const targetIndex = list.findIndex(
            (item) => String(item.id) === String(body.id)
          );
          if (targetIndex === -1) return list;
          found = true;
          const target = {
            ...list[targetIndex],
            criadoEm: new Date().toISOString(),
            verificadoEm: "Verificado agora",
          };
          const remaining = list.filter(
            (item) => String(item.id) !== String(body.id)
          );
          return [target, ...remaining];
        },
        "Oferta movida para o topo via Painel Admin"
      );

      if (!found) {
        return NextResponse.json(
          { error: "Oferta não encontrada." },
          { status: 404 }
        );
      }

      revalidatePath("/");
      return NextResponse.json({
        success: true,
        ofertas: atualizadas,
      });
    }

    // Ação: Travar ou destravar preço manual (impede/libera alteração pelo robô diário)
    if (body.action === "toggle_price_lock" && body.id !== undefined) {
      let found = false;
      let nextLocked = false;
      const atualizadas = await mutateJsonData(
        FILENAME,
        (current) => {
          const list = Array.isArray(current) ? current : [];
          return list.map((item) => {
            if (String(item.id) !== String(body.id)) return item;
            found = true;
            nextLocked = !Boolean(item.precoTravado);
            return {
              ...item,
              precoTravado: nextLocked,
            };
          });
        },
        "Trava de preco manual alterada via Painel Admin"
      );

      if (!found) {
        return NextResponse.json(
          { error: "Oferta não encontrada." },
          { status: 404 }
        );
      }

      revalidatePath("/");
      return NextResponse.json({
        success: true,
        precoTravado: nextLocked,
        ofertas: atualizadas,
      });
    }

    // Ação: Editar dados de uma oferta existente
    const targetId = body.id;
    const atualizadas = await mutateJsonData(
      FILENAME,
      (current) => {
        const list = Array.isArray(current) ? current : [];
        return list.map((item) => {
          if (String(item.id) !== String(targetId)) return item;

          const precoAntigo =
            Number(body.precoAntigo ?? item.precoAntigo) || 0;
          const precoAtual = Number(body.precoAtual ?? item.precoAtual) || 0;

          return {
            ...item,
            titulo:
              body.titulo !== undefined ? body.titulo.trim() : item.titulo,
            subtitulo:
              body.subtitulo !== undefined
                ? body.subtitulo.trim()
                : item.subtitulo || "",
            precoAntigo,
            precoAtual,
            descontoPercentual: calcDiscount(precoAntigo, precoAtual),
            precoObs:
              body.precoObs !== undefined
                ? body.precoObs.trim()
                : item.precoObs || "",
            precoTravado:
              body.precoTravado !== undefined
                ? Boolean(body.precoTravado)
                : Boolean(item.precoTravado),
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
              body.imagemUrl !== undefined
                ? body.imagemUrl.trim()
                : item.imagemUrl,
            linkAfiliado:
              body.linkAfiliado !== undefined
                ? body.linkAfiliado.trim()
                : item.linkAfiliado,
            criadoEm: new Date().toISOString(),
            verificadoEm: "Verificado agora",
          };
        });
      },
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

    const atualizadas = await mutateJsonData(
      FILENAME,
      (current) => {
        const list = Array.isArray(current) ? current : [];
        return list.filter((item) => String(item.id) !== String(id));
      },
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
