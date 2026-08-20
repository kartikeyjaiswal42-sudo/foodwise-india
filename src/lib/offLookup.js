// Live Open Food Facts lookup — turns Jaano's fixed 887-product catalog into an
// effectively unlimited one.
//
// WHY THIS EXISTS: the catalog is a snapshot built offline by
// `scripts/build-catalog.mjs`. A shopper holding a pack that isn't in it had no
// path except typing the whole ingredient list by hand. Scanning the barcode and
// asking Open Food Facts directly closes that gap, at zero infrastructure cost:
// the OFF API is public, CORS-enabled and needs no key, so a static GitHub Pages
// build can call it straight from the browser.
//
// THE CONTRACT THAT MATTERS: a scanned product is normalised into EXACTLY the
// catalog product schema, using derivation logic mirrored line-for-line from
// `scripts/build-catalog.mjs`. That is deliberate — the same pack must score the
// same number whether it arrived via the catalog or via a scan, otherwise the
// score means nothing. If you change the builder's scoring, change it here too.
//
// Schema contract the components require (do not break):
//   `nutrients` holds ONLY sugar/sodium/satFat (ProductDetail indexes
//   metricMeta[key]; an unknown key renders undefined and crashes),
//   `calories` is a number never null, `concerns`/`ingredients` may be empty
//   arrays, and `alternativeCompare` is always present.

import { auditProduct } from './dataQuality'

const API = 'https://world.openfoodfacts.org/api/v2/product'
const FIELDS = [
  'code', 'product_name', 'product_name_en', 'brands', 'brands_tags', 'quantity',
  'categories_tags', 'nutriments', 'nutriscore_grade', 'nova_group',
  'ingredients_text', 'ingredients_text_en', 'additives_tags',
  'image_front_url', 'image_front_small_url', 'countries_tags',
].join(',')

const CACHE_KEY = 'jaano-scan-cache-v1'
const CACHE_MAX = 120

/* ------------------------------------------------------------------ */
/*  Derivation — mirrored from scripts/build-catalog.mjs               */
/* ------------------------------------------------------------------ */

const num = (v) => (typeof v === 'number' && isFinite(v)) ? v : (parseFloat(v) || 0)

const FALLBACK_PALETTES = [
  ['#264653', '#FFF'], ['#2A9D8F', '#FFF'], ['#E76F51', '#FFF'], ['#6D597A', '#FFF'], ['#355070', '#FFF'],
  ['#B56576', '#FFF'], ['#4C956C', '#FFF'], ['#3D5A80', '#FFF'], ['#9B2226', '#FFF'], ['#5F0F40', '#FFF'],
  ['#1D3557', '#FFF'], ['#7F5539', '#FFF'], ['#0F4C5C', '#FFF'], ['#8338EC', '#FFF'], ['#AD2831', '#FFF'],
  ['#FB8500', '#1A2B49'], ['#FFB703', '#1A2B49'], ['#80B918', '#1A2B49'], ['#00B4D8', '#1A2B49'], ['#E9C46A', '#1A2B49'],
]

