// config.js — Hello Neighbor (frontend-safe config)
// NOTE: Secrets (Airtable token) must NEVER go here. They live in Netlify env vars.
window.HELLO_CONFIG = {
  brandHandle: "@eatunicookies",
  // If hosting on Netlify: leave apiBase as "".
  // If hosting on GitHub Pages while your function is on Netlify:
  // set apiBase to "https://YOUR-SITE.netlify.app"
  apiBase: "",
  // Copy
  ethosLine: "A moment of sweetness for your new chapter.",
  supportEmail: "eatunicookies@gmail.com",
  // UX
  maxSuggestions: 7
};
