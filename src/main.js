import * as THREE from 'three';

const PALETTES = [
  {
    id: 'quantum-azure',
    name: 'Quantum Azure',
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    plasma: '#93c5fd',
    hexPrimary: 0x3b82f6,
    hexSecondary: 0x1d4ed8,
    hexPlasma: 0x93c5fd
  },
  {
    id: 'solar-helios',
    name: 'Solar Helios',
    primary: '#f59e0b',
    secondary: '#b45309',
    plasma: '#fef08a',
    hexPrimary: 0xf59e0b,
    hexSecondary: 0xb45309,
    hexPlasma: 0xfef08a
  },
  {
    id: 'amethyst-pulsar',
    name: 'Amethyst Pulsar',
    primary: '#a855f7',
    secondary: '#6b21a8',
    plasma: '#f5d0fe',
    hexPrimary: 0xa855f7,
    hexSecondary: 0x6b21a8,
    hexPlasma: 0xf5d0fe
  },
  {
    id: 'emerald-quasar',
    name: 'Emerald Quasar',
    primary: '#10b981',
    secondary: '#047857',
    plasma: '#a7f3d0',
    hexPrimary: 0x10b981,
    hexSecondary: 0x047857,
    hexPlasma: 0xa7f3d0
  },
  {
    id: 'crimson-supernova',
    name: 'Crimson Supernova',
    primary: '#f43f5e',
    secondary: '#9f1239',
    plasma: '#fecdd3',
    hexPrimary: 0xf43f5e,
    hexSecondary: 0x9f1239,
    hexPlasma: 0xfecdd3
  },
  {
    id: 'sakura-nebula',
    name: 'Sakura Nebula',
    primary: '#f472b6',
    secondary: '#831843',
    plasma: '#fce7f3',
    hexPrimary: 0xf472b6,
    hexSecondary: 0x831843,
    hexPlasma: 0xfce7f3
  }
];

const urlParams = new URLSearchParams(window.location.search);
let currentPaletteIndex = urlParams.has('theme')
  ? parseInt(urlParams.get('theme')) % PALETTES.length
  : 0;
let myPalette = PALETTES[currentPaletteIndex];

const windowId = 'celestial_' + Math.random().toString(36).substring(2, 9);
const peers = new Map();

function createSeededRandom(initialSeed) {
  let s = initialSeed;
  return function() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getWindowRect() {
  const sx = window.screenX !== undefined ? window.screenX : (window.screenLeft || 0);
  const sy = window.screenY !== undefined ? window.screenY : (window.screenTop || 0);
  const borderX = Math.max(0, (window.outerWidth - window.innerWidth) / 2);
  const borderY = Math.max(0, window.outerHeight - window.innerHeight);

  return {
    x: sx + borderX,
    y: sy + borderY,
    w: Math.max(10, window.innerWidth),
    h: Math.max(10, window.innerHeight),
    cx: sx + borderX + window.innerWidth / 2,
    cy: sy + borderY + window.innerHeight / 2
  };
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  return texture;
}

function createGlowSpriteTexture(colorHexStr) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, colorHexStr);
  gradient.addColorStop(0.25, colorHexStr);
  gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  return texture;
}

