import * as THREE from 'three';

// -------------------------------------------------------------
// 1. Celestial Themes & Color Palettes
// -------------------------------------------------------------
const THEMES = [
  {
    name: 'Sol Invictus',
    coreColor: '#ffaa00',
    flareColor: '#ff3300',
    plasmaColor: '#ffe066',
    hexCore: 0xffaa00,
    hexFlare: 0xff3300,
    hexPlasma: 0xffe066
  },
  {
    name: 'Cygnus Supernova',
    coreColor: '#00d4ff',
    flareColor: '#0055ff',
    plasmaColor: '#a5f3fc',
    hexCore: 0x00d4ff,
    hexFlare: 0x0055ff,
    hexPlasma: 0xa5f3fc
  },
  {
    name: 'Amethyst Pulsar',
    coreColor: '#c084fc',
    flareColor: '#7c3aed',
    plasmaColor: '#f472b6',
    hexCore: 0xc084fc,
    hexFlare: 0x7c3aed,
    hexPlasma: 0xf472b6
  }
];

// Determine Theme based on URL or random choice
const urlParams = new URLSearchParams(window.location.search);
const themeIndex = urlParams.has('theme') 
  ? parseInt(urlParams.get('theme')) % THEMES.length 
  : Math.floor(Math.random() * THEMES.length);
const myTheme = THEMES[themeIndex];

// Unique Window Identifier
const windowId = 'celestial_' + Math.random().toString(36).substring(2, 8);
let peers = new Map();

// -------------------------------------------------------------
// 2. High-Performance Procedural Glow Textures (Zero File Assets)
// -------------------------------------------------------------
function createGlowTexture(colorStr, alphaCenter = 1.0) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, colorStr);
  gradient.addColorStop(0.2, colorStr);
  gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  return texture;
}

const particleTexture = createGlowTexture('#ffffff');
const coreGlowTexture = createGlowTexture(myTheme.coreColor);

// -------------------------------------------------------------
// 3. Three.js Scene, Orthographic Screen-Space Camera & Renderer
// -------------------------------------------------------------
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

let width = window.innerWidth;
let height = window.innerHeight;

// 1 unit = 1 pixel on the physical monitor!
const camera = new THREE.OrthographicCamera(
  -width / 2, width / 2,
  height / 2, -height / 2,
  0.1, 1000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// -------------------------------------------------------------
// 4. Background Cosmic Starfield
// -------------------------------------------------------------
const bgStarCount = 350;
const bgGeometry = new THREE.BufferGeometry();
const bgPositions = new Float32Array(bgStarCount * 3);
const bgSizes = new Float32Array(bgStarCount);

for (let i = 0; i < bgStarCount; i++) {
  bgPositions[i * 3] = (Math.random() - 0.5) * 2500;
  bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
  bgPositions[i * 3 + 2] = -150 + (Math.random() - 0.5) * 100;
  bgSizes[i] = Math.random() * 2.5 + 1.0;
}

bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
bgGeometry.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

const bgMaterial = new THREE.PointsMaterial({
  color: 0x94a3b8,
  size: 2,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const bgStars = new THREE.Points(bgGeometry, bgMaterial);
scene.add(bgStars);

// -------------------------------------------------------------
// 5. Central Celestial Core (Our Star)
// -------------------------------------------------------------
const celestialGroup = new THREE.Group();
scene.add(celestialGroup);

// Core Glow Sprite
const spriteMaterial = new THREE.SpriteMaterial({
  map: coreGlowTexture,
  color: myTheme.hexCore,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.85
});
const coreSprite = new THREE.Sprite(spriteMaterial);
coreSprite.scale.set(160, 160, 1);
celestialGroup.add(coreSprite);

// Dense Particle Core Sphere
const coreCount = 280;
const coreGeometry = new THREE.BufferGeometry();
const corePositions = new Float32Array(coreCount * 3);
const coreVelocities = [];

for (let i = 0; i < coreCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  const r = 24 + Math.random() * 16;

  corePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  corePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  corePositions[i * 3 + 2] = r * Math.cos(phi);

  coreVelocities.push({
    speed: (Math.random() - 0.5) * 0.04,
    axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
  });
}

coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));

const coreMaterial = new THREE.PointsMaterial({
  color: myTheme.hexPlasma,
  size: 5,
  map: particleTexture,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.95,
  depthWrite: false
});
const coreParticles = new THREE.Points(coreGeometry, coreMaterial);
celestialGroup.add(coreParticles);

// Accretion Disk Rings
const diskCount = 450;
const diskGeometry = new THREE.BufferGeometry();
const diskPositions = new Float32Array(diskCount * 3);
const diskAngles = new Float32Array(diskCount);
const diskRadii = new Float32Array(diskCount);

for (let i = 0; i < diskCount; i++) {
  const r = 45 + Math.random() * 45;
  const angle = Math.random() * Math.PI * 2;
  diskRadii[i] = r;
  diskAngles[i] = angle;

  diskPositions[i * 3] = Math.cos(angle) * r;
  diskPositions[i * 3 + 1] = Math.sin(angle) * r * 0.35; // Tilted perspective
  diskPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
}

diskGeometry.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));

