import { tokenGenerate } from '@vonage/jwt';

export default async function handler(req, res) {
  // 1. HARDCODED CONFIG
  const appId = "ecefa59a-3067-489d-b3cd-d0cef77dca53";
  const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCbKR+cEFKEphE9
Qj8AdI6g+C1vb8UYjzoMrafERaY7ipYtdJqdwCNh6maVk7b3ltyW6CImgUWFstEa
kOFMjIjG0aoqkifvmpKQCOR+Uv0I3Y6eXvRGE66N4qdck6IW0A0zEL2awIB9RpJW
uyrebu85OSRMrOigub9GUrXCF4I4ksrhdWPnyZOCSfsSbOFYJobZSzs8yOk5ChjA
NTB9clRpNUw0wyvXYXM4oBvLHj5pCsyh0d2iLIUeyX8/uKLI1gILCpZ/YnlwnNWO
9KavNYUX8s54hcpPum/eS3yC/3/fRM0gM2bpdHkAjMIAuH9u3dS8f1l9wXd7jopi
xFzPUaeNAgMBAAECggEATRq8/glwcEG0TGxYsYm6fQyHS5rP55n5P2ameZcg+fKv
GWyaDy11h8l7a/ZJVLUv7n/xxI+19DA90EVR6H/n0mFLfjc+SEfYcGIy5gGog5jS
MCpAmnhaZGDPSWaGBG8kOA2oIzhpQZfpzdbaAUpAb//Q5ZeBTKmxfylH8GlNSX4G
wkvTEhAdA7I9TuySSKyBWN5ko+TewdyVcK4H2W5wEk1yBwrl811v72kUqt5AFxOH
qeMv09g3zJThETxMhNtKHZAzWC5gqDS6e6WbZ3YrOfGvEcgtf+2v4Dle4NYbKvgV
BkduJ8uatPsbKZ9Yuu+N0wzM0IHmpf6Ss1Rb1kpU0wKBgQDO5iBpBP5ZHzZ1HRVe
KI7GbkpxG3Bs08UUxhwS3z0Vp/K9x5ZH9rDadwJXDxjblH/tFpldmoeu5smwrIcR
VJeUve4H8lIUtZ7hDu2pjS3kQLZCOhenER1jjYknPJVE2KITyaANQYed+ME2vpUF
CXC5AmTpoegm33+HkugylEX2UwKBgQC/+7RlnTLYijBH/vTQKq98jfQOKleOo2Gg
MEMEMXVTH69uTuOZFgJXMzu0+W/AhqehG5Xu9FV/p86WLZ+8g2GFVArH5B5P2yCF
RAnXf/GW8YHg0Pkwfic0HUczMZ2unIoIrSEEsmS7zbXvHxuWVJ42Hz2cObrwuBBv
p4vmKyJunwKBgB7mh9ingkVVQBDlsxdI/2nrdvrFmljml/yuSesXpEvjtYFambtN
wMQgGh1eh9vjpeeHBIjSV4lrtpvIaLPR6oGwjChrrI6jQYNjc2NrTntUnuPtQTMW
f0krDlzp03Fg2XQTHPBd5R9W06SVejQyYL+A+AlcwQttPeLFsiA7vOc5AoGAWq0d
9WicHV6Xk0m+g5vFqwS5Iv+ovzw33hstbAuYKJyslWM5aJLWpC0UpFO0DrEK97M5
y9UnlNXDY3dFHRrIstqRBPyfvIP5BjiulVRe3TZQa8kICXlsNtclS+7BVTmmkJaF
I9zGa1Wr+rcspoJs/48d4G3797pYOQRftWTmLG0CgYBDVMr5k/hAJLE+3sY8lwkx
piHjOZfY0ME0qUCt58Hi07wW/1CyNuDq+O73L7IpKX3CZmCn5RVnO95XtlBUSPtD
FbQG8nBdhMpBOOdb+RVH+/4Uny6nCLGZJTICFmrq/lDmo24/Nx7YXT+TUyFAcTuB
zdwPD79QcDliX9egBiuiDw==
-----END PRIVATE KEY-----`;

  const jwt = tokenGenerate(appId, privateKey);
  const body = req.body || {};
  
  // Log every request to Vercel so we can see it
  console.log("LOG: Incoming Webhook from Vonage:", JSON.stringify(body));

  try {
    // 2. SEND PLAIN TEXT SMS IMMEDIATELY
    const smsRes = await fetch(`https://api.nexmo.com/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        message_type: 'text',
        text: "New Voicemail Received. (Plain Text Test)",
        to: "13059827377",
        from: "13105151321",
        channel: 'sms'
      })
    });

    const smsData = await smsRes.json();
    console.log("LOG: Vonage Response:", JSON.stringify(smsData));
  } catch (err) {
    console.error("LOG: SMS Submission Failed:", err.message);
  }

  res.status(200).json({ status: "ok" });
}
