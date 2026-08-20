#!/usr/bin/env node
/**
 * Browser-free checks for the health-condition engine.
 *
 * This module drives health guidance, so the invariants that matter are the ones
 * that would be dangerous to get wrong: a condition must never LOOSEN a ceiling,
 * composing conditions must take the strictest value, and an allergen rule must
 * not silently fail to match. Run: node scripts/test-conditions.mjs
 */
import {
  CONDITIONS, applyConditions, conditionRules, watchedNutrients,
  personalAlerts, personalVerdict, conditionById,
} from '../src/lib/conditions.js'

let pass = 0
const fails = []
const ok = (cond, name) => { if (cond) pass++; else fails.push(name) }
const eq = (a, b, name) => ok(a === b, `${name} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)

// Assertions must never abort the run. A broken engine tends to make several
// checks throw (undefined reads on a value that should exist); if the first one
// killed the process, every later check would be silently skipped and the report
// would understate the damage. `guard` turns a throw into a normal failure.
const guard = (name, fn) => {
  try { fn() } catch (err) { fails.push(`${name} — threw ${err.message}`) }
}

const BASE = { calories: 2000, sugar: 35, sodium: 2300, satFat: 22 }

/* ---------- registry sanity ---------- */
ok(CONDITIONS.length >= 14, 'at least 14 conditions defined')
ok(new Set(CONDITIONS.map((c) => c.id)).size === CONDITIONS.length, 'condition ids are unique')
for (const c of CONDITIONS) {
  ok(!!c.label && !!c.basis && !!c.short, `${c.id} has label/basis/short`)
  ok(Array.isArray(c.rules) && c.rules.length > 0, `${c.id} contributes at least one rule`)
  for (const r of c.rules) {
    ok(Array.isArray(r.terms) && r.terms.length > 0, `${c.id}/${r.id} has terms`)
    ok(!!r.why, `${c.id}/${r.id} explains why`)
  }
}

/* ---------- THE core invariant: conditions may only tighten ---------- */
for (const c of CONDITIONS) {
  const { limits } = applyConditions(BASE, [c.id])
  for (const k of ['calories', 'sugar', 'sodium', 'satFat']) {
    ok(limits[k] <= BASE[k], `${c.id} never raises ${k} (${BASE[k]} -> ${limits[k]})`)
  }
}

// And that holds for every pair, not just singletons — composition must not
// let one condition undo another.
for (const a of CONDITIONS) {
  for (const b of CONDITIONS) {
    const solo = applyConditions(BASE, [a.id]).limits
    const both = applyConditions(BASE, [a.id, b.id]).limits
    for (const k of ['sugar', 'sodium', 'satFat']) {
      if (both[k] > solo[k]) fails.push(`${a.id}+${b.id} loosened ${k} (${solo[k]} -> ${both[k]})`)
    }
  }
}
pass++ // the pair sweep above contributes one aggregate check

/* ---------- specific published thresholds ---------- */
eq(applyConditions(BASE, ['hypertension']).limits.sodium, 1500, 'hypertension sodium = AHA 1500 mg')
eq(applyConditions(BASE, ['type2diabetes']).limits.sugar, 25, 'diabetes sugar = 5% of 2000 kcal = 25 g')
eq(applyConditions(BASE, ['highcholesterol']).limits.satFat, 13, 'high cholesterol satFat = 6% of 2000 kcal / 9 = 13 g')
eq(applyConditions(BASE, ['ckd']).limits.sodium, 2000, 'CKD sodium = KDIGO 2000 mg')

// Strictest wins when two conditions touch the same nutrient.
eq(applyConditions(BASE, ['ckd', 'hypertension']).limits.sodium, 1500, 'CKD + hypertension takes the stricter 1500')
eq(applyConditions(BASE, ['hypertension', 'ckd']).limits.sodium, 1500, 'order does not matter')

// Percent-of-energy limits track the user's own calorie target.
const lowCal = { ...BASE, calories: 1400 }
eq(applyConditions(lowCal, ['type2diabetes']).limits.sugar, 18, 'sugar limit scales with a 1400 kcal target')

// Allergy-only conditions contribute rules but touch no ceiling.
const allergy = applyConditions(BASE, ['nutallergy']).limits
ok(allergy.sugar === BASE.sugar && allergy.sodium === BASE.sodium, 'nut allergy changes no ceiling')

// `applied` reports what actually changed.
guard('applied report', () => {
  const { applied } = applyConditions(BASE, ['hypertension'])
  eq(applied.length, 1, 'hypertension reports exactly one tightening')
  eq(applied[0]?.nutrient, 'sodium', 'the tightening is on sodium')
})

/* ---------- rules ---------- */
const dupRules = conditionRules(['type2diabetes', 'pcos', 'prediabetes'])
eq(dupRules.filter((r) => r.id === 'cond-maida').length, 1, 'shared rules de-duplicate across conditions')
ok(watchedNutrients(['hypertension', 'type2diabetes']).sort().join() === 'sodium,sugar', 'watched nutrients union')

/* ---------- personal alerts ---------- */
const noodles = {
  name: 'Instant noodles',
  nutrients: { sugar: 3.6, sodium: 1200, satFat: 8.2 },
  ingredients: [
    'Refined wheat flour (maida)',
    'edible vegetable oil (palm oil)',
    'iodised salt',
    'flavour enhancers (627, 631, 621)',
    'acidity regulator (330)',
  ],
}

const bp = applyConditions(BASE, ['hypertension'])
const bpAlerts = personalAlerts(noodles, ['hypertension'], bp.limits)
const sodiumAlert = bpAlerts.find((a) => a.nutrient === 'sodium')
ok(!!sodiumAlert, 'hypertension raises a sodium alert on instant noodles')
eq(sodiumAlert?.pct, 80, '1200 mg against a 1500 mg ceiling = 80%')
eq(sodiumAlert?.severity, 'high', '80% of the ceiling is a high-severity alert')
ok(bpAlerts.some((a) => a.title.includes('Sodium-based additives')), 'MSG matched as a sodium additive')

// The additive matcher must not read a plain number as an INS code.
const decoy = { nutrients: {}, ingredients: ['Vitamin C (200 mg)', 'water'] }
const decoyAlerts = personalAlerts(decoy, ['migraine'], BASE)
eq(decoyAlerts.length, 0, '"(200 mg)" is not misread as additive 200')

// A coeliac flag on wheat must fire, and be high severity (strict condition).
const biscuit = { nutrients: { sugar: 20 }, ingredients: ['Refined wheat flour', 'sugar', 'palm oil'] }
const cAlerts = personalAlerts(biscuit, ['coeliac'], BASE)
ok(cAlerts.some((a) => a.severity === 'high' && /Gluten/i.test(a.title)), 'coeliac gluten flag is high severity')

// No conditions selected = no personal alerts (the app must stay neutral).
eq(personalAlerts(noodles, [], BASE).length, 0, 'no conditions selected produces no alerts')
eq(personalVerdict([]), null, 'empty alerts produce no verdict')

// CKD phosphate detection — the differentiating check.
const cola = { nutrients: { sodium: 20 }, ingredients: ['Carbonated water', 'sugar', 'acidity regulator (338)', 'caffeine'] }
const ckdAlerts = personalAlerts(cola, ['ckd'], applyConditions(BASE, ['ckd']).limits)
ok(ckdAlerts.some((a) => /phosphate/i.test(a.title)), 'CKD flags phosphoric acid (INS 338) in cola')

/* ---------- report ---------- */
console.log(`\n${fails.length ? '✗' : '✓'} conditions engine: ${pass} checks passed, ${fails.length} failed`)
if (fails.length) {
  for (const f of fails) console.log('   ✗', f)
  process.exit(1)
}
