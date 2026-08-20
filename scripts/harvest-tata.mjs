#!/usr/bin/env node
/**
 * TATA-ONLY harvest from Open Food Facts.
 *
 * WHY THIS IS SEPARATE FROM build-catalog.mjs: that script sweeps the whole India
 * pool and requires `states_tags=en:front-photo-selected`, because a wall of
 * cards with no images looks broken. For a single-company completeness pass the
 * trade is the other way round — a Tata Salt record with a real nutrition panel
 * and no photo is worth MORE than no record at all, and `ProductPack.jsx`
 * already falls back to the illustrated brand pack when `image` is unset.
 * So this drops the photo gate and keeps everything with a usable name.
 *
 * It also drops `countries_tags=en:india`. Tetley, Eight O'Clock, Good Earth and
 * Organic India are Tata-owned brands whose OFF records are frequently tagged to
 * other markets while being the same SKU sold here. Each record keeps its
 * `markets` field so the UI can say where the record came from rather than
 * silently implying it is an India pack.
 *
 * Writes scripts/out/tata-off.json (raw harvest). Resumable: an existing file is
 * loaded first and only unseen brand slugs are fetched, so a rate-limit abort
 * costs one slug, not the whole run.
 *
 * Usage: node scripts/harvest-tata.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'scripts', 'out')
const outFile = path.join(outDir, 'tata-off.json')

const UA = 'FoodwiseIndia/1.0 (jaano; educational; github kartikeyjaiswal42-sudo/foodwise-india)'
const DELAY_MS = 6500
const PAGE_SIZE = 100
const FIELDS = 'code,product_name,product_name_en,brands,brands_tags,quantity,categories_tags,countries_tags,nutriments,nutriscore_grade,nova_group,ingredients_text,ingredients_text_en,additives_tags,image_front_url,image_front_small_url'

/**
 * Every brand Tata Consumer Products owns or controls that sells food or drink.
 * Sources: Tata Consumer's own published brand portfolio, plus the Capital Foods
 * (Ching's Secret / Smith & Jones) and Organic India acquisitions completed 2024.
 */
const TATA_BRANDS = [
  // Tea
  'tata-tea', 'tata-tea-premium', 'tata-tea-gold', 'tata-tea-agni', 'tata-agni',
  'chakra-gold', 'kanan-devan', 'tata-tea-elaichi', 'tata-tea-masala-chai',
  'tetley', 'tetley-green-tea', 'good-earth', 'good-earth-tea', 'teapigs', 'vitax',
  'tata-tea-tulsi', 'teaveda', 'gemini',
  // Coffee
  'tata-coffee', 'tata-coffee-grand', 'sonnets', 'eight-o-clock', 'eight-o-clock-coffee',
  'starbucks', 'tata-starbucks',
  // Salt
  'tata-salt', 'tata-salt-lite', 'tata-black-salt', 'tata-rock-salt', 'tata-salt-immuno',
  // Staples / pulses / spices
  'tata-sampann', 'sampann', 'tata-sampann-yumside', 'tata-simply-better',
  // Breakfast / millets
  'tata-soulfull', 'soulfull', 'soulfull-ragi-bites',
  // Water & hydration
  'himalayan', 'himalayan-natural-mineral-water', 'tata-copper', 'tata-water-plus',
  'tata-gluco-plus', 'nourishco',
  // Snacks & sweeteners
  'tata-q', 'tata-nx', 'tata-nx-zero-sugar',
  // Capital Foods (acquired 2024)
  'ching-s-secret', 'chings-secret', 'ching-s', 'smith-jones', 'smith-and-jones',
  // Organic India (acquired 2024)
  'organic-india', 'tulsi',
  // Umbrella
  'tata', 'tata-consumer', 'tata-consumer-products',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(brand, page) {
  const url = `https://world.openfoodfacts.org/api/v2/search?brands_tags=${brand}`
    + `&fields=${FIELDS}&page_size=${PAGE_SIZE}&page=${page}`
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (res.status === 429) { await sleep(25000); continue }
      if (!res.ok) { await sleep(6000); continue }
      return await res.json()
    } catch { await sleep(6000) }
  }
  return null   // null = "we never got an answer", distinct from an empty result
}

await mkdir(outDir, { recursive: true })

const state = existsSync(outFile)
  ? JSON.parse(await readFile(outFile, 'utf8'))
  : { started: new Date().toISOString(), doneBrands: [], failedBrands: [], records: {} }

const done = new Set(state.doneBrands)

for (const brand of TATA_BRANDS) {
  if (done.has(brand)) { console.error(`skip ${brand} (already harvested)`); continue }
  let page = 1
  let got = 0
  let failed = false
  for (;;) {
    const data = await fetchPage(brand, page)
    if (data === null) { failed = true; break }
    const list = data.products || []
    for (const p of list) {
      if (!p.code) continue
      state.records[p.code] = { ...p, _brandSlug: brand }
      got++
    }
    const pool = data.count || 0
    console.error(`  ${brand} p${page}: +${list.length}  pool=${pool}  unique-so-far=${Object.keys(state.records).length}`)
    if (list.length < PAGE_SIZE || page * PAGE_SIZE >= pool || page >= 6) break
    page++
    await sleep(DELAY_MS)
  }
  if (failed) state.failedBrands.push(brand)
  else state.doneBrands.push(brand)
  await writeFile(outFile, JSON.stringify(state))     // checkpoint every brand
  console.error(`${failed ? 'FAILED' : 'done'} ${brand} (+${got})`)
  await sleep(DELAY_MS)
}

state.finished = new Date().toISOString()
await writeFile(outFile, JSON.stringify(state))
console.error(`\nHARVEST COMPLETE: ${Object.keys(state.records).length} unique OFF records`)
console.error(`brands ok=${state.doneBrands.length} failed=${state.failedBrands.length} ${state.failedBrands.join(',')}`)
