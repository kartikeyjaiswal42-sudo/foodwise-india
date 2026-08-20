#!/usr/bin/env node
/**
 * Fold the BigBasket scrape into the catalog.
 *
 * WHAT THIS IS ACTUALLY FOR — read before touching the matching rules.
 *
 * The catalog's `price` field is an ESTIMATE: `estPrice()` multiplies a pack
 * weight by a per-kilo rate guessed from the category, and the UI labels it
 * "est. cost" because that is all it ever was. BigBasket publishes the real MRP.
 * Replacing a guess with a printed price is the single most valuable thing this
 * scrape delivers, and it is the only field here that overwrites existing data.
 *
 * NUTRITION IS NOT THE PRIZE, MEASURED: 1% of scraped Tata variants carry a
 * panel (Tata does not supply them to its own retailer's listings). Panels are
 * taken when present and nothing is inferred when absent.
 *
 * IMAGES ARE NOT TAKEN. Product facts are data; BigBasket's photography is
 * copyrighted work and hotlinking a commercial CDN from a public GitHub Pages
 * site is neither licensed nor stable. The OFF images used elsewhere are fine
 * because they are ODbL.
 *
 * MATCHING IS DELIBERATELY CONSERVATIVE. A wrong match writes a wrong price onto
 * a real product, which is worse than leaving an honest estimate in place, so a
 * match needs the same brand AND ≥70% name-token overlap. Everything unmatched
 * becomes a new product rather than being forced onto an existing row.
 *
 * Usage: node scripts/merge-bigbasket.mjs [--dry]
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditProduct } from '../src/lib/dataQuality.js'
import { accentOf } from './lib/catalog-shape.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bbFile = path.join(root, 'scripts', 'out', 'bigbasket-tata.json')
const catalogFile = path.join(root, 'public', 'data', 'catalog.json')
const dry = process.argv.includes('--dry')

if (!existsSync(bbFile)) { console.error('No scrape. Run: node scripts/scrape-bigbasket-tata.mjs'); process.exit(1) }

const COMPANY = 'Tata Consumer'
const COLOR = '#486AAE'
const INK = '#FFF'

const STOP = new Set(['tata', 'the', 'and', 'with', 'for', 'pack', 'pouch', 'box', 'bottle', 'jar', 'refill'])
// Deduped on purpose. "Toor Dal/Arhar Dal" yields "dal" twice, and counting the
// repeat let the containment score exceed 1.0 — which sailed past the 0.8
// threshold on names that barely matched.
const tokens = (s) => [...new Set(
  String(s).toLowerCase().split(/[^a-z0-9+]+/).filter((t) => t.length > 2 && !STOP.has(t))
)]

/** A combo/multipack is a different product from the thing inside it. */
const isCombo = (s) => /combo|pack of|multipack|\bpcs\b|\bcombi\b|assorted|value pack|\+\s*\d/i.test(String(s))

/** Pack size in grams/ml, or null when it cannot be read. */
function packGrams(s) {
  const m = String(s || '').match(/([\d.]+)\s*(kg|g|gm|gms|l|ltr|ml)\b/i)
  if (!m) return null
  const v = parseFloat(m[1]); const u = m[2].toLowerCase()
  if (!isFinite(v) || v <= 0) return null
  return (u === 'kg' || u === 'l' || u === 'ltr') ? v * 1000 : v
}
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

/** Collapse "Masoor Dal - Whole, Unpolished" 1 kg / 500 g into one product. */
const variantKey = (brand, name) => norm(brand) + '::' + tokens(name).sort().join('-')

/**
 * Words that make two similar names DIFFERENT PRODUCTS.
 *
 * "Masoor Dal Whole" and "Masoor Dal" share most of their tokens but are not
 * the same SKU, and neither are the organic and non-organic versions of a dal,
 * or Tata Salt and Tata Salt Lite. Token overlap alone happily conflates them —
 * and the consequence is a real printed price written onto the wrong product,
 * which is worse than the honest estimate it replaced. So if either name claims
 * a discriminator the other does not, the match is refused.
 */
