// SMS STATUS HANDLER
// Receives delivery receipts for outbound text messages
// Confirms whether text messages were delivered or failed

export default function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};

  console.log("========== SMS DELIVERY RECEIPT ==========");
  console.log("BODY:", JSON.stringify(body));
  console.log("QUERY:", JSON.stringify(query));

  res.status(200).json({ status: "received" });
}
