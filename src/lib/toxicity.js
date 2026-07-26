// ============================================================================
//  JAANO — UNIFIED TOXICITY ENGINE
//  One place that answers: "what does this ingredient / this product / this
//  week of eating actually do to my body?"
//
//  It fuses THREE sources that previously never spoke to each other:
//    1. data/additivesDb.js   — 242 INS/E additive codes with organ weights
//    2. data/ingredientsDb.js — hand-written hazard entries for whole
//                               ingredients (maida, palm oil, sugar…)
//    3. lib/ingredientClassify.js — the good/neutral/bad keyword classifier
//
//  All pure functions — no React, no DOM, no localStorage.
// ============================================================================

import { ADDITIVES, additiveInfo, ADDITIVE_COUNT } from '../data/additivesDb'
import { ingredientsDb, ORGAN_SYSTEMS, findIngredient } from '../data/ingredientsDb'
import { classifyIngredient, additiveCodes } from './ingredientClassify'

export { ORGAN_SYSTEMS, ADDITIVE_COUNT }

// ---------------------------------------------------------------------------
//  Organ-key reconciliation.
//  additivesDb speaks 'cancer'/'hormone'; ingredientsDb (and the UI) speak
//  'dna'/'thyroid'. Everything is normalised to the ORGAN_SYSTEMS keys.
// ---------------------------------------------------------------------------
const ORGAN_ALIAS = { cancer: 'dna', hormone: 'thyroid' }
export const canonicalOrgan = (key) => ORGAN_ALIAS[key] || key

export const RISK_WEIGHT = { high: 3, moderate: 2, medium: 2, low: 1, none: 0 }
export const RISK_META = {
  high: { label: 'High harm', color: '#ef4444', dot: '🔴' },
  moderate: { label: 'Moderate harm', color: '#f59e0b', dot: '🟠' },
  medium: { label: 'Moderate harm', color: '#f59e0b', dot: '🟠' },
  low: { label: 'Low risk', color: '#10b981', dot: '🟢' },
  none: { label: 'No known harm', color: '#10b981', dot: '🟢' },
}

// What to actually DO about a loaded organ system. Shown in the exposure report.
export const ORGAN_ADVICE = {
  brain: 'Cut azo colours and MSG-family enhancers (621/627/631/635) for a week. Sleep, hydration and omega-3 (walnuts, flax, fish) support recovery.',
  heart: 'Drop palm oil / vanaspati and salty namkeen. Swap to cold-pressed mustard or groundnut oil; add oats, soluble fibre and potassium-rich foods.',
  liver: 'The liver clears fructose and additives. Cut sweetened drinks, syrups and fried packaged snacks; add coffee, leafy greens and 2–3 L water daily.',
  kidney: 'Reduce sodium and phosphate additives (colas, processed cheese). Drink water steadily through the day rather than in bursts.',
  gut: 'Emulsifiers and thickeners thin the gut mucus layer. Take a break from ice cream, chocolate milk and sauces; add curd, fermented foods and whole fibre.',
  metabolic: 'This is the blood-sugar load. Replace maida and syrups with whole grains, millets and pulses; walk 10–15 min after meals.',
  thyroid: 'Limit synthetic antioxidants (BHA/BHT/TBHQ) and erythrosine-coloured sweets. Ensure adequate iodine and selenium.',
  reproductive: 'Avoid trans/hydrogenated fats and BHA/BHT-preserved snacks; zinc, folate and whole foods matter most here.',
  immune: 'Colours, sulphites and preservatives drive most food-additive reactions. Track which product preceded a flare-up.',
  lungs: 'Sulphites (INS 220–228) are the airway trigger. Check dried fruit, glucose biscuits and fruit squashes if you are asthmatic.',
  skin: 'Azo colours, benzoates and sulphites are the usual suspects behind hives and itching. Eliminate one family at a time for 2 weeks.',
  bones: 'Cola phosphoric acid and aluminium additives displace calcium. Reduce colas; add dairy/ragi, sunlight and weight-bearing movement.',
  blood: 'Nitrite-cured meats affect oxygen carrying. Choose fresh meat and pair iron sources with vitamin C.',
  teeth: 'Sugars plus acid regulators are the enamel combination. Rinse with water after sweet or fizzy items; do not brush immediately after acid.',
  dna: 'Cumulative genotoxic load — 4-MEI caramel, titanium dioxide, nitrosamines, BHA. No single item is a verdict; lowering the weekly count is the lever.',
}

