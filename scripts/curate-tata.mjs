#!/usr/bin/env node
/**
 * Turn the raw Tata harvest into catalog products, and merge them in.
 *
 * THE OWNERSHIP PROBLEM THIS SOLVES
 * ----------------------------------
 * Searching Open Food Facts for `starbucks` returns 1,286 records — Starbucks
 * Corporation's worldwide range. Tata Starbucks is a 50:50 India-only joint
 * venture, so filing a Seattle-market Frappuccino under "Tata Consumer" would be
 * simply false, and the user asked for Tata's products, not for a big number.
 *
 * So brands are split into two lists. UNAMBIGUOUS brands (Tetley, Tata Sampann,
 * Soulfull, Ching's Secret, Organic India…) are wholly Tata-owned wherever they
 * are sold, and every record is accepted. AMBIGUOUS brands (`starbucks`,
 * `tulsi`, `gemini`, and the bare `tata` token, which matches unrelated
 * companies) are accepted ONLY with an India country tag, which is the boundary
 * of what Tata actually controls.
 *
 * Everything written here carries `sourceNote` recording which rule let it in,
 * so the decision is auditable rather than buried.
 *
 * Usage: node scripts/curate-tata.mjs [--dry]
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  cleanName, goodName, variantKey, imageVariants, categoryOf, nutrientsOf,
  scoreGrade, ingredientsOf, concernsOf, estPrice, accentOf, titleCase, num,
} from './lib/catalog-shape.mjs'
import { auditProduct } from '../src/lib/dataQuality.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const harvestFile = path.join(root, 'scripts', 'out', 'tata-off.json')
const catalogFile = path.join(root, 'public', 'data', 'catalog.json')
const dry = process.argv.includes('--dry')

const COMPANY = 'Tata Consumer'
const COLOR = '#486AAE'
const INK = '#FFF'

/**
 * Tata brands sold essentially only in India. An OFF record for one of these is
 * an India pack whether or not a contributor remembered to tag the country, so
 * these are accepted on any record.
 */
const INDIA_CENTRIC = new Set([
  'tata-tea', 'tata-tea-premium', 'tata-tea-gold', 'tata-tea-agni', 'tata-agni',
  'chakra-gold', 'kanan-devan', 'tata-tea-elaichi', 'tata-tea-masala-chai',
  'tata-tea-tulsi', 'teaveda',
  'tata-coffee', 'tata-coffee-grand', 'sonnets',
  'tata-salt', 'tata-salt-lite', 'tata-black-salt', 'tata-rock-salt', 'tata-salt-immuno',
  'tata-sampann', 'tata-sampann-yumside', 'tata-simply-better',
  'tata-soulfull', 'soulfull', 'soulfull-ragi-bites',
  'himalayan', 'himalayan-natural-mineral-water', 'tata-copper', 'tata-water-plus',
  'tata-gluco-plus', 'nourishco', 'tata-q', 'tata-nx', 'tata-nx-zero-sugar',
  'ching-s-secret', 'chings-secret', 'ching-s', 'smith-jones', 'smith-and-jones',
  'organic-india',
])

/**
 * Tata-owned but sold mostly ABROAD. Tetley is Tata's, but a Tetley record
 * tagged only to Canada describes a Canadian pack with a Canadian recipe — and
 * this app tells people what is on Indian shelves. Adding 138 UK tea boxes would
 * raise the product count and lower the product's truthfulness, so these need an
 * India tag like any other foreign brand.
 */
const GLOBAL_TATA = new Set([
  'tetley', 'tetley-green-tea', 'teapigs', 'vitax', 'good-earth', 'good-earth-tea',
  'eight-o-clock', 'eight-o-clock-coffee',
])

/**
 * Brands where the slug is broader than Tata's actual ownership.
 * India tag required.
 *   starbucks  — Tata Starbucks is an India-only JV
 *   tulsi      — a generic word; only Organic India's line is Tata's
 *   gemini     — Tata's Gemini is an India tea/oil brand; the slug catches others
 *   tata*      — the bare token matches unrelated "Tata" businesses abroad
 */
const INDIA_ONLY = new Set(['starbucks', 'tata-starbucks', 'tulsi', 'gemini', 'tata', 'tata-consumer', 'tata-consumer-products'])

/**
 * Canonical spelling per brand.
 *
 * OFF contributors type the brand free-hand, so one brand arrives as "Tetley",
 * "tetley" and "TETLEY". Left alone, the Companies screen lists the same brand
 * three times and each one looks like a smaller company than it is.
 */
