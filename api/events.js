const Vonage = require("@vonage/server-sdk");
const config = require("./config");

const vonage = new Vonage({
  apiKey: config.VONAGE_API_KEY,
  apiSecret: config.VONAGE_API_SECRET,
  applicationId: config.VONAGE_APP_ID,
  privateKey: Buffer.from(config.VONAGE_PRIVATE_KEY)
});

module.exports = async function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const status = body.status;
  const uuid = body.uuid;

  console.log("EVENT:", status, "UUID:", uuid);

  if (status === "unanswered" || status === "timeout" || status === "failed" || status === "rejected") {
    // Actively redirect the inbound call to voicemail using REST API
    vonage.calls.update(uuid, {
      action: "transfer",
      destination: {
        type: "ncco",
        url: [`${config.BASE_URL}/api/voicemail`]
      }
    }, (err, resp) => {
      if (err) console.error("Transfer error:", JSON.stringify(err));
      else console.log("Transferred to voicemail:", JSON.stringify(resp));
    });
  }

  res.status(200).json({ status: "ok" });
};
