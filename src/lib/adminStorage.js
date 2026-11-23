import fs from "fs/promises";
import path from "path";
import os from "os";

const REPO_OWNER = process.env.GITHUB_OWNER || "SidneyCampos";
const REPO_NAME = process.env.GITHUB_REPO || "sidaodicas";
const REPO_BRANCH = process.env.GITHUB_BRANCH || "main";

function getPaths(filename) {
  const projectPath = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "src",
    "data",
    filename
  );
  const tmpPath = path.join(os.tmpdir(), `sidaodicas_${filename}`);
  const githubPath = `src/data/${filename}`;
  return { projectPath, tmpPath, githubPath };
}

async function fetchFromGitHub(githubPath) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SidaoDicas-Admin",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}?ref=${REPO_BRANCH}`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) return null;

  const json = await res.json();
  if (!json.content) return null;

  const decoded = Buffer.from(json.content, "base64").toString("utf-8");
  return {
    data: JSON.parse(decoded),
    sha: json.sha,
  };
}

async function saveToGitHub(githubPath, data, commitMessage) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { savedToGitHub: false };

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "SidaoDicas-Admin",
  };

  const getUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}?ref=${REPO_BRANCH}`;
  let sha;
  const getRes = await fetch(getUrl, { headers, cache: "no-store" });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const contentBase64 = Buffer.from(
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  ).toString("base64");

  const putUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: commitMessage || `Atualizacao de ${githubPath} via Painel Admin`,
      content: contentBase64,
      sha,
      branch: REPO_BRANCH,
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`Erro GitHub API: ${errText}`);
  }

  return { savedToGitHub: true };
}

export async function readJsonData(filename) {
  const { projectPath, tmpPath, githubPath } = getPaths(filename);

  // 1. Se houver GITHUB_TOKEN configurado na Vercel, lê a versão mais recente do repositório
  if (process.env.GITHUB_TOKEN) {
    try {
      const gh = await fetchFromGitHub(githubPath);
      if (gh && gh.data && typeof gh.data === "object") {
        return gh.data;
      }
    } catch (e) {
      console.warn(`Aviso ao ler ${filename} do GitHub:`, e);
    }
  }

  // 2. Verifica se existe cache atualizado em /tmp (para ambiente serverless sem GITHUB_TOKEN)
  try {
    const tmpRaw = await fs.readFile(tmpPath, "utf-8");
    const parsed = JSON.parse(tmpRaw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // Ignora se /tmp ainda não existir
  }

  // 3. Lê do arquivo local do projeto (src/data/*.json)
  try {
    const raw = await fs.readFile(projectPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erro ao ler ${filename}:`, err);
    return [];
  }
}

export async function writeJsonData(filename, data, commitMessage) {
  const { projectPath, tmpPath, githubPath } = getPaths(filename);
  const formatted = JSON.stringify(data, null, 2) + "\n";

  // 1. Tenta salvar no arquivo local do projeto (funciona em servidor próprio/PC)
  try {
    await fs.writeFile(projectPath, formatted, "utf-8");
  } catch {
    // Em ambiente Serverless (Vercel), o diretório de build é read-only
  }

  // 2. Salva também em /tmp para atualização imediata na instância atual
  try {
    await fs.writeFile(tmpPath, formatted, "utf-8");
  } catch {
    // Ignora falha em /tmp
  }

  // 3. Se GITHUB_TOKEN estiver configurado, comita direto no GitHub via API (sincroniza entre todos os 3 PCs!)
  if (process.env.GITHUB_TOKEN) {
    await saveToGitHub(githubPath, data, commitMessage);
  }
}
