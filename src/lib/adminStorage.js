import fs from "fs/promises";
import path from "path";

const REPO_OWNER = (process.env.GITHUB_OWNER || "SidneyCampos").trim();
const REPO_NAME = (process.env.GITHUB_REPO || "sidaodicas").trim();
const REPO_BRANCH = (process.env.GITHUB_BRANCH || "main").trim();

// Cache curto de leitura pública (10s): protege contra picos virais e atualiza o site quase na hora
const memoryCache = new Map();
const READ_CACHE_TTL_MS = 10 * 1000;

export function getStorageDiagnostics() {
  const hasGitHubToken = Boolean(
    process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim().length > 10
  );
  const isVercel = Boolean(process.env.VERCEL);

  let mode = "local";
  if (hasGitHubToken) {
    mode = "github";
  } else if (isVercel) {
    mode = "ephemeral_error";
  }

  return {
    mode,
    githubConfigured: hasGitHubToken,
    isVercel,
    repo: `${REPO_OWNER}/${REPO_NAME}`,
    branch: REPO_BRANCH,
  };
}

function getPaths(filename) {
  const projectPath = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "src",
    "data",
    filename
  );
  const githubPath = `src/data/${filename}`;
  return { projectPath, githubPath };
}

function getDefaultData(filename) {
  return filename.includes("Config") ? {} : [];
}

async function fetchFromGitHub(githubPath) {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  if (!token) return null;

  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "SidaoDicas-Admin",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  };

  // Cache-buster garante que o GitHub nunca entregue uma versão antiga em edições seguidas
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}?ref=${encodeURIComponent(
    REPO_BRANCH
  )}&_t=${Date.now()}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (res.status === 404) {
    return { data: null, sha: undefined, notFound: true };
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Falha ao ler ${githubPath} no GitHub (HTTP ${res.status}): ${errText.slice(0, 200)}`
    );
  }

  const json = await res.json();

  if (!json.content && json.download_url) {
    const rawRes = await fetch(`${json.download_url}?_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!rawRes.ok) {
      throw new Error(`Falha ao baixar arquivo grande do GitHub (${rawRes.status})`);
    }
    const rawText = await rawRes.text();
    return { data: JSON.parse(rawText), sha: json.sha };
  }

  if (!json.content) return { data: null, sha: json.sha };

  const decoded = Buffer.from(json.content, "base64").toString("utf-8");
  return {
    data: JSON.parse(decoded),
    sha: json.sha,
  };
}