const diskMaterial = new THREE.PointsMaterial({
  color: myTheme.hexFlare,
  size: 3.5,
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
// 6. Entangled Bridge, Quantum Stream & Magnetic Field Lines
// -------------------------------------------------------------
const streamCount = 500;
const streamGeometry = new THREE.BufferGeometry();
const streamPositions = new Float32Array(streamCount * 3);
const streamColors = new Float32Array(streamCount * 3);
const streamProgress = new Float32Array(streamCount);
const streamSpeed = new Float32Array(streamCount);
const streamLateralOffset = new Float32Array(streamCount);

for (let i = 0; i < streamCount; i++) {
  streamProgress[i] = Math.random();
  streamSpeed[i] = 0.003 + Math.random() * 0.006;
  streamLateralOffset[i] = (Math.random() - 0.5) * 35;
}

streamGeometry.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
streamGeometry.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));

const streamMaterial = new THREE.PointsMaterial({
  size: 4.5,
  map: particleTexture,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.9,
  depthWrite: false
});
const streamParticles = new THREE.Points(streamGeometry, streamMaterial);
scene.add(streamParticles);

// Curving Gravitational Field Lines
const fieldLineMaterial = new THREE.LineBasicMaterial({
  color: myTheme.hexCore,
  transparent: true,
  opacity: 0.35,
  blending: THREE.AdditiveBlending
});
const lineCount = 5;
const fieldLines = [];

for (let i = 0; i < lineCount; i++) {
  const lineGeo = new THREE.BufferGeometry();
  const line = new THREE.Line(lineGeo, fieldLineMaterial);
  scene.add(line);
  fieldLines.push(line);
}

// Collision Shockwave Rings
const shockwaveRingGeo = new THREE.RingGeometry(1, 3, 48);
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
// 7. Multi-Window Broadcast Channel Network
// -------------------------------------------------------------
const channel = new BroadcastChannel('celestial_collision_network');

function getWindowCoords() {
  const sx = window.screenX ?? window.screenLeft ?? 0;
  const sy = window.screenY ?? window.screenTop ?? 0;
  const cx = sx + window.innerWidth / 2;
  const cy = sy + window.innerHeight / 2;
  return { sx, sy, cx, cy };
}

function broadcastState() {
  const coords = getWindowCoords();
  const state = {
    type: 'sync',
    id: windowId,
    screenX: coords.sx,
    screenY: coords.sy,
    centerX: coords.cx,
    centerY: coords.cy,
    width: window.innerWidth,
    height: window.innerHeight,
    theme: myTheme,
    timestamp: performance.now()
  };

  channel.postMessage(state);
  
  // Backup localStorage fallback
  try {
    localStorage.setItem(`celestial_node_${windowId}`, JSON.stringify(state));
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
    localStorage.removeItem(`celestial_node_${windowId}`);
  } catch (e) {}
});

// Periodic peer prune
function prunePeers() {
  const now = performance.now();
  for (const [id, peer] of peers.entries()) {
    if (now - peer.lastReceived > 1600) {
      peers.delete(id);
    }
  }
}

// -------------------------------------------------------------
// 8. Dynamic Audio Engine (Synthesizer via Web Audio API)
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
  droneOsc.frequency.setValueAtTime(65, audioCtx.currentTime); // Deep cosmic drone

  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(200, audioCtx.currentTime);

  droneGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

  droneOsc.connect(filterNode);
  filterNode.connect(droneGain);
  droneGain.connect(audioCtx.destination);

  droneOsc.start();
  isAudioActive = true;
}

function updateAudio(distance) {
  if (!audioCtx || !isAudioActive) return;
  
  // As windows get closer, harmonic frequencies shimmer
  const normDist = Math.max(0, Math.min(1, distance / 1200));
  const targetFreq = 180 + (1 - normDist) * 800;
  filterNode.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
}

function playCollisionChime() {
  if (!audioCtx || !isAudioActive) return;
  const chimeOsc = audioCtx.createOscillator();
  const chimeGain = audioCtx.createGain();
  chimeOsc.type = 'sine';
  chimeOsc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
  chimeOsc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

  chimeGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  chimeOsc.connect(chimeGain);
  chimeGain.connect(audioCtx.destination);

  chimeOsc.start();
  chimeOsc.stop(audioCtx.currentTime + 0.4);
}

// -------------------------------------------------------------
// 9. UI Controls & Listeners
// -------------------------------------------------------------
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const metricsOverlay = document.getElementById('metrics-overlay');
const tensionVal = document.getElementById('tension-val');
const distVal = document.getElementById('dist-val');
const spawnBtn = document.getElementById('spawn-btn');
const soundBtn = document.getElementById('sound-btn');

