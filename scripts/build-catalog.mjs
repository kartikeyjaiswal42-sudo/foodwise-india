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
const titleCase = (s) => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
const num = (v) => (typeof v === 'number' && isFinite(v)) ? v : (parseFloat(v) || 0)

function cleanName(p) {
  let n = (p.product_name_en || p.product_name || '').trim().replace(/\s+/g, ' ')
  if (!n) return ''
  if (n === n.toUpperCase() || n === n.toLowerCase()) n = titleCase(n)
  return n
}

function goodName(name, brand) {
  const n = name.trim()
  if (n.length < 4) return false
  const letters = (n.match(/[a-zA-Z]/g) || []).length
  if (letters < 4) return false
  // must be mostly latin script (UI font + search are latin)
  const nonAscii = (n.match(/[^\x00-\x7F]/g) || []).length
  if (nonAscii > n.length * 0.3) return false
  const norm = n.toLowerCase().replace(/[^a-z0-9]/g, '')
  const bnorm = (brand || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (bnorm && norm === bnorm) return false
  let rest = n.toLowerCase()
  if (bnorm) rest = rest.replace(brand.toLowerCase(), ' ')
  rest = rest.replace(/\b[\d.]+\s*(g|kg|gm|gms|ml|l|ltr|pc|pcs|pack|packs|x|n)\b/gi, ' ')
             .replace(/[^a-z]/gi, '')
  return rest.length >= 3
}

// Key used to collapse size/pack variants of the same product.
function variantKey(name, brand) {
  let k = name.toLowerCase()
  k = k.replace(/\b[\d.]+\s*(kg|g|gm|gms|grams?|ml|l|ltr|litre|liter|oz|lb)\b/gi, ' ')   // sizes
       .replace(/\b(pack of \d+|family pack|party pack|jumbo|mini|small|large|combo|multipack)\b/gi, ' ')
       .replace(/\b\d+\s*(x|×)\s*\d*\b/gi, ' ')                                          // 4x70 multipacks
       .replace(/\b\d+\s*(pcs?|pieces?|units?|n|u|sachets?|cups?|bottles?|cans?|tins?)\b/gi, ' ')
       .replace(/\(\s*\)/g, ' ')
       .replace(/[^a-z0-9]+/g, '')
  const b = (brand || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (b && !k.startsWith(b)) k = b + k
  return k
}

function imageVariants(url) {
  if (!url) return { small: url, large: url }
  const small = url.replace(/\.(\d+)\.jpg$/i, '.400.jpg')
  const large = url.replace(/\.(\d+)\.jpg$/i, '.full.jpg')
  return { small, large }
}

function categoryOf(tags = []) {
  const t = tags.join(' ')
  const has = (...k) => k.some(x => t.includes(x))
  if (has('noodle','pasta','vermicelli','instant')) return 'Instant food'
  if (has('biscuit','cookie','cracker','rusk','wafer')) return 'Biscuits'
  if (has('chocolate','candies','candy','confecti','sweets','toffee','lollipop','mints','chewing-gum')) return 'Confectionery'
  if (has('chips','crisps','namkeen','savoury-snack','snacks','bhujia','extruded','popcorn','mixture')) return 'Snacks'
  if (has('cheese','butter','milk','dairy','yogurt','curd','paneer','ghee','ice-cream','dahi','lassi')) return 'Dairy'
  if (has('beverage','drink','juice','tea','coffee','squash','soda','water','cola','energy')) return 'Beverages'
  if (has('cereal','breakfast','oats','muesli','cornflakes','poha','granola')) return 'Breakfast'
  if (has('spread','jam','ketchup','sauce','pickle','chutney','honey','peanut-butter','mayonnaise','dressing')) return 'Spreads'
  if (has('flour','atta','rice','dal','pulse','salt','spice','masala','sugar','staple','besan','suji','rava','oil','ghee')) return 'Staples'
  if (has('ready','meal','curry','gravy','heat-and-eat','frozen','soup')) return 'Ready meals'
  if (has('bread','bun','cake','bakery','pastr')) return 'Bakery'
  return 'Other'
}

function nutrientsOf(nm = {}) {
  const sugar = num(nm['sugars_100g'])
  let sodium = nm['sodium_100g'] != null ? num(nm['sodium_100g']) * 1000
            : nm['salt_100g'] != null ? (num(nm['salt_100g']) * 1000) / 2.5
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
    .split(/,(?![^(]*\))/)
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

function estPrice(quantity, category) {
  const m = String(quantity || '').match(/([\d.]+)\s*(kg|g|l|ml)/i)
  let grams = 100
  if (m) { const v = parseFloat(m[1]); const u = m[2].toLowerCase(); grams = (u === 'kg' || u === 'l') ? v * 1000 : v }
  const ratePerKg = { Biscuits: 200, Snacks: 400, Confectionery: 600, Dairy: 280, Beverages: 120, Breakfast: 350, Spreads: 350, Staples: 90, 'Instant food': 300, 'Ready meals': 320, Bakery: 250, Other: 300 }[category] || 300
  return Math.max(5, Math.round((grams / 1000) * ratePerKg))
}

function accentOf(name) {
  const stop = new Set(['the','and','with','of','in','a','for','to','&'])
  const w = name.split(/\s+/).filter(x => !stop.has(x.toLowerCase()))
  return (w.slice(-1)[0] || name).toUpperCase().slice(0, 14)
}

function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }

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