const DISCRIMINATORS = [
  'whole', 'split', 'organic', 'unpolished', 'polished', 'lite', 'low', 'zero',
  'premium', 'gold', 'classic', 'instant', 'green', 'black', 'rock', 'crystal',
  'iodised', 'iodized', 'decaf', 'sugar', 'salted', 'roasted', 'raw', 'fine',
  'coarse', 'powder', 'crushed', 'immuno', 'plus', 'pink', 'chilka', 'small',
  'malka', 'kashmiri', 'arabian', 'california', 'luxe', 'losodium', 'crusher',
  'sendha', 'himalayan',
]
function discriminatorsClash(a, b) {
  const at = new Set(tokens(a))
  const bt = new Set(tokens(b))
  for (const d of DISCRIMINATORS) {
    if (at.has(d) !== bt.has(d)) return true
  }
  return false
}

const bb = JSON.parse(await readFile(bbFile, 'utf8'))
const records = Object.values(bb.records || {})
if (!records.length) { console.error('scrape holds no records yet'); process.exit(1) }

/* ---- collapse pack-size variants --------------------------------------- */
const groups = new Map()
for (const r of records) {
  if (!r.name || !r.brand) continue
  const k = variantKey(r.brand, r.name)
  const g = groups.get(k)
  // Keep the variant with a nutrition panel if any has one; otherwise the
  // cheapest real pack, which is the one a shopper most likely buys.
  if (!g) groups.set(k, r)
  else if ((r.nutrition && !g.nutrition) || (!!r.nutrition === !!g.nutrition && (r.mrp || 1e9) < (g.mrp || 1e9))) {
    groups.set(k, r)
  }
}
const collapsed = [...groups.values()]

/* ---- load catalog ------------------------------------------------------- */
const cat = JSON.parse(await readFile(catalogFile, 'utf8'))
const tata = cat.products.filter((p) => p.company === COMPANY)
// The scrape is resumable and this merge is expected to be re-run as it fills
// in. Without this, every re-run would push a second copy of every unmatched
// SKU and the catalog would grow by ~150 duplicates each time.
const byId = new Map(cat.products.map((p) => [p.id, p]))

/**
 * A brand page's "related products" rail can carry other companies' goods, so
 * the scrape picked up Planet Ayurveda and Nutriwish. Filing a third party's
 * product under "Tata Consumer" would be simply false — the same ownership
 * discipline the OFF curation pass applies, enforced again here because the
 * data arrives by a different route.
 */
const TATA_BRAND = /^(tata|tetley|ching|smith\s*&?\s*jones|organic\s*india|himalayan|soulfull|sampann|i-?shakti|teapigs|good\s*earth|vitax|eight\s*o)/i
const foreign = collapsed.filter((r) => !TATA_BRAND.test(r.brand))
if (foreign.length) {
  console.error(`rejected ${foreign.length} non-Tata records: ${[...new Set(foreign.map((r) => r.brand))].join(', ')}`)
}
for (let i = collapsed.length - 1; i >= 0; i--) {
  if (!TATA_BRAND.test(collapsed[i].brand)) collapsed.splice(i, 1)
}

const stats = { scraped: records.length, rejectedNonTata: foreign.length, collapsed: collapsed.length, pricedExisting: 0, nutritionAdded: 0, added: 0, skipped: 0 }

