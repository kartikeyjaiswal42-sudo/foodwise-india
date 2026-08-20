// Build a real-data food catalog from Open Food Facts (open, CC-licensed).
// v2 (2026-06-13): targets 5000+ UNIQUE products across the whole India market.
//   Tier A: countries=india + front-photo-selected + ingredients-completed (best data)
//   Tier B: category slices of countries=india + front-photo-selected (fills to target)
// Size variants ("Maggi 70g" vs "Maggi 280g") are collapsed by a size-stripped name key.
//
// Run: node scripts/build-catalog.mjs   (writes src/data/foodDatabase.js)
import fs from 'fs'

const UA = 'FoodwiseIndia/1.0 (jaano; educational; contact via github kartikeyjaiswal42-sudo/foodwise-india)'
const DELAY_MS = 6500          // OFF search API ~10 req/min
const PAGE_SIZE = 100
const TARGET = 5400           // unique products to aim for (>5000 after any later pruning)
const FIELDS = 'code,product_name,product_name_en,brands,brands_tags,quantity,categories_tags,nutriments,nutriscore_grade,nova_group,ingredients_text,ingredients_text_en,additives_tags,image_front_url,image_front_small_url'

// brand slug (OFF brands_tags) -> parent company + palette (applied post-hoc from brands_tags)
const COMPANIES = {
  'Nestlé India':   { color: '#C8202F', ink: '#FFF', brands: ['maggi','nescafe','kit-kat','kitkat','milkmaid','munch','milkybar','nestle','everyday','ceregrow','nestle-india','polo','nesplus','nangrow','lactogrow','koko-krunch','nestle-everyday','maggi-masala-magic','maggi-pazzta','a-+'] },
  'Britannia':      { color: '#E51F2A', ink: '#FFF', brands: ['britannia','good-day','marie-gold','tiger','bourbon','nutrichoice','milk-bikis','treat','jim-jam','little-hearts','50-50','pure-magic','winkin-cow','nice-time','marie','britannia-cheese','britannia-bourbon','time-pass','britannia-good-day'] },
  "Haldiram's":     { color: '#E4002B', ink: '#FFF', brands: ['haldiram','haldiram-s','haldirams','haldiram-nagpur','haldiram-s-nagpur'] },
  'ITC':            { color: '#0A5D3B', ink: '#FFF', brands: ['aashirvaad','sunfeast','bingo','yippee','b-natural','candyman','mint-o','itc','dark-fantasy','sunfeast-mom-s-magic','sunfeast-dark-fantasy','sunfeast-bounce','farmland','kitchens-of-india','gum-on','fabelle','aashirvaad-svasti','sunfeast-yippee'] },
  'Parle Products': { color: '#FFC20E', ink: '#1A2B49', brands: ['parle','parle-g','monaco','hide-seek','hide-and-seek','melody','mango-bite','krackjack','20-20','parle-products','kismi','poppins','rol-a-cola','parle-marie','magix','happy-happy','milk-shakti','parle-platina','parle-20-20'] },
  'Amul':           { color: '#ED1C24', ink: '#FFF', brands: ['amul','amul-kool','amul-taaza','amul-gold','amul-masti'] },
  'PepsiCo India':  { color: '#0E4D92', ink: '#FFF', brands: ['lay-s','lays','kurkure','quaker','tropicana','doritos','cheetos','uncle-chipps','lehar','quaker-oats','kurkure-triangles','pepsi','mirinda','7up','mountain-dew','slice','sting'] },
  'Mother Dairy':   { color: '#00A551', ink: '#FFF', brands: ['mother-dairy','dhara','safal','mother-dairy-classic'] },
  'Tata Consumer':  { color: '#486AAE', ink: '#FFF', brands: ['tata','tata-sampann','tata-salt','tata-tea','tetley','soulfull','tata-consumer','himalayan','tata-soulfull','tata-gluco-plus','tata-coffee','ching-s-secret','ching-s','smith-jones','tata-q','tata-sampann-yumside','tata-simply-better'] },
  'MTR / Mondelez': { color: '#5C2D91', ink: '#FFF', brands: ['mtr','cadbury','bournvita','oreo','5-star','dairy-milk','gems','perk','halls','milka','cadbury-dairy-milk','cadbury-bournville','toblerone','tang','cadbury-silk','cadbury-gems','mtr-foods','cadbury-5-star','cadbury-celebrations'] },
  'Hindustan Unilever': { color: '#1F36C7', ink: '#FFF', brands: ['kissan','knorr','bru','brooke-bond','red-label','taj-mahal','horlicks','boost','kwality-wall-s','kwality-walls','magnum','cornetto','lipton','annapurna','3-roses'] },
  'Dabur':          { color: '#0B7A3B', ink: '#FFF', brands: ['dabur','real','real-activ','hommade','hajmola','dabur-honey'] },
  'Marico':         { color: '#0072BC', ink: '#FFF', brands: ['saffola','saffola-oats','saffola-fittify','parachute'] },
  'Coca-Cola India':{ color: '#F40009', ink: '#FFF', brands: ['coca-cola','thums-up','sprite','fanta','limca','maaza','minute-maid','kinley','coke'] },
  'Bikaji':         { color: '#D7263D', ink: '#FFF', brands: ['bikaji','bikaji-foods'] },
  'Balaji':         { color: '#1B998B', ink: '#FFF', brands: ['balaji','balaji-wafers'] },
  'Patanjali':      { color: '#F26522', ink: '#FFF', brands: ['patanjali','patanjali-ayurved'] },
  'Adani Wilmar':   { color: '#7B2D8B', ink: '#FFF', brands: ['fortune','adani-wilmar','kohinoor'] },
}

