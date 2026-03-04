import config from './config.js';
import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: config.VONAGE_API_KEY,
  apiSecret: config.VONAGE_API_SECRET,
  applicationId: config.VONAGE_APP_ID,
  privateKey: config.VONAGE_PRIVATE_KEY
});

export default async function handler(req, res) {
  // Return early if it's a GET request (like when you test in browser)
  if (req.method === 'GET') {
    return res.status(200).json({ status: "Function is alive" });
  }

  const body = req.body || {};
  
  if (body.recording_url) {
    try {
      // 1. Get audio from Vonage
      const audioBuffer = await vonage.files.get(body.recording_url);
      
      // 2. Upload to file.io using native fetch
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: audioBuffer
      });
      
      const fileData = await fileRes.json();
      const easyLink = fileData.link || body.recording_url;

      const dateStr = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      
      // 3. Send SMS via Messages API
      await vonage.messages.send({
        text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nTime: ${dateStr}\nListen: ${easyLink}`,
        message_type: 'text',
        to: config.KAMY_NUMBER,
        from: config.VONAGE_NUMBER,
        channel: 'sms'
      });

    } catch (err) {
      console.error("CRITICAL ERROR:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