/* ---- match & update ----------------------------------------------------- */
const matchedIds = new Set()
const pricedBy = new Map()
for (const r of collapsed) {
  const rTok = tokens(r.name)
  if (!rTok.length) { stats.skipped++; continue }

  let best = null
  let bestScore = 0
  for (const p of tata) {
    if (norm(p.brand) !== norm(r.brand)) continue
    const pTok = tokens(p.name)
    if (!pTok.length) continue
    if (discriminatorsClash(r.name, p.name)) continue
    const hits = rTok.filter((t) => pTok.includes(t)).length
    // A one-token name matches anything. "Tata Salt" reduces to just ["salt"]
    // once the brand word is dropped, so BigBasket's "Pink Salt For Everyday
    // Cooking" scored a perfect 1.00 against it and would have written pink
    // salt's ₹80 onto plain Tata Salt. Two shared tokens minimum.
    if (hits < 2 || Math.min(rTok.length, pTok.length) < 2) continue
    // Containment, not Jaccard: BigBasket writes "Masoor Dal/Mysore Bele -
    // Whole, Unpolished" where we write "Tata Sampann Unpolished Masoor Dal".
    // Scoring against the longer name punishes the retailer's regional aliases
    // and would miss almost every genuine match.
    const score = hits / Math.min(rTok.length, pTok.length)
    if (score > bestScore) { bestScore = score; best = p }
  }

  // A combo pack is not the product it contains. Matching one onto a single dal
  // would have written a two-pack's ₹438 onto a 1 kg bag.
  if (best && bestScore >= 0.8 && isCombo(r.name)) { best = null }

  if (best && bestScore >= 0.8) {
    // Several BigBasket SKUs can land on one catalog row (a plain 100 g black
    // salt at ₹32 and a crusher-bottle version at ₹130). Last-write-wins would
    // pick by iteration order, so keep the CHEAPEST — that is the base pack a
    // shopper is most likely holding, and it is the conservative choice when
    // the row cannot distinguish them.
    const prev = pricedBy.get(best.id)
    if (prev != null && r.mrp != null && r.mrp >= prev) { stats.priceKeptCheaper = (stats.priceKeptCheaper || 0) + 1; continue }
    if (r.mrp != null) pricedBy.set(best.id, r.mrp)
    matchedIds.add(best.id)
    // A price is only true for the pack it was printed on. BigBasket's 2 kg
    // listing at ₹398 says nothing about our 1 kg row, so the MRP is applied
    // ONLY when both sizes parse and agree within 5%. When they do not, the
    // honest estimate stays rather than being replaced by a confident wrong
    // number — the whole point of this merge is to stop guessing.
    const bbG = packGrams(r.size)
    const ourG = packGrams(best.size)
    const sizeOk = bbG != null && ourG != null && Math.abs(bbG - ourG) / ourG <= 0.05
    // Where OUR size is unknown (curated rows often just say "1 pack"), adopt
    // BigBasket's size and price TOGETHER. A price is only meaningful attached
    // to the pack it was printed on, so the two must move as a pair or not at
    // all — taking the price alone would attach a real number to an unknown pack.
    const adoptSize = bbG != null && ourG == null
    if (r.mrp && !sizeOk && !adoptSize) {
      stats.priceSkippedSize = (stats.priceSkippedSize || 0) + 1
    }
    if (r.mrp && adoptSize) {
      best.size = r.size
      stats.sizeAdopted = (stats.sizeAdopted || 0) + 1
    }
    if (r.mrp && (sizeOk || adoptSize)) {
      best.price = Math.round(r.mrp)
      best.priceSource = 'bigbasket-mrp'
      best.priceNote = 'Actual MRP listed on BigBasket, not an estimate.'
      stats.pricedExisting++
    }
    // Fill nutrition ONLY where we had none and the panel is per-100 g.
    if (r.nutrition?.per100 && best.unrated) {
      const n = r.nutrition
      if (n.calories != null || n.sugar != null || n.sodium != null || n.satFat != null) {
        best.calories = n.calories ?? best.calories
        best.nutrients = {
          sugar: n.sugar ?? best.nutrients?.sugar ?? null,
          sodium: n.sodium ?? best.nutrients?.sodium ?? null,
          satFat: n.satFat ?? best.nutrients?.satFat ?? null,
        }
        best.sourceNote = `Nutrition panel published on BigBasket (${n.basis}).`
        stats.nutritionAdded++
      }
    }
    if (r.ingredients?.length && !(best.ingredients || []).length) best.ingredients = r.ingredients
    continue
  }

  /* ---- new product ------------------------------------------------------ */
  const n = r.nutrition?.per100 ? r.nutrition : null
  const p = {
    id: `bb-${r.sku}`,
    image: null,                 // deliberately not hotlinked — see header
    imageLarge: null,
    name: r.name,
    brand: r.brand,
    company: COMPANY,
    category: mapCategory(r),
    price: r.mrp ? Math.round(r.mrp) : 0,
    priceSource: r.mrp ? 'bigbasket-mrp' : 'unknown',
    size: r.size || '1 pack',
    color: COLOR, ink: INK, accent: accentOf(r.name),
    calories: n?.calories ?? null,
    servingSize: '100 g',
    nutrients: { sugar: n?.sugar ?? null, sodium: n?.sodium ?? null, satFat: n?.satFat ?? null },
    concerns: [],
    ingredients: r.ingredients || [],
    alternative: null,
    alternativeCompare: { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] },
    source: 'bigbasket',
    sourceNote: n
      ? `Listed on BigBasket (a Tata company); nutrition panel as published (${n.basis}).`
      : 'Listed on BigBasket (a Tata company). No nutrition panel is published for this pack, so it is deliberately left unscored.',
    indiaTagged: true,
  }
  const audit = auditProduct(p)
  p.dataConfidence = audit.confidence
  if (audit.reasons.length) p.dataReasons = audit.reasons
  if (!audit.hasScoringNutrients) { p.score = null; p.grade = null; p.unrated = true }

  const existing = byId.get(p.id)
  if (existing) {
    Object.assign(existing, p)
    stats.updated = (stats.updated || 0) + 1
  } else {
    cat.products.push(p)
    byId.set(p.id, p)
    stats.added++
  }
}

