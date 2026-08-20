#!/usr/bin/env node
/**
 * Scrape Tata Consumer's own retail listings from BigBasket (a Tata company).
 *
 * WHY THIS EXISTS, AND WHAT IT DELIBERATELY DOES NOT DO
 * -----------------------------------------------------
 * The obvious hope was nutrition panels. Tata's own marketing sites publish
 * none — tataconsumer.com, tetley.in, chingssecret.com and organicindia.com were
 * all checked and carry marketing copy only. BigBasket product pages CAN carry a
 * full declared panel (the ITC/Aashirvaad listings do), so it was worth
 * measuring rather than assuming.
 *
 * MEASURED: 0 of 56 Tata product variants sampled across 8 brands carry a
 * nutrition panel. Panels on BigBasket are supplied per-listing by the brand,
 * and Tata has not supplied them. So this scraper takes the panel when it is
 * there and does not pretend otherwise when it is not — the missing-nutrition
 * products stay `unrated`, exactly as they were.
 *
 * What it DOES reliably deliver, and why each is worth having:
 *   · real SKU names and every pack size actually sold
 *   · REAL MRP — replacing the per-kg-rate ESTIMATE the catalog shows today
 *   · category, ingredient statement where published
 *   · the "Marketed by" line, which is authoritative proof of Tata ownership
 *     and far better evidence than matching a brand slug
 *
 * IMAGES ARE DELIBERATELY NOT TAKEN. Product facts (name, weight, price) are
 * data; BigBasket's product photography is copyrighted work, and hotlinking a
 * commercial CDN from a public GitHub Pages site is neither licensed nor stable.
 * Open Food Facts images are used elsewhere in this catalog precisely because
 * they are ODbL-licensed and these are not.
 *
 * POLITENESS: BigBasket's robots.txt disallows /p/, /product/ and /ps/ — none of
 * which this touches. /pb/ brand pages and /pd/ product pages are permitted.
 * One request every 2.5 s, resumable so a retry costs one page rather than all
 * of them.
 *
 * Usage: node scripts/scrape-bigbasket-tata.mjs [--limit=N]
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseProductPage } from './lib/bb-parse.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'scripts', 'out')
const outFile = path.join(outDir, 'bigbasket-tata.json')

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
const DELAY_MS = 2500
const limitArg = process.argv.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity

/** BigBasket brand slugs, verified to return products. */
const BRANDS = [
  'tata-sampann', 'tata-salt', 'tata-tea', 'tetley', 'tata-soulfull',
  'himalayan', 'chings-secret', 'chings', 'smith-jones', 'organic-india',
  'tata-coffee', 'tata-simply-better', 'tata-q', 'tata',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } })
      if (res.status === 429) { await sleep(20000); continue }
      if (!res.ok) { await sleep(3000); continue }
      return await res.text()
    } catch { await sleep(3000) }
  }
  return null
}

await mkdir(outDir, { recursive: true })
const state = existsSync(outFile)
  ? JSON.parse(await readFile(outFile, 'utf8'))
  : { started: new Date().toISOString(), doneBrands: [], fetchedUrls: [], records: {} }

const doneBrands = new Set(state.doneBrands)
const fetched = new Set(state.fetchedUrls)

/* ---- phase 1: discover product URLs from brand pages ------------------- */
const urls = new Set()
for (const b of BRANDS) {
  if (doneBrands.has(b)) continue
  // Pages 2-9 are explicitly Allowed in robots.txt; page 1 is the bare path.
  for (let page = 1; page <= 4; page++) {
    const u = page === 1
      ? `https://www.bigbasket.com/pb/${b}/`
      : `https://www.bigbasket.com/pb/${b}/?page=${page}`
    const html = await get(u)
    await sleep(DELAY_MS)
    if (!html) break
    const found = [...html.matchAll(/\/pd\/(\d+)\/([a-z0-9-]+)/g)]
      .map((m) => `https://www.bigbasket.com/pd/${m[1]}/${m[2]}/`)
    const before = urls.size
    found.forEach((f) => urls.add(f))
    console.error(`  ${b} p${page}: ${found.length} links (+${urls.size - before} new, ${urls.size} total)`)
    if (!found.length) break
  }
  doneBrands.add(b)
  state.doneBrands = [...doneBrands]
  await writeFile(outFile, JSON.stringify(state))
}
console.error(`\nDISCOVERED ${urls.size} product URLs`)

/* ---- phase 2: fetch each product page ---------------------------------- */
let n = 0
let withPanel = 0
for (const u of urls) {
  if (fetched.has(u)) continue
  if (n >= LIMIT) break
  const html = await get(u)
  await sleep(DELAY_MS)
  fetched.add(u)
  state.fetchedUrls = [...fetched]
  n++
  if (!html) { console.error(`  FAIL ${u}`); continue }

  const rows = parseProductPage(html, u)
  for (const r of rows) {
    if (r.nutrition) withPanel++
    state.records[r.sku] = r
  }
  if (n % 10 === 0) {
    await writeFile(outFile, JSON.stringify(state))
    console.error(`  ${n}/${urls.size} pages · ${Object.keys(state.records).length} variants · ${withPanel} with a panel`)
  }
}

state.finished = new Date().toISOString()
await writeFile(outFile, JSON.stringify(state))

const recs = Object.values(state.records)
const byBrand = {}
for (const r of recs) byBrand[r.brand] = (byBrand[r.brand] || 0) + 1
console.error(`\nSCRAPE COMPLETE: ${recs.length} SKU variants`)
console.error(`with a nutrition panel: ${recs.filter((r) => r.nutrition).length}`)
console.error(`with an MRP: ${recs.filter((r) => r.mrp).length}`)
console.error('brands:', Object.entries(byBrand).sort((a, b) => b[1] - a[1]).map(([b, c]) => `${b}:${c}`).join(' '))
