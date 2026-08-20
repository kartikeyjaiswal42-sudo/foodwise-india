#!/usr/bin/env node
/**
 * Scrape Tata Consumer's OWN website for its authoritative brand and product roster.
 *
 * WHAT THIS IS FOR: coverage measurement, not nutrition.
 *
 * tataconsumer.com publishes no nutrition panel anywhere — nor do tetley.in,
 * chingssecret.com or organicindia.com (all checked). What the corporate site
 * uniquely has is the DEFINITIVE list of what Tata actually sells: every brand
 * in the portfolio and, on each brand page, the products under it. That turns
 * "all of Tata's products" from a claim into something measurable — we can state
 * what fraction of Tata's own published roster the catalog covers, and name the
 * gap instead of hand-waving at it.
 *
 * It also catches brands a slug-guessing harvest never would: 1868 by Tata Tea,
 * Joekels, Tata Fruski, ZipZap, Tata GoFit, Himalayan Saffron, Sonnets.
 *
 * robots.txt on tataconsumer.com disallows only /core/, /profiles/, /admin/,
 * /search/ and user paths. Brand pages are permitted. One request per 2 s.
 *
 * Usage: node scripts/scrape-tataconsumer.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outFile = path.join(root, 'scripts', 'out', 'tataconsumer-roster.json')

const BASE = 'https://www.tataconsumer.com'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const decode = (s) => String(s)
  .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;|&#8217;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim()

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (res.ok) return await res.text()
    } catch { /* retry */ }
    await sleep(3000)
  }
  return null
}

/* ---- 1. the brand roster ------------------------------------------------ */
const offerings = await get(`${BASE}/our-offerings`)
if (!offerings) { console.error('could not load /our-offerings'); process.exit(1) }

const brands = [...new Map(
  [...offerings.matchAll(/href="(\/brands\/[^"]+)"[^>]*>([\s\S]{0,160}?)<\/a>/gi)]
    .map((m) => [m[1], decode(m[2].replace(/<[^>]*>/g, ' '))])
    .filter(([, name]) => name && name.length > 1 && name.length < 46)
    .map(([url, name]) => [url, { name, url, category: url.split('/')[2] || 'other' }])
).values()]

console.error(`BRANDS: ${brands.length}`)

/* ---- 2. products under each brand --------------------------------------- */
// Each brand page renders its product list as filter buttons:
//   <button class="... js-filter" data-filter=".category-<slug>">Name</button>
// Every brand page carries an "other brands in the portfolio" rail, and its
// markup is the SAME product-tile class as a real product list. Left alone it
// reported Tata Tea, Teapigs and Good Earth as *products of Tetley*. Any
// candidate whose name is itself a brand is therefore rejected — a brand is
// never its own sibling's product.
// Match on the URL slug as well as the link text: the same brand page is
// labelled differently in different rails ("Tata Soulfull" in one, a tagline in
// another), so a name-only set misses it half the time.
const norm = (x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, '')
const brandNames = new Set([
  ...brands.map((b) => norm(b.name)),
  ...brands.map((b) => norm(b.url.split('/').pop())),
])
const isSiblingBrand = (n) => brandNames.has(norm(n))

const out = []
for (const b of brands) {
  const html = await get(BASE + b.url)
  await sleep(2000)
  if (!html) { console.error(`  FAIL ${b.name}`); out.push({ ...b, products: [], failed: true }); continue }

  // Two layouts are in use across the site. Older brand pages render the
  // product list as filter buttons; newer ones use product tiles.
  const fromFilters = [...html.matchAll(/data-filter="\.category-[^"]*"[^>]*>([\s\S]{0,90}?)<\/button>/gi)]
    .map((m) => decode(m[1].replace(/<[^>]*>/g, ' ')))
  const fromTiles = [...html.matchAll(/product-tile__name(?:__link)?[^>]*>([\s\S]{0,110}?)<\//gi)]
    .map((m) => decode(m[1].replace(/<[^>]*>/g, ' ')))

  // Tetley's filter buttons are MARKETS, not products — "UK", "Canada",
  // "Western Europe". Counting a country as a product would inflate the
  // coverage denominator with things that were never SKUs.
  const NOT_A_PRODUCT = /^(all|uk|usa|canada|india|australia|western europe|europe|middle east|africa|global|explore|read more|view all|know more)$/i

  const products = [...new Set([...fromFilters, ...fromTiles])]
    .filter((n) => n && n.length > 1 && n.length < 60 && !NOT_A_PRODUCT.test(n))
    .filter((n) => !isSiblingBrand(n))

  out.push({ ...b, products })
  console.error(`  ${b.name}: ${products.length} products${products.length ? ' — ' + products.slice(0, 5).join(', ') : ''}`)
}

await mkdir(path.dirname(outFile), { recursive: true })
await writeFile(outFile, JSON.stringify({
  source: `${BASE}/our-offerings`,
  scraped: new Date().toISOString(),
  brandCount: out.length,
  productCount: out.reduce((n, b) => n + b.products.length, 0),
  brands: out,
}, null, 1))

console.error(`\nWROTE ${out.length} brands / ${out.reduce((n, b) => n + b.products.length, 0)} products -> ${path.relative(root, outFile)}`)
