import config from './config.js';
import { Vonage } from '@vonage/server-sdk';

const vonage = new Vonage({
  apiKey: config.VONAGE_API_KEY,
  apiSecret: config.VONAGE_API_SECRET,
  applicationId: config.VONAGE_APP_ID,
  privateKey: config.VONAGE_PRIVATE_KEY
});

export default async function handler(req, res) {
  const body = req.body || {};
  
  if (body.text) {
    try {
      await vonage.sms.send({
        to: "13059827377",
        from: "13105151321",
        text: `Voicemail Transcript: "${body.text}"`
      });
      console.log("Transcript sent via SMS");
    } catch (error) {
      console.error("Transcript SMS failed:", error);
    }
  }
  res.status(200).json({ status: "ok" });
}
