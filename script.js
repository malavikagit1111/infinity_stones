/* INFINITY.EXE — intentionally dependency-free: webcam + canvas + plain JavaScript */
const stones = {
  time: { label: 'TIME STONE', colour: 'GREEN', hue: 120, hex: '#41f38b' },
  mind: { label: 'MIND STONE', colour: 'YELLOW', hue: 60, hex: '#ffe656' },
  reality: { label: 'REALITY STONE', colour: 'RED', hue: 0, hex: '#ff5364' },
  power: { label: 'POWER STONE', colour: 'PURPLE', hue: 290, hex: '#bd6cff' },
  space: { label: 'SPACE STONE', colour: 'BLUE', hue: 220, hex: '#54adff' },
  soul: { label: 'SOUL STONE', colour: 'ORANGE', hue: 30, hex: '#ff9e4d' }
};

const colourRanges = [
  { key: 'reality', test: h => h <= 12 || h >= 345 },
  { key: 'soul', test: h => h > 13 && h <= 42 },
  { key: 'mind', test: h => h > 43 && h <= 72 },
  { key: 'time', test: h => h > 73 && h <= 165 },
  { key: 'space', test: h => h > 190 && h <= 250 },
  { key: 'power', test: h => h > 251 && h < 344 }
];

const state = { collected: new Set(), cameraStream: null, scanTimer: null, candidate: null, candidateFrames: 0, snapped: false, timeClock: null, timePopups: null, soulPopups: null, mindControl: null, audioEnabled: false, backendSessionId: null };
const $ = id => document.getElementById(id);
const webcam = $('webcam'), canvas = $('analysisCanvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });

function showToast(message, type = '') {
  const toast = $('toast'); toast.textContent = message; toast.className = `toast show ${type}`;
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.className = 'toast', 3200);
}

/* Local backend connection. The UI stays usable if this optional call is offline. */
async function initializeBackend() {
  const badge = $('backendStatus');
  try {
    const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!response.ok) throw new Error('Session request failed');
    const data = await response.json();
    state.backendSessionId = data.session.id;
    badge.innerHTML = '<i></i> BACKEND ONLINE'; badge.classList.add('online');
  } catch (error) {
    badge.innerHTML = '<i></i> FRONTEND-ONLY MODE'; badge.classList.add('offline');
  }
}

function recordEvent(event, details = {}) {
  if (!state.backendSessionId) return;
  fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.backendSessionId, event, details }) }).catch(() => {});
}

