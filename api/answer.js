module.exports = function handler(req, res) {
  res.json([
    {
      action: "talk",
      text: "Hello. Thank you for calling. Goodbye.",
      language: "en-GB",
      style: 0
    }
  ]);
}
