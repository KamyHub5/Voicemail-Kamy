import config from "./config.js";

export default function handler(req, res) {
  const body = req.body || {};
  const digit = body.dtmf?.digits || body.digits || "";

  if (digit === "*") {
    res.status(200).json([
      {
        action: "talk",
        text: "Please leave a message. You can press pound or just hang up when you are done.",
        language: "en-GB"
      },
      {
        action: "record",
        format: "mp3",
        beepStart: true,
        // Removing endOnKey makes it asynchronous: it fires on BOTH hangup and #
        eventUrl: [`https://voicemail-kamy.vercel.app/api/recording`],
        eventMethod: "POST",
        transcription: {
          eventUrl: [`https://voicemail-kamy.vercel.app/api/transcript`],
          language: "en-GB"
        }
      }
    ]);
  } else {
    res.status(200).json([
      {
        action: "connect",
        from: "13105151321",
        endpoint: [{ type: "phone", number: "13059827377" }]
      }
    ]);
  }
}
