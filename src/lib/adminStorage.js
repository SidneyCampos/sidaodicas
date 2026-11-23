import fs from "fs/promises";
import path from "path";
import os from "os";

const REPO_OWNER = process.env.GITHUB_OWNER || "SidneyCampos";
const REPO_NAME = process.env.GITHUB_REPO || "sidaodicas";
const REPO_BRANCH = process.env.GITHUB_BRANCH || "main";

// Cache em memória de leitura (protege contra picos de tráfego viral e limites da API do GitHub)
const memoryCache = new Map();
const READ_CACHE_TTL_MS = 60 * 1000; // 60 segundos entre revalidações automáticas

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

  // Suporte escalável: se o JSON ultrapassar 1 MB, a API Contents omite `content` e fornece `download_url`
  if (!json.content && json.download_url) {
    const rawRes = await fetch(json.download_url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!rawRes.ok) return null;
    const rawText = await rawRes.text();
    return { data: JSON.parse(rawText), sha: json.sha };
  }

  if (!json.content) return null;

  const decoded = Buffer.from(json.content, "base64").toString("utf-8");
  return {
    data: JSON.parse(decoded),
    sha: json.sha,
  };
}

async function saveToGitHub(githubPath, data, commitMessage, retries = 2) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { savedToGitHub: false };

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "SidaoDicas-Admin",
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
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

    if (putRes.ok) {
      return { savedToGitHub: true };
    }

    // Retry automático em caso de conflito de SHA (409) por edições muito rápidas
    if (putRes.status === 409 && attempt < retries) {
      continue;
    }

    const errText = await putRes.text();
    throw new Error(`Erro GitHub API (${putRes.status}): ${errText}`);
  }

  return { savedToGitHub: false };
}

export async function readJsonData(filename, { bypassCache = false } = {}) {
  const now = Date.now();
  const cached = memoryCache.get(filename);

  if (!bypassCache && cached && now - cached.timestamp < READ_CACHE_TTL_MS) {
    return cached.data;
  }

  const { projectPath, tmpPath, githubPath } = getPaths(filename);

  // 1. Se houver GITHUB_TOKEN configurado na Vercel, lê a versão mais recente do repositório (com cache)
  if (process.env.GITHUB_TOKEN) {
    try {
      const gh = await fetchFromGitHub(githubPath);
      if (gh && gh.data && typeof gh.data === "object") {
        memoryCache.set(filename, { data: gh.data, timestamp: now });
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
    if (parsed && typeof parsed === "object") {
      memoryCache.set(filename, { data: parsed, timestamp: now });
      return parsed;
    }
  } catch {
    // Ignora se /tmp ainda não existir
  }

  // 3. Lê do arquivo local do projeto (src/data/*.json)
  try {
    const raw = await fs.readFile(projectPath, "utf-8");
    const parsed = JSON.parse(raw);
    memoryCache.set(filename, { data: parsed, timestamp: now });
    return parsed;
  } catch (err) {
    console.error(`Erro ao ler ${filename}:`, err);
    return filename.includes("Config") ? {} : [];
  }
}

export async function writeJsonData(filename, data, commitMessage) {
  const { projectPath, tmpPath, githubPath } = getPaths(filename);
  const formatted = JSON.stringify(data, null, 2) + "\n";

  // Atualiza cache em memória imediatamente para zero atraso na interface
  memoryCache.set(filename, { data, timestamp: Date.now() });

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

  // 3. Se GITHUB_TOKEN estiver configurado, comita direto no GitHub via API (com retry contra conflito 409)
  if (process.env.GITHUB_TOKEN) {
    await saveToGitHub(githubPath, data, commitMessage);
  }
}
