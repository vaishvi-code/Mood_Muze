/* ============================================================
   app.js — Mood Muze core logic
   Emotion detection via face-api.js + Geolocation via browser API
   ============================================================ */

'use strict';

// ── Model path: load from CDN ──────────────────────────────────
const MODEL_URL = './models';

// ── face-api.js emotion labels → playlist mapping ─────────────
// face-api returns: neutral, happy, sad, angry, fearful, disgusted, surprised
const emotionPlaylists = {
  happy:     { type: 'playlist', id: '7GhawGpb43Ctkq3PRP1fOL', label: 'Happy 😄',     emoji: '😄' },
  sad:       { type: 'playlist', id: '2GevOeTWtEEX4EVFEdX5zE', label: 'Sad 😢',       emoji: '😢' },
  angry:     { type: 'playlist', id: '4Ouff72gQ4LCA8qEkBl3fH', label: 'Angry 😤',     emoji: '😤' },
  surprised: { type: 'playlist', id: '3CUpYjEl8N4KQWT57iJJD7', label: 'Surprised 😲', emoji: '😲' },
  fearful:   { type: 'playlist', id: '4qttDydvt6zAKRlnjR0G6C', label: 'Fearful 😨',   emoji: '😨' },
  disgusted: { type: 'playlist', id: '63GnUl1NxDKld4ZjjzUCBc', label: 'Disgusted 🤢', emoji: '🤢' },
  neutral:   { type: 'playlist', id: '5MX1quD2Hrs1I59eRTJ1Q8', label: 'Chill 😐',     emoji: '😐' },
};

// ── Global country fallback playlists (for users outside India) ───
const countryPlaylists = {
  'United States': { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'United States 🇺🇸' },
  'United Kingdom': { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'United Kingdom 🇬🇧' },
  'Canada':         { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'Canada 🇨🇦' },
  'Australia':      { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'Australia 🇦🇺' },
  'Germany':        { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'Germany 🇩🇪' },
  'France':         { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'France 🇫🇷' },
  'Japan':          { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'Japan 🇯🇵' },
  'DEFAULT':        { type: 'playlist', id: '37i9dQZF1DXcBWIGoYBM5M', label: 'Global' },
};

// ── Indian State → playlist mapping ───────────────────────────
const statePlaylists = {
  'Rajasthan':           { type: 'playlist', id: '2WSmlNi6hcFutn7q5samOV' },
  'Maharashtra':         { type: 'playlist', id: '37i9dQZF1DX84EApEEEkUc' },
  'Gujarat':             { type: 'playlist', id: '0ahtofkR9qHdctnA56ash7' },
  'Bihar':               { type: 'playlist', id: '37i9dQZF1DX9BgAv0V9A8C' },
  'Uttar Pradesh':       { type: 'playlist', id: '4h8xLLUU32DC3gZ36pmjAW' },
  'West Bengal':         { type: 'album',    id: '1zDQjAN968JFruaOoDkWXZ' },
  'Goa':                 { type: 'album',    id: '50NKv9Z882vgcisk0bdIrM' },
  'Assam':               { type: 'playlist', id: '37i9dQZF1E8PJNR1Jqih35' },
  'Andhra Pradesh':      { type: 'playlist', id: '37i9dQZF1DX6XE7HRLM75P' },
  'Tamil Nadu':          { type: 'playlist', id: '37i9dQZF1DX1i3hvzHpcQV' },
  'Punjab':              { type: 'playlist', id: '37i9dQZF1DWXVJK4aT7pmk' },
  'Jammu and Kashmir':   { type: 'playlist', id: '4ucV6sAbNlBcQsFy3H8Zy4' },
  'Arunachal Pradesh':   { type: 'playlist', id: '6KRwuTxNzDQ7RyAhhCy9OV' },
  'Odisha':              { type: 'playlist', id: '0Vv84AFzg0dbWs9S5y0usV' },
  'Kerala':              { type: 'playlist', id: '6zTiiA1NGJZn33jejJVuM5' },
  'Karnataka':           { type: 'playlist', id: '1KhnrqdMdPGHVo0NzuemgZ' },
  'Telangana':           { type: 'playlist', id: '37i9dQZF1DWTw6jXuVBprS' },
};

