/* Leonida Ledger — tracker logic.
   Loads app/data/trophies.json, renders the checklist, roadmap and guide
   panel, and keeps earned progress in localStorage. No network at run time
   beyond fetching the local data file. */

const STORAGE_KEY = "leonida-ledger-progress-v1";
const SPOILER_KEY = "leonida-ledger-spoilers-v1";

const STAGES = [
  { n: 1, title: "Opening — Leonida", desc: "Play Gone Fishing and finish Chapter 1. Do the Chapter 1 meditation while you are here — it may not come back later." },
  { n: 2, title: "Story — Chapters 2–3", desc: "Finish Chapters 2 and 3, work the stranger strands, and explore Vice City as it opens up." },
  { n: 3, title: "Story — Chapter 4 & finale", desc: "Finish Chapter 4, the final mission, and the five strand finales (Andy, Kenton, Billy, Randy, Tyrone)." },
  { n: 4, title: "Activities & skills", desc: "Races, the shooting range, stunts, hunting, fishing, robberies and the money trophies." },
  { n: 5, title: "Collectibles & map", desc: "Cards, WAiNK posts, vehicles, all 52 areas and the garage properties." },
  { n: 6, title: "Clean-up & Platinum", desc: "Mop up the cryptic trophies, finish 100% completion, and the Platinum pops." }
];

let trophies = [];
let earned = new Set();
let filter = "all";
let query = "";
let spoilersHidden = false;
let selectedId = null;

const $ = (id) => document.getElementById(id);
const listEl = $("trophy-list");
const stagesEl = $("stages");

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) earned = new Set(data.earned.filter((n) => Number.isInteger(n)));
  } catch (e) { /* corrupted save: start fresh */ }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() }));
  } catch (e) { /* storage full or blocked: progress just does not persist */ }
}

function loadSpoilerPref() {
  try { spoilersHidden = localStorage.getItem(SPOILER_KEY) === "1"; } catch (e) { spoilersHidden = false; }
  $("spoiler-toggle").checked = spoilersHidden;
}

function saveSpoilerPref() {
  try { localStorage.setItem(SPOILER_KEY, spoilersHidden ? "1" : "0"); } catch (e) { /* ignore */ }
}

function gradeChip(t) {
  return `<span class="chip chip-${t.grade}">${t.grade}</span>`;
}

function isSpoilerHidden(t) {
  return spoilersHidden && t.kind === "story" && !earned.has(t.id);
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  $("progress-count").textContent = `${n} / ${total}`;
  $("progress-fill").style.width = `${total ? Math.round((n / total) * 100) : 0}%`;
  const platinum = trophies.find((t) => t.grade === "platinum");
  const platinumDone = platinum ? earned.has(platinum.id) : false;
  $("progress-platinum").textContent = platinumDone
    ? "Platinum earned — Leonida Legend!"
    : `Platinum: ${Math.max(0, total - 1 - n)} to go`;
}

function renderRoadmap() {
  stagesEl.innerHTML = STAGES.map((s) => {
    const inStage = trophies.filter((t) => t.stage === s.n);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    return `<li class="${done === inStage.length && inStage.length ? "active-stage" : ""}">
      <div class="stage-num">Stage ${s.n}</div>
      <div class="stage-title">${s.title}</div>
      <p class="stage-desc">${s.desc}</p>
      <div class="stage-count">${done} / ${inStage.length} trophies</div>
    </li>`;
  }).join("");
}