/* Small browser-native synthesizer: no sound assets or network requests needed. */
function playSound(type = 'click') {
  if (!state.audioEnabled || !window.AudioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audio = playSound.audio || (playSound.audio = new AudioContextClass());
  const notes = { click: [260, .05], stone: [220, .14, 440], power: [95, .22, 190], snap: [120, .35, 60] };
  const [first, length, second] = notes[type] || notes.click;
  const now = audio.currentTime;
  [first, second].filter(Boolean).forEach((frequency, index) => {
    const oscillator = audio.createOscillator(); const gain = audio.createGain();
    oscillator.type = type === 'snap' ? 'sawtooth' : 'sine'; oscillator.frequency.setValueAtTime(frequency, now + index * .07);
    gain.gain.setValueAtTime(.0001, now + index * .07); gain.gain.exponentialRampToValueAtTime(.08, now + index * .07 + .015); gain.gain.exponentialRampToValueAtTime(.0001, now + index * .07 + length);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(now + index * .07); oscillator.stop(now + index * .07 + length + .03);
  });
}

function toggleSound() {
  state.audioEnabled = !state.audioEnabled;
  $('soundButton').textContent = state.audioEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF';
  $('soundButton').setAttribute('aria-pressed', String(state.audioEnabled));
  playSound('click');
  recordEvent('sound_toggled', { enabled: state.audioEnabled });
  showToast(state.audioEnabled ? 'COSMIC AUDIO ONLINE' : 'COSMIC AUDIO MUTED');
}

function togglePresentationMode() {
  const active = document.body.classList.toggle('presentation-mode');
  $('presentationButton').textContent = active ? '▣ EXIT PRESENTATION' : '▣ PRESENTATION MODE';
  recordEvent('presentation_mode', { enabled: active });
  showToast(active ? 'PRESENTATION MODE — SCANNER MAXIMIZED' : 'STANDARD INTERFACE RESTORED');
}

function updateCounter() {
  $('stoneCount').textContent = state.collected.size;
  if (state.collected.size === 6) { $('allStonesPanel').hidden = false; showToast('◆ ALL SIX STONES ONLINE — GAUNTLET UNLOCKED', 'success'); }
}

function collectStone(key, source = 'scanner') {
  if (state.collected.has(key)) return;
  state.collected.add(key);
  const card = document.querySelector(`[data-stone="${key}"]`);
  card.classList.add('collected'); card.querySelector('small').textContent = 'ACQUIRED';
  document.querySelector(`[data-demo="${key}"]`).disabled = true;
  updateCounter();
  recordEvent('stone_collected', { stone: key, source });
  playSound('stone');
  showToast(`${stones[key].colour} DETECTED — ${stones[key].label} ACQUIRED`, 'success');
  activateEffect(key);
}

function activateEffect(key) {
  clearTemporaryEffects();
  const effects = { time: activateTimeStone, mind: activateMindStone, reality: activateRealityStone, power: activatePowerStone, space: activateSpaceStone, soul: activateSoulStone };
  effects[key]();
}

function effectShell(title, lead, content) {
  $('effectZone').innerHTML = `<p class="section-label">${title.split('—')[0].trim()} DIMENSION ACTIVE</p><h2 class="effect-title">${title}</h2><p class="effect-lead">${lead}</p>${content}`;
}

const cityCards = [['🇮🇳 INDIA','Asia/Kolkata'],['🇺🇸 NEW YORK','America/New_York'],['🇯🇵 TOKYO','Asia/Tokyo'],['🇬🇧 LONDON','Europe/London'],['🌕 MOON','Probably nighttime'],['🦖 JURASSIC ERA','65 million years ago'],['🎓 DEADLINE','TOO CLOSE']];
function getTimeText(zone) { return zone.includes('/') ? new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date()) : zone; }
function addTimePopup() { const [name, zone] = cityCards[Math.floor(Math.random() * cityCards.length)]; const popup = document.createElement('div'); popup.className = 'time-popup'; popup.style.left = `${4 + Math.random() * 82}%`; popup.style.top = `${7 + Math.random() * 75}%`; popup.innerHTML = `<span>${name}</span><b>${getTimeText(zone)}</b>`; $('timeLayer').append(popup); setTimeout(() => popup.remove(), 5300); }
function activateTimeStone() {
  effectShell('🟢 TIME STONE', '⏳ Opening time dimension. Please do not touch the paradox.', `<div class="time-cards">${cityCards.map(([name, zone], i) => `<div class="time-card"><span>${name}</span><b data-time="${zone}">${i < 3 ? '--:--:--' : zone}</b></div>`).join('')}</div><div class="effect-actions"><button id="backTime">⏪ GO BACK 5 SECONDS</button><button id="skipDeadline">⏩ SKIP TO NEXT DEADLINE</button></div>`);
  const updateTimes = () => document.querySelectorAll('[data-time]').forEach(el => el.textContent = getTimeText(el.dataset.time));
  updateTimes(); state.timeClock = setInterval(updateTimes, 1000);
  for (let i = 0; i < 7; i++) setTimeout(addTimePopup, i * 170);
  state.timePopups = setInterval(addTimePopup, 850);
  $('backTime').onclick = () => showToast('TIME REWOUND. Sadly, your problems remain.', 'success');
  $('skipDeadline').onclick = () => showToast("🚨 ERROR: YOU DON'T WANT TO SEE THAT.", 'error');
}

