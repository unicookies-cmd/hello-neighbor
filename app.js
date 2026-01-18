// app.js — Hello Neighbor (screen flow + autocomplete + submit)
// Deploying on Netlify is recommended (forms/functions). If using GitHub Pages,
// set HELLO_CONFIG.apiBase to your Netlify site URL so the submit endpoint works.

(function () {
  const $ = (id) => document.getElementById(id);

  const cfg = window.HELLO_CONFIG || {};
  const communities = (window.UNI_COMMUNITIES || []).filter(c => (c.status || "active") === "active");

  // Screens
  const screens = ["s1","s2","s3","s4","s5"].map($);
  const show = (id) => {
    screens.forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
    $(id).classList.remove("fade");
    // re-trigger fade animation
    void $(id).offsetWidth;
    $(id).classList.add("fade");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toast
  const toast = $("toast");
  let toastTimer = null;
  const notify = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  // Copy
  $("ethos").textContent = cfg.ethosLine || "";

  // State
  const state = {
    community: null,       // {id,name,type,city,zip,requiresBuilding}
    communityName: "",
    communityType: "",     // "home" | "apartment"
    manualCommunity: false,
    address: {},
    person: {}
  };

  // Helpers
  const norm = (s) => String(s || "").trim().toUpperCase().replace(/\s+/g, " ");
  const digits = (s) => String(s || "").replace(/[^0-9]/g, "");
  const formatPhone = (s) => {
    const d = digits(s).slice(0,10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  // Screen 1 actions
  $("startBtn").addEventListener("click", () => show("s2"));

  // Screen 2: autocomplete
  const input = $("communityInput");
  const box = $("suggestBox");
  const manualBlock = $("manualTypeBlock");
  let manualTypeChosen = ""; // "home" | "apartment" when manual

  const renderSuggestions = (q) => {
    const query = norm(q);
    if (!query) { box.classList.add("hidden"); box.innerHTML = ""; manualBlock.classList.add("hidden"); return; }

    const matches = communities
      .filter(c => norm(c.name).includes(query))
      .slice(0, cfg.maxSuggestions || 7);

    const html = matches.map(c => `
      <div class="suggestitem" role="option" data-id="${c.id}">
        <div>
          <div><strong>${c.name}</strong></div>
          <div class="suggestmeta">${(c.type === "home") ? "Home community" : "Apartment / condo / loft"} • ${(c.city||"")}${(c.zip ? " " + c.zip : "")}</div>
        </div>
        <div class="suggestmeta">Select</div>
      </div>
    `).join("");

    // Manual option
    const manual = `
      <div class="suggestitem" role="option" data-manual="true">
        <div>
          <div><strong>Use “${q}”</strong></div>
          <div class="suggestmeta">Can’t find it? Type it in.</div>
        </div>
        <div class="suggestmeta">Select</div>
      </div>
    `;

    box.innerHTML = (html || "") + manual;
    box.classList.remove("hidden");
  };

  input.addEventListener("input", (e) => {
    renderSuggestions(e.target.value);
  });

  input.addEventListener("focus", (e) => renderSuggestions(e.target.value));

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.classList.add("hidden");
    }
  });

  box.addEventListener("click", (e) => {
    const item = e.target.closest(".suggestitem");
    if (!item) return;

    const manual = item.getAttribute("data-manual") === "true";
    if (manual) {
      state.manualCommunity = true;
      state.community = null;
      state.communityName = input.value.trim();
      state.communityType = "";
      manualTypeChosen = "";
      box.classList.add("hidden");
      manualBlock.classList.remove("hidden");
      notify("Select a community type.");
      return;
    }

    const id = item.getAttribute("data-id");
    const c = communities.find(x => x.id === id);
    if (!c) return;

    state.manualCommunity = false;
    state.community = c;
    state.communityName = c.name;
    state.communityType = c.type;
    input.value = c.name;
    manualBlock.classList.add("hidden");
    manualTypeChosen = "";
    box.classList.add("hidden");
    notify("Community selected.");
  });

  $("manualHome").addEventListener("click", () => {
    manualTypeChosen = "home";
    state.communityType = "home";
    notify("Home community selected.");
  });

  $("manualApt").addEventListener("click", () => {
    manualTypeChosen = "apartment";
    state.communityType = "apartment";
    notify("Apartment/condo selected.");
  });

  // Screen 2 nav
  $("back1").addEventListener("click", () => show("s1"));

  $("toAddress").addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return notify("Enter your community name.");
    state.communityName = name;

    if (!state.communityType) return notify("Choose a community type.");

    // Configure Screen 3 fields based on type + community info
    const home = $("homeFields");
    const apt  = $("aptFields");
    const buildingWrap = $("buildingWrap");

    home.classList.add("hidden");
    apt.classList.add("hidden");

    if (state.communityType === "home") {
      home.classList.remove("hidden");
      // Prefill city/zip if known
      const city = state.community?.city || "";
      const zip  = state.community?.zip || "";
      $("city").value = city;
      $("zip").value = zip;
      $("addrHelp").textContent = "Enter your street address so we can deliver smoothly.";
    } else {
      apt.classList.remove("hidden");
      const city = state.community?.city || "";
      const zip  = state.community?.zip || "";
      $("aptCity").value = city;
      $("aptZip").value = zip;

      const needsBuilding = !!state.community?.requiresBuilding;
      if (needsBuilding) buildingWrap.classList.remove("hidden");
      else buildingWrap.classList.add("hidden");

      $("addrHelp").textContent = "Enter your unit number. Add building if your property uses it.";
    }

    show("s3");
  });

  // Screen 3 nav
  $("back2").addEventListener("click", () => show("s2"));

  $("toDetails").addEventListener("click", () => {
    // Validate + store address
    if (state.communityType === "home") {
      const streetNumber = $("streetNumber").value.trim();
      const streetName = $("streetName").value.trim();
      const streetType = $("streetType").value;
      const city = $("city").value.trim();
      const zip = $("zip").value.trim();

      if (!streetNumber || !streetName) return notify("Enter your street number and street name.");

      state.address = { streetNumber, streetName, streetType, city, zip };
    } else {
      const unit = $("unit").value.trim();
      const building = $("building").value.trim();
      const city = $("aptCity").value.trim();
      const zip = $("aptZip").value.trim();

      if (!unit) return notify("Enter your unit / apt number.");

      // if community requires building, enforce it
      if (state.community?.requiresBuilding && !building) return notify("Enter your building.");

      state.address = { unit, building, city, zip };
    }

    show("s4");
  });

  // Screen 4 nav
  $("back3").addEventListener("click", () => show("s3"));

  $("phone").addEventListener("input", (e) => {
    e.target.value = formatPhone(e.target.value);
  });

  const buildClaimKey = () => {
    const communityKey = state.community?.id ? norm(state.community.id) : norm(state.communityName);
    if (state.communityType === "home") {
      const a = state.address;
      return [communityKey, norm(a.streetNumber), norm(a.streetName), norm(a.streetType), norm(a.zip || ""), norm(a.city || "")].filter(Boolean).join("|");
    }
    const a = state.address;
    // include building only if provided (or required)
    return [communityKey, norm(a.unit), norm(a.building || ""), norm(a.zip || ""), norm(a.city || "")].filter(Boolean).join("|");
  };

  const alreadyClaimedOnDevice = (claimKey) => {
    try{
      const v = localStorage.getItem("helloNeighbor:lastClaimKey");
      return v && v === claimKey;
    }catch(_){ return false; }
  };

  const markClaimedOnDevice = (claimKey) => {
    try{
      localStorage.setItem("helloNeighbor:lastClaimKey", claimKey);
      localStorage.setItem("helloNeighbor:lastClaimAt", new Date().toISOString());
    }catch(_){}
  };

  const apiUrl = (path) => {
    const base = (cfg.apiBase || "").replace(/\/$/, "");
    return base + path;
  };

  $("submitBtn").addEventListener("click", async () => {
    const firstName = $("firstName").value.trim();
    const lastName = $("lastName").value.trim();
    const phone = $("phone").value.trim();
    const notes = $("notes").value.trim();

    if (!firstName) return notify("First name is required.");
    if (digits(phone).length < 10) return notify("Enter a valid phone number.");

    state.person = { firstName, lastName, phone, notes };

    const claimKey = buildClaimKey();
    if (alreadyClaimedOnDevice(claimKey)) {
      return notify("This device already submitted this claim.");
    }

    const payload = {
      claimKey,
      communityId: state.community?.id || "",
      communityName: state.communityName,
      communityType: state.communityType,
      address: state.address,
      person: state.person,
      submittedAt: new Date().toISOString()
    };

    // Submit to Netlify function (recommended)
    // If you have not set up the function yet, you can still collect payload by email via Airtable automation later.
    const endpoint = apiUrl("/.netlify/functions/submit-claim");

    $("submitBtn").disabled = true;
    $("submitBtn").textContent = "Sending…";

    try{
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data && data.code === "DUPLICATE") {
          notify("This welcome box has already been claimed.");
          $("submitBtn").disabled = false;
          $("submitBtn").textContent = "Send me cookies.";
          return;
        }
        notify("Couldn’t submit right now. Try again.");
        $("submitBtn").disabled = false;
        $("submitBtn").textContent = "Send me cookies.";
        return;
      }

      markClaimedOnDevice(claimKey);
      renderSummary(payload, data);
      show("s5");
      notify("Claim received.");
    }catch(err){
      console.error(err);
      notify("Network error. Try again.");
    }finally{
      $("submitBtn").disabled = false;
      $("submitBtn").textContent = "Send me cookies.";
    }
  });

  const escapeHtml = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const renderSummary = (payload, data) => {
    const a = payload.address;
    const p = payload.person;

    let addrLine = "";
    if (payload.communityType === "home") {
      addrLine = `${escapeHtml(a.streetNumber)} ${escapeHtml(a.streetName)} ${escapeHtml(a.streetType)}, ${escapeHtml(a.city || "")} ${escapeHtml(a.zip || "")}`.replace(/\s+/g," ").trim();
    } else {
      addrLine = `Unit ${escapeHtml(a.unit)}${a.building ? " • Building " + escapeHtml(a.building) : ""}, ${escapeHtml(a.city || "")} ${escapeHtml(a.zip || "")}`.replace(/\s+/g," ").trim();
    }

    const orderId = data && data.orderId ? `Order ref: <strong>${escapeHtml(data.orderId)}</strong><br/>` : "";

    $("summary").innerHTML =
      `${orderId}` +
      `<strong>${escapeHtml(payload.communityName)}</strong><br/>` +
      `${addrLine}<br/>` +
      `${escapeHtml(p.firstName)}${p.lastName ? " " + escapeHtml(p.lastName) : ""} • ${escapeHtml(p.phone)}<br/>` +
      `${p.notes ? ("Notes: " + escapeHtml(p.notes)) : "Notes: —"}`;
  };

  $("newClaim").addEventListener("click", () => {
    // Reset inputs
    input.value = "";
    $("suggestBox").innerHTML = "";
    $("suggestBox").classList.add("hidden");
    $("manualTypeBlock").classList.add("hidden");

    ["streetNumber","streetName","city","zip","unit","building","aptCity","aptZip","firstName","lastName","phone","notes"].forEach(id => {
      const el = $(id);
      if (el) el.value = "";
    });

    state.community = null;
    state.communityName = "";
    state.communityType = "";
    state.manualCommunity = false;
    state.address = {};
    state.person = {};

    show("s1");
  });

})();