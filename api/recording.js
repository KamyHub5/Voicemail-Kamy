import config from './config.js';
import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  // Generate JWT for both downloading and sending
  const jwt = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);

  // Reverted: Now only handles POST requests from Vonage
  const body = req.body || {};
  
  if (body.recording_url) {
    try {
      // 1. Download audio from Vonage using JWT
      const audioRes = await fetch(body.recording_url, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const audioBuffer = await audioRes.arrayBuffer();

      // 2. Upload to file.io
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: Buffer.from(audioBuffer)
      });
      const fileData = await fileRes.json();
      const easyLink = fileData.link || "Link Error";

      const dateStr = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      
      // 3. Send SMS via Messages API using JWT
      await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nTime: ${dateStr}\nListen: ${easyLink}`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });

    } catch (err) {
      console.error("Recording process failed:", err.message);
    }
  }
  
  // Always return 200 to Vonage so it doesn't keep retrying
  res.status(200).json({ status: "ok" });
}