const thoughts = ['Why am I here?', 'Who coded me?', 'Why did you open this website?', 'What were we doing again?', 'Is a computer technically conscious?', 'What should we eat?', 'Is WiFi invisible spaghetti?', 'Why is this happening?', 'Do I have free will?'];
function addThought() { const thought = document.createElement('div'); thought.className = 'thought'; thought.style.left = `${5 + Math.random() * 78}%`; thought.style.top = `${10 + Math.random() * 68}%`; thought.innerHTML = `${thoughts[Math.floor(Math.random() * thoughts.length)]}<button aria-label="Remove thought">×</button>`; thought.querySelector('button').onclick = () => thought.remove(); $('thoughtLayer').append(thought); }
function mindControlMove() { const targets = [...document.querySelectorAll('.stone-card, .effect-zone, .hero, .scanner-panel')]; const target = targets[Math.floor(Math.random() * targets.length)]; const rect = target.getBoundingClientRect(); const cursor = $('mindCursor'); cursor.style.left = `${rect.left + rect.width * (.25 + Math.random() * .5)}px`; cursor.style.top = `${rect.top + rect.height * (.25 + Math.random() * .5)}px`; target.classList.remove('possessed'); void target.offsetWidth; target.classList.add('possessed'); setTimeout(() => target.classList.remove('possessed'), 500); }
function activateMindStone() { effectShell('🟡 MIND STONE', 'The system is being remotely controlled by somebody with too much free will.', `<p class="thought-counter"><span id="thoughtCount">0</span> UNRESOLVED THOUGHTS · <b>REMOTE OPERATOR DETECTED</b></p><div class="effect-actions"><button id="moreThoughts">+ ADD A THOUGHT</button><button id="clearThoughts">CLEAR MY THOUGHTS</button></div>`); for (let i = 0; i < 5; i++) setTimeout(addThought, i * 180); $('mindCursor').classList.add('visible'); mindControlMove(); state.mindControl = setInterval(mindControlMove, 760); $('moreThoughts').onclick = () => { addThought(); updateThoughtCount(); playSound('click'); }; $('clearThoughts').onclick = () => { $('thoughtLayer').innerHTML = ''; updateThoughtCount(); showToast('Thoughts cleared. Operator disappointed.'); }; const observer = new MutationObserver(updateThoughtCount); observer.observe($('thoughtLayer'), { childList: true }); updateThoughtCount(); }
function updateThoughtCount() { const count = $('thoughtLayer').children.length; if ($('thoughtCount')) $('thoughtCount').textContent = count; }

function activateRealityStone() { effectShell('🔴 REALITY STONE', 'REALITY.EXE HAS STOPPED WORKING. You are travelling to an aggressively parallel universe.', `<div class="reality-message" id="realityMessage">PARALLEL UNIVERSE TRANSIT: initializing</div><div class="effect-actions"><button id="newReality">🎲 GENERATE NEW REALITY</button><button id="restoreReality">↻ RESTORE REALITY</button></div>`); $('newReality').onclick = generateReality; $('restoreReality').onclick = () => { clearTemporaryEffects(); showToast('Reality restored. Nobody noticed.'); }; generateReality(true); }
function generateReality(forceParallel = false) { const modes = [['parallel','PARALLEL UNIVERSE #404 — colours have different opinions here.'],['cartoon','CARTOON REALITY — everything has a suspicious outline.'],['glitch','GLITCH REALITY — have you tried turning existence off and on?'],['upside','UPSIDE-DOWN REALITY — gravity is now merely a suggestion.'],['weird','WEIRD REALITY — normal is an unverified rumour.']]; clearTemporaryEffects(); const [mode, message] = forceParallel ? modes[0] : modes[Math.floor(Math.random() * modes.length)]; document.body.classList.add(`reality-${mode}`); if ($('realityMessage')) $('realityMessage').textContent = `CURRENT REALITY: ${message}`; playSound('click'); }

