import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { exec } from "child_process";
import util from "util";
import { isAuthenticated } from "../../../../lib/adminAuth";
import {
  getStorageDiagnostics,
  readJsonData,
  writeJsonData,
} from "../../../../lib/adminStorage";

const execPromise = util.promisify(exec);

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const diag = getStorageDiagnostics();

  if (diag.mode === "ephemeral_error") {
    return NextResponse.json(
      {
        success: false,
        error:
          "⚠️ GITHUB_TOKEN não está configurado na Vercel! Adicione a variável GITHUB_TOKEN em Settings → Environment Variables na Vercel e faça Redeploy para salvar ofertas na nuvem.",
      },
      { status: 400 }
    );
  }

  // Se estiver na nuvem (Vercel) com GITHUB_TOKEN configurado, revalida a vitrine e confirma sincronia
  if (diag.mode === "github") {
    try {
      const [ofertas, cupons] = await Promise.all([
        readJsonData("ofertas.json", { bypassCache: true }),
        readJsonData("cupons.json", { bypassCache: true }),
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
      revalidatePath("/");

      return NextResponse.json({
        success: true,
        message:
          "✅ Sincronizado direto na nuvem! Suas ofertas já estão salvas no GitHub e atualizadas no site oficial.",
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: err.message || "Falha ao sincronizar com o GitHub API.",
        },
        { status: 500 }
      );
    }
  }

  // Caso esteja rodando localmente em um PC com Git instalado
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

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível publicar automaticamente via Git.",
        details: combinedOutput.trim(),
      },
      { status: 500 }
    );
  }
}
