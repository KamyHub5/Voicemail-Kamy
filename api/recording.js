import config from './config.js';

export default async function handler(req, res) {
  // Use Query Params for Auth - this bypasses the "Invalid Token" header issue
  const authQuery = `api_key=${config.VONAGE_API_KEY}&api_secret=${config.VONAGE_API_SECRET}`;

  if (req.method === 'GET') {
    try {
      const testRes = await fetch(`https://api.nexmo.com/v1/messages?${authQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_type: 'text',
          text: "Diagnostic Test: Auth Fixed",
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });

      const result = await testRes.json();
      return res.status(200).json({ status: "Attempted", response: result });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const body = req.body || {};
  if (body.recording_url) {
    try {
      // 1. Download audio using Query Auth
      const audioRes = await fetch(`${body.recording_url}?${authQuery}`);
      const audioBuffer = await audioRes.arrayBuffer();

      // 2. Upload to file.io
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: Buffer.from(audioBuffer)
      });
      const fileData = await fileRes.json();

      // 3. Send SMS using Query Auth
      await fetch(`https://api.nexmo.com/v1/messages?${authQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_type: 'text',
          text: `New Voicemail!\nListen: ${fileData.link || "Error"}`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });
    } catch (err) {
      console.error("Process error:", err.message);
    }
  }
  return res.status(200).json({ status: "ok" });
}
