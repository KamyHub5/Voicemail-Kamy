export default function handler(req, res) {
  res.status(200).json([
    {
      action: "talk",
      text: "Recording started. Hang up when done."
    },
    {
      action: "record",
      eventUrl: ["https://voicemail-kamy.vercel.app/api/recording"],
      eventMethod: "POST"
    }
  ]);
}