spawnBtn.addEventListener('click', () => {
  const currentCoords = getWindowCoords();
  const nextTheme = (themeIndex + 1) % THEMES.length;
  const newLeft = currentCoords.sx + window.innerWidth + 25;
  const newTop = currentCoords.sy;
  
  window.open(
    `${window.location.origin}${window.location.pathname}?theme=${nextTheme}`,
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

// Resize handler
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
// 10. Main Animation & Gravitational Loop
// -------------------------------------------------------------
let clock = new THREE.Clock();
let hasCollided = false;

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  broadcastState();
  prunePeers();

  // Rotate our own celestial core
  celestialGroup.rotation.z = elapsedTime * 0.15;
  diskParticles.rotation.z = elapsedTime * 0.35;
  coreParticles.rotation.y = elapsedTime * 0.4;
  coreParticles.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;

  // Pulsing breath
  const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.05;
  coreSprite.scale.set(160 * pulse, 160 * pulse, 1);

  // Background stars subtle drift
  bgStars.rotation.z = elapsedTime * 0.01;

  // Multi-window interaction logic
  const myCoords = getWindowCoords();
  const activePeers = Array.from(peers.values());

  if (activePeers.length > 0) {
    // We are entangled!
    const peer = activePeers[0]; // Connect to nearest peer
    
    // Relative vector from our center to peer center
    // Note: Screen Y goes DOWN, Three.js Y goes UP!
    const targetX = peer.centerX - myCoords.cx;
    const targetY = -(peer.centerY - myCoords.cy);
    const dist = Math.hypot(targetX, targetY);

    // Update UI Status
    statusDot.classList.add('connected');
    statusText.textContent = `${activePeers.length + 1} Celestial Cores Entangled`;
    metricsOverlay.classList.add('visible');
    distVal.textContent = Math.round(dist);
    tensionVal.textContent = (1200 / Math.max(100, dist)).toFixed(2);

    updateAudio(dist);

    // Color interpolation between our core and peer core
    const colA = new THREE.Color(myTheme.hexCore);
    const colB = new THREE.Color(peer.theme.hexCore);

    // 1. Update Entangled Particle Stream
    const streamPos = streamGeometry.attributes.position.array;
    const streamCol = streamGeometry.attributes.color.array;

    for (let i = 0; i < streamCount; i++) {
      streamProgress[i] += streamSpeed[i];
      if (streamProgress[i] > 1.0) streamProgress[i] = 0;

      const t = streamProgress[i];
      
      // Interpolate along the bridge with gravitational sine wave curve
      const lateralFactor = Math.sin(t * Math.PI) * streamLateralOffset[i];
      const perpendicularX = -targetY / (dist || 1);
      const perpendicularY = targetX / (dist || 1);

      const px = targetX * t + perpendicularX * lateralFactor;
      const py = targetY * t + perpendicularY * lateralFactor;
      const pz = Math.sin(t * Math.PI * 4 + elapsedTime * 4) * 12;

      streamPos[i * 3] = px;
      streamPos[i * 3 + 1] = py;
      streamPos[i * 3 + 2] = pz;

      // Color gradient along the bridge
      const pColor = colA.clone().lerp(colB, t);
      streamCol[i * 3] = pColor.r;
      streamCol[i * 3 + 1] = pColor.g;
      streamCol[i * 3 + 2] = pColor.b;
    }
    streamGeometry.attributes.position.needsUpdate = true;
    streamGeometry.attributes.color.needsUpdate = true;
    streamParticles.visible = true;

    // 2. Update Gravitational Field Lines
    for (let l = 0; l < lineCount; l++) {
      const line = fieldLines[l];
      const points = [];
      const steps = 30;
      const spread = (l - (lineCount - 1) / 2) * 18;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const wave = Math.sin(t * Math.PI) * spread + Math.sin(t * Math.PI * 3 + elapsedTime * 3 + l) * 10;
        const perpX = -targetY / (dist || 1);
        const perpY = targetX / (dist || 1);

        points.push(new THREE.Vector3(
          targetX * t + perpX * wave,
          targetY * t + perpY * wave,
          0
        ));
      }

      line.geometry.setFromPoints(points);
      line.visible = true;
    }

    // 3. Close Contact / Celestial Collision State!
    if (dist < 180) {
      if (!hasCollided) {
        playCollisionChime();
        hasCollided = true;
      }
      shockwaveRing.position.set(targetX / 2, targetY / 2, 10);
      shockwaveScale += 0.08;
      if (shockwaveScale > 6) shockwaveScale = 1;
      shockwaveRing.scale.set(shockwaveScale * 25, shockwaveScale * 25, 1);
      shockwaveRingMat.opacity = Math.max(0, 1 - shockwaveScale / 6);
      shockwaveRing.visible = true;
    } else {
      hasCollided = false;
      shockwaveRing.visible = false;
    }

  } else {
    // Solo Orbit (No Peers)
    statusDot.classList.remove('connected');
    statusText.textContent = '1 Celestial Core (Solo Orbit)';
    metricsOverlay.classList.remove('visible');
    streamParticles.visible = false;
    shockwaveRing.visible = false;
    fieldLines.forEach(l => l.visible = false);
  }

  renderer.render(scene, camera);
}

// Start loop
animate();
