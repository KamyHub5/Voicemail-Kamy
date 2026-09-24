// INBOUND SMS HANDLER
// Triggered by: Incoming text messages (SMS) sent to your Vonage number
// Purpose: Receives and processes inbound SMS webhooks from Vonage

export default function handler(req, res) {
  res.status(200).json({ status: "Inbound received" });
}
