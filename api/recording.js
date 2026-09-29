// VOICEMAIL PROCESSOR
// Triggered by: Completion of a call recording
// Purpose: Downloads audio from Vonage and uploads to Catbox and Disroot storage.

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

// Upload to Litterbox
    const formData = new FormData();

    formData.append("reqtype", "fileupload");
    formData.append("time", "72h");

    formData.append(
      "fileToUpload",
      new Blob([audioBuffer], { type: "audio/mpeg" }),
      "voicemail.mp3"
    );

    const uploadRes = await fetch(
      "https://litterbox.catbox.moe/resources/internals/api.php",
      {
        method: "POST",
        body: formData
      }
    );

const litterboxText = await uploadRes.text();

console.log("Litterbox upload status:", uploadRes.status);
console.log("Litterbox response headers:", Object.fromEntries(uploadRes.headers));
console.log("Litterbox response:", litterboxText.substring(0, 500));

const litterboxUrl = litterboxText.trim();

// Upload to Disroot (Nextcloud WebDAV)
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

    console.log("Disroot share response:", shareText);

    const shareMatch = shareText.match(/<url>(.*?)<\/url>/);
    const disrootShareUrl = shareMatch ? shareMatch[1] : null;

    console.log("Disroot share URL:", disrootShareUrl);

// Log the Vonage recording information
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

    console.log("========== VOICEMAIL COMPLETE ==========");
    console.log("Caller:", callerNumber);
    console.log("Date:", formattedDate);
    console.log("Time:", formattedTime, "ET");
    console.log("Vonage recording URL:", recordingUrl);
    console.log("Litterbox URL:", litterboxUrl.trim());
    console.log("Disroot URL:", disrootShareUrl);
    console.log("=========================================");

  } catch (err) {
    console.error("Error:", err.message);
  }

  res.status(200).json({ status: "ok" });
}
