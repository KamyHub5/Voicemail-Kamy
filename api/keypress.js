import config from "./config.js";

export default function handler(req, res) {
  const body = req.body || {};
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    return res.status(200).json([
      {
        action: "talk",
        text: "<speak><prosody volume='+6dB'><break time='2s'/>Please leave a message at the tone. Press the pound key when finished.</prosody></speak>",
        language: "en-GB"
      },
      {
        action: "record",
        format: "mp3",
        endOnSilence: 5,
        endOnKey: "#",
        timeOut: 25,
        beepStart: true,
        eventUrl: [`${config.BASE_URL}/api/recording`],
        eventMethod: "POST"
      },
      {
        action: "talk",
        text: "Your message has been recorded. Thank you. Goodbye.",
        language: "en-GB"
      }
    ]);
  }

  res.status(200).json([
    {
      action: "connect",
      from: config.VONAGE_NUMBER,
      timeout: 15,
      eventUrl: [`${config.BASE_URL}/api/outbound-events`],
      eventMethod: "POST",
      endpoint: [{ type: "phone", number: config.KAMY_NUMBER }]
    }
  ]);
}
