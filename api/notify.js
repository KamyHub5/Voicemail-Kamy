import config from "../config.js";

export default async function handler(req, res) {
  const {
    callerNumber,
    formattedDate,
    formattedTime,
    litterboxUrl,
    disrootShareUrl
  } = req.body || {};

  try {
    const text =
`New voicemail

From: ${callerNumber}
Date: ${formattedDate}
Time: ${formattedTime} ET

Listen:
${litterboxUrl}

Backup:
${disrootShareUrl}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: config.RESEND_FROM,
        to: config.RESEND_TO,
        subject: "New Voicemail",
        text
      })
    });

    const result = await response.text();

    if (!response.ok) {
      throw new Error(`Resend failed: ${result}`);
    }

    console.log("Email notification sent");

    res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Notification failed:", err.message);
    res.status(500).json({ status: "failed" });
  }
}
