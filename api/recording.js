import config from "./config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("Query params:", JSON.stringify(query));
  console.log("Recording URL:", recordingUrl);

  try {
    // Step 1: Generate JWT
    const token = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
    console.log("Step 1 JWT OK");

    // Step 2: Download MP3
    const dlRes = await fetch(recordingUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Step 2 download status:", dlRes.status);
    if (!dlRes.ok) {
      const errText = await dlRes.text();
      console.error("Download error:", errText);
      throw new Error(`Download failed: ${dlRes.status}`);
    }

    const audioBuffer = await dlRes.arrayBuffer();
    console.log("Step 3 downloaded bytes:", audioBuffer.byteLength);

    // Step 3: Upload to file.io
    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "voicemail.mp3");
    const uploadRes = await fetch("https://file.io/?expires=7d", { method: "POST", body: formData });
    const uploadText = await uploadRes.text();
    console.log("Step 4 file.io raw:", uploadText);

    const uploadResult = JSON.parse(uploadText);
    const publicUrl = uploadResult.link || recordingUrl;

    // Step 4: Send SMS
    const text = `New voicemail from ${callerNumber} at ${startTime}. Recording: ${publicUrl}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;
    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    console.log("Step 5 SMS result:", smsResult);

  } catch (err) {
    console.error("FAILED AT:", err.message);

    // Fallback — send SMS with private URL anyway
    try {
      const text = `New voicemail from ${callerNumber} at ${startTime}. Recording: ${recordingUrl}`;
      const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;
      await fetch(smsUrl);
      console.log("Fallback SMS sent");
    } catch (e) {
      console.error("Fallback SMS failed:", e.message);
    }
  }

  res.status(200).json({ status: "ok" });
}
