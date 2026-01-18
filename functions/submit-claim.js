// functions/submit-claim.js
// Airtable write for Hello Neighbor claims (no node-fetch needed)

const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const body = JSON.parse(event.body || "{}");

    // Required basics
    const phone = String(body.phone || "").trim();
    const firstName = String(body.firstName || "").trim();

    // Community fields (support manual + selected)
    const communityId =
      String(body.communityId || "").trim() ||
      slugify(String(body.communityName || "").trim()) ||
      "manual-community";

    const communityName = String(body.communityName || "").trim();

    // Address (support home + apartment)
    const addressLine1 = String(body.addressLine1 || "").trim();
    const unit = String(body.unit || "").trim();
    const city = String(body.city || body.aptCity || "").trim();
    const zip = String(body.zip || body.aptZip || "").trim();

    // Optional fields
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim();
    const notes = String(body.notes || "").trim();
    const addressMode = String(body.addressMode || body.communityType || "").trim() || "";

    if (!firstName) return json(400, { error: "First name is required." });
    if (!phone) return json(400, { error: "Phone is required." });

    // For dedupe: include unit if apartment (addressLine1 may be blank for apts)
    const dedupeAddress = addressLine1 || unit || "";
    const claimKey = crypto
      .createHash("sha256")
      .update(`${phone}-${communityId}-${dedupeAddress}-${zip}`)
      .digest("hex");

    const baseId = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_CLAIMS_TABLE;
    const token = process.env.AIRTABLE_TOKEN;

    if (!baseId || !table || !token) {
      return json(500, { error: "Missing Airtable env vars on Netlify." });
    }

    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          // core
          claimKey,
          communityId,
          communityName,
          addressMode,
          addressLine1,
          unit,
          city,
          zip,
          // resident
          firstName,
          lastName,
          phone,
          email,
          notes,
          // system
          createdAt: new Date().toISOString(),
          status: "confirmed",
        },
      }),
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      return json(400, { error: "Error saving claim", details });
    }

    return json(200, { success: true, claimKey });
  } catch (err) {
    return json(500, { error: "Function crashed", message: err?.message || String(err) });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