// ── DOM references ─────────────────────────────────────────────
const webcamModal    = document.getElementById('webcam-modal');
const geoModal       = document.getElementById('geo-modal');
const video          = document.getElementById('video');
const canvas         = document.getElementById('canvas');
const statusDot      = document.getElementById('status-dot');
const statusText     = document.getElementById('status-text');
const progressBar    = document.getElementById('progress-bar');
const resultSection  = document.getElementById('result-section');
const resultEmoji    = document.getElementById('result-emoji');
const resultTitle    = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const spotifyIframe  = document.getElementById('spotify-iframe');
const geoDesc        = document.getElementById('geo-desc');

// ── State ──────────────────────────────────────────────────────
let mediaStream      = null;
let modelsLoaded     = false;
let detectionTimer   = null;
let geoTimeoutId     = null;

// ── Helpers ───────────────────────────────────────────────────
function showModal(modal) {
  modal.hidden = false;
  modal.style.display = 'flex';
}

function hideModal(modal) {
  modal.hidden = true;
  modal.style.display = 'none';
}

function setStatus(text, state = 'idle') {
  statusText.textContent = text;
  statusDot.className = 'status-dot';
  if (state === 'detecting') statusDot.classList.add('detecting');
  if (state === 'success')   statusDot.classList.add('success');
  if (state === 'error')     statusDot.classList.add('error');
}

function buildSpotifyEmbedUrl(type, id) {
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}

function showResult({ emoji, title, subtitle, spotifyType, spotifyId }) {
  resultEmoji.textContent    = emoji;
  resultTitle.textContent    = title;
  resultSubtitle.textContent = subtitle;
  spotifyIframe.src          = buildSpotifyEmbedUrl(spotifyType, spotifyId);

  resultSection.hidden = false;
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stopWebcam() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  if (detectionTimer) {
    clearTimeout(detectionTimer);
    detectionTimer = null;
  }
  video.srcObject = null;
}

function closeWebcamModal() {
  stopWebcam();
  hideModal(webcamModal);
  progressBar.style.width = '0%';
}

// ── Load face-api.js models (only once) ───────────────────────
async function loadModels() {
  if (modelsLoaded) return;
  setStatus('Loading AI models…', 'detecting');

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
  setStatus('Models ready — analyzing…', 'detecting');
}

// ── Emotion Detection Flow ─────────────────────────────────────
async function startEmotionDetection() {
  resultSection.hidden = true;
  resultSection.style.display = 'none';
  showModal(webcamModal);
  setStatus('Starting camera…', 'idle');
  progressBar.style.width = '0%';

  // 1. Start webcam
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    video.srcObject = mediaStream;
  } catch (err) {
    setStatus('Camera access denied. Please allow camera permissions.', 'error');
    return;
  }

  // 2. Wait for video to play
  await new Promise(resolve => {
    video.onloadedmetadata = () => { video.play(); resolve(); };
  });

  // 3. Load models
  try {
    await loadModels();
  } catch (err) {
    setStatus('Failed to load AI models. Check your internet connection.', 'error');
    return;
  }

  setStatus('Analyzing your expression…', 'detecting');

  // 4. Run detection loop — accumulate for 3.5 seconds, pick dominant
  const emotionTally = {};
  let totalDetections = 0;
  const MAX_DETECTIONS = 12;
  let progress = 0;

  async function detectLoop() {
    if (totalDetections >= MAX_DETECTIONS) {
      finishDetection(emotionTally, totalDetections);
      return;
    }

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
      .withFaceExpressions();

    if (detection) {
      const exprs = detection.expressions;
      // Get top emotion for this frame
      const top = Object.entries(exprs).sort(([, a], [, b]) => b - a)[0][0];
      emotionTally[top] = (emotionTally[top] || 0) + 1;
      totalDetections++;
    }

    // Advance progress bar smoothly
    progress = Math.min(100, (totalDetections / MAX_DETECTIONS) * 100);
    progressBar.style.width = `${progress}%`;

    detectionTimer = setTimeout(detectLoop, 300);
  }

  detectLoop();
}

