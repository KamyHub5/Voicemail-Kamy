module.exports = function handler(req, res) {
  res.status(200).json([
    {
      action: "talk",
      text: "<speak><break time='2s'/>Hello. Thank you for calling. Please remain on the line to be connected, or press the star key to leave a voicemail.</speak>",
      language: "en-GB",
      style: 0
    },
    {
      action: "connect",
      timeout: 15,
      from: "13105151321",
      eventUrl: ["https://voicemail-kamy.vercel.app/api/events"],
      endpoint: [
        {
          type: "phone",
          number: "13059827377"
        }
      ]
    }
  ]);
}
