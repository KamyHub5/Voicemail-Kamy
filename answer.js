export default function handler(req, res) {
  const ncco = [
    {
      action: "talk",
      text: "Hello. Thank you for calling. Goodbye.",
      language: "en-GB",
      style: 0
    }
  ];

  res.status(200).json(ncco);
}
