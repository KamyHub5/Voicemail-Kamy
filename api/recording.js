import config from "./config.js";

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("Recording webhook body:", JSON.stringify(body));

  try {
    // Download recording using basic auth - no JWT needed
    const credentials = Buffer.from(`${config.VONAGE_API_KEY}:${config.VONAGE_API_SECRET}`).toString("base64");
    const dlRes = await fetch(recordingUrl, {
      headers: { Authorization: `Basic ${credentials}` }
    });

    if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);

    const audioBuffer = await dlRes.arrayBuffer();
    console.log("Downloaded bytes:", audioBuffer.byteLength);

    // Upload to file.io for public link
    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "voicemail.mp3");
    const uploadRes = await fetch("https://file.io/?expires=7d", { method: "POST", body: formData });
    const uploadResult = await uploadRes.json();
    console.log("file.io result:", JSON.stringify(uploadResult));

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
