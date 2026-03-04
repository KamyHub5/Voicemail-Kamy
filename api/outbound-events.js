const config = require("./config");
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: config.VONAGE_API_KEY,
  apiSecret: config.VONAGE_API_SECRET,
  applicationId: config.VONAGE_APP_ID,
  privateKey: config.VONAGE_PRIVATE_KEY,
});

module.exports = async function handler(req, res) {
  const body = req.body;
  
  // We look for the status of the outbound leg
  if (['timeout', 'no-answer', 'busy', 'rejected'].includes(body.status)) {
    const conversationId = body.conversation_uuid; // The link between both callers

    // Use the REST API to move the call to voicemail
    try {
      await vonage.calls.updateCall(body.uuid, { 
        action: 'transfer', 
        destination: { 
          type: 'ncco', 
          url: [`${config.BASE_URL}/api/voicemail`] 
        } 
      });
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  }
  
  res.status(200).end();
};
