// ─────────────────────────────────────────────
// ANSWER — triggered when someone calls the Vonage number
// Plays greeting, waits for star key, then forwards to Kamy
// ─────────────────────────────────────────────

const config = require("./config");

module.exports = function handler(req, res) {
  res.status(200).json([
    {
      // Step 1: Play greeting with 2 second pause before speaking
      action: "talk",
      text: "<speak><break time='2s'/>Hello. Thank you for calling. Please remain on the line to be connected, or press the star key to leave a voicemail.</speak>",
      language: "en-GB",
      style: 0,
      bargeIn: true // allows caller to press star during greeting
    },
    {
      // Step 2: Listen for star key for 5 seconds
      // If star pressed → keypress.js handles redirect to voicemail
      // If nothing pressed → falls through to connect
      action: "input",
      type: ["dtmf"],
      dtmf: { timeOut: 1, maxDigits: 1 },
      eventUrl: [`${config.BASE_URL}/api/keypress`]
    },
    {
      // Step 3: Forward call to Kamy's phone
      // If no answer in 15s → events.js handles redirect to voicemail
      action: "connect",
      timeout: 5,
      from: config.VONAGE_NUMBER,
      eventUrl: [`${config.BASE_URL}/api/events`],
      endpoint: [
        {
          type: "phone",
          number: config.KAMY_NUMBER
        }
      ]
    }
  ]);
};
