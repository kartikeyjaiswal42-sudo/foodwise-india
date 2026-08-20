#!/usr/bin/env node
/**
 * Splits the generated product catalog OUT of the JS bundle.
 *
 * `src/data/foodDatabase.js` used to export the whole 887-product array, so every
 * byte of it was compiled into the client page chunk (1.13 MB raw / 170 kB gzip)
 * and had to parse before first paint. This writes the array to
 * `public/data/catalog.json` instead — fetched once, cached by the service worker,
 * and refreshable without a rebuild.
 *
 * Reads the CURRENT products export (whatever the source of truth is: the
 * generated file, or an existing catalog.json) so it is safe to re-run.
 *
 * Usage: node scripts/split-catalog.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const jsonOut = path.join(root, 'public', 'data', 'catalog.json')

async function loadProducts() {
  // Prefer a legacy full foodDatabase.js if it still holds the array.
  const dbPath = path.join(root, 'src', 'data', 'foodDatabase.js')
  const src = await readFile(dbPath, 'utf8')
  if (/export const products = \[/.test(src) && src.length > 50_000) {
    const mod = await import(path.join('file://', dbPath))
    return { products: mod.products, categories: mod.categories }
  }
  // Already split — reuse the JSON so re-runs are idempotent.
  if (existsSync(jsonOut)) {
    const prev = JSON.parse(await readFile(jsonOut, 'utf8'))
    const mod = await import(path.join('file://', dbPath))
    return {
      products: prev.products || prev,
      categories: mod.categories,
      // Carry repair metadata through. Dropping it would make a repaired
      // catalog look unrepaired to anything that checks, and re-running the
      // splitter would quietly erase the audit trail.
      quality: prev.quality,
      repaired: prev.repaired,
    }
  }
  throw new Error('No catalog found in src/data/foodDatabase.js and no public/data/catalog.json')
}

const { products, categories, quality, repaired } = await loadProducts()

if (!Array.isArray(products) || products.length === 0) {
  throw new Error('Refusing to write an empty catalog')
}

await mkdir(path.dirname(jsonOut), { recursive: true })

// Minified on purpose: this is a transfer payload, never hand-edited.
const payload = {
  generated: new Date().toISOString(),
  count: products.length,
  categories,
  ...(quality ? { quality } : {}),
  ...(repaired ? { repaired } : {}),
  products,
}
await writeFile(jsonOut, JSON.stringify(payload))

const bytes = JSON.stringify(payload).length
console.log(`Wrote ${products.length} products → public/data/catalog.json (${(bytes / 1024).toFixed(0)} kB)`)
console.log(`Categories: ${categories.length}`)
