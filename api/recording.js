import config from "./config.js";

export default async function handler(req, res) {
  const body = req.body || req.query;
  const recordingUrl = body.recording_url;
  const timestamp = body.start_time;

  console.log("NEW VOICEMAIL RECEIVED");
  console.log("Recording URL:", recordingUrl);
  console.log("Time:", timestamp);

  // Send SMS to Kamy via Vonage
  try {
    const response = await fetch("https://rest.nexmo.com/sms/json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.VONAGE_API_KEY,
        api_secret: config.VONAGE_API_SECRET,
        from: config.VONAGE_NUMBER,
        to: config.KAMY_NUMBER,
        text: `New voicemail received at ${timestamp}. Listen here: ${recordingUrl}`
      })
    });

    const result = await response.json();
    console.log("SMS result:", JSON.stringify(result));
  } catch (err) {
    console.error("SMS failed:", err);
  }

  res.status(200).json({ status: "ok" });
}
