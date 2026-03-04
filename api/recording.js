import config from './config.js';
import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  const jwt = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
  const body = req.body || {};
  
  // Log the body so we can see exactly what Vonage is sending in Vercel
  console.log("Incoming Webhook Body:", JSON.stringify(body));

  if (body.recording_url || body.status === 'completed') {
    try {
      // Send a simple SMS immediately
      const smsRes = await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nStatus: Call Finished.`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
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
