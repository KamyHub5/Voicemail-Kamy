import config from "./config.js";

export default function handler(req, res) {
  const body = req.body || {};
  
  if (["timeout", "no-answer", "busy", "rejected", "failed"].includes(body.status)) {
    return res.status(200).json([
      {
        action: "talk",
        text: "<speak><prosody volume='+6dB'><break time='2s'/>I'm sorry, I couldn't reach the recipient. Please leave a message after the tone. Press the pound key when finished.</prosody></speak>",
        language: "en-GB"
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
        language: "en-GB"
      }
    ]);
  }
  res.status(200).send();
};
