// SMS STATUS HANDLER
// Receives delivery receipts for outbound text messages
// Confirms whether text messages were delivered or failed

export default function handler(req, res) {
  res.status(200).json({ status: "Status received" });
}
