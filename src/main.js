import * as THREE from 'three';

// -------------------------------------------------------------
// 1. Celestial Palettes
// -------------------------------------------------------------
const PALETTES = [
  { id: 'solar', name: 'Solar Amber', primary: '#f59e0b', secondary: '#ef4444', plasma: '#fef08a', hexPrimary: 0xf59e0b, hexSecondary: 0xef4444, hexPlasma: 0xfef08a },
  { id: 'azure', name: 'Supernova Cyan', primary: '#06b6d4', secondary: '#2563eb', plasma: '#a5f3fc', hexPrimary: 0x06b6d4, hexSecondary: 0x2563eb, hexPlasma: 0xa5f3fc },
  { id: 'amethyst', name: 'Amethyst Pulsar', primary: '#a855f7', secondary: '#ec4899', plasma: '#f5d0fe', hexPrimary: 0xa855f7, hexSecondary: 0xec4899, hexPlasma: 0xf5d0fe },
  { id: 'emerald', name: 'Emerald Quasar', primary: '#10b981', secondary: '#0d9488', plasma: '#a7f3d0', hexPrimary: 0x10b981, hexSecondary: 0x0d9488, hexPlasma: 0xa7f3d0 },
  { id: 'crimson', name: 'Crimson Eclipse', primary: '#f43f5e', secondary: '#881337', plasma: '#fecdd3', hexPrimary: 0xf43f5e, hexSecondary: 0x881337, hexPlasma: 0xfecdd3 },
  { id: 'sakura', name: 'Sakura Nebula', primary: '#f472b6', secondary: '#9333ea', plasma: '#fce7f3', hexPrimary: 0xf472b6, hexSecondary: 0x9333ea, hexPlasma: 0xfce7f3 }
];

const urlParams = new URLSearchParams(window.location.search);
let currentPaletteIndex = urlParams.has('theme')
  ? parseInt(urlParams.get('theme')) % PALETTES.length
  : Math.floor(Math.random() * PALETTES.length);
let myPalette = PALETTES[currentPaletteIndex];

const windowId = 'celestial_' + Math.random().toString(36).substring(2, 8);
let peers = new Map();

// -------------------------------------------------------------
// 2. Procedural Glow Textures
// -------------------------------------------------------------
function createGlowTexture(colorStr) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, colorStr);
  gradient.addColorStop(0.25, colorStr);
  gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  return texture;
}

const particleTexture = createGlowTexture('#ffffff');
let coreGlowTexture = createGlowTexture(myPalette.primary);

// -------------------------------------------------------------
// 3. Three.js Scene & Orthographic Screen-Space Setup
// -------------------------------------------------------------
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;

