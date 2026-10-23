/**
 * AgriMan Worker: /api/* cloud ledger + static site assets.
 * Bind D1 as env.DB after this Worker (not static-only) is deployed.
 */

const enc = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function err(code, status = 400) {
  return json({ error: code }, status);
}

function b64(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hashPassword(password, saltBytes) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 120000, hash: "SHA-256" },
    key,
    256
  );
  return b64(bits);
}

function newToken() {
  return crypto.randomUUID();
}

function generateFarmId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let body = "";
  for (let i = 0; i < 6; i++) body += alphabet[bytes[i] % alphabet.length];
  return `AM-${body}`;
}

async function ensureSchema(db) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS farms (
        farm_id TEXT PRIMARY KEY,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        farm_id TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    `),
  ]);
}

function expiryIso(days = 180) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function handleHealth(env) {
  if (!env.DB) return json({ ok: false, error: "DB_NOT_BOUND" }, 503);
  try {
    await ensureSchema(env.DB);
    return json({ ok: true, provider: "cloudflare-d1" });
  } catch (e) {
    return json({ ok: false, error: "DB_ERROR", detail: String(e) }, 503);
  }
}

async function handleCreate(env, body) {
  const password = String(body?.password || "");
  if (password.length < 6) return err("WEAK_PASSWORD");
  await ensureSchema(env.DB);

  let farmId = "";
  let created = false;
  for (let i = 0; i < 8; i++) {
    farmId = generateFarmId();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);
    const data = body?.data && typeof body.data === "object" ? body.data : {};
    const updatedAt = new Date().toISOString();
    try {
      await env.DB.prepare(
        `INSERT INTO farms (farm_id, password_salt, password_hash, data, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(farmId, b64(salt), passwordHash, JSON.stringify(data), updatedAt)
        .run();
      created = true;
      break;
    } catch {
      // retry on id collision
    }
  }
  if (!created) return err("FARM_EXISTS", 409);

  const token = newToken();
  await env.DB.prepare(`INSERT INTO sessions (token, farm_id, expires_at) VALUES (?, ?, ?)`)
    .bind(token, farmId, expiryIso())
    .run();

  return json({
    farm_id: farmId,
    token,
    data: body?.data && typeof body.data === "object" ? body.data : {},
    updated_at: new Date().toISOString(),
  });
}

async function handleLogin(env, body) {
  const farmId = String(body?.farmId || body?.farm_id || "")
    .trim()
    .toUpperCase();
  const password = String(body?.password || "");
  if (!farmId || password.length < 6) return err("BAD_LOGIN", 401);

  await ensureSchema(env.DB);
  const row = await env.DB.prepare(
    `SELECT farm_id, password_salt, password_hash, data, updated_at FROM farms WHERE farm_id = ?`
  )
    .bind(farmId)
    .first();

  if (!row) return err("BAD_LOGIN", 401);
  const hash = await hashPassword(password, fromB64(row.password_salt));
  if (hash !== row.password_hash) return err("BAD_LOGIN", 401);

  const token = newToken();
  await env.DB.prepare(`INSERT INTO sessions (token, farm_id, expires_at) VALUES (?, ?, ?)`)
    .bind(token, row.farm_id, expiryIso())
    .run();

  let data = {};
  try {
    data = JSON.parse(row.data || "{}");
  } catch {
    data = {};
  }

  return json({
    farm_id: row.farm_id,
    token,
    data,
    updated_at: row.updated_at,
  });
}

async function sessionFarm(env, token) {
  if (!token) return null;
  await ensureSchema(env.DB);
  const sess = await env.DB.prepare(
    `SELECT token, farm_id, expires_at FROM sessions WHERE token = ?`
  )
    .bind(token)
    .first();
  if (!sess) return null;
  if (new Date(sess.expires_at).getTime() < Date.now()) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
    return null;
  }
  return sess;
}

async function handleLoad(env, body) {
  const sess = await sessionFarm(env, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  const row = await env.DB.prepare(
    `SELECT farm_id, data, updated_at FROM farms WHERE farm_id = ?`
  )
    .bind(sess.farm_id)
    .first();
  if (!row) return err("BAD_SESSION", 401);
  let data = {};
  try {
    data = JSON.parse(row.data || "{}");
  } catch {
    data = {};
  }
  return json({
    farm_id: row.farm_id,
    token: sess.token,
    data,
    updated_at: row.updated_at,
  });
}

async function handleSave(env, body) {
  const sess = await sessionFarm(env, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  const data = body?.data && typeof body.data === "object" ? body.data : {};
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(`UPDATE farms SET data = ?, updated_at = ? WHERE farm_id = ?`)
    .bind(JSON.stringify(data), updatedAt, sess.farm_id)
    .run();
  await env.DB.prepare(`UPDATE sessions SET expires_at = ? WHERE token = ?`)
    .bind(expiryIso(), sess.token)
    .run();
  return json({ farm_id: sess.farm_id, updated_at: updatedAt });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const parts = path.split("/").filter(Boolean);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      },
    });
  }

  if (parts[0] === "farm" && parts[1] === "health" && request.method === "GET") {
    return handleHealth(env);
  }

  if (!env.DB) return err("DB_NOT_BOUND", 503);
  if (parts[0] !== "farm" || request.method !== "POST") return err("NOT_FOUND", 404);

  const body = await readJson(request);
  if (!body) return err("BAD_JSON");

  switch (parts[1]) {
    case "create":
      return handleCreate(env, body);
    case "login":
      return handleLogin(env, body);
    case "load":
      return handleLoad(env, body);
    case "save":
      return handleSave(env, body);
    default:
      return err("NOT_FOUND", 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("ASSETS binding missing", { status: 500 });
  },
};