// palette for everyone else (hash-picked, readable inks)
const FALLBACK_PALETTES = [
  ['#264653','#FFF'],['#2A9D8F','#FFF'],['#E76F51','#FFF'],['#6D597A','#FFF'],['#355070','#FFF'],
  ['#B56576','#FFF'],['#4C956C','#FFF'],['#3D5A80','#FFF'],['#9B2226','#FFF'],['#5F0F40','#FFF'],
  ['#1D3557','#FFF'],['#7F5539','#FFF'],['#0F4C5C','#FFF'],['#8338EC','#FFF'],['#AD2831','#FFF'],
  ['#FB8500','#1A2B49'],['#FFB703','#1A2B49'],['#80B918','#1A2B49'],['#00B4D8','#1A2B49'],['#E9C46A','#1A2B49'],
]

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

let SORT = '&sort_by=unique_scans_n'
async function fetchPage(extraParams, page) {
  const url = `https://world.openfoodfacts.org/api/v2/search?countries_tags=en:india&fields=${FIELDS}&page_size=${PAGE_SIZE}&page=${page}${extraParams}${SORT}`
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (res.status === 429) { await sleep(20000); continue }
      if (!res.ok) { await sleep(5000); continue }
      const j = await res.json()
      return j
    } catch { await sleep(5000) }
  }
  return { products: [], count: 0 }
}

// ---- helpers ---------------------------------------------------------------
// Shaping helpers live in scripts/lib/catalog-shape.mjs so the Tata curation
// pass (scripts/curate-tata.mjs) scores products by the exact same rules.
import {
  titleCase, num, cleanName, goodName, variantKey, imageVariants, categoryOf, nutrientsOf, GRADE_FROM_NS, SCORE_FROM_NS, scoreGrade, ingredientsOf, concernsOf, estPrice, accentOf, hashCode,
} from './lib/catalog-shape.mjs'

// ---- main ------------------------------------------------------------------
const brandToCompany = {}
for (const [company, info] of Object.entries(COMPANIES)) for (const b of info.brands) brandToCompany[b] = company

const seenCodes = new Set()
const seenKey = new Set()
const out = []

function addProduct(p) {
  if (out.length >= TARGET) return false
  if (!p.code || seenCodes.has(p.code)) return false
  const img = p.image_front_url || p.image_front_small_url
  const name = cleanName(p)
  const brandName = (p.brands || '').split(',')[0].trim()
  if (!img || !name || !brandName || !goodName(name, brandName)) return false
  const key = variantKey(name, brandName)
  if (seenKey.has(key)) return false
  seenCodes.add(p.code); seenKey.add(key)

  let company = null, color = null, ink = null
  for (const tag of (p.brands_tags || [])) {
    const slug = tag.replace(/^en:/, '')
    if (brandToCompany[slug]) { company = brandToCompany[slug]; color = COMPANIES[company].color; ink = COMPANIES[company].ink; break }
  }
  if (!company) {
    company = titleCase(brandName)
    const pal = FALLBACK_PALETTES[hashCode(company) % FALLBACK_PALETTES.length]
    color = pal[0]; ink = pal[1]
  }

  const category = categoryOf(p.categories_tags)
  const nutr = nutrientsOf(p.nutriments)
  const { score, grade } = scoreGrade(p, nutr)
  const { small } = imageVariants(img)
  out.push({
    id: `off-${p.code}`,
    image: small,
    name,
    brand: brandName,
    company,
    category,
    price: estPrice(p.quantity, category),
    size: (p.quantity || '1 pack').trim(),
    score, grade,
    color, ink, accent: accentOf(name),
    calories: Math.round(num(p.nutriments?.['energy-kcal_100g'])) || 0,
    servingSize: '100 g',
    nutrients: nutr,
    concerns: concernsOf(nutr, p.additives_tags || []),
    ingredients: ingredientsOf(p),
    alternative: null,
    alternativeCompare: { pricePerUnitDiffText: '', ingredientsAvoided: [], ingredientsReplacedWith: [] },
  })
  return true
}