// ---------------------------------------------------------------------------
//  1. SINGLE INGREDIENT LINE
// ---------------------------------------------------------------------------

// Merge {organ: weight} maps.
function addOrgans(target, organs, factor = 1) {
  for (const [k, w] of Object.entries(organs || {})) {
    const key = canonicalOrgan(k)
    if (!ORGAN_SYSTEMS[key]) continue
    target[key] = (target[key] || 0) + w * factor
  }
  return target
}

// ingredientsDb stores organs as a flat array; weight them by the entry's risk.
function organsFromRichEntry(entry) {
  const w = RISK_WEIGHT[entry.risk] ?? 1
  const out = {}
  for (const o of entry.organs || []) out[canonicalOrgan(o)] = w
  return out
}

const WORST = { bad: 3, neutral: 2, good: 1 }
function worstVerdict(a, b) {
  if (!a) return b
  if (!b) return a
  return (WORST[a] || 0) >= (WORST[b] || 0) ? a : b
}

/**
 * Decode ONE ingredient line (e.g. "flavour enhancers (627, 631)").
 * position/total are optional: ingredient lists are printed in descending
 * order of quantity, so an early ingredient carries more real-world weight.
 */
export function scanLine(raw, position = 0, total = 1) {
  const text = String(raw || '').trim()
  if (!text) return null

  const cls = classifyIngredient(text)
  const rich = findIngredient(text)
  const codes = additiveCodes(text)
  const additives = codes.map((c) => additiveInfo(c)).filter(Boolean)

  // Quantity weighting: 1st ingredient = 1.0, tapering to 0.55 for the last.
  const posWeight = total > 1 ? 1 - 0.45 * (position / (total - 1)) : 1

  const organs = {}
  if (rich) addOrgans(organs, organsFromRichEntry(rich))
  for (const a of additives) addOrgans(organs, a.organs)

  let risk = rich?.risk || 'none'
  for (const a of additives) {
    if ((RISK_WEIGHT[a.risk] ?? 0) > (RISK_WEIGHT[risk] ?? 0)) risk = a.risk
  }

  let verdict = cls?.verdict || 'neutral'
  for (const a of additives) verdict = worstVerdict(verdict, a.verdict)
  if (rich?.risk === 'high') verdict = 'bad'

  const riskWeight = RISK_WEIGHT[risk] ?? 0
  return {
    raw: text,
    position,
    posWeight,
    cls,
    rich,
    additives,
    risk,
    verdict,
    riskWeight,
    organs,
    // headline harm sentence, best available source
    harm: rich?.issues || additives[0]?.harm || cls?.why || '',
    load: riskWeight * posWeight,
  }
}

// ---------------------------------------------------------------------------
//  2. A WHOLE INGREDIENT LIST (a product, or a pasted label)
// ---------------------------------------------------------------------------

/**
 * Split a free-text ingredient statement ("Wheat flour, sugar, palm oil
 * (INS 471), salt.") into individual ingredient lines. Handles the nested
 * brackets that Indian labels are full of.
 */
