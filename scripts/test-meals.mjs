#!/usr/bin/env node
/**
 * Browser-free checks for the meal estimation stack:
 * dish table, ingredient table, estimator, vision normaliser, trends.
 *
 * The invariants that matter here are the DANGEROUS ones. This stack puts a
 * calorie number in front of someone making a health decision, so the checks are
 * weighted towards the ways a wrong number could look right:
 *   - a cooking context must ADD fat, never scale the whole dish
 *   - an estimate must never be emitted without a range around it
 *   - the model must never be able to introduce a dish we cannot price
 *   - an unlogged day must never be averaged in as a zero-calorie day
 *
 * Run: node scripts/test-meals.mjs
 */
import {
  dishes, dishById, searchDishes, CONTEXT_FAT, CONTEXTS, UNITS,
} from '../src/data/indianDishes.js'
import {
  ingredients, ingredientById, amountNutrition, searchIngredients,
} from '../src/data/indianIngredients.js'
import {
  servingFor, estimateItem, estimateMeal, combineUncertainty,
  contextOptions, confidenceNote, UNCERTAINTY,
} from '../src/lib/mealEstimate.js'
import { parseJsonLoose, normalise, toEstimateItem } from '../src/lib/vision.js'
import {
  dailyTotals, averages, deriveInsights, dayKey, chartSeries,
} from '../src/lib/trends.js'

