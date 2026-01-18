/* communities.js
   Hello Neighbor — seed list (Names only)
   Region scope: Cypress + Bridgeland + Towne Lake + Fairfield + Rose Hill
*/

window.UNI_COMMUNITIES = [
  // --------------------------
  // HOME COMMUNITIES / NEIGHBORHOODS (HAR)
  // --------------------------
  { name: "Bridgeland", type: "home" },
  { name: "Bridgeland Parkland Village", type: "home" },
  { name: "Bridgeland Prairieland Village (Cypress)", type: "home" },
  { name: "Bridgeland Central", type: "home" },
  { name: "Bridgeland Hidden Creek", type: "home" },
  { name: "Bridgeland Lakeland Heights", type: "home" },
  { name: "Bridgeland First Bend", type: "home" },

  { name: "Towne Lake", type: "home" },
  { name: "Towne Lake Greene", type: "home" },

  { name: "Fairfield", type: "home" },
  { name: "Fairfield Village North", type: "home" },
  { name: "Fairfield Garden Grove", type: "home" },

  { name: "Marvida", type: "home" },

  { name: "Bridge Creek", type: "home" },
  { name: "Westgate", type: "home" },

  { name: "Cypress Creek Lakes", type: "home" },
  { name: "Canyon Village at Cypress Springs", type: "home" },
  { name: "Cypress Springs", type: "home" },
  { name: "Villages of Cypress Lakes", type: "home" },
  { name: "Cypress Oaks", type: "home" },

  { name: "Durham Pointe", type: "home" },

  // --------------------------
  // ROSE HILL (requested) — confirm exact community names
  // --------------------------
  { name: "Rose Hill", type: "home" },
  { name: "Rosehill", type: "home" },
  { name: "Rosehill Reserve", type: "home" },

  // --------------------------
  // APARTMENT / MULTI-FAMILY (Apartments.com)
  // NOTE: Your screenshot is not readable enough to extract names safely.
  // Paste the list of property names (text) and I’ll format it instantly.
  // --------------------------
  // { name: "Avalon at Cypress", type: "apartment" },
  // { name: "…", type: "apartment" },
].sort((a, b) => a.name.localeCompare(b.name));