const camera = new THREE.OrthographicCamera(
  -width / 2, width / 2,
  height / 2, -height / 2,
  0.1, 2000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// -------------------------------------------------------------
// 4. Background Starfield
// -------------------------------------------------------------
const bgCount = 400;
const bgGeo = new THREE.BufferGeometry();
const bgPos = new Float32Array(bgCount * 3);

for (let i = 0; i < bgCount; i++) {
  bgPos[i * 3] = (Math.random() - 0.5) * 3000;
  bgPos[i * 3 + 1] = (Math.random() - 0.5) * 2400;
  bgPos[i * 3 + 2] = -200 + (Math.random() - 0.5) * 150;
}
bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
const bgMat = new THREE.PointsMaterial({
  color: 0x94a3b8,
  size: 2.2,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending
});
const bgStars = new THREE.Points(bgGeo, bgMat);
scene.add(bgStars);

// -------------------------------------------------------------
// 5. Central Celestial Star (Scaled UP 2.5x - 3x!)
// -------------------------------------------------------------
const celestialGroup = new THREE.Group();
scene.add(celestialGroup);

// Luminous Core Sprite
const spriteMaterial = new THREE.SpriteMaterial({
  map: coreGlowTexture,
  color: myPalette.hexPrimary,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.9
});
const coreSprite = new THREE.Sprite(spriteMaterial);
coreSprite.scale.set(360, 360, 1); // Large prominent glowing aura!
celestialGroup.add(coreSprite);

// Dense Particle Core (500 particles)
const coreCount = 500;
const coreGeometry = new THREE.BufferGeometry();
const corePositions = new Float32Array(coreCount * 3);
const coreOriginalSphere = [];
const coreCatTarget = [];

// Precompute Cat Shape Points for Morphing
for (let i = 0; i < coreCount; i++) {
  // Spherical orbit baseline
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  const r = 40 + Math.random() * 35; // Larger core radius
  const sx = r * Math.sin(phi) * Math.cos(theta);
  const sy = r * Math.sin(phi) * Math.sin(theta);
  const sz = r * Math.cos(phi);

  corePositions[i * 3] = sx;
  corePositions[i * 3 + 1] = sy;
  corePositions[i * 3 + 2] = sz;
  coreOriginalSphere.push(new THREE.Vector3(sx, sy, sz));

  // --- Cat Constellation Target Coordinates ---
  let cx = 0, cy = 0, cz = (Math.random() - 0.5) * 15;
  const pType = i % 10;

  if (pType < 4) {
    // Head & cute round cheeks
    const headAngle = Math.random() * Math.PI * 2;
    const headRadius = 75 + Math.random() * 20;
    cx = Math.cos(headAngle) * headRadius;
    cy = Math.sin(headAngle) * (headRadius * 0.85); // cute squishy face
  } else if (pType === 4 || pType === 5) {
    // Left Pointy Cat Ear
    const u = Math.random();
    const v = Math.random();
    const bx = -65 + u * 40;
    const by = 55 + u * 20;
    cx = THREE.MathUtils.lerp(bx, -55, v);
    cy = THREE.MathUtils.lerp(by, 145, v);
  } else if (pType === 6 || pType === 7) {
    // Right Pointy Cat Ear
    const u = Math.random();
    const v = Math.random();
    const bx = 25 + u * 40;
    const by = 75 - u * 20;
    cx = THREE.MathUtils.lerp(bx, 55, v);
    cy = THREE.MathUtils.lerp(by, 145, v);
  } else if (pType === 8) {
    // Whiskers (Left & Right)
    const side = Math.random() > 0.5 ? 1 : -1;
    const wIndex = Math.floor(Math.random() * 3);
    const wLen = 30 + Math.random() * 65;
    const wYOffset = (wIndex - 1) * 14;
    cx = side * (45 + wLen);
    cy = -5 + wYOffset + (Math.random() - 0.5) * 6;
  } else {
    // Eyes & Nose
    const eyeSide = Math.random() > 0.5 ? 1 : -1;
    if (Math.random() > 0.3) {
      cx = eyeSide * (32 + (Math.random() - 0.5) * 10);
      cy = 20 + (Math.random() - 0.5) * 8;
    } else {
      // Little triangle nose
      cx = (Math.random() - 0.5) * 12;
      cy = -8 + (Math.random() - 0.5) * 8;
    }
  }

  coreCatTarget.push(new THREE.Vector3(cx, cy, cz));
}

coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));

const coreMaterial = new THREE.PointsMaterial({
  color: myPalette.hexPlasma,
  size: 5.5,
  map: particleTexture,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.95,
  depthWrite: false
});
const coreParticles = new THREE.Points(coreGeometry, coreMaterial);
celestialGroup.add(coreParticles);

// Accretion Disk Rings (650 particles)
const diskCount = 650;
const diskGeometry = new THREE.BufferGeometry();
const diskPositions = new Float32Array(diskCount * 3);

