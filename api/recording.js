import config from './config.js';
import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  // 1. Generate the required JWT token
  const jwt = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);

  if (req.method === 'GET') {
    try {
      const testRes = await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}` // Uses the new JWT
        },
        body: JSON.stringify({
          message_type: 'text',
          text: "System Test: JWT Auth Successful",
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });

      const result = await testRes.json();
      return res.status(200).json({ status: "Attempted", response: result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Webhook Logic
  const body = req.body || {};
  if (body.recording_url) {
    try {
      // Use JWT for audio download
      const audioRes = await fetch(body.recording_url, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const audioBuffer = await audioRes.arrayBuffer();

      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: Buffer.from(audioBuffer)
      });
      const fileData = await fileRes.json();

      // Use JWT for SMS sending
      await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `New Voicemail!\nListen: ${fileData.link || "Error"}`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });
    } catch (err) {
      console.error("JWT Process error:", err.message);
    }
  }
  return res.status(200).json({ status: "ok" });
}