export function splitIngredientText(text) {
  const s = String(text || '')
    .replace(/^\s*ingredients?\s*[:—-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!s) return []
  const out = []
  let depth = 0
  let buf = ''
  for (const ch of s) {
    if (ch === '(' || ch === '[') depth += 1
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
    if ((ch === ',' || ch === ';') && depth === 0) {
      if (buf.trim()) out.push(buf.trim())
      buf = ''
    } else buf += ch
  }
  if (buf.trim()) out.push(buf.trim())
  return out
    .map((x) => x.replace(/^[.\s]+|[.\s]+$/g, ''))
    .filter((x) => x.length > 1)
}

/**
 * Full toxicity read-out for a list of ingredient strings.
 * Returns organ load, the additives found, the hazard entries hit,
 * a good/neutral/bad tally and a 0–100 hazard score.
 */
export function scanIngredients(list = []) {
  const lines = list
    .map((raw, i) => scanLine(raw, i, list.length))
    .filter(Boolean)

  const organs = {}
  const counts = { good: 0, neutral: 0, bad: 0 }
  const additiveMap = new Map()
  const hazardMap = new Map()
  let rawLoad = 0

  for (const l of lines) {
    addOrgans(organs, l.organs, l.posWeight)
    counts[l.verdict] += 1
    rawLoad += l.load
    for (const a of l.additives) if (!additiveMap.has(a.code)) additiveMap.set(a.code, a)
    if (l.rich && l.rich.risk !== 'low') hazardMap.set(l.rich.name, l.rich)
  }

  const additives = [...additiveMap.values()].sort(
    (a, b) => (RISK_WEIGHT[b.risk] ?? 0) - (RISK_WEIGHT[a.risk] ?? 0)
  )
  const hazards = [...hazardMap.values()].sort(
    (a, b) => (RISK_WEIGHT[b.risk] ?? 0) - (RISK_WEIGHT[a.risk] ?? 0)
  )

  // Score on hazard DENSITY (how much of the list is problematic), not raw
  // count — otherwise every long label maxes out and the scale stops
  // discriminating. A small bonus for the sheer number of flagged items keeps
  // a 12-additive snack above a 3-additive one at equal density.
  const density = rawLoad / Math.max(3, lines.length)     // ~0–3
  const hazardScore = Math.min(60, Math.round(density * 14 + counts.bad * 2.5))

  return {
    lines,
    organs,
    counts,
    additives,
    hazards,
    hazardScore,
    riskyAdditives: additives.filter((a) => a.verdict === 'bad'),
    systemsHit: Object.keys(organs).filter((k) => organs[k] > 0).length,
  }
}

// Convenience: decode a raw pasted label in one call.
export function scanLabel(text) {
  const list = splitIngredientText(text)
  return { list, ...scanIngredients(list) }
}

// ---------------------------------------------------------------------------
//  3. A CATALOG PRODUCT (ingredients + nutrition)
// ---------------------------------------------------------------------------

// Per-100 g nutrition penalty, using the FSSAI/WHO front-of-pack thresholds.
export function nutritionPenalty(product) {
  const n = product?.nutrients || {}
  const sugar = Math.min(1, (Number(n.sugar) || 0) / 22.5)   // g/100g
  const sodium = Math.min(1, (Number(n.sodium) || 0) / 600)  // mg/100g
  const fat = Math.min(1, (Number(n.satFat) || 0) / 6)       // g/100g
  return {
    score: Math.round(((sugar + sodium + fat) / 3) * 40),
    sugar, sodium, fat,
  }
}

const productCache = new Map()

/** Complete toxicity profile of a catalog product (memoised by id). */
export function scanProduct(product) {
  if (!product) return null
  if (product.id && productCache.has(product.id)) return productCache.get(product.id)

  const ing = scanIngredients(product.ingredients || [])
  const nut = nutritionPenalty(product)

  // Nutrition also lands on organs — sugar on liver/metabolic/teeth,
  // sodium on heart/kidney, saturated fat on heart.
  const organs = { ...ing.organs }
  addOrgans(organs, { metabolic: 3, liver: 2, teeth: 2 }, nut.sugar)
  addOrgans(organs, { heart: 3, kidney: 2 }, nut.sodium)
  addOrgans(organs, { heart: 3, liver: 1 }, nut.fat)

  const toxIndex = Math.max(0, Math.min(100, ing.hazardScore + nut.score))
  const band =
    toxIndex >= 60 ? 'severe' : toxIndex >= 38 ? 'high' : toxIndex >= 18 ? 'moderate' : 'clean'

  const result = {
    ...ing,
    product,
    nutrition: nut,
    organs,
    toxIndex,
    band,
    topOrgans: Object.entries(organs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([key, value]) => ({ key, value, system: ORGAN_SYSTEMS[key] })),
  }
  if (product.id) productCache.set(product.id, result)
  return result
}

export const TOX_BANDS = {
  clean: { label: 'Clean label', color: '#10b981', note: 'Few or no flagged additives and moderate nutrition load.' },
  moderate: { label: 'Moderate load', color: '#ca8a04', note: 'Some processing markers — fine occasionally, not daily.' },
  high: { label: 'High load', color: '#ea580c', note: 'Several flagged additives or nutrition well past the thresholds.' },
  severe: { label: 'Severe load', color: '#dc2626', note: 'Heavy additive stack plus poor nutrition. Treat as a rare indulgence.' },
}

// ---------------------------------------------------------------------------
//  4. THE CATALOG — which products load which systems
// ---------------------------------------------------------------------------

let catalogCache = null
export function catalogToxicity(products) {
  if (catalogCache) return catalogCache
  const exposure = {}
  for (const k of Object.keys(ORGAN_SYSTEMS)) exposure[k] = { count: 0, load: 0, sample: [] }

  const scans = []
  for (const p of products) {
    const s = scanProduct(p)
    scans.push(s)
    for (const [k, v] of Object.entries(s.organs)) {
      if (!exposure[k] || v <= 0) continue
      exposure[k].count += 1
      exposure[k].load += v
    }
  }
  // Worst offender samples per organ, so the UI shows real products.
  for (const k of Object.keys(exposure)) {
    exposure[k].sample = scans
      .filter((s) => (s.organs[k] || 0) > 0)
      .sort((a, b) => (b.organs[k] || 0) - (a.organs[k] || 0))
      .slice(0, 6)
      .map((s) => s.product)
  }
  const ranked = scans.slice().sort((a, b) => b.toxIndex - a.toxIndex)
  catalogCache = { exposure, scans, ranked, total: products.length }
  return catalogCache
}

// ---------------------------------------------------------------------------
//  5. PERSONAL EXPOSURE — what YOU actually ate
// ---------------------------------------------------------------------------

/**
 * Cumulative organ load from the food diary.
 * @param log       array of { date, productId, servings }
 * @param products  the catalog
 * @param days      window size ending today (7 / 30)
 */
export function scanIntake(log = [], products = [], days = 7) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const end = new Date()
  const start = new Date(end.getTime() - (days - 1) * 86400000)
  const startStr = start.toISOString().split('T')[0]
  const endStr = end.toISOString().split('T')[0]

  const entries = log.filter((e) => e.date >= startStr && e.date <= endStr)

  const organs = {}
  const productLoad = new Map()
  const ingredientHits = new Map()
  const additiveHits = new Map()
  const perDay = new Map()
  let servingsTotal = 0

  for (const e of entries) {
    const p = byId.get(e.productId)
    if (!p) continue
    const s = scanProduct(p)
    const mult = Number(e.servings) || 1
    servingsTotal += mult
    addOrgans(organs, s.organs, mult)

    const prev = productLoad.get(p.id) || { product: p, scan: s, servings: 0, load: 0 }
    prev.servings += mult
    prev.load += s.toxIndex * mult
    productLoad.set(p.id, prev)

    perDay.set(e.date, (perDay.get(e.date) || 0) + s.toxIndex * mult)

    for (const l of s.lines) {
      if (l.verdict !== 'bad') continue
      const key = l.rich?.name || l.cls?.label || l.raw
      const hit = ingredientHits.get(key) || { key, line: l, times: 0, products: new Set() }
      hit.times += mult
      hit.products.add(p.name)
      ingredientHits.set(key, hit)
    }
    for (const a of s.additives) {
      const hit = additiveHits.get(a.code) || { ...a, times: 0, products: new Set() }
      hit.times += mult
      hit.products.add(p.name)
      additiveHits.set(a.code, hit)
    }
  }

  const daysLogged = perDay.size
  const totalLoad = [...productLoad.values()].reduce((s, x) => s + x.load, 0)

  return {
    days,
    entries,
    daysLogged,
    servingsTotal,
    organs,
    totalLoad: Math.round(totalLoad),
    dailyAvg: daysLogged ? Math.round(totalLoad / daysLogged) : 0,
    perDay: [...perDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    topOrgans: Object.entries(organs)
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ key, value, system: ORGAN_SYSTEMS[key], advice: ORGAN_ADVICE[key] })),
    topProducts: [...productLoad.values()].sort((a, b) => b.load - a.load),
    topIngredients: [...ingredientHits.values()]
      .sort((a, b) => b.times - a.times)
      .map((h) => ({ ...h, products: [...h.products] })),
    topAdditives: [...additiveHits.values()]
      .sort((a, b) => (RISK_WEIGHT[b.risk] ?? 0) - (RISK_WEIGHT[a.risk] ?? 0) || b.times - a.times)
      .map((h) => ({ ...h, products: [...h.products] })),
  }
}