for (let i = 0; i < diskCount; i++) {
  const r = 90 + Math.random() * 110;
  const angle = Math.random() * Math.PI * 2;
  diskPositions[i * 3] = Math.cos(angle) * r;
  diskPositions[i * 3 + 1] = Math.sin(angle) * r * 0.32;
  diskPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}

diskGeometry.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));

const diskMaterial = new THREE.PointsMaterial({
  color: myPalette.hexSecondary,
  size: 4,
  map: particleTexture,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.85,
  depthWrite: false
});
const diskParticles = new THREE.Points(diskGeometry, diskMaterial);
diskParticles.rotation.z = Math.PI / 6;
celestialGroup.add(diskParticles);

// -------------------------------------------------------------
// 6. Entangled Bridge Stream & Continuous Field Lines
// -------------------------------------------------------------
const streamCount = 700;
const streamGeometry = new THREE.BufferGeometry();
const streamPositions = new Float32Array(streamCount * 3);
const streamColors = new Float32Array(streamCount * 3);
const streamProgress = new Float32Array(streamCount);
const streamSpeed = new Float32Array(streamCount);
const streamLateralOffset = new Float32Array(streamCount);

for (let i = 0; i < streamCount; i++) {
  streamProgress[i] = Math.random();
  streamSpeed[i] = 0.003 + Math.random() * 0.007;
  streamLateralOffset[i] = (Math.random() - 0.5) * 45;
}

streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
streamGeometry.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));

const streamMaterial = new THREE.PointsMaterial({
  size: 5.5,
  map: particleTexture,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.95,
  depthWrite: false
});
const streamParticles = new THREE.Points(streamGeometry, streamMaterial);
scene.add(streamParticles);

// 5 Continuous Gravitational Field Lines
const lineCount = 5;
const fieldLines = [];
const lineMaterials = [];

for (let i = 0; i < lineCount; i++) {
  const lineMat = new THREE.LineBasicMaterial({
    color: myPalette.hexPrimary,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });
  const lineGeo = new THREE.BufferGeometry();
  const line = new THREE.Line(lineGeo, lineMat);
  scene.add(line);
  fieldLines.push(line);
  lineMaterials.push(lineMat);
}

// Shockwave Ring
const shockwaveRingGeo = new THREE.RingGeometry(1, 4, 64);
const shockwaveRingMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending
});
const shockwaveRing = new THREE.Mesh(shockwaveRingGeo, shockwaveRingMat);
scene.add(shockwaveRing);
let shockwaveScale = 1;

// -------------------------------------------------------------
// 7. Exact Physical Screen-Space Coordinate Engine
// -------------------------------------------------------------
function getExactCanvasCenter() {
  // Compensate accurately for Windows/browser titlebars, URL bars and borders!
  const borderX = Math.max(0, (window.outerWidth - window.innerWidth) / 2);
  const chromeTop = Math.max(0, window.outerHeight - window.innerHeight - borderX);

  const sx = (window.screenX ?? window.screenLeft ?? 0) + borderX;
  const sy = (window.screenY ?? window.screenTop ?? 0) + chromeTop;

  const cx = sx + window.innerWidth / 2;
  const cy = sy + window.innerHeight / 2;

  return { cx, cy, sx, sy };
}

// Broadcast Channel
const channel = new BroadcastChannel('celestial_collision_network');

function broadcastState() {
  const coords = getExactCanvasCenter();
  const state = {
    type: 'sync',
    id: windowId,
    centerX: coords.cx,
    centerY: coords.cy,
    palette: myPalette,
    timestamp: performance.now()
  };

  channel.postMessage(state);
  try {
    localStorage.setItem(`celestial_peer_${windowId}`, JSON.stringify(state));
  } catch (e) {}
}

channel.onmessage = (event) => {
  const data = event.data;
  if (!data || data.id === windowId) return;

  if (data.type === 'sync') {
    peers.set(data.id, {
      ...data,
      lastReceived: performance.now()
    });
  } else if (data.type === 'disconnect') {
    peers.delete(data.id);
  }
};

