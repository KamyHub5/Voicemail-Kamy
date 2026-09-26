// VOICEMAIL PROCESSOR & SMS NOTIFIER

import config from "../config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};

  const recordingUrl = body.recording_url;
  const startTime = body.start_time;
  const callerNumber = query.from || "Unknown";

  console.log("========== RECORDING HANDLER START ==========");
  console.log("Method:", req.method);
  console.log("Body:", JSON.stringify(body));
  console.log("Caller:", callerNumber);
  console.log("Recording URL:", recordingUrl);

  try {
    // --------------------------------------------------
    // 1. DOWNLOAD RECORDING FROM VONAGE
    // --------------------------------------------------

    if (!recordingUrl) {
      throw new Error("No recording_url received from Vonage");
    }

    console.log("Generating Vonage JWT...");

    const token = tokenGenerate(
      config.VONAGE_APP_ID,
      config.VONAGE_PRIVATE_KEY
    );

    console.log("JWT generated.");

    const dlRes = await fetch(recordingUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Vonage download status:", dlRes.status);
    console.log(
      "Vonage content-type:",
      dlRes.headers.get("content-type")
    );

    if (!dlRes.ok) {
      const errorText = await dlRes.text();

      throw new Error(
        `Vonage recording download failed: ${dlRes.status} ${errorText}`
      );
    }

    const audioBuffer = await dlRes.arrayBuffer();
    const nodeBuffer = Buffer.from(audioBuffer);

    console.log("Downloaded bytes:", audioBuffer.byteLength);
    console.log("Node buffer bytes:", nodeBuffer.length);

    if (nodeBuffer.length === 0) {
      throw new Error("Recording downloaded but contains zero bytes");
    }

    // --------------------------------------------------
    // 2. UPLOAD TO CATBOX
    // --------------------------------------------------

    console.log("Uploading recording to Catbox...");

    const formData = new FormData();

    formData.append("reqtype", "fileupload");

    formData.append(
      "fileToUpload",
      new Blob([nodeBuffer], {
        type: "audio/mpeg"
      }),
      "voicemail.mp3"
    );

    const uploadRes = await fetch(
      "https://catbox.moe/user/api.php",
      {
        method: "POST",
        body: formData
      }
    );

    const catboxUrl = await uploadRes.text();

    console.log("Catbox HTTP status:", uploadRes.status);
    console.log("Catbox response:", catboxUrl);

    if (!uploadRes.ok) {
      throw new Error(
        `Catbox HTTP error: ${uploadRes.status} ${catboxUrl}`
      );
    }

    if (!catboxUrl.startsWith("http")) {
      throw new Error(
        `Catbox did not return a URL: ${catboxUrl}`
      );
    }

    // --------------------------------------------------
    // 3. UPLOAD TO DISROOT
    // --------------------------------------------------

    const filename = `voicemail_${Date.now()}.mp3`;

    const disrootUrl =
      `https://cloud.disroot.org/remote.php/dav/files/` +
      `${config.DISROOT_USER}/Voicemails/${filename}`;

    const credentials = Buffer.from(
      `${config.DISROOT_USER}:${config.DISROOT_PASS}`
    ).toString("base64");

    console.log("Uploading to Disroot...");
    console.log("Filename:", filename);

    const disrootUpload = await fetch(disrootUrl, {
      method: "PUT",

      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "audio/mpeg"
      },

      body: nodeBuffer
    });

    console.log(
      "Disroot upload status:",
      disrootUpload.status
    );

    if (!disrootUpload.ok) {
      const disrootError = await disrootUpload.text();

      throw new Error(
        `Disroot upload failed: ${disrootUpload.status} ${disrootError}`
      );
    }

    // --------------------------------------------------
    // 4. CREATE DISROOT SHARE
    // --------------------------------------------------

    console.log("Creating Disroot public share...");

    const shareRes = await fetch(
      "https://cloud.disroot.org/ocs/v2.php/apps/files_sharing/api/v1/shares",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
          "OCS-APIRequest": "true"
        },

        body:
          `path=/Voicemails/${filename}` +
          `&shareType=3`
      }
    );

    const shareText = await shareRes.text();

    console.log(
      "Disroot share status:",
      shareRes.status
    );

    console.log(
      "Disroot share response:",
      shareText
    );

    const shareMatch =
      shareText.match(/<url>(.*?)<\/url>/);

    const disrootShareUrl =
      shareMatch ? shareMatch[1] : null;

    console.log(
      "Disroot share URL:",
      disrootShareUrl
    );

    // --------------------------------------------------
    // 5. FORMAT DATE/TIME
    // --------------------------------------------------

    const date = new Date(startTime);

    const formattedDate =
      date.toLocaleDateString("en-US", {
        timeZone: "America/New_York"
      });

    const formattedTime =
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/New_York"
      });

    // --------------------------------------------------
    // 6. SEND SMS
    // --------------------------------------------------

    const text =
      `New voicemail From: ${callerNumber} ` +
      `Date: ${formattedDate} ` +
      `Time: ${formattedTime} ET ` +
      `Listen: ${catboxUrl.trim()}` +
      `${
        disrootShareUrl
          ? " Backup: " + disrootShareUrl
          : ""
      }`;

    console.log("SMS text:", text);
    console.log("Sending SMS...");

    const smsUrl =
      `https://rest.nexmo.com/sms/json` +
      `?api_key=${config.VONAGE_API_KEY}` +
      `&api_secret=${config.VONAGE_API_SECRET}` +
      `&from=${config.VONAGE_NUMBER}` +
      `&to=${config.KAMY_NUMBER}` +
      `&text=${encodeURIComponent(text)}`;

    const smsResponse = await fetch(smsUrl);

    const smsResult = await smsResponse.text();

    console.log(
      "SMS HTTP status:",
      smsResponse.status
    );

    console.log(
      "SMS response:",
      smsResult
    );

    console.log(
      "========== RECORDING HANDLER SUCCESS =========="
    );

  } catch (err) {

    console.error(
      "========== RECORDING HANDLER ERROR =========="
    );

    console.error("Error:", err);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    // --------------------------------------------------
    // FALLBACK SMS
    // --------------------------------------------------

    try {

      console.log("Attempting fallback SMS...");

      const text =
        `New voicemail From: ${callerNumber} ` +
        `Date: ${startTime}`;

      const smsUrl =
        `https://rest.nexmo.com/sms/json` +
        `?api_key=${config.VONAGE_API_KEY}` +
        `&api_secret=${config.VONAGE_API_SECRET}` +
        `&from=${config.VONAGE_NUMBER}` +
        `&to=${config.KAMY_NUMBER}` +
        `&text=${encodeURIComponent(text)}`;

      const smsResponse = await fetch(smsUrl);

      const smsResult = await smsResponse.text();

      console.log(
        "Fallback SMS HTTP status:",
        smsResponse.status
      );

      console.log(
        "Fallback SMS response:",
        smsResult
      );

    } catch (smsErr) {

      console.error(
        "Fallback SMS FAILED:",
        smsErr
      );
    }
  }

  res.status(200).json({
    status: "ok"
  });
}