// ---------------------------------------------------------------------------
//  6. THE ADDITIVE INDEX (browsable encyclopedia of all 242 codes)
// ---------------------------------------------------------------------------

// Broad functional families, derived from each entry's `cls` string.
export const ADDITIVE_FAMILIES = [
  { key: 'colour', label: 'Colours', re: /colour/i, emoji: '🎨' },
  { key: 'preservative', label: 'Preservatives', re: /preservative/i, emoji: '🧊' },
  { key: 'antioxidant', label: 'Antioxidants', re: /antioxidant/i, emoji: '🛡️' },
  { key: 'emulsifier', label: 'Emulsifiers & stabilisers', re: /emulsifier|stabilis|thickener|gelling|gum/i, emoji: '🥄' },
  { key: 'acid', label: 'Acids & acidity regulators', re: /acid|buffer|sequestrant/i, emoji: '🍋' },
  { key: 'enhancer', label: 'Flavour enhancers', re: /enhancer/i, emoji: '👅' },
  { key: 'sweetener', label: 'Sweeteners', re: /sweetener|polyol/i, emoji: '🍬' },
  { key: 'raising', label: 'Raising & anti-caking', re: /raising|anticaking|anti-caking|firming|humectant/i, emoji: '🫧' },
  { key: 'other', label: 'Other', re: /./, emoji: '⚗️' },
]

