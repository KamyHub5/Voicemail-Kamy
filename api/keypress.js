export default function handler(req, res) {
  const body = req.body || {};
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    res.status(200).json([
      {
        action: "talk",
        text: "<speak><prosody volume='+6dB'><break time='2s'/>Please leave a message at the tone. Press the pound key when finished.</prosody></speak>",
        language: "en-GB"
      },
      {
        action: "record",
        beepStart: true,
        eventUrl: ["https://voicemail-kamy.vercel.app/api/recording"],
        eventMethod: "POST"
      }
    ]);
  } else {
    res.status(200).json([
      {
        action: "connect",
        from: "13105151321",
        endpoint: [{ type: "phone", number: "13059827377" }]
      }
    ]);
  }
}
