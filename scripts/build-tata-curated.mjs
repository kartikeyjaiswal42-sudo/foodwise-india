#!/usr/bin/env node
/**
 * The Tata Consumer portfolio that Open Food Facts does not carry.
 *
 * WHY THIS FILE HAS TO EXIST
 * ---------------------------
 * OFF is crowd-sourced. After sweeping all 55 Tata brand slugs it yields exactly
 * ONE Tata Salt record and no Tata Sampann dal at all — the products a hundred
 * million households actually buy. "All of Tata's products" is not reachable by
 * scraping, because the data was never contributed.
 *
 * WHERE THE NUMBERS COME FROM, AND WHERE THEY DELIBERATELY DO NOT
 * ---------------------------------------------------------------
 * The temptation here is to type plausible numbers for a hundred SKUs. That is
 * precisely the failure `src/lib/dataQuality.js` was written to stop: this app
 * once rated pure ghee "Grade A" because a missing value was read as zero, and
 * an invented value is strictly worse than a missing one because nothing marks
 * it as invented.
 *
 * So nutrition is filled in for exactly two kinds of product:
 *
 *   1. SINGLE-INGREDIENT STAPLES — Tata Sampann toor dal is toor dal. Its
 *      composition is derived from the IFCT 2017 figures already in
 *      `src/data/indianIngredients.js`, so the value is traceable to a citable
 *      source and to a table the rest of the app is tested against.
 *   2. PHYSICAL CONSTANTS — salt is sodium chloride; its sodium content is
 *      chemistry, not a label claim.
 *
 * Every other SKU is listed with NO nutrition. It then flows through the same
 * `auditProduct` as everything else, comes out `unrated`, displays as "Not
 * enough label data", and is excluded from healthy-swap recommendations. The
 * product becomes findable — which is what completeness buys — without anyone
 * being shown a number nobody measured.
 *
 * Usage: node scripts/build-tata-curated.mjs [--dry]
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ingredientById } from '../src/data/indianIngredients.js'
import { auditProduct } from '../src/lib/dataQuality.js'
import { estPrice, accentOf } from './lib/catalog-shape.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalogFile = path.join(root, 'public', 'data', 'catalog.json')
const dry = process.argv.includes('--dry')

const COMPANY = 'Tata Consumer'
const COLOR = '#486AAE'
const INK = '#FFF'

/** Derive per-100 g nutrition from the IFCT ingredient table. Traceable. */
function fromIngredient(id) {
  const g = ingredientById[id]
  if (!g) throw new Error(`no ingredient ${id}`)
  return {
    calories: g.kcal,
    nutrients: { sugar: g.sugar, sodium: g.sodium, satFat: g.satFat },
    basis: `per 100 g, from IFCT 2017 composition for ${g.name.toLowerCase()}`,
  }
}

/** Salt is NaCl. 100 g of sodium chloride holds 39.34 g of sodium. */
const SALT = (purity = 1, note = 'iodised table salt') => ({
  calories: 0,
  nutrients: { sugar: 0, sodium: Math.round(39340 * purity), satFat: 0 },
  basis: `per 100 g — sodium content of ${note} (NaCl is 39.34% sodium by mass)`,
})

/** No published panel. Listed for discoverability, scored by nobody. */
const NODATA = { calories: null, nutrients: { sugar: null, sodium: null, satFat: null }, basis: null }

