import config from './config.js';
import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  const body = req.body || {};
  
  if (body.text) {
    try {
      // Generate JWT for the Transcript SMS
      const jwt = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
      
      await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Transcript: "${body.text}"`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });
      console.log("Transcript SMS submitted to Vonage.");
    } catch (err) {
      console.error("Transcript failed:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
