const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginError = document.querySelector("[data-login-error]");
const statsEl = document.querySelector("[data-stats]");
const leadsEl = document.querySelector("[data-leads]");
const detailEl = document.querySelector("[data-detail]");
const statusBarsEl = document.querySelector("[data-status-bars]");
const colorBarsEl = document.querySelector("[data-color-bars]");
const sourceBarsEl = document.querySelector("[data-source-bars]");
const newCountEl = document.querySelector("[data-new-count]");
const bookCountEl = document.querySelector("[data-book-count]");
const sourceCountEl = document.querySelector("[data-source-count]");
const filters = {
  q: document.querySelector("[data-search]"),
  type: document.querySelector("[data-type]"),
  status: document.querySelector("[data-status]"),
  color: document.querySelector("[data-color]")
};

let leads = [];
let activeId = null;
let csrfToken = "";

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (csrfToken && options.method && options.method !== "GET") headers["X-CSRF-Token"] = csrfToken;
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return response.headers.get("content-type")?.includes("application/json")
    ? response.json()
    : response.text();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showDashboard() {
  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

function showLogin() {
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
}

function params() {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, element]) => {
    if (element?.value) query.set(key, element.value);
  });
  return query.toString();
}

function fmtDate(value) {
  return new Date(value).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function renderStats(summary) {
  statsEl.replaceChildren();
  [
    ["Total", summary.total],
    ["Today", summary.today],
    ["This week", summary.week],
    ["Books", summary.books],
    ["Preorders", summary.preorders],
    ["Newsletter", summary.newsletter]
  ].forEach(([label, value]) => {
    const card = el("article", "stat-card");
    card.append(el("strong", "", String(value || 0)), el("span", "", label));
    statsEl.append(card);
  });
}

function renderBars(container, values) {
  container.replaceChildren();
  const entries = Object.entries(values || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  if (!entries.length) {
    container.append(el("p", "empty-state", "No data yet."));
    return;
  }

  entries.forEach(([label, value]) => {
    const row = el("div", "bar-row");
    const top = el("div", "bar-top");
    top.append(el("span", "", label), el("strong", "", String(value)));
    const track = el("div", "bar-track");
    const fill = el("span");
    fill.style.width = `${Math.max(6, Math.round((value / max) * 100))}%`;
    track.append(fill);
    row.append(top, track);
    container.append(row);
  });
}

function renderInsights(summary) {
  newCountEl.textContent = `${summary.byStatus?.new || 0} new`;
  bookCountEl.textContent = `${summary.books || 0} books`;
  sourceCountEl.textContent = `${Object.keys(summary.bySource || {}).length} channels`;
  renderBars(statusBarsEl, summary.byStatus);
  renderBars(colorBarsEl, summary.byColor);
  renderBars(sourceBarsEl, summary.bySource);
}

function renderLeads() {
  leadsEl.replaceChildren();
  if (!leads.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.className = "empty-cell";
    cell.textContent = "No leads match the current filters.";
    row.append(cell);
    leadsEl.append(row);
    return;
  }

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    row.dataset.id = lead.id;
    if (lead.id === activeId) row.classList.add("active");
    [
      fmtDate(lead.createdAt),
      lead.type,
      lead.email,
      `${lead.color || "-"} ${lead.image ? `(${lead.image})` : ""}`,
      String(lead.quantity || "-"),
      lead.status,
      lead.source || "-"
    ].forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 1 || index === 5) {
        cell.append(el("span", "badge", value));
      } else if (index === 2) {
        cell.append(el("strong", "", value));
      } else {
        cell.textContent = value;
      }
      row.append(cell);
    });
    row.addEventListener("click", () => {
      activeId = lead.id;
      renderLeads();
      renderDetail(lead);
    });
    leadsEl.append(row);
  });
}

function detailRow(label, value) {
  const row = el("div", "detail-row");
  row.append(el("span", "", label), el("strong", "", value || "-"));
  return row;
}

function renderDetail(lead) {
  detailEl.replaceChildren();
  if (!lead) {
    detailEl.append(el("p", "empty-state", "Select a lead."));
    return;
  }

  detailEl.append(el("h2", "", lead.email), el("span", "badge", lead.type));
  const actionsTop = el("div", "quick-actions");
  const mailLink = el("a", "admin-link secondary", "Email");
  mailLink.href = `mailto:${encodeURIComponent(lead.email)}`;
  const copyButton = el("button", "secondary", "Copy email");
  copyButton.type = "button";
  copyButton.addEventListener("click", () => navigator.clipboard?.writeText(lead.email));
  actionsTop.append(mailLink, copyButton);
  detailEl.append(actionsTop);

  const grid = el("div", "detail-grid");
  grid.append(
    detailRow("Date", fmtDate(lead.createdAt)),
    detailRow("Product", lead.product),
    detailRow("Color", lead.color),
    detailRow("Image", lead.image),
    detailRow("Quantity", String(lead.quantity || "-")),
    detailRow("Source", lead.source),
    detailRow("IP", lead.meta?.ip)
  );
  detailEl.append(grid);

  const actions = el("div", "detail-actions");
  const status = document.createElement("select");
  status.dataset.detailStatus = "true";
  ["new", "contacted", "paid", "shipped", "cancelled"].forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    option.selected = lead.status === item;
    status.append(option);
  });

  const tags = document.createElement("input");
  tags.dataset.detailTags = "true";
  tags.value = (lead.tags || []).join(", ");
  tags.placeholder = "Tags, comma separated";

  const note = document.createElement("textarea");
  note.dataset.detailNote = "true";
  note.placeholder = "Internal note";
  note.value = lead.note || "";

  const save = el("button", "", "Save changes");
  save.type = "button";
  save.addEventListener("click", async () => {
    await api(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: status.value,
        note: note.value,
        tags: tags.value.split(",").map((tag) => tag.trim()).filter(Boolean)
      })
    });
    await loadLeads();
  });

  const del = el("button", "danger", "Delete lead");
  del.type = "button";
  del.addEventListener("click", async () => {
    if (!confirm("Delete this lead?")) return;
    await api(`/api/admin/leads/${lead.id}`, { method: "DELETE", body: "{}" });
    activeId = null;
    await loadLeads();
    renderDetail(null);
  });

  actions.append(status, tags, note, save, del);
  detailEl.append(actions);
}

async function loadLeads() {
  const payload = await api(`/api/admin/leads?${params()}`);
  leads = payload.leads;
  renderStats(payload.summary);
  renderInsights(payload.summary);
  renderLeads();
  if (activeId) renderDetail(leads.find((lead) => lead.id === activeId));
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const data = Object.fromEntries(new FormData(loginForm));
  try {
    const payload = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify(data)
    });
    csrfToken = payload.csrf;
    showDashboard();
    await loadLeads();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

document.querySelector("[data-logout]").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => {});
  csrfToken = "";
  showLogin();
});

document.querySelector("[data-export]").addEventListener("click", () => {
  window.location.href = `/api/admin/export.csv?${params()}`;
});

document.querySelector("[data-refresh]").addEventListener("click", loadLeads);
Object.values(filters).forEach((element) => {
  element.addEventListener("input", () => {
    clearTimeout(element._timer);
    element._timer = setTimeout(loadLeads, 250);
  });
});

api("/api/admin/me")
  .then(async (payload) => {
    csrfToken = payload.csrf;
    showDashboard();
    await loadLeads();
  })
  .catch(showLogin);