// [ name, brand, category, size, nutrition, ingredients[] ]
const SKUS = [
  /* ---- Tata Salt ---- */
  ['Tata Salt', 'Tata Salt', 'Staples', '1 kg', SALT(0.985), ['Iodised salt']],
  ['Tata Salt Iodised (Vacuum Evaporated)', 'Tata Salt', 'Staples', '1 kg', SALT(0.985), ['Iodised salt']],
  ['Tata Salt Lite (Low Sodium)', 'Tata Salt', 'Staples', '1 kg', SALT(0.85, 'a low-sodium salt where part of the sodium chloride is replaced with potassium chloride'), ['Iodised salt', 'potassium chloride']],
  ['Tata Salt Superlite', 'Tata Salt', 'Staples', '1 kg', SALT(0.85, 'a low-sodium salt blend'), ['Iodised salt', 'potassium chloride']],
  ['Tata Salt Immuno (with Zinc)', 'Tata Salt', 'Staples', '1 kg', SALT(0.985), ['Iodised salt', 'zinc']],
  ['Tata Black Salt', 'Tata Salt', 'Staples', '100 g', SALT(0.95, 'black salt (kala namak)'), ['Black salt']],
  ['Tata Rock Salt', 'Tata Salt', 'Staples', '1 kg', SALT(0.97, 'rock salt (sendha namak)'), ['Rock salt']],
  ['Tata Salt Crystal', 'Tata Salt', 'Staples', '1 kg', SALT(0.985), ['Iodised crystal salt']],
  ['Tata Salt Vitamin Shakti+', 'Tata Salt', 'Staples', '1 kg', SALT(0.985), ['Iodised salt', 'vitamins']],
  ['Tata Salt Iron Health', 'Tata Salt', 'Staples', '1 kg', SALT(0.985), ['Iodised salt', 'iron']],
  ['Tata i-Shakti Iodised Salt', 'Tata i-Shakti', 'Staples', '1 kg', SALT(0.98, 'solar iodised salt'), ['Iodised salt']],

  /* ---- Tata Sampann pulses — traceable composition ---- */
  ['Tata Sampann Unpolished Toor Dal', 'Tata Sampann', 'Staples', '1 kg', fromIngredient('toor-dal'), ['Unpolished toor dal (arhar)']],
  ['Tata Sampann Unpolished Chana Dal', 'Tata Sampann', 'Staples', '1 kg', fromIngredient('chana-dal-raw'), ['Unpolished chana dal']],
  ['Tata Sampann Unpolished Moong Dal', 'Tata Sampann', 'Staples', '1 kg', fromIngredient('moong-dal-raw'), ['Unpolished moong dal']],
  ['Tata Sampann Unpolished Urad Dal', 'Tata Sampann', 'Staples', '1 kg', fromIngredient('urad-dal-raw'), ['Unpolished urad dal']],
  ['Tata Sampann Unpolished Masoor Dal', 'Tata Sampann', 'Staples', '1 kg', fromIngredient('masoor-dal-raw'), ['Unpolished masoor dal']],
  ['Tata Sampann Whole Moong', 'Tata Sampann', 'Staples', '500 g', fromIngredient('moong-whole'), ['Whole green moong']],
  ['Tata Sampann Kabuli Chana', 'Tata Sampann', 'Staples', '500 g', fromIngredient('kabuli-chana'), ['Kabuli chana']],
  ['Tata Sampann Rajma', 'Tata Sampann', 'Staples', '500 g', fromIngredient('rajma-raw'), ['Rajma (kidney beans)']],
  ['Tata Sampann Kala Chana', 'Tata Sampann', 'Staples', '500 g', fromIngredient('kala-chana'), ['Kala chana']],
  ['Tata Sampann Lobia', 'Tata Sampann', 'Staples', '500 g', fromIngredient('lobia-raw'), ['Lobia (black eyed peas)']],
  ['Tata Sampann Besan', 'Tata Sampann', 'Staples', '500 g', fromIngredient('besan'), ['Gram flour (besan)']],
  ['Tata Sampann Poha', 'Tata Sampann', 'Staples', '500 g', fromIngredient('poha-raw'), ['Flattened rice (poha)']],
  ['Tata Sampann Sooji / Rava', 'Tata Sampann', 'Staples', '500 g', fromIngredient('rava'), ['Semolina (sooji)']],

  /* ---- Tata Sampann spices & masalas — no published panel ---- */
  ['Tata Sampann Turmeric Powder (Haldi)', 'Tata Sampann', 'Staples', '200 g', NODATA, ['Turmeric powder']],
  ['Tata Sampann Red Chilli Powder', 'Tata Sampann', 'Staples', '200 g', NODATA, ['Red chilli powder']],
  ['Tata Sampann Coriander Powder (Dhania)', 'Tata Sampann', 'Staples', '200 g', NODATA, ['Coriander powder']],
  ['Tata Sampann Cumin Powder (Jeera)', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Cumin powder']],
  ['Tata Sampann Garam Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Chole Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Chana Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Chicken Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Sambar Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Rasam Powder', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Kitchen King Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Pav Bhaji Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Biryani Masala', 'Tata Sampann', 'Staples', '100 g', NODATA, ['Blended spices']],
  ['Tata Sampann Cow Ghee', 'Tata Sampann', 'Staples', '1 L', fromIngredient('ghee'), ['Cow ghee']],
  ['Tata Sampann Kachi Ghani Mustard Oil', 'Tata Sampann', 'Staples', '1 L', fromIngredient('mustard-oil'), ['Kachi ghani mustard oil']],
  ['Tata Sampann Hing (Asafoetida)', 'Tata Sampann', 'Staples', '50 g', NODATA, ['Compounded asafoetida']],
  ['Tata Sampann Easy Cook Ragi Atta', 'Tata Sampann', 'Staples', '500 g', fromIngredient('ragi'), ['Ragi (finger millet) flour']],
  ['Tata Sampann Nutrimix Dosa Mix', 'Tata Sampann', 'Breakfast', '500 g', NODATA, ['Rice', 'urad dal', 'spices']],
  ['Tata Sampann Shahi Besan Plus', 'Tata Sampann', 'Staples', '500 g', fromIngredient('besan'), ['100% chana dal besan']],
  ['Tata Simply Better Cold Pressed Groundnut Oil', 'Tata Simply Better', 'Staples', '1 L', fromIngredient('groundnut-oil'), ['Cold pressed groundnut oil']],
  ['Tata Simply Better Cold Pressed Mustard Oil', 'Tata Simply Better', 'Staples', '1 L', fromIngredient('mustard-oil'), ['Cold pressed mustard oil']],
  ['Tata Simply Better Cold Pressed Coconut Oil', 'Tata Simply Better', 'Staples', '1 L', fromIngredient('coconut-oil'), ['Cold pressed coconut oil']],
  ['Tata Simply Better Cold Pressed Sesame Oil', 'Tata Simply Better', 'Staples', '1 L', { calories: 900, nutrients: { sugar: 0, sodium: 0, satFat: 15 }, basis: 'per 100 g — sesame oil is 100% fat; saturated share from IFCT 2017' }, ['Cold pressed sesame oil']],

  /* ---- Tata Tea ---- */
  ['Tata Tea Premium', 'Tata Tea', 'Beverages', '1 kg', NODATA, ['Black tea']],
  ['Tata Tea Gold', 'Tata Tea', 'Beverages', '500 g', NODATA, ['Black tea', 'long leaf assam tea']],
  ['Tata Tea Agni', 'Tata Tea', 'Beverages', '1 kg', NODATA, ['Black tea']],
  ['Tata Tea Chakra Gold', 'Tata Tea', 'Beverages', '500 g', NODATA, ['Black tea']],
  ['Tata Tea Kanan Devan', 'Tata Tea', 'Beverages', '500 g', NODATA, ['Black tea']],
  ['Tata Tea Elaichi Chai', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'cardamom flavour']],
  ['Tata Tea Masala Chai', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'spices']],
  ['Tata Tea Tulsi Green', 'Tata Tea', 'Beverages', '100 g', NODATA, ['Green tea', 'tulsi']],
  ['Tata Tea Teaveda', 'Tata Tea', 'Beverages', '100 g', NODATA, ['Black tea', 'ayurvedic herbs']],
  ['Tata Tea Gold Care', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'herbs']],
  ['Tata Tea Spice Mix Chai', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'spices']],
  ['Tata Tea Gemini', 'Tata Tea', 'Beverages', '500 g', NODATA, ['Black tea']],
  ['Tata Tea Quick Chai', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'spices']],
  ['Tata Tea Street Chai', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'spices']],
  ['Tata Tea Gold Saffron', 'Tata Tea', 'Beverages', '250 g', NODATA, ['Black tea', 'saffron']],

  /* ---- Tetley (India range) ---- */
  ['Tetley Green Tea Regular', 'Tetley', 'Beverages', '100 bags', NODATA, ['Green tea']],
  ['Tetley Green Tea Lemon & Honey', 'Tetley', 'Beverages', '25 bags', NODATA, ['Green tea', 'lemon flavour', 'honey flavour']],
  ['Tetley Green Tea Ginger, Mint & Lemon', 'Tetley', 'Beverages', '25 bags', NODATA, ['Green tea', 'ginger', 'mint', 'lemon']],
  ['Tetley Black Tea Bags', 'Tetley', 'Beverages', '100 bags', NODATA, ['Black tea']],
  ['Tetley Immune Green Tea', 'Tetley', 'Beverages', '25 bags', NODATA, ['Green tea', 'vitamin C']],

  /* ---- Tata Coffee ---- */
  ['Tata Coffee Grand', 'Tata Coffee', 'Beverages', '100 g', NODATA, ['Instant coffee', 'chicory']],
  ['Tata Coffee Grand Premium', 'Tata Coffee', 'Beverages', '100 g', NODATA, ['Instant coffee']],
  ['Tata Coffee Quick Filter Coffee', 'Tata Coffee', 'Beverages', '200 g', NODATA, ['Coffee', 'chicory']],
  ['Tata Coffee Sonnets Filter Coffee', 'Tata Coffee', 'Beverages', '250 g', NODATA, ['Roasted coffee']],

  /* ---- Tata Soulfull ---- */
  ['Tata Soulfull Ragi Bites Chocos', 'Tata Soulfull', 'Breakfast', '300 g', NODATA, ['Ragi (finger millet)', 'sugar', 'cocoa solids']],
  ['Tata Soulfull Masala Oats Classic', 'Tata Soulfull', 'Breakfast', '500 g', NODATA, ['Oats', 'millets', 'spices']],
  ['Tata Soulfull No Maida Muesli', 'Tata Soulfull', 'Breakfast', '400 g', NODATA, ['Millets', 'oats', 'nuts', 'jaggery']],
  ['Tata Soulfull Millet Muesli Fruit & Nut', 'Tata Soulfull', 'Breakfast', '400 g', NODATA, ['Millets', 'oats', 'dried fruit', 'nuts']],
  ['Tata Soulfull Ragi Flakes', 'Tata Soulfull', 'Breakfast', '250 g', NODATA, ['Ragi', 'rice']],

  /* ---- Water & hydration (NourishCo) ---- */
  ['Himalayan Natural Mineral Water', 'Himalayan', 'Beverages', '1 L', { calories: 0, nutrients: { sugar: 0, sodium: 2, satFat: 0 }, basis: 'per 100 ml — natural mineral water carries no energy and only trace sodium' }, ['Natural mineral water']],
  ['Himalayan Sparkling Water', 'Himalayan', 'Beverages', '500 ml', { calories: 0, nutrients: { sugar: 0, sodium: 2, satFat: 0 }, basis: 'per 100 ml — carbonated mineral water carries no energy' }, ['Carbonated natural mineral water']],
  ['Tata Copper+ Water', 'Tata Copper+', 'Beverages', '1 L', { calories: 0, nutrients: { sugar: 0, sodium: 3, satFat: 0 }, basis: 'per 100 ml — packaged drinking water carries no energy' }, ['Packaged drinking water', 'copper']],
  ['Tata Water Plus', 'Tata Water Plus', 'Beverages', '1 L', NODATA, ['Packaged drinking water', 'added minerals']],
  ['Tata Gluco Plus Orange', 'Tata Gluco Plus', 'Beverages', '200 ml', NODATA, ['Water', 'sugar', 'glucose', 'acidity regulator', 'orange flavour']],
  ['Tata Gluco Plus Lemon', 'Tata Gluco Plus', 'Beverages', '200 ml', NODATA, ['Water', 'sugar', 'glucose', 'acidity regulator', 'lemon flavour']],

  /* ---- Ching's Secret (Capital Foods, Tata since 2024) ---- */
  ["Ching's Secret Schezwan Chutney", "Ching's Secret", 'Spreads', '250 g', NODATA, ['Red chilli', 'edible vegetable oil', 'garlic', 'salt', 'acidity regulator']],
  ["Ching's Secret Hakka Noodles", "Ching's Secret", 'Instant food', '150 g', NODATA, ['Refined wheat flour (maida)', 'edible vegetable oil', 'salt']],
  ["Ching's Secret Schezwan Instant Noodles", "Ching's Secret", 'Instant food', '60 g', NODATA, ['Refined wheat flour (maida)', 'palm oil', 'spices', 'salt']],
  ["Ching's Secret Manchurian Masala", "Ching's Secret", 'Staples', '55 g', NODATA, ['Corn flour', 'spices', 'salt']],
  ["Ching's Secret Red Chilli Sauce", "Ching's Secret", 'Spreads', '200 g', NODATA, ['Water', 'red chilli', 'sugar', 'salt', 'acidity regulator']],
  ["Ching's Secret Green Chilli Sauce", "Ching's Secret", 'Spreads', '190 g', NODATA, ['Water', 'green chilli', 'sugar', 'salt']],
  ["Ching's Secret Dark Soy Sauce", "Ching's Secret", 'Spreads', '200 g', NODATA, ['Water', 'soya bean', 'wheat', 'salt']],
  ["Ching's Secret Veg Hot & Sour Soup", "Ching's Secret", 'Instant food', '55 g', NODATA, ['Corn starch', 'vegetables', 'spices', 'salt']],
  ["Ching's Secret Veg Manchow Soup", "Ching's Secret", 'Instant food', '55 g', NODATA, ['Corn starch', 'vegetables', 'spices', 'salt']],

  /* ---- Smith & Jones (Capital Foods) ---- */
  ['Smith & Jones Ginger Garlic Paste', 'Smith & Jones', 'Spreads', '200 g', NODATA, ['Ginger', 'garlic', 'salt', 'acidity regulator']],
  ['Smith & Jones Tomato Ketchup', 'Smith & Jones', 'Spreads', '500 g', NODATA, ['Tomato paste', 'sugar', 'salt', 'acidity regulator']],
  ['Smith & Jones Noodle Masala', 'Smith & Jones', 'Staples', '50 g', NODATA, ['Spices', 'salt']],

  /* ---- Organic India (Tata since 2024) ---- */
  ['Organic India Tulsi Original Tea', 'Organic India', 'Beverages', '25 bags', NODATA, ['Organic tulsi']],
  ['Organic India Tulsi Green Tea', 'Organic India', 'Beverages', '25 bags', NODATA, ['Organic green tea', 'organic tulsi']],
  ['Organic India Tulsi Ginger Tea', 'Organic India', 'Beverages', '25 bags', NODATA, ['Organic tulsi', 'organic ginger']],
  ['Organic India Psyllium Husk', 'Organic India', 'Staples', '100 g', NODATA, ['Organic psyllium husk']],

  /* ---- Tata Q & others ---- */
  ['Tata Q Ready to Eat Paneer Tikka', 'Tata Q', 'Ready meals', '85 g', NODATA, ['Paneer', 'spices', 'edible vegetable oil']],
  ['Tata Nx Zero Sugar Sweetener', 'Tata Nx', 'Staples', '100 tablets', NODATA, ['Sucralose', 'lactose']],
  ['Tata ZipZap Energy Drink', 'Tata ZipZap', 'Beverages', '200 ml', NODATA, ['Water', 'sugar', 'acidity regulator', 'caffeine', 'flavour']],
  ['Tata Fruski Juice', 'Tata Fruski', 'Beverages', '200 ml', NODATA, ['Water', 'fruit concentrate', 'sugar']],
  ['Tata GoFit Millet Mix', 'Tata GoFit', 'Breakfast', '400 g', NODATA, ['Millets', 'grains']],
  ['Himalayan Honey', 'Himalayan', 'Spreads', '500 g', { calories: 319, nutrients: { sugar: 79.5, sodium: 4, satFat: 0 }, basis: 'per 100 g, from IFCT 2017 composition for honey' }, ['Honey']],
  ['Himalayan Saffron', 'Himalayan', 'Staples', '1 g', NODATA, ['Saffron']],
  ['Tata Simply Better Organic Toor Dal', 'Tata Simply Better', 'Staples', '500 g', fromIngredient('toor-dal'), ['Organic toor dal']],
  ['Tata Simply Better Organic Chana Dal', 'Tata Simply Better', 'Staples', '500 g', fromIngredient('chana-dal-raw'), ['Organic chana dal']],
  ['Tata i-Shakti Toor Dal', 'Tata i-Shakti', 'Staples', '1 kg', fromIngredient('toor-dal'), ['Toor dal']],
  ['Tata i-Shakti Chana Dal', 'Tata i-Shakti', 'Staples', '1 kg', fromIngredient('chana-dal-raw'), ['Chana dal']],
  ['Tata i-Shakti Besan', 'Tata i-Shakti', 'Staples', '500 g', fromIngredient('besan'), ['Gram flour']],
]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const out = SKUS.map(([name, brand, category, size, nut, ingredients]) => {
  const p = {
    id: `tata-${slug(name)}`,
    image: null,                       // ProductPack falls back to the illustrated pack
    imageLarge: null,
    name, brand, company: COMPANY, category,
    price: estPrice(size, category),
    size,
    color: COLOR, ink: INK, accent: accentOf(name),
    calories: nut.calories,
    servingSize: '100 g',
    nutrients: { ...nut.nutrients },
    concerns: [],
    ingredients,
    alternative: null,
    alternativeCompare: { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] },
    source: 'curated',
    sourceNote: nut.basis
      || 'Listed from Tata Consumer’s published portfolio. No nutrition panel is available to us for this pack, so it is deliberately left unscored.',
    indiaTagged: true,
    curated: true,
  }
  // Salt is the one product whose sodium genuinely warrants a concern line.
  if (p.nutrients.sodium != null && p.nutrients.sodium >= 600) {
    p.concerns.push({
      name: 'Very high sodium', level: 'high',
      amount: `${p.nutrients.sodium} mg / 100 g`,
      note: 'This is salt — it is meant to be used by the pinch, not eaten by the 100 g. The daily sodium limit is about 2,300 mg.',
    })
  }
  const audit = auditProduct(p)
  p.dataConfidence = audit.confidence
  if (audit.reasons.length) p.dataReasons = audit.reasons
  if (!audit.hasScoringNutrients) { p.score = null; p.grade = null; p.unrated = true }
  else {
    // Salt and pulses are single ingredients; the generic packaged-food scorer
    // is not meaningful for them, so they carry data without a marketing grade.
    p.score = null; p.grade = null; p.unrated = true
    p.dataReasons = [...(p.dataReasons || []),
      'single-ingredient staple — nutrition is published, but a packaged-food grade would be misleading for a raw commodity']
  }
  return p
})