function activatePowerStone() { effectShell('🟣 POWER STONE', '⚡ Overclocking reality. The entire interface has become unnecessarily powerful.', `<div class="power-display"><b id="powerNumber">0%</b><span>POWER LEVEL</span></div><div class="stats"><span>⚡ RAM: 200000%</span><span>⚡ CPU: YES</span><span>⚡ POWER: TOO MUCH</span><span>⚡ FAN: SCREAMING</span></div>`); document.body.classList.add('power-on'); playSound('power'); const values = ['10%','50%','500%','1000%','999999999999999%']; values.forEach((value, index) => setTimeout(() => { if ($('powerNumber')) $('powerNumber').textContent = value; }, index * 470)); setTimeout(() => document.body.classList.remove('power-on'), 4300); }

function scatterSpace() { document.querySelectorAll('.scatterable').forEach((item, index) => { item.style.setProperty('--scatter-x', `${Math.round((Math.random() - .5) * (index % 2 ? 120 : 70))}px`); item.style.setProperty('--scatter-y', `${Math.round((Math.random() - .5) * 70)}px`); item.style.setProperty('--scatter-r', `${Math.round((Math.random() - .5) * 14)}deg`); item.classList.add('scattered'); }); }
function activateSpaceStone() { document.body.classList.add('space-on'); scatterSpace(); effectShell('🔵 SPACE STONE', '🌌 SPACE DIMENSION OPENED. The screen has been scattered across several nearby dimensions.', `<div class="space-message">🌀 TELEPORTATION COMPLETE<br />📍 YOU HAVE BEEN TELEPORTED TO: <b>ANOTHER DIMENSION</b></div><div class="effect-actions"><button id="shuffleSpace">🔀 SHUFFLE AGAIN</button><button id="restoreSpace">↻ RESTORE SPACE</button></div>`); $('shuffleSpace').onclick = scatterSpace; $('restoreSpace').onclick = () => { clearTemporaryEffects(); showToast('Space restored. Nothing important actually changed.'); }; }

const soulData = { names:['Chairles','Aquaman Jr.','Professor Toaster','WiFi Whisperer','Blobert','Susan.exe'], species:['Water Bottle','Lamp','Slightly haunted stapler','Cloud backup','Office Chair','Lost USB'], dreams:['To become a table.','To load on the first try.','To visit the recycling bin.','To be someone’s favourite tab.'], moods:['Confused','Emotionally buffering','Surprisingly optimistic','Empty','Mildly cosmic'], fears:['Recycling','Low battery mode','The printer','Monday morning','A software update'] };
function generateSoul() { const pick = key => soulData[key][Math.floor(Math.random() * soulData[key].length)]; $('soulProfile').innerHTML = `<p>👻 SOUL PROFILE // DEFINITELY SCIENTIFIC</p><p><b>Name:</b> ${pick('names')}</p><p><b>Species:</b> ${pick('species')}</p><p><b>Age:</b> ${Math.floor(Math.random() * 900) + 2} years</p><p><b>Dream:</b> ${pick('dreams')}</p><p><b>Emotional status:</b> ${pick('moods')}</p><p><b>Greatest fear:</b> ${pick('fears')}</p><button id="anotherSoul">DETECT ANOTHER SOUL</button>`; $('anotherSoul').onclick = generateSoul; }
const soulPopups = ['👻 Chairles is judging your posture.', '🪑 A chair is applying for consciousness.', '📎 A paperclip remembers everything.', '🫙 Water Bottle says: stay hydrated.', '🧦 Your missing sock has moved on.', '📡 WiFi is feeling emotionally distant.', '🖨️ The printer has seen your search history.'];
function addSoulPopup() { const popup = document.createElement('div'); popup.className = 'soul-popup'; popup.style.left = `${3 + Math.random() * 80}%`; popup.style.top = `${8 + Math.random() * 75}%`; popup.textContent = soulPopups[Math.floor(Math.random() * soulPopups.length)]; $('soulLayer').append(popup); setTimeout(() => popup.remove(), 4800); }
function activateSoulStone() { effectShell('🟠 SOUL STONE', '👻 Soul detected. Random household objects are now sharing their feelings all over the screen.', `<div id="soulProfile" class="profile"></div><p class="soul-question">“Where do deleted files go?”</p>`); generateSoul(); for (let i = 0; i < 6; i++) setTimeout(addSoulPopup, i * 170); state.soulPopups = setInterval(addSoulPopup, 900); }

