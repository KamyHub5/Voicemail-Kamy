// server.js
import express from "express";
const app = express();
app.use(express.json());

app.post("/handleRecording", (req, res) => {
  console.log("Recording webhook:", req.body);
  res.status(200).send("OK");
});

app.listen(process.env.PORT || 3000);