async function putToGitHub(githubPath, data, sha, commitMessage) {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "SidaoDicas-Admin",
  };

  const contentBase64 = Buffer.from(
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  ).toString("base64");

  const putUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${githubPath}`;
  const body = {
    message: commitMessage || `Atualizacao de ${githubPath} via Painel Admin`,
    content: contentBase64,
    branch: REPO_BRANCH,
  };
  if (sha) {
    body.sha = sha;
  }

  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  return putRes;
}

export async function readJsonData(filename, { bypassCache = false } = {}) {
  const now = Date.now();
  const cached = memoryCache.get(filename);

  if (!bypassCache && cached && now - cached.timestamp < READ_CACHE_TTL_MS) {
    return cached.data;
  }

  const { projectPath, githubPath } = getPaths(filename);
  const { githubConfigured } = getStorageDiagnostics();

  // 1. Se GITHUB_TOKEN estiver configurado, o GitHub é a Fonte Única de Verdade (sincroniza todos os PCs e a Home!)
  if (githubConfigured) {
    try {
      const gh = await fetchFromGitHub(githubPath);
      if (gh && gh.data && typeof gh.data === "object") {
        memoryCache.set(filename, { data: gh.data, timestamp: now });
        return gh.data;
      }
    } catch (e) {
      console.warn(`Aviso ao ler ${filename} do GitHub:`, e.message);
      if (bypassCache) {
        // No modo admin (escrita), não mascara erro de leitura do GitHub com arquivo velho
        throw e;
      }
    }
  }

  // 2. Lê do arquivo local do projeto (src/data/*.json)
  try {
    const raw = await fs.readFile(projectPath, "utf-8");
    const parsed = JSON.parse(raw);
    memoryCache.set(filename, { data: parsed, timestamp: now });
    return parsed;
  } catch (err) {
    console.error(`Erro ao ler ${filename}:`, err);
    return getDefaultData(filename);
  }
}

/**
 * Operação ATÔMICA de Leitura -> Alteração -> Gravação.
 * Garante que adicionar o Produto #2 NUNCA apague o Produto #1, mesmo com cliques rápidos ou múltiplos containers.
 */
export async function mutateJsonData(
  filename,
  mutatorFn,
  commitMessage,
  retries = 3
) {
  const { projectPath, githubPath } = getPaths(filename);
  const diag = getStorageDiagnostics();

  // Bloqueia gravação fantasma na Vercel sem GITHUB_TOKEN (evita a ilusão de salvar em /tmp temporário!)
  if (diag.mode === "ephemeral_error") {
    throw new Error(
      "GITHUB_TOKEN não configurado na Vercel! Na Vercel o disco é somente leitura — sem o GITHUB_TOKEN nas Environment Variables, as ofertas somem ao trocar de servidor e não atualizam no site. Configure GITHUB_TOKEN na Vercel e faça Redeploy."
    );
  }

  // MODO NUVEM (GitHub API com leitura fresca + retry automático em caso de conflito 409)
  if (diag.mode === "github") {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const remote = await fetchFromGitHub(githubPath);
      let currentData = remote?.data;

      if (!currentData) {
        try {
          const localRaw = await fs.readFile(projectPath, "utf-8");
          currentData = JSON.parse(localRaw);
        } catch {
          currentData = getDefaultData(filename);
        }
      }

      const nextData = await mutatorFn(currentData);
      const putRes = await putToGitHub(
        githubPath,
        nextData,
        remote?.sha,
        commitMessage
      );

      if (putRes.ok) {
        memoryCache.set(filename, { data: nextData, timestamp: Date.now() });
        // Também tenta atualizar disco local se estiver rodando no PC com GITHUB_TOKEN
        try {
          await fs.writeFile(
            projectPath,
            JSON.stringify(nextData, null, 2) + "\n",
            "utf-8"
          );
        } catch {
          // Na Vercel o disco é read-only, ignorar silenciosamente
        }
        return nextData;
      }

      // Conflito de concorrência (409): re-lê a versão mais recente do GitHub e reaplica a mutação!
      if (putRes.status === 409 && attempt < retries) {
        continue;
      }

      const errText = await putRes.text().catch(() => "");
      if (putRes.status === 401 || putRes.status === 403) {
        throw new Error(
          `Seu GITHUB_TOKEN foi recusado pelo GitHub (HTTP ${putRes.status}). Verifique se o token não expirou e se tem permissão "Contents: Read and write" no repositório ${diag.repo}.`
        );
      }
      throw new Error(
        `Erro ao salvar no GitHub (HTTP ${putRes.status}): ${errText.slice(0, 220)}`
      );
    }
  }

  // MODO LOCAL (PC / servidor com disco gravável)
  let currentData;
  try {
    const raw = await fs.readFile(projectPath, "utf-8");
    currentData = JSON.parse(raw);
  } catch {
    currentData = getDefaultData(filename);
  }

  const nextData = await mutatorFn(currentData);
  const formatted = JSON.stringify(nextData, null, 2) + "\n";
  await fs.writeFile(projectPath, formatted, "utf-8");
  memoryCache.set(filename, { data: nextData, timestamp: Date.now() });
  return nextData;
}

export async function writeJsonData(filename, data, commitMessage) {
  return mutateJsonData(filename, () => data, commitMessage);
}
