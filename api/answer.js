const config = require("./config");

module.exports = function handler(req, res) {
  res.status(200).json([
    {
      action: "talk",
      text: "<speak><break time='2s'/>Hello. Thank you for calling. Please remain on the line to be connected, or press the star key to leave a voicemail.</speak>",
      language: "en-GB",
      style: 0,
      bargeIn: true
    },
    {
      action: "input",
      type: ["dtmf"],
      dtmf: { timeOut: 5, maxDigits: 1 },
      eventUrl: [`${config.BASE_URL}/api/keypress`]
    },
    {
      action: "connect",
      timeout: 15,
      from: config.VONAGE_NUMBER,
      eventUrl: [`${config.BASE_URL}/api/events`],
      eventMethod: "POST",
      endpoint: [
        {
          type: "phone",
          number: config.KAMY_NUMBER,
          dtmfAnswer: "1"
        }
      ]
    }
  ]);
};
