// Build a real-data food catalog from Open Food Facts (open, CC-licensed).
// Each product carries a REAL front-of-pack photo + real ingredients + real
// per-100g nutrition. Scores/grades/concerns are derived from the real data.
//
// Run: node scripts/build-catalog.mjs   (writes src/data/foodDatabase.js)
import fs from 'fs'

const UA = 'FoodwiseIndia/1.0 (jaano; educational; contact via github kartikeyjaiswal42-sudo/foodwise-india)'
const DELAY_MS = 6500          // OFF search API ~10 req/min
const MAX_PAGES = 4            // up to 400 products per brand
const PAGE_SIZE = 100

// brand slug (OFF brands_tags) -> { company, palette }
const COMPANIES = {
  'Nestlé India':       { color: '#C8202F', ink: '#FFF', brands: ['maggi','nescafe','kit-kat','kitkat','milkmaid','munch','milkybar','nestle','everyday','ceregrow','nestle-india','polo'] },
  'Britannia':          { color: '#E51F2A', ink: '#FFF', brands: ['britannia','good-day','marie-gold','tiger','bourbon','nutrichoice','milk-bikis','treat','jim-jam','little-hearts','50-50','pure-magic'] },
  "Haldiram's":         { color: '#E4002B', ink: '#FFF', brands: ['haldiram','haldiram-s','haldirams'] },
  'ITC':                { color: '#0A5D3B', ink: '#FFF', brands: ['aashirvaad','sunfeast','bingo','yippee','b-natural','candyman','mint-o','itc','dark-fantasy'] },
  'Parle Products':     { color: '#FFC20E', ink: '#1A2B49', brands: ['parle','parle-g','monaco','hide-seek','hide-and-seek','melody','mango-bite','krackjack','20-20','parle-products'] },
  'Amul':               { color: '#ED1C24', ink: '#FFF', brands: ['amul'] },
  'PepsiCo India':      { color: '#0E4D92', ink: '#FFF', brands: ['lay-s','lays','kurkure','quaker','tropicana','doritos','cheetos','uncle-chipps'] },
  'Mother Dairy':       { color: '#00A551', ink: '#FFF', brands: ['mother-dairy','dhara','safal'] },
  'Tata Consumer':      { color: '#486AAE', ink: '#FFF', brands: ['tata','tata-sampann','tata-salt','tata-tea','tetley','soulfull','tata-consumer','himalayan'] },
  'MTR / Mondelez':     { color: '#5C2D91', ink: '#FFF', brands: ['mtr','cadbury','bournvita','oreo','5-star','dairy-milk','gems','perk','halls','milka'] },
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function fetchPage(brand, page) {
  const fields = 'code,product_name,product_name_en,brands,quantity,categories_tags,nutriments,nutriscore_grade,nova_group,ingredients_text,ingredients_text_en,additives_tags,image_front_url,image_front_small_url'
  const url = `https://world.openfoodfacts.org/api/v2/search?brands_tags=${encodeURIComponent(brand)}&countries_tags=en:india&states_tags=en:front-photo-selected&fields=${fields}&page_size=${PAGE_SIZE}&page=${page}`
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (res.status === 429) { await sleep(15000); continue }
      if (!res.ok) { await sleep(3000); continue }
      return await res.json()
    } catch { await sleep(4000) }
  }
  return { products: [], count: 0 }
}

// ---- helpers ---------------------------------------------------------------
const titleCase = (s) => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
const num = (v) => (typeof v === 'number' && isFinite(v)) ? v : (parseFloat(v) || 0)

function cleanName(p) {
  let n = (p.product_name_en || p.product_name || '').trim().replace(/\s+/g, ' ')
  if (!n) return ''
  // title-case ALL-CAPS or all-lower noise
  if (n === n.toUpperCase() || n === n.toLowerCase()) n = titleCase(n)
  return n
}

