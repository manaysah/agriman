/**
 * AgriMan Worker: farmer accounts, multi-farm D1, /api/* + static assets.
 */

const enc = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
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
    { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return b64(bits);
}

function newToken() {
  return crypto.randomUUID();
}

function generateFarmerId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let body = "";
  for (let i = 0; i < 6; i++) body += alphabet[bytes[i] % alphabet.length];
  return `AgriBakMan-${body}`;
}

function generateCropFarmId() {
  return `F-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/** Accept AgriBakMan-XXX or legacy AM-XXX (maps to AgriBakMan-XXX). */
function canonicalFarmerId(raw) {
  const t = String(raw || "").trim();
  if (!t) return "";
  const u = t.toUpperCase();
  if (u.startsWith("AM-")) return `AgriBakMan-${u.slice(3)}`;
  if (u.startsWith("AGRIBAKMAN-")) return `AgriBakMan-${u.slice(11)}`;
  return t;
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

async function tableHasColumn(db, table, column) {
  const rows = await db.prepare(`PRAGMA table_info(${table})`).all();
  const list = rows?.results || [];
  return list.some((r) => r.name === column);
}

async function ensureSchema(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS farmers (
        farmer_id TEXT PRIMARY KEY,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        created_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS farmer_sessions (
        token TEXT PRIMARY KEY,
        farmer_id TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS crop_farms (
        farm_id TEXT PRIMARY KEY,
        farmer_id TEXT NOT NULL,
        name TEXT NOT NULL,
        crop TEXT,
        started_at TEXT NOT NULL,
        data TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`
    )
    .run();

  await migrateLegacySingleFarm(db);
}

