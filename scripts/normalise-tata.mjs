#!/usr/bin/env node
/**
 * Canonicalise brand spelling and category on Tata rows already in the catalog.
 *
 * The curation pass only rewrites rows the harvest returned. Rows that predate
 * it keep whatever a contributor typed, so the Companies screen was listing
 * "Tata Tea", "Tata tea" and "TATA Tea" as three different brands — which makes
 * each look like a smaller operation than it is and splits its products across
 * three cards. Cosmetic in isolation, but it is the directory's whole job.
 *
 * Usage: node scripts/normalise-tata.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = path.join(root, 'public', 'data', 'catalog.json')

const CANON = [
  [/^tata\s*tea/i, 'Tata Tea'],
  [/^tetley/i, 'Tetley'],
  [/^teapigs/i, 'Teapigs'],
  [/^tata\s*sampann/i, 'Tata Sampann'],
  [/^(tata\s*)?i[-\s]?shakti/i, 'Tata i-Shakti'],
  [/^tata\s*salt/i, 'Tata Salt'],
  [/^(tata\s*)?soulfull/i, 'Tata Soulfull'],
  [/^ching/i, "Ching's Secret"],
  [/^smith/i, 'Smith & Jones'],
  [/^organic\s*india$/i, 'Organic India'],
  [/^tulsi$/i, 'Organic India'],
  [/^good\s*earth/i, 'Good Earth'],
  [/^eight\s*o'?\s*clock/i, "Eight O'Clock Coffee"],
  [/^tata\s*coffee/i, 'Tata Coffee'],
  [/^tata\s*(global\s*beverages|consumer.*)$/i, 'Tata Consumer Products'],
  [/^(tata\s*)?simply\s*better/i, 'Tata Simply Better'],
  [/^himalayan/i, 'Himalayan'],
  [/^tata\s*copper/i, 'Tata Copper+'],
  [/^tata\s*gluco/i, 'Tata Gluco Plus'],
  [/^tata\s*water/i, 'Tata Water Plus'],
  [/^tata\s*q$/i, 'Tata Q'],
  [/^tata\s*coffee/i, 'Tata Coffee'],
  [/^chings?$/i, "Ching's Secret"],
  [/^tata\s*nx/i, 'Tata Nx'],
  [/^tata$/i, 'Tata'],
]

function categoryFallback(name, brand) {
  const t = `${name} ${brand}`.toLowerCase()
  const has = (...k) => k.some((x) => t.includes(x))
  if (has('tea', 'chai', 'coffee', 'kaapi', 'water', 'juice', 'drink', 'beverage', 'latte')) return 'Beverages'
  if (has('salt', 'dal', 'daal', 'atta', 'besan', 'masala', 'haldi', 'turmeric', 'chilli', 'jeera', 'rice', 'poha', 'sugar', 'spice', 'powder', 'flour', 'ghee', 'oil')) return 'Staples'
  if (has('noodle', 'hakka', 'pasta', 'soup', 'instant')) return 'Instant food'
  if (has('sauce', 'chutney', 'ketchup', 'schezwan', 'paste', 'honey', 'jam')) return 'Spreads'
  if (has('muesli', 'oats', 'bites', 'flakes', 'breakfast', 'granola')) return 'Breakfast'
  if (has('biscuit', 'cookie')) return 'Biscuits'
  return 'Other'
}

const cat = JSON.parse(await readFile(file, 'utf8'))
let brands = 0
let cats = 0
for (const p of cat.products) {
  if (p.company !== 'Tata Consumer') continue
  const hit = CANON.find(([re]) => re.test(String(p.brand || '').trim()))
  if (hit && p.brand !== hit[1]) { p.brand = hit[1]; brands++ }
  if (p.category === 'Other') {
    const next = categoryFallback(p.name, p.brand)
    if (next !== 'Other') { p.category = next; cats++ }
  }
}
await writeFile(file, JSON.stringify(cat))
const tata = cat.products.filter((p) => p.company === 'Tata Consumer')
const byBrand = {}
for (const p of tata) byBrand[p.brand] = (byBrand[p.brand] || 0) + 1
console.error(`normalised ${brands} brand names, ${cats} categories`)
console.error(`Tata brands now: ${Object.entries(byBrand).sort((a, b) => b[1] - a[1]).map(([b, n]) => `${b}:${n}`).join(', ')}`)
const byCat = {}
for (const p of tata) byCat[p.category] = (byCat[p.category] || 0) + 1
console.error('categories:', JSON.stringify(byCat))