function categoryOf(tags = [], company) {
  const t = tags.join(' ')
  const has = (...k) => k.some(x => t.includes(x))
  if (has('noodle','pasta','vermicelli')) return 'Instant food'
  if (has('biscuit','cookie','cracker','rusk')) return 'Biscuits'
  if (has('chocolate','candies','candy','confectice','sweets','toffee','lollipop','mints')) return 'Confectionery'
  if (has('chips','crisps','namkeen','savoury-snack','snacks','bhujia','extruded')) return 'Snacks'
  if (has('cheese','butter','milk','dairy','yogurt','curd','paneer','ghee','ice-cream','dahi')) return 'Dairy'
  if (has('beverage','drink','juice','tea','coffee','squash','soda','water')) return 'Beverages'
  if (has('cereal','breakfast','oats','muesli','cornflakes','poha')) return 'Breakfast'
  if (has('spread','jam','ketchup','sauce','pickle','chutney','honey','peanut-butter')) return 'Spreads'
  if (has('flour','atta','rice','dal','pulse','salt','spice','masala','sugar','staple','besan','suji','rava')) return 'Staples'
  if (has('ready','meal','curry','gravy','heat-and-eat','frozen')) return 'Ready meals'
  return 'Other'
}

function nutrientsOf(nm = {}) {
  const sugar = num(nm['sugars_100g'])
  let sodium = nm['sodium_100g'] != null ? num(nm['sodium_100g']) * 1000      // g -> mg
            : nm['salt_100g'] != null ? (num(nm['salt_100g']) * 1000) / 2.5   // salt -> sodium mg
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
  // heuristic when Nutri-Score absent: start 80, penalise per-100g excess + processing
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
    .split(/,(?![^(]*\))/)            // split on commas not inside ()
    .map(s => s.trim())
    .filter(s => s && s.length < 80)
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
  const eNums = additives.map(a => a.replace('en:', '').toUpperCase()).filter(Boolean)
  if (eNums.length) c.push({ name: `${eNums.length} food additive${eNums.length > 1 ? 's' : ''}`, level: eNums.length >= 4 ? 'high' : 'medium', amount: eNums.slice(0, 6).join(', '), note: 'Permitted additives (INS/E numbers) declared on the label.' })
  return c
}

// rough est. price (₹) from quantity + category — UI labels this "est. cost"
function estPrice(quantity, category) {
  const m = String(quantity || '').match(/([\d.]+)\s*(kg|g|l|ml)/i)
  let grams = 100
  if (m) { const v = parseFloat(m[1]); const u = m[2].toLowerCase(); grams = (u === 'kg' || u === 'l') ? v * 1000 : v }
  const ratePerKg = { Biscuits: 200, Snacks: 400, Confectionery: 600, Dairy: 280, Beverages: 120, Breakfast: 350, Spreads: 350, Staples: 90, 'Instant food': 300, 'Ready meals': 320, Other: 300 }[category] || 300
  return Math.max(5, Math.round((grams / 1000) * ratePerKg))
}

function accentOf(name) {
  const stop = new Set(['the','and','with','of','in','a','for','to','&'])
  const w = name.split(/\s+/).filter(x => !stop.has(x.toLowerCase()))
  return (w.slice(-1)[0] || name).toUpperCase().slice(0, 14)
}

// ---- main ------------------------------------------------------------------
const seenCodes = new Set()
const seenKey = new Set()
const out = []
const brandToCompany = {}
for (const [company, info] of Object.entries(COMPANIES)) for (const b of info.brands) brandToCompany[b] = company

const allBrands = Object.entries(COMPANIES).flatMap(([c, i]) => i.brands.map(b => [b, c]))
console.error(`Fetching ${allBrands.length} brand queries from Open Food Facts...`)

