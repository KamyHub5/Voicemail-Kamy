import config from './config.js';

export default async function handler(req, res) {
  const body = req.body || {};
  
  if (body.text) {
    try {
      const auth = Buffer.from(`${config.VONAGE_API_KEY}:${config.VONAGE_API_SECRET}`).toString('base64');
      
      await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Transcript: "${body.text}"`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });
      console.log("Transcript SMS sent.");
    } catch (err) {
      console.error("Transcript failed:", err.message);
    }
  }
  res.status(200).json({ status: "ok" });
}
