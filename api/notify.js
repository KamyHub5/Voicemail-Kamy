// SMS AND EMAIIL NOTIFICATION SENDER
// Standalone SMS notification function.
// Standalone email notification function.

import config from "../config.js";

export default async function handler(req, res) {
  try {
    const body = req.body || {};

    const to = body.to || config.KAMY_NUMBER;
    const text = body.text || "You have a new voicemail.";

    const smsUrl =
      `https://rest.nexmo.com/sms/json` +
      `?api_key=${encodeURIComponent(config.VONAGE_API_KEY)}` +
      `&api_secret=${encodeURIComponent(config.VONAGE_API_SECRET)}` +
      `&from=${encodeURIComponent(config.VONAGE_NUMBER)}` +
      `&to=${encodeURIComponent(to)}` +
      `&text=${encodeURIComponent(text)}`;

    const response = await fetch(smsUrl);
    const resultText = await response.text();

    console.log("SMS HTTP STATUS:", response.status);
    console.log("SMS RESULT:", resultText);

    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { raw: resultText };
    }

    res.status(response.status).json({
      status: response.status,
      result
    });

  } catch (err) {
    console.error("SMS ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
}