export function additiveFamily(entry) {
  return ADDITIVE_FAMILIES.find((f) => f.re.test(entry.cls || '')) || ADDITIVE_FAMILIES.at(-1)
}

/** Every additive as a flat, searchable, sortable list. */
export function additiveIndex() {
  return Object.entries(ADDITIVES).map(([code, a]) => ({
    code,
    ...a,
    family: additiveFamily(a),
    organKeys: Object.keys(a.organs || {}).map(canonicalOrgan),
    banned: /\bBANNED\b|Banned/.test(a.law || ''),
  }))
}

/** Registry-wide counts — used by the toxicity report header. */
export function registryStats() {
  const all = additiveIndex()
  return {
    additives: all.length,
    bannedSomewhere: all.filter((a) => a.banned).length,
    highRisk: all.filter((a) => a.risk === 'high').length,
    ingredients: Object.keys(ingredientsDb).length,
    systems: Object.keys(ORGAN_SYSTEMS).length,
  }
}

/** Toxic-load tally per organ across BOTH registries (encyclopedia view). */
export function fullOrganLoadIndex() {
  const idx = {}
  for (const key of Object.keys(ORGAN_SYSTEMS)) {
    idx[key] = { high: 0, moderate: 0, low: 0, total: 0, additives: 0, ingredients: 0 }
  }
  for (const e of Object.values(ingredientsDb)) {
    for (const o of e.organs || []) {
      const k = canonicalOrgan(o)
      if (!idx[k]) continue
      const bucket = e.risk === 'high' ? 'high' : e.risk === 'medium' ? 'moderate' : 'low'
      idx[k][bucket] += 1
      idx[k].total += 1
      idx[k].ingredients += 1
    }
  }
  for (const a of Object.values(ADDITIVES)) {
    for (const o of Object.keys(a.organs || {})) {
      const k = canonicalOrgan(o)
      if (!idx[k]) continue
      const bucket = a.risk === 'high' ? 'high' : a.risk === 'moderate' ? 'moderate' : 'low'
      idx[k][bucket] += 1
      idx[k].total += 1
      idx[k].additives += 1
    }
  }
  return idx
}

/** Every hazard (ingredient OR additive) that damages one organ system. */
export function hazardsForOrgan(organKey) {
  const out = []
  for (const e of Object.values(ingredientsDb)) {
    if ((e.organs || []).map(canonicalOrgan).includes(organKey)) {
      out.push({
        kind: 'ingredient',
        name: e.name,
        cls: e.class,
        risk: e.risk,
        harm: e.issues,
        sources: e.sources,
        law: e.regulatory,
        swap: e.replacedBy,
        organKeys: (e.organs || []).map(canonicalOrgan),
        weight: RISK_WEIGHT[e.risk] ?? 1,
      })
    }
  }
  for (const [code, a] of Object.entries(ADDITIVES)) {
    // the raw key in additivesDb may be 'cancer'/'hormone' — resolve via alias
    const srcKey = Object.keys(a.organs || {}).find((k) => canonicalOrgan(k) === organKey)
    if (!srcKey) continue
    out.push({
      kind: 'additive',
      code,
      name: a.name,
      cls: a.cls,
      risk: a.risk,
      harm: a.harm,
      symptoms: a.symptoms,
      adi: a.adi,
      law: a.law,
      organKeys: Object.keys(a.organs || {}).map(canonicalOrgan),
      weight: a.organs[srcKey] ?? 1,
    })
  }
  return out.sort(
    (a, b) => (RISK_WEIGHT[b.risk] ?? 0) - (RISK_WEIGHT[a.risk] ?? 0) || b.weight - a.weight
  )
}
