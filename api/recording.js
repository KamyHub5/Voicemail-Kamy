export default async function handler(req, res) {
  // Your confirmed credentials
  const apiKey = "666d929b";
  const apiSecret = "z7fFqjU0nNqGvCq8";
  const to = "13059827377";
  const from = "13105151321";
  const text = "New+Voicemail+Received";

  // Using the legacy REST API - the most direct method possible
  const url = `https://rest.nexmo.com/sms/json?api_key=${apiKey}&api_secret=${apiSecret}&to=${to}&from=${from}&text=${text}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    const responseData = await response.json();
    
    // This will print the actual result from Vonage in your Vercel Logs
    console.log("VONAGE_SMS_LOG:", JSON.stringify(responseData));
  } catch (error) {
    console.error("Vercel_Fetch_Error:", error.message);
  }

  // Tell Vonage the webhook was received
  res.status(200).send("OK");
}