window.addEventListener('beforeunload', () => {
  channel.postMessage({ type: 'disconnect', id: windowId });
  try {
    localStorage.removeItem(`celestial_peer_${windowId}`);
  } catch (e) {}
});

function prunePeers() {
  const now = performance.now();
  for (const [id, peer] of peers.entries()) {
    if (now - peer.lastReceived > 1600) {
      peers.delete(id);
    }
  }
}

// -------------------------------------------------------------
// 8. Dynamic Audio Engine (Web Audio API Synthesizer)
// -------------------------------------------------------------
let audioCtx = null;
let droneOsc = null;
let droneGain = null;
let filterNode = null;
let isAudioActive = false;

function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  droneOsc = audioCtx.createOscillator();
  droneGain = audioCtx.createGain();
  filterNode = audioCtx.createBiquadFilter();

  droneOsc.type = 'triangle';
  droneOsc.frequency.setValueAtTime(70, audioCtx.currentTime);

  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(250, audioCtx.currentTime);

  droneGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

  droneOsc.connect(filterNode);
  filterNode.connect(droneGain);
  droneGain.connect(audioCtx.destination);

  droneOsc.start();
  isAudioActive = true;
}

function updateAudio(distance) {
  if (!audioCtx || !isAudioActive) return;
  const normDist = Math.max(0, Math.min(1, distance / 1200));
  const targetFreq = 220 + (1 - normDist) * 900;
  filterNode.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
}

function playCatMeowChime() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Cute playful meow glissando
  osc.type = 'sine';
  osc.frequency.setValueAtTime(659.25, now); // E5
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
  osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.4);
}

// -------------------------------------------------------------
// 9. Interactive Palette Switching & Cat Mode Logic
// -------------------------------------------------------------
let isCatMode = false;
let collisionEnergy = 0; // 0% to 100%

function applyPalette(palette) {
  myPalette = palette;
  coreGlowTexture = createGlowTexture(myPalette.primary);

  spriteMaterial.map = coreGlowTexture;
  spriteMaterial.color.setHex(myPalette.hexPrimary);
  coreMaterial.color.setHex(myPalette.hexPlasma);
  diskMaterial.color.setHex(myPalette.hexSecondary);

  lineMaterials.forEach(mat => mat.color.setHex(myPalette.hexPrimary));

  document.querySelectorAll('.palette-swatch').forEach(el => {
    el.classList.toggle('active', el.dataset.id === palette.id);
  });
}

function triggerCatConstellation(manual = false) {
  isCatMode = !isCatMode;
  const catToast = document.getElementById('cat-toast');
  const catBtn = document.getElementById('cat-btn');

  if (isCatMode) {
    statusDot.classList.add('cat-mode');
    catToast.classList.add('active');
    catBtn.textContent = '🌟 Star Shape';
    playCatMeowChime();
    setTimeout(() => catToast.classList.remove('active'), 3200);
  } else {
    statusDot.classList.remove('cat-mode');
    catBtn.textContent = '🐱 Cat Shape';
  }
}

// Populate Palette Swatches
const pickerContainer = document.getElementById('palette-picker');
PALETTES.forEach((p, idx) => {
  const swatch = document.createElement('div');
  swatch.className = `palette-swatch ${p.id === myPalette.id ? 'active' : ''}`;
  swatch.dataset.id = p.id;
  swatch.style.backgroundColor = p.primary;
  swatch.title = p.name;
  swatch.addEventListener('click', () => applyPalette(p));
  pickerContainer.appendChild(swatch);
});

// Controls & Buttons
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const metricsOverlay = document.getElementById('metrics-overlay');
const tensionVal = document.getElementById('tension-val');
const distVal = document.getElementById('dist-val');
const collisionBar = document.getElementById('collision-bar');
const spawnBtn = document.getElementById('spawn-btn');
const soundBtn = document.getElementById('sound-btn');
const catBtn = document.getElementById('cat-btn');

