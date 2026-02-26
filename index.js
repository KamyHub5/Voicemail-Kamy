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
      eventUrl: ["https://your-server.com/handleRecording"], // replace with your callback
      endOnKey: "#",
      timeOut: 5,
      maxLength: 25,
      beepStart: true
    }
  ];

  response.json(ncco);
};


// replace with your callback
// This is a single-line comment (a note).
