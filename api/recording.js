import config from "./config.js";

export default async function handler(req, res) {
  // Respond to Vonage immediately to avoid timeout
  res.status(200).json({ status: "ok" });

  // Send SMS notification to Kamy
  try {
    const url = `https://rest.nexmo.com/sms/json?api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}&from=Voicemail&to=${config.KAMY_NUMBER}&text=You+have+a+new+voicemail`;
    const response = await fetch(url);
    const text = await response.text();
    console.log("SMS raw result:", text);
  } catch (err) {
    console.error("SMS error:", err.message);
  }
}
