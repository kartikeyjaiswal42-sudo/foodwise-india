// Shared product-shaping helpers.
//
// EXTRACTED FROM build-catalog.mjs so that every path which writes a product into
// the catalog scores it identically. Two copies of this scoring logic is how a
// catalog silently splits into two standards: the Tata curation pass would grade
// a biscuit one way and the main sweep another, and nothing would ever tell you.
//
// Pure functions only — no network, no filesystem, no state.

export const titleCase = (s) => s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
export const num = (v) => (typeof v === 'number' && isFinite(v)) ? v : (parseFloat(v) || 0)

export function cleanName(p) {
  let n = (p.product_name_en || p.product_name || '').trim().replace(/\s+/g, ' ')
  if (!n) return ''
  if (n === n.toUpperCase() || n === n.toLowerCase()) n = titleCase(n)
  return n
}

export function goodName(name, brand) {
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
export function variantKey(name, brand) {
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

export function imageVariants(url) {
  if (!url) return { small: url, large: url }
  const small = url.replace(/\.(\d+)\.jpg$/i, '.400.jpg')
  const large = url.replace(/\.(\d+)\.jpg$/i, '.full.jpg')
  return { small, large }
}

export function categoryOf(tags = []) {
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

export function nutrientsOf(nm = {}) {
  const sugar = num(nm['sugars_100g'])
  let sodium = nm['sodium_100g'] != null ? num(nm['sodium_100g']) * 1000
            : nm['salt_100g'] != null ? (num(nm['salt_100g']) * 1000) / 2.5
            : 0
  const satFat = num(nm['saturated-fat_100g'])
  const r = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d
  return { sugar: r(sugar, 1), sodium: Math.round(sodium), satFat: r(satFat, 1) }
}

export const GRADE_FROM_NS = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' }
export const SCORE_FROM_NS = { a: 88, b: 76, c: 60, d: 44, e: 30 }

export function scoreGrade(p, nutr) {
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

export function ingredientsOf(p) {
  const txt = (p.ingredients_text_en || p.ingredients_text || '').trim()
  if (!txt) return []
  return txt
    .replace(/_/g, '')
    .split(/,(?![^(]*\))/)
    .map(s => s.trim())
    .filter(s => s && s.length < 80)
    .slice(0, 30)
}

export function concernsOf(nutr, additives = []) {
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

export function estPrice(quantity, category) {
  const m = String(quantity || '').match(/([\d.]+)\s*(kg|g|l|ml)/i)
  let grams = 100
  if (m) { const v = parseFloat(m[1]); const u = m[2].toLowerCase(); grams = (u === 'kg' || u === 'l') ? v * 1000 : v }
  const ratePerKg = { Biscuits: 200, Snacks: 400, Confectionery: 600, Dairy: 280, Beverages: 120, Breakfast: 350, Spreads: 350, Staples: 90, 'Instant food': 300, 'Ready meals': 320, Bakery: 250, Other: 300 }[category] || 300
  return Math.max(5, Math.round((grams / 1000) * ratePerKg))
}

export function accentOf(name) {
  const stop = new Set(['the','and','with','of','in','a','for','to','&'])
  const w = name.split(/\s+/).filter(x => !stop.has(x.toLowerCase()))
  return (w.slice(-1)[0] || name).toUpperCase().slice(0, 14)
}

export function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h) }
