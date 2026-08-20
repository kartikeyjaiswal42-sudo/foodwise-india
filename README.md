# Jaano — Packaged-Food Health Companion
**Search and decode what's actually inside the packaged foods sold in India — then track what you eat.**

## What This Is

Jaano (Hindi for *"know"*) is a consumer-health web app for Indian food — both halves of it.

**Packaged food:** most pack labels hide the things that matter — added sugar, palm oil, refined flour, artificial colours, sodium — behind marketing claims and fine print. Jaano turns a product into a plain-language verdict: what's in it, which ingredients are worth a second look, and what healthier alternatives exist on the same shelf.

**Everything else you actually eat:** dal, sabzi, roti, chaat and mithai arrive on a plate with no label at all. Photograph your meal and Jaano identifies each dish, judges whether it was cooked at home, at a restaurant, a dhaba or a stall — a real and large nutritional difference — and gives you a calorie **range** for the plate.

No account, no backend — everything lives in your browser.

## Key Features

- **Meal photo estimator** — snap a thali and get each dish identified, with ghar-ka vs restaurant vs dhaba vs street distinguished from visual cues, and a calorie range for the plate
- **Home-cooked dish builder** — build a dish from what actually went in the pan (2 tsp ghee, 1 katori toor dal), divide the pot by how many people it fed, and turn the estimate into a calculation
- **Eating-out catalog** — 223 Indian dishes showing what the same food costs at home versus ordered, before you order it
- **Weekly trends** — charts and plain-language findings derived only from your own logged days
- **Searchable food catalog** — 1,242 packaged products by name or category, each with its ingredient list, nutrition snapshot, and a health read at a glance
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
| **Meal photo AI** | Google Gemini, **bring-your-own-key, browser-only** |
| **Deployment** | GitHub Pages (static `out/` export) |

`src/app/page.js` is the view router; screens live in `src/components/`, pure logic in `src/lib/`, reference data in `src/data/`. No backend to operate.

### A note on the Gemini key

The photo estimator needs a vision model, and this app is a static site published from a public repository — so there is **nowhere in it a shared API key could safely live**. Instead each person supplies their own free Gemini key. It is stored only in that browser's `localStorage`, and the photo is sent **directly from the browser to Google**: it never passes through any server, is never committed, and no other visitor can see or use it. `scripts/check-no-secrets.mjs` runs as part of the build and fails it if a key-shaped string ever appears in the source tree.

**The photo feature is entirely optional.** Every dish can be added by hand from the same 223-dish table, with identical calorie numbers, without a key.

### How the numbers are produced

The model is never asked how many calories something is. It is given Jaano's own dish list and constrained to pick from it, then answers only what a photograph can honestly support: which dish, roughly how much, and whether it looks home-cooked or restaurant-made. **Every nutrition figure is then computed deterministically** from `src/data/indianDishes.js` (per-serving values from IFCT 2017 against the standard household measures NIN uses — katori, roti, plate).

Because of that, estimates are always shown as a **range**, never a single number. Nobody can look at a bowl of dal and know its calories — how much oil went in is invisible — and the honest width of that uncertainty is roughly ±30% from a photo, narrowing to under ±10% if you build the dish from measured ingredients.

## Tests

```bash
npm test                      # 278 checks: conditions, meal stack, scrapers, secret scan
node scripts/verify-ui.mjs    # 53 real-browser checks at 1280px and 390px
```

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
│   ├── page.js              # View router + six-section navigation
│   ├── layout.js            # Root layout + metadata
│   └── globals.css          # Global styling
├── src/components/          # Screens (MealCamera, MealBuilder, DishBrowser, Trends, …)
├── src/lib/                 # Pure logic (mealEstimate, vision, trends, dataQuality, …)
├── src/data/                # indianDishes (223) · indianIngredients (91) · catalog access
├── public/data/             # catalog.json — 1,242 packaged products, fetched at boot
├── scripts/                 # Catalog builders, Tata harvest, tests, secret scan
├── next.config.mjs          # Static export config (basePath under a sub-path)
└── package.json
```

## Why I Built This

I grew up reading the back of food packets and realised most people — myself included — can't actually parse them. "No added MSG" sits next to three other glutamate sources; "made with real fruit" hides more sugar than a soft drink. The information needed to choose better is technically *on the label*, just buried and jargon-heavy.

I built Jaano with AI-assisted development to close that gap: take the raw ingredient and nutrition data and translate it into a verdict a regular shopper can act on in the aisle, plus a frictionless diary so healthier choices become a habit, not a one-off.

## Product Scope

### On data sources, and what is missing

Packaged-product data comes from [Open Food Facts](https://openfoodfacts.org) (ODbL), supplemented for Tata Consumer by its own published brand roster and by BigBasket (a Tata company) for real MRP. Coverage of Tata is measured against Tata's own portfolio rather than asserted: all 26 of its India-market brands are represented (`npm run tata:coverage`).

One finding is worth stating plainly, because it limits what this app can tell you: **Tata publishes no nutrition panel on any of its own websites**, and its listings on BigBasket carry one about 1% of the time. So a large share of Tata products here are shown as *"not enough label data"* — that is the truth about the available data, not an oversight, and those products are deliberately left unscored and never offered as a healthier swap.

Prices are labelled by provenance: **MRP** where a printed price was found, **est.** where it is derived from pack weight and a category rate. The two differ a lot — one masala estimated at ₹9 actually retails at ₹85 — which is why they are not shown as the same kind of number.

Open Food Facts data is crowd-sourced and incomplete — products with no published nutrition panel are marked *"not enough label data"* and deliberately left unscored rather than guessed at, and they are never offered as a healthier alternative. Prices are estimates. Cooked-dish values are reference figures for a typical preparation, not a measurement of anyone's cooking, which is why they are always presented as a range. Health guidance is educational and non-diagnostic.

## Live Demo

🔗 **[kartikeyjaiswal42-sudo.github.io/foodwise-india](https://kartikeyjaiswal42-sudo.github.io/foodwise-india/)**