const BRAND_CANON = {
  tetley: 'Tetley', teapigs: 'Teapigs', tata: 'Tata', 'tata tea': 'Tata Tea',
  'tata sampann': 'Tata Sampann', 'tata salt': 'Tata Salt', 'tata soulfull': 'Tata Soulfull',
  soulfull: 'Tata Soulfull', "ching's": "Ching's Secret", "ching's secret": "Ching's Secret",
  chings: "Ching's Secret", "chings secret": "Ching's Secret",
  'organic india': 'Organic India', 'good earth': 'Good Earth', vitax: 'Vitax',
  "eight o'clock": "Eight O'Clock Coffee", "eight o'clock coffee": "Eight O'Clock Coffee",
  'smith & jones': 'Smith & Jones', 'smith and jones': 'Smith & Jones',
  'tata global beverages': 'Tata Consumer Products', 'tata consumer': 'Tata Consumer Products',
  'simply better': 'Tata Simply Better', 'tata simply better': 'Tata Simply Better',
  tulsi: 'Organic India', 'tata coffee': 'Tata Coffee', starbucks: 'Tata Starbucks',
  'i-shakti': 'Tata i-Shakti', ishakti: 'Tata i-Shakti', 'tata i-shakti': 'Tata i-Shakti',
  'tata tea premium': 'Tata Tea', 'tata tea gold': 'Tata Tea', 'tata tea agni': 'Tata Tea',
  himalayan: 'Himalayan', 'tata q': 'Tata Q', 'tata gluco plus': 'Tata Gluco Plus',
}
const canonBrand = (raw) => {
  const k = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return BRAND_CANON[k] || titleCase(raw)
}

/**
 * Category fallback for records with no `categories_tags`.
 * 40% of the Tata harvest carries no category at all, and dropping every one of
 * them into "Other" makes the whole company look uncategorised. The brand and
 * the product name are enough to place tea, dal and masala correctly.
 */
function categoryFallback(name, brand) {
  const t = `${name} ${brand}`.toLowerCase()
  const has = (...k) => k.some((x) => t.includes(x))
  if (has('tea', 'chai', 'coffee', 'kaapi', 'water', 'juice', 'drink', 'beverage', 'latte', 'brew')) return 'Beverages'
  if (has('salt', 'dal', 'daal', 'atta', 'besan', 'masala', 'haldi', 'turmeric', 'chilli', 'jeera', 'rice', 'poha', 'sugar', 'spice', 'powder', 'flour')) return 'Staples'
  if (has('noodle', 'hakka', 'pasta', 'soup', 'instant')) return 'Instant food'
  if (has('sauce', 'chutney', 'ketchup', 'schezwan', 'paste', 'honey', 'jam')) return 'Spreads'
  if (has('muesli', 'oats', 'ragi bites', 'flakes', 'breakfast', 'granola')) return 'Breakfast'
  if (has('biscuit', 'cookie')) return 'Biscuits'
  if (has('curry', 'ready', 'meal', 'gravy')) return 'Ready meals'
  return 'Other'
}

const state = JSON.parse(await readFile(harvestFile, 'utf8'))
const records = Object.values(state.records)

const stats = { seen: records.length, acceptedUnambiguous: 0, acceptedIndia: 0, rejectedForeign: 0, rejectedName: 0, rejectedDup: 0, rejectedUnknownBrand: 0 }

const seenKey = new Set()
const out = []

