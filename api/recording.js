// ─────────────────────────────────────────────
// RECORDING — triggered after voicemail is recorded
// Receives recording URL and logs it
// Email notification to be added in Stage 4
// ─────────────────────────────────────────────

module.exports = async function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;

  console.log("NEW VOICEMAIL RECEIVED");
  console.log("Recording URL:", body.recording_url);
  console.log("Time:", body.start_time);
  console.log("Duration:", body.size);

  // Stage 4 — email notification goes here

  res.status(200).json({ status: "ok" });
};
