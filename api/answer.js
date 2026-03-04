export default function handler(req, res) {
  res.status(200).json([
    {
      action: "talk",
      text: "<speak><prosody volume='+6dB'><break time='2s'/>Hello. Thank you for calling. Please remain on the line to be connected, or press the star key to leave a voicemail.</prosody></speak>",
      language: "en-GB",
      bargeIn: true
    },
    {
      action: "input",
      type: ["dtmf"],
      dtmf: { timeOut: 5, maxDigits: 1 },
      eventUrl: ["https://voicemail-kamy.vercel.app/api/keypress"],
      eventMethod: "POST"
    }
  ]);
}
