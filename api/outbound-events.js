const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.body;
  
  // Log status for monitoring
  console.log("OUTBOUND STATUS RECEIVED:", body.status);

  // If the call to Kamy (13059827377) is not answered within 15s
  if (["timeout", "no-answer", "busy", "rejected", "failed"].includes(body.status)) {
    return res.status(200).json([
      {
        action: "talk",
        text: "<speak><break time='2s'/>I'm sorry, I couldn't reach the recipient. Please leave a message after the tone. Press the pound key when finished.</speak>",
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
        text: "Your message has been recorded. Thank you. Goodbye.",
        language: "en-GB"
      }
    ]);
  }

  // For 'started' or 'ringing' states, we return an empty 200 OK
  res.status(200).send();
};
