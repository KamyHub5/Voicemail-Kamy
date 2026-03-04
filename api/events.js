const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const status = body.status;
  const disconnectedBy = body.disconnected_by || body.disconnectedBy;

  if (status === "completed" && disconnectedBy === "platform") {
    res.redirect(`${config.BASE_URL}/api/voicemail`);
  } else {
    res.status(200).json({ status: "ok" });
  }
};
