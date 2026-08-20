#!/usr/bin/env node
/**
 * One-time repair of `public/data/catalog.json`.
 *
 * Three defects, all inherited from crowd-sourced Open Food Facts records that
 * the original builder trusted without auditing:
 *
 *  1. IMPOSSIBLE VALUES — 16 products carried sodium above any physical limit
 *     (worst: 1,608,200 mg per 100 g). Unit mix-ups at the source. These are
 *     nulled, not clamped: a clamp would invent a number we do not have.
 *
 *  2. MISSING DATA SCORED AS PERFECT — the scorer starts at 80 and subtracts,
 *     so 341 products with no nutrition at all scored 80 = "Grade A". Those
 *     become `unrated` with a null score.
 *
 *  3. UNRATED PRODUCTS RECOMMENDED AS HEALTHY SWAPS — 46% of `alternative`
 *     links pointed at a zero-data product. Swaps are recomputed against rated,
 *     full-confidence products only.
 *
 * Idempotent: re-running on a repaired catalog changes nothing.
 * Usage: node scripts/repair-catalog.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditProduct, isPlausible, canRecommend } from '../src/lib/dataQuality.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = path.join(root, 'public', 'data', 'catalog.json')

const data = JSON.parse(await readFile(file, 'utf8'))
const products = data.products || data
if (!Array.isArray(products) || !products.length) throw new Error('No products to repair')

const stats = {
  nulledValues: 0, unrated: 0, rescored: 0,
  swapsBefore: 0, swapsAfter: 0, swapsDropped: 0,
}

/* ---- 1. null impossible values ---------------------------------------- */
for (const p of products) {
  const n = p.nutrients || (p.nutrients = {})
  for (const key of ['sugar', 'sodium', 'satFat']) {
    if (n[key] != null && !isPlausible(key, n[key])) {
      p.dataNotes = [...(p.dataNotes || []), `${key} value ${n[key]} was impossible and has been removed`]
      n[key] = null
      stats.nulledValues++
    }
  }
  if (p.calories != null && !isPlausible('calories', p.calories)) {
    p.dataNotes = [...(p.dataNotes || []), `calories value ${p.calories} was impossible and has been removed`]
    p.calories = null
    stats.nulledValues++
  }

  // Concerns derived from an impossible number are themselves nonsense.
  if (p.dataNotes?.length) {
    p.concerns = (p.concerns || []).filter((c) => !/sodium|sugar|saturated/i.test(c.name)
      || !/impossible/.test(p.dataNotes.join(' ')))
  }
}

/* ---- 2. mark unrated products ----------------------------------------- */
for (const p of products) {
  const audit = auditProduct(p)
  p.dataConfidence = audit.confidence
  if (audit.reasons.length) p.dataReasons = audit.reasons

  if (!audit.hasScoringNutrients) {
    if (p.score != null) stats.rescored++
    p.score = null
    p.grade = null
    p.unrated = true
    stats.unrated++
  } else {
    delete p.unrated
  }
}

/* ---- 3. recompute swaps against rated products only -------------------- */
const byCat = {}
for (const p of products) (byCat[p.category] ||= []).push(p)
for (const list of Object.values(byCat)) list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1))

for (const p of products) {
  if (p.alternative) stats.swapsBefore++
  p.alternative = null
  p.alternativeCompare = { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] }

  // An unrated product has no score to improve upon, so it gets no swap either.
  if (p.score == null) continue

  const peer = (byCat[p.category] || []).find((q) => (
    q.id !== p.id && canRecommend(q) && q.score > p.score + 8 && (q.ingredients || []).length
  ))
  if (!peer) continue

  const theirs = new Set((peer.ingredients || []).map((s) => s.toLowerCase().trim()))
  p.alternative = peer.id
  p.alternativeCompare = {
    pricePerUnitDiffText: `₹${p.price} vs ₹${peer.price}`,
    ingredientsAvoided: (p.ingredients || []).filter((s) => !theirs.has(s.toLowerCase().trim())).slice(0, 6),
    ingredientsReplacedWith: [],
  }
  stats.swapsAfter++
}
stats.swapsDropped = stats.swapsBefore - stats.swapsAfter

/* ---- write ------------------------------------------------------------- */
data.products = products
data.repaired = new Date().toISOString()
data.quality = {
  total: products.length,
  rated: products.filter((p) => p.score != null).length,
  unrated: stats.unrated,
  full: products.filter((p) => p.dataConfidence === 'full').length,
  partial: products.filter((p) => p.dataConfidence === 'partial').length,
}
await writeFile(file, JSON.stringify(data))

console.log('Catalog repair complete')
console.log(`  impossible values removed : ${stats.nulledValues}`)
console.log(`  products marked unrated   : ${stats.unrated} (were scored, now honest)`)
console.log(`  swaps before / after      : ${stats.swapsBefore} / ${stats.swapsAfter} (${stats.swapsDropped} unsafe swaps dropped)`)
console.log(`  confidence full/partial/none: ${data.quality.full} / ${data.quality.partial} / ${stats.unrated}`)

/* ---- verify the invariants we just claimed ----------------------------- */
const errors = []
for (const p of products) {
  if (p.score == null && p.alternative) errors.push(`${p.name}: unrated but has a swap`)
  if (p.alternative) {
    const alt = products.find((q) => q.id === p.alternative)
    if (!alt) errors.push(`${p.name}: swap points at a missing product`)
    else if (alt.score == null) errors.push(`${p.name}: swap points at an unrated product`)
    else if (alt.score <= p.score) errors.push(`${p.name}: swap is not actually better`)
  }
  const n = p.nutrients || {}
  for (const k of ['sugar', 'sodium', 'satFat']) {
    if (!isPlausible(k, n[k])) errors.push(`${p.name}: ${k} still implausible (${n[k]})`)
  }
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} invariant violations:`)
  errors.slice(0, 10).forEach((e) => console.error('   ', e))
  process.exit(1)
}
console.log('\n✓ verified: no unrated product is scored, recommended, or carries an impossible value')
