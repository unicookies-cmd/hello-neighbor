// functions/get-communities.js
// Returns active communities from Airtable "Active Communities" view

exports.handler = async () => {
  try {
    const AIRTABLE_TOKEN = process.env.airtable_token;
    const BASE_ID = process.env.airtable_base_id;
    const TABLE = process.env.airtable_communities_table || "Communities";
    const VIEW = process.env.airtable_active_view || "Active Communities";

    if (!AIRTABLE_TOKEN || !BASE_ID) {
      return json(500, { error: "Missing Airtable env vars (airtable_token / airtable_base_id)." });
    }

    const url =
      `https://api.airtable.com/v0/${encodeURIComponent(BASE_ID)}/${encodeURIComponent(TABLE)}` +
      `?view=${encodeURIComponent(VIEW)}` +
      `&pageSize=100`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return json(res.status, { error: "Airtable request failed", details: text });
    }

    const data = await res.json();

    // Map Airtable fields -> app-friendly objects
    const communities = (data.records || []).map((r) => {
      const f = r.fields || {};
      return {
        id: f.communityId || f.communityid || r.id, // handle minor naming differences
        name: f.name || f.communityName || f.communityname || "",
        type: (f.type || "home").toString().toLowerCase(), // "home" | "apartment"
        city: f.city || "",
        zip: (f.zip || "").toString(),
        requiresBuilding: !!f.requiresBuilding,
        status: (f.status || "").toString().toLowerCase(),
      };
    });

    // Only return real names
    const filtered = communities
      .filter((c) => c.name && c.status === "active")
      .sort((a, b) => a.name.localeCompare(b.name));

    return json(200, { ok: true, count: filtered.length, communities: filtered });
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