function visibleTrophies() {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filter === "story" && t.kind !== "story") return false;
    if (filter === "missable" && !t.missable) return false;
    if (filter === "collectible" && t.kind !== "collectible") return false;
    if (filter === "activity" && t.kind !== "activity") return false;
    if (filter === "online" && t.kind !== "online") return false;
    if (filter === "earned" && !earned.has(t.id)) return false;
    if (filter === "remaining" && earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderList() {
  const items = visibleTrophies();
  $("list-count").textContent = `${items.length} of ${trophies.length} trophies`;
  if (!items.length) {
    listEl.innerHTML = `<li class="trophy-row" style="cursor:default"><div class="trophy-body"><div class="trophy-name">No trophies match</div><div class="trophy-desc">Try a different filter or search.</div></div></li>`;
    return;
  }
  listEl.innerHTML = items.map((t) => {
    const hidden = isSpoilerHidden(t);
    const name = hidden ? "Hidden story trophy" : t.name;
    const desc = hidden ? "Earn this trophy to reveal its name and description." : t.description;
    const tags = [gradeChip(t)];
    if (t.missable) tags.push(`<span class="chip chip-missable">Missable</span>`);
    if (t.hidden) tags.push(`<span class="chip chip-hidden">Hidden</span>`);
    tags.push(`<span class="chip chip-kind">${t.kind}</span>`);
    if (t.count) tags.push(`<span class="chip chip-kind">×${t.count}</span>`);
    return `<li><button class="trophy-row ${earned.has(t.id) ? "earned" : ""} ${selectedId === t.id ? "selected" : ""}" data-id="${t.id}" type="button">
      <input class="trophy-check" type="checkbox" ${earned.has(t.id) ? "checked" : ""} data-check="${t.id}" aria-label="Mark ${t.name} as earned" tabindex="-1">
      <span class="trophy-body">
        <span class="trophy-name">${name}</span>
        <span class="trophy-desc">${desc}</span>
        <span class="trophy-tags">${tags.join("")}</span>
      </span>
    </button></li>`;
  }).join("");
}

function renderGuide() {
  const card = $("guide-card");
  const empty = $("guide-empty");
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) { card.hidden = true; empty.hidden = false; return; }
  empty.hidden = true;
  card.hidden = false;
  const hidden = isSpoilerHidden(t);
  $("guide-grade").innerHTML = gradeChip(t);
  $("guide-name").textContent = hidden ? "Hidden story trophy" : t.name;
  $("guide-desc").textContent = hidden ? "Earn this trophy to reveal its name and description." : t.description;
  const stage = STAGES.find((s) => s.n === t.stage);
  const meta = [];
  if (t.missable) meta.push(`<span class="chip chip-missable">Missable</span>`);
  if (t.hidden) meta.push(`<span class="chip chip-hidden">Hidden on PSN</span>`);
  meta.push(`<span class="chip chip-kind">${t.kind}</span>`);
  if (t.count) meta.push(`<span class="chip chip-kind">Count: ${t.count}</span>`);
  if (stage) meta.push(`<span class="chip chip-kind">Roadmap stage ${stage.n}: ${stage.title}</span>`);
  $("guide-meta").innerHTML = meta.join("");
  $("guide-text").textContent = hidden
    ? "This is a story trophy, and its guide is hidden by your spoiler setting. Earn it in the game, then tick it here to reveal the guide."
    : t.guide;
  $("guide-steps").innerHTML = hidden ? "" : (t.steps || []).map((s) => `<li>${s}</li>`).join("");
  $("guide-sources").innerHTML = (t.sources || []).map((s) => {
    const m = s.match(/https?:\/\/\S+/);
    if (m) {
      const url = m[0].replace(/[)]$/, "");
      const label = s.replace(url, "").trim();
      return `<li>${label ? `${label} — ` : ""}<a href="${url}" target="_blank" rel="noopener">${url}</a></li>`;
    }
    return `<li>${s}</li>`;
  }).join("");
  const earnBtn = $("guide-earn");
  const isEarned = earned.has(t.id);
  earnBtn.textContent = isEarned ? "Earned ✓ — unmark" : "Mark as earned";
  earnBtn.classList.toggle("earned", isEarned);
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
  renderGuide();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveProgress();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderGuide();
  const params = new URLSearchParams(window.location.search);
  params.set("trophy", String(id));
  history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
}

/* Events */

listEl.addEventListener("click", (e) => {
  const check = e.target.closest("[data-check]");
  if (check) {
    e.preventDefault();
    toggleEarned(Number(check.dataset.check));
    return;
  }
  const row = e.target.closest("[data-id]");
  if (row) selectTrophy(Number(row.dataset.id));
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    if (filter === "online") {
      $("online-note").textContent = "Online trophies: the official list for Grand Theft Auto VI has no online trophies — this filter shows nothing, which is the honest answer.";
    }
    renderList();
  });
});

$("search").addEventListener("input", (e) => { query = e.target.value; renderList(); });

$("spoiler-toggle").addEventListener("change", (e) => {
  spoilersHidden = e.target.checked;
  saveSpoilerPref();
  renderList();
  renderGuide();
});

$("guide-earn").addEventListener("click", () => {
  if (selectedId != null) toggleEarned(selectedId);
});

$("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ app: "leonida-ledger", version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-ledger-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

$("import-btn").addEventListener("click", () => $("import-file").click());

$("import-file").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data.earned) ? data.earned : [];
    const valid = ids.filter((n) => Number.isInteger(n) && trophies.some((t) => t.id === n));
    earned = new Set(valid);
    saveProgress();
    renderAll();
    alert(`Imported progress: ${valid.length} trophies earned.`);
  } catch (err) {
    alert("That file could not be imported — it is not a valid Leonida Ledger progress file.");
  }
  e.target.value = "";
});

$("reset-btn").addEventListener("click", () => {
  if (!confirm("Clear all earned trophies? This cannot be undone.")) return;
  earned = new Set();
  saveProgress();
  renderAll();
});

/* Deep links: ?trophy=17 opens that guide; ?view=roadmap scrolls to the roadmap;
   ?spoiler=1 turns the spoiler setting on; ?filter=missable applies a filter. */

function applyDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const tid = Number(params.get("trophy"));
  if (Number.isInteger(tid) && trophies.some((t) => t.id === tid)) selectedId = tid;
  const f = params.get("filter");
  if (["all", "story", "missable", "collectible", "activity", "online", "earned", "remaining"].includes(f)) {
    filter = f;
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.toggle("active", b.dataset.filter === f));
  }
  if (params.get("spoiler") === "1") {
    spoilersHidden = true;
    $("spoiler-toggle").checked = true;
    saveSpoilerPref();
  }
  if (params.get("view") === "roadmap") {
    setTimeout(() => $("roadmap").scrollIntoView({ behavior: "smooth" }), 100);
  }
}

/* Init */

fetch("data/trophies.json")
  .then((r) => { if (!r.ok) throw new Error("trophies.json failed to load"); return r.json(); })
  .then((data) => {
    trophies = data.trophies || [];
    loadProgress();
    loadSpoilerPref();
    applyDeepLink();
    renderAll();
  })
  .catch((err) => {
    listEl.innerHTML = `<li class="trophy-row" style="cursor:default"><div class="trophy-body"><div class="trophy-name">The trophy data could not be loaded</div><div class="trophy-desc">Make sure data/trophies.json sits next to this page and reload.</div></div></li>`;
  });
