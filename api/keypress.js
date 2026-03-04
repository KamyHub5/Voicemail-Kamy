export default function handler(req, res) {
  const body = req.body || {};
  // Handles different ways Vonage sends the pressed digit
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    // START VOICEMAIL FLOW
    res.status(200).json([
      {
        action: "talk",
        text: "Please leave a message after the beep. Hang up when you are finished.",
        language: "en-US"
      },
      {
        action: "record",
        format: "mp3",
        beepStart: true,
        // CRITICAL: This sends the notification trigger to your recording.js
        eventUrl: ["https://voicemail-kamy.vercel.app/api/recording"],
        eventMethod: "POST"
      }
    ]);
  } else {
    // FORWARD TO CELL PHONE
    res.status(200).json([
      {
        action: "talk",
        text: "Connecting you now.",
        language: "en-US"
      },
      {
        action: "connect",
        from: "13105151321", // Your Vonage Number
        endpoint: [
          {
            type: "phone",
            number: "13059827377" // Your Cell Number
          }
        ]
      }
    ]);
  }
}
