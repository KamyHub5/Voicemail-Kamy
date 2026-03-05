import config from "./config.js";
import { tokenGenerate } from "@vonage/jwt";

export default async function handler(req, res) {
  try {
    const token = tokenGenerate(config.VONAGE_APP_ID, config.VONAGE_PRIVATE_KEY);
    console.log("JWT generated:", token.substring(0, 50));
    
    // Try to download a known recording URL if you pass one as ?url=...
    const testUrl = req.query.url;
    if (testUrl) {
      const dlRes = await fetch(testUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Download status:", dlRes.status);
      res.status(200).json({ jwt: "ok", download_status: dlRes.status });
    } else {
      res.status(200).json({ jwt: "ok", token_preview: token.substring(0, 50) });
    }
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(200).json({ jwt: "failed", error: err.message });
  }
}