async function sweep(label, extraParams, maxPages = 100) {
  console.error(`\n=== SWEEP: ${label} ===`)
  let emptyStreak = 0
  for (let page = 1; page <= maxPages; page++) {
    if (out.length >= TARGET) return
    const data = await fetchPage(extraParams, page)
    const list = data.products || []
    // disable sort param if the API rejects it
    if (page === 1 && SORT && !list.length && (data.count || 0) === 0) {
      SORT = ''
      console.error('  (sort param rejected — retrying without sort)')
      const retry = await fetchPage(extraParams, page)
      if (retry.products?.length) { for (const p of retry.products) addProduct(p); await sleep(DELAY_MS); continue }
    }
    // Stop only when the API truly runs out (2 empty pages) or we pass the pool size.
    // A SHORT page (<PAGE_SIZE) is normal on OFF and must NOT abort the sweep.
    const poolPages = Math.ceil((data.count || 0) / PAGE_SIZE)
    if (list.length === 0) { if (++emptyStreak >= 2) return } else emptyStreak = 0
    let added = 0
    for (const p of list) { if (addProduct(p)) added++ }
    console.error(`  ${label} p${page}/${Math.min(maxPages, poolPages || maxPages)}: +${added}  total=${out.length}  (pool ${data.count || 0})`)
    if (poolPages && page >= poolPages) return
    await sleep(DELAY_MS)
  }
}

// Tier A — best data: photo + completed ingredients (whole India pool, ~5.2k)
await sweep('photo+ingredients', '&states_tags=en:front-photo-selected,en:ingredients-completed', 100)

// Tier B — photo only, sliced by category to stay under the 10k deep-page cap
const SLICES = ['en:snacks','en:sweet-snacks','en:salty-snacks','en:beverages','en:dairies','en:biscuits-and-cakes',
  'en:chocolates','en:noodles','en:breakfasts','en:sauces','en:spreads','en:frozen-foods','en:desserts',
  'en:confectioneries','en:cereals-and-potatoes','en:condiments','en:meals','en:flours','en:teas','en:juices-and-nectars',
  'en:ice-creams-and-sorbets','en:yogurts','en:cheeses','en:breads','en:plant-based-beverages','en:legumes-and-their-products']
for (const slice of SLICES) {
  if (out.length >= TARGET) break
  await sweep(`photo-only ${slice}`, `&states_tags=en:front-photo-selected&categories_tags=${slice}`, 100)
}

// Tier C — catch-all: most-scanned India products with a front photo (pool ~17k,
// deep-page-capped at 100 pages). Fills any remainder up to TARGET.
if (out.length < TARGET) await sweep('photo-only ALL India', '&states_tags=en:front-photo-selected', 100)

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
for (const cat of Object.keys(byCat)) byCat[cat].sort((a, b) => b.score - a.score)
for (const p of out) {
  const peers = byCat[p.category]
  const alt = peers.find(q => q.id !== p.id && q.score > p.score + 8 && q.ingredients.length)
  if (!alt) continue
  p.alternative = alt.id
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
const CAT_ORDER = ['Snacks','Biscuits','Confectionery','Dairy','Beverages','Breakfast','Instant food','Spreads','Staples','Ready meals','Bakery','Other']
const present = CAT_ORDER.filter(c => out.some(p => p.category === c))
const categories = ['All', ...present]

out.sort((a, b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name))

const header = `// AUTO-GENERATED by scripts/build-catalog.mjs from Open Food Facts (openfoodfacts.org, ODbL).
// Real packaging photos + real ingredients + per-100g nutrition, India market.
// ${out.length} unique products (size/pack variants collapsed). Do not hand-edit; re-run the script.
// Compact JSON on purpose — this file ships to the browser. imageLarge is derived at load.
`
const body = `${header}
const RAW = ${JSON.stringify(out)}

export const products = RAW.map(p => ({ ...p, imageLarge: p.image.replace(/\\.400\\.jpg$/, '.full.jpg') }))

export const categories = ${JSON.stringify(categories)}
`
fs.writeFileSync('src/data/foodDatabase.js', body)
const byCompany = {}
for (const p of out) byCompany[p.company] = (byCompany[p.company] || 0) + 1
const top = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 25)
console.error(`\nWROTE ${out.length} products, ${Object.keys(byCompany).length} companies. Categories: ${categories.join(', ')}`)
console.error('Top companies:', JSON.stringify(top))
