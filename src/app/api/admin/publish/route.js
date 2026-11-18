import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export async function POST() {
  if (isProduction()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

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

    // Caso não haja alterações pendentes para commit, tenta apenas o git push para garantir sincronia
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
            "✅ Tudo sincronizado! As ofertas já estavam salvas no Git e a Vercel já está com a versão mais recente do site oficial.",
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

    console.error("Erro ao publicar via Git:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível concluir o Git Push automático. Verifique se o Git está autenticado neste computador.",
        details: combinedOutput.trim(),
      },
      { status: 500 }
    );
  }
}
