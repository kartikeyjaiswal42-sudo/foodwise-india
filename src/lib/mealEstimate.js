// MEAL ESTIMATION ENGINE (pure)
// ============================================================================
// Turns "a katori of restaurant dal makhani" into nutrition numbers, and — the
// part that matters — into an honest UNCERTAINTY BAND around them.
//
// THE RULE THIS MODULE EXISTS TO ENFORCE
// --------------------------------------
// `lib/dataQuality.js` was written after this app rated pure ghee "Grade A"
// because missing data was coerced to zero: absence of evidence had been
// rendered as evidence of quality. A photo-based calorie estimate is a far
// larger version of the same hazard. Nobody can look at a bowl of dal and know
// it holds 148 kcal. What a photo can honestly support is "roughly 120–190 kcal,
// depending on how much ghee went in".
//
// So every function here returns a RANGE, and `estimateMeal` refuses to emit a
// point value at all. The UI renders `low–high`, and the single `kcal` figure is
// labelled a midpoint everywhere it appears. A reading of ±35% is not a defect
// to be engineered away; it is the true precision of the method, and hiding it
// would make the number more dangerous, not more useful.
//
// WHERE THE UNCERTAINTY COMES FROM (compounded, not guessed)
// ----------------------------------------------------------
//   dish identity  — is this dal tadka or dal fry? (photo only)
//   portion size   — is that katori 150 ml or 220 ml?
//   preparation    — how much oil did this particular cook use?
//
// Each contributes its own fractional error and they compound in quadrature
// (sqrt of the sum of squares), the standard way independent errors combine.
// Adding them linearly would overstate the band: three independent ±20% errors
// give ±35%, not ±60%, because they do not all land in the same direction.

import {
  dishById, CONTEXT_FAT, CONTEXT_SAT_FRACTION, CONTEXTS, UNITS,
  CONTEXT_FAT_REFERENCE_G, CONTEXT_FAT_MAX_SCALE,
} from '../data/indianDishes.js'

/** kcal per gram of fat. */
const KCAL_PER_G_FAT = 9

/**
 * Fractional (1-sigma-ish) uncertainty by source of the estimate.
 *
 * `identity` is 0 for anything the user picked from a list themselves — they
 * know what they ate. It is only non-zero when a model guessed the dish from a
 * photo, and it scales with how confident that model said it was.
 */
export const UNCERTAINTY = {
  identity: { confirmed: 0, photoHigh: 0.10, photoMedium: 0.20, photoLow: 0.34 },
  portion: { measured: 0.05, chosen: 0.15, photoEstimated: 0.28 },
  preparation: { builtFromIngredients: 0.04, contextChosen: 0.16, contextUnknown: 0.26 },
}

/** Combine independent fractional errors in quadrature. */
export function combineUncertainty(...parts) {
  const sum = parts.reduce((acc, p) => acc + (Number(p) || 0) ** 2, 0)
  return Math.sqrt(sum)
}

/**
 * Nutrition for ONE standard serving of a dish in a given cooking context.
 *
 * The context does not scale the dish — it ADDS fat, which is what actually
 * differs between ghar ki dal and a restaurant's. A multiplier would inflate the
 * protein and fibre too, implying a restaurant puts more lentils in the bowl,
 * which it does not.
 */
export function servingFor(dishId, context = 'home') {
  const dish = dishById[dishId]
  if (!dish) return null

  const declared = context === 'home'
    ? 0
    : (CONTEXT_FAT[dish.category]?.[context] ?? null)

  // CONTEXT_FAT is quoted per 150 g of serving, so it has to be scaled by how
  // much food is actually in front of you. Without this a tablespoon of pickle
  // was credited with a bowl's worth of restaurant oil.
  const servingG = UNITS[dish.unit]?.grams || CONTEXT_FAT_REFERENCE_G
  const scale = Math.min(CONTEXT_FAT_MAX_SCALE, servingG / CONTEXT_FAT_REFERENCE_G)
  const addedFat = declared == null ? null : Math.round(declared * scale * 10) / 10

  // An unsupported context is not silently treated as home — that would log a
  // dhaba portion at home-cooked calories. Fall back and say so.
  const applied = addedFat == null ? 'home' : context
  const fatG = addedFat == null ? 0 : addedFat
  const satG = fatG * (CONTEXT_SAT_FRACTION[applied] || 0)

  return {
    dish,
    context: applied,
    contextFallback: applied !== context ? context : null,
    addedFatG: fatG,
    kcal: dish.kcal + fatG * KCAL_PER_G_FAT,
    protein: dish.protein,
    carbs: dish.carbs,
    fat: dish.fat + fatG,
    satFat: dish.satFat + satG,
    sugar: dish.sugar,
    sodium: dish.sodium + (applied === 'home' ? 0 : Math.round(fatG * 12)),
    fibre: dish.fibre,
  }
}

