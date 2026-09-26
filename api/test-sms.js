import config from "../config.js";

export default async function handler(req, res) {
  try {
    const text = "TEST SMS from Kamy Voice Systems";

    const smsUrl =
      `https://rest.nexmo.com/sms/json` +
      `?api_key=${config.VONAGE_API_KEY}` +
      `&api_secret=${config.VONAGE_API_SECRET}` +
      `&from=${config.VONAGE_NUMBER}` +
      `&to=${config.KAMY_NUMBER}` +
      `&text=${encodeURIComponent(text)}`;

    const response = await fetch(smsUrl);
    const result = await response.text();

    console.log("TEST SMS HTTP STATUS:", response.status);
    console.log("TEST SMS RESULT:", result);

    res.status(200).json({
      httpStatus: response.status,
      result
    });

  } catch (err) {
    console.error("TEST SMS ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
}