async function migrateLegacySingleFarm(db) {
  const done = await db.prepare(`SELECT value FROM app_meta WHERE key = 'legacy_migrated'`).first();
  if (done?.value === "1") return;

  const hasLegacy = await tableHasColumn(db, "farms", "password_hash");
  if (!hasLegacy) {
    await db
      .prepare(`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('legacy_migrated', '1')`)
      .run();
    return;
  }

  const rows = await db
    .prepare(`SELECT farm_id, password_salt, password_hash, data, updated_at FROM farms`)
    .all();
  const list = rows?.results || [];

  for (const row of list) {
    const legacyId = String(row.farm_id || "").toUpperCase();
    const suffix = legacyId.startsWith("AM-") ? legacyId.slice(3) : legacyId.replace(/^AGRIBAKMAN-/, "");
    const farmerId = `AgriBakMan-${suffix}`;
    const existing = await db
      .prepare(`SELECT farmer_id FROM farmers WHERE farmer_id = ?`)
      .bind(farmerId)
      .first();
    if (!existing) {
      await db
        .prepare(
          `INSERT INTO farmers (farmer_id, password_salt, password_hash, email, phone, created_at)
           VALUES (?, ?, ?, NULL, NULL, ?)`
        )
        .bind(farmerId, row.password_salt, row.password_hash, row.updated_at || new Date().toISOString())
        .run();
    }

    let data = {};
    try {
      data = JSON.parse(row.data || "{}");
    } catch {
      data = {};
    }
    const name = String(data?.settings?.seasonName || "My farm").slice(0, 120);
    const cropFarmId = generateCropFarmId();
    const startedAt = pickStartedAt(data);
    await db
      .prepare(
        `INSERT INTO crop_farms (farm_id, farmer_id, name, crop, started_at, data, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        cropFarmId,
        farmerId,
        name,
        "",
        startedAt,
        JSON.stringify(data),
        row.updated_at || new Date().toISOString()
      )
      .run();
  }

  await db.prepare(`DROP TABLE IF EXISTS sessions`).run();
  await db.prepare(`DROP TABLE IF EXISTS farms`).run();
  await db
    .prepare(`INSERT OR REPLACE INTO app_meta (key, value) VALUES ('legacy_migrated', '1')`)
    .run();
}

function pickStartedAt(data) {
  const dates = [];
  for (const e of data?.expenses || []) if (e?.date) dates.push(e.date);
  for (const m of data?.markets || []) if (m?.date) dates.push(m.date);
  dates.sort();
  return dates[0] || new Date().toISOString().slice(0, 10);
}

function summarizeFarm(data) {
  const expenses = (data?.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const procurements = (data?.procurements || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const revenue = (data?.markets || []).reduce((s, m) => s + (Number(m.revenue) || 0), 0);
  const transport = (data?.markets || []).reduce((s, m) => s + (Number(m.transport) || 0), 0);
  const allCosts = expenses + procurements + transport;
  return {
    expenses: allCosts,
    revenue,
    profit: revenue - allCosts,
  };
}

async function sessionFarmer(db, token) {
  if (!token) return null;
  const sess = await db
    .prepare(`SELECT token, farmer_id, expires_at FROM farmer_sessions WHERE token = ?`)
    .bind(token)
    .first();
  if (!sess) return null;
  if (new Date(sess.expires_at).getTime() < Date.now()) {
    await db.prepare(`DELETE FROM farmer_sessions WHERE token = ?`).bind(token).run();
    return null;
  }
  return sess;
}

async function createFarmerSession(db, farmerId) {
  const token = newToken();
  await db
    .prepare(`INSERT INTO farmer_sessions (token, farmer_id, expires_at) VALUES (?, ?, ?)`)
    .bind(token, farmerId, expiryIso())
    .run();
  return token;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sendWelcomeEmail(env, { email, farmerId, password }) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_NOT_CONFIGURED" };
  if (!email) return { sent: false, reason: "NO_EMAIL" };
  const from = env.EMAIL_FROM || "AgriMan <onboarding@resend.dev>";
  const text = [
    "Welcome to AgriMan!",
    "",
    `FarmerID: ${farmerId}`,
    `Password: ${password}`,
    "",
    "Log in at https://agriman.agribakr.workers.dev/",
    "",
    "Keep these credentials safe. Anyone with your FarmerID and password can access your farms.",
  ].join("\n");
  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1c1712">
<p>Welcome to <strong>AgriMan</strong>!</p>
<p><strong>FarmerID:</strong> ${escapeHtml(farmerId)}<br/>
<strong>Password:</strong> ${escapeHtml(password)}</p>
<p><a href="https://agriman.agribakr.workers.dev/">Open AgriMan</a></p>
<p style="color:#6d6458;font-size:14px;">Keep these credentials safe. Anyone with your FarmerID and password can access your farms.</p>
</body></html>`;
  const body = {
    from,
    to: [email],
    subject: "Your AgriMan FarmerID and password",
    text,
    html,
  };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { sent: false, reason: detail.slice(0, 300) };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: String(e?.message || e) };
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleHealth(env) {
  if (!env.DB) return json({ ok: false, error: "DB_NOT_BOUND" }, 503);
  try {
    await ensureSchema(env.DB);
    return json({ ok: true, provider: "cloudflare-d1", version: 2, email_ready: Boolean(env.RESEND_API_KEY) });
  } catch (e) {
    return json({ ok: false, error: "DB_ERROR", detail: String(e) }, 503);
  }
}

async function handleFarmerRegister(env, body) {
  const password = String(body?.password || "");
  const email = String(body?.email || "").trim().toLowerCase() || null;
  if (password.length < 6) return err("WEAK_PASSWORD");
  if (!email) return err("EMAIL_REQUIRED");
  if (!isValidEmail(email)) return err("INVALID_EMAIL");

  await ensureSchema(env.DB);

  let farmerId = "";
  let lastDetail = "";
  for (let i = 0; i < 8; i++) {
    farmerId = generateFarmerId();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);
    const createdAt = new Date().toISOString();
    try {
      const insert = await env.DB.prepare(
        `INSERT INTO farmers (farmer_id, password_salt, password_hash, email, phone, created_at)
         VALUES (?, ?, ?, ?, NULL, ?)`
      )
        .bind(farmerId, b64(salt), passwordHash, email, createdAt)
        .run();
      if (!insert?.success) {
        lastDetail = JSON.stringify(insert);
        continue;
      }
      const token = await createFarmerSession(env.DB, farmerId);
      const emailResult = await sendWelcomeEmail(env, { email, farmerId, password });
      return json({
        farmer_id: farmerId,
        token,
        email_sent: emailResult.sent === true,
        email_status: emailResult.sent ? "sent" : emailResult.reason || "skipped",
      });
    } catch (e) {
      lastDetail = String(e?.message || e);
    }
  }
  return json({ error: "REGISTER_FAILED", detail: lastDetail }, 500);
}

async function handleFarmerLogin(env, body) {
  const password = String(body?.password || "");
  const farmerId = canonicalFarmerId(
    body?.farmerId || body?.farmer_id || body?.farmId || body?.farm_id
  );
  if (!farmerId || password.length < 6) return err("BAD_LOGIN", 401);

  await ensureSchema(env.DB);
  const row = await env.DB.prepare(
    `SELECT farmer_id, password_salt, password_hash FROM farmers WHERE farmer_id = ?`
  )
    .bind(farmerId)
    .first();
  if (!row) return err("BAD_LOGIN", 401);
  const hash = await hashPassword(password, fromB64(row.password_salt));
  if (hash !== row.password_hash) return err("BAD_LOGIN", 401);

  const token = await createFarmerSession(env.DB, row.farmer_id);
  return json({ farmer_id: row.farmer_id, token });
}

async function handleFarmsList(env, body) {
  const sess = await sessionFarmer(env.DB, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  const rows = await env.DB.prepare(
    `SELECT farm_id, name, crop, started_at, data, updated_at FROM crop_farms WHERE farmer_id = ? ORDER BY started_at DESC`
  )
    .bind(sess.farmer_id)
    .all();
  const farms = (rows?.results || []).map((r) => {
    let data = {};
    try {
      data = JSON.parse(r.data || "{}");
    } catch {
      data = {};
    }
    const sum = summarizeFarm(data);
    return {
      farm_id: r.farm_id,
      name: r.name,
      crop: r.crop || "",
      started_at: r.started_at,
      updated_at: r.updated_at,
      profit: sum.profit,
      expenses: sum.expenses,
      revenue: sum.revenue,
    };
  });
  return json({ farmer_id: sess.farmer_id, token: sess.token, farms });
}

async function handleFarmsCreate(env, body) {
  const sess = await sessionFarmer(env.DB, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  const name = String(body?.name || "Farm").trim().slice(0, 120) || "Farm";
  const crop = String(body?.crop || "").trim().slice(0, 80);
  const startedAt = String(body?.started_at || new Date().toISOString().slice(0, 10));
  const data =
    body?.data && typeof body.data === "object"
      ? body.data
      : {
          settings: { seasonName: name, currency: "JD", language: "en" },
          expenses: [],
          markets: [],
          plans: [],
          procurements: [],
        };
  const farmId = generateCropFarmId();
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO crop_farms (farm_id, farmer_id, name, crop, started_at, data, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(farmId, sess.farmer_id, name, crop, startedAt, JSON.stringify(data), updatedAt)
    .run();
  return json({ farm_id: farmId, name, crop, started_at: startedAt, updated_at: updatedAt, data });
}

async function assertFarmAccess(db, farmerId, farmId) {
  const row = await db
    .prepare(`SELECT farm_id, data, updated_at, name, crop, started_at FROM crop_farms WHERE farm_id = ? AND farmer_id = ?`)
    .bind(farmId, farmerId)
    .first();
  return row || null;
}

async function handleFarmsLoad(env, body) {
  const sess = await sessionFarmer(env.DB, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  const farmId = String(body?.farm_id || body?.farmId || "");
  if (!farmId) return err("BAD_FARM", 400);
  const row = await assertFarmAccess(env.DB, sess.farmer_id, farmId);
  if (!row) return err("BAD_FARM", 404);
  let data = {};
  try {
    data = JSON.parse(row.data || "{}");
  } catch {
    data = {};
  }
  return json({
    farm_id: row.farm_id,
    name: row.name,
    crop: row.crop,
    started_at: row.started_at,
    token: sess.token,
    farmer_id: sess.farmer_id,
    data,
    updated_at: row.updated_at,
  });
}

async function handleFarmsSave(env, body) {
  const sess = await sessionFarmer(env.DB, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  const farmId = String(body?.farm_id || body?.farmId || "");
  if (!farmId) return err("BAD_FARM", 400);
  const row = await assertFarmAccess(env.DB, sess.farmer_id, farmId);
  if (!row) return err("BAD_FARM", 404);
  const data = body?.data && typeof body.data === "object" ? body.data : {};
  const updatedAt = new Date().toISOString();
  const name = String(body?.name || row.name || data?.settings?.seasonName || "Farm").slice(0, 120);
  const crop = body?.crop != null ? String(body.crop).slice(0, 80) : row.crop;
  await env.DB.prepare(
    `UPDATE crop_farms SET data = ?, updated_at = ?, name = ?, crop = ? WHERE farm_id = ?`
  )
    .bind(JSON.stringify(data), updatedAt, name, crop, farmId)
    .run();
  await env.DB.prepare(`UPDATE farmer_sessions SET expires_at = ? WHERE token = ?`)
    .bind(expiryIso(), sess.token)
    .run();
  return json({ farm_id: farmId, updated_at: updatedAt });
}

/** Legacy single-farm API (login maps to farmer; load/save use first crop farm if farm_id omitted). */
async function handleLegacyFarmLogin(env, body) {
  const out = await handleFarmerLogin(env, body);
  if (out.status !== 200) return out;
  const parsed = await out.json();
  const sess = await sessionFarmer(env.DB, parsed.token);
  if (!sess) return err("BAD_SESSION", 401);
  const first = await env.DB.prepare(
    `SELECT farm_id, data, updated_at FROM crop_farms WHERE farmer_id = ? ORDER BY updated_at DESC LIMIT 1`
  )
    .bind(sess.farmer_id)
    .first();
  let data = {};
  if (first) {
    try {
      data = JSON.parse(first.data || "{}");
    } catch {
      data = {};
    }
  }
  return json({
    farm_id: parsed.farmer_id,
    farmer_id: parsed.farmer_id,
    token: parsed.token,
    data,
    updated_at: first?.updated_at || new Date().toISOString(),
    crop_farm_id: first?.farm_id || null,
  });
}

async function handleLegacyFarmLoad(env, body) {
  const sess = await sessionFarmer(env.DB, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  let farmId = String(body?.farm_id || body?.crop_farm_id || "");
  if (!farmId) {
    const first = await env.DB.prepare(
      `SELECT farm_id FROM crop_farms WHERE farmer_id = ? ORDER BY updated_at DESC LIMIT 1`
    )
      .bind(sess.farmer_id)
      .first();
    farmId = first?.farm_id || "";
  }
  if (!farmId) return err("NO_FARM", 404);
  return handleFarmsLoad(env, { token: body.token, farm_id: farmId });
}

async function handleLegacyFarmSave(env, body) {
  const sess = await sessionFarmer(env.DB, body?.token);
  if (!sess) return err("BAD_SESSION", 401);
  let farmId = String(body?.farm_id || body?.crop_farm_id || "");
  if (!farmId) {
    const first = await env.DB.prepare(
      `SELECT farm_id FROM crop_farms WHERE farmer_id = ? ORDER BY updated_at DESC LIMIT 1`
    )
      .bind(sess.farmer_id)
      .first();
    farmId = first?.farm_id || "";
  }
  if (!farmId) {
    const created = await handleFarmsCreate(env, {
      token: body.token,
      name: body?.data?.settings?.seasonName || "Farm",
      data: body?.data,
    });
    return created;
  }
  return handleFarmsSave(env, { ...body, farm_id: farmId });
}

async function handleLegacyFarmCreate(env, body) {
  const password = String(body?.password || "");
  if (password.length < 6) return err("WEAK_PASSWORD");
  const reg = await handleFarmerRegister(env, { password, email: body?.email, phone: body?.phone });
  if (reg.status !== 200) return reg;
  const parsed = await reg.json();
  const create = await handleFarmsCreate(env, {
    token: parsed.token,
    name: body?.data?.settings?.seasonName || "Farm",
    data: body?.data,
  });
  if (create.status !== 200) return create;
  const farm = await create.json();
  return json({
    farm_id: parsed.farmer_id,
    farmer_id: parsed.farmer_id,
    token: parsed.token,
    data: farm.data,
    updated_at: farm.updated_at,
    crop_farm_id: farm.farm_id,
  });
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

  if (parts[0] === "farmer" && request.method === "POST") {
    const body = await readJson(request);
    if (!body) return err("BAD_JSON");
    if (parts[1] === "register") return handleFarmerRegister(env, body);
    if (parts[1] === "login") return handleFarmerLogin(env, body);
    return err("NOT_FOUND", 404);
  }

  if (parts[0] === "farms" && request.method === "POST") {
    const body = await readJson(request);
    if (!body) return err("BAD_JSON");
    switch (parts[1]) {
      case "list":
        return handleFarmsList(env, body);
      case "create":
        return handleFarmsCreate(env, body);
      case "load":
        return handleFarmsLoad(env, body);
      case "save":
        return handleFarmsSave(env, body);
      default:
        return err("NOT_FOUND", 404);
    }
  }

  if (parts[0] === "farm" && request.method === "POST") {
    const body = await readJson(request);
    if (!body) return err("BAD_JSON");
    switch (parts[1]) {
      case "create":
        return handleLegacyFarmCreate(env, body);
      case "login":
        return handleLegacyFarmLogin(env, body);
      case "load":
        return handleLegacyFarmLoad(env, body);
      case "save":
        return handleLegacyFarmSave(env, body);
      default:
        return err("NOT_FOUND", 404);
    }
  }

  return err("NOT_FOUND", 404);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
        return await handleApi(request, env);
      }
      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        const path = url.pathname;
        const isShell =
          path === "/" ||
          path.endsWith("/index.html") ||
          path.endsWith("/app.js") ||
          path.endsWith("/styles.css") ||
          path.endsWith("/config.js") ||
          path.endsWith("/sw.js");
        if (!isShell || !response.ok) return response;
        const headers = new Headers(response.headers);
        headers.set("cache-control", "no-cache, no-store, must-revalidate");
        headers.set("pragma", "no-cache");
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      return new Response("ASSETS binding missing", { status: 500 });
    } catch (e) {
      return json({ error: "WORKER_CRASH", detail: String(e?.message || e) }, 500);
    }
  },
};
