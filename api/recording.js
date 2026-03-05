import { createRequire } from "module";
const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

import config from "./config.js";

function generateVonageJWT() {
  const payload = {
    application_id: config.VONAGE_APP_ID,
    iat: Math.floor(Date.now() / 1000),
    jti: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    exp: Math.floor(Date.now() / 1000) + 60,
  };
  return jwt.sign(payload, config.VONAGE_PRIVATE_KEY, { algorithm: "RS256" });
}

async function getPublicRecordingUrl(vonageUrl) {
  const token = generateVonageJWT();
  const dlRes = await fetch(vonageUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!dlRes.ok) {
    throw new Error(`Vonage download failed: ${dlRes.status} ${await dlRes.text()}`);
  }

  const audioBuffer = await dlRes.arrayBuffer();
  console.log("Downloaded audio bytes:", audioBuffer.byteLength);

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: "audio/mpeg" }),
    "voicemail.mp3"
  );

  const uploadRes = await fetch("https://file.io/?expires=7d", {
    method: "POST",
    body: formData,
  });

  const uploadResult = await uploadRes.json();
  console.log("file.io result:", JSON.stringify(uploadResult));

  if (!uploadResult.success || !uploadResult.link) {
    throw new Error(`file.io upload failed: ${JSON.stringify(uploadResult)}`);
  }

  return uploadResult.link;
}

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("Recording webhook body:", JSON.stringify(body));

  res.status(200).json({ status: "ok" });

  try {
    let publicUrl = recordingUrl;

    try {
      publicUrl = await getPublicRecordingUrl(recordingUrl);
      console.log("Public URL:", publicUrl);
    } catch (uploadErr) {
      console.error("Failed to get public URL, falling back:", uploadErr.message);
    }

    const text = `New voicemail from ${callerNumber} at ${startTime}. Recording: ${publicUrl}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;

    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    console.log("SMS result:", smsResult);
  } catch (err) {
    console.error("Error in recording handler:", err.message);
  }
}
