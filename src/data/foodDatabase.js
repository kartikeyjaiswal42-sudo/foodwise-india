// Catalog ACCESS LAYER.
//
// The 887-product array used to be exported literally from this file, which meant
// all 1.13 MB of it was compiled into the client page chunk and had to parse before
// first paint. The data now lives in `public/data/catalog.json` (written by
// `scripts/split-catalog.mjs`, sourced from `scripts/build-catalog.mjs`) and is
// fetched once at boot, then cached by the service worker.
//
// `products` stays a LIVE, MUTABLE array export so that all thirteen
// `import { products } from '../data/foodDatabase'` call sites keep working
// untouched. `loadCatalog()` fills it IN PLACE (never reassigns — a reassignment
// would not be visible through the existing named imports).
//
// Contract: `page.js` awaits `loadCatalog()` and blocks the view tree until it
// resolves, so every component's first render already sees the full array. No
// component computes on `products` at module scope (verified), so nothing reads
// it while empty.

/** Live catalog. Empty until `loadCatalog()` resolves. Never reassign — mutate. */
export const products = []

/** Small enough to keep bundled; Explore reads it synchronously for its filter bar. */
export const categories = [
  'All', 'Snacks', 'Biscuits', 'Confectionery', 'Dairy', 'Beverages',
  'Breakfast', 'Instant food', 'Spreads', 'Staples', 'Ready meals', 'Other',
]

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
export const CATALOG_URL = `${BASE}/data/catalog.json`

let loadPromise = null
let meta = { generated: null, count: 0 }

/** True once the catalog array is populated. */
export function catalogReady() {
  return products.length > 0
}

export function catalogMeta() {
  return { ...meta, count: products.length }
}

/**
 * Fetch + populate the catalog. Idempotent and concurrency-safe: repeat calls
 * share one in-flight promise, and a resolved catalog short-circuits.
 * Rejects on network/parse failure so the caller can show an honest error
 * instead of an empty app that looks like "no products exist".
 */
export function loadCatalog() {
  if (catalogReady()) return Promise.resolve(products)
  if (loadPromise) return loadPromise

  // 'no-cache' means REVALIDATE, not "don't cache": the browser still stores the
  // body and sends If-None-Match, so an unchanged catalog costs a 304 with an
  // empty payload. 'force-cache' was wrong here — it pins a device to whatever
  // catalog it first downloaded, so a corrected product would never reach a user
  // who had already visited. The service worker layers offline support on top.
  loadPromise = fetch(CATALOG_URL, { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error(`Catalog fetch failed: HTTP ${res.status}`)
      return res.json()
    })
    .then((data) => {
      const list = Array.isArray(data) ? data : data.products
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('Catalog payload was empty')
      }
      products.length = 0
      products.push(...list)
      meta = { generated: data.generated || null, count: list.length }
      buildBarcodeIndex()
      return products
    })
    .catch((err) => {
      // Allow a retry after a transient failure.
      loadPromise = null
      throw err
    })

  return loadPromise
}

/* ------------------------------------------------------------------ */
/*  Barcode index — powers the scanner's offline-first lookup          */
/* ------------------------------------------------------------------ */

// Catalog ids are `off-<barcode>` (Open Food Facts). Indexing them lets a scanned
// barcode resolve locally with zero network before we ever consider the OFF API.
let byBarcode = null

function buildBarcodeIndex() {
  byBarcode = new Map()
  for (const p of products) {
    const code = String(p.id || '').replace(/^off-/, '')
    if (code) byBarcode.set(code, p)
  }
}

/** Look a barcode up in the local catalog. Returns undefined if absent. */
export function findByBarcode(code) {
  if (!code) return undefined
  if (!byBarcode) buildBarcodeIndex()
  return byBarcode.get(String(code).trim())
}

/** Look a product up by its catalog id. */
export function findById(id) {
  if (!id) return undefined
  return products.find((p) => p.id === id)
}
