import config from "./config.js";

export default function handler(req, res) {
  res.status(200).json([
    {
      action: "talk",
      text: `<speak>
        <prosody volume="+6dB" pitch="low">
          <break time="1s"/>
          Hello. <break strength="weak"/> Thank you for calling. 
          <prosody rate="slow">Please remain on the line to be connected,</prosody> 
          <break strength="medium"/> or press the star key to leave a voicemail.
        </prosody>
      </speak>`,
      language: "en-GB",
      bargeIn: true
    },
    {
      action: "input",
      type: ["dtmf"],
      dtmf: { timeOut: 5, maxDigits: 1 },
      eventUrl: [`${config.BASE_URL}/api/keypress`],
      eventMethod: "POST"
    }
  ]);
};
