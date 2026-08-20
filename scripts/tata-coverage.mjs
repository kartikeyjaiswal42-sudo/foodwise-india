#!/usr/bin/env node
/**
 * Measure how much of Tata Consumer's OWN published portfolio the catalog holds.
 *
 * WHY: the request was "all the products of Tata". Without a denominator that
 * is unanswerable — you can always add more rows and still not know whether you
 * are finished. `scrape-tataconsumer.mjs` gets the denominator from Tata
 * themselves (their brand roster and, where published, the products under each
 * brand), so coverage becomes a number instead of a feeling.
 *
 * It reports the GAP by name. A brand Tata sells and we hold nothing for is the
 * useful output here — not the percentage.
 *
 * Usage: node scripts/tata-coverage.mjs
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rosterFile = path.join(root, 'scripts', 'out', 'tataconsumer-roster.json')
const bbFile = path.join(root, 'scripts', 'out', 'bigbasket-tata.json')
const catalogFile = path.join(root, 'public', 'data', 'catalog.json')

if (!existsSync(rosterFile)) {
  console.error('No roster. Run: node scripts/scrape-tataconsumer.mjs')
  process.exit(1)
}

const roster = JSON.parse(await readFile(rosterFile, 'utf8'))
const catalog = JSON.parse(await readFile(catalogFile, 'utf8'))
const tata = catalog.products.filter((p) => p.company === 'Tata Consumer')

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

/** Brands we can evidence at least one product for. */
const heldBrandKeys = new Set(tata.map((p) => norm(p.brand)))
const heldText = tata.map((p) => norm(`${p.brand} ${p.name}`)).join(' | ')

/**
 * Token-overlap match.
 *
 * Pure substring matching could not connect our brand "Tata Simply Better" to
 * the roster's "Simply Better Cold Pressed Oils" — neither string contains the
 * other — and reported a gap for four products that were sitting in the catalog.
 * A coverage number that invents gaps is as useless as one that hides them.
 */
const STOP = new Set(['tata', 'the', 'and', 'by', 'of', 'natural', 'india', 'indian'])
const tokens = (s) => String(s).toLowerCase().split(/[^a-z0-9+]+/).filter((t) => t.length > 2 && !STOP.has(t))
const heldTokenSets = tata.map((p) => new Set(tokens(`${p.brand} ${p.name}`)))
function tokenCovered(name) {
  const want = tokens(name)
  if (!want.length) return false
  return heldTokenSets.some((have) => {
    const hits = want.filter((t) => have.has(t)).length
    return hits / want.length >= 0.6
  })
}

/**
 * A roster brand counts as covered if we hold a product under that brand name,
 * or if the brand's name appears inside a product name we hold (Tata's roster
 * splits "Tata Coffee Grand" and "Tata Coffee Gold" into separate brands while
 * a catalog row is simply branded "Tata Coffee").
 */
/**
 * Entries on the roster page that are not brands at all — a nav item and a
 * campaign tagline that happens to sit on the Soulfull brand page. Counting
 * them as uncovered brands would understate coverage against things that were
 * never products.
 */
const NOT_A_BRAND = /^(explore|overview|solubles|bringing health)/i

/**
 * Tata-owned but NOT SOLD IN INDIA. Teapigs and Vitax are UK, Joekels is South
 * African, Eight O'Clock is American, Good Earth is largely US/UK. This app
 * describes what is on Indian shelves, so their absence is a deliberate scope
 * decision, not a coverage gap — and lumping them in with real gaps would make
 * the number say something false in both directions.
 */
const NOT_SOLD_IN_INDIA = /^(teapigs|vitax|joekels|eight o|good earth|tata consumer specialist|tata mybistro)/i

