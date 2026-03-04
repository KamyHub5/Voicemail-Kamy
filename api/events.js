import config from "./config.js";

export default function handler(req, res) {
  // Use POST body for data as configured in your Vonage dashboard
  const body = req.body || {};
  const status = body.status;
  const disconnectedBy = body.disconnected_by || body.disconnectedBy;

  console.log("CALL EVENT:", status, "| Disconnected by:", disconnectedBy);

  // Fallback logic for unanswered calls if synchronous outbound fails
  if (
    ["timeout", "failed", "rejected", "unanswered"].includes(status) ||
    (status === "completed" && disconnectedBy === "platform")
  ) {
    res.redirect(`${config.BASE_URL}/api/voicemail`);
  } else {
    res.status(200).json({ status: "ok" });
  }
}