let pass = 0
const fails = []
const ok = (cond, name) => { if (cond) pass++; else fails.push(name) }
const eq = (a, b, name) => ok(a === b, `${name} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)
const near = (a, b, tol, name) => ok(Math.abs(a - b) <= tol, `${name} (got ${a}, want ~${b}±${tol})`)
const guard = (name, fn) => {
  try { fn() } catch (err) { fails.push(`${name} — threw ${err.message}`) }
}

/* ====================================================================== */
/*  1. Dish table integrity                                               */
/* ====================================================================== */

ok(dishes.length >= 200, `dish table has a usable breadth (${dishes.length})`)

guard('dish ids unique', () => {
  const ids = dishes.map((d) => d.id)
  eq(new Set(ids).size, ids.length, 'every dish id is unique')
})

guard('dish units are real', () => {
  const bad = dishes.filter((d) => !UNITS[d.unit])
  eq(bad.length, 0, `every dish uses a declared unit (${bad.map((d) => d.id).join(',')})`)
})

guard('dish categories have context rules', () => {
  const bad = dishes.filter((d) => !CONTEXT_FAT[d.category])
  eq(bad.length, 0, `every dish category has a context-fat rule (${bad.map((d) => d.category).join(',')})`)
})

// Atwater cross-check: stated kcal must agree with the macros that were entered
// alongside it. This is the only self-check a hand-built composition table can
// have — two independent numbers that must reconcile. High-fibre and near-zero
// items legitimately drift, so they are exempted explicitly rather than by
// loosening the tolerance for everything.
guard('dish macros reconcile with stated calories', () => {
  const drifted = dishes.filter((d) => {
    if (d.kcal < 20) return false
    const calc = d.protein * 4 + d.carbs * 4 + d.fat * 9
    return Math.abs(calc - d.kcal) / d.kcal > 0.18
  })
  eq(drifted.length, 0, `dish kcal matches 4/4/9 macros (${drifted.map((d) => d.id).join(',')})`)
})

guard('alias search finds regional names', () => {
  ok(searchDishes('golgappa')[0]?.id === 'pani-puri', 'golgappa finds pani puri')
  ok(searchDishes('puchka')[0]?.id === 'pani-puri', 'puchka finds pani puri')
  ok(searchDishes('thayir sadam')[0]?.id === 'curd-rice', 'thayir sadam finds curd rice')
  ok(searchDishes('chhole').some((d) => d.id === 'chana-masala'), 'chhole finds chana masala')
  ok(searchDishes('zzzznothing').length === 0, 'a nonsense query returns nothing rather than everything')
})

/* ====================================================================== */
/*  2. Cooking context — the ghar-vs-restaurant model                     */
/* ====================================================================== */

guard('context adds fat and nothing else', () => {
  const home = servingFor('dal-tadka', 'home')
  const rest = servingFor('dal-tadka', 'restaurant')
  eq(home.protein, rest.protein, 'restaurant dal has the SAME protein as home dal')
  eq(home.carbs, rest.carbs, 'restaurant dal has the same carbs as home dal')
  eq(home.fibre, rest.fibre, 'restaurant dal has the same fibre as home dal')
  ok(rest.fat > home.fat, 'restaurant dal has more fat')
  ok(rest.kcal > home.kcal, 'restaurant dal has more calories')
  // The whole calorie difference must be the added fat at 9 kcal/g — if it is
  // not, something is scaling the dish instead of enriching it.
  near(rest.kcal - home.kcal, rest.addedFatG * 9, 0.51, 'the entire calorie gap is the added fat')
})

guard('the ghar-vs-restaurant gap is material', () => {
  const h = servingFor('dal-makhani', 'home')
  const r = servingFor('dal-makhani', 'restaurant')
  ok(r.kcal / h.kcal > 1.2, `restaurant dal makhani is >20% heavier than ghar ka (${h.kcal} -> ${r.kcal})`)
})

guard('saturated share differs by context', () => {
  // A street stall fries in refined oil; a restaurant finishes with butter and
  // cream. Collapsing both into one saturated fraction would misrepresent both.
  const street = servingFor('samosa', 'street')
  const restaurant = servingFor('samosa', 'restaurant')
  const streetSatShare = (street.satFat - dishById['samosa'].satFat) / Math.max(street.addedFatG, 0.01)
  const restSatShare = (restaurant.satFat - dishById['samosa'].satFat) / Math.max(restaurant.addedFatG, 0.01)
  ok(restSatShare > streetSatShare, 'restaurant added fat is more saturated than street added fat')
})

guard('added fat scales with the size of the serving', () => {
  // THE BUG A SCREENSHOT FOUND: CONTEXT_FAT was declared per SERVING, which
  // assumed every serving was a katori. A 15 g tablespoon of achar was therefore
  // credited with a 150 g bowl's worth of restaurant oil and rendered as
  // "+36 kcal, +86%" on a spoon of pickle. Every check below was green at the
  // time — the numbers were self-consistent, they were just about the wrong
  // amount of food.
  const acharHome = servingFor('achar', 'home')
  const acharOut = servingFor('achar', 'restaurant')
  const acharLift = acharOut.kcal / acharHome.kcal - 1
  ok(acharLift < 0.2, `a tablespoon of pickle gains <20% at a restaurant (got +${Math.round(acharLift * 100)}%)`)

  // …while a full bowl of the same category still gains a real amount.
  const raitaLift = servingFor('raita', 'restaurant').kcal / servingFor('raita', 'home').kcal - 1
  ok(raitaLift > acharLift * 2, 'a 150 g bowl gains proportionally more than a 15 g spoon')
})

guard('the bread numbers reconcile across two independently written rows', () => {
  // A plain naan finished with restaurant butter must land on the butter-naan
  // row, which was typed separately and never derived from it. If someone
  // retunes CONTEXT_FAT.ROTI without thinking, these two stop agreeing and the
  // app starts quoting two different calorie counts for the same bread.
  const buttered = servingFor('naan', 'restaurant').kcal
  const row = dishById['butter-naan'].kcal
  near(buttered, row, 12, `naan + restaurant butter (${buttered}) matches the butter-naan row (${row})`)
})

guard('drinks are not given an invented restaurant version', () => {
  // A restaurant does not add ghee to nimbu pani. We have no figure for how a
  // cafe chai differs, so no comparison is offered rather than a plausible one.
  const panna = servingFor('aam-panna', 'restaurant')
  eq(panna.context, 'home', 'aam panna has no restaurant model')
  eq(panna.addedFatG, 0, 'and gains no fat')
  const chai = contextOptions('masala-chai').map((o) => o.id)
  ok(!chai.includes('restaurant'), 'chai offers no restaurant context to pick')
  ok(chai.includes('home'), 'but home is still there')
})

guard('an unsupported context falls back and admits it', () => {
  // There is no "street" version of home dal. Silently treating it as home would
  // log a plausible-looking number for a preparation nobody cooked.
  const s = servingFor('dal-tadka', 'street')
  eq(s.context, 'home', 'unsupported context falls back to home')
  eq(s.contextFallback, 'street', 'the fallback is reported, not hidden')
  eq(s.addedFatG, 0, 'no fat is invented for an unsupported context')
})

guard('context options state their assumption', () => {
  const opts = contextOptions('paneer-butter-masala')
  ok(opts.length >= 3, 'paneer offers home, restaurant and more')
  ok(opts.every((o) => typeof o.assumption === 'string' && o.assumption.length > 5),
    'every context states its fat assumption in words')
  const rest = opts.find((o) => o.id === 'restaurant')
  ok(rest.addedKcal > 0 && /\d+ ?g/.test(rest.assumption),
    'the restaurant assumption names a gram figure')
})

/* ====================================================================== */
/*  3. The estimator never emits a bare number                            */
/* ====================================================================== */

guard('every item carries a range', () => {
  const it = estimateItem({ dishId: 'chapati', qty: 2 })
  ok(it.kcalLow < it.nutrition.kcal && it.nutrition.kcal < it.kcalHigh,
    'the midpoint sits strictly inside the range')
  ok(it.uncertainty > 0, 'uncertainty is never zero for a chosen portion')
})

guard('quantity scales linearly', () => {
  const one = estimateItem({ dishId: 'chapati', qty: 1 })
  const three = estimateItem({ dishId: 'chapati', qty: 3 })
  eq(three.nutrition.kcal, one.nutrition.kcal * 3, '3 rotis is 3x one roti')
})

guard('errors compound in quadrature, not linearly', () => {
  // Three independent 20% errors give 35%, not 60%. Adding them linearly would
  // make every estimate look uselessly vague and push users to ignore the band.
  near(combineUncertainty(0.2, 0.2, 0.2), 0.3464, 0.001, 'quadrature combination is correct')
  ok(combineUncertainty(0.2, 0.2, 0.2) < 0.6, 'quadrature is tighter than a linear sum')
})

guard('a photo estimate is wider than a confirmed one', () => {
  const photo = estimateItem({ dishId: 'dal-tadka', identity: 'photoLow', portion: 'photoEstimated', preparation: 'contextUnknown' })
  const confirmed = estimateItem({ dishId: 'dal-tadka', identity: 'confirmed', portion: 'chosen', preparation: 'contextChosen' })
  const built = estimateItem({ dishId: 'dal-tadka', identity: 'confirmed', portion: 'measured', preparation: 'builtFromIngredients' })
  ok(photo.uncertainty > confirmed.uncertainty, 'a low-confidence photo is less certain than a confirmed pick')
  ok(confirmed.uncertainty > built.uncertainty, 'a confirmed pick is less certain than a measured build')
  ok(built.uncertainty < 0.1, 'building from measured ingredients gets under ±10%')
})

guard('a multi-item meal is proportionally MORE certain than its items', () => {
  // Independent errors partly cancel. This is the mathematical reason a full
  // thali estimate is more trustworthy than a single-dish one.
  const single = estimateMeal([{ dishId: 'dal-tadka', identity: 'photoMedium', portion: 'photoEstimated' }])
  const plate = estimateMeal([
    { dishId: 'dal-tadka', identity: 'photoMedium', portion: 'photoEstimated' },
    { dishId: 'chapati', qty: 3, identity: 'photoMedium', portion: 'photoEstimated' },
    { dishId: 'aloo-gobi', identity: 'photoMedium', portion: 'photoEstimated' },
    { dishId: 'curd-bowl', identity: 'photoMedium', portion: 'photoEstimated' },
  ])
  ok(plate.uncertainty < single.uncertainty,
    `a 4-item plate is proportionally tighter than 1 item (${(plate.uncertainty * 100).toFixed(0)}% vs ${(single.uncertainty * 100).toFixed(0)}%)`)
  ok(plate.totals.kcal > single.totals.kcal, 'and it still totals more calories')
})

guard('an empty meal produces nothing rather than zero', () => {
  const m = estimateMeal([])
  ok(m.empty === true && m.totals === null, 'an empty meal has no totals object to mistake for a real zero')
})

guard('an unknown dish id is dropped, not zero-scored', () => {
  const m = estimateMeal([{ dishId: 'not-a-real-dish' }, { dishId: 'chapati' }])
  eq(m.items.length, 1, 'only the real dish survives')
  ok(m.totals.kcal > 0, 'the surviving dish still contributes')
})

guard('confidence wording escalates honestly', () => {
  eq(confidenceNote(0.04).level, 'good', '±4% reads as calculated')
  eq(confidenceNote(0.25).level, 'warn', '±25% reads as rough')
  eq(confidenceNote(0.4).level, 'bad', '±40% reads as very rough')
})

/* ====================================================================== */
/*  4. Ingredient table & the raw/cooked trap                             */
/* ====================================================================== */

ok(ingredients.length >= 80, `ingredient table has a usable breadth (${ingredients.length})`)

guard('ingredient ids unique', () => {
  const ids = ingredients.map((g) => g.id)
  eq(new Set(ids).size, ids.length, 'every ingredient id is unique')
})

guard('measures are well formed', () => {
  const bad = ingredients.filter((g) => !g.measures.length || g.measures.some((m) => !(m.grams > 0)))
  eq(bad.length, 0, `every ingredient has usable measures (${bad.map((g) => g.id).join(',')})`)
})

guard('cooked measures carry RAW weight', () => {
  // The single most damaging possible bug in this table: if "katori (cooked)"
  // held the cooked weight, one bowl of dal would price at three bowls.
  const dal = ingredientById['toor-dal']
  const cooked = dal.measures.find((m) => m.label === 'katori (cooked)')
  const raw = dal.measures.find((m) => m.label === 'katori (raw)')
  ok(cooked.grams < raw.grams / 2, 'a cooked katori is far less raw dal than a raw katori')
  const n = amountNutrition('toor-dal', cooked.grams)
  ok(n.kcal > 130 && n.kcal < 200, `one cooked katori of toor dal is a believable ${n.kcal} kcal`)
})

guard('the two tables agree with each other', () => {
  // The dish table and the ingredient table were written independently. One
  // roti's worth of atta must land on roughly the dish table's chapati. If these
  // ever diverge, one of them has been edited without the other.
  const fromIngredients = amountNutrition('atta', 30).kcal
  const fromDishes = dishById['chapati'].kcal
  near(fromIngredients, fromDishes, 15, `atta-derived roti (${fromIngredients}) matches the chapati row (${fromDishes})`)

  const ghee = amountNutrition('ghee', 5).kcal
  near(ghee, dishById['ghee-tsp'].kcal, 3, 'a teaspoon of ghee agrees across both tables')
})

guard('fats are priced correctly', () => {
  eq(amountNutrition('ghee', 100).kcal, 900, '100 g of ghee is 900 kcal')
  eq(amountNutrition('sugar', 5).kcal, 20, 'a teaspoon of sugar is ~20 kcal')
})

guard('ingredient search handles regional names', () => {
  ok(searchIngredients('kaddu')[0]?.id === 'pumpkin', 'kaddu finds pumpkin')
  ok(searchIngredients('lehsun')[0]?.id === 'garlic', 'lehsun finds garlic')
})

/* ====================================================================== */
/*  5. Vision normaliser — the model must not be able to hurt us          */
/* ====================================================================== */

guard('truncated JSON is salvaged', () => {
  // gemini-2.5 spends maxOutputTokens on reasoning and guillotines the answer.
  const cut = '{"items":[{"id":"dal-tadka","qty":1,"context":"home"},{"id":"chapati","qty":2,"cont'
  const parsed = parseJsonLoose(cut)
  ok(Array.isArray(parsed.items) && parsed.items.length >= 1,
    'the complete elements survive a mid-array truncation')
  eq(parsed.items[0].id, 'dal-tadka', 'the first complete item is intact')
})

guard('fenced JSON is unwrapped', () => {
  const fenced = '```json\n{"items":[],"noFood":true}\n```'
  eq(parseJsonLoose(fenced).noFood, true, 'a markdown fence is stripped')
})

guard('a hallucinated dish id cannot enter the diary', () => {
  const out = normalise({
    items: [
      { id: 'dal-tadka', qty: 1, context: 'home', confidence: 'high' },
      { id: 'unicorn-biryani', qty: 2, confidence: 'high', note: 'unicorn biryani' },
    ],
  })
  eq(out.items.length, 1, 'the invented dish is dropped')
  ok(out.unmatched.some((u) => /unicorn/i.test(u)), 'and it is REPORTED as unmatched, not silently vanished')
})

guard('absurd quantities are clamped', () => {
  const out = normalise({ items: [{ id: 'chapati', qty: 900 }] })
  ok(out.items[0].qty <= 12, 'nobody logs 900 rotis')
  const neg = normalise({ items: [{ id: 'chapati', qty: -4 }] })
  eq(neg.items[0].qty, 1, 'a negative quantity becomes one serving')
})

guard('an unsupported context from the model is recorded as unknown', () => {
  const out = normalise({ items: [{ id: 'dal-tadka', qty: 1, context: 'street' }] })
  eq(out.items[0].contextKnown, false, 'an inapplicable context is flagged as not observed')
  const est = estimateItem(toEstimateItem(out.items[0]))
  ok(est.uncertainty > 0.3, 'and that widens the band rather than hiding the guess')
})

guard('a photo with no food says so', () => {
  eq(normalise({ items: [], noFood: true }).noFood, true, 'noFood survives')
  eq(normalise({ items: [] }).noFood, true, 'an empty reply is treated as no food')
})

/* ====================================================================== */
/*  6. Trends                                                             */
/* ====================================================================== */

guard('dayKey uses LOCAL time', () => {
  // toISOString() shifts to UTC, which files an 11 pm dinner in India under the
  // previous day and silently moves calories between days.
  const late = new Date(2026, 7, 19, 23, 30)
  eq(dayKey(late), '2026-08-19', 'a late-night entry stays on its own local date')
})

const CATALOG = [
  { id: 'p1', calories: 500, nutrients: { sugar: 10, sodium: 400, satFat: 5 } },
]
const mkMeal = (kcal, sodium = 300) => ({
  meal: { totals: { kcal, sugar: 5, sodium, satFat: 4, protein: 20, fibre: 6 } },
})

guard('unlogged days are not averaged in as zeros', () => {
  const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04']
  const log = [
    { date: '2026-08-01', ...mkMeal(2000) },
    { date: '2026-08-03', ...mkMeal(2000) },
  ]
  const rows = dailyTotals(log, CATALOG, days)
  const avg = averages(rows)
  eq(avg.loggedDays, 2, 'only logged days count')
  eq(avg.calories, 2000, 'the average is over logged days, not diluted to 1000 by blank days')
})

guard('packaged and meal entries both roll up', () => {
  const rows = dailyTotals(
    [{ date: '2026-08-01', productId: 'p1', servings: 2 }, { date: '2026-08-01', ...mkMeal(300) }],
    CATALOG, ['2026-08-01']
  )
  eq(rows[0].calories, 1300, 'a 2-serving packaged item plus a meal sums correctly')
  eq(rows[0].packaged, 1, 'the packaged entry is counted')
  eq(rows[0].meals, 1, 'the meal entry is counted')
})

guard('insights refuse to speak without evidence', () => {
  const one = deriveInsights(dailyTotals([{ date: '2026-08-01', ...mkMeal(3000) }], CATALOG, ['2026-08-01']), { calories: 2000 })
  eq(one.insights.length, 0, 'one logged day produces NO findings')
  ok(/not a pattern|Nothing logged/.test(one.blocked), 'and says why instead of showing an empty panel')

  const none = deriveInsights(dailyTotals([], CATALOG, ['2026-08-01', '2026-08-02']), { calories: 2000 })
  eq(none.insights.length, 0, 'an empty log produces no findings')
})

guard('over-ceiling findings are counts, not opinions', () => {
  const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05']
  const log = days.map((d, i) => ({ date: d, ...mkMeal(i < 3 ? 2600 : 1500) }))
  const res = deriveInsights(dailyTotals(log, CATALOG, days), { calories: 2000 })
  const over = res.insights.find((i) => i.id === 'over-calories')
  ok(over, 'an over-ceiling finding appears')
  ok(/3 of 5/.test(over.text), `the finding states the actual count (${over?.text})`)
})

guard('a gap in the log is disclosed', () => {
  const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05']
  const log = [{ date: '2026-08-01', ...mkMeal(1800) }, { date: '2026-08-02', ...mkMeal(1800) }]
  const res = deriveInsights(dailyTotals(log, CATALOG, days), { calories: 2000 })
  ok(res.insights.some((i) => i.id === 'gaps'), 'the analysis discloses that 3 days are missing')
})

guard('no finding is invented from a flat log', () => {
  const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06']
  const log = days.map((d) => ({ date: d, ...mkMeal(1500, 200) }))
  const res = deriveInsights(dailyTotals(log, CATALOG, days), { calories: 2000, sodium: 2300 })
  ok(!res.insights.some((i) => i.id === 'trend'), 'a perfectly flat log produces no trend claim')
  ok(!res.insights.some((i) => i.id === 'peak-day'), 'and no peak-day claim')
})

guard('chart series marks empty days', () => {
  const rows = dailyTotals([{ date: '2026-08-02', ...mkMeal(2000) }], CATALOG, ['2026-08-01', '2026-08-02'])
  const s = chartSeries(rows)
  eq(s[0].empty, true, 'a day with nothing logged is marked empty, not drawn as a zero bar')
  eq(s[1].pct, 100, 'the only logged day is the full-height bar')
})

/* ---------- report ---------- */
console.log(`\n${fails.length ? '✗' : '✓'} meal stack: ${pass} checks passed, ${fails.length} failed`)
if (fails.length) {
  for (const f of fails) console.log('   ✗', f)
  process.exit(1)
}
