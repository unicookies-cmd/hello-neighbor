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
      if (id === activeId) el.classList.add("active");
      else el.classList.remove("active");
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
    const line = ETHOS_LINES[Math.floor(Math.random() * ETHOS_LINES.length)];
    el.textContent = line;
  }

  // ---------- State ----------
  const STATE = {
    communities: [],
    // selection:
    selectedCommunity: null,     // object from list
    manualCommunityName: "",     // when not found
    manualType: "",              // "home" | "apartment"
    // derived:
    mode: "",                    // "home" | "apartment"
  };

  // ---------- Communities loading ----------
  async function loadCommunities() {
    // 1) Netlify Function (preferred)
    try {
      const res = await fetch("/.netlify/functions/get-communities", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.communities) && data.communities.length) {
          return data.communities
            .map(normalizeCommunity)
            .filter((c) => c.status === "active" && c.name);
        }
      }
    } catch (_) {}

    // 2) Local fallback (communities.js)
    const local = Array.isArray(window.UNI_COMMUNITIES) ? window.UNI_COMMUNITIES : [];
    return local
      .map(normalizeCommunity)
      .filter((c) => c.status === "active" && c.name);
  }

  function normalizeCommunity(c) {
    const obj = c || {};
    return {
      id: obj.id || obj.communityId || obj.communityID || "",
      name: obj.name || "",
      type: normalize(obj.type) === "apartment" ? "apartment" : "home",
      city: obj.city || "",
      zip: obj.zip ? String(obj.zip) : "",
      requiresBuilding: !!obj.requiresBuilding,
      status: normalize(obj.status || "active"),
    };
  }

  // ---------- Suggestions UI ----------
  const MAX_SUGGESTIONS = 10;

  function setSuggestVisible(isVisible) {
    const box = $("suggestBox");
    if (!box) return;
    box.classList.toggle("hidden", !isVisible);
  }

  function setManualTypeBlockVisible(isVisible) {
    const block = $("manualTypeBlock");
    if (!block) return;
    block.classList.toggle("hidden", !isVisible);
  }

  function renderSuggestions(items) {
    const box = $("suggestBox");
    if (!box) return;

    if (!items.length) {
      box.innerHTML = "";
      setSuggestVisible(false);
      return;
    }

    box.innerHTML = items
      .map((c) => {
        const meta = [c.city, c.zip, c.type].filter(Boolean).join(" • ");
        return `
          <div class="item" role="option" data-id="${escapeHtml(c.id)}">
            <span>${escapeHtml(c.name)}</span>
            <span class="meta">${escapeHtml(meta)}</span>
          </div>
        `;
      })
      .join("");

    setSuggestVisible(true);

    // Click binding
    box.querySelectorAll(".item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        const found = STATE.communities.find((x) => String(x.id) === String(id));
        if (!found) return;

        // Set selection
        STATE.selectedCommunity = found;
        STATE.manualCommunityName = "";
        STATE.manualType = "";
        STATE.mode = found.type;

        // Fill input
        const input = $("communityInput");
        if (input) input.value = found.name;

        // Hide suggestion + manual block
        setSuggestVisible(false);
        setManualTypeBlockVisible(false);

        vib(15);
        showToast("Community selected");
      });
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function handleCommunityInput() {
    const input = $("communityInput");
    if (!input) return;

    const q = normalize(input.value);

    // Reset selection whenever user types
    STATE.selectedCommunity = null;
    STATE.manualCommunityName = safeStr(input.value);
    STATE.mode = "";

    // Manual type block shows if they typed something but no exact selection yet
    if (q.length >= 2) setManualTypeBlockVisible(true);
    else setManualTypeBlockVisible(false);

    // Suggestions
    if (!q) {
      renderSuggestions([]);
      return;
    }

    const matches = STATE.communities
      .filter((c) => normalize(c.name).includes(q))
      .slice(0, MAX_SUGGESTIONS);

    renderSuggestions(matches);
  }

  // ---------- Address mode & field visibility ----------
  function applyAddressMode(mode) {
    const home = $("homeFields");
    const apt = $("aptFields");
    const addrHelp = $("addrHelp");
    const buildingWrap = $("buildingWrap");

    STATE.mode = mode;

    if (mode === "home") {
      home && home.classList.remove("hidden");
      apt && apt.classList.add("hidden");
      addrHelp && (addrHelp.textContent = "Tell us where to deliver your welcome box.");
    } else if (mode === "apartment") {
      home && home.classList.add("hidden");
      apt && apt.classList.remove("hidden");
      addrHelp && (addrHelp.textContent = "Tell us your unit so we can deliver your welcome box.");
    } else {
      // none selected yet
      home && home.classList.add("hidden");
      apt && apt.classList.add("hidden");
    }

    // If selected community determines building requirement
    if (buildingWrap) {
      const req = !!STATE.selectedCommunity?.requiresBuilding;
      buildingWrap.style.display = req ? "" : "none";
    }
  }

  function prefillCityZipIfKnown() {
    const c = STATE.selectedCommunity;
    if (!c) return;

    if (STATE.mode === "home") {
      const city = $("city");
      const zip = $("zip");
      if (city && !city.value) city.value = c.city || "";
      if (zip && !zip.value) zip.value = c.zip || "";
    }

    if (STATE.mode === "apartment") {
      const city = $("aptCity");
      const zip = $("aptZip");
      if (city && !city.value) city.value = c.city || "";
      if (zip && !zip.value) zip.value = c.zip || "";
    }
  }

  // ---------- Validation ----------
  function validateCommunityStep() {
    const input = $("communityInput");
    const typed = safeStr(input ? input.value : "");

    if (!typed) {
      showToast("Enter your community name.");
      return false;
    }

    // If they selected from list, mode comes from that record
    if (STATE.selectedCommunity) {
      STATE.mode = STATE.selectedCommunity.type;
      return true;
    }

    // Manual path requires choosing a type
    if (!STATE.manualType) {
      showToast("Select a community type (Home or Apartment).");
      return false;
    }

    STATE.mode = STATE.manualType;
    return true;
  }

  function validateAddressStep() {
    if (STATE.mode === "home") {
      const streetNumber = safeStr($("streetNumber")?.value);
      const streetName = safeStr($("streetName")?.value);
      const city = safeStr($("city")?.value);
      const zip = safeStr($("zip")?.value);

      if (!streetNumber || !streetName) {
        showToast("Enter street number and street name.");
        return false;
      }
      if (!city || !zip) {
        showToast("Enter city and ZIP.");
        return false;
      }
      return true;
    }

    if (STATE.mode === "apartment") {
      const unit = safeStr($("unit")?.value);
      const city = safeStr($("aptCity")?.value);
      const zip = safeStr($("aptZip")?.value);

      if (!unit) {
        showToast("Enter your unit / apt #.");
        return false;
      }
      if (!city || !zip) {
        showToast("Enter city and ZIP.");
        return false;
      }
      return true;
    }

    showToast("Please select a community type.");
    return false;
  }

  function validateDetailsStep() {
    const firstName = safeStr($("firstName")?.value);
    const phone = safeStr($("phone")?.value);

    if (!firstName) {
      showToast("First name is required.");
      return false;
    }
    if (!phone) {
      showToast("Phone is required.");
      return false;
    }
    return true;
  }

  // ---------- Payload build ----------
  function getCommunityName() {
    const input = $("communityInput");
    return safeStr(STATE.selectedCommunity?.name || input?.value || STATE.manualCommunityName || "");
  }

  function getCommunityMeta() {
    const c = STATE.selectedCommunity;
    return {
      communityId: c?.id || "",
      communityName: getCommunityName(),
      communityType: STATE.mode || (c?.type || ""),
      communityCity: c?.city || "",
      communityZip: c?.zip || "",
      requiresBuilding: !!c?.requiresBuilding,
    };
  }

  function buildAddress() {
    if (STATE.mode === "home") {
      const streetNumber = safeStr($("streetNumber")?.value);
      const streetName = safeStr($("streetName")?.value);
      const streetType = safeStr($("streetType")?.value || "ST");
      const city = safeStr($("city")?.value);
      const zip = safeStr($("zip")?.value);

      const addressLine1 = `${streetNumber} ${streetName} ${streetType}`.trim();

      return {
        addressMode: "home",
        addressLine1,
        unit: "",
        building: "",
        city,
        zip,
      };
    }

    // apartment
    const unit = safeStr($("unit")?.value);
    const building = safeStr($("building")?.value);
    const city = safeStr($("aptCity")?.value);
    const zip = safeStr($("aptZip")?.value);

    return {
      addressMode: "apartment",
      addressLine1: "", // optional (we keep blank for apts unless you later add street input)
      unit,
      building,
      city,
      zip,
    };
  }

  function buildPerson() {
    const firstName = safeStr($("firstName")?.value);
    const lastName = safeStr($("lastName")?.value);
    const phone = safeStr($("phone")?.value);
    const notes = safeStr($("notes")?.value);

    // Optional email field (only if you add it)
    const email = safeStr($("email")?.value);

    return {
      firstName,
      lastName,
      phone,
      email, // optional
      notes,
    };
  }

  function buildPayload() {
    return {
      ...getCommunityMeta(),
      ...buildAddress(),
      ...buildPerson(),
      // Helpful system fields (safe)
      source: "hello-neighbor",
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent || "",
    };
  }

  // ---------- Submit ----------
  async function submitClaim() {
    if (!validateDetailsStep()) return;

    const payload = buildPayload();

    const btn = $("submitBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending…";
    }

    try {
      const res = await fetch("/.netlify/functions/submit-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try { data = await res.json(); } catch (_) {}

      if (!res.ok) {
        const msg = data?.error || "Could not submit. Please try again.";
        showToast(msg);

        if (btn) {
          btn.disabled = false;
          btn.textContent = "Send me cookies.";
        }
        return;
      }

      // Success
      vib(20);
      fillSummary(payload);
      setScreen("s5");

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Send me cookies.";
      }
    } catch (e) {
      showToast("Network error. Please try again.");

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Send me cookies.";
      }
    }
  }

  function fillSummary(payload) {
    const el = $("summary");
    if (!el) return;

    const name = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
    const comm = payload.communityName || "";
    const phone = payload.phone || "";

    let addrLine = "";
    if (payload.addressMode === "home") {
      addrLine = `${payload.addressLine1}, ${payload.city} ${payload.zip}`.trim();
    } else {
      const parts = [];
      if (payload.unit) parts.push(`Unit ${payload.unit}`);
      if (payload.building) parts.push(`Bldg ${payload.building}`);
      parts.push(`${payload.city} ${payload.zip}`.trim());
      addrLine = parts.filter(Boolean).join(" • ");
    }

    // Use divider area as readable summary (keeps your structure)
    el.innerHTML = `
      <div><strong>Name:</strong> ${escapeHtml(name || "—")}</div>
      <div><strong>Phone:</strong> ${escapeHtml(phone || "—")}</div>
      <div><strong>Community:</strong> ${escapeHtml(comm || "—")}</div>
      <div><strong>Address:</strong> ${escapeHtml(addrLine || "—")}</div>
    `;
  }

  // ---------- Bindings ----------
  function bindUI() {
    // Screen 1
    $("startBtn")?.addEventListener("click", () => {
      vib(15);
      setScreen("s2");
      $("communityInput")?.focus();
    });

    // Screen 2
    $("communityInput")?.addEventListener("input", handleCommunityInput);
    $("communityInput")?.addEventListener("focus", handleCommunityInput);

    // Dismiss suggest box if click outside
    document.addEventListener("click", (e) => {
      const box = $("suggestBox");
      const field = $("communityInput");
      if (!box || !field) return;
      if (box.contains(e.target) || field.contains(e.target)) return;
      setSuggestVisible(false);
    });

    $("manualHome")?.addEventListener("click", () => {
      STATE.manualType = "home";
      vib(15);
      showToast("Home community selected");
    });

    $("manualApt")?.addEventListener("click", () => {
      STATE.manualType = "apartment";
      vib(15);
      showToast("Apartment / condo selected");
    });

    $("back1")?.addEventListener("click", () => {
      vib(10);
      setScreen("s1");
    });

    $("toAddress")?.addEventListener("click", () => {
      if (!validateCommunityStep()) return;

      // Determine mode and show correct fields
      applyAddressMode(STATE.mode);

      // Prefill city/zip if selected community has them
      prefillCityZipIfKnown();

      vib(10);
      setScreen("s3");
    });

    // Screen 3
    $("back2")?.addEventListener("click", () => {
      vib(10);
      setScreen("s2");
    });

    $("toDetails")?.addEventListener("click", () => {
      if (!validateAddressStep()) return;
      vib(10);
      setScreen("s4");
    });

    // Screen 4
    $("back3")?.addEventListener("click", () => {
      vib(10);
      setScreen("s3");
    });

    $("submitBtn")?.addEventListener("click", submitClaim);

    // Screen 5
    $("newClaim")?.addEventListener("click", () => {
      vib(10);
      resetAll();
      setScreen("s1");
    });
  }

  function resetAll() {
    STATE.selectedCommunity = null;
    STATE.manualCommunityName = "";
    STATE.manualType = "";
    STATE.mode = "";

    // Clear inputs safely (only if present)
    const ids = [
      "communityInput",
      "streetNumber", "streetName", "city", "zip",
      "unit", "building", "aptCity", "aptZip",
      "firstName", "lastName", "phone", "notes", "email"
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.value = "";
    });

    // Reset visibility blocks
    setSuggestVisible(false);
    setManualTypeBlockVisible(false);
    applyAddressMode(""); // hides both
    setEthos();
  }

  // ---------- Boot ----------
  (async function init() {
    setEthos();
    setScreen("s1");

    // Load communities
    STATE.communities = await loadCommunities();

    // If list is empty, user can still type manually
    if (!STATE.communities.length) {
      setManualTypeBlockVisible(true);
      showToast("Communities list is loading or unavailable — you can type manually.");
    }

    bindUI();
  })();

})();
