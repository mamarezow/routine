/* Routine — weekly planner PWA. All data stays on this device (localStorage). */
"use strict";

const KEY = "routine-data";
const VERSION = 1;

/* ---------- i18n ---------- */
const T = {
  en: {
    app: "Routine", week: "Week", habits: "Habits", stats: "Stats", history: "History", settings: "Settings",
    edit: "Edit", done: "Done", thisWeek: "This week", pastWeek: "You're viewing a past week.", backToThis: "Back to this week",
    today: "Today", addTask: "+ Add task", taskName: "Task name", noCat: "No category", moveUp: "Move up", moveDown: "Move down", del: "Delete",
    noTasks: "No tasks", emptyWeek: "Your week is empty. Tap Edit to add tasks to each day.",
    spentQ: "How much time did you spend?", minutes: "minutes", save: "Save", cancel: "Cancel",
    dailyHabits: "Daily habits", addHabit: "+ Add habit", habitName: "Habit name", emptyHabits: "No habits yet. Tap Edit to add some.",
    timeSpent: "Time spent", tasksDone: "Tasks done", habitsDone: "Habits done", byCat: "Time by category", byHabit: "Habits this week",
    noHistory: "No weeks recorded yet.", tasks: "tasks", habitsW: "habits",
    language: "Language", firstDay: "First day of week", categories: "Categories", addCat: "+ Add category", catName: "Category name",
    delCatQ: "Delete this category? Tasks using it will become uncategorized.",
    data: "Your data", dataNote: "Everything is saved on this device only. Make a backup now and then, and use it to move your data to another phone.",
    exportB: "Download backup", importB: "Restore from backup", importOk: "Backup restored.", importBad: "This file isn't a valid backup.",
    importQ: "Replace all current data with this backup?", resetAll: "Erase all data", resetQ: "Erase all your data? This can't be undone.",
    theme: "Theme", auto: "Auto", light: "Light", dark: "Dark", untitled: "Untitled", saved: "Saved",
    install: "Install app", h: "h", m: "m"
  },
  fa: {
    app: "روتین", week: "هفته", habits: "عادت‌ها", stats: "آمار", history: "تاریخچه", settings: "تنظیمات",
    edit: "ویرایش", done: "تمام", thisWeek: "این هفته", pastWeek: "داری یک هفته قبلی رو می‌بینی.", backToThis: "برگشت به این هفته",
    today: "امروز", addTask: "+ کار جدید", taskName: "اسم کار", noCat: "بدون دسته", moveUp: "بالا", moveDown: "پایین", del: "حذف",
    noTasks: "کاری نیست", emptyWeek: "هفته‌ات خالیه. «ویرایش» رو بزن و برای هر روز کار اضافه کن.",
    spentQ: "چقدر وقت گذاشتی؟", minutes: "دقیقه", save: "ذخیره", cancel: "انصراف",
    dailyHabits: "عادت‌های روزانه", addHabit: "+ عادت جدید", habitName: "اسم عادت", emptyHabits: "هنوز عادتی نداری. «ویرایش» رو بزن و اضافه کن.",
    timeSpent: "زمان صرف‌شده", tasksDone: "کارهای انجام‌شده", habitsDone: "عادت‌های انجام‌شده", byCat: "زمان به تفکیک دسته", byHabit: "عادت‌های این هفته",
    noHistory: "هنوز هفته‌ای ثبت نشده.", tasks: "کار", habitsW: "عادت",
    language: "زبان", firstDay: "روز اول هفته", categories: "دسته‌ها", addCat: "+ دسته جدید", catName: "اسم دسته",
    delCatQ: "این دسته حذف بشه؟ کارهایی که این دسته رو دارن بدون دسته می‌شن.",
    data: "داده‌های تو", dataNote: "همه‌چیز فقط روی همین دستگاه ذخیره می‌شه. هر چند وقت یک بار پشتیبان بگیر؛ برای انتقال به گوشی دیگه هم از همین استفاده کن.",
    exportB: "دانلود پشتیبان", importB: "بازگردانی از پشتیبان", importOk: "پشتیبان بازگردانی شد.", importBad: "این فایل پشتیبان معتبر نیست.",
    importQ: "همه داده‌های فعلی با این پشتیبان جایگزین بشه؟", resetAll: "پاک کردن همه داده‌ها", resetQ: "همه داده‌هات پاک بشه؟ قابل برگشت نیست.",
    theme: "پوسته", auto: "خودکار", light: "روشن", dark: "تیره", untitled: "بی‌نام", saved: "ذخیره شد",
    install: "نصب برنامه", h: "ساعت", m: "دقیقه"
  }
};
const DAY = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  fa: ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"]
};
const DAY_S = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fa: ["ی", "د", "س", "چ", "پ", "ج", "ش"]
};

