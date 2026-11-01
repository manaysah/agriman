(() => {
  const ADMIN_SESSION = "agriman-admin-session-v1";
  let credFarmerId = null;

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

  function selectedFarmerIds() {
    return [...document.querySelectorAll(".admin-farmer-cb:checked")].map((el) => el.value);
  }

  function updateBulkDeleteState() {
    const n = selectedFarmerIds().length;
    const btn = $("#adminBulkDeleteBtn");
    if (btn) btn.disabled = n === 0;
    const all = $("#adminSelectAll");
    const boxes = document.querySelectorAll(".admin-farmer-cb");
    if (all && boxes.length) {
      all.checked = n > 0 && n === boxes.length;
      all.indeterminate = n > 0 && n < boxes.length;
    }
  }

  async function refreshList() {
    const session = loadSession();
    if (!session?.token) return showLogin();
    const data = await api("farmers/list", { token: session.token });
    const list = $("#adminFarmerList");
    const farmers = data.farmers || [];
    if (!farmers.length) {
      list.innerHTML = `<li class="empty">No farmers registered.</li>`;
      updateBulkDeleteState();
      return;
    }
    list.innerHTML = farmers
      .map(
        (f) => `
      <li class="record-item admin-farmer-row">
        <label class="admin-farmer-check">
          <input type="checkbox" class="admin-farmer-cb" value="${escapeHtml(f.farmer_id)}" />
        </label>
        <span class="title">${escapeHtml(f.farmer_id)}</span>
        <span class="meta">${escapeHtml(f.email || "—")} · ${escapeHtml(f.created_at || "")} · ${f.farm_count || 0} farms</span>
        <div class="actions">
          <button type="button" data-cred-farmer="${escapeHtml(f.farmer_id)}" data-cred-email="${escapeHtml(f.email || "")}">Credentials</button>
          <button type="button" data-del-farmer="${escapeHtml(f.farmer_id)}">Delete</button>
        </div>
      </li>`
      )
      .join("");
    list.querySelectorAll(".admin-farmer-cb").forEach((cb) => {
      cb.addEventListener("change", updateBulkDeleteState);
    });
    updateBulkDeleteState();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function openCredDialog(farmerId, email) {
    credFarmerId = farmerId;
    $("#adminCredFarmerId").value = farmerId;
    $("#adminCredEmail").textContent = email ? `Email: ${email}` : "No email on file";
    $("#adminCredPassword").value = "";
    $("#adminCredPassword").placeholder = "Generate a new password to display";
    $("#adminCredNote").textContent =
      "Original signup password cannot be recovered (stored as a hash).";
    $("#adminCopyPassword").disabled = true;
    $("#adminCredDialog").showModal();
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

  $("#adminSelectAll").addEventListener("change", (e) => {
    const checked = e.target.checked;
    document.querySelectorAll(".admin-farmer-cb").forEach((cb) => {
      cb.checked = checked;
    });
    updateBulkDeleteState();
  });

  $("#adminBulkDeleteBtn").addEventListener("click", async () => {
    const ids = selectedFarmerIds();
    if (!ids.length) return;
    if (
      !confirm(
        `Delete ${ids.length} farmer(s) and all their farms? This cannot be undone.\n\n${ids.slice(0, 8).join("\n")}${ids.length > 8 ? `\n…and ${ids.length - 8} more` : ""}`
      )
    ) {
      return;
    }
    const session = loadSession();
    try {
      const result = await api("farmers/delete-bulk", { token: session.token, farmer_ids: ids });
      if (result.not_found?.length) {
        alert(`Deleted ${result.deleted}. Not found: ${result.not_found.join(", ")}`);
      }
      await refreshList();
    } catch {
      alert("Bulk delete failed.");
    }
  });

  $("#adminCopyFarmerId").addEventListener("click", async () => {
    const ok = await copyText($("#adminCredFarmerId").value);
    if (!ok) alert("Copy failed.");
  });

  $("#adminCopyPassword").addEventListener("click", async () => {
    const pw = $("#adminCredPassword").value;
    if (!pw) return;
    const ok = await copyText(pw);
    if (!ok) alert("Copy failed.");
  });

  $("#adminResetPasswordBtn").addEventListener("click", async () => {
    if (!credFarmerId) return;
    if (
      !confirm(
        `Set a new random password for ${credFarmerId}? The farmer's old password will stop working.`
      )
    ) {
      return;
    }
    const session = loadSession();
    try {
      const data = await api("farmers/reset-password", {
        token: session.token,
        farmer_id: credFarmerId,
      });
      $("#adminCredPassword").value = data.password || "";
      $("#adminCopyPassword").disabled = !data.password;
      $("#adminCredNote").textContent = data.note || "New password set.";
    } catch {
      alert("Could not reset password.");
    }
  });

  document.addEventListener("click", async (e) => {
    const credBtn = e.target.closest("[data-cred-farmer]");
    if (credBtn) {
      openCredDialog(credBtn.dataset.credFarmer, credBtn.dataset.credEmail || "");
      return;
    }
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
