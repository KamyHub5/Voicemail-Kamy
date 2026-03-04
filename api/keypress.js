module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const digit = body.dtmf?.digits || body.digits;

  if (digit === "*") {
    // Caller pressed star — go to voicemail
    res.status(200).json([
      {
        action: "talk",
        text: "<speak><break time='2s'/>Please leave a message at the tone. Press the pound key when finished.</speak>",
        language: "en-GB",
        style: 0
      },
      {
        action: "record",
        format: "mp3",
        endOnSilence: 5,
        endOnKey: "#",
        timeOut: 25,
        beepStart: true,
        eventUrl: ["https://voicemail-kamy.vercel.app/api/recording"]
      },
      {
        action: "talk",
        text: "Your message has been recorded. Thank you. Goodbye.",
        language: "en-GB",
        style: 0
      }
    ]);
  } else {
    // No key pressed or wrong key — proceed to connect
    res.status(200).json([
      {
        action: "connect",
        timeout: 15,
        from: "13105151321",
        eventUrl: ["https://voicemail-kamy.vercel.app/api/events"],
        endpoint: [
          {
            type: "phone",
            number: "13059827377"
          }
        ]
      }
    ]);
  }
}
