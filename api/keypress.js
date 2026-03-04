// api/keypress.js - Update the 'connect' block
} else {
  res.status(200).json([
    {
      action: "connect",
      timeout: 15,
      from: config.VONAGE_NUMBER,
      eventType: "synchronous", // <--- THIS IS THE KEY
      eventUrl: [`${config.BASE_URL}/api/outbound-events`],
      endpoint: [
        {
          type: "phone",
          number: config.KAMY_NUMBER
        }
      ]
    }
  ]);
}
