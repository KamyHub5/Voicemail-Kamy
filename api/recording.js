import config from './config.js';

export default async function handler(req, res) {
  // 1. Handle browser test visits
  if (req.method === 'GET') {
    return res.status(200).json({ status: "Function is alive and healthy" });
  }

  const body = req.body || {};
  
  if (body.recording_url) {
    try {
      // 2. Download the audio file directly using a Bearer token
      // We use the basic auth header for simplicity since it's an internal server request
      const auth = Buffer.from(`${config.VONAGE_API_KEY}:${config.VONAGE_API_SECRET}`).toString('base64');
      
      const audioRes = await fetch(body.recording_url, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (!audioRes.ok) throw new Error(`Vonage download failed: ${audioRes.status}`);
      const audioBuffer = await audioRes.arrayBuffer();

      // 3. Upload to file.io
      const fileRes = await fetch('https://file.io/?expires=1d', {
        method: 'POST',
        body: Buffer.from(audioBuffer)
      });
      const fileData = await fileRes.json();
      const easyLink = fileData.link || "Link Expired";

      // 4. Send the SMS using a simple REST fetch call to the Messages API
      const smsRes = await fetch(`https://api.nexmo.com/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          message_type: 'text',
          text: `Voicemail Alert!\nFrom: ${body.from || 'Unknown'}\nListen: ${easyLink}`,
          to: config.KAMY_NUMBER,
          from: config.VONAGE_NUMBER,
          channel: 'sms'
        })
      });

      const smsData = await smsRes.json();
      console.log("SMS result:", smsData);

    } catch (err) {
      // This will now show up in your Vercel logs instead of a 500 crash
      console.error("Internal Error:", err.message);
    }
  }

  return res.status(200).json({ status: "ok" });
}
