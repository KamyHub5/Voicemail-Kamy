// ─────────────────────────────────────────────
// EVENTS — receives all call status updates from Vonage
// Handles timeout/no-answer → redirects to voicemail
// All other statuses acknowledged and ignored
// ─────────────────────────────────────────────

const config = require("./config");

module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  const status = body.status;
  const disconnectedBy = body.disconnected_by || body.disconnectedBy;

  console.log("CALL EVENT:", status, "| Disconnected by:", disconnectedBy);

  if (
    status === "timeout" ||
    status === "failed" ||
    status === "rejected" ||
    status === "unanswered" ||
    (status === "completed" && disconnectedBy === "platform")
  ) {
    // No answer or failed — redirect to voicemail
    res.redirect(`${config.BASE_URL}/api/voicemail`);
  } else {
    // All other statuses — just acknowledge
    res.status(200).json({ status: "ok" });
  }
};
```

---

Push all 6 files and test. Your repo should look like:
```
voicemail-kamy/
├── api/
│   ├── config.js
│   ├── answer.js
│   ├── keypress.js
│   ├── voicemail.js
│   ├── recording.js
│   └── events.js
└── vercel.json