function clearTemporaryEffects() { clearInterval(state.timeClock); clearInterval(state.timePopups); clearInterval(state.soulPopups); clearInterval(state.mindControl); state.timeClock = null; state.timePopups = null; state.soulPopups = null; state.mindControl = null; $('thoughtLayer').innerHTML = ''; $('timeLayer').innerHTML = ''; $('soulLayer').innerHTML = ''; $('mindCursor').classList.remove('visible'); document.querySelectorAll('.scatterable').forEach(item => { item.classList.remove('scattered'); item.style.removeProperty('--scatter-x'); item.style.removeProperty('--scatter-y'); item.style.removeProperty('--scatter-r'); }); document.body.classList.remove('reality-parallel','reality-cartoon','reality-glitch','reality-upside','reality-weird','power-on','space-on'); }

function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min; let h = 0; if (d) { if (max === r) h = 60 * (((g-b)/d) % 6); else if (max === g) h = 60 * ((b-r)/d + 2); else h = 60 * ((r-g)/d + 4); } return [h < 0 ? h + 360 : h, max ? d/max : 0, max]; }
function scanFrame() { if (!state.cameraStream || webcam.readyState < 2) return; ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; const coverage = {}; colourRanges.forEach(range => coverage[range.key] = 0); let samples = 0; for (let i = 0; i < data.length; i += 16) { const [h, s, v] = rgbToHsv(data[i], data[i+1], data[i+2]); if (s < .38 || v < .2) continue; const range = colourRanges.find(item => item.test(h)); if (range) coverage[range.key]++; samples++; } const [key, amount] = Object.entries(coverage).sort((a,b) => b[1]-a[1])[0]; const confidence = samples ? Math.round(amount / samples * 100) : 0; $('confidenceBar').style.width = `${confidence}%`; $('confidenceText').textContent = `${confidence}% SIGNAL`; const swatch = $('colourSwatch'); swatch.style.background = confidence ? stones[key].hex : 'transparent'; swatch.style.boxShadow = confidence ? `0 0 13px ${stones[key].hex}` : 'none'; swatch.title = confidence ? `${stones[key].colour}: ${confidence}% signal` : 'Live colour preview'; if (confidence >= 18 && !state.collected.has(key)) { $('detectionText').textContent = `${stones[key].colour} DETECTED — HOLD STEADY`; if (state.candidate === key) state.candidateFrames++; else { state.candidate = key; state.candidateFrames = 1; } if (state.candidateFrames >= 8) { collectStone(key); state.candidate = null; state.candidateFrames = 0; } } else { state.candidate = null; state.candidateFrames = 0; $('detectionText').textContent = state.collected.size === 6 ? 'ALL STONES ACQUIRED — SNAP READY' : 'SCANNING FOR COLOURS...'; } }

function cameraErrorMessage(error) {
  const messages = {
    NotAllowedError: 'Camera permission is blocked. In Codex preview, open localhost:8000 in Chrome or Edge; then click the camera icon and choose Allow.',
    NotFoundError: 'No camera was found. Connect a webcam, then try again.',
    NotReadableError: 'Your camera is busy in another app. Close that app, then try again.',
    SecurityError: 'Camera access needs localhost or HTTPS. Open this project at localhost:8000.',
    OverconstrainedError: 'Your camera rejected the preferred settings. Retrying with basic settings…'
  };
  return messages[error?.name] || 'Camera could not start. Check the browser permission and try again.';
}

async function requestCameraStream() {
  // First request a presentation-friendly front camera. If a device rejects that,
  // retry with the browser’s simplest supported video setting.
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
  } catch (preferredError) {
    if (['NotAllowedError', 'SecurityError'].includes(preferredError.name)) throw preferredError;
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
}

