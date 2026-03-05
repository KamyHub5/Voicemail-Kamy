import config from "./config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("Recording webhook body:", JSON.stringify(body));

  try {
    // Generate JWT
    const token = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
    console.log("JWT generated OK");

    // Download recording
    const dlRes = await fetch(recordingUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Download status:", dlRes.status);

    if (!dlRes.ok) {
      const errText = await dlRes.text();
      throw new Error(`Download failed: ${dlRes.status} ${errText}`);
    }

    const audioBuffer = await dlRes.arrayBuffer();
    console.log("Downloaded bytes:", audioBuffer.byteLength);

    // Upload to file.io
    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "voicemail.mp3");
    const uploadRes = await fetch("https://file.io/?expires=7d", { method: "POST", body: formData });
    const uploadText = await uploadRes.text();
    console.log("file.io raw response:", uploadText);

    const uploadResult = JSON.parse(uploadText);
    const publicUrl = uploadResult.link || recordingUrl;

    const text = `New voicemail from ${callerNumber} at ${startTime}. Recording: ${publicUrl}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;
    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    console.log("SMS result:", smsResult);

  } catch (err) {
    console.error("Error:", err.message);
  }

  res.status(200).json({ status: "ok" });
}
