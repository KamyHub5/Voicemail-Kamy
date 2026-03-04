import config from './config.js';
import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  const jwt = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
  const body = req.body || {};
  
  if (body.recording_url) {
    try {
      // 1. Download audio from Vonage
      const audioRes = await fetch(body.recording_url, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      
      if (!audioRes.ok) throw new Error(`Vonage Audio Download Failed: ${audioRes.status}`);
      const audioBuffer = await audioRes.arrayBuffer();

      // 2. Upload to file.io (Using a more compatible format)
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), 'recording.mp3');

      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: formData
      });

      // CHECK: If file.io sent HTML instead of JSON, handle it gracefully
      const contentType = fileRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("file.io returned HTML/Text instead of JSON. Service might be down.");
      }

      const fileData = await fileRes.json();
      const easyLink = fileData.link || "Link Error";

      // 3. Send SMS via Messages API
      await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nListen: ${easyLink}`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });

    } catch (err) {
      console.error("JWT Process error:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
