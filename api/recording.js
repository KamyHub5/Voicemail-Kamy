import config from "./config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  res.status(200).json({ status: "ok" });

  const body = req.body || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = body.from;

  try {
    // Generate JWT to authenticate download of recording from Vonage
    const jwt = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);

    // Download the MP3 from Vonage
    const audioResponse = await fetch(recordingUrl, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const audioBuffer = await audioResponse.arrayBuffer();

    // Upload to file.io to get a public link
    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "voicemail.mp3");

    const uploadResponse = await fetch("https://file.io", {
      method: "POST",
      body: formData
    });
    const uploadResult = await uploadResponse.json();
    const fileUrl = uploadResult.link;

    console.log("File.io upload result:", JSON.stringify(uploadResult));

    // Send SMS with all info
    const text = `New voicemail from ${callerNumber} at ${startTime}. Listen: ${fileUrl}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;

    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    console.log("SMS result:", smsResult);

  } catch (err) {
    console.error("Recording handler error:", err.message);
  }
}
