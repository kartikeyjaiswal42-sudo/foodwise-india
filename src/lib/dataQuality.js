// Data-confidence model.
//
// THE BUG THIS EXISTS TO KILL: the catalog's scorer starts every product at 80
// and SUBTRACTS penalties for sugar/sodium/saturated fat. Open Food Facts is
// crowd-sourced, and 41% of our India records carry no nutrition panel at all —
// which the builder coerced to 0. Zero penalties meant those products scored 80
// and were presented as "Grade A · Excellent clean alternative". Pure ghee
// (~60% saturated fat) was rated A. Worse, the swap engine picks the
// highest-scoring peer, so 46% of "healthier alternative" recommendations
// pointed at a product we knew NOTHING about — the app was recommending a KitKat
// as an upgrade over 99% dark chocolate.
//
// Absence of evidence was being rendered as evidence of quality. For a health
// app that is the worst possible failure mode, so the fix is not a better guess:
// it is refusing to score what we cannot see, and saying so.
//
// A product is now RATED only when there is something real to rate. Everything
// else is `unrated`, shown as "Not enough label data", excluded from
// cleanest-first sorting, and never offered as a healthier swap.

/**
 * Physical plausibility ceilings, per 100 g.
 * Values above these are data-entry errors (almost always a unit mix-up: salt
 * entered in mg where grams were expected, then multiplied again). Real observed
 * damage in our catalog: a noodle pack claiming 1,608,200 mg of sodium per 100 g,
 * i.e. 1.6 kg of sodium inside 100 g of food.
 */
export const PLAUSIBLE_MAX = {
  sugar: 100,      // g — cannot exceed the mass of the food
  satFat: 100,     // g — same
  sodium: 39300,   // mg — pure table salt is ~39,300 mg sodium per 100 g
  calories: 900,   // kcal — pure fat is 900 kcal per 100 g
}

/**
 * Is this nutrient value physically possible?
 * `null`/`undefined` is "unknown", which is not the same as implausible.
 */
export function isPlausible(key, value) {
  if (value == null) return true
  const max = PLAUSIBLE_MAX[key]
  if (max == null) return true
  return value >= 0 && value <= max
}

/**
 * Audit one product's evidence base.
 *
 * IMPORTANT CAVEAT, stated rather than hidden: once the catalog builder coerced
 * missing values to 0 we can no longer distinguish "genuinely zero" from
 * "not reported". So a product whose sugar, sodium, saturated fat AND calories
 * are all zero is treated as unreported. The only real foods that would be
 * misclassified are things like bottled water, and calling water "unrated"
 * is a far cheaper mistake than calling ghee "Grade A".
 *
 * @returns {{
 *   implausible: string[], hasNutrition: boolean, hasIngredients: boolean,
 *   confidence: 'full'|'partial'|'none', reasons: string[]
 * }}
 */
export function auditProduct(p) {
  const n = p?.nutrients || {}
  const implausible = []
  for (const key of ['sugar', 'sodium', 'satFat']) {
    if (!isPlausible(key, n[key])) implausible.push(key)
  }
  if (!isPlausible('calories', p?.calories)) implausible.push('calories')

  // Only values that are BOTH present and plausible count as evidence.
  const usable = (key, v) => v != null && v !== 0 && isPlausible(key, v)

  // THE SCORE IS COMPUTED FROM sugar/sodium/satFat ONLY — calories are not an
  // input to it. Treating calories as sufficient evidence reintroduced the exact
  // bug this module exists to kill: a cream croissant with 459 kcal but no
  // macros still scored 80 = "Grade A", because there was nothing to subtract.
  // So rating requires at least one real SCORING nutrient; calories alone are
  // recorded for the diary but never license a score.
  const hasScoringNutrients = usable('sugar', n.sugar) || usable('sodium', n.sodium)
    || usable('satFat', n.satFat)
  const hasCalories = usable('calories', p?.calories)
  const hasNutrition = hasScoringNutrients || hasCalories
  const hasIngredients = Array.isArray(p?.ingredients) && p.ingredients.length > 0

  const reasons = []
  if (!hasScoringNutrients) {
    reasons.push(hasCalories
      ? 'only a calorie figure is published — no sugar, sodium or saturated-fat values to score'
      : 'no nutrition panel published')
  }
  if (!hasIngredients) reasons.push('no ingredient list published')
  if (implausible.length) reasons.push(`impossible ${implausible.join('/')} value in the source record`)

  const confidence = hasScoringNutrients && hasIngredients ? 'full'
    : hasScoringNutrients || hasIngredients ? 'partial'
      : 'none'

  return {
    implausible, hasNutrition, hasScoringNutrients, hasCalories,
    hasIngredients, confidence, reasons,
  }
}

/**
 * Can we honestly put a number on this product?
 * Requires real nutrition — an ingredient list alone tells us what is in a pack
 * but not how much, which is what the score measures.
 */
export function isRated(p) {
  if (!p) return false
  if (p.unrated === true) return false
  if (p.score == null) return false
  return auditProduct(p).hasScoringNutrients
}

/** Products safe to recommend as an improvement: rated, and better by a real margin. */
export function canRecommend(p) {
  return isRated(p) && auditProduct(p).confidence === 'full'
}

export const CONFIDENCE_META = {
  full: { label: 'Full label data', tone: 'good', note: 'Nutrition panel and ingredient list both published.' },
  partial: { label: 'Partial label data', tone: 'warn', note: 'Some of this pack’s label is missing from the open database.' },
  none: { label: 'Not enough label data', tone: 'bad', note: 'Neither a nutrition panel nor an ingredient list has been published for this pack.' },
}
