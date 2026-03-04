export default async function handler(req, res) {
  // Your confirmed keys from config.js
  const apiKey = "7bfc838f";
  const apiSecret = "9GU2UPa0s$5";
  const to = "13059827377";
  const from = "13105151321";
  const text = "New Voicemail Received";

  // This is the direct, "pre-JWT" way to send a text
  const url = `https://rest.nexmo.com/sms/json?api_key=${apiKey}&api_secret=${apiSecret}&to=${to}&from=${from}&text=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    
    // Check Vercel Logs for: VONAGE_FINAL_ANSWER
    console.log("VONAGE_FINAL_ANSWER:", JSON.stringify(data));
  } catch (error) {
    console.log("VERCEL_EXECUTION_ERROR:", error.message);
  }

  res.status(200).send("OK");
}
