// ─────────────────────────────────────────────
// KEYPRESS — triggered when caller presses a key during greeting
// Star (*) → redirect to voicemail
// Anything else → proceed to connect Kamy's phone
// ─────────────────────────────────────────────

const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    // Caller pressed star — send to voicemail
    res.redirect(`${config.BASE_URL}/api/voicemail`);
  } else {
    // No star pressed — connect to Kamy's phone
    res.status(200).json([
      {
        action: "connect",
        timeout: 15,
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
  }
};
