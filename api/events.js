const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const status = body.status;
  const direction = body.direction;
  const disconnectedBy = body.disconnected_by || body.disconnectedBy;

  console.log("EVENT status:", status, "direction:", direction, "disconnectedBy:", disconnectedBy);

  // Outbound leg to Kamy timed out or was not answered
  if (
    (direction === "outbound" && status === "timeout") ||
    (direction === "outbound" && status === "unanswered") ||
    (direction === "outbound" && status === "failed") ||
    (status === "completed" && disconnectedBy === "platform")
  ) {
    res.redirect(`${config.BASE_URL}/api/voicemail`);
  } else {
    res.status(200).json({ status: "ok" });
  }
};
