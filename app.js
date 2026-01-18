/* =========================================================
   Hello Neighbor — UniCookies (app.js)
   Matches your current index.html structure (s1–s5)
   Adds resident email support (optional)
   Communities: Netlify function first, then local fallback
   ========================================================= */

(function () {
  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);

  function showToast(msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function vib(ms = 15) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {}
  }

  function normalize(str) {
    return String(str || "").trim().toLowerCase();
  }

  function safeStr(v) {
    return String(v || "").trim();
  }

  function setScreen(activeId) {
    const ids = ["s1", "s2", "s3", "s4", "s5"];
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.classList.toggle("active", id === activeId);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Ethos ----------
  const ETHOS_LINES = [
    "A small gift. A soft landing. A sweet hello.",
    "Welcome home — take a breath and let today feel lighter.",
    "New place, same you. You’re allowed to rest into this moment.",
    "A neighborly hello, delivered with care.",
  ];

  function setEthos() {
    const el = $("ethos");
    if (!el) return;
    el.textContent = ETHOS_LINES[Math.floor(Math.random() * ETHOS_LINES.length)];
  }

  // ---------- State ----------
  const STATE = {
    communities: [],
    selectedCommunity: null,
    manualCommunityName: "",
    manualType: "",
    mode: "",
  };

  // ---------- Communities ----------
  async function loadCommunities() {
    try {
      const res = await fetch("/.netlify/functions/get-communities", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.communities)) {
          return data.communities.map(normalizeCommunity).filter(c => c.status === "active");
        }
      }
    } catch (_) {}

    const local = Array.isArray(window.UNI_COMMUNITIES) ? window.UNI_COMMUNITIES : [];
    return local.map(normalizeCommunity).filter(c => c.status === "active");
  }

  function normalizeCommunity(c) {
    return {
      id: c.id || c.communityId || "",
      name: c.name || "",
      type: normalize(c.type) === "apartment" ? "apartment" : "home",
      city: c.city || "",
      zip: c.zip ? String(c.zip) : "",
      requiresBuilding: !!c.requiresBuilding,
      status: normalize(c.status || "active"),
    };
  }

  // ---------- Suggestions ----------
  const MAX_SUGGESTIONS = 10;

  function setSuggestVisible(v) {
    $("suggestBox")?.classList.toggle("hidden", !v);
  }

  function setManualTypeBlockVisible(v) {
    $("manualTypeBlock")?.classList.toggle("hidden", !v);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderSuggestions(items) {
    const box = $("suggestBox");
    if (!box || !items.length) return setSuggestVisible(false);

    box.innerHTML = items.map(c => `
      <div class="item" data-id="${escapeHtml(c.id)}">
        <span>${escapeHtml(c.name)}</span>
        <span class="meta">${escapeHtml([c.city, c.zip, c.type].filter(Boolean).join(" • "))}</span>
      </div>
    `).join("");

    setSuggestVisible(true);

    box.querySelectorAll(".item").forEach(el => {
      el.addEventListener("click", () => {
        STATE.selectedCommunity = STATE.communities.find(c => c.id == el.dataset.id);
        STATE.manualType = "";
        STATE.mode = STATE.selectedCommunity.type;
        $("communityInput").value = STATE.selectedCommunity.name;
        setSuggestVisible(false);
        setManualTypeBlockVisible(false);
        vib(); showToast("Community selected");
      });
    });
  }

  function handleCommunityInput() {
    const q = normalize($("communityInput")?.value);
    STATE.selectedCommunity = null;
    STATE.manualCommunityName = q;
    if (q.length >= 2) setManualTypeBlockVisible(true);
    renderSuggestions(
      q ? STATE.communities.filter(c => normalize(c.name).includes(q)).slice(0, MAX_SUGGESTIONS) : []
    );
  }

  // ---------- Address Mode ----------
  function applyAddressMode(mode) {
    STATE.mode = mode;
    $("homeFields")?.classList.toggle("hidden", mode !== "home");
    $("aptFields")?.classList.toggle("hidden", mode !== "apartment");
  }

  // ---------- Validation ----------
  function validateCommunityStep() {
    if (!$("communityInput")?.value) return showToast("Enter your community name."), false;
    if (!STATE.selectedCommunity && !STATE.manualType)
      return showToast("Select a community type."), false;
    STATE.mode = STATE.selectedCommunity?.type || STATE.manualType;
    return true;
  }

  function validateAddressStep() { return true; }
  function validateDetailsStep() { return !!$("firstName")?.value && !!$("phone")?.value; }

  // ---------- Payload ----------
  function buildPayload() {
    return {
      communityName: $("communityInput")?.value,
      communityType: STATE.mode,
      firstName: $("firstName")?.value,
      lastName: $("lastName")?.value,
      phone: $("phone")?.value,
      email: $("email")?.value || "",
      submittedAt: new Date().toISOString(),
    };
  }

  // ---------- Submit ----------
  async function submitClaim() {
    if (!validateDetailsStep()) return showToast("Name and phone required.");
    await fetch("/.netlify/functions/submit-claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload())
    });
    setScreen("s5");
  }

  // ---------- UI Bindings ----------
  function bindUI() {
    $("communityInput")?.addEventListener("input", handleCommunityInput);

    // ✅ Manual type selection with overlay
    const btnHome = $("manualHome");
    const btnApt = $("manualApt");

    function setManualType(type) {
      STATE.manualType = type;
      btnHome?.classList.toggle("is-selected", type === "home");
      btnApt?.classList.toggle("is-selected", type === "apartment");
      vib(); showToast(type === "home" ? "Home community selected" : "Apartment / condo selected");
    }

    btnHome?.addEventListener("click", () => setManualType("home"));
    btnApt?.addEventListener("click", () => setManualType("apartment"));

    $("submitBtn")?.addEventListener("click", submitClaim);
    $("newClaim")?.addEventListener("click", resetAll);
  }

  function resetAll() {
    Object.assign(STATE, { selectedCommunity: null, manualType: "", mode: "" });
    ["manualHome", "manualApt"].forEach(id =>
      $(id)?.classList.remove("is-selected")
    );
    document.querySelectorAll("input").forEach(i => i.value = "");
    setScreen("s1");
    setEthos();
  }

  // ---------- Boot ----------
  (async function init() {
    setEthos();
    STATE.communities = await loadCommunities();
    bindUI();
    setScreen("s1");
  })();
})();
