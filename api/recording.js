import config from "./config.js";

export default async function handler(req, res) {
  // Respond to Vonage immediately
  res.status(200).json({ status: "ok" });

  // Send SMS notification
  const params = new URLSearchParams({
    api_key: config.VONAGE_API_KEY,
    api_secret: config.VONAGE_API_SECRET,
    from: "Voicemail",
    to: config.KAMY_NUMBER,
    text: "You have a new voicemail."
  }).toString();

  try {
    const response = await fetch(`https://rest.nexmo.com/sms/json?${params}`);
    const result = await response.json();
    console.log("SMS result:", JSON.stringify(result));
  } catch (err) {
    console.error("SMS error:", err);
  }
}
