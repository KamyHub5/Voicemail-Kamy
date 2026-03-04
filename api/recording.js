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
      // 1. Fetch the private audio from Vonage
      const audioBuffer = await vonage.files.get(body.recording_url);
      
      // 2. Upload to file.io
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: audioBuffer
      });
      const fileData = await fileRes.json();
      const easyLink = fileData.link || body.recording_url;

      // 3. Send the SMS
      await vonage.sms.send({
        to: "13059827377",
        from: "13105151321",
        text: `New Voicemail\nLink: ${easyLink}\n(Transcript coming...)`
      });

    } catch (err) {
      console.error("SMS/Upload Failed:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