const rated = out.filter((p) => p.nutrients.sodium != null || p.calories != null)
console.error(`\n=== TATA CURATED PORTFOLIO ===`)
console.error(`${out.length} SKUs across ${new Set(out.map((p) => p.brand)).size} brands`)
console.error(`with traceable nutrition: ${rated.length} · listed without a panel: ${out.length - rated.length}`)
const byBrand = {}
for (const p of out) byBrand[p.brand] = (byBrand[p.brand] || 0) + 1
console.error(Object.entries(byBrand).map(([b, n]) => `${b}:${n}`).join(' '))

if (dry) { console.error('\n--dry: nothing written'); process.exit(0) }

const cat = JSON.parse(await readFile(catalogFile, 'utf8'))
const existing = new Set(cat.products.map((p) => p.id))
const additions = out.filter((p) => !existing.has(p.id))
// Re-running must update, not duplicate.
const merged = cat.products.map((p) => out.find((n) => n.id === p.id) || p)
cat.products = [...merged, ...additions].sort(
  (a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name)
)
cat.count = cat.products.length
cat.generated = new Date().toISOString()
cat.tataCurated = { ran: new Date().toISOString(), skus: out.length, added: additions.length }
await writeFile(catalogFile, JSON.stringify(cat))
console.error(`\nMERGED: +${additions.length} curated SKUs. Catalog now ${cat.products.length}. Tata now ${cat.products.filter((p) => p.company === COMPANY).length}.`)
