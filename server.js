// server.js
import express from "express";
import fetch from "node-fetch"; // if you plan to call transcription API

const app = express();
app.use(express.json());

app.post("/handleRecording", async (req, res) => {
  const { recording_url, uuid } = req.body;

  console.log("New voicemail received:", recording_url);

  // Optional: send recording to transcription API
  // Example placeholder (Vonage AI STT or any service)
  /*
  const transcriptResponse = await fetch("https://api.vonage.com/speech-to-text/v1/recognize", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      audio_url: recording_url,
      language: "en-GB"
    })
  });
  const transcriptData = await transcriptResponse.json();
  console.log("Transcript:", transcriptData.text);
  */

  // Optional: send email with recording/transcript
  // You can integrate SendGrid, Nodemailer, etc.

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Recording callback server running")
);
