// VOICEMAIL PROCESSOR
// Triggered by: Completion of a call recording
// Purpose: Downloads audio from Vonage and uploads to Catbox and Disroot,
// then sends an email notification.

import config from "../config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("Recording URL:", recordingUrl);
  console.log("Caller:", callerNumber);

  try {
    // Download from Vonage with JWT
    const token = tokenGenerate(
      config.VONAGE_APP_ID,
      config.VONAGE_PRIVATE_KEY
    );

    const dlRes = await fetch(recordingUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Download status:", dlRes.status);

    const audioBuffer = await dlRes.arrayBuffer();
    console.log("Downloaded bytes:", audioBuffer.byteLength);

// Upload to Catbox
const formData = new FormData();

formData.append("reqtype", "fileupload");

const audioFile = new File(
  [audioBuffer],
  "voicemail.mp3",
  { type: "audio/mpeg" }
);

formData.append("fileToUpload", audioFile);

const uploadRes = await fetch(
  "https://catbox.moe/user/api.php",
  {
    method: "POST",
    body: formData
  }
);

if (!uploadRes.ok) {
  throw new Error(`Catbox upload failed: ${uploadRes.status}`);
}

const catboxUrl = (await uploadRes.text()).trim();

console.log("Catbox upload status:", uploadRes.status);
console.log("Catbox URL:", catboxUrl);

    // Upload to Disroot
    const filename = `voicemail_${Date.now()}.mp3`;

    const disrootUrl =
      `https://cloud.disroot.org/remote.php/dav/files/` +
      `${config.DISROOT_USER}/Voicemails/${filename}`;

    const credentials = Buffer.from(
      `${config.DISROOT_USER}:${config.DISROOT_PASS}`
    ).toString("base64");

    const disrootUpload = await fetch(disrootUrl, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "audio/mpeg"
      },
      body: audioBuffer
    });

    console.log("Disroot upload status:", disrootUpload.status);

    // Create public share link on Disroot
    const shareRes = await fetch(
      "https://cloud.disroot.org/ocs/v2.php/apps/files_sharing/api/v1/shares",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "OCS-APIRequest": "true"
        },
        body: `path=/Voicemails/${filename}&shareType=3`
      }
    );

    const shareText = await shareRes.text();
    const shareMatch = shareText.match(/<url>(.*?)<\/url>/);
    const disrootShareUrl = shareMatch ? shareMatch[1] : null;

    // Format date and time
    const date = new Date(startTime);

    const formattedDate = date.toLocaleDateString("en-US", {
      timeZone: "America/New_York"
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/New_York"
    });

    // Send email notification
    await fetch(`${config.BASE_URL}/api/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        callerNumber,
        formattedDate,
        formattedTime,
        catboxUrl,
        disrootShareUrl
      })
    });

    // Log completion
    console.log("========== VOICEMAIL COMPLETE ==========");
    console.log("Caller:", callerNumber);
    console.log("Date:", formattedDate);
    console.log("Time:", formattedTime, "ET");
    console.log("Catbox URL:", catboxUrl);
    console.log("Disroot URL:", disrootShareUrl);
    console.log("=========================================");

  } catch (err) {
    console.error("Error:", err.message);
  }

  res.status(200).json({ status: "ok" });
}
