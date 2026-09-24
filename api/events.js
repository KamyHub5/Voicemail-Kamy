// Receives inbound leg call status updates
// Logs all events for debugging

export default function handler(req, res) {
  const body = req.body || req.query;
  console.log("INBOUND EVENT:", JSON.stringify(body));
  res.status(200).json({ status: "ok" });
}
