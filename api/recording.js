import config from './config.js';

export default async function handler(req, res) {
  const auth = Buffer.from(`${config.VONAGE_API_KEY}:${config.VONAGE_API_SECRET}`).toString('base64');

  // BROWSER TEST: Visit https://voicemail-kamy.vercel.app/api/recording
  if (req.method === 'GET') {
    try {
      const testRes = await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: "Diagnostic Test: If you see this, the API connection is good.",
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });

      const result = await testRes.json();
      return res.status(200).json({
        message: "Vonage API Response Received",
        raw_response: result
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // REAL WEBHOOK LOGIC: (When Vonage calls this after a voicemail)
  const body = req.body || {};
  if (body.recording_url) {
    try {
      const audioRes = await fetch(body.recording_url, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
      const audioBuffer = await audioRes.arrayBuffer();

      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: Buffer.from(audioBuffer)
      });
      const fileData = await fileRes.json();

      await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `New Voicemail!\nListen: ${fileData.link || "Error uploading"}`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });
    } catch (err) {
      console.error("Recording error:", err.message);
    }
  }
  return res.status(200).json({ status: "ok" });
}
