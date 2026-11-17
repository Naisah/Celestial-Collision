# Celestial Collision

Real-time particle entanglement across multiple browser windows using Three.js, the BroadcastChannel API, and the Web Audio API.

---

## Overview

Celestial Collision turns the desktop monitor into a connected space where each open browser window acts as a particle core.

When multiple windows are open side-by-side or moved across screens:
- Windows discover each other in real time via the BroadcastChannel API.
- Continuous particle streams and gravitational field lines bridge the cores across window borders.
- Gravitational tension modulates an ambient audio synthesizer based on proximity.
- High-proximity collision triggers constellation morphing.

---

## Architecture & Coordinate System

Each window determines its bounds in screen pixels:

```javascript
const rect = {
  x: window.screenX + (window.outerWidth - window.innerWidth) / 2,
  y: window.screenY + (window.outerHeight - window.innerHeight),
  w: window.innerWidth,
  h: window.innerHeight,
};
```

Using an orthographic projection bound to `rect`, both windows render into the same global monitor space, ensuring particles align seamlessly across displays and window borders.

---

## Tech Stack

- **Three.js** (WebGL rendering & particle systems)
- **Vite** (Build tool & development server)
- **BroadcastChannel API** (Cross-window state synchronization)
- **Web Audio API** (Procedural synthesis)

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Naisah/Celestial-Collision.git
   cd Celestial-Collision
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` and click "Spawn Partner Window" to open a companion window.

---

## License

MIT License © 2026 Naisah Aspiras
