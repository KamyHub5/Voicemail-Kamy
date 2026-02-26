export default async (request, response) => {
  const ncco = [
    {
      action: "talk",
      voiceName: "Amy",
      language: "en-GB",
      text: "Please leave a message at the tone. Press the pound key when finished."
    },
    {
      action: "record",
      eventUrl: ["https://your-glitch-project.glitch.me/handleRecording"], // <- update this after deploying server
      endOnKey: "#",
      timeOut: 5,
      maxLength: 25,
      beepStart: true
    }
  ];

  response.json(ncco);
};


// This is a single-line comment (a note).
// Replace the eventUrl with the public URL of your recording server (Glitch, Replit, etc.).
