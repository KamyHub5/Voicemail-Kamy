# Vonage Voicemail Project

# Kamy Vonage Voicemail System

A serverless voice call handling, call forwarding, and voicemail recording service built with **Vonage Voice API** and hosted on **Vercel**.

---

## Overview

This project provides an automated interactive voice response (IVR) system:
1. **Inbound Call Handling:** Answers incoming calls, plays a greeting, and listens for keypad input (`*` key).
2. **Call Forwarding / Screening:** Attempts to bridge the call to your mobile number.
3. **Voicemail Recording:** If unreachable or if `*` is pressed, plays a prompt and records the caller's message.
4. **Storage & SMS Notification:** Downloads recorded MP3s using Vonage JWTs, backs them up to **Catbox.moe** and **Disroot Cloud**, and sends an SMS notification with listen/download links.
5. **SMS & Status Tracking:** Handles incoming text messages and delivery receipts.

---

## File & Repository Structure

```text
├── api/
│   ├── answer.js          **# Inbound call answer handler & greeting prompt**
│   ├── keypress.js        **# Keypad router (* for voicemail, else connect)**
│   ├── outbound-events.js **# Call connect failover & fallback to voicemail**
│   ├── recording.js       **# Audio processor, cloud uploader, & SMS notifier**
│   ├── events.js          # Voice call status event logger
│   ├── inbound.js         # Inbound SMS message webhook handler
│   └── status.js          # Outbound SMS delivery status tracker
├── x_archive/             # Archived tools & deprecated scripts
│   ├── test-jwt.js        # Diagnostic tool for JWT generation & downloads
│   ├── transcript.js      # Template handler for future voicemail transcripts
│   └── voicemail.js       # (Deprecated) Legacy CommonJS handler
├── config.js              # Centralized environment variable configuration
├── index.html             # Public system status landing page
├── package.json           # Node.js dependencies & ES Module settings
├── vercel.json            # Vercel Serverless Function deployment settings
└── README.md              # Project documentation
