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
      // 1. Fetch private audio from Vonage
      const audioBuffer = await vonage.files.get(body.recording_url);
      
      // 2. Upload to file.io
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: audioBuffer
      });
      const fileData = await fileRes.json();
      const easyLink = fileData.link || body.recording_url;

      const dateStr = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      
      // 3. Send SMS using the MESSAGES API (Required for your current settings)
      await vonage.messages.send({
        text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nTime: ${dateStr}\nListen: ${easyLink}\n(Transcript to follow...)`,
        message_type: 'text',
        to: "13059827377",
        from: "13105151321",
        channel: 'sms'
      });
      console.log("Recording SMS sent via Messages API");

    } catch (err) {
      console.error("Recording process failed:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
