module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const status = body.status;

  if (status === "timeout" || status === "failed" || status === "rejected" || status === "unanswered") {
    res.redirect("https://voicemail-kamy.vercel.app/api/voicemail");
  } else {
    res.status(200).json({ status: "ok" });
  }
}
