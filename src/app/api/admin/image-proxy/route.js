import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/adminAuth";

export async function GET(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json(
      { error: "URL da imagem inválida." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/jpeg,image/png,*/*",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Falha ao baixar imagem (${response.status}).` },
          { status: 502 }
        );
      }

      const contentType =
        response.headers.get("content-type") || "image/jpeg";
      const arrayBuffer = await response.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.warn("Erro no image-proxy:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a imagem pelo proxy." },
      { status: 502 }
    );
  }
}