function finishDetection(tally, total) {
  stopWebcam();

  if (total === 0) {
    setStatus('No face detected. Please try again.', 'error');
    return;
  }

  // Pick the emotion with the most votes
  const dominantEmotion = Object.entries(tally).sort(([, a], [, b]) => b - a)[0][0];
  const data = emotionPlaylists[dominantEmotion] || emotionPlaylists.neutral;

  setStatus('Done!', 'success');

  // Small delay for UX then close modal and show result
  setTimeout(() => {
    closeWebcamModal();
    showResult({
      emoji:       data.emoji,
      title:       `You're feeling ${data.label}`,
      subtitle:    'Here\'s a playlist curated for your vibe right now ✨',
      spotifyType: data.type,
      spotifyId:   data.id,
    });
  }, 600);
}

// ── Geolocation Flow ──────────────────────────────────────────
function closeGeoModal() {
  if (geoTimeoutId) { clearTimeout(geoTimeoutId); geoTimeoutId = null; }
  hideModal(geoModal);
}

async function startLocationDetection() {
  resultSection.hidden = true;
  resultSection.style.display = 'none';

  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  showModal(geoModal);
  geoDesc.textContent = 'Please allow location access when prompted…';

  // Hard safety timeout — always dismiss after 15s no matter what
  geoTimeoutId = setTimeout(() => {
    closeGeoModal();
    resolveLocationPlaylist(null, null);
  }, 15000);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      geoDesc.textContent = 'Got your location! Finding where you are…';

      try {
        const { state, country } = await reverseGeocode(latitude, longitude);
        geoDesc.textContent = `You're in ${state || country || 'an unknown location'}!`;

        setTimeout(() => {
          closeGeoModal();
          resolveLocationPlaylist(state, country);
        }, 900);

      } catch (err) {
        geoDesc.textContent = 'Almost there…';
        setTimeout(() => {
          closeGeoModal();
          resolveLocationPlaylist(null, null);
        }, 800);
      }
    },
    (err) => {
      closeGeoModal();
      if (err.code === err.PERMISSION_DENIED) {
        alert('Location permission denied. Please allow location access and try again.');
      } else {
        // Still show a global playlist rather than just an error
        resolveLocationPlaylist(null, null);
      }
    },
    { timeout: 12000, enableHighAccuracy: false }
  );
}

// Use OpenStreetMap Nominatim — free, no API key needed
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  return {
    state:   data?.address?.state   ?? null,
    country: data?.address?.country ?? null,
  };
}

function resolveLocationPlaylist(stateName, countryName) {
  // First try Indian state, then country fallback, then global default
  const indianMatch  = stateName   ? statePlaylists[stateName]   : null;
  const countryMatch = countryName ? countryPlaylists[countryName] : null;
  const fallback     = countryPlaylists['DEFAULT'];

  const playlistData = indianMatch || countryMatch || fallback;
  const label = stateName || countryName || 'the World';
  const isIndian = !!indianMatch;

  showResult({
    emoji:       '📍',
    title:       `Vibes from ${label}`,
    subtitle:    isIndian
      ? `Music rooted in the soul of ${stateName} 🎶`
      : `Global hits to match your moment wherever you are 🌍`,
    spotifyType: playlistData.type,
    spotifyId:   playlistData.id,
  });
}

// ── Event Listeners ───────────────────────────────────────────

// Emotion buttons (card + hero)
document.getElementById('startDetection').addEventListener('click', startEmotionDetection);
document.getElementById('hero-emotion-btn').addEventListener('click', startEmotionDetection);

// Location buttons (card + hero)
document.getElementById('startLocation').addEventListener('click', startLocationDetection);
document.getElementById('hero-location-btn').addEventListener('click', startLocationDetection);

// Close webcam modal
document.getElementById('closeModal').addEventListener('click', () => {
  closeWebcamModal();
});

// Close modal on overlay click
webcamModal.addEventListener('click', (e) => {
  if (e.target === webcamModal) closeWebcamModal();
});

// Close geo modal button
document.getElementById('closeGeoModal').addEventListener('click', closeGeoModal);

// Close geo modal on overlay click
geoModal.addEventListener('click', (e) => {
  if (e.target === geoModal) closeGeoModal();
});

// Reset / Try Again
document.getElementById('resetBtn').addEventListener('click', () => {
  spotifyIframe.src = '';
  resultSection.hidden = true;
  resultSection.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Keyboard: Escape to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !webcamModal.hidden) closeWebcamModal();
});