function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function titleCase(s) {
  return String(s).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

function cleanName(p) {
  let n = (p.product_name_en || p.product_name || '').trim().replace(/\s+/g, ' ')
  if (!n) return ''
  if (n === n.toUpperCase() || n === n.toLowerCase()) n = titleCase(n)
  return n
}

function imageVariants(url) {
  if (!url) return { small: null, large: null }
  return {
    small: url.replace(/\.(\d+)\.jpg$/i, '.400.jpg'),
    large: url.replace(/\.(\d+)\.jpg$/i, '.full.jpg'),
  }
}

function categoryOf(tags = []) {
  const t = tags.join(' ')
  const has = (...k) => k.some((x) => t.includes(x))
  if (has('noodle', 'pasta', 'vermicelli', 'instant')) return 'Instant food'
  if (has('biscuit', 'cookie', 'cracker', 'rusk', 'wafer')) return 'Biscuits'
  if (has('chocolate', 'candies', 'candy', 'confecti', 'sweets', 'toffee', 'lollipop', 'mints', 'chewing-gum')) return 'Confectionery'
  if (has('chips', 'crisps', 'namkeen', 'savoury-snack', 'snacks', 'bhujia', 'extruded', 'popcorn', 'mixture')) return 'Snacks'
  if (has('cheese', 'butter', 'milk', 'dairy', 'yogurt', 'curd', 'paneer', 'ghee', 'ice-cream', 'dahi', 'lassi')) return 'Dairy'
  if (has('beverage', 'drink', 'juice', 'tea', 'coffee', 'squash', 'soda', 'water', 'cola', 'energy')) return 'Beverages'
  if (has('cereal', 'breakfast', 'oats', 'muesli', 'cornflakes', 'poha', 'granola')) return 'Breakfast'
  if (has('spread', 'jam', 'ketchup', 'sauce', 'pickle', 'chutney', 'honey', 'peanut-butter', 'mayonnaise', 'dressing')) return 'Spreads'
  if (has('flour', 'atta', 'rice', 'dal', 'pulse', 'salt', 'spice', 'masala', 'sugar', 'staple', 'besan', 'suji', 'rava', 'oil', 'ghee')) return 'Staples'
  if (has('ready', 'meal', 'curry', 'gravy', 'heat-and-eat', 'frozen', 'soup')) return 'Ready meals'
  if (has('bread', 'bun', 'cake', 'bakery', 'pastr')) return 'Bakery'
  return 'Other'
}

function nutrientsOf(nm = {}) {
  const sugar = num(nm['sugars_100g'])
  const sodium = nm['sodium_100g'] != null ? num(nm['sodium_100g']) * 1000
    : nm['salt_100g'] != null ? (num(nm['salt_100g']) * 1000) / 2.5
      : 0
  const satFat = num(nm['saturated-fat_100g'])
  const r = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d
  return { sugar: r(sugar, 1), sodium: Math.round(sodium), satFat: r(satFat, 1) }
}

const GRADE_FROM_NS = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' }
const SCORE_FROM_NS = { a: 88, b: 76, c: 60, d: 44, e: 30 }

function scoreGrade(p, nutr) {
  const ns = (p.nutriscore_grade || '').toLowerCase()
  if (GRADE_FROM_NS[ns]) return { score: SCORE_FROM_NS[ns], grade: GRADE_FROM_NS[ns] }
  let s = 80
  s -= Math.min(28, nutr.sugar * 1.1)
  s -= Math.min(22, nutr.sodium / 45)
  s -= Math.min(20, nutr.satFat * 1.6)
  if (num(p.nova_group) >= 4) s -= 14
  else if (num(p.nova_group) === 3) s -= 6
  s = Math.max(8, Math.min(95, Math.round(s)))
  const grade = s >= 80 ? 'A' : s >= 65 ? 'B' : s >= 50 ? 'C' : s >= 35 ? 'D' : 'E'
  return { score: s, grade }
}

function ingredientsOf(p) {
  const txt = (p.ingredients_text_en || p.ingredients_text || '').trim()
  if (!txt) return []
  return txt
    .replace(/_/g, '')
    .split(/,(?![^(]*\))/)
    .map((s) => s.trim())
    .filter((s) => s && s.length < 80)
    .slice(0, 30)
}

function concernsOf(nutr, additives = []) {
  const c = []
  if (nutr.sugar >= 22.5) c.push({ name: 'High sugar', level: 'high', amount: `${nutr.sugar} g / 100 g`, note: 'Exceeds the FSSAI/WHO high-sugar threshold (22.5 g per 100 g).' })
  else if (nutr.sugar >= 5) c.push({ name: 'Added sugar', level: 'medium', amount: `${nutr.sugar} g / 100 g`, note: 'Moderate sugar — counts toward the 25 g daily added-sugar limit.' })
  if (nutr.sodium >= 600) c.push({ name: 'High sodium', level: 'high', amount: `${nutr.sodium} mg / 100 g`, note: 'High salt load; the daily sodium limit is ~2,300 mg.' })
  else if (nutr.sodium >= 300) c.push({ name: 'Moderate sodium', level: 'medium', amount: `${nutr.sodium} mg / 100 g`, note: 'Adds up quickly across a day of packaged food.' })
  if (nutr.satFat >= 6) c.push({ name: 'High saturated fat', level: 'high', amount: `${nutr.satFat} g / 100 g`, note: 'Above the per-100 g high-fat threshold (5–6 g).' })
  else if (nutr.satFat >= 3) c.push({ name: 'Saturated fat', level: 'medium', amount: `${nutr.satFat} g / 100 g`, note: 'Moderate saturated fat content.' })
  const eNums = additives.map((a) => a.replace('en:', '').toUpperCase()).filter(Boolean)
  if (eNums.length) c.push({ name: `${eNums.length} food additive${eNums.length > 1 ? 's' : ''}`, level: eNums.length >= 4 ? 'high' : 'medium', amount: eNums.slice(0, 6).join(', '), note: 'Permitted additives (INS/E numbers) declared on the label.' })
  return c
}

function estPrice(quantity, category) {
  const m = String(quantity || '').match(/([\d.]+)\s*(kg|g|l|ml)/i)
  let grams = 100
  if (m) {
    const v = parseFloat(m[1]); const u = m[2].toLowerCase()
    grams = (u === 'kg' || u === 'l') ? v * 1000 : v
  }
  const ratePerKg = {
    Biscuits: 200, Snacks: 400, Confectionery: 600, Dairy: 280, Beverages: 120,
    Breakfast: 350, Spreads: 350, Staples: 90, 'Instant food': 300,
    'Ready meals': 320, Bakery: 250, Other: 300,
  }[category] || 300
  return Math.max(5, Math.round((grams / 1000) * ratePerKg))
}

function accentOf(name) {
  const stop = new Set(['the', 'and', 'with', 'of', 'in', 'a', 'for', 'to', '&'])
  const w = String(name).split(/\s+/).filter((x) => !stop.has(x.toLowerCase()))
  return (w.slice(-1)[0] || name).toUpperCase().slice(0, 14)
}

/* ------------------------------------------------------------------ */
/*  Normalise an OFF record into a Jaano catalog product               */
/* ------------------------------------------------------------------ */

/**
 * NOTE ON STRICTNESS: the catalog builder REJECTS any product without a front
 * photo or with a poor name, because it is curating a browsable shelf. A scanner
 * must not — the user is physically holding the pack, so "we found it but it has
 * no photo" is still a useful answer. We keep every derivation identical but drop
 * the admission filters, and instead report what the record is missing so the UI
 * can be honest about data quality.
 */
export function normalizeOffProduct(p) {
  const code = String(p.code || '')
  const name = cleanName(p) || 'Unnamed product'
  const brandName = (p.brands || '').split(',')[0].trim() || 'Unknown brand'
  const company = titleCase(brandName)
  const pal = FALLBACK_PALETTES[hashCode(company) % FALLBACK_PALETTES.length]

  const category = categoryOf(p.categories_tags)
  const nutr = nutrientsOf(p.nutriments)
  let { score, grade } = scoreGrade(p, nutr)
  const img = p.image_front_url || p.image_front_small_url
  const { small, large } = imageVariants(img)
  const ingredients = ingredientsOf(p)

  // Honest data-quality reporting: OFF is crowd-sourced and coverage varies.
  const missing = []
  if (!ingredients.length) missing.push('ingredient list')
  if (!p.nutriments || (!nutr.sugar && !nutr.sodium && !nutr.satFat)) missing.push('nutrition panel')
  if (!img) missing.push('pack photo')

  // THE SAME DATA-HONESTY RULE THE CATALOG NOW ENFORCES. `scoreGrade` starts at
  // 80 and subtracts, so an OFF record with no nutrition panel scores 80 = "A".
  // Applying this only during the offline catalog build would leave the live
  // scan path happily rating unknown packs as excellent — the bug would simply
  // move to the feature people use most.
  const audit = auditProduct({ nutrients: nutr, calories: Math.round(num(p.nutriments?.['energy-kcal_100g'])) || 0, ingredients })
  const unrated = !audit.hasScoringNutrients
  if (unrated) { score = null; grade = null }

  return {
    id: `off-${code}`,
    barcode: code,
    image: small,
    imageLarge: large,
    name,
    brand: brandName,
    company,
    category,
    price: estPrice(p.quantity, category),
    size: (p.quantity || '1 pack').trim(),
    score,
    grade,
    color: pal[0],
    ink: pal[1],
    accent: accentOf(name),
    calories: Math.round(num(p.nutriments?.['energy-kcal_100g'])) || 0,
    servingSize: '100 g',
    nutrients: nutr,
    concerns: concernsOf(nutr, p.additives_tags || []),
    ingredients,
    alternative: null,
    alternativeCompare: { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] },
    ...(unrated ? { unrated: true } : {}),
    dataConfidence: audit.confidence,
    ...(audit.reasons.length ? { dataReasons: audit.reasons } : {}),
    // Scan-only metadata — the catalog never sets these.
    source: 'openfoodfacts',
    missingData: missing,
    indiaMarket: (p.countries_tags || []).some((t) => /india/i.test(t)),
  }
}