async function startCamera() {
  const btn = $('startCameraButton');
  if (!navigator.mediaDevices?.getUserMedia) {
    $('detectionText').textContent = 'BROWSER DOES NOT SUPPORT CAMERA ACCESS';
    showToast('Use a current Chrome, Edge, or Firefox browser for webcam access.', 'error');
    return;
  }
  btn.disabled = true; btn.textContent = '◌ REQUESTING CAMERA...';
  try {
    state.cameraStream = await requestCameraStream();
    webcam.srcObject = state.cameraStream;
    await webcam.play();
    $('cameraEmpty').hidden = true;
    document.querySelector('.camera-shell').classList.add('live');
    $('cameraLabel').textContent = 'LIVE · ANALYSING'; $('cameraDot').classList.add('active');
    btn.textContent = '● CAMERA ACTIVE'; $('detectionText').textContent = 'SCANNING FOR COLOURS...';
    clearInterval(state.scanTimer); state.scanTimer = setInterval(scanFrame, 120);
    recordEvent('camera_started');
  } catch (error) {
    btn.disabled = false; btn.textContent = '◉ TRY CAMERA AGAIN';
    $('cameraLabel').textContent = 'CAMERA ERROR'; $('detectionText').textContent = 'CAMERA NEEDS ATTENTION';
    recordEvent('camera_error', { type: error?.name || 'unknown' });
    showToast(cameraErrorMessage(error), 'error');
  }
}

function finalSnap() { if (state.collected.size < 6 || state.snapped) return; state.snapped = true; clearTemporaryEffects(); $('systemStatus').innerHTML = '<i></i> COSMIC BALANCE'; document.body.classList.add('snapped'); $('dustLayer').innerHTML = Array.from({ length: 48 }, (_, i) => `<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${i*20}ms"></i>`).join(''); const cinematic = $('snapCinematic'); cinematic.hidden = false; cinematic.className = 'snap-cinematic active'; $('completionCard').hidden = true; playSound('snap'); recordEvent('universe_snapped', { destruction: 100 }); showToast('THE SNAP HAS BEGUN…', 'success'); setTimeout(() => cinematic.classList.add('void'), 1450); setTimeout(() => { cinematic.classList.remove('void'); cinematic.classList.add('complete'); $('completionCard').hidden = false; }, 2350); }
function restoreUniverse() { document.body.classList.remove('snapped'); $('dustLayer').innerHTML = ''; state.snapped = false; $('snapCinematic').hidden = true; $('snapCinematic').className = 'snap-cinematic'; $('completionCard').hidden = true; $('systemStatus').innerHTML = '<i></i> SYSTEM STABLE'; recordEvent('universe_restored'); showToast('Universe restored. A little less dramatic now.', 'success'); }
function resetUniverse() { clearTemporaryEffects(); restoreUniverse(); $('thoughtLayer').innerHTML = ''; state.collected.clear(); state.candidate = null; state.candidateFrames = 0; document.querySelectorAll('.stone-card').forEach(card => { card.classList.remove('collected'); card.querySelector('small').textContent = 'LOCKED'; }); document.querySelectorAll('[data-demo]').forEach(btn => btn.disabled = false); $('stoneCount').textContent = '0'; $('allStonesPanel').hidden = true; $('effectZone').innerHTML = `<div class="effect-idle"><span>✦</span><div><p class="section-label">DIMENSIONAL OUTPUT</p><h2>AWAITING FIRST STONE</h2><p>Acquiring a stone opens its dedicated chaos module here.</p></div></div>`; recordEvent('universe_reset'); showToast('UNIVERSE RESET — all six stones are locked again.'); }

$('startCameraButton').addEventListener('click', startCamera); $('resetButton').addEventListener('click', resetUniverse); $('snapButton').addEventListener('click', finalSnap); $('soundButton').addEventListener('click', toggleSound); $('presentationButton').addEventListener('click', togglePresentationMode); $('restoreUniverse').addEventListener('click', restoreUniverse); document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => collectStone(button.dataset.demo, 'demo'))); window.addEventListener('load', () => { initializeBackend(); setTimeout(() => $('bootLoader').classList.add('finished'), 650); });
