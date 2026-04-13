<div align="center">

# 🧵 Eklera Studio — Repeat Calculator

**The smartest embroidery repeat calculator built for professionals.**  
Find perfect design sizes, validate fits, and get exact resize suggestions — all instantly, no button needed.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://eklera-studio.vercel.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://eklera-studio.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Private-e91e84?style=for-the-badge)](#)

</div>

---

## ✨ What is Eklera Studio?

Embroidery machines require designs to repeat **perfectly** within the machine frame.  
Even a **0.5mm mismatch** causes the design to get cut or leave an ugly gap.

**Eklera Studio** solves this with 3 precision tools:

| Mode | Problem Solved |
|---|---|
| 🎯 **Find Design Size** | "I want 4 repeats — what size should my design be?" |
| 🔍 **Check Fit** | "Will my 62.02mm design fit perfectly in 250mm?" |
| 📐 **Resize Design** | "My repeat doesn't fit — exactly how much do I resize?" |

---

## 🚀 Features

### Calculator Modes

- **Mode 1 — Find Design Size**  
  Input machine size + repeat count → Instantly get the exact design size

- **Mode 2 — Check Fit**  
  Input your design size → Know if it fits, and get the 6 nearest perfect alternatives  
  🧠 Smart algorithm: **nearest perfect fit comes first** (not just the roundest number)

- **Mode 3 — Resize Design**  
  Input current width + current repeat → Get exact mm resize amount and % scale change for top 5 perfect targets

### Smart Suggestion Engine
- **3-Tier proximity algorithm** — very close (±2%) beats round numbers
- Suggestions ordered by **minimal resize needed**
- "Recommended" badge on the best option
- Round numbers prioritized within equal-proximity group

### Machine Size Manager
- Dropdown with **250, 300, 350, 400mm** defaults (cannot be deleted)
- Add any **custom machine size** via `+` button → modal
- Delete custom sizes directly from dropdown
- All sizes **persisted in `localStorage`** — survives refresh

### UX & Design
- ⚡ **Auto-calculate** — no submit button needed, results update as you type
- 🌙 **Dark / Light mode** toggle with smooth transition
- 💎 **Glassmorphism UI** with Framer Motion animations
- 📱 **Fully mobile responsive** — works perfectly on phone
- 🦴 **Skeleton loaders** — cards shimmer while page loads
- 🎬 **Animated app loader** — branded spinner on first load
- 🚫 **Custom 404 page** — animated, with home button

### PWA (Progressive Web App)
- 📲 **Installable** — Add to Home Screen on iOS & Android
- 🔌 **Offline support** via Workbox service worker
- ⚡ **Precached** assets for instant load
- Google Fonts cached for offline use

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | SCSS Modules + CSS Custom Properties |
| Animation | Framer Motion 12 |
| State | Redux Toolkit + React Redux |
| Routing | React Router DOM v7 |
| Icons | React Icons v5 (HeroIcons 2) |
| PWA | vite-plugin-pwa + Workbox |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── assets/
│   └── logo-icon.webp          # Navbar logo (only used asset)
├── components/
│   ├── AppLoader/              # Full-screen branded loader
│   ├── Navbar/                 # Sticky glassmorphism navbar
│   ├── Skeleton/               # Shimmer skeleton loaders
│   └── ThemeToggle/            # Dark/light mode button
├── pages/
│   ├── RepeatCalculatorPage/   # Core calculator (3 modes)
│   └── NotFoundPage/           # Animated 404 page
├── routes/
│   └── index.jsx               # Lazy-loaded routes
├── store/
│   ├── index.js                # Redux store
│   └── themeSlice.js           # Theme state slice
└── styles/
    ├── _variables.scss         # Design tokens (colors, spacing, type)
    ├── _mixins.scss            # SCSS mixins (flex, card, breakpoints)
    └── main.scss               # Global reset + theme CSS vars
```

---

## 🧠 Algorithm — Smart Suggestions

The suggestion engine uses a **3-tier proximity system**:

```
TIER 1 — Very Nearby (±2% of input, min ±1.5mm)
  Sort: mmDiff ASC (pure proximity)
  Example: input=62.02mm → 62.5mm(0.48mm away) beats 50mm(12mm away) ✓

TIER 2 — Nearby (±25% of input, min ±25mm)
  Sort: mmDiff ASC, roundScore DESC as tiebreaker
  Example: input=57mm → 62.5mm(5.5mm) before 50mm(7mm) ✓

TIER 3 — Far Away
  Sort: roundScore DESC, mmDiff ASC
  Example: 100mm, 50mm, 25mm get priority as "alternative" options
```

**Roundness Score:**
```js
size % 100 === 0  →  score 100   (e.g. 100mm, 200mm)
size % 50  === 0  →  score  90   (e.g. 50mm, 150mm)
size % 25  === 0  →  score  80   (e.g. 25mm, 125mm)
size % 10  === 0  →  score  70   (e.g. 60mm, 80mm)
size % 5   === 0  →  score  60   (e.g. 55mm, 75mm)
integer          →  score  50
1 decimal        →  score  40   (e.g. 62.5mm)
2 decimals       →  score  30
other            →  score  10
```

---

## 🔢 Resize Formula

```
New Width = Current Width × (Target Repeat / Current Repeat)

Example:
  Machine:         250 mm
  Current Width:   312.04 mm
  Current Repeat:  62.16 mm
  Target Repeat:   62.5 mm  (= 250 ÷ 4, perfect 4 repeats)

  New Width = 312.04 × (62.5 / 62.16) = 313.75 mm
  Change:    +1.71 mm  (+0.55%)
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-org/eklera-studio.git
cd eklera-studio

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🚀 Deploy to Vercel

### Option 1 — Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Framework: **Vite** (auto-detected)
5. Click **Deploy** ✅

### Option 2 — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

> `vercel.json` is already configured with SPA rewrites and asset caching headers.

---

## 📱 PWA Installation

| Platform | Steps |
|---|---|
| **Android (Chrome)** | Open site → Menu → "Install App" |
| **iOS (Safari)** | Open site → Share → "Add to Home Screen" |
| **Desktop (Chrome/Edge)** | Address bar → Install icon |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Accent | `#e91e84` (Pink) |
| Background (dark) | `#0f0f13` |
| Background (light) | `#f8f8fc` |
| Font (body) | Inter |
| Font (display) | Plus Jakarta Sans |
| Border Radius (pill) | `9999px` |
| Border Radius (card) | `20px` |
| Animation | Framer Motion spring (`stiffness: 420, damping: 32`) |

---

## 🗺️ Roadmap

- [ ] History — last 10 calculations saved locally
- [ ] Export to PDF / Print mode
- [ ] Multiple machine profiles
- [ ] cm / inch unit toggle
- [ ] Share calculation via URL params

---

## 👨‍💻 Built By

**Eklera Studio** — Made with ❤️ for the embroidery industry.

> "No gap. No cut. Perfect repeat."

---

<div align="center">

© 2025 Eklera Studio · All Rights Reserved

</div>
