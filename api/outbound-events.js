// api/outbound-events.js
const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.body;
  const status = body.status;

  console.log("OUTBOUND STATUS:", status);

  // If the call to Kamy fails for ANY reason, return the voicemail script
  if (["timeout", "no-answer", "busy", "rejected", "failed"].includes(status)) {
    return res.status(200).json([
      {
        action: "talk",
        text: "I'm sorry, I couldn't reach the recipient. Please leave a message after the tone.",
        language: "en-GB"
      },
      {
        action: "record",
        format: "mp3",
        endOnSilence: 5,
        beepStart: true,
        eventUrl: [`${config.BASE_URL}/api/recording`]
      }
    ]);
  }

  // If it's just 'ringing' or 'answered', do nothing (return 200)
  res.status(200).send();
};