for (const [brand, company] of allBrands) {
  const palette = COMPANIES[company]
  let total = 0
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchPage(brand, page)
    const list = data.products || []
    if (page === 1) total = data.count || 0
    for (const p of list) {
      if (!p.code || seenCodes.has(p.code)) continue
      const img = p.image_front_url || p.image_front_small_url
      const name = cleanName(p)
      if (!img || !name || name.length < 3) continue
      const nname = name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const key = `${company}|${nname}`
      if (seenKey.has(key)) continue
      seenCodes.add(p.code); seenKey.add(key)
      const category = categoryOf(p.categories_tags, company)
      const nutr = nutrientsOf(p.nutriments)
      const { score, grade } = scoreGrade(p, nutr)
      out.push({
        id: `off-${p.code}`,
        image: img,
        name,
        brand: (p.brands || '').split(',')[0].trim() || titleCase(brand.replace(/-/g, ' ')),
        company,
        category,
        price: estPrice(p.quantity, category),
        size: (p.quantity || '1 pack').trim(),
        score, grade,
        color: palette.color, ink: palette.ink, accent: accentOf(name),
        calories: Math.round(num(p.nutriments?.['energy-kcal_100g'])) || 0,
        servingSize: '100 g',
        nutrients: nutr,
        concerns: concernsOf(nutr, p.additives_tags || []),
        ingredients: ingredientsOf(p),
        alternative: null,
        alternativeCompare: { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] },
      })
    }
    if (list.length < PAGE_SIZE) break
    await sleep(DELAY_MS)
  }
  console.error(`  ${brand} (${company}): +${out.length} total so far  [brand reports ${total}]`)
  await sleep(DELAY_MS)
}

// ---- assign healthier alternatives within the same category ----------------
const perGram = (pr) => {
  const m = String(pr.size).match(/([\d.]+)\s*(kg|g|l|ml)/i)
  if (!m) return null
  const v = parseFloat(m[1]); const u = m[2].toLowerCase()
  const grams = (u === 'kg' || u === 'l') ? v * 1000 : v
  return grams > 0 ? pr.price / grams : null
}
const byCat = {}
for (const p of out) (byCat[p.category] ||= []).push(p)
for (const p of out) {
  const peers = (byCat[p.category] || []).filter(q => q.id !== p.id && q.score > p.score + 8)
  if (!peers.length) continue
  peers.sort((a, b) => b.score - a.score)
  const alt = peers[0]
  p.alternative = alt.id
  const baseIng = new Set(p.ingredients.map(x => x.toLowerCase()))
  const altIng = new Set(alt.ingredients.map(x => x.toLowerCase()))
  const avoided = p.ingredients.filter(x => !altIng.has(x.toLowerCase())).slice(0, 4)
  const pg1 = perGram(p), pg2 = perGram(alt)
  p.alternativeCompare = {
    pricePerUnitDiffText: (pg1 && pg2) ? `₹${pg1.toFixed(2)}/g vs ₹${pg2.toFixed(2)}/g` : `₹${p.price} vs ₹${alt.price}`,
    ingredientsAvoided: avoided,
    ingredientsReplacedWith: [],
  }
}

// ---- categories present (ordered) ------------------------------------------
const CAT_ORDER = ['Snacks','Biscuits','Confectionery','Dairy','Beverages','Breakfast','Instant food','Spreads','Staples','Ready meals','Other']
const present = CAT_ORDER.filter(c => out.some(p => p.category === c))
const categories = ['All', ...present]

out.sort((a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name))

const header = `// AUTO-GENERATED by scripts/build-catalog.mjs from Open Food Facts (openfoodfacts.org, ODbL).
// Real packaging photos + real ingredients + per-100g nutrition for India-market products.
// Scores, grades, concerns and price estimates are DERIVED from the source data. Do not hand-edit;
// re-run the script to refresh. ${out.length} products across ${Object.keys(COMPANIES).length} companies.
`
const body = `${header}
export const products = ${JSON.stringify(out, null, 2)}

export const categories = ${JSON.stringify(categories)}
`
fs.writeFileSync('src/data/foodDatabase.js', body)
const byCompany = {}
for (const p of out) byCompany[p.company] = (byCompany[p.company] || 0) + 1
console.error(`\nWROTE ${out.length} products. Categories: ${categories.join(', ')}`)
console.error('Per company:', JSON.stringify(byCompany, null, 2))
