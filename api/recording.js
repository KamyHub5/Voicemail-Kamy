import config from './config.js';
import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  // 1. Generate the JWT token for authentication
  const jwt = tokenGenerate("ecefa59a-3067-489d-b3cd-d0cef77dca53", config.VONAGE_PRIVATE_KEY);

  const body = req.body || {};
  
  // This will show up in your Vercel logs so we can see what Vonage is sending
  console.log("Incoming Webhook Body:", JSON.stringify(body));

  if (body.recording_url || body.status === 'completed') {
    try {
      // 2. Send the SMS attempt with hardcoded numbers
      const smsRes = await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nStatus: Call Finished. Check Vonage logs if this arrived.`,
          to: "13059827377",
          from: "13105151321",
          channel: 'sms'
        })
      });

      const smsData = await smsRes.json();
      console.log("SMS Submission Result:", JSON.stringify(smsData));

    } catch (err) {
      console.error("SMS Attempt Failed:", err.message);
    }
  }
  
  res.status(200).json({ status: "ok" });
}
