import config from "../config.js";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  const {
    callerNumber,
    formattedDate,
    formattedTime,
    litterboxUrl,
    disrootShareUrl
  } = req.body || {};

  try {
    const transporter = nodemailer.createTransport({
      host: "disroot.org",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.DISROOT_USER,
        pass: config.DISROOT_PASS
      }
    });

    await transporter.sendMail({
      from: `"Voicemail Notification" <${config.DISROOT_USER}>`, 
      to: config.NOTIFY_EMAIL,
      subject: "New Voicemail",
      text:
`New voicemail

From: ${callerNumber}
Date: ${formattedDate}
Time: ${formattedTime} ET

Listen:
${litterboxUrl}

Backup:
${disrootShareUrl}`
    });

    console.log("Email notification sent");

    res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Notification failed:", err.message);
    res.status(500).json({ status: "failed" });
  }
}
