import config from './config.js';
import { Vonage } from '@vonage/server-sdk';
import fetch from 'node-fetch';

const vonage = new Vonage({
  apiKey: config.VONAGE_API_KEY,
  apiSecret: config.VONAGE_API_SECRET,
  applicationId: config.VONAGE_APP_ID,
  privateKey: config.VONAGE_PRIVATE_KEY
});

export default async function handler(req, res) {
  const body = req.body || {};
  
  if (body.recording_url) {
    try {
      const audioBuffer = await vonage.files.get(body.recording_url);
      
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: audioBuffer
      });
      const fileData = await fileRes.json();
      const easyLink = fileData.link || body.recording_url;

      const dateStr = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      const textBody = `Voicemail Alert!
From: ${body.from || 'Unknown'}
Time: ${dateStr}
Listen: ${easyLink}
(Transcript to follow...)`;

      await vonage.sms.send({
        to: "13059827377",
        from: "13105151321",
        text: textBody
      });

    } catch (err) {
      console.error("Recording logic failed:", err);
    }
  }
  res.status(200).json({ status: "ok" });
}
