import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";
import { isAuthenticated } from "../../../../lib/adminAuth";
import { readJsonData, writeJsonData } from "../../../../lib/adminStorage";

const execPromise = util.promisify(exec);

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // Se estiver na nuvem (Vercel) com GITHUB_TOKEN configurado, sincroniza via API do GitHub
  if (process.env.GITHUB_TOKEN) {
    try {
      const [ofertas, cupons] = await Promise.all([
        readJsonData("ofertas.json"),
        readJsonData("cupons.json"),
      ]);
      await writeJsonData(
        "ofertas.json",
        ofertas,
        "Publicacao de ofertas via Painel Admin Web"
      );
      await writeJsonData(
        "cupons.json",
        cupons,
        "Publicacao de cupons via Painel Admin Web"
      );

      return NextResponse.json({
        success: true,
        message:
          "✅ Publicado direto na nuvem! Suas ofertas foram sincronizadas no GitHub e a Vercel já está atualizando o site para todos os dispositivos.",
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: "Falha ao sincronizar com o GitHub API.",
          details: err.message,
        },
        { status: 500 }
      );
    }
  }

  // Caso esteja rodando em um computador com Git instalado, executa o Git Push
  try {
    const command =
      'git add . && git commit -m "Atualizacao de ofertas via Painel Admin" && git push';

    const { stdout, stderr } = await execPromise(command, {
      cwd: process.cwd(),
    });

    return NextResponse.json({
      success: true,
      message:
        "✅ Publicado com sucesso! O Git Push foi concluído e a Vercel já está atualizando o site oficial.",
      details: stdout || stderr || "Deploy enviado para o repositório remoto.",
    });
  } catch (error) {
    const combinedOutput = `${error.stdout || ""}\n${error.stderr || ""}\n${
      error.message || ""
    }`;

    if (
      combinedOutput.includes("nothing to commit") ||
      combinedOutput.includes("nada a submeter")
    ) {
      try {
        const { stdout: pushOut, stderr: pushErr } = await execPromise(
          "git push",
          { cwd: process.cwd() }
        );
        return NextResponse.json({
          success: true,
          message:
            "✅ Tudo sincronizado! As ofertas já estão publicadas na versão mais recente.",
          details: pushOut || pushErr || "Everything up-to-date",
        });
      } catch (pushError) {
        return NextResponse.json(
          {
            success: false,
            error: "Falha ao executar git push.",
            details: pushError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "✅ Alterações salvas na sessão atual! (Para sincronizar permanente na nuvem sem precisar de Git instalado nos 3 PCs, adicione a variável GITHUB_TOKEN no painel da Vercel).",
    });
  }
}
