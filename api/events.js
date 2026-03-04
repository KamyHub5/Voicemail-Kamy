module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const status = body.status;
  const disconnectedBy = body.disconnected_by || body.disconnectedBy;

  if (
    status === "timeout" ||
    status === "failed" ||
    status === "rejected" ||
    status === "unanswered" ||
    (status === "completed" && disconnectedBy === "platform")
  ) {
    res.redirect("https://voicemail-kamy.vercel.app/api/voicemail");
  } else {
    res.status(200).json({ status: "ok" });
  }
}
