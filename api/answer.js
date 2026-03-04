export default function handler(req, res) {
  res.status(200).json([
    {
      action: "talk",
      text: "Hello. To leave a voicemail, press the star key. Or stay on the line to be connected.",
      language: "en-US",
      bargeIn: true
    },
    {
      action: "input",
      type: ["dtmf"],
      dtmf: {
        timeOut: 5,
        maxDigits: 1
      },
      // This sends the digit you press to your keypress file
      eventUrl: ["https://voicemail-kamy.vercel.app/api/keypress"],
      eventMethod: "POST"
    },
    {
      // Fallback: If they press nothing, it just tries to connect you anyway
      action: "connect",
      from: "13105151321",
      endpoint: [
        {
          type: "phone",
          number: "13059827377"
        }
      ]
    }
  ]);
}