const covered = []
const missing = []
const outOfScope = []
for (const b of roster.brands) {
  const key = norm(b.name)
  if (!key || NOT_A_BRAND.test(b.name)) continue
  if (NOT_SOLD_IN_INDIA.test(b.name)) { outOfScope.push(b); continue }
  const hit = heldBrandKeys.has(key)
    || [...heldBrandKeys].some((h) => h.includes(key) || key.includes(h))
    || heldText.includes(key)
    || tokenCovered(b.name)
  ;(hit ? covered : missing).push(b)
}

/* ---- product-level coverage, only where Tata publishes a product list ---- */
const productRows = []
for (const b of roster.brands) {
  for (const prod of b.products) {
    const key = norm(`${b.name} ${prod}`)
    const short = norm(prod)
    const found = tata.some((p) => {
      const hay = norm(`${p.brand} ${p.name}`)
      return hay.includes(short) || short.includes(norm(p.name))
    }) || tokenCovered(`${b.name} ${prod}`)
    productRows.push({ brand: b.name, product: prod, found })
  }
}

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0)

console.log('\n════ TATA COVERAGE, measured against Tata\'s own published portfolio ════\n')
console.log(`Source: ${roster.source}  (scraped ${roster.scraped.slice(0, 10)})`)
console.log(`Catalog holds ${tata.length} Tata products across ${new Set(tata.map((p) => p.brand)).size} brands.\n`)

const inScope = covered.length + missing.length
console.log(`BRANDS SOLD IN INDIA: ${covered.length}/${inScope} covered (${pct(covered.length, inScope)}%)`)
if (missing.length) {
  console.log('\n  NOT COVERED — Tata sells these in India, we hold nothing:')
  for (const m of missing) console.log(`    · ${m.name}  (${m.category})`)
} else {
  console.log('  Every India-market brand on Tata\'s roster has at least one product.')
}
if (outOfScope.length) {
  console.log(`\n  OUT OF SCOPE — Tata-owned but not sold in India (${outOfScope.length}):`)
  console.log('    ' + outOfScope.map((b) => b.name).join(', '))
  console.log('    Excluded on purpose: this catalog describes Indian shelves.')
}

if (productRows.length) {
  const hit = productRows.filter((r) => r.found).length
  console.log(`\nNAMED PRODUCTS (only the ${new Set(productRows.map((r) => r.brand)).size} brands where Tata publishes a list):`)
  console.log(`  ${hit}/${productRows.length} covered (${pct(hit, productRows.length)}%)`)
  const gaps = productRows.filter((r) => !r.found)
  if (gaps.length) {
    console.log('\n  MISSING PRODUCTS:')
    for (const g of gaps) console.log(`    · ${g.brand} — ${g.product}`)
  }
}

/* ---- what the BigBasket pass added, if it has run ----------------------- */
if (existsSync(bbFile)) {
  const bb = JSON.parse(await readFile(bbFile, 'utf8'))
  const recs = Object.values(bb.records || {})
  if (recs.length) {
    const panels = recs.filter((r) => r.nutrition && r.nutrition.per100)
    console.log(`\nBIGBASKET (a Tata company): ${recs.length} SKU variants scraped`)
    console.log(`  with a usable per-100g nutrition panel: ${panels.length} (${pct(panels.length, recs.length)}%)`)
    console.log(`  with a real MRP: ${recs.filter((r) => r.mrp).length}`)
    // This is the honest headline: Tata does not supply panels to its own
    // retailer's listings, so scraping cannot close the nutrition gap.
    if (panels.length / Math.max(recs.length, 1) < 0.15) {
      console.log('  → Nutrition panels are essentially absent from Tata listings.')
      console.log('    Scraping cannot close the nutrition gap; the MRP and SKU names are the win.')
    }
  }
}

console.log('\nNote: a brand counted as "covered" means we hold at least one product under it,')
console.log('not that we hold every SKU. Tata publishes a full product list for only')
console.log(`${new Set(productRows.map((r) => r.brand)).size} of its ${roster.brands.length} brands, so a complete SKU-level denominator does not exist publicly.\n`)
