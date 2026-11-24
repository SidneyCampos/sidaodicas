import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/adminAuth";
import { extractProductFromUrl } from "../../../../lib/productExtractor";

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    const trimmedUrl = String(url || "").trim();

    if (!trimmedUrl || !/^https?:\/\//i.test(trimmedUrl)) {
      return NextResponse.json(
        {
          error:
            "Informe um link de associado válido começando com http:// ou https://",
        },
        { status: 400 }
      );
    }

    const result = await extractProductFromUrl(trimmedUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro crítico no extrator:", error);
    return NextResponse.json(
      {
        success: false,
        loadedFields: [],
        missingFields: [
          "Loja",
          "Título do Produto",
          "URL da Imagem (Foto)",
          "Preço Atual",
          "Preço Antigo",
          "Nota",
          "Qtd. Vendidos",
        ],
        warningMessage:
          "Não foi possível ler a página do link informado. Preencha os campos manualmente.",
      },
      { status: 200 }
    );
  }
}
