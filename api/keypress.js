import config from "./config.js";

export default function handler(req, res) {
  const body = req.body;
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    res.status(200).json([
      {
        action: "talk",
        text: "<speak><prosody volume='+6dB'><break time='2s'/>Please leave a message at the tone. Press the pound key when finished.</speak>",
        voiceName: "Kimberly"
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
        text: "<speak><prosody volume='+6dB'>Your message has been recorded. Thank you. Goodbye.</prosody></speak>",
        voiceName: "Kimberly"
      }
    ]);
  } else {
    res.status(200).json([
      {
        action: "connect",
        timeout: 15,
        from: config.VONAGE_NUMBER,
        eventType: "synchronous",
        eventUrl: [`${config.BASE_URL}/api/outbound-events`],
        endpoint: [{ type: "phone", number: config.KAMY_NUMBER }]
      }
    ]);
  }
};