function mapCategory(r) {
  const t = `${r.categoryLeaf || ''} ${r.categoryTop || ''} ${r.name}`.toLowerCase()
  const has = (...k) => k.some((x) => t.includes(x))
  if (has('tea', 'coffee', 'water', 'juice', 'drink', 'beverage')) return 'Beverages'
  if (has('noodle', 'pasta', 'soup', 'instant', 'hakka')) return 'Instant food'
  if (has('sauce', 'chutney', 'ketchup', 'jam', 'honey', 'spread', 'paste')) return 'Spreads'
  if (has('muesli', 'oats', 'flakes', 'breakfast', 'cereal')) return 'Breakfast'
  if (has('biscuit', 'cookie')) return 'Biscuits'
  if (has('dal', 'salt', 'besan', 'masala', 'spice', 'atta', 'flour', 'rice', 'poha', 'oil', 'ghee', 'sugar', 'pulse', 'dry fruit')) return 'Staples'
  if (has('ready', 'meal', 'curry')) return 'Ready meals'
  if (has('snack', 'namkeen', 'chips')) return 'Snacks'
  return 'Other'
}

console.error('\n=== BIGBASKET MERGE ===')
console.error(JSON.stringify(stats, null, 1))
const priced = cat.products.filter((p) => p.company === COMPANY && p.priceSource === 'bigbasket-mrp').length
console.error(`Tata products with a REAL MRP: ${priced}`)
console.error(`Tata total: ${cat.products.filter((p) => p.company === COMPANY).length}`)

if (dry) { console.error('\n--dry: nothing written'); process.exit(0) }

cat.products.sort((a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name))
cat.count = cat.products.length
cat.generated = new Date().toISOString()
cat.bigbasket = { ran: new Date().toISOString(), ...stats }
await writeFile(catalogFile, JSON.stringify(cat))
console.error(`\nWROTE catalog: ${cat.count} products`)