/**
 * Pair a scanned product with the best genuinely-cleaner catalog product in the
 * same category, mirroring the post-pass in `scripts/build-catalog.mjs` (which
 * requires a score lead of >8 so a swap is a real improvement, not noise).
 * Mutates and returns `product` so the existing ProductDetail swap UI lights up
 * for scanned packs too.
 */
export function attachAlternative(product, catalog = []) {
  if (!product || !catalog.length) return product
  // An unrated product has no score to improve on, and an unrated PEER must
  // never be offered as the improvement.
  if (product.score == null) return product
  const peer = catalog
    .filter((q) => q.category === product.category
      && q.id !== product.id
      && q.score != null
      && q.score > product.score + 8
      && (q.ingredients || []).length)
    .sort((a, b) => b.score - a.score)[0]

  if (!peer) return product

  const mine = new Set((product.ingredients || []).map((s) => s.toLowerCase().trim()))
  const theirs = new Set((peer.ingredients || []).map((s) => s.toLowerCase().trim()))

  product.alternative = peer.id
  product.alternativeCompare = {
    pricePerUnitDiffText: `₹${product.price} vs ₹${peer.price}`,
    ingredientsAvoided: (product.ingredients || [])
      .filter((s) => !theirs.has(s.toLowerCase().trim())).slice(0, 6),
    ingredientsReplacedWith: [],
  }
  return product
}

