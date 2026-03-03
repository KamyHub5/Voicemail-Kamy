module.exports = function handler(req, res) {
  const body = req.method === "POST" ? req.body : req.query;
  console.log("NEW VOICEMAIL RECEIVED");
  console.log("Recording URL:", body.recording_url);
  console.log("Time:", body.start_time);
  res.status(200).json({ status: "ok" });
}
```

---

**`api/events.js`** — no change needed, keep as is.

---

So your repo will now have:
```
voicemail-kamy/
├── api/
│   ├── answer.js
│   ├── events.js
│   └── recording.js
└── vercel.json