/* ---------- data ---------- */
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const clone = o => JSON.parse(JSON.stringify(o));
const emptyPlan = () => ({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });

function defaults() {
  return {
    v: VERSION,
    settings: { lang: (navigator.language || "").startsWith("fa") ? "fa" : "en", firstDay: 1, theme: "auto" },
    cats: [
      { id: "c1", name: "Work", color: "#2f6fb3" },
      { id: "c2", name: "Study", color: "#b8860b" },
      { id: "c3", name: "Exercise", color: "#b03a48" },
      { id: "c4", name: "Language", color: "#7b4fa8" },
      { id: "c5", name: "Personal", color: "#2e8b57" }
    ],
    plan: emptyPlan(),
    habits: [],
    weeks: {}
  };
}
function valid(d) {
  return d && typeof d === "object" && d.settings && Array.isArray(d.cats) && d.plan && Array.isArray(d.habits) && d.weeks && typeof d.weeks === "object";
}
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (valid(d)) return d; } catch (e) {}
  return defaults();
}
let D = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { toast("Storage full or blocked"); } }
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
function weekStartKey(date, fd) { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); return keyOf(addDays(d, -((d.getDay() - fd + 7) % 7))); }
const curKey = () => weekStartKey(new Date(), D.settings.firstDay);
const todayKey = () => keyOf(new Date());

function ensureWeek(k) {
  if (!D.weeks[k]) { D.weeks[k] = { start: k, plan: clone(D.plan), habits: clone(D.habits), done: {}, hd: {} }; save(); }
  return D.weeks[k];
}

/* ---------- helpers ---------- */
const L = () => D.settings.lang;
const t = k => T[L()][k] || T.en[k] || k;
const faDigits = s => String(s).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
const N = n => L() === "fa" ? faDigits(n) : String(n);
function fmtMin(m) {
  m = Math.round(m || 0); const h = Math.floor(m / 60), r = m % 60;
  if (L() === "fa") return h ? (r ? `${N(h)} ساعت و ${N(r)} دقیقه` : `${N(h)} ساعت`) : `${N(r)} دقیقه`;
  return h ? (r ? `${h}h ${r}m` : `${h}h`) : `${r}m`;
}
function fmtDate(d, opt) {
  const loc = L() === "fa" ? "fa-IR-u-ca-persian" : "en-US";
  try { return new Intl.DateTimeFormat(loc, opt).format(d); } catch (e) { return keyOf(d); }
}
function rangeLabel(k) {
  const s = parseKey(k), e = addDays(s, 6), o = { day: "numeric", month: "short" };
  return `${fmtDate(s, o)} – ${fmtDate(e, o)}`;
}
const catOf = id => D.cats.find(c => c.id === id);
const colorOf = id => (catOf(id) || {}).color || "#8a8f98";

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object") { for (const [sk, sv] of Object.entries(v)) { if (sk.startsWith("--")) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
    else if (k in el && k !== "list" && k !== "type") { try { el[k] = v; } catch (e) { el.setAttribute(k, v); } }
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}
const ICON = {
  week: '<path d="M4 5h16v15H4zM4 9h16M9 3v4M15 3v4"/>',
  habits: '<path d="M5 12l4 4L19 6"/>',
  stats: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
  prev: '<path d="M15 18l-6-6 6-6"/>',
  next: '<path d="M9 18l6-6-6-6"/>'
};
function svg(name, cls) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
  s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round");
  if (cls) s.setAttribute("class", cls);
  s.innerHTML = ICON[name]; return s;
}
function toast(msg) {
  const el = h("div", { className: "toast" }, msg); document.body.append(el); setTimeout(() => el.remove(), 2200);
}

