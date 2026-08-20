#!/usr/bin/env node
/**
 * Checks for the scraping/merge logic. No network — parsers run against
 * hand-written fixtures of the shapes actually observed on BigBasket.
 *
 * The dangerous failure here is not a crash, it is a WRONG NUMBER written
 * confidently into the catalog: a per-serving panel read as per-100 g, or a
 * 2 kg pack's price attached to a 1 kg row. Both are individually plausible and
 * neither would ever throw, so they are what these checks are aimed at.
 *
 * Run: node scripts/test-scrape.mjs
 */
import { parseNutrition, parseIngredients, parseProductPage } from './lib/bb-parse.mjs'

let pass = 0
const fails = []
const ok = (c, n) => { if (c) pass++; else fails.push(n) }
const eq = (a, b, n) => ok(a === b, `${n} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
const guard = (n, fn) => { try { fn() } catch (e) { fails.push(`${n} — threw ${e.message}`) } }

/* ---------- nutrition parsing ---------- */

const PER100 = `<div>Nutrition per gram/ml: 100g
Energy (kcal): 338
Protein (g): 10.7
Carbohydrate (g): 76.0
Total Sugars (g): 3.6
Added Sugars (g): 0.0
Dietary Fibre (g): 10.4
Total Fat (g): 1.3
Saturated Fat (g): 0.3
Sodium (mg): 1.5</div>`

guard('per-100g panel parses', () => {
  const n = parseNutrition(PER100)
  ok(n, 'a panel is found')
  eq(n.per100, true, 'basis is recognised as per 100 g')
  eq(n.calories, 338, 'energy')
  eq(n.protein, 10.7, 'protein')
  eq(n.sugar, 3.6, 'total sugars')
  eq(n.addedSugar, 0, 'added sugars (zero is a real value, not missing)')
  eq(n.fibre, 10.4, 'fibre')
  eq(n.satFat, 0.3, 'saturated fat')
  eq(n.sodium, 1.5, 'sodium')
})

guard('a PER-SERVING panel is refused, not rescaled', () => {
  // THE DANGEROUS ONE. A 30 g serving panel read as per-100 g understates the
  // food by 3.3x, and every individual number still looks plausible.
  const perServing = `Nutrition_per: 30g
Serving_Size: 30g
Energy (kcal): 120
Protein (g): 3.0`
  const n = parseNutrition(perServing)
  ok(n, 'the panel is still parsed')
  eq(n.per100, false, 'but it is NOT flagged as per-100 g')
  eq(n.basis, '30g', 'and the real basis is recorded so a caller can see why')
})

guard('per 100 ml counts as per-100', () => {
  eq(parseNutrition('Nutrition per gram/ml: 100ml\nEnergy (kcal): 42').per100, true, '100 ml is a valid basis')
})

guard('kilojoule-only energy is converted', () => {
  const n = parseNutrition('Nutrition per gram/ml: 100g\nEnergy (kj): 1414\nProtein (g): 2')
  eq(n.calories, 338, '1414 kJ becomes 338 kcal')
})

guard('salt is converted to sodium when sodium is absent', () => {
  const n = parseNutrition('Nutrition per gram/ml: 100g\nEnergy (kcal): 10\nSalt (g): 1')
  eq(n.sodium, 393, '1 g of salt is 393 mg of sodium')
})

guard('a block with no nutrition returns nothing', () => {
  eq(parseNutrition('<div>Store in a cool dry place.</div>'), null, 'storage text is not a panel')
  eq(parseNutrition(''), null, 'empty content is not a panel')
})

/* ---------- ingredient parsing ---------- */

guard('ingredients stop where the panel begins', () => {
  // The regression: a pattern demanding an immediate colon after "Nutrition"
  // skipped "Nutrition per gram/ml:" and cut at "Energy (kcal)" instead,
  // leaving the panel's own header as the sole "ingredient".
  const blob = `Ingredients: Refined wheat flour, sugar, palm oil, salt.
Nutrition per gram/ml: 100g
Energy (kcal): 480`
  const ing = parseIngredients(blob)
  ok(ing.length >= 3, `the real ingredients survive (${JSON.stringify(ing)})`)
  ok(!ing.some((i) => /nutrition|energy|kcal/i.test(i)), 'no panel text leaks into the ingredient list')
  ok(/wheat flour/i.test(ing[0]), 'the first ingredient is the first ingredient')
})

guard('a panel-only block yields no ingredients', () => {
  eq(parseIngredients(PER100).length, 0, 'a tab holding only a panel has no ingredient statement')
})

/* ---------- page parsing ---------- */

const page = (obj) => `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(obj)}</script></html>`

guard('every pack-size variant becomes its own record', () => {
  const html = page({ props: { pageProps: { productDetails: { children: [
    { id: 1, desc: 'Toor Dal', brand: { name: 'Tata Sampann', slug: 'tata-sampann' }, w: '1 kg',
      pricing: { discount: { mrp: '199' } }, images: [{ l: 'x.jpg' }],
      tabs: [{ title: 'Ingredients', content: PER100 }],
      children: [
        { id: 2, desc: 'Toor Dal', brand: { name: 'Tata Sampann' }, w: '500 g', pricing: { discount: { mrp: '105' } }, tabs: [] },
      ] },
  ] } } } })
  const rows = parseProductPage(html, 'u')
  eq(rows.length, 2, 'parent and child variants both returned')
  eq(rows[0].mrp, 199, 'MRP is read as a number')
  eq(rows[1].size, '500 g', 'the child keeps its own pack size')
  ok(rows[0].nutrition?.per100, 'the parent carries its panel')
  eq(rows[1].nutrition, null, 'the child genuinely has none')
})

guard('a page with no data blob returns nothing rather than throwing', () => {
  eq(parseProductPage('<html>bot wall</html>', 'u').length, 0, 'a blocked page yields no records')
  eq(parseProductPage('', 'u').length, 0, 'empty html yields no records')
})

guard('a variant with no id is skipped', () => {
  const html = page({ props: { pageProps: { productDetails: { children: [
    { desc: 'No id here', brand: { name: 'Tata' }, tabs: [] },
  ] } } } })
  eq(parseProductPage(html, 'u').length, 0, 'an unidentifiable variant is dropped')
})

console.log(`\n${fails.length ? '✗' : '✓'} scrape logic: ${pass} checks passed, ${fails.length} failed`)
if (fails.length) { for (const f of fails) console.log('   ✗', f); process.exit(1) }
