// Inside api/keypress.js (the connect block)
{
  action: "connect",
  timeout: 15,
  from: config.VONAGE_NUMBER,
  // IMPORTANT: This eventUrl will receive the status of the OUTBOUND leg
  eventUrl: [`${config.BASE_URL}/api/outbound-events`], 
  endpoint: [{
    type: "phone",
    number: config.KAMY_NUMBER
  }]
}