/* ---------- view state ---------- */
const V = { tab: "week", wk: curKey(), editW: false, editH: false };
ensureWeek(V.wk);

function applyLang() {
  document.documentElement.lang = L();
  document.documentElement.dir = L() === "fa" ? "rtl" : "ltr";
  document.title = t("app");
  const th = D.settings.theme;
  if (th === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", th);
}
function render() {
  applyLang();
  const app = document.getElementById("app"); app.innerHTML = "";
  ({ week: renderWeek, habits: renderHabits, stats: renderStats, history: renderHistory, settings: renderSettings })[V.tab](app);
  renderTabs();
}
function renderTabs() {
  const el = document.getElementById("tabs"); el.innerHTML = "";
  for (const k of ["week", "habits", "stats", "history", "settings"]) {
    el.append(h("button", { className: V.tab === k ? "on" : "", onclick: () => { V.tab = k; V.editW = V.editH = false; render(); window.scrollTo(0, 0); } }, svg(k), t(k)));
  }
}
const sortedKeys = () => Object.keys(D.weeks).sort();
function weekNav(app) {
  const keys = sortedKeys(), i = keys.indexOf(V.wk), ck = curKey();
  const prev = i > 0 ? keys[i - 1] : null, next = i >= 0 && i < keys.length - 1 && keys[i + 1] <= ck ? keys[i + 1] : null;
  app.append(h("div", { className: "top" },
    h("h1", null, t("app")),
    h("div", { className: "wnav" },
      h("button", { className: "icon-btn", disabled: !prev, title: "‹", onclick: () => { V.wk = prev; V.editW = V.editH = false; render(); } }, svg("prev", "flip")),
      h("div", { className: "wlabel" }, V.wk === ck ? t("thisWeek") : rangeLabel(V.wk)),
      h("button", { className: "icon-btn", disabled: !next, title: "›", onclick: () => { V.wk = next; V.editW = V.editH = false; render(); } }, svg("next", "flip"))
    )));
  if (V.wk !== ck) app.append(h("div", { className: "banner" }, h("span", null, `${t("pastWeek")} ${rangeLabel(V.wk)}`),
    h("button", { className: "link", onclick: () => { V.wk = ck; ensureWeek(ck); render(); } }, t("backToThis"))));
}
const isCur = () => V.wk === curKey();
function commitPlan(W) { if (isCur()) D.plan = clone(W.plan); save(); }
function commitHabits(W) { if (isCur()) D.habits = clone(W.habits); save(); }
function dayKeys(W) { const s = parseKey(W.start); return [...Array(7)].map((_, i) => addDays(s, i)); }

/* ---------- week ---------- */
function renderWeek(app) {
  weekNav(app);
  const W = ensureWeek(V.wk);
  app.append(h("div", { className: "bar-row" },
    h("h2", null, rangeLabel(V.wk)),
    h("button", { className: "btn" + (V.editW ? " on" : ""), onclick: () => {
      if (V.editW) { for (const wd in W.plan) W.plan[wd].forEach(x => { x.n = x.n.trim() || t("untitled"); }); commitPlan(W); }
      V.editW = !V.editW; render();
    } }, V.editW ? t("done") : t("edit"))));
  const total = Object.values(W.plan).reduce((a, l) => a + l.length, 0);
  if (!total && !V.editW) { app.append(h("div", { className: "empty-big" }, t("emptyWeek"))); return; }
  const grid = h("div", { className: "week" }); const tk = todayKey();
  dayKeys(W).forEach(date => {
    const wd = date.getDay(), list = W.plan[wd] || (W.plan[wd] = []), isT = keyOf(date) === tk;
    const card = h("div", { className: "day" + (isT ? " today" : "") },
      h("div", { className: "dhead" }, h("span", { className: "dname" }, DAY[L()][wd]),
        isT ? h("span", { className: "badge" }, t("today")) : h("span", { className: "ddate" }, fmtDate(date, { day: "numeric", month: "short" }))));
    list.forEach((task, i) => card.append(V.editW ? editTask(W, list, task, i) : viewTask(W, task)));
    if (!list.length && !V.editW) card.append(h("div", { className: "empty" }, t("noTasks")));
    if (V.editW) card.append(h("button", { className: "addb", onclick: () => {
      const nt = { id: uid(), n: "", c: (D.cats[0] || {}).id || "" }; list.push(nt); commitPlan(W); render();
      setTimeout(() => { const el = document.querySelector(`[data-tid="${nt.id}"]`); if (el) el.focus(); }, 0);
    } }, t("addTask")));
    grid.append(card);
  });
  app.append(grid);
}
function viewTask(W, task) {
  const done = W.done[task.id] != null;
  const cb = h("input", { type: "checkbox", checked: done, onchange: e => {
    if (e.target.checked) { e.target.checked = false; askMinutes(task, m => { W.done[task.id] = m; save(); render(); }); }
    else { delete W.done[task.id]; save(); render(); }
  } });
  return h("label", { className: "task" + (done ? " done" : ""), style: { "--c": colorOf(task.c) }, title: done ? `${task.n} · ${fmtMin(W.done[task.id])}` : task.n },
    cb, h("span", { className: "n", dir: "auto" }, task.n));
}
function editTask(W, list, task, i) {
  const sel = h("select", { className: "sel", onchange: e => { task.c = e.target.value; commitPlan(W); render(); } },
    h("option", { value: "" }, t("noCat")),
    D.cats.map(c => h("option", { value: c.id, selected: c.id === task.c }, c.name)));
  const mv = (d) => { const j = i + d; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; commitPlan(W); render(); };
  return h("div", { className: "etask", style: { "--c": colorOf(task.c) } },
    h("input", { className: "inp", value: task.n, placeholder: t("taskName"), "data-tid": task.id, oninput: e => { task.n = e.target.value; commitPlan(W); } }),
    h("div", { className: "erow" }, sel,
      h("button", { className: "mini", title: t("moveUp"), onclick: () => mv(-1) }, "↑"),
      h("button", { className: "mini", title: t("moveDown"), onclick: () => mv(1) }, "↓"),
      h("button", { className: "mini x", title: t("del"), onclick: () => { list.splice(i, 1); delete W.done[task.id]; commitPlan(W); render(); } }, "×")));
}

/* ---------- minutes modal ---------- */
function askMinutes(task, cb) {
  const root = document.getElementById("modal-root");
  const inp = h("input", { type: "number", min: "0", step: "5", inputMode: "numeric", placeholder: "0" });
  const close = () => { root.innerHTML = ""; };
  const ok = () => { const v = parseInt(inp.value, 10); if (isNaN(v) || v < 0) { inp.focus(); return; } close(); cb(v); };
  inp.addEventListener("keydown", e => { if (e.key === "Enter") ok(); if (e.key === "Escape") close(); });
  const chips = [15, 30, 45, 60, 90, 120, 180].map(v => h("button", { className: "chip", onclick: () => { inp.value = v; ok(); } }, fmtMin(v)));
  const m = h("div", { className: "modal", onclick: e => { if (e.target === m) close(); } },
    h("div", { className: "mbox", role: "dialog", "aria-modal": "true" },
      h("div", { className: "mtitle" }, t("spentQ")), h("div", { className: "msub" }, task.n),
      h("div", { className: "mrow" }, inp, h("span", null, t("minutes"))),
      h("div", { className: "chips" }, chips),
      h("div", { className: "mbtns" }, h("button", { className: "btn", onclick: close }, t("cancel")), h("button", { className: "btn primary", onclick: ok }, t("save")))));
  root.innerHTML = ""; root.append(m); setTimeout(() => inp.focus(), 30);
}

/* ---------- habits ---------- */
function renderHabits(app) {
  weekNav(app);
  const W = ensureWeek(V.wk), days = dayKeys(W), tk = todayKey();
  app.append(h("div", { className: "bar-row" }, h("h2", null, t("dailyHabits")),
    h("button", { className: "btn" + (V.editH ? " on" : ""), onclick: () => {
      if (V.editH) { W.habits.forEach(x => { x.name = x.name.trim() || t("untitled"); }); commitHabits(W); }
      V.editH = !V.editH; render();
    } }, V.editH ? t("done") : t("edit"))));
  if (!W.habits.length && !V.editH) { app.append(h("div", { className: "empty-big" }, t("emptyHabits"))); return; }
  const card = h("div", { className: "card" });
  if (V.editH) {
    const st = h("div", { className: "stack" });
    W.habits.forEach((hb, i) => st.append(h("div", { className: "hedit" },
      h("input", { className: "inp", value: hb.name, placeholder: t("habitName"), "data-hid": hb.id, oninput: e => { hb.name = e.target.value; commitHabits(W); } }),
      h("button", { className: "mini", title: t("moveUp"), onclick: () => { if (i > 0) { [W.habits[i - 1], W.habits[i]] = [W.habits[i], W.habits[i - 1]]; commitHabits(W); render(); } } }, "↑"),
      h("button", { className: "mini", title: t("moveDown"), onclick: () => { if (i < W.habits.length - 1) { [W.habits[i + 1], W.habits[i]] = [W.habits[i], W.habits[i + 1]]; commitHabits(W); render(); } } }, "↓"),
      h("button", { className: "mini x", title: t("del"), onclick: () => { W.habits.splice(i, 1); commitHabits(W); render(); } }, "×"))));
    st.append(h("button", { className: "addb", onclick: () => {
      const nh = { id: uid(), name: "" }; W.habits.push(nh); commitHabits(W); render();
      setTimeout(() => { const el = document.querySelector(`[data-hid="${nh.id}"]`); if (el) el.focus(); }, 0);
    } }, t("addHabit")));
    card.append(st);
  } else {
    const g = h("div", { className: "hgrid" }, h("div"));
    days.forEach(d => g.append(h("div", { className: "hd" + (keyOf(d) === tk ? " today" : "") }, DAY_S[L()][d.getDay()])));
    g.append(h("div", { className: "hd" }, "/" + N(7)));
    W.habits.forEach(hb => {
      g.append(h("div", { className: "hname", title: hb.name, dir: "auto" }, hb.name));
      let c = 0;
      days.forEach(d => {
        const k = hb.id + "|" + keyOf(d), on = !!W.hd[k]; if (on) c++;
        g.append(h("button", { className: "dot" + (on ? " on" : ""), "aria-pressed": String(on), title: DAY[L()][d.getDay()],
          onclick: () => { if (on) delete W.hd[k]; else W.hd[k] = 1; save(); render(); } }));
      });
      g.append(h("div", { className: "hcount" }, N(c)));
    });
    card.append(h("div", { className: "hwrap" }, g));
  }
  app.append(card);
}

/* ---------- stats ---------- */
function weekStats(W) {
  let tasks = 0, doneN = 0, spent = 0; const byCat = {};
  for (const wd in W.plan) for (const x of W.plan[wd]) {
    tasks++;
    if (W.done[x.id] != null) { doneN++; spent += W.done[x.id]; byCat[x.c || ""] = (byCat[x.c || ""] || 0) + W.done[x.id]; }
  }
  const hTotal = W.habits.length * 7;
  const hDone = W.habits.reduce((a, hb) => a + Object.keys(W.hd).filter(k => k.startsWith(hb.id + "|")).length, 0);
  return { tasks, doneN, spent, byCat, hTotal, hDone };
}
function renderStats(app) {
  weekNav(app);
  const W = ensureWeek(V.wk), s = weekStats(W);
  app.append(h("div", { className: "bar-row" }, h("h2", null, rangeLabel(V.wk))));
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  app.append(h("div", { className: "sgrid" },
    h("div", { className: "card kpi" }, h("div", { className: "v" }, fmtMin(s.spent)), h("div", { className: "l" }, t("timeSpent"))),
    h("div", { className: "card kpi" }, h("div", { className: "v" }, `${N(s.doneN)} / ${N(s.tasks)}`), h("div", { className: "l" }, `${t("tasksDone")} · ${N(pct(s.doneN, s.tasks))}${L() === "fa" ? "٪" : "%"}`)),
    h("div", { className: "card kpi" }, h("div", { className: "v" }, `${N(s.hDone)} / ${N(s.hTotal)}`), h("div", { className: "l" }, `${t("habitsDone")} · ${N(pct(s.hDone, s.hTotal))}${L() === "fa" ? "٪" : "%"}`))));
  // by category
  const cats = [...D.cats.map(c => ({ id: c.id, name: c.name, color: c.color })), { id: "", name: t("noCat"), color: "#8a8f98" }]
    .filter(c => s.byCat[c.id]);
  const max = Math.max(1, ...cats.map(c => s.byCat[c.id]));
  const cc = h("div", { className: "card" }, h("div", { className: "sec" }, t("byCat")));
  if (!cats.length) cc.append(h("div", { className: "empty" }, "—"));
  cats.sort((a, b) => s.byCat[b.id] - s.byCat[a.id]).forEach(c => cc.append(h("div", { className: "srow", style: { "--c": c.color } },
    h("div", { className: "top2" }, h("b", null, c.name), h("span", null, fmtMin(s.byCat[c.id]))),
    h("div", { className: "bar" }, h("i", { style: { width: (s.byCat[c.id] / max * 100) + "%" } })))));
  app.append(cc);
  // by habit
  if (W.habits.length) {
    const hc = h("div", { className: "card", style: { marginTop: "10px" } }, h("div", { className: "sec" }, t("byHabit")));
    W.habits.forEach(hb => {
      const n = Object.keys(W.hd).filter(k => k.startsWith(hb.id + "|")).length;
      hc.append(h("div", { className: "srow", style: { "--c": "var(--ok)" } },
        h("div", { className: "top2" }, h("b", null, hb.name), h("span", null, `${N(n)} / ${N(7)}`)),
        h("div", { className: "bar" }, h("i", { style: { width: (n / 7 * 100) + "%" } }))));
    });
    app.append(hc);
  }
}

/* ---------- history ---------- */
function renderHistory(app) {
  app.append(h("div", { className: "top" }, h("h1", null, t("history"))));
  const keys = sortedKeys().reverse(), ck = curKey();
  if (!keys.length) { app.append(h("div", { className: "empty-big" }, t("noHistory"))); return; }
  const st = h("div", { className: "stack" });
  keys.forEach(k => {
    const s = weekStats(D.weeks[k]);
    st.append(h("button", { className: "card hist", onclick: () => { V.wk = k; V.tab = "stats"; render(); window.scrollTo(0, 0); } },
      h("div", null, h("div", { className: "r" }, k === ck ? `${t("thisWeek")} · ${rangeLabel(k)}` : rangeLabel(k)),
        h("div", { className: "m" }, `${N(s.doneN)}/${N(s.tasks)} ${t("tasks")} · ${N(s.hDone)}/${N(s.hTotal)} ${t("habitsW")}`)),
      h("span", { className: "pill" }, fmtMin(s.spent))));
  });
  app.append(st);
}

/* ---------- settings ---------- */
function seg(options, value, onpick) {
  return h("div", { className: "seg" }, options.map(([v, label]) => h("button", { className: v === value ? "on" : "", onclick: () => onpick(v) }, label)));
}
function renderSettings(app) {
  app.append(h("div", { className: "top" }, h("h1", null, t("settings"))));
  const S = D.settings;
  const gen = h("div", { className: "card" },
    h("div", { className: "field" }, h("span", null, t("language")), seg([["fa", "فارسی"], ["en", "English"]], S.lang, v => { S.lang = v; save(); render(); })),
    h("div", { className: "field" }, h("span", null, t("firstDay")),
      seg([[6, DAY[L()][6]], [0, DAY[L()][0]], [1, DAY[L()][1]]], S.firstDay, v => {
        if (v === S.firstDay) return;
        const oldK = curKey(); S.firstDay = v; const ck = curKey();
        // keep this week's checks: move the current week to its new start date
        if (oldK !== ck && D.weeks[oldK] && !D.weeks[ck]) { D.weeks[ck] = D.weeks[oldK]; D.weeks[ck].start = ck; delete D.weeks[oldK]; }
        ensureWeek(ck); V.wk = ck; save(); render();
      })),
    h("div", { className: "field" }, h("span", null, t("theme")),
      seg([["auto", t("auto")], ["light", t("light")], ["dark", t("dark")]], S.theme, v => { S.theme = v; save(); render(); })));
  app.append(gen);

  const cats = h("div", { className: "card", style: { marginTop: "12px" } }, h("div", { className: "sec" }, t("categories")));
  D.cats.forEach((c, i) => cats.append(h("div", { className: "crow" },
    h("input", { type: "color", value: c.color, oninput: e => { c.color = e.target.value; save(); }, title: c.name }),
    h("input", { className: "inp", value: c.name, placeholder: t("catName"), "data-cid": c.id, oninput: e => { c.name = e.target.value; save(); }, onblur: e => { if (!e.target.value.trim()) { c.name = t("untitled"); save(); render(); } } }),
    h("button", { className: "mini x", title: t("del"), onclick: () => { if (confirm(t("delCatQ"))) { D.cats.splice(i, 1); save(); render(); } } }, "×"))));
  cats.append(h("button", { className: "addb", style: { marginTop: "6px", width: "100%" }, onclick: () => {
    const palette = ["#2f6fb3", "#b8860b", "#2e8b57", "#7b4fa8", "#c0573a", "#b03a48", "#1f8a8a", "#a0662a", "#5a6b7d"];
    const nc = { id: uid(), name: "", color: palette[D.cats.length % palette.length] }; D.cats.push(nc); save(); render();
    setTimeout(() => { const el = document.querySelector(`[data-cid="${nc.id}"]`); if (el) el.focus(); }, 0);
  } }, t("addCat")));
  app.append(cats);

  const file = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" }, onchange: e => {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => {
      try { const d = JSON.parse(r.result); if (!valid(d)) throw 0; if (!confirm(t("importQ"))) return; D = d; save(); V.wk = curKey(); ensureWeek(V.wk); render(); toast(t("importOk")); }
      catch (err) { alert(t("importBad")); }
    }; r.readAsText(f); e.target.value = "";
  } });
  const data = h("div", { className: "card", style: { marginTop: "12px" } },
    h("div", { className: "sec" }, t("data")), h("div", { className: "note" }, t("dataNote")),
    h("div", { className: "btns" },
      h("button", { className: "btn", onclick: () => {
        const blob = new Blob([JSON.stringify(D, null, 1)], { type: "application/json" });
        const a = h("a", { href: URL.createObjectURL(blob), download: `routine-backup-${todayKey()}.json` }); document.body.append(a); a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      } }, t("exportB")),
      h("button", { className: "btn", onclick: () => file.click() }, t("importB")),
      h("button", { className: "btn danger", onclick: () => { if (confirm(t("resetQ"))) { const lang = D.settings.lang; D = defaults(); D.settings.lang = lang; save(); V.wk = curKey(); ensureWeek(V.wk); render(); } } }, t("resetAll"))),
    file);
  app.append(data);
  if (deferredInstall) app.append(h("div", { style: { marginTop: "12px" } }, h("button", { className: "btn primary", onclick: async () => { deferredInstall.prompt(); deferredInstall = null; render(); } }, t("install"))));
}

/* ---------- install & offline ---------- */
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (V.tab === "settings") render(); });
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});

/* new week rolls over automatically when the app comes back into view */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const ck = curKey(); if (D.weeks[ck]) return;
  const older = sortedKeys().filter(k => k < ck), lastCur = older[older.length - 1];
  ensureWeek(ck); if (V.wk === lastCur) V.wk = ck; render();
});

render();
