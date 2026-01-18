import fetch from "node-fetch";
import crypto from "crypto";

export async function handler(event) {
  const body = JSON.parse(event.body);

  const claimKey = crypto
    .createHash("sha256")
    .update(`${body.phone}-${body.communityId}-${body.addressLine1}`)
    .digest("hex");

  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_CLAIMS_TABLE;
  const token = process.env.AIRTABLE_TOKEN;

  const url = `https://api.airtable.com/v0/${baseId}/${table}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        claimKey,
        communityId: body.communityId,
        addressLine1: body.addressLine1,
        unit: body.unit || "",
        firstName: body.firstName,
        phone: body.phone,
        createdAt: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    return { statusCode: 400, body: "Error saving claim" };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
}
