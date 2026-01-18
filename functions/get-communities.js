import fetch from "node-fetch";

export async function handler() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_COMMUNITIES_TABLE;
  const view = encodeURIComponent(process.env.AIRTABLE_ACTIVE_VIEW);
  const token = process.env.AIRTABLE_TOKEN;

  const url = `https://api.airtable.com/v0/${baseId}/${table}?view=${view}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify(
      data.records.map(r => ({
        id: r.fields.communityId,
        name: r.fields.name,
        type: r.fields.type,
        zip: r.fields.zip
      }))
    ),
  };
}