catBtn.addEventListener('click', () => triggerCatConstellation(true));

spawnBtn.addEventListener('click', () => {
  const coords = getExactCanvasCenter();
  const nextThemeIdx = (currentPaletteIndex + 1) % PALETTES.length;
  const newLeft = coords.sx + window.innerWidth + 20;
  const newTop = coords.sy;

  window.open(
    `${window.location.origin}${window.location.pathname}?theme=${nextThemeIdx}`,
    '_blank',
    `width=540,height=540,left=${newLeft},top=${newTop}`
  );
});

soundBtn.addEventListener('click', () => {
  if (!audioCtx) {
    initAudio();
    soundBtn.classList.add('btn-primary');
  } else {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      isAudioActive = true;
      soundBtn.classList.add('btn-primary');
    } else {
      audioCtx.suspend();
      isAudioActive = false;
      soundBtn.classList.remove('btn-primary');
    }
  }
});

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

// -------------------------------------------------------------
// 10. Main Loop with Continuous Multi-Window Math
// -------------------------------------------------------------
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  broadcastState();
  prunePeers();

  const myCoords = getExactCanvasCenter();
  const activePeers = Array.from(peers.values());

  // 1. Celestial Core Dynamics & Cat Morphing
  const corePosAttr = coreGeometry.attributes.position;
  const coreArr = corePosAttr.array;

  for (let i = 0; i < coreCount; i++) {
    const target = isCatMode ? coreCatTarget[i] : coreOriginalSphere[i];
    
    // Smooth lerp morphing
    coreArr[i * 3] += (target.x - coreArr[i * 3]) * 0.08;
    coreArr[i * 3 + 1] += (target.y - coreArr[i * 3 + 1]) * 0.08;
    coreArr[i * 3 + 2] += (target.z - coreArr[i * 3 + 2]) * 0.08;
  }
  corePosAttr.needsUpdate = true;

  if (!isCatMode) {
    celestialGroup.rotation.z = elapsedTime * 0.15;
    diskParticles.rotation.z = elapsedTime * 0.4;
  } else {
    // Gentle hovering breath in cat mode
    celestialGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.04;
    diskParticles.rotation.z = elapsedTime * 0.2;
  }

  // Aura pulse
  const pulse = 1 + Math.sin(elapsedTime * 2.8) * 0.06;
  coreSprite.scale.set(360 * pulse, 360 * pulse, 1);

  // Background stars
  bgStars.rotation.z = elapsedTime * 0.008;

  // 2. Multi-Window Entangled Physics
  if (activePeers.length > 0) {
    const peer = activePeers[0];

    // Vector in Global Screen Space
    const globalDeltaX = peer.centerX - myCoords.cx;
    const globalDeltaY = peer.centerY - myCoords.cy;
    const dist = Math.hypot(globalDeltaX, globalDeltaY);

    // Three.js local space (Y is flipped!)
    const localTargetX = globalDeltaX;
    const localTargetY = -globalDeltaY;

    // UI Updates
    statusDot.classList.add('connected');
    statusText.textContent = `${activePeers.length + 1} Celestial Cores Entangled`;
    metricsOverlay.classList.add('visible');
    distVal.textContent = Math.round(dist);
    tensionVal.textContent = (1400 / Math.max(100, dist)).toFixed(2);

    updateAudio(dist);

    // Collision Energy Accumulation
    if (dist < 260) {
      collisionEnergy = Math.min(100, collisionEnergy + 1.2);
      if (collisionEnergy >= 100 && !isCatMode) {
        triggerCatConstellation();
      }
    } else {
      collisionEnergy = Math.max(0, collisionEnergy - 0.4);
    }
    collisionBar.style.width = `${collisionEnergy}%`;

    // Continuous Deterministic Curve across Windows:
    // Determine an invariant order between the two stars
    const isPrimary = windowId < peer.id;
    const starA_global = isPrimary ? myCoords : peer;
    const starB_global = isPrimary ? peer : myCoords;

    const spanX = starB_global.centerX - starA_global.centerX;
    const spanY = starB_global.centerY - starA_global.centerY;
    const totalDist = Math.hypot(spanX, spanY) || 1;

    // Normal vector perpendicular to the connection line
    const normX = -spanY / totalDist;
    const normY = spanX / totalDist;

    // Color gradient
    const colA = new THREE.Color(myPalette.hexPrimary);
    const colB = new THREE.Color(peer.palette.hexPrimary);

    // 1. Entangled Particle Stream
    const streamPos = streamGeometry.attributes.position.array;
    const streamCol = streamGeometry.attributes.color.array;

    for (let i = 0; i < streamCount; i++) {
      streamProgress[i] += streamSpeed[i];
      if (streamProgress[i] > 1.0) streamProgress[i] = 0;

      const u = streamProgress[i];
      
      // Global position along the bridge
      const wave = Math.sin(u * Math.PI) * streamLateralOffset[i];
      const gX = starA_global.centerX + spanX * u + normX * wave;
      const gY = starA_global.centerY + spanY * u + normY * wave;

      // Map to this window's local Three.js coordinates
      const locX = gX - myCoords.cx;
      const locY = -(gY - myCoords.cy); // Flip screen Y to Three.js Y

      streamPos[i * 3] = locX;
      streamPos[i * 3 + 1] = locY;
      streamPos[i * 3 + 2] = Math.sin(u * Math.PI * 4 + elapsedTime * 4) * 12;

      // Color interpolation
      const pColor = colA.clone().lerp(colB, isPrimary ? u : 1 - u);
      streamCol[i * 3] = pColor.r;
      streamCol[i * 3 + 1] = pColor.g;
      streamCol[i * 3 + 2] = pColor.b;
    }

    streamGeometry.attributes.position.needsUpdate = true;
    streamGeometry.attributes.color.needsUpdate = true;
    streamParticles.visible = true;

    // 2. Gravitational Field Lines (Mathematically Continuous Across Window Borders!)
    for (let l = 0; l < lineCount; l++) {
      const line = fieldLines[l];
      const points = [];
      const steps = 36;
      const spread = (l - (lineCount - 1) / 2) * 22;

      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const wave = Math.sin(u * Math.PI) * spread + Math.sin(u * Math.PI * 3 + elapsedTime * 3.5 + l) * 12;

        const gX = starA_global.centerX + spanX * u + normX * wave;
        const gY = starA_global.centerY + spanY * u + normY * wave;

        // Convert global monitor pixel to local Three.js coordinate
        const locX = gX - myCoords.cx;
        const locY = -(gY - myCoords.cy);

        points.push(new THREE.Vector3(locX, locY, 0));
      }

      line.geometry.setFromPoints(points);
      line.visible = true;
    }

    // 3. Collision Shockwave
    if (dist < 220) {
      shockwaveRing.position.set(localTargetX / 2, localTargetY / 2, 10);
      shockwaveScale += 0.08;
      if (shockwaveScale > 7) shockwaveScale = 1;
      shockwaveRing.scale.set(shockwaveScale * 28, shockwaveScale * 28, 1);
      shockwaveRingMat.opacity = Math.max(0, 1 - shockwaveScale / 7);
      shockwaveRing.visible = true;
    } else {
      shockwaveRing.visible = false;
    }

  } else {
    // Solo Mode
    statusDot.classList.remove('connected');
    statusText.textContent = '1 Celestial Core (Solo Orbit)';
    metricsOverlay.classList.remove('visible');
    streamParticles.visible = false;
    shockwaveRing.visible = false;
    fieldLines.forEach(l => l.visible = false);
  }

  renderer.render(scene, camera);
}

animate();
