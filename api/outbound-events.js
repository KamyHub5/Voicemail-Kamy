import config from "./config.js";

export default function handler(req, res) {
  const body = req.body || {};

  if (["timeout", "no-answer", "busy", "rejected", "failed"].includes(body.status)) {
    // Kamy didn't answer — send caller to voicemail
    return res.status(200).json([
      {
        action: "talk",
        text: "<speak><break time='2s'/>I'm sorry, I couldn't reach the recipient. Please leave a message after the tone. Press the pound key when finished.</speak>",
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
  }

  res.status(200).send();
}
