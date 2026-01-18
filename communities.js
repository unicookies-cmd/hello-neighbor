// communities.js
// Hello Neighbor — Community directory (Home communities + Apartment/Multi-family)
// Note: Keep apartment list ending with “Greenhouse Village Apartments” as requested.

window.COMMUNITIES = [
  // =========================
  // HOME / MASTER-PLANNED
  // =========================
  {
    name: "Cypress",
    kind: "home",
    city: "Cypress",
    state: "TX",
    zips: ["77433", "77373"],
    addressMode: "full" // street + city + zip
  },
  {
    name: "Bridgeland",
    kind: "home",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "full"
  },
  {
    name: "Towne Lake",
    kind: "home",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "full"
  },
  {
    name: "Fairfield",
    kind: "home",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "full"
  },
  {
    name: "Rose Hill",
    kind: "home",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "full"
  },

  // =========================
  // APARTMENTS / MULTI-FAMILY
  // (77433 + 77373)
  // =========================

  // ---- 77433 (Cypress) ----
  {
    name: "Alexan Cypress Creek",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit" // unit/apt + optional building + street optional
  },
  {
    name: "Allora Parkland",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Alys Crossing",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Cantera at Towne Lake",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Cortland North Haven",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Cue Luxury Apartments",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Lakeside Row Apartments",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "MAA Grand Cypress",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Prose Canopy",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },
  {
    name: "Skyview Flats",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  },

  // ---- 77373 (Spring) ----
  {
    name: "CW Cypresswood",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "Serena Woods Apartments",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "Spring Park",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "THE ABBEY AT NORTHPOINT",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "The Pierpont",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "The Tribute",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "Timber Run Apartments",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },
  {
    name: "Trailing Vine Apartments",
    kind: "apartment",
    city: "Spring",
    state: "TX",
    zips: ["77373"],
    addressMode: "unit"
  },

  // ---- MUST BE LAST (as requested) ----
  {
    name: "Greenhouse Village Apartments",
    kind: "apartment",
    city: "Cypress",
    state: "TX",
    zips: ["77433"],
    addressMode: "unit"
  }
];
