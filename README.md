# Hello Neighbor — UniCookies (Event & Partner Ready)

This is a **Hello Neighbor** claim experience for UniCookies community partnerships.
New residents scan a QR code, select their community, enter delivery details, and submit a claim.

**Design goal:** calm, centered, premium — aligned with UniCookies “A Sweet Message” and “A Moment” cards.

---

## What this is (for customers)

A quick claim flow to request a **welcome cookie gift** from a participating community.

- No account
- No checkout
- Fast + friendly
- Built for mobile

---

## How it works (ops)

1. Resident submits a claim.
2. The system checks if the **address/unit already claimed** (dedupe).
3. If not claimed, it creates a record in Airtable.
4. Airtable automation emails the UniCookies team to fulfill delivery.

> **Why Airtable?** It enables “claimed vs not claimed” with minimal human interaction and can stay on the free plan for early runs.

---

## Deploy options

### Recommended: Netlify (best UX + automation)
Netlify hosts the site and runs the serverless function that talks to Airtable.

1. Create a new GitHub repo and upload these files.
2. In Netlify: **Add new site → Import from Git** (choose this repo)
3. Deploy (no build step).

Add environment variables in Netlify:
- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_CLAIMS` (optional; default is `Claims`)

### If you must host on GitHub Pages
GitHub Pages **cannot run serverless functions**.
You can still host the front-end on GitHub Pages and keep the submit endpoint on Netlify:
1. Deploy the same repo to Netlify (for functions)
2. In `config.js`, set:
   `apiBase: "https://YOUR-SITE.netlify.app"`
3. GitHub Pages will call the Netlify function for submit/dedupe.

---

## Airtable setup (minimal)

Create a base: **Hello Neighbor**

### Table: Communities
Fields:
- `communityId` (text)
- `name` (text)
- `type` (single select: home / apartment)
- `city` (text)
- `zip` (text)
- `requiresBuilding` (checkbox)
- `status` (single select: active / paused)

### Table: Claims (exact field names expected)
- `claimKey` (text) **unique key**
- `communityId` (text)
- `communityName` (text)
- `communityType` (text)
- `streetNumber` (text)
- `streetName` (text)
- `streetType` (text)
- `unit` (text)
- `building` (text)
- `city` (text)
- `zip` (text)
- `firstName` (text)
- `lastName` (text)
- `phone` (text)
- `notes` (long text)
- `submittedAt` (date/time)

### Airtable automation (email)
Create an automation:
- Trigger: **When record created** in `Claims`
- Action: **Send email** to `eatunicookies@gmail.com`
- Subject suggestion: `Hello Neighbor Order (New Tenant)`
- Body should include community + address + name + phone + notes.

---

## How QR codes map to the experience

Use a single QR destination:
- `https://hello.eatunicookies.com/`

The community list is curated in `communities.js`.
Update that file before an event / partner activation.

---

## How to test before an event

1. Open the site on your phone.
2. Submit a test claim with an obvious unit like `TEST-1`.
3. Confirm:
   - A record appears in Airtable
   - Your email automation fires
4. Try submitting the same claim again — it should show “already claimed.”

---

## If it looks broken

Common checks:
- **404 on CSS/JS:** verify file names match (e.g. `styles.css`)
- **Submit fails:** confirm `apiBase` in `config.js` and Netlify env vars
- **Dedupe not working:** confirm `Claims` table includes `claimKey`

---

## Replace assets

- Replace `assets/logo.svg` with your real logo (SVG or PNG)
- Update brand colors in `styles.css` if needed (brand color is `#2aace2`)

---

## Add new communities later

Edit `communities.js`:

```js
window.UNI_COMMUNITIES.push({
  id: "MY-COMMUNITY-1",
  name: "My Community Name",
  type: "apartment",
  city: "Houston",
  zip: "77000",
  requiresBuilding: false,
  status: "active"
});
```

---

UniCookies — emotional intelligence, wellness, and exceptional experiences.
