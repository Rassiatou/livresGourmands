/**
 * Proxy Vercel : le front appelle /api/* sur le même domaine ;
 * les requêtes sont relayées vers LIVRES_BACKEND_ORIGIN (serveur Express, sans suffixe /api).
 * Définir LIVRES_BACKEND_ORIGIN dans les variables d’environnement du projet Vercel (ex. https://xxx.railway.app).
 */
export default async function handler(req, res) {
  const origin = process.env.LIVRES_BACKEND_ORIGIN?.replace(/\/$/, "");
  if (!origin) {
    res.status(503).json({
      error:
        "API indisponible : définissez LIVRES_BACKEND_ORIGIN sur Vercel (URL de votre backend Node, sans /api).",
    });
    return;
  }

  const rawUrl = req.url || "";
  const qIndex = rawUrl.indexOf("?");
  const search = qIndex >= 0 ? rawUrl.slice(qIndex + 1) : "";
  const sp = new URLSearchParams(search);
  let path = sp.get("path") ?? "";
  try {
    path = decodeURIComponent(path);
  } catch {
    /* path déjà décodé */
  }
  path = path.replace(/^\/+/, "");
  sp.delete("path");
  const backendQs = sp.toString();
  const target = `${origin}/api/${path}${backendQs ? `?${backendQs}` : ""}`;

  const skip = new Set([
    "host",
    "connection",
    "content-length",
    "transfer-encoding",
    "keep-alive",
  ]);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || skip.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  let body;
  if (req.method && !["GET", "HEAD"].includes(req.method)) {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
      req.on("error", reject);
    });
  }

  try {
    const r = await fetch(target, { method: req.method, headers, body, redirect: "follow" });
    res.status(r.status);
    r.headers.forEach((value, key) => {
      if (skip.has(key.toLowerCase())) return;
      res.setHeader(key, value);
    });
    const buf = Buffer.from(await r.arrayBuffer());
    res.send(buf);
  } catch (e) {
    console.error("PROXY_ERR", e);
    res.status(502).json({ error: "Impossible de joindre le backend." });
  }
}