for (const p of records) {
  const slug = p._brandSlug
  const isIndia = (p.countries_tags || []).includes('en:india')

  let rule
  if (INDIA_CENTRIC.has(slug)) { rule = `brand "${slug}" is a Tata brand sold in India` }
  else if (GLOBAL_TATA.has(slug) || INDIA_ONLY.has(slug)) {
    if (!isIndia) { stats.rejectedForeign++; continue }
    rule = `brand "${slug}" is Tata-owned; this record accepted because it is tagged India`
  } else { stats.rejectedUnknownBrand++; continue }

  const name = cleanName(p)
  const brandsList = String(p.brands || '').split(',').map((b) => b.trim()).filter(Boolean)
  // Prefer whichever declared brand actually resolves to a Tata brand; some
  // records lead with the retailer that listed the product, not its maker.
  const brandName = brandsList.find((b) => BRAND_CANON[b.toLowerCase().replace(/\s+/g, ' ')])
    || brandsList.find((b) => /tata|tetley|ching|soulfull|sampann|organic india|himalayan|shakti/i.test(b))
    || brandsList[0] || ''
  if (!name || !brandName || !goodName(name, brandName)) { stats.rejectedName++; continue }

  const key = variantKey(name, brandName)
  if (seenKey.has(key)) { stats.rejectedDup++; continue }
  seenKey.add(key)

  let category = categoryOf(p.categories_tags)
  if (category === 'Other') category = categoryFallback(name, brandName)
  const nutr = nutrientsOf(p.nutriments)
  const { score, grade } = scoreGrade(p, nutr)
  const img = p.image_front_url || p.image_front_small_url
  const { small, large } = img ? imageVariants(img) : { small: null, large: null }

  const product = {
    id: `off-${p.code}`,
    image: small,
    imageLarge: large,
    name,
    brand: canonBrand(brandName),
    company: COMPANY,
    category,
    price: estPrice(p.quantity, category),
    size: (p.quantity || '1 pack').trim(),
    score, grade,
    color: COLOR, ink: INK, accent: accentOf(name),
    calories: Math.round(num(p.nutriments?.['energy-kcal_100g'])) || 0,
    servingSize: '100 g',
    nutrients: nutr,
    concerns: concernsOf(nutr, p.additives_tags || []),
    ingredients: ingredientsOf(p),
    alternative: null,
    alternativeCompare: { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] },
    source: 'openfoodfacts',
    sourceNote: rule,
    // The catalog is presented as India-market. A Tetley record tagged to the UK
    // is the same brand but not necessarily the same recipe, and saying so is
    // cheaper than being quietly wrong about a label.
    markets: (p.countries_tags || []).map((c) => c.replace('en:', '')).slice(0, 6),
    indiaTagged: isIndia,
  }

  if (INDIA_CENTRIC.has(slug)) stats.acceptedUnambiguous++
  else stats.acceptedIndia++
  out.push(product)
}

/* ---- apply the same honesty audit the rest of the catalog gets ---------- */
for (const p of out) {
  const audit = auditProduct(p)
  p.dataConfidence = audit.confidence
  if (audit.reasons.length) p.dataReasons = audit.reasons
  if (!audit.hasScoringNutrients) { p.score = null; p.grade = null; p.unrated = true }
}

console.error('\n=== TATA CURATION ===')
console.error(JSON.stringify(stats, null, 1))
console.error(`accepted ${out.length} products`)
const byCat = {}
for (const p of out) byCat[p.category] = (byCat[p.category] || 0) + 1
console.error('by category:', JSON.stringify(byCat))
const byBrand = {}
for (const p of out) byBrand[p.brand] = (byBrand[p.brand] || 0) + 1
console.error('brands:', Object.entries(byBrand).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([b, n]) => `${b}:${n}`).join(' '))
console.error('india-tagged:', out.filter((p) => p.indiaTagged).length, '| with photo:', out.filter((p) => p.image).length)
console.error('rated:', out.filter((p) => !p.unrated).length, '| unrated:', out.filter((p) => p.unrated).length)

if (dry) { console.error('\n--dry: nothing written'); process.exit(0) }

/* ---- merge into the catalog -------------------------------------------- */
const cat = JSON.parse(await readFile(catalogFile, 'utf8'))
const products = cat.products

const before = products.filter((p) => p.company === COMPANY).length
const keptIds = new Set(out.map((p) => p.id))

// Existing Tata rows that the harvest did NOT return are KEPT, not deleted. The
// harvest is brand-slug driven and OFF's tags are crowd-sourced, so a slug that
// stops matching is far more likely than a product ceasing to exist. Deleting on
// absence would make the catalog shrink a little on every run.
const merged = products.map((p) => {
  if (p.company !== COMPANY) return p
  const fresh = out.find((n) => n.id === p.id)
  return fresh ? { ...p, ...fresh } : p
})
const existingIds = new Set(products.map((p) => p.id))
const additions = out.filter((p) => !existingIds.has(p.id))
const final = [...merged, ...additions]

final.sort((a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name))

cat.products = final
cat.count = final.length
cat.generated = new Date().toISOString()
cat.tataCuration = {
  ran: new Date().toISOString(),
  accepted: out.length, added: additions.length,
  rejectedForeign: stats.rejectedForeign,
}

await writeFile(catalogFile, JSON.stringify(cat))
const after = final.filter((p) => p.company === COMPANY).length
console.error(`\nMERGED: Tata ${before} -> ${after} (+${additions.length} new). Catalog ${products.length} -> ${final.length}.`)