/**
 * One item on a plate.
 * @param {{dishId:string, qty?:number, context?:string,
 *          identity?:keyof typeof UNCERTAINTY.identity,
 *          portion?:keyof typeof UNCERTAINTY.portion,
 *          preparation?:keyof typeof UNCERTAINTY.preparation}} item
 */
export function estimateItem(item) {
  const qty = Number(item?.qty) > 0 ? Number(item.qty) : 1
  const base = servingFor(item?.dishId, item?.context || 'home')
  if (!base) return null

  const frac = combineUncertainty(
    UNCERTAINTY.identity[item.identity || 'confirmed'],
    UNCERTAINTY.portion[item.portion || 'chosen'],
    UNCERTAINTY.preparation[item.preparation || 'contextChosen']
  )

  const scale = (v) => Math.round(v * qty * 10) / 10
  const nutrition = {
    kcal: Math.round(base.kcal * qty),
    protein: scale(base.protein),
    carbs: scale(base.carbs),
    fat: scale(base.fat),
    satFat: scale(base.satFat),
    sugar: scale(base.sugar),
    sodium: Math.round(base.sodium * qty),
    fibre: scale(base.fibre),
  }

  return {
    ...base,
    qty,
    unit: base.dish.unit,
    unitLabel: qty === 1 ? UNITS[base.dish.unit]?.label : UNITS[base.dish.unit]?.plural,
    nutrition,
    uncertainty: frac,
    kcalLow: Math.round(nutrition.kcal * (1 - frac)),
    kcalHigh: Math.round(nutrition.kcal * (1 + frac)),
  }
}

/**
 * A whole meal.
 *
 * Item errors are independent, so the meal's ABSOLUTE error is the quadrature
 * sum of the item absolute errors — which means a plate of five items is
 * proportionally MORE precise than any one of them. That is a real property of
 * independent errors, not a convenience: over-estimating the dal partly cancels
 * under-estimating the rice.
 */
export function estimateMeal(items = []) {
  const parts = items.map(estimateItem).filter(Boolean)
  if (!parts.length) {
    return { items: [], totals: null, kcalLow: 0, kcalHigh: 0, uncertainty: 0, empty: true }
  }

  const totals = parts.reduce((acc, p) => {
    for (const k of Object.keys(p.nutrition)) acc[k] = (acc[k] || 0) + p.nutrition[k]
    return acc
  }, {})
  for (const k of Object.keys(totals)) {
    totals[k] = k === 'kcal' || k === 'sodium' ? Math.round(totals[k]) : Math.round(totals[k] * 10) / 10
  }

  const absErr = Math.sqrt(
    parts.reduce((acc, p) => acc + (p.nutrition.kcal * p.uncertainty) ** 2, 0)
  )
  const frac = totals.kcal > 0 ? absErr / totals.kcal : 0

  return {
    items: parts,
    totals,
    uncertainty: frac,
    kcalLow: Math.max(0, Math.round(totals.kcal - absErr)),
    kcalHigh: Math.round(totals.kcal + absErr),
    empty: false,
  }
}

/** Human-readable band, e.g. "420–580 kcal". */
export function formatRange(low, high, unit = 'kcal') {
  if (low == null || high == null) return '—'
  return `${Math.round(low)}–${Math.round(high)} ${unit}`
}

/**
 * Plain-language statement of how good this estimate is.
 * Deliberately blunt: a user who believes a photo estimate is a measurement will
 * make worse decisions than one who knows it is a rough guide.
 */
export function confidenceNote(fraction) {
  const pct = Math.round(fraction * 100)
  if (pct <= 8) return { level: 'good', label: 'Calculated', text: `Built from measured ingredients — about ±${pct}%.` }
  if (pct <= 18) return { level: 'good', label: 'Close estimate', text: `You confirmed the dish and portion — about ±${pct}%.` }
  if (pct <= 30) return { level: 'warn', label: 'Rough estimate', text: `About ±${pct}%. Cooking style is the biggest unknown.` }
  return { level: 'bad', label: 'Very rough', text: `About ±${pct}%. Treat this as a ballpark, not a measurement.` }
}

/** Which contexts a dish actually supports, as UI-ready options. */
export function contextOptions(dishId) {
  const dish = dishById[dishId]
  if (!dish) return []
  return dish.contexts.map((id) => {
    // Read the scaled figure back off servingFor so the chip label and the
    // number it produces can never disagree.
    const extra = id === 'home' ? 0 : (servingFor(dishId, id)?.addedFatG ?? 0)
    return {
      ...CONTEXTS[id],
      addedFatG: extra,
      addedKcal: Math.round(extra * KCAL_PER_G_FAT),
      // Stated out loud in the UI so the assumption is auditable, not magic.
      assumption: extra
        ? `assumes about ${extra} g extra ghee, butter or oil per ${UNITS[dish.unit]?.label || 'serving'}`
        : 'everyday home amounts of oil or ghee',
    }
  })
}
