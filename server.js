const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const ENV_FILE = path.join(ROOT, ".env");

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  const lines = fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const DATA_DIR = path.join(ROOT, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const PORT = Number(process.env.PORT || 4173);
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_HOURS || 12) * 60 * 60 * 1000;
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
const MAX_BODY_BYTES = 64 * 1024;

if (!ADMIN_USER || !ADMIN_PASSWORD || !SESSION_SECRET) {
  console.error("Missing ADMIN_USER, ADMIN_PASSWORD, or SESSION_SECRET. Configure them in .env.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4"
};

const rateBuckets = new Map();

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, "[]");
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, "{}");
}

function readJson(file, fallback) {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, payload) {
  ensureStore();
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
}

function baseHeaders(extra = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join("; "),
    ...extra
  };
}

function send(res, status, payload, headers = {}) {
  const isString = typeof payload === "string";
  const body = isString ? payload : JSON.stringify(payload);
  res.writeHead(status, baseHeaders({
    "Content-Type": isString ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    ...headers
  }));
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function parseCookies(req) {
  const output = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    output[trimmed.slice(0, index)] = decodeURIComponent(trimmed.slice(index + 1));
  }
  return output;
}

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function makeCookie(token) {
  const raw = `${token}.${sign(token)}`;
  const secure = COOKIE_SECURE ? "; Secure" : "";
  return `fm_admin=${encodeURIComponent(raw)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`;
}

function getSessionToken(req) {
  const cookie = parseCookies(req).fm_admin;
  if (!cookie) return "";
  const [token, signature] = cookie.split(".");
  if (!token || !signature) return "";
  const expected = sign(token);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return "";
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return "";
  return token;
}

function sanitizeString(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(99, Math.max(1, quantity));
}

function clientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
}

function clientMeta(req) {
  return {
    ip: clientIp(req),
    userAgent: req.headers["user-agent"] || "",
    referer: req.headers.referer || "",
    language: req.headers["accept-language"] || ""
  };
}

