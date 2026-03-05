import config from "./config.js";

export default async function handler(req, res) {
  const body = req.body || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = body.from;

  console.log("Recording webhook body:", JSON.stringify(body));

  try {
    const text = `New voicemail from ${callerNumber} at ${startTime}. Recording: ${recordingUrl}`;
    const smsUrl = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=${config.VONAGE_NUMBER}&to=${config.KAMY_NUMBER}&text=${encodeURIComponent(text)}`;
    const smsResponse = await fetch(smsUrl);
    const smsResult = await smsResponse.text();
    console.log("SMS result:", smsResult);
  } catch (err) {
    console.error("Error:", err.message);
  }

  res.status(200).json({ status: "ok" });
}