const particleTexture = createParticleTexture();

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const initialRect = getWindowRect();
const camera = new THREE.OrthographicCamera(
  initialRect.x,
  initialRect.x + initialRect.w,
  -initialRect.y,
  -(initialRect.y + initialRect.h),
  0.1,
  3000
);
camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(initialRect.w, initialRect.h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const bgCount = 600;
const bgGeo = new THREE.BufferGeometry();
const bgPositions = new Float32Array(bgCount * 3);
const bgRng = createSeededRandom(777);

for (let i = 0; i < bgCount; i++) {
  bgPositions[i * 3] = (bgRng() - 0.5) * 5000 + 1000;
  bgPositions[i * 3 + 1] = -( (bgRng() - 0.5) * 4000 + 600 );
  bgPositions[i * 3 + 2] = -500 + (bgRng() - 0.5) * 200;
}
bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
const bgMaterial = new THREE.PointsMaterial({
  color: 0x94a3b8,
  size: 2.2,
  map: particleTexture,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const bgStars = new THREE.Points(bgGeo, bgMaterial);
scene.add(bgStars);

function createCelestialOrb(palette, seed = 1001) {
  const rng = createSeededRandom(seed);
  const orbGroup = new THREE.Group();

  const glowMat = new THREE.SpriteMaterial({
    map: createGlowSpriteTexture(palette.primary),
    color: palette.hexPrimary,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const haloSprite = new THREE.Sprite(glowMat);
  haloSprite.scale.set(480, 480, 1);
  orbGroup.add(haloSprite);

  const coreCount = 2500;
  const coreGeo = new THREE.BufferGeometry();
  const corePositions = new Float32Array(coreCount * 3);
  const coreOriginalSphere = [];
  const coreCatTarget = [];

  const CORE_RADIUS = 135;

  for (let i = 0; i < coreCount; i++) {
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(rng() * 2 - 1);
    const r = CORE_RADIUS * Math.pow(rng(), 0.65);

    const sx = r * Math.sin(phi) * Math.cos(theta);
    const sy = r * Math.sin(phi) * Math.sin(theta);
    const sz = r * Math.cos(phi);

    corePositions[i * 3] = sx;
    corePositions[i * 3 + 1] = sy;
    corePositions[i * 3 + 2] = sz;
    coreOriginalSphere.push(new THREE.Vector3(sx, sy, sz));

    let cx = 0, cy = 0, cz = (rng() - 0.5) * 16;
    const bucket = i % 100;

    if (bucket < 28) {
      const angle = (i / 700) * Math.PI * 2;
      const cheekBulge = 1.0 + 0.18 * Math.sin(angle) * Math.sin(angle);
      const hRad = 92 * cheekBulge;
      cx = Math.cos(angle) * hRad;
      cy = Math.sin(angle) * (hRad * 0.88) - 10;
    } else if (bucket < 46) {
      const isRight = (bucket % 2 === 0);
      const sign = isRight ? 1 : -1;
      const t = rng();
      const edge = rng();

      if (edge < 0.48) {
        cx = THREE.MathUtils.lerp(sign * 75, sign * 65, t);
        cy = THREE.MathUtils.lerp(55, 168, t);
      } else if (edge < 0.82) {
        cx = THREE.MathUtils.lerp(sign * 65, sign * 22, t);
        cy = THREE.MathUtils.lerp(168, 85, t);
      } else {
        cx = THREE.MathUtils.lerp(sign * 60, sign * 56, t);
        cy = THREE.MathUtils.lerp(75, 138, t);
      }
    } else if (bucket < 60) {
      const isRight = (bucket % 2 === 0);
      const sign = isRight ? 1 : -1;
      const whiskerIdx = Math.floor(rng() * 3);
      const t = rng();
      const startX = sign * 44;
      const startY = -12 + (whiskerIdx - 1) * 12;
      const endX = sign * (145 + rng() * 30);
      const endY = startY + (whiskerIdx === 0 ? 16 : whiskerIdx === 1 ? -2 : -22);

      cx = THREE.MathUtils.lerp(startX, endX, t);
      cy = THREE.MathUtils.lerp(startY, endY, t) + Math.sin(t * Math.PI) * (sign * 5);
    } else if (bucket < 74) {
      const isRight = (bucket % 2 === 0);
      const sign = isRight ? 1 : -1;
      const eyeCenter = new THREE.Vector2(sign * 38, 20);
      const t = rng();
      const isUpper = rng() > 0.35;

      if (isUpper) {
        cx = THREE.MathUtils.lerp(sign * 56, sign * 20, t);
        cy = 20 + Math.sin(t * Math.PI) * 11;
      } else {
        cx = THREE.MathUtils.lerp(sign * 56, sign * 20, t);
        cy = 20 - Math.sin(t * Math.PI) * 7;
      }

      if (rng() < 0.25) {
        cx = eyeCenter.x + (rng() - 0.5) * 6;
        cy = eyeCenter.y + (rng() - 0.5) * 6;
      }
    } else if (bucket < 82) {
      const u = rng();
      if (u < 0.5) {
        const nt = rng();
        cx = (rng() - 0.5) * 16 * (1 - nt);
        cy = -6 - nt * 10;
      } else {
        const isRight = rng() > 0.5;
        const sign = isRight ? 1 : -1;
        const mt = rng();
        cx = sign * (mt * 24);
        cy = -22 - Math.sin(mt * Math.PI) * 10;
      }
    } else if (bucket < 94) {
      const fAng = rng() * Math.PI * 2;
      const fRad = rng() * 70;
      cx = Math.cos(fAng) * (fRad * 1.05);
      cy = Math.sin(fAng) * (fRad * 0.85) - 10;
    } else {
      const sAng = rng() * Math.PI * 2;
      const sRad = 125 + rng() * 55;
      cx = Math.cos(sAng) * sRad;
      cy = Math.sin(sAng) * sRad;
    }

    coreCatTarget.push(new THREE.Vector3(cx, cy, cz));
  }

  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
  const coreMat = new THREE.PointsMaterial({
    color: palette.hexPlasma,
    size: 2.8,
    map: particleTexture,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const corePoints = new THREE.Points(coreGeo, coreMat);
  orbGroup.add(corePoints);

  const loopCount = 14;
  const particlesPerLoop = 130;
  const fluxTotal = loopCount * particlesPerLoop;
  const fluxGeo = new THREE.BufferGeometry();
  const fluxPositions = new Float32Array(fluxTotal * 3);

  const loopsData = [];
  for (let l = 0; l < loopCount; l++) {
    const radiusX = 140 + (l % 7) * 20;
    const radiusY = radiusX * (0.65 + rng() * 0.25);
    const inclination = (l / loopCount) * Math.PI + (rng() - 0.5) * 0.3;
    const azimuth = (l * 0.45) % (Math.PI * 2);
    const speed = 0.4 + rng() * 0.6;
    const direction = l % 2 === 0 ? 1 : -1;

    const rotEuler = new THREE.Euler(inclination, azimuth, (l * 0.3));
    const uVec = new THREE.Vector3(1, 0, 0).applyEuler(rotEuler);
    const vVec = new THREE.Vector3(0, 1, 0).applyEuler(rotEuler);

    loopsData.push({ radiusX, radiusY, uVec, vVec, speed, direction });
  }

  const fluxOffsets = [];
  for (let l = 0; l < loopCount; l++) {
    for (let p = 0; p < particlesPerLoop; p++) {
      fluxOffsets.push({
        loopIdx: l,
        baseAngle: (p / particlesPerLoop) * Math.PI * 2 + (rng() - 0.5) * 0.05,
        speedMultiplier: 0.95 + rng() * 0.1
      });
    }
  }

  fluxGeo.setAttribute('position', new THREE.BufferAttribute(fluxPositions, 3));
  const fluxMat = new THREE.PointsMaterial({
    color: palette.hexPrimary,
    size: 2.4,
    map: particleTexture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const fluxPoints = new THREE.Points(fluxGeo, fluxMat);
  orbGroup.add(fluxPoints);

  const catLineIndices = [
    new THREE.Vector3(-75, 55, 0), new THREE.Vector3(-65, 168, 0),
    new THREE.Vector3(-65, 168, 0), new THREE.Vector3(-22, 85, 0),
    new THREE.Vector3(-62, 75, 0), new THREE.Vector3(-58, 140, 0),
    new THREE.Vector3(-58, 140, 0), new THREE.Vector3(-32, 88, 0),
    new THREE.Vector3(75, 55, 0), new THREE.Vector3(65, 168, 0),
    new THREE.Vector3(65, 168, 0), new THREE.Vector3(22, 85, 0),
    new THREE.Vector3(62, 75, 0), new THREE.Vector3(60, 140, 0),
    new THREE.Vector3(60, 140, 0), new THREE.Vector3(32, 88, 0),
    new THREE.Vector3(-22, 85, 0), new THREE.Vector3(22, 85, 0),
    new THREE.Vector3(-75, 55, 0), new THREE.Vector3(-96, 12, 0),
    new THREE.Vector3(-96, 12, 0), new THREE.Vector3(-104, -22, 0),
    new THREE.Vector3(-104, -22, 0), new THREE.Vector3(-85, -60, 0),
    new THREE.Vector3(-85, -60, 0), new THREE.Vector3(0, -90, 0),
    new THREE.Vector3(75, 55, 0), new THREE.Vector3(96, 12, 0),
    new THREE.Vector3(96, 12, 0), new THREE.Vector3(104, -22, 0),
    new THREE.Vector3(104, -22, 0), new THREE.Vector3(85, -60, 0),
    new THREE.Vector3(85, -60, 0), new THREE.Vector3(0, -90, 0),
    new THREE.Vector3(-56, 20, 0), new THREE.Vector3(-38, 30, 0),
    new THREE.Vector3(-38, 30, 0), new THREE.Vector3(-20, 20, 0),
    new THREE.Vector3(-56, 20, 0), new THREE.Vector3(-38, 13, 0),
    new THREE.Vector3(-38, 13, 0), new THREE.Vector3(-20, 20, 0),
    new THREE.Vector3(20, 20, 0), new THREE.Vector3(38, 30, 0),
    new THREE.Vector3(38, 30, 0), new THREE.Vector3(56, 20, 0),
    new THREE.Vector3(20, 20, 0), new THREE.Vector3(38, 13, 0),
    new THREE.Vector3(38, 13, 0), new THREE.Vector3(56, 20, 0),
    new THREE.Vector3(-8, -6, 0), new THREE.Vector3(8, -6, 0),
    new THREE.Vector3(-8, -6, 0), new THREE.Vector3(0, -16, 0),
    new THREE.Vector3(8, -6, 0), new THREE.Vector3(0, -16, 0),
    new THREE.Vector3(0, -16, 0), new THREE.Vector3(0, -24, 0),
    new THREE.Vector3(0, -24, 0), new THREE.Vector3(-14, -34, 0),
    new THREE.Vector3(-14, -34, 0), new THREE.Vector3(-26, -28, 0),
    new THREE.Vector3(0, -24, 0), new THREE.Vector3(14, -34, 0),
    new THREE.Vector3(14, -34, 0), new THREE.Vector3(26, -28, 0),
    new THREE.Vector3(-44, -12, 0), new THREE.Vector3(-150, 4, 0),
    new THREE.Vector3(-46, -24, 0), new THREE.Vector3(-170, -24, 0),
    new THREE.Vector3(-44, -36, 0), new THREE.Vector3(-150, -56, 0),
    new THREE.Vector3(44, -12, 0), new THREE.Vector3(150, 4, 0),
    new THREE.Vector3(46, -24, 0), new THREE.Vector3(170, -24, 0),
    new THREE.Vector3(44, -36, 0), new THREE.Vector3(150, -56, 0)
  ];
  const catLineGeo = new THREE.BufferGeometry().setFromPoints(catLineIndices);
  const catLineMat = new THREE.LineBasicMaterial({
    color: 0xf472b6,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  const catLines = new THREE.LineSegments(catLineGeo, catLineMat);
  orbGroup.add(catLines);

  return {
    group: orbGroup,
    haloSprite,
    corePoints,
    coreGeo,
    coreOriginalSphere,
    coreCatTarget,
    coreMat,
    fluxPoints,
    fluxGeo,
    fluxMat,
    fluxOffsets,
    loopsData,
    catLines,
    catLineMat,
    currentPaletteId: palette.id,
    seed,
    updatePalette(newPal) {
      this.currentPaletteId = newPal.id;
      haloSprite.material.map = createGlowSpriteTexture(newPal.primary);
      haloSprite.material.color.setHex(newPal.hexPrimary);
      coreMat.color.setHex(newPal.hexPlasma);
      fluxMat.color.setHex(newPal.hexPrimary);
    }
  };
}

let myOrb = createCelestialOrb(myPalette, 1001);
scene.add(myOrb.group);

let peerOrb = null;

const bridgeParticleCount = 1000;
const bridgeGeo = new THREE.BufferGeometry();
const bridgePositions = new Float32Array(bridgeParticleCount * 3);
const bridgeColors = new Float32Array(bridgeParticleCount * 3);
const bridgeProgress = new Float32Array(bridgeParticleCount);
const bridgeSpeeds = new Float32Array(bridgeParticleCount);
const bridgeSpread = new Float32Array(bridgeParticleCount);
const bridgeRng = createSeededRandom(5555);

for (let i = 0; i < bridgeParticleCount; i++) {
  bridgeProgress[i] = bridgeRng();
  bridgeSpeeds[i] = 0.003 + bridgeRng() * 0.008;
  bridgeSpread[i] = (bridgeRng() - 0.5) * 50;
}

bridgeGeo.setAttribute('position', new THREE.BufferAttribute(bridgePositions, 3));
bridgeGeo.setAttribute('color', new THREE.BufferAttribute(bridgeColors, 3));
const bridgeMaterial = new THREE.PointsMaterial({
  size: 3.2,
  map: particleTexture,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  opacity: 0.95,
  depthWrite: false
});
const bridgeParticles = new THREE.Points(bridgeGeo, bridgeMaterial);
bridgeParticles.visible = false;
scene.add(bridgeParticles);

const streamCount = 7;
const streamlines = [];
const streamlineMaterials = [];

for (let i = 0; i < streamCount; i++) {
  const lineMat = new THREE.LineBasicMaterial({
    color: myPalette.hexPrimary,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const lineGeo = new THREE.BufferGeometry();
  const line = new THREE.Line(lineGeo, lineMat);
  line.visible = false;
  scene.add(line);
  streamlines.push(line);
  streamlineMaterials.push(lineMat);
}

const shockwaveGeo = new THREE.RingGeometry(1, 6, 64);
const shockwaveMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending
});
const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
shockwave.visible = false;
scene.add(shockwave);
let shockwaveScale = 1;

const channel = new BroadcastChannel('celestial_collision_network');

let isCatMode = false;
let collisionEnergy = 0;

function broadcastState() {
  const rect = getWindowRect();
  const state = {
    type: 'sync',
    id: windowId,
    rect: { x: rect.x, y: rect.y, w: rect.w, h: rect.h },
    center: { x: rect.cx, y: rect.cy },
    palette: myPalette,
    isCat: isCatMode,
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
    if (peers.size >= 1 && !peers.has(data.id)) {
      return;
    }
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
  droneOsc.frequency.setValueAtTime(65, audioCtx.currentTime);

  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(220, audioCtx.currentTime);

  droneGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

  droneOsc.connect(filterNode);
  filterNode.connect(droneGain);
  droneGain.connect(audioCtx.destination);

  droneOsc.start();
  isAudioActive = true;
}

function updateAudio(distance) {
  if (!audioCtx || !isAudioActive) return;
  const normDist = Math.max(0, Math.min(1, distance / 1400));
  const targetFreq = 180 + (1 - normDist) * 850;
  filterNode.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
}

function playCatChime() {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now);
  osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.18);
  osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.38);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.45);
}

const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const metricsOverlay = document.getElementById('metrics-overlay');
const tensionVal = document.getElementById('tension-val');
const distVal = document.getElementById('dist-val');
const energyVal = document.getElementById('energy-val');
const collisionBar = document.getElementById('collision-bar');
const spawnBtn = document.getElementById('spawn-btn');
const soundBtn = document.getElementById('sound-btn');
const catToast = document.getElementById('cat-toast');

function applyPalette(pal) {
  myPalette = pal;
  myOrb.updatePalette(pal);

  streamlineMaterials.forEach(m => m.color.setHex(pal.hexPrimary));

  document.querySelectorAll('.palette-swatch').forEach(el => {
    el.classList.toggle('active', el.dataset.id === pal.id);
  });
}

const pickerContainer = document.getElementById('palette-picker');
PALETTES.forEach((p) => {
  const swatch = document.createElement('div');
  swatch.className = `palette-swatch ${p.id === myPalette.id ? 'active' : ''}`;
  swatch.dataset.id = p.id;
  swatch.style.backgroundColor = p.primary;
  swatch.title = p.name;
  swatch.addEventListener('click', () => applyPalette(p));
  pickerContainer.appendChild(swatch);
});

spawnBtn.addEventListener('click', () => {
  if (peers.size >= 1) return;

  const rect = getWindowRect();
  const nextThemeIdx = (currentPaletteIndex + 1) % PALETTES.length;
  const newLeft = rect.x + rect.w + 16;
  const newTop = rect.y;

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
  const rect = getWindowRect();
  camera.left = rect.x;
  camera.right = rect.x + rect.w;
  camera.top = -rect.y;
  camera.bottom = -(rect.y + rect.h);
  camera.updateProjectionMatrix();

  renderer.setSize(rect.w, rect.h);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
    applyPalette(PALETTES[currentPaletteIndex]);
  }
});

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = (Date.now() % 10000000) / 1000;
  broadcastState();
  prunePeers();

  const myRect = getWindowRect();
  camera.left = myRect.x;
  camera.right = myRect.x + myRect.w;
  camera.top = -myRect.y;
  camera.bottom = -(myRect.y + myRect.h);
  camera.updateProjectionMatrix();

  const activePeers = Array.from(peers.values()).slice(0, 1);

  if (activePeers.length > 0) {
    spawnBtn.disabled = true;
    spawnBtn.style.opacity = '0.5';
    spawnBtn.style.cursor = 'not-allowed';
    spawnBtn.title = 'Maximum 2 cores active';
  } else {
    spawnBtn.disabled = false;
    spawnBtn.style.opacity = '1';
    spawnBtn.style.cursor = 'pointer';
    spawnBtn.title = 'Open companion window';
  }

  let mySeed = 1001;
  let peerSeed = 2002;
  if (activePeers.length > 0) {
    const isPrimaryWindow = windowId < activePeers[0].id;
    mySeed = isPrimaryWindow ? 1001 : 2002;
    peerSeed = isPrimaryWindow ? 2002 : 1001;
  }

  if (myOrb.seed !== mySeed) {
    scene.remove(myOrb.group);
    myOrb = createCelestialOrb(myPalette, mySeed);
    scene.add(myOrb.group);
  }

  myOrb.group.position.set(myRect.cx, -myRect.cy, 0);

  const corePosArr = myOrb.coreGeo.attributes.position.array;
  for (let i = 0; i < myOrb.coreOriginalSphere.length; i++) {
    const target = isCatMode ? myOrb.coreCatTarget[i] : myOrb.coreOriginalSphere[i];
    corePosArr[i * 3] += (target.x - corePosArr[i * 3]) * 0.08;
    corePosArr[i * 3 + 1] += (target.y - corePosArr[i * 3 + 1]) * 0.08;
    corePosArr[i * 3 + 2] += (target.z - corePosArr[i * 3 + 2]) * 0.08;
  }
  myOrb.coreGeo.attributes.position.needsUpdate = true;

  const fluxPosArr = myOrb.fluxGeo.attributes.position.array;
  for (let i = 0; i < myOrb.fluxOffsets.length; i++) {
    const item = myOrb.fluxOffsets[i];
    const loop = myOrb.loopsData[item.loopIdx];

    const theta = item.baseAngle + (elapsedTime * loop.speed * loop.direction * item.speedMultiplier);
    const px = Math.cos(theta) * loop.radiusX;
    const py = Math.sin(theta) * loop.radiusY;

    const p3d = new THREE.Vector3()
      .addScaledVector(loop.uVec, px)
      .addScaledVector(loop.vVec, py);

    fluxPosArr[i * 3] = p3d.x;
    fluxPosArr[i * 3 + 1] = p3d.y;
    fluxPosArr[i * 3 + 2] = p3d.z;
  }
  myOrb.fluxGeo.attributes.position.needsUpdate = true;

  if (isCatMode) {
    myOrb.group.rotation.z += (0 - myOrb.group.rotation.z) * 0.15;
    myOrb.catLineMat.opacity = Math.min(0.9, myOrb.catLineMat.opacity + 0.05);
    const breath = 1 + Math.sin(elapsedTime * 2.5) * 0.025;
    myOrb.corePoints.scale.set(breath, breath, 1);
    myOrb.catLines.scale.set(breath, breath, 1);
    myOrb.haloSprite.scale.set(450 * breath, 450 * breath, 1);
  } else {
    myOrb.catLineMat.opacity = Math.max(0, myOrb.catLineMat.opacity - 0.05);
    myOrb.corePoints.scale.set(1, 1, 1);
    myOrb.catLines.scale.set(1, 1, 1);
    const pulse = 1 + Math.sin(elapsedTime * 2) * 0.05;
    myOrb.haloSprite.scale.set(480 * pulse, 480 * pulse, 1);
    myOrb.group.rotation.z = elapsedTime * 0.12;
  }

  if (activePeers.length > 0) {
    const peer = activePeers[0];

    if (!peerOrb || peerOrb.seed !== peerSeed) {
      if (peerOrb) scene.remove(peerOrb.group);
      peerOrb = createCelestialOrb(peer.palette, peerSeed);
      scene.add(peerOrb.group);
    }
    if (peerOrb.currentPaletteId !== peer.palette.id) {
      peerOrb.updatePalette(peer.palette);
    }

    peerOrb.group.position.set(peer.center.x, -peer.center.y, 0);
    peerOrb.group.visible = true;

    const pCorePos = peerOrb.coreGeo.attributes.position.array;
    for (let i = 0; i < peerOrb.coreOriginalSphere.length; i++) {
      const target = peer.isCat ? peerOrb.coreCatTarget[i] : peerOrb.coreOriginalSphere[i];
      pCorePos[i * 3] += (target.x - pCorePos[i * 3]) * 0.08;
      pCorePos[i * 3 + 1] += (target.y - pCorePos[i * 3 + 1]) * 0.08;
      pCorePos[i * 3 + 2] += (target.z - pCorePos[i * 3 + 2]) * 0.08;
    }
    peerOrb.coreGeo.attributes.position.needsUpdate = true;

    const pFluxPos = peerOrb.fluxGeo.attributes.position.array;
    for (let i = 0; i < peerOrb.fluxOffsets.length; i++) {
      const item = peerOrb.fluxOffsets[i];
      const loop = peerOrb.loopsData[item.loopIdx];
      const theta = item.baseAngle + (elapsedTime * loop.speed * loop.direction * item.speedMultiplier);
      const px = Math.cos(theta) * loop.radiusX;
      const py = Math.sin(theta) * loop.radiusY;
      const p3d = new THREE.Vector3().addScaledVector(loop.uVec, px).addScaledVector(loop.vVec, py);
      pFluxPos[i * 3] = p3d.x;
      pFluxPos[i * 3 + 1] = p3d.y;
      pFluxPos[i * 3 + 2] = p3d.z;
    }
    peerOrb.fluxGeo.attributes.position.needsUpdate = true;

    if (peer.isCat || isCatMode) {
      peerOrb.group.rotation.z += (0 - peerOrb.group.rotation.z) * 0.15;
      peerOrb.catLineMat.opacity = Math.min(0.9, peerOrb.catLineMat.opacity + 0.05);
      const pBreath = 1 + Math.sin(elapsedTime * 2.5) * 0.025;
      peerOrb.corePoints.scale.set(pBreath, pBreath, 1);
      peerOrb.catLines.scale.set(pBreath, pBreath, 1);
      peerOrb.haloSprite.scale.set(450 * pBreath, 450 * pBreath, 1);
    } else {
      peerOrb.catLineMat.opacity = Math.max(0, peerOrb.catLineMat.opacity - 0.05);
      peerOrb.corePoints.scale.set(1, 1, 1);
      peerOrb.catLines.scale.set(1, 1, 1);
      const pPulse = 1 + Math.sin(elapsedTime * 2) * 0.05;
      peerOrb.haloSprite.scale.set(480 * pPulse, 480 * pPulse, 1);
      peerOrb.group.rotation.z = elapsedTime * 0.12;
    }

    const dx = peer.center.x - myRect.cx;
    const dy = peer.center.y - myRect.cy;
    const dist = Math.hypot(dx, dy) || 1;

    statusDot.classList.add('connected');
    statusText.textContent = '2/2 Celestial Cores Entangled';
    metricsOverlay.classList.add('visible');
    distVal.textContent = Math.round(dist);
    tensionVal.textContent = (1600 / Math.max(120, dist)).toFixed(2);

    updateAudio(dist);

    const isColliding = dist < 160;

    if (isColliding) {
      const depthFactor = (160 - dist) / 160;
      const chargeSpeed = 1.0 + depthFactor * 1.0;
      collisionEnergy = Math.min(100, collisionEnergy + chargeSpeed);
      if (collisionEnergy >= 100 && !isCatMode) {
        isCatMode = true;
        statusDot.classList.add('cat-mode');
        catToast.classList.add('active');
        playCatChime();
        setTimeout(() => catToast.classList.remove('active'), 3200);
      }
    } else {
      collisionEnergy = Math.max(0, collisionEnergy - 1.2);
      if (collisionEnergy <= 0 && isCatMode) {
        isCatMode = false;
        statusDot.classList.remove('cat-mode');
      }
    }
    collisionBar.style.width = `${collisionEnergy}%`;
    if (energyVal) energyVal.textContent = Math.round(collisionEnergy);

    const isPrimary = windowId < peer.id;
    const starA = isPrimary ? myRect.cx : peer.center.x;
    const starA_y = isPrimary ? myRect.cy : peer.center.y;
    const starB = isPrimary ? peer.center.x : myRect.cx;
    const starB_y = isPrimary ? peer.center.y : myRect.cy;

    const spanX = starB - starA;
    const spanY = starB_y - starA_y;
    const totalDist = Math.hypot(spanX, spanY) || 1;

    const normX = -spanY / totalDist;
    const normY = spanX / totalDist;

    const colA = new THREE.Color(myPalette.hexPrimary);
    const colB = new THREE.Color(peer.palette.hexPrimary);

    const bridgePos = bridgeGeo.attributes.position.array;
    const bridgeCol = bridgeGeo.attributes.color.array;

    for (let i = 0; i < bridgeParticleCount; i++) {
      bridgeProgress[i] += bridgeSpeeds[i];
      if (bridgeProgress[i] > 1.0) bridgeProgress[i] = 0;

      const u = bridgeProgress[i];
      const wave = Math.sin(u * Math.PI) * bridgeSpread[i] + Math.sin(u * Math.PI * 4 + elapsedTime * 4) * 8;

      const gx = starA + spanX * u + normX * wave;
      const gy = starA_y + spanY * u + normY * wave;

      bridgePos[i * 3] = gx;
      bridgePos[i * 3 + 1] = -gy;
      bridgePos[i * 3 + 2] = Math.sin(u * Math.PI * 3 + elapsedTime * 3) * 15;

      const pCol = colA.clone().lerp(colB, isPrimary ? u : 1 - u);
      bridgeCol[i * 3] = pCol.r;
      bridgeCol[i * 3 + 1] = pCol.g;
      bridgeCol[i * 3 + 2] = pCol.b;
    }
    bridgeGeo.attributes.position.needsUpdate = true;
    bridgeGeo.attributes.color.needsUpdate = true;
    bridgeParticles.visible = true;

    for (let l = 0; l < streamCount; l++) {
      const line = streamlines[l];
      const points = [];
      const steps = 40;
      const spread = (l - (streamCount - 1) / 2) * 26;

      for (let s = 0; s <= steps; s++) {
        const u = s / steps;
        const wave = Math.sin(u * Math.PI) * spread + Math.sin(u * Math.PI * 3 + elapsedTime * 3 + l) * 14;

        const gx = starA + spanX * u + normX * wave;
        const gy = starA_y + spanY * u + normY * wave;

        points.push(new THREE.Vector3(gx, -gy, 0));
      }

      line.geometry.setFromPoints(points);
      line.visible = true;
    }

    if (isColliding) {
      const midX = (myRect.cx + peer.center.x) / 2;
      const midY = (myRect.cy + peer.center.y) / 2;
      shockwave.position.set(midX, -midY, 10);

      shockwaveScale += 0.08;
      if (shockwaveScale > 6) shockwaveScale = 1;

      shockwave.scale.set(shockwaveScale * 25, shockwaveScale * 25, 1);
      shockwaveMat.opacity = Math.max(0, 1 - shockwaveScale / 6);
      shockwave.visible = true;
    } else {
      shockwave.visible = false;
      shockwaveScale = 1;
    }

  } else {
    statusDot.classList.remove('connected');
    statusText.textContent = '1/2 Celestial Cores (Solo Orbit)';
    metricsOverlay.classList.remove('visible');
    bridgeParticles.visible = false;
    shockwave.visible = false;
    streamlines.forEach(l => (l.visible = false));
    if (peerOrb) peerOrb.group.visible = false;

    collisionEnergy = Math.max(0, collisionEnergy - 1.2);
    if (collisionEnergy <= 0 && isCatMode) {
      isCatMode = false;
      statusDot.classList.remove('cat-mode');
    }
    collisionBar.style.width = `${collisionEnergy}%`;
    if (energyVal) energyVal.textContent = Math.round(collisionEnergy);
  }

  renderer.render(scene, camera);
}

animate();
