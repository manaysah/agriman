(() => {
  const ADMIN_SESSION = "agriman-admin-session-v1";

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_SESSION) || "null");
    } catch {
      return null;
    }
  }

  function saveSession(s) {
    if (!s) localStorage.removeItem(ADMIN_SESSION);
    else localStorage.setItem(ADMIN_SESSION, JSON.stringify(s));
  }

  async function api(path, body) {
    const r = await fetch(`/api/admin/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(data.error || "REQUEST_FAILED");
      e.code = data.error;
      throw e;
    }
    return data;
  }

  function showLogin() {
    $("#adminLogin").classList.remove("hidden");
    $("#adminApp").classList.add("hidden");
  }

  function showApp() {
    $("#adminLogin").classList.add("hidden");
    $("#adminApp").classList.remove("hidden");
  }

  const $ = (sel) => document.querySelector(sel);

  async function refreshList() {
    const session = loadSession();
    if (!session?.token) return showLogin();
    const data = await api("farmers/list", { token: session.token });
    const list = $("#adminFarmerList");
    const farmers = data.farmers || [];
    if (!farmers.length) {
      list.innerHTML = `<li class="empty">No farmers registered.</li>`;
      return;
    }
    list.innerHTML = farmers
      .map(
        (f) => `
      <li class="record-item">
        <span class="title">${escapeHtml(f.farmer_id)}</span>
        <span class="meta">${escapeHtml(f.email || "—")} · ${escapeHtml(f.created_at || "")} · ${f.farm_count || 0} farms</span>
        <div class="actions">
          <button type="button" data-del-farmer="${escapeHtml(f.farmer_id)}">Delete</button>
        </div>
      </li>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  $("#adminLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errEl = $("#adminLoginError");
    errEl.classList.add("hidden");
    try {
      const data = await api("login", {
        username: String(fd.get("username") || "").trim(),
        password: String(fd.get("password") || ""),
      });
      saveSession({ token: data.token, username: data.username });
      showApp();
      await refreshList();
    } catch (err) {
      errEl.textContent =
        err?.code === "ADMIN_NOT_CONFIGURED"
          ? "Admin not configured. Set ADMIN_PASSWORD on Cloudflare Worker."
          : "Login failed.";
      errEl.classList.remove("hidden");
    }
  });

  $("#adminLogoutBtn").addEventListener("click", () => {
    saveSession(null);
    showLogin();
  });

  $("#adminRefreshBtn").addEventListener("click", () => refreshList().catch(() => showLogin()));

  $("#adminExportBtn").addEventListener("click", async () => {
    const session = loadSession();
    if (!session?.token) return;
    const data = await api("farmers/export", { token: session.token });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agriman-farmers-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-del-farmer]");
    if (!btn) return;
    const farmerId = btn.dataset.delFarmer;
    if (!confirm(`Delete farmer ${farmerId} and all their farms? This cannot be undone.`)) return;
    const session = loadSession();
    try {
      await api("farmers/delete", { token: session.token, farmer_id: farmerId });
      await refreshList();
    } catch {
      alert("Delete failed.");
    }
  });

  (async function boot() {
    if (loadSession()?.token) {
      showApp();
      try {
        await refreshList();
      } catch {
        saveSession(null);
        showLogin();
      }
    } else {
      showLogin();
    }
  })();
})();
