module.exports = function handler(req, res) {
  res.json([
    {
      action: "talk",
      text: "Hello. Thank you for calling. Goodbye. miguel mamaguebo",
      language: "en-GB",
      style: 0
    }
  ]);
}
