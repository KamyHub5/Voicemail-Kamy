const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
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
    res.status(200).json([
      {
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
      },
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
};
