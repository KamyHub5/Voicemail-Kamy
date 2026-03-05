import config from "./config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("Recording URL:", recordingUrl);
  console.log("Caller:", callerNumber);

  try {
    // Download from Vonage with JWT
    const token = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
    const dlRes = await fetch(recordingUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Download status:", dlRes.status);

    const audioBuffer = await dlRes.arrayBuffer();
    console.log("Downloaded bytes:", audioBuffer.byteLength);

    // Upload to catbox.moe
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", new Blob([audioBuffer], { type: "audio/mpeg" }), "voicemail.mp3");

    const uploadRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData
    });
    const publicUrl = await uploadRes.text();
    console.log("Catbox URL:", publicUrl);

    // Format date and time
    const date = new Date(startTime);
    const formattedDate = date.toLocaleDateString("en-US", { timeZone: "America/New_York" });
    const formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "America/New_York" });

    // Send SMS
    const text = `New voicemail From: ${callerNumber} Date: ${formattedDate} Time: ${formattedTime} ET Listen: ${publicUrl.trim()}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;
    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    console.log("SMS result:", smsResult);

  } catch (err) {
    console.error("Error:", err.message);
    // Fallback SMS
    const text = `New voicemail From: ${callerNumber} Date: ${startTime}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;
    await fetch(smsUrl);
  }

  res.status(200).json({ status: "ok" });
}
