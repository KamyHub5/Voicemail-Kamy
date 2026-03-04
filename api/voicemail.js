// ─────────────────────────────────────────────
// VOICEMAIL — single source of truth for voicemail flow
// Triggered by: star key press OR no answer timeout
// Plays prompt, records message, confirms and hangs up
// ─────────────────────────────────────────────

const config = require("./config");

module.exports = function handler(req, res) {
  res.status(200).json([
    {
      // Step 1: Prompt caller to leave message
      action: "talk",
      text: "<speak><break time='2s'/>Please leave a message at the tone. Press the pound key when finished.</speak>",
      language: "en-GB",
      style: 0
    },
    {
      // Step 2: Record the message
      // Stops on: # key, 5s silence, or 25s max
      action: "record",
      format: "mp3",
      endOnSilence: 5,
      endOnKey: "#",
      timeOut: 25,
      beepStart: true,
      eventUrl: [`${config.BASE_URL}/api/recording`]
    },
    {
      // Step 3: Confirm and hang up
      action: "talk",
      text: "Your message has been recorded. Thank you. Goodbye.",
      language: "en-GB",
      style: 0
    }
  ]);
};
