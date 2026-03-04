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
      // 1. Get the audio from Vonage using your Private Key
      const response = await vonage.files.get(body.recording_url);
      
      // 2. Upload to file.io as a buffer
      const { link } = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: response
      }).then(res => res.json());

      const easyLink = link || body.recording_url;

      // 3. Send the Text Message
      const dateStr = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      const messageText = `Voicemail Alert!
From: ${body.from || 'Unknown'}
Time: ${dateStr}
Listen: ${easyLink}
(Transcript to follow...)`;

      await vonage.sms.send({
        to: "13059827377", 
        from: "13105151321", 
        text: messageText
      });
      console.log("Recording link sent via SMS");

    } catch (error) {
      console.error("Recording process failed:", error);
    }
  }
  res.status(200).json({ status: "ok" });
}
