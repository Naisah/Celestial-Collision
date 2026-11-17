# 🌌 Celestial Collision

> **Real-time quantum-gravitational particle entanglement across multiple browser windows.**  
> Built with **Three.js**, the **BroadcastChannel API**, and the **Web Audio API**.

![Celestial Collision Banner](https://img.shields.io/badge/Three.js-0.170-black?style=for-the-badge&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![BroadcastChannel](https://img.shields.io/badge/BroadcastChannel-Realtime_Sync-06b6d4?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

---

## ✨ Overview

**Celestial Collision** turns your desktop monitor into a cosmic playground. Each open browser window acts as an autonomous celestial body (a glowing star core with accretion disks and coronal flares). 

When you open multiple windows side-by-side or drag them across your screen:
- The windows automatically discover each other in real time.
- A **gravitational particle bridge** and dynamic magnetic field lines dynamically connect the stars across physical desktop borders.
- As windows are dragged closer together, gravitational tension surges, modulating an ambient synthesizer drone.
- When the windows collide ($< 180\text{px}$), an energy shockwave erupts with custom audio chime feedback!

---

## 🚀 Key Features

* **Zero-Latency Cross-Window Sync:** Uses the browser's native `BroadcastChannel` API to exchange screen-space coordinates at 60 FPS without any backend server.
* **Physical Screen-Space Vector Math:** Uses `window.screenX` and `window.screenY` paired with an orthographic WebGL projection, guaranteeing seamless particle continuity across multiple physical monitors or browser windows.
* **Procedural Luminous Shaders & Textures:** Generates high-density radial glow textures and plasma points purely in code without relying on external image files.
* **Dynamic Audio Synthesizer:** Pure Web Audio API cosmic drone whose harmonic filter frequency modulates in real time based on inter-window gravitational tension.
* **Instant Partner Spawner:** One-click button (`Spawn Partner Window`) that opens a companion window with complementary celestial palettes (Solar Gold, Supernova Azure, Amethyst Pulsar).

---

## 🛠️ Tech Stack

* **Rendering Engine:** [Three.js](https://threejs.org/) (Orthographic Camera & Particle Points)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Inter-Process Communication:** Native `BroadcastChannel` API & `localStorage` Heartbeat
* **Sound Engine:** Native Web Audio API (Triangle Oscillator + BiquadFilterNode)

---

## 💻 Quick Start (Run Locally)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Naisah/Celestial-Collision.git
   cd Celestial-Collision
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local dev server:**
   ```bash
   npm run dev
   ```

4. **Experience the entanglement:**
   - Open [http://localhost:5173](http://localhost:5173).
   - Click the **"⚡ Spawn Partner Window"** button.
   - Drag the two windows around your screen!

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import **`Naisah/Celestial-Collision`**.
3. Framework Preset: **Vite**.
4. Click **Deploy** — your live site will be ready in under 30 seconds!

---

## 📜 License

MIT License © 2026 [Naisah Aspiras](https://github.com/Naisah)
