(() => {
  const STORAGE_KEY = "agriman-v1";
  const LEGACY_KEY = "farm-ledger-v1";
  const SESSION_KEY = "agriman-session-v1";
  const LOCAL_ONLY_KEY = "agriman-local-only";

  const EXPENSE_CATEGORY_KEYS = [
    "land",
    "seeds",
    "plants",
    "water",
    "labor",
    "fertilizer",
    "equipment",
    "other",
  ];

  const PLAN_CATEGORY_KEYS = [...EXPENSE_CATEGORY_KEYS.slice(0, -1), "transport", "other"];

  const STRINGS = {
    en: {
      seasonProfit: "Season profit",
      revenueMinusExpenses: "Revenue − expenses",
      revenue: "Revenue",
      expenses: "Expenses",
      transport: "Transport",
      marketDays: "Market days",
      byCategory: "By category",
      recentActivity: "Recent activity",
      addExpense: "Add expense",
      date: "Date",
      category: "Category",
      amount: "Amount",
      notes: "Notes",
      saveExpense: "Save expense",
      dailyMarketSale: "Daily market sale",
      product: "Product",
      quantity: "Quantity",
      unit: "Unit",
      saleAmount: "Sale amount (revenue)",
      transportFee: "Transport fee",
      marketBuyer: "Market / buyer",
      saveMarketDay: "Save market day",
      marketTrips: "Market trips",
      expense: "Expense",
      sale: "Sale",
      both: "Both",
      selectDay: "Select a day",
      tapDayHint: "Tap a day to see what you paid and earned.",
      plannedPayments: "Planned payments",
      addPlan: "+ Plan",
      planHint: "Schedule expected costs through the season (rent, labor, water…).",
      aboutTagline:
        "Your farm season ledger — costs, market days, transport, and profit in one place.",
      creator: "Creator",
      alias: "Alias",
      version: "Version",
      aboutNote:
        "Built to replace paper notes: log expenses and daily market sales, plan season payments on the calendar, and see profit clearly.",
      backToProfit: "Back to profit",
      navProfit: "Profit",
      navExpenses: "Expenses",
      navMarket: "Market",
      navCalendar: "Calendar",
      settings: "Settings",
      language: "Language",
      seasonName: "Season name",
      currencySymbol: "Currency symbol",
      exportBackup: "Export backup",
      clearSeason: "Clear season data",
      save: "Save",
      close: "Close",
      settingsHint: "Data stays on this phone/browser. Export a backup before switching devices.",
      plannedPayment: "Planned payment",
      dueDate: "Due date",
      expectedAmount: "Expected amount",
      savePlan: "Save plan",
      cancel: "Cancel",
      about: "About",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      mainNav: "Main",
      notesExpensePh: "Plot, vendor, worker…",
      productPh: "Tomatoes, olives…",
      unitPh: "kg, box…",
      marketPh: "Central market, buyer name…",
      optional: "Optional",
      seasonPh: "Winter 2026",
      profitAhead: "You’re ahead this season",
      profitBehind: "Costs are ahead of sales so far",
      noExpensesYet: "No expenses yet. Add your first cost under Expenses.",
      nothingLogged: "Nothing logged yet.",
      noExpenses: "No expenses yet.",
      noMarketTrips: "No market trips yet.",
      nothingOnDay: "Nothing on this day.",
      noPlans: "No planned payments. Tap + Plan to schedule season costs.",
      delete: "Delete",
      spent: "Spent",
      earned: "Earned",
      plannedPrefix: "Planned:",
      due: "Due",
      expectedPayment: "Expected payment",
      marketSale: "Market sale",
      market: "Market",
      clearConfirm: "Clear all expenses, market sales, and plans for this season?",
      winter: "Winter",
      spring: "Spring",
      summer: "Summer",
      fall: "Fall",
      authTagline: "Shared farm ledger — Farm ID + password, synced safely in the cloud.",
      cloudSetupNeeded:
        "Cloud sync needs a D1 database binding on Cloudflare (see SETUP-CLOUD.md). You can continue on this device only until then.",
      continueLocal: "Continue on this device only",
      joinFarm: "Join farm",
      createFarm: "Create farm",
      farmId: "Farm ID",
      password: "Password",
      confirmPassword: "Confirm password",
      createFarmHint: "We’ll generate a Farm ID. Share the ID and password with your partner.",
      pleaseWait: "Please wait…",
      yourFarmId: "Your Farm ID",
      copyFarmId: "Copy Farm ID",
      syncNow: "Sync now",
      logout: "Log out",
      logoutConfirm: "Log out on this device? Cloud data stays safe — use Farm ID + password to return.",
      passwordMismatch: "Passwords do not match.",
      syncOk: "Synced",
      syncSaving: "Saving to cloud…",
      syncError: "Cloud sync failed",
      syncLocal: "This device only",
      copied: "Copied",
      authErrorGeneric: "Could not sign in. Check Farm ID and password.",
      farmCreated: "Farm created. Share this Farm ID with your partner:",
      settingsHint:
        "Cloud farm data is shared with anyone who has your Farm ID and password. Export a backup as extra safety.",
      cats: {
        land: "Land / rent",
        seeds: "Seeds",
        plants: "Plants",
        water: "Water",
        labor: "Labor",
        fertilizer: "Fertilizer / chemicals",
        equipment: "Equipment / tools",
        transport: "Transport",
        other: "Other",
      },
      dow: ["S", "M", "T", "W", "T", "F", "S"],
    },
    ar: {
      seasonProfit: "ربح الموسم",
      revenueMinusExpenses: "الإيرادات − المصروفات",
      revenue: "الإيرادات",
      expenses: "المصروفات",
      transport: "النقل",
      marketDays: "أيام السوق",
      byCategory: "حسب الفئة",
      recentActivity: "آخر النشاط",
      addExpense: "إضافة مصروف",
      date: "التاريخ",
      category: "الفئة",
      amount: "المبلغ",
      notes: "ملاحظات",
      saveExpense: "حفظ المصروف",
      dailyMarketSale: "بيع السوق اليومي",
      product: "المنتج",
      quantity: "الكمية",
      unit: "الوحدة",
      saleAmount: "مبلغ البيع (إيراد)",
      transportFee: "أجرة النقل",
      marketBuyer: "السوق / المشتري",
      saveMarketDay: "حفظ يوم السوق",
      marketTrips: "رحلات السوق",
      expense: "مصروف",
      sale: "بيع",
      both: "كلاهما",
      selectDay: "اختر يوماً",
      tapDayHint: "اضغط على يوم لترى ما دفعت وما كسبت.",
      plannedPayments: "المدفوعات المخططة",
      addPlan: "+ خطة",
      planHint: "جدول التكاليف المتوقعة خلال الموسم (إيجار، عمالة، مياه…).",
      aboutTagline: "دفتر موسم المزرعة — التكاليف وأيام السوق والنقل والربح في مكان واحد.",
      creator: "المنشئ",
      alias: "الاسم المستعار",
      version: "الإصدار",
      aboutNote:
        "صُمم ليحل محل الورق: سجّل المصروفات ومبيعات السوق اليومية، خطط مدفوعات الموسم في التقويم، واطلع على الربح بوضوح.",
      backToProfit: "العودة إلى الربح",
      navProfit: "الربح",
      navExpenses: "مصروفات",
      navMarket: "السوق",
      navCalendar: "التقويم",
      settings: "الإعدادات",
      language: "اللغة",
      seasonName: "اسم الموسم",
      currencySymbol: "رمز العملة",
      exportBackup: "تصدير نسخة احتياطية",
      clearSeason: "مسح بيانات الموسم",
      save: "حفظ",
      close: "إغلاق",
      settingsHint: "البيانات تبقى على هذا الهاتف/المتصفح. صدّر نسخة قبل تغيير الجهاز.",
      plannedPayment: "دفعة مخططة",
      dueDate: "تاريخ الاستحقاق",
      expectedAmount: "المبلغ المتوقع",
      savePlan: "حفظ الخطة",
      cancel: "إلغاء",
      about: "حول",
      prevMonth: "الشهر السابق",
      nextMonth: "الشهر التالي",
      mainNav: "القائمة الرئيسية",
      notesExpensePh: "القطعة، البائع، العامل…",
      productPh: "طماطم، زيتون…",
      unitPh: "كغ، صندوق…",
      marketPh: "السوق المركزي، اسم المشتري…",
      optional: "اختياري",
      seasonPh: "شتاء 2026",
      profitAhead: "أنت متقدم هذا الموسم",
      profitBehind: "التكاليف تتقدم على المبيعات حتى الآن",
      noExpensesYet: "لا مصروفات بعد. أضف أول تكلفة من المصروفات.",
      nothingLogged: "لا شيء مسجّل بعد.",
      noExpenses: "لا مصروفات بعد.",
      noMarketTrips: "لا رحلات سوق بعد.",
      nothingOnDay: "لا شيء في هذا اليوم.",
      noPlans: "لا مدفوعات مخططة. اضغط + خطة لجدولة تكاليف الموسم.",
      delete: "حذف",
      spent: "المصروف",
      earned: "المكسب",
      plannedPrefix: "مخطط:",
      due: "استحقاق",
      expectedPayment: "دفعة متوقعة",
      marketSale: "بيع سوق",
      market: "سوق",
      clearConfirm: "مسح كل المصروفات ومبيعات السوق والخطط لهذا الموسم؟",
      winter: "شتاء",
      spring: "ربيع",
      summer: "صيف",
      fall: "خريف",
      authTagline: "دفتر مزرعة مشترك — معرّف المزرعة وكلمة المرور، بمزامنة آمنة في السحابة.",
      cloudSetupNeeded:
        "المزامنة السحابية تحتاج ربط قاعدة D1 على Cloudflare (انظر SETUP-CLOUD.md). يمكنك المتابعة على هذا الجهاز فقط حالياً.",
      continueLocal: "المتابعة على هذا الجهاز فقط",
      joinFarm: "الانضمام للمزرعة",
      createFarm: "إنشاء مزرعة",
      farmId: "معرّف المزرعة",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      createFarmHint: "سنُنشئ معرّف مزرعة. شاركه مع كلمة المرور مع شريكك.",
      pleaseWait: "يرجى الانتظار…",
      yourFarmId: "معرّف مزرعتك",
      copyFarmId: "نسخ المعرّف",
      syncNow: "مزامنة الآن",
      logout: "تسجيل الخروج",
      logoutConfirm: "تسجيل الخروج من هذا الجهاز؟ البيانات السحابية تبقى آمنة — استخدم المعرّف وكلمة المرور للعودة.",
      passwordMismatch: "كلمتا المرور غير متطابقتين.",
      syncOk: "تمت المزامنة",
      syncSaving: "جاري الحفظ في السحابة…",
      syncError: "فشلت مزامنة السحابة",
      syncLocal: "هذا الجهاز فقط",
      copied: "تم النسخ",
      authErrorGeneric: "تعذر الدخول. تحقق من المعرّف وكلمة المرور.",
      farmCreated: "تم إنشاء المزرعة. شارك هذا المعرّف مع شريكك:",
      settingsHint:
        "بيانات المزرعة السحابية متاحة لمن لديه المعرّف وكلمة المرور. صدّر نسخة احتياطية للأمان الإضافي.",
      cats: {
        land: "أرض / إيجار",
        seeds: "بذور",
        plants: "شتلات",
        water: "مياه",
        labor: "عمالة",
        fertilizer: "سماد / مواد",
        equipment: "معدات / أدوات",
        transport: "نقل",
        other: "أخرى",
      },
      dow: ["ح", "ن", "ث", "ر", "خ", "ج", "س"],
    },
  };

  function t(key) {
    const lang = state.settings.language || "en";
    const pack = STRINGS[lang] || STRINGS.en;
    return pack[key] ?? STRINGS.en[key] ?? key;
  }

  function labelCategory(key) {
    const lang = state.settings.language || "en";
    return (STRINGS[lang]?.cats?.[key] || STRINGS.en.cats[key] || key);
  }

  function locale() {
    return state.settings.language === "ar" ? "ar" : "en";
  }

  function defaultSeasonName(lang = "en") {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const pack = STRINGS[lang] || STRINGS.en;
    let season;
    let y = year;
    if (month >= 9 || month <= 1) {
      season = pack.winter;
      y = month <= 1 ? year : year + 1;
    } else if (month >= 2 && month <= 4) season = pack.spring;
    else if (month >= 5 && month <= 7) season = pack.summer;
    else season = pack.fall;
    return `${season} ${y}`;
  }

  const defaultState = () => ({
    settings: {
      seasonName: defaultSeasonName("en"),
      currency: "₪",
      language: "en",
    },
    expenses: [],
    markets: [],
    plans: [],
  });

  function loadState() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem(LEGACY_KEY);
        if (raw) {
          localStorage.setItem(STORAGE_KEY, raw);
        }
      }
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        settings: { ...defaultState().settings, ...(parsed.settings || {}) },
        expenses: parsed.expenses || [],
        markets: parsed.markets || [],
        plans: parsed.plans || [],
      };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    scheduleCloudSave();
  }

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function generateFarmId() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let body = "";
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    for (let i = 0; i < 6; i++) body += alphabet[bytes[i] % alphabet.length];
    return `AM-${body}`;
  }

  let cloudReady = null; // null=unknown, true/false after probe

  function supabaseConfigured() {
    const cfg = window.AGRIMAN_CONFIG || {};
    return Boolean(
      cfg.supabaseUrl && cfg.supabaseAnonKey && !String(cfg.supabaseUrl).includes("YOUR_PROJECT")
    );
  }

  function cloudConfigured() {
    if (supabaseConfigured()) return true;
    return cloudReady === true;
  }

  function getSupabase() {
    if (!supabaseConfigured()) return null;
    if (!window.__agrimanSb) {
      const { createClient } = window.supabase;
      const cfg = window.AGRIMAN_CONFIG;
      window.__agrimanSb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    }
    return window.__agrimanSb;
  }

  async function probeCloud() {
    try {
      const r = await fetch("/api/farm/health", { method: "GET", cache: "no-store" });
      const body = await r.json().catch(() => ({}));
      cloudReady = r.ok && body.ok === true;
    } catch {
      cloudReady = false;
    }
    return cloudReady;
  }

  async function apiFarm(action, body) {
    const r = await fetch(`/api/farm/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      const error = new Error(json.error || "REQUEST_FAILED");
      error.code = json.error || "REQUEST_FAILED";
      throw error;
    }
    return json;
  }

  function loadSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveSession(session) {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function isLocalOnly() {
    return localStorage.getItem(LOCAL_ONLY_KEY) === "1";
  }

  function setLocalOnly(on) {
    if (on) localStorage.setItem(LOCAL_ONLY_KEY, "1");
    else localStorage.removeItem(LOCAL_ONLY_KEY);
  }

  function payloadFromState() {
    return {
      settings: state.settings,
      expenses: state.expenses,
      markets: state.markets,
      plans: state.plans,
    };
  }

  function applyCloudData(data) {
    const base = defaultState();
    const incoming = data && typeof data === "object" ? data : {};
    state = {
      ...base,
      ...incoming,
      settings: { ...base.settings, ...(incoming.settings || {}) },
      expenses: incoming.expenses || [],
      markets: incoming.markets || [],
      plans: incoming.plans || [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function mapAuthError(err) {
    const msg = String(err?.code || err?.message || err || "");
    if (msg.includes("BAD_LOGIN")) return t("authErrorGeneric");
    if (msg.includes("FARM_EXISTS")) return "Farm ID already exists. Try again.";
    if (msg.includes("WEAK_PASSWORD")) return "Password must be at least 6 characters.";
    if (msg.includes("BAD_SESSION")) return t("authErrorGeneric");
    if (msg.includes("INVALID_FARM_ID")) return "Invalid Farm ID.";
    if (msg.includes("DB_NOT_BOUND")) return t("cloudSetupNeeded");
    return t("authErrorGeneric");
  }

  function setSyncLabel(text, kind) {
    const el = $("#syncLabel");
    if (!el) return;
    el.textContent = text || "";
    el.dataset.kind = kind || "";
  }

  let saveTimer = null;
  let cloudBusy = false;

  function scheduleCloudSave() {
    const session = loadSession();
    if (!session?.token || !cloudConfigured()) return;
    setSyncLabel(t("syncSaving"), "saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      pushToCloud().catch(() => {});
    }, 700);
  }

  async function pushToCloud() {
    const session = loadSession();
    if (!session?.token || !cloudConfigured()) return false;
    cloudBusy = true;
    try {
      let data;
      const sb = getSupabase();
      if (sb) {
        const res = await sb.rpc("save_farm", {
          p_token: session.token,
          p_data: payloadFromState(),
        });
        if (res.error) throw res.error;
        data = res.data;
      } else {
        data = await apiFarm("save", { token: session.token, data: payloadFromState() });
      }
      if (data?.updated_at) {
        session.updatedAt = data.updated_at;
        saveSession(session);
      }
      setSyncLabel(`${t("syncOk")} · ${session.farmId}`, "ok");
      return true;
    } catch {
      setSyncLabel(t("syncError"), "error");
      return false;
    } finally {
      cloudBusy = false;
    }
  }

  async function pullFromCloud() {
    const session = loadSession();
    if (!session?.token || !cloudConfigured()) return false;
    try {
      let data;
      const sb = getSupabase();
      if (sb) {
        const res = await sb.rpc("load_farm", { p_token: session.token });
        if (res.error) throw res.error;
        data = res.data;
      } else {
        data = await apiFarm("load", { token: session.token });
      }
      applyCloudData(data.data);
      session.updatedAt = data.updated_at;
      session.farmId = data.farm_id;
      saveSession(session);
      setSyncLabel(`${t("syncOk")} · ${session.farmId}`, "ok");
      applyI18n();
      renderAll();
      return true;
    } catch (e) {
      if (String(e?.code || e?.message || "").includes("BAD_SESSION")) {
        saveSession(null);
        showAuthGate();
      }
      setSyncLabel(t("syncError"), "error");
      return false;
    }
  }

  function showAuthGate() {
    $("#authGate").classList.remove("hidden");
    $("#app").classList.add("hidden");
    const configured = cloudConfigured();
    $("#authSetupWarn").classList.toggle("hidden", configured);
    $("#authTabs").classList.toggle("hidden", !configured);
    $("#joinFarmForm").classList.toggle("hidden", !configured);
    $("#createFarmForm").classList.add("hidden");
    if (configured) {
      $$(".auth-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.authTab === "join"));
    }
    $("#authError").classList.add("hidden");
    applyI18n();
  }

  function showAppShell() {
    $("#authGate").classList.add("hidden");
    $("#app").classList.remove("hidden");
    const session = loadSession();
    if (session?.farmId) setSyncLabel(`${t("syncOk")} · ${session.farmId}`, "ok");
    else if (isLocalOnly()) setSyncLabel(t("syncLocal"), "local");
    else setSyncLabel("", "");
  }

  function setAuthBusy(on) {
    $("#authBusy").classList.toggle("hidden", !on);
    ["#joinFarmForm button[type=submit]", "#createFarmForm button[type=submit]"].forEach((sel) => {
      const btn = $(sel);
      if (btn) btn.disabled = on;
    });
  }

  function showAuthError(message) {
    const el = $("#authError");
    el.textContent = message;
    el.classList.remove("hidden");
  }

  async function enterAppFromSession() {
    showAppShell();
    applyI18n();
    fillDefaultDates();
    renderAll();
    if (loadSession()?.token) await pullFromCloud();
  }

  function todayISO() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 10);
  }

  function money(n) {
    const value = Number(n) || 0;
    const symbol = state.settings.currency || "";
    const formatted = value.toLocaleString(locale(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    if (!symbol) return formatted;
    return state.settings.language === "ar" ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
  }

  function parseAmount(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  let state = loadState();
  let calendarCursor = new Date();
  calendarCursor.setDate(1);
  let selectedDay = todayISO();
  let lastMainView = "home";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  function fillCategorySelects() {
    $$("select[data-i18n-options]").forEach((select) => {
      const kind = select.dataset.i18nOptions;
      const keys = kind === "planCategories" ? PLAN_CATEGORY_KEYS : EXPENSE_CATEGORY_KEYS;
      const current = select.value;
      select.innerHTML = keys
        .map((key) => `<option value="${key}">${labelCategory(key)}</option>`)
        .join("");
      if (keys.includes(current)) select.value = current;
    });
  }

  function applyI18n() {
    const lang = state.settings.language || "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = "AgriMan";

    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (key) el.textContent = t(key);
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (key) el.placeholder = t(key);
    });
    $$("[data-i18n-aria]").forEach((el) => {
      const key = el.dataset.i18nAria;
      if (key) el.setAttribute("aria-label", t(key));
    });

    $$(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    const langSelect = $("#settingsLanguage");
    if (langSelect) langSelect.value = lang;

    fillCategorySelects();
  }

  function setLanguage(lang) {
    state.settings.language = lang === "ar" ? "ar" : "en";
    saveState();
    applyI18n();
    renderAll();
    if ($('.view.active[data-view="calendar"]')) renderCalendar();
  }

  function setView(name) {
    if (name !== "about") lastMainView = name;
    $$(".view").forEach((el) => el.classList.toggle("active", el.dataset.view === name));
    $$(".nav-item").forEach((el) => {
      const isAbout = name === "about";
      el.classList.toggle("active", !isAbout && el.dataset.nav === name);
    });
    if (name === "calendar") renderCalendar();
  }

  function totals() {
    const expenseTotal = state.expenses.reduce((s, e) => s + e.amount, 0);
    const transportOnMarket = state.markets.reduce((s, m) => s + (m.transport || 0), 0);
    const revenue = state.markets.reduce((s, m) => s + m.revenue, 0);
    const transportExpense = state.expenses
      .filter((e) => e.category === "transport")
      .reduce((s, e) => s + e.amount, 0);
    const transport = transportOnMarket + transportExpense;
    const allCosts = expenseTotal + transportOnMarket;
    return {
      expenseTotal,
      transportOnMarket,
      transport,
      revenue,
      allCosts,
      profit: revenue - allCosts,
      marketDays: new Set(state.markets.map((m) => m.date)).size,
    };
  }

  function categorySpend() {
    const map = {};
    state.expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    const transport = state.markets.reduce((s, m) => s + (m.transport || 0), 0);
    if (transport > 0) map.transport = (map.transport || 0) + transport;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  function recentItems(limit = 8) {
    const items = [
      ...state.expenses.map((e) => ({
        id: e.id,
        date: e.date,
        title: labelCategory(e.category),
        meta: e.notes || t("expense"),
        amount: e.amount,
        kind: "expense",
      })),
      ...state.markets.map((m) => ({
        id: m.id,
        date: m.date,
        title: m.product,
        meta: m.market || t("marketSale"),
        amount: m.revenue,
        kind: "revenue",
      })),
    ];
    return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, limit);
  }

  function renderHome() {
    const tot = totals();
    const profitEl = $("#profitFigure");
    profitEl.textContent = money(tot.profit);
    profitEl.classList.toggle("negative", tot.profit < 0);
    $("#profitSub").textContent = tot.profit >= 0 ? t("profitAhead") : t("profitBehind");
    $("#totalRevenue").textContent = money(tot.revenue);
    $("#totalExpenses").textContent = money(tot.allCosts);
    $("#totalTransport").textContent = money(tot.transport);
    $("#marketDays").textContent = String(tot.marketDays);

    const cats = categorySpend();
    const max = cats[0]?.[1] || 1;
    const catList = $("#categoryBreakdown");
    if (!cats.length) {
      catList.innerHTML = `<li class="empty">${t("noExpensesYet")}</li>`;
    } else {
      catList.innerHTML = cats
        .map(
          ([key, amount]) => `
        <li class="category-item">
          <span class="title">${labelCategory(key)}</span>
          <span class="amount expense">${money(amount)}</span>
          <div class="bar"><span style="width:${Math.max(8, (amount / max) * 100)}%"></span></div>
        </li>`
        )
        .join("");
    }

    const recent = recentItems();
    const act = $("#recentActivity");
    if (!recent.length) {
      act.innerHTML = `<li class="empty">${t("nothingLogged")}</li>`;
    } else {
      act.innerHTML = recent
        .map(
          (item) => `
        <li class="activity-item">
          <span class="title">${escapeHtml(item.title)}</span>
          <span class="amount ${item.kind}">${item.kind === "expense" ? "−" : "+"}${money(item.amount)}</span>
          <span class="meta">${item.date} · ${escapeHtml(item.meta)}</span>
        </li>`
        )
        .join("");
    }
  }

  function renderExpenses() {
    const list = $("#expenseList");
    const sorted = [...state.expenses].sort((a, b) => (a.date < b.date ? 1 : -1));
    $("#expenseCount").textContent = `${sorted.length}`;
    if (!sorted.length) {
      list.innerHTML = `<li class="empty">${t("noExpenses")}</li>`;
      return;
    }
    list.innerHTML = sorted
      .map(
        (e) => `
      <li class="record-item">
        <span class="title">${labelCategory(e.category)}</span>
        <span class="amount expense">−${money(e.amount)}</span>
        <span class="meta">${e.date}${e.notes ? ` · ${escapeHtml(e.notes)}` : ""}</span>
        <div class="actions">
          <button type="button" data-del-expense="${e.id}">${t("delete")}</button>
        </div>
      </li>`
      )
      .join("");
  }

  function renderMarket() {
    const list = $("#marketList");
    const sorted = [...state.markets].sort((a, b) => (a.date < b.date ? 1 : -1));
    $("#marketCount").textContent = `${sorted.length}`;
    if (!sorted.length) {
      list.innerHTML = `<li class="empty">${t("noMarketTrips")}</li>`;
      return;
    }
    list.innerHTML = sorted
      .map((m) => {
        const qty =
          m.quantity != null && m.quantity !== ""
            ? `${m.quantity}${m.unit ? ` ${escapeHtml(m.unit)}` : ""} · `
            : "";
        const transport =
          m.transport > 0 ? ` · ${t("transport")} ${money(m.transport)}` : "";
        return `
      <li class="record-item">
        <span class="title">${escapeHtml(m.product)}</span>
        <span class="amount revenue">+${money(m.revenue)}</span>
        <span class="meta">${m.date} · ${qty}${escapeHtml(m.market || t("market"))}${transport}${
          m.notes ? ` · ${escapeHtml(m.notes)}` : ""
        }</span>
        <div class="actions">
          <button type="button" data-del-market="${m.id}">${t("delete")}</button>
        </div>
      </li>`;
      })
      .join("");
  }

  function monthMatrix(year, month) {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function dayKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function activityByDate() {
    const map = {};
    const bump = (date, type) => {
      if (!map[date]) map[date] = { expense: false, revenue: false, plan: false };
      map[date][type] = true;
    };
    state.expenses.forEach((e) => bump(e.date, "expense"));
    state.markets.forEach((m) => bump(m.date, "revenue"));
    state.plans.forEach((p) => bump(p.date, "plan"));
    return map;
  }

  function renderCalendar() {
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    $("#calendarTitle").textContent = calendarCursor.toLocaleString(locale(), {
      month: "long",
      year: "numeric",
    });

    const marks = activityByDate();
    const dows = (STRINGS[state.settings.language]?.dow || STRINGS.en.dow)
      .map((d) => `<div class="cal-dow">${d}</div>`)
      .join("");
    const cells = monthMatrix(year, month)
      .map((day) => {
        if (!day) return `<button type="button" class="cal-day muted-day" disabled></button>`;
        const key = dayKey(year, month, day);
        const m = marks[key];
        const selected = key === selectedDay ? "selected" : "";
        let dots = "";
        if (m?.expense) dots += `<i style="background:var(--expense)"></i>`;
        if (m?.revenue) dots += `<i style="background:var(--revenue)"></i>`;
        if (m?.plan && !m?.expense) dots += `<i style="background:var(--crop)"></i>`;
        return `<button type="button" class="cal-day ${selected}" data-day="${key}"><span>${day}</span><span class="marks">${dots}</span></button>`;
      })
      .join("");
    $("#calendarGrid").innerHTML = dows + cells;
    renderDayDetail();
    renderPlans();
  }

  function renderDayDetail() {
    if (selectedDay) {
      $("#dayTitle").textContent = new Date(selectedDay + "T12:00:00").toLocaleDateString(locale(), {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else {
      $("#dayTitle").textContent = t("selectDay");
    }

    const dayExpenses = state.expenses.filter((e) => e.date === selectedDay);
    const dayMarkets = state.markets.filter((m) => m.date === selectedDay);
    const dayPlans = state.plans.filter((p) => p.date === selectedDay);
    const spent =
      dayExpenses.reduce((s, e) => s + e.amount, 0) +
      dayMarkets.reduce((s, m) => s + (m.transport || 0), 0);
    const earned = dayMarkets.reduce((s, m) => s + m.revenue, 0);

    $("#daySummary").innerHTML = `
      <div class="pill">${t("spent")}<strong class="amount expense">${money(spent)}</strong></div>
      <div class="pill">${t("earned")}<strong class="amount revenue">${money(earned)}</strong></div>
    `;

    const rows = [
      ...dayExpenses.map(
        (e) => `
        <li class="record-item">
          <span class="title">${labelCategory(e.category)}</span>
          <span class="amount expense">−${money(e.amount)}</span>
          <span class="meta">${e.notes ? escapeHtml(e.notes) : t("expense")}</span>
        </li>`
      ),
      ...dayMarkets.map(
        (m) => `
        <li class="record-item">
          <span class="title">${escapeHtml(m.product)}</span>
          <span class="amount revenue">+${money(m.revenue)}</span>
          <span class="meta">${m.transport ? `${t("transport")} ${money(m.transport)} · ` : ""}${
            escapeHtml(m.market || t("sale"))
          }</span>
        </li>`
      ),
      ...dayPlans.map(
        (p) => `
        <li class="record-item">
          <span class="title">${t("plannedPrefix")} ${labelCategory(p.category)}</span>
          <span class="amount expense">${money(p.amount)}</span>
          <span class="meta">${p.notes ? escapeHtml(p.notes) : t("expectedPayment")}</span>
        </li>`
      ),
    ];

    $("#dayList").innerHTML = rows.length
      ? rows.join("")
      : `<li class="empty">${t("nothingOnDay")}</li>`;
  }

  function renderPlans() {
    const list = $("#planList");
    const sorted = [...state.plans].sort((a, b) => (a.date > b.date ? 1 : -1));
    if (!sorted.length) {
      list.innerHTML = `<li class="empty">${t("noPlans")}</li>`;
      return;
    }
    list.innerHTML = sorted
      .map(
        (p) => `
      <li class="record-item">
        <span class="title">${labelCategory(p.category)}</span>
        <span class="amount expense">${money(p.amount)}</span>
        <span class="meta">${t("due")} ${p.date}${p.notes ? ` · ${escapeHtml(p.notes)}` : ""}</span>
        <div class="actions">
          <button type="button" data-del-plan="${p.id}">${t("delete")}</button>
        </div>
      </li>`
      )
      .join("");
  }

  function renderAll() {
    $("#seasonLabel").textContent = state.settings.seasonName;
    renderHome();
    renderExpenses();
    renderMarket();
    if ($('.view.active[data-view="calendar"]')) renderCalendar();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function fillDefaultDates() {
    const today = todayISO();
    $$('input[type="date"]').forEach((input) => {
      if (!input.value) input.value = today;
    });
  }

  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.nav));
  });

  $$(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  $("#aboutBtn").addEventListener("click", () => setView("about"));
  $("#backFromAbout").addEventListener("click", () => setView(lastMainView || "home"));

  $("#expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.expenses.push({
      id: uid(),
      date: fd.get("date"),
      category: fd.get("category"),
      amount: parseAmount(fd.get("amount")),
      notes: String(fd.get("notes") || "").trim(),
    });
    saveState();
    e.target.reset();
    fillDefaultDates();
    fillCategorySelects();
    renderAll();
    setView("home");
  });

  $("#marketForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.markets.push({
      id: uid(),
      date: fd.get("date"),
      product: String(fd.get("product") || "").trim(),
      quantity: fd.get("quantity") === "" ? null : parseAmount(fd.get("quantity")),
      unit: String(fd.get("unit") || "").trim(),
      revenue: parseAmount(fd.get("revenue")),
      transport: parseAmount(fd.get("transport")),
      market: String(fd.get("market") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
    });
    saveState();
    e.target.reset();
    e.target.unit.value = "kg";
    e.target.transport.value = "0";
    fillDefaultDates();
    applyI18n();
    renderAll();
    setView("home");
  });

  document.addEventListener("click", (e) => {
    const exp = e.target.closest("[data-del-expense]");
    if (exp) {
      state.expenses = state.expenses.filter((x) => x.id !== exp.dataset.delExpense);
      saveState();
      renderAll();
      return;
    }
    const mkt = e.target.closest("[data-del-market]");
    if (mkt) {
      state.markets = state.markets.filter((x) => x.id !== mkt.dataset.delMarket);
      saveState();
      renderAll();
      return;
    }
    const plan = e.target.closest("[data-del-plan]");
    if (plan) {
      state.plans = state.plans.filter((x) => x.id !== plan.dataset.delPlan);
      saveState();
      renderCalendar();
      return;
    }
    const day = e.target.closest("[data-day]");
    if (day) {
      selectedDay = day.dataset.day;
      renderCalendar();
    }
  });

  $("#prevMonth").addEventListener("click", () => {
    calendarCursor.setMonth(calendarCursor.getMonth() - 1);
    renderCalendar();
  });
  $("#nextMonth").addEventListener("click", () => {
    calendarCursor.setMonth(calendarCursor.getMonth() + 1);
    renderCalendar();
  });

  $("#settingsBtn").addEventListener("click", () => {
    const form = $("#settingsForm");
    form.seasonName.value = state.settings.seasonName;
    form.currency.value = state.settings.currency;
    form.language.value = state.settings.language || "en";
    const session = loadSession();
    $("#settingsFarmId").textContent = session?.farmId || (isLocalOnly() ? t("syncLocal") : "—");
    $("#settingsDialog").showModal();
  });

  $("#closeSettings").addEventListener("click", () => $("#settingsDialog").close());

  $("#settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.settings.seasonName = String(fd.get("seasonName") || "").trim() || defaultSeasonName(state.settings.language);
    state.settings.currency = String(fd.get("currency") || "").trim();
    state.settings.language = fd.get("language") === "ar" ? "ar" : "en";
    saveState();
    $("#settingsDialog").close();
    applyI18n();
    renderAll();
  });

  $("#settingsLanguage").addEventListener("change", (e) => {
    setLanguage(e.target.value);
  });

  $("#copyFarmIdBtn").addEventListener("click", async () => {
    const session = loadSession();
    if (!session?.farmId) return;
    try {
      await navigator.clipboard.writeText(session.farmId);
      setSyncLabel(t("copied"), "ok");
    } catch {
      prompt(t("yourFarmId"), session.farmId);
    }
  });

  $("#syncNowBtn").addEventListener("click", async () => {
    if (!loadSession()?.token) return;
    setSyncLabel(t("pleaseWait"), "saving");
    await pullFromCloud();
    await pushToCloud();
  });

  $("#logoutBtn").addEventListener("click", () => {
    if (!confirm(t("logoutConfirm"))) return;
    saveSession(null);
    setLocalOnly(false);
    $("#settingsDialog").close();
    showAuthGate();
  });

  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `agriman-${state.settings.seasonName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("#clearBtn").addEventListener("click", () => {
    if (!confirm(t("clearConfirm"))) return;
    const settings = { ...state.settings };
    state = defaultState();
    state.settings = settings;
    saveState();
    $("#settingsDialog").close();
    applyI18n();
    renderAll();
    renderCalendar();
  });

  $$(".auth-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".auth-tab").forEach((b) => b.classList.toggle("active", b === btn));
      const create = btn.dataset.authTab === "create";
      $("#joinFarmForm").classList.toggle("hidden", create);
      $("#createFarmForm").classList.toggle("hidden", !create);
      $("#authError").classList.add("hidden");
    });
  });

  $("#continueLocalBtn").addEventListener("click", () => {
    setLocalOnly(true);
    saveSession(null);
    enterAppFromSession();
  });

  $("#joinFarmForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#authError").classList.add("hidden");
    if (!cloudConfigured()) return showAuthError(t("cloudSetupNeeded"));
    const fd = new FormData(e.target);
    setAuthBusy(true);
    try {
      let data;
      const sb = getSupabase();
      if (sb) {
        const res = await sb.rpc("login_farm", {
          p_farm_id: String(fd.get("farmId") || "").trim(),
          p_password: String(fd.get("password") || ""),
        });
        if (res.error) throw res.error;
        data = res.data;
      } else {
        data = await apiFarm("login", {
          farmId: String(fd.get("farmId") || "").trim(),
          password: String(fd.get("password") || ""),
        });
      }
      setLocalOnly(false);
      saveSession({ farmId: data.farm_id, token: data.token, updatedAt: data.updated_at });
      applyCloudData(data.data);
      await enterAppFromSession();
    } catch (err) {
      showAuthError(mapAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  });

  $("#createFarmForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#authError").classList.add("hidden");
    if (!cloudConfigured()) return showAuthError(t("cloudSetupNeeded"));
    const fd = new FormData(e.target);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    if (password !== confirm) return showAuthError(t("passwordMismatch"));
    setAuthBusy(true);
    try {
      const fresh = defaultState();
      fresh.settings.language = state.settings.language || "en";
      fresh.settings.seasonName = defaultSeasonName(fresh.settings.language);
      const payload = {
        settings: fresh.settings,
        expenses: [],
        markets: [],
        plans: [],
      };
      let created;
      const sb = getSupabase();
      if (sb) {
        let lastError = null;
        for (let i = 0; i < 5; i++) {
          const res = await sb.rpc("create_farm", {
            p_farm_id: generateFarmId(),
            p_password: password,
            p_data: payload,
          });
          if (!res.error) {
            created = res.data;
            break;
          }
          lastError = res.error;
          if (!String(res.error.message || "").includes("FARM_EXISTS")) break;
        }
        if (!created) throw lastError || new Error("FARM_EXISTS");
      } else {
        created = await apiFarm("create", { password, data: payload });
      }
      setLocalOnly(false);
      saveSession({ farmId: created.farm_id, token: created.token, updatedAt: created.updated_at });
      applyCloudData(created.data);
      alert(`${t("farmCreated")}\n${created.farm_id}`);
      await enterAppFromSession();
    } catch (err) {
      showAuthError(mapAuthError(err));
    } finally {
      setAuthBusy(false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && loadSession()?.token && !cloudBusy) {
      pullFromCloud().catch(() => {});
    }
  });

  $("#addPlanBtn").addEventListener("click", () => {
    const form = $("#planForm");
    form.reset();
    form.date.value = selectedDay || todayISO();
    fillCategorySelects();
    $("#planDialog").showModal();
  });

  $("#closePlan").addEventListener("click", () => $("#planDialog").close());

  $("#planForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.plans.push({
      id: uid(),
      date: fd.get("date"),
      category: fd.get("category"),
      amount: parseAmount(fd.get("amount")),
      notes: String(fd.get("notes") || "").trim(),
    });
    saveState();
    $("#planDialog").close();
    selectedDay = String(fd.get("date"));
    renderCalendar();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  (async function boot() {
    applyI18n();
    fillDefaultDates();
    await probeCloud();
    const session = loadSession();
    if (session?.token && cloudConfigured()) {
      showAppShell();
      renderAll();
      const ok = await pullFromCloud();
      if (!ok && !loadSession()) return;
      return;
    }
    if (isLocalOnly() && !cloudConfigured()) {
      await enterAppFromSession();
      return;
    }
    if (isLocalOnly() && cloudConfigured() && !session) {
      setLocalOnly(false);
    }
    showAuthGate();
  })();
})();