function rateLimit(req, key, limit, windowMs) {
  const bucketKey = `${key}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = rateBuckets.get(bucketKey) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  rateBuckets.set(bucketKey, bucket);
  return bucket.count <= limit;
}

function addLead(req, data) {
  const leads = readJson(LEADS_FILE, []);
  const now = new Date().toISOString();
  const email = sanitizeString(data.email, 180).toLowerCase();
  if (!isEmail(email)) return { error: "Invalid email" };

  const lead = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    type: sanitizeString(data.type || "preorder", 40),
    email,
    status: "new",
    source: sanitizeString(data.source || "site", 80),
    color: sanitizeString(data.color || "", 60),
    image: sanitizeString(data.image || "", 220),
    product: sanitizeString(data.product || "Future Me Planner", 120),
    quantity: toQuantity(data.quantity),
    note: "",
    tags: [],
    meta: clientMeta(req)
  };

  leads.unshift(lead);
  writeJson(LEADS_FILE, leads);
  return { lead };
}

function requireAdmin(req, res, options = {}) {
  const token = getSessionToken(req);
  if (!token) {
    send(res, 401, { error: "Unauthorized" });
    return null;
  }

  const sessions = readJson(SESSIONS_FILE, {});
  const session = sessions[token];
  if (!session || Date.now() > session.expiresAt) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    send(res, 401, { error: "Unauthorized" });
    return null;
  }

  if (options.csrf && req.headers["x-csrf-token"] !== session.csrf) {
    send(res, 403, { error: "Bad CSRF token" });
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  writeJson(SESSIONS_FILE, sessions);
  return { token, session };
}

function filterLeads(searchParams) {
  let leads = readJson(LEADS_FILE, []);
  const q = (searchParams.get("q") || "").toLowerCase();
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const color = (searchParams.get("color") || "").toLowerCase();
  const source = (searchParams.get("source") || "").toLowerCase();

  if (q) {
    leads = leads.filter((lead) =>
      [lead.email, lead.color, lead.source, lead.product, lead.note, lead.type, ...(lead.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  if (type) leads = leads.filter((lead) => lead.type === type);
  if (status) leads = leads.filter((lead) => lead.status === status);
  if (color) leads = leads.filter((lead) => (lead.color || "").toLowerCase() === color);
  if (source) leads = leads.filter((lead) => (lead.source || "").toLowerCase() === source);
  return leads;
}

function buildSummary(leads) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const summary = {
    total: leads.length,
    today: leads.filter((lead) => lead.createdAt.slice(0, 10) === today).length,
    week: leads.filter((lead) => new Date(lead.createdAt).getTime() >= weekAgo).length,
    preorders: leads.filter((lead) => lead.type === "preorder").length,
    newsletter: leads.filter((lead) => lead.type === "newsletter").length,
    books: leads.filter((lead) => lead.type === "preorder").reduce((sum, lead) => sum + toQuantity(lead.quantity), 0),
    byStatus: {},
    byColor: {},
    bySource: {}
  };

  for (const lead of leads) {
    summary.byStatus[lead.status || "new"] = (summary.byStatus[lead.status || "new"] || 0) + 1;
    if (lead.color) summary.byColor[lead.color] = (summary.byColor[lead.color] || 0) + toQuantity(lead.quantity);
    if (lead.source) summary.bySource[lead.source] = (summary.bySource[lead.source] || 0) + 1;
  }
  return summary;
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv(leads) {
  const header = ["createdAt", "type", "email", "status", "product", "color", "image", "quantity", "source", "note", "tags", "ip", "userAgent"];
  const rows = leads.map((lead) => [
    lead.createdAt,
    lead.type,
    lead.email,
    lead.status,
    lead.product,
    lead.color,
    lead.image,
    lead.quantity,
    lead.source,
    lead.note,
    (lead.tags || []).join("|"),
    lead.meta?.ip,
    lead.meta?.userAgent
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function isBlockedStaticPath(pathname) {
  const clean = pathname.replaceAll("\\", "/").toLowerCase();
  return (
    clean.startsWith("/data/") ||
    clean.startsWith("/.git/") ||
    clean.startsWith("/.agents/") ||
    clean.startsWith("/.codex/") ||
    clean === "/.env" ||
    clean === "/server.js" ||
    clean === "/package.json" ||
    clean.endsWith(".log")
  );
}

function serveStatic(req, res, pathname) {
  if (isBlockedStaticPath(pathname)) return send(res, 404, "Not found");
  let filePath = pathname === "/" ? "/index.html" : pathname;
  if (filePath === "/admin") filePath = "/admin.html";
  filePath = decodeURIComponent(filePath).replaceAll("\\", "/");
  const fullPath = path.normalize(path.join(ROOT, filePath));
  if (!fullPath.startsWith(ROOT)) return send(res, 403, "Forbidden");

  fs.readFile(fullPath, (error, data) => {
    if (error) return send(res, 404, "Not found");
    res.writeHead(200, baseHeaders({
      "Content-Type": MIME[path.extname(fullPath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": pathname === "/admin.html" ? "no-store" : "public, max-age=600"
    }));
    res.end(data);
  });
}

async function handleApi(req, res, url) {
  if (req.method === "POST" && url.pathname === "/api/preorders") {
    if (!rateLimit(req, "preorders", 20, 15 * 60 * 1000)) return send(res, 429, { error: "Too many requests" });
    const data = await readBody(req);
    const result = addLead(req, { ...data, type: "preorder" });
    if (result.error) return send(res, 400, result);
    return send(res, 201, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/newsletter") {
    if (!rateLimit(req, "newsletter", 20, 15 * 60 * 1000)) return send(res, 429, { error: "Too many requests" });
    const data = await readBody(req);
    const result = addLead(req, { ...data, type: "newsletter", product: "Newsletter", quantity: 1 });
    if (result.error) return send(res, 400, result);
    return send(res, 201, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    if (!rateLimit(req, "admin-login", 8, 15 * 60 * 1000)) return send(res, 429, { error: "Too many login attempts" });
    const data = await readBody(req);
    const userOk = data.username === ADMIN_USER;
    const passOk = data.password === ADMIN_PASSWORD;
    if (!userOk || !passOk) return send(res, 401, { error: "Wrong login or password" });

    const token = crypto.randomBytes(32).toString("hex");
    const csrf = crypto.randomBytes(24).toString("base64url");
    const sessions = readJson(SESSIONS_FILE, {});
    sessions[token] = {
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
      csrf,
      ip: clientIp(req)
    };
    writeJson(SESSIONS_FILE, sessions);
    return send(res, 200, { ok: true, csrf }, { "Set-Cookie": makeCookie(token) });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/logout") {
    const auth = requireAdmin(req, res, { csrf: true });
    if (!auth) return;
    const sessions = readJson(SESSIONS_FILE, {});
    delete sessions[auth.token];
    writeJson(SESSIONS_FILE, sessions);
    return send(res, 200, { ok: true }, {
      "Set-Cookie": "fm_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    });
  }

  if (url.pathname.startsWith("/api/admin/")) {
    const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (!requireAdmin(req, res, { csrf: needsCsrf })) return;
  }

  if (req.method === "GET" && url.pathname === "/api/admin/me") {
    const token = getSessionToken(req);
    const session = readJson(SESSIONS_FILE, {})[token];
    return send(res, 200, { ok: true, username: ADMIN_USER, csrf: session.csrf });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/leads") {
    const leads = filterLeads(url.searchParams);
    return send(res, 200, { leads, summary: buildSummary(readJson(LEADS_FILE, [])) });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/summary") {
    return send(res, 200, buildSummary(readJson(LEADS_FILE, [])));
  }

  if (req.method === "GET" && url.pathname === "/api/admin/export.csv") {
    const csv = exportCsv(filterLeads(url.searchParams));
    res.writeHead(200, baseHeaders({
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="future-me-leads-${new Date().toISOString().slice(0, 10)}.csv"`
    }));
    return res.end(csv);
  }

  const leadMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)$/);
  if (leadMatch && req.method === "PATCH") {
    const id = leadMatch[1];
    const data = await readBody(req);
    const leads = readJson(LEADS_FILE, []);
    const lead = leads.find((item) => item.id === id);
    if (!lead) return send(res, 404, { error: "Lead not found" });

    if (data.status) lead.status = sanitizeString(data.status, 40);
    if (data.note !== undefined) lead.note = sanitizeString(data.note, 1000);
    if (Array.isArray(data.tags)) lead.tags = data.tags.map((tag) => sanitizeString(tag, 40)).filter(Boolean).slice(0, 10);
    lead.updatedAt = new Date().toISOString();
    writeJson(LEADS_FILE, leads);
    return send(res, 200, { ok: true, lead });
  }

  if (leadMatch && req.method === "DELETE") {
    const id = leadMatch[1];
    const leads = readJson(LEADS_FILE, []);
    const next = leads.filter((lead) => lead.id !== id);
    writeJson(LEADS_FILE, next);
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: "API route not found" });
}

ensureStore();

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    if (error.message === "Payload too large") return send(res, 413, { error: error.message });
    return send(res, 500, { error: "Server error" });
  }
}).listen(PORT, () => {
  console.log(`Future Me server running at http://127.0.0.1:${PORT}`);
  console.log(`Admin: http://127.0.0.1:${PORT}/admin`);
});
