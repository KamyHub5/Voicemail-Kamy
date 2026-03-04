import config from "./config.js";

export default function handler(req, res) {
  const body = req.body || {};
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    // Star pressed — go to voicemail directly
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
        beepStart: true,
        eventUrl: [`${config.BASE_URL}/api/recording`]
      },
      {
        action: "talk",
        text: "Your message has been recorded. Thank you. Goodbye.",
        language: "en-GB",
        style: 0
      }
    ]);
  } else {
    // No key pressed — connect to Kamy's phone
    // outbound-events.js handles what happens if no answer
    res.status(200).json([
      {
        action: "connect",
        timeout: 15,
        from: config.VONAGE_NUMBER,
        eventUrl: [`${config.BASE_URL}/api/outbound-events`],
        eventMethod: "POST",
        endpoint: [
          {
            type: "phone",
            number: config.KAMY_NUMBER
          }
        ]
      }
    ]);
  }
}
