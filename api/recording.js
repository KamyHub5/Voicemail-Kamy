import config from "./config.js";
import https from "https";

export default async function handler(req, res) {
  const body = req.body || req.query;

  const params = new URLSearchParams({
    api_key: config.VONAGE_API_KEY,
    api_secret: config.VONAGE_API_SECRET,
    from: config.VONAGE_NUMBER,
    to: config.KAMY_NUMBER,
    text: "You have a new voicemail."
  }).toString();

  https.get(`https://rest.nexmo.com/sms/json?${params}`, (resp) => {
    let data = "";
    resp.on("data", chunk => data += chunk);
    resp.on("end", () => console.log("SMS result:", data));
  }).on("error", err => console.error("SMS error:", err));

  res.status(200).json({ status: "ok" });
}
