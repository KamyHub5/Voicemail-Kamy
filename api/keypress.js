const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    res.status(200).json([
      {
        action: "talk",
        text: "<speak><prosody volume='x-loud'><break time='2s'/>Please leave a message at the tone. Press the pound key when finished.</prosody></speak>",
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
        text: "<speak><prosody volume='x-loud'>Your message has been recorded. Thank you. Goodbye.</prosody></speak>",
        language: "en-GB"
      }
    ]);
  } else {
    res.status(200).json([
      {
        action: "connect",
        timeout: 15,
        from: "13105151321",
        eventType: "synchronous",
        eventUrl: [`${config.BASE_URL}/api/outbound-events`],
        endpoint: [{ type: "phone", number: "13059827377" }]
      }
    ]);
  }
};
