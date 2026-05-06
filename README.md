# Mood Muze 🎵

> **Mood-based and location-based playlist recommendation** — powered by real-time AI emotion detection in the browser.

Mood Muze reads your facial expression via webcam (using [face-api.js](https://github.com/justadudewhohacks/face-api.js)) or detects your location, then opens an embedded **Spotify playlist** perfectly matched to your vibe — all in the browser, no server required.

---

## 🚀 Live Demo

**[▶ Try Mood Muze Live →](vaishvi-code.github.io/Mood_Muze/)**

*(Replace with your actual GitHub Pages URL after deployment)*

---

## ✨ Features

| Feature | How it works |
|---|---|
| 😄 **Emotion Detection** | Webcam → face-api.js → dominant emotion → Spotify embed |
| 📍 **Location Vibes** | Browser GPS → OpenStreetMap Nominatim → Indian state → Spotify embed |
| 🔒 **Privacy-first** | All detection runs in your browser — no video sent to any server |
| 🎵 **Spotify Embed** | In-page Spotify player, no login required |

---

## 🛠️ Tech Stack

- **face-api.js** — TinyFaceDetector + FaceExpressionNet (runs entirely in browser)
- **Browser Geolocation API** — GPS-based location
- **OpenStreetMap Nominatim** — Free reverse geocoding, no API key needed
- **Spotify Embed API** — No auth required for playback embed
- **Vanilla HTML / CSS / JS** — Zero frameworks, zero build step
- **GitHub Pages** — Free static hosting

---

## 📁 Project Structure

```
docs/                  ← GitHub Pages root
├── index.html         ← Main app
├── about.html         ← About page
├── style.css          ← Dark glassmorphism design
├── app.js             ← Core logic (emotion + geo detection)
├── models/            ← face-api.js model weights (local, offline-capable)
│   ├── tiny_face_detector_model-*
│   └── face_expression_model-*
├── logo.png
├── emotion2.gif
└── location.gif

mood/                  ← Original Flask prototype (kept for reference)
├── sample.py
├── sample2.py
└── templates/
```

---

## 🌐 Deploy to GitHub Pages (Free)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to: `Deploy from a branch` → Branch: `main` → Folder: `/docs`
4. Click **Save**
5. Your live URL will be: `https://YOUR_USERNAME.github.io/Mood_Muze/`

---

## 🎭 Emotion → Playlist Mapping

| Emotion | Playlist |
|---|---|
| 😄 Happy | Happy Vibes |
| 😢 Sad | Sad Songs |
| 😤 Angry | Rage Playlist |
| 😲 Surprised | Surprise Mix |
| 😨 Fearful | Tension Playlist |
| 🤢 Disgusted | Confused Mix |
| 😐 Neutral | Chill Mix |

## 📍 Location → Playlist Mapping (Indian States)

Rajasthan, Maharashtra, Gujarat, Bihar, Uttar Pradesh, West Bengal, Goa, Assam, Andhra Pradesh, Tamil Nadu, Punjab, Jammu & Kashmir, Arunachal Pradesh, Odisha, Kerala, Karnataka, Telangana

---

*© 2024 Mood Muze*
