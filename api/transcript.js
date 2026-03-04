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
      // Send Transcript using the MESSAGES API
      await vonage.messages.send({
        text: `Transcript: "${body.text}"`,
        message_type: 'text',
        to: "13059827377",
        from: "13105151321",
        channel: 'sms'
      });
      console.log("Transcript SMS sent via Messages API");
    } catch (err) {
      console.error("Transcript SMS failed:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