/* ------------------------------------------------------------------ */
/*  Local cache — a scanned product stays available offline            */
/* ------------------------------------------------------------------ */

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeCache(map) {
  try {
    // Bound the cache: keep the most recently scanned entries only.
    const entries = Object.entries(map)
    if (entries.length > CACHE_MAX) {
      entries.sort((a, b) => (b[1].scannedAt || 0) - (a[1].scannedAt || 0))
      map = Object.fromEntries(entries.slice(0, CACHE_MAX))
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(map))
  } catch { /* quota or private mode — cache is best-effort */ }
}

export function cachedScan(code) {
  const hit = readCache()[String(code)]
  return hit ? hit.product : undefined
}

export function recentScans(limit = 12) {
  return Object.values(readCache())
    .sort((a, b) => (b.scannedAt || 0) - (a.scannedAt || 0))
    .slice(0, limit)
    .map((e) => e.product)
}

export function clearScanHistory() {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
}

function cacheScan(code, product) {
  const map = readCache()
  map[String(code)] = { scannedAt: Date.now(), product }
  writeCache(map)
}

/* ------------------------------------------------------------------ */
/*  The lookup itself                                                   */
/* ------------------------------------------------------------------ */

/** A barcode is 8–14 digits (EAN-8/EAN-13/UPC-A/ITF-14). */
export function isValidBarcode(code) {
  return /^\d{8,14}$/.test(String(code || '').trim())
}

/**
 * Fetch a product from Open Food Facts by barcode.
 * Resolves `{ status, product?, reason? }` — never throws for a "not found",
 * because an unknown barcode is a normal outcome, not an error.
 *   status: 'found' | 'not-found' | 'offline' | 'error'
 */
export async function lookupBarcode(code, { signal } = {}) {
  const clean = String(code || '').trim()
  if (!isValidBarcode(clean)) {
    return { status: 'error', reason: 'That does not look like a barcode (expected 8–14 digits).' }
  }

  // Offline / repeat scan: serve the cached normalisation.
  const cached = cachedScan(clean)
  if (cached) return { status: 'found', product: cached, fromCache: true }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { status: 'offline', reason: 'You are offline and this pack has not been scanned before.' }
  }

  try {
    const res = await fetch(`${API}/${encodeURIComponent(clean)}.json?fields=${FIELDS}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (res.status === 404) return { status: 'not-found' }
    if (!res.ok) return { status: 'error', reason: `Open Food Facts returned HTTP ${res.status}.` }

    const data = await res.json()
    // OFF signals a miss with status 0 and HTTP 200.
    if (!data || data.status === 0 || !data.product) return { status: 'not-found' }

    const product = normalizeOffProduct({ ...data.product, code: data.product.code || clean })
    cacheScan(clean, product)
    return { status: 'found', product }
  } catch (err) {
    if (err?.name === 'AbortError') return { status: 'error', reason: 'Lookup cancelled.' }
    return { status: 'offline', reason: 'Could not reach Open Food Facts. Check your connection.' }
  }
}
