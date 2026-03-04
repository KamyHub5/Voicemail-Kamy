import config from "./config.js";

export default async function handler(req, res) {
  const body = req.body || req.query;

  await fetch("https://rest.nexmo.com/sms/json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: config.VONAGE_API_KEY,
      api_secret: config.VONAGE_API_SECRET,
      from: config.VONAGE_NUMBER,
      to: config.KAMY_NUMBER,
      text: "You have a new voicemail."
    })
  });

  res.status(200).json({ status: "ok" });
}
