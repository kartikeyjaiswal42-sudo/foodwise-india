# Jaano — Packaged-Food Health Companion
**Search and decode what's actually inside the packaged foods sold in India — then track what you eat.**

## What This Is

Jaano (Hindi for *"know"*) is a consumer-health web app that helps Indian shoppers understand packaged foods before they buy them. Most pack labels hide the things that matter — added sugar, palm oil, refined flour, artificial colours, sodium — behind marketing claims and fine print. Jaano turns a product into a plain-language verdict: what's in it, which ingredients are worth a second look, and what healthier alternatives exist on the same shelf. It also keeps a persistent daily food diary so you can see your eating patterns over time. No account, no backend — everything lives in your browser.

## Key Features

- **Searchable food catalog** — browse and search packaged products by name or category, each with its ingredient list, nutrition snapshot, and a health read at a glance
- **Ingredient-concern flagging** — highlights ingredients that commonly warrant attention (added sugars, palm oil, maida, trans fats, artificial colours/preservatives, high sodium) with a short explanation of *why*
- **Side-by-side alternatives** — for a given product, surfaces comparable but better-rated options so the choice is actionable, not just informational
- **Persistent daily food diary** — log what you eat across the day; entries persist in `localStorage` so your history survives reloads with no sign-up
- **Fast, app-like UI** — instant client-side search and navigation, clean cards, and lucide-react iconography in a single-page experience
- **Zero-backend static app** — fully static export that runs entirely in the browser and deploys to any static host

## Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router, static export) |
| **UI library** | React 19 |
| **Icons** | lucide-react |
| **Styling** | CSS (global stylesheet, custom design) |
| **State / storage** | Browser `localStorage` (no server, no database) |
| **Deployment** | GitHub Pages (static `out/` export) |

The entire SPA is a single `'use client'` component in `src/app/page.js` — deliberately simple, no backend to operate.

## How to Run

```bash
# Clone the repository
git clone https://github.com/kartikeyjaiswal42-sudo/foodwise-india.git
cd foodwise-india

# Install dependencies and start the dev server
npm install
npm run dev
```

Open **http://localhost:3000**.

**Build a production static export:**

```bash
npm run build    # generates the static out/ directory
```

Deploy the exported `out/` folder to GitHub Pages, Netlify, Vercel, or any static host.

## Project Structure

```
foodwise-india/
├── src/app/
│   ├── page.js         # The entire single-page app ('use client') — catalog, search, diary
│   ├── layout.js       # Root layout + metadata
│   └── globals.css     # Global styling
├── public/             # Static assets (icons, .nojekyll for Pages)
├── next.config.mjs     # Static export config (basePath when deployed under a sub-path)
└── package.json
```

## Why I Built This

I grew up reading the back of food packets and realised most people — myself included — can't actually parse them. "No added MSG" sits next to three other glutamate sources; "made with real fruit" hides more sugar than a soft drink. The information needed to choose better is technically *on the label*, just buried and jargon-heavy.

I built Jaano with AI-assisted development to close that gap: take the raw ingredient and nutrition data and translate it into a verdict a regular shopper can act on in the aisle, plus a frictionless diary so healthier choices become a habit, not a one-off.

## Product Scope

The included catalog is representative demo data, not a complete or authoritative database. Product formulations and prices change, so a production version should use current pack-label data, source citations, and a review workflow. Health guidance is educational and non-diagnostic.

## Live Demo

🔗 **[kartikeyjaiswal42-sudo.github.io/foodwise-india](https://kartikeyjaiswal42-sudo.github.io/foodwise-india/)**
