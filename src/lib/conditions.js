// Health-condition personalisation.
//
// Jaano already computed daily ceilings from BMI/goal. That answers "how much
// energy do you need" — it does not answer "what should THIS body avoid". A pack
// of instant noodles is a different object to someone with hypertension than to
// a marathon runner, and until now the app scored it identically for both.
//
// Two mechanisms, both deliberately plugged into machinery that already exists
// rather than bolted on beside it:
//
//   1. TIGHTENING — a condition can only ever LOWER a nutrient ceiling, never
//      raise one. Multiple conditions compose by taking the strictest value, so
//      selecting more conditions can never loosen the plan. Percent-of-energy
//      limits are resolved against the user's own calorie target.
//
//   2. RULES — a condition contributes avoid-rules in the exact shape
//      `avoidList.js` already matches (`{ id, label, terms }`, where a 3-digit
//      term is matched as an INS/E code and anything else as a substring). So
//      condition hazards light up everywhere the avoid list already does, with
//      no new matching code.
//
// EVERY threshold below is a published guideline, cited in `basis` and surfaced
// in the UI. Where guidance is qualitative rather than numeric (allergens, IBS)
// the condition contributes rules only and touches no ceiling.
//
// This is nutrition-label triage, not medical advice — `DISCLAIMER` is rendered
// wherever these results appear.

export const CONDITIONS_STORAGE_KEY = 'jaano-conditions-v1'

export const DISCLAIMER =
  'Jaano reads labels against published public-health guidelines. It is not a diagnosis, '
  + 'not a treatment plan, and not a substitute for your doctor or dietitian — especially '
  + 'for kidney disease, pregnancy and diagnosed allergies, where your own clinician’s '
  + 'limits always override these general thresholds.'

/**
 * `limits` fields:
 *   sugarPct / satFatPct — fraction of daily energy, resolved against calorieTarget
 *   sugar / sodium / satFat — absolute ceilings (g, mg, g)
 * Whichever is stricter after resolution wins.
 */
export const CONDITIONS = [
  {
    id: 'type2diabetes',
    label: 'Type 2 diabetes',
    group: 'Metabolic',
    emoji: '🩸',
    short: 'Free sugars and refined starch drive glucose spikes.',
    basis: 'WHO 2015 conditional recommendation: free sugars below 5% of energy. WHO sodium target 2,000 mg/day (raised cardiovascular risk).',
    limits: { sugarPct: 0.05, sodium: 2000 },
    watch: ['sugar'],
    rules: [
      { id: 'cond-sugar', label: 'Added & hidden sugars', terms: ['sugar', 'invert sugar', 'glucose syrup', 'fructose', 'corn syrup', 'maltodextrin', 'dextrose', 'molasses', 'honey'], why: 'Free sugars raise blood glucose fastest — including the ones not called "sugar".' },
      { id: 'cond-maida', label: 'Refined flour (maida)', terms: ['maida', 'refined wheat flour', 'refined flour', 'bleached flour'], why: 'Pure starch with no fibre — a glucose spike close to sugar itself.' },
    ],
  },
  {
    id: 'prediabetes',
    label: 'Prediabetes / insulin resistance',
    group: 'Metabolic',
    emoji: '📈',
    short: 'The window where label choices still change the outcome.',
    basis: 'WHO free-sugars guidance (<10% of energy, <5% conditional). ICMR-INDIAB flags refined-carbohydrate load as the dominant Indian driver.',
    limits: { sugarPct: 0.06 },
    watch: ['sugar'],
    rules: [
      { id: 'cond-maida', label: 'Refined flour (maida)', terms: ['maida', 'refined wheat flour', 'refined flour'], why: 'Refined starch behaves like sugar for blood glucose.' },
    ],
  },
  {
    id: 'hypertension',
    label: 'High blood pressure',
    group: 'Heart',
    emoji: '🫀',
    short: 'Sodium is the single biggest label lever you have.',
    basis: 'American Heart Association ideal limit 1,500 mg sodium/day for adults with hypertension; WHO population target <2,000 mg.',
    limits: { sodium: 1500 },
    watch: ['sodium'],
    rules: [
      { id: 'cond-sodium-additive', label: 'Sodium-based additives', terms: ['monosodium glutamate', 'sodium benzoate', 'sodium bicarbonate', 'disodium', 'sodium nitrite', '621', '211', '500', '627', '631'], why: 'Sodium arrives through additives too, not just the salt line.' },
      { id: 'cond-licorice', label: 'Liquorice extract', terms: ['liquorice', 'licorice', 'mulethi'], why: 'Glycyrrhizin raises blood pressure and depletes potassium.' },
    ],
  },
  {
    id: 'highcholesterol',
    label: 'High cholesterol',
    group: 'Heart',
    emoji: '🧈',
    short: 'Saturated and trans fats move LDL the most.',
    basis: 'American Heart Association: saturated fat below 6% of daily energy when lowering LDL. FSSAI caps industrial trans fat at 2%.',
    limits: { satFatPct: 0.06 },
    watch: ['satFat'],
    rules: [
      { id: 'cond-transfat', label: 'Hydrogenated / trans fat', terms: ['hydrogenated', 'vanaspati', 'shortening', 'interesterified', 'margarine'], why: 'Raises LDL and lowers HDL simultaneously — the worst combination.' },
      { id: 'cond-palm', label: 'Palm oil & palmolein', terms: ['palm oil', 'palmolein', 'palm fat', 'palm kernel'], why: 'Roughly half saturated fat, and the default oil in Indian packaged food.' },
    ],
  },
  {
    id: 'heartdisease',
    label: 'Heart disease',
    group: 'Heart',
    emoji: '❤️‍🩹',
    short: 'Sodium and saturated fat, tightened together.',
    basis: 'AHA secondary-prevention guidance: sodium 1,500 mg/day and saturated fat under 6% of energy.',
    limits: { sodium: 1500, satFatPct: 0.06 },
    watch: ['sodium', 'satFat'],
    rules: [
      { id: 'cond-transfat', label: 'Hydrogenated / trans fat', terms: ['hydrogenated', 'vanaspati', 'shortening', 'interesterified'], why: 'The strongest dietary driver of cardiac risk per gram.' },
    ],
  },
  {
    id: 'ckd',
    label: 'Kidney disease (CKD)',
    group: 'Organ',
    emoji: '🫘',
    short: 'Phosphate additives matter more than the protein line.',
    basis: 'KDIGO: sodium below 2,000 mg/day. Inorganic phosphate ADDITIVES are ~90–100% absorbed versus ~40–60% for natural food phosphorus — the reason additive-free packs matter in CKD.',
    limits: { sodium: 2000 },
    watch: ['sodium'],
    rules: [
      { id: 'cond-phosphate', label: 'Inorganic phosphate additives', terms: ['phosphate', 'phosphoric acid', 'polyphosphate', 'pyrophosphate', '338', '339', '340', '341', '343', '450', '451', '452'], why: 'Additive phosphate is absorbed almost completely — it loads failing kidneys far harder than the phosphorus naturally present in food.' },
      { id: 'cond-potassium', label: 'Potassium salts (low-sodium salt)', terms: ['potassium chloride', 'potassium', '508', '509'], why: '"Low sodium" salt substitutes swap in potassium, which is dangerous in reduced kidney function.' },
    ],
  },
  {
    id: 'fattyliver',
    label: 'Fatty liver (NAFLD)',
    group: 'Organ',
    emoji: '🩺',
    short: 'Fructose is handled almost entirely by the liver.',
    basis: 'EASL–EASD–EASO guidance: eliminate sugar-sweetened, especially fructose-sweetened, beverages.',
    limits: { sugarPct: 0.05 },
    watch: ['sugar'],
    rules: [
      { id: 'cond-fructose', label: 'Fructose & corn syrup', terms: ['fructose', 'high fructose', 'corn syrup', 'invert sugar', 'liquid glucose'], why: 'Fructose is metabolised in the liver and converted to fat there.' },
    ],
  },
  {
    id: 'pcos',
    label: 'PCOS',
    group: 'Metabolic',
    emoji: '🌸',
    short: 'Insulin resistance sits underneath most PCOS symptoms.',
    basis: '2023 International PCOS Guideline: no single diet wins, but reducing refined carbohydrate and added sugar targets the underlying insulin resistance.',
    limits: { sugarPct: 0.05 },
    watch: ['sugar'],
    rules: [
      { id: 'cond-maida', label: 'Refined flour (maida)', terms: ['maida', 'refined wheat flour', 'refined flour'], why: 'Refined starch worsens the insulin resistance behind PCOS.' },
    ],
  },
  {
    id: 'pregnancy',
    label: 'Pregnancy',
    group: 'Life stage',
    emoji: '🤰',
    short: 'Caffeine, unpasteurised dairy and certain additives.',
    basis: 'WHO/NHS: caffeine below 200 mg/day; avoid unpasteurised dairy (listeria). FSSAI requires a caffeine declaration on energy drinks.',
    limits: { sodium: 2000 },
    watch: ['sodium'],
    rules: [
      { id: 'cond-caffeine', label: 'Caffeine', terms: ['caffeine', 'guarana', 'coffee extract', 'green tea extract'], why: 'Keep total caffeine under 200 mg/day through pregnancy.' },
      { id: 'cond-unpasteurised', label: 'Unpasteurised dairy', terms: ['unpasteurised', 'unpasteurized', 'raw milk'], why: 'Listeria risk — pasteurised only during pregnancy.' },
      { id: 'cond-alcohol', label: 'Alcohol', terms: ['alcohol', 'ethanol', 'rum', 'liqueur'], why: 'No established safe amount in pregnancy.' },
    ],
  },
  {
    id: 'migraine',
    label: 'Migraine',
    group: 'Sensitivity',
    emoji: '🧠',
    short: 'A small set of additives are repeat offenders.',
    basis: 'American Migraine Foundation lists MSG, nitrites and aspartame among the most commonly reported dietary triggers. Triggers are individual — track yours in the diary.',
    watch: [],
    rules: [
      { id: 'cond-msg', label: 'MSG & flavour enhancers', terms: ['monosodium glutamate', 'msg', 'ajinomoto', '621', '627', '631', '635'], why: 'The most frequently self-reported dietary migraine trigger.' },
      { id: 'cond-nitrite', label: 'Nitrites (cured meat)', terms: ['nitrite', 'nitrate', '250', '251', '249'], why: 'Vasodilator effect; a classic "hot dog headache" trigger.' },
      { id: 'cond-aspartame', label: 'Aspartame', terms: ['aspartame', '951'], why: 'Commonly reported trigger in migraine-prone people.' },
    ],
  },
  {
    id: 'coeliac',
    label: 'Coeliac / gluten-free',
    group: 'Allergy',
    emoji: '🌾',
    short: 'Wheat, barley, rye — and malt, which hides.',
    basis: 'Coeliac disease requires strict lifelong gluten avoidance. Always confirm against the physical pack; label data can be incomplete.',
    watch: [],
    strict: true,
    rules: [
      { id: 'cond-gluten', label: 'Gluten sources', terms: ['wheat', 'maida', 'atta', 'barley', 'rye', 'semolina', 'suji', 'rava', 'gluten', 'malt', 'dalia'], why: 'Contains or is derived from a gluten grain.' },
    ],
  },
  {
    id: 'lactose',
    label: 'Lactose intolerance',
    group: 'Allergy',
    emoji: '🥛',
    short: 'Milk solids appear in far more packs than you would guess.',
    basis: 'Roughly 60–70% of Indian adults have reduced lactase activity. Ghee and hard cheese are usually tolerated; milk solids and whey are not.',
    watch: [],
    rules: [
      { id: 'cond-lactose', label: 'Milk & lactose', terms: ['milk solids', 'milk', 'whey', 'lactose', 'casein', 'skimmed milk', 'butter', 'cream', 'paneer', 'khoya'], why: 'A lactose source — milk solids are a default bulking agent in Indian snacks.' },
    ],
  },
  {
    id: 'nutallergy',
    label: 'Nut / peanut allergy',
    group: 'Allergy',
    emoji: '🥜',
    short: 'Including groundnut oil and "may contain" lines.',
    basis: 'FSSAI mandates declaration of tree nuts and groundnut as major allergens. A label check never replaces reading the physical pack.',
    watch: [],
    strict: true,
    rules: [
      { id: 'cond-nuts', label: 'Nuts & peanuts', terms: ['peanut', 'groundnut', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'nut'], why: 'Allergen — verify on the physical pack every time, including "may contain" warnings.' },
    ],
  },
  {
    id: 'ibs',
    label: 'IBS / sensitive gut',
    group: 'Sensitivity',
    emoji: '🌀',
    short: 'High-FODMAP ingredients and emulsifiers.',
    basis: 'Monash low-FODMAP framework; polyol sweeteners carry a mandatory "excessive consumption may have a laxative effect" warning.',
    watch: [],
    rules: [
      { id: 'cond-fodmap', label: 'High-FODMAP ingredients', terms: ['onion', 'garlic', 'inulin', 'chicory', 'high fructose', 'sorbitol', 'mannitol', 'xylitol', '420', '421', '967'], why: 'Ferments in the gut — a common IBS symptom trigger.' },
      { id: 'cond-emulsifier', label: 'Gut-irritant emulsifiers', terms: ['carrageenan', 'polysorbate', '407', '433', '466'], why: 'Shown to erode the intestinal mucus barrier in experimental models.' },
    ],
  },
  {
    id: 'child',
    label: 'Feeding a child',
    group: 'Life stage',
    emoji: '🧒',
    short: 'Colours carrying the EU hyperactivity warning.',
    basis: 'EU Regulation 1333/2008 requires six azo colours to carry "may have an adverse effect on activity and attention in children". WHO: free sugars under 5% of energy for children.',
    limits: { sugarPct: 0.05 },
    watch: ['sugar'],
    rules: [
      { id: 'cond-azo', label: 'Azo colours (Southampton six)', terms: ['tartrazine', 'sunset yellow', 'carmoisine', 'ponceau', 'allura', 'quinoline', '102', '104', '110', '122', '124', '129'], why: 'Legally required to carry a child hyperactivity warning across the EU.' },
      { id: 'cond-caffeine-child', label: 'Caffeine', terms: ['caffeine', 'guarana'], why: 'No established safe caffeine intake for children.' },
    ],
  },
]

export const CONDITION_GROUPS = ['Metabolic', 'Heart', 'Organ', 'Life stage', 'Sensitivity', 'Allergy']

export function conditionById(id) {
  return CONDITIONS.find((c) => c.id === id)
}

/* ------------------------------------------------------------------ */
/*  Limit tightening                                                    */
/* ------------------------------------------------------------------ */

/**
 * Apply every selected condition to the base ceilings.
 * Conditions may only tighten: each candidate competes via Math.min, so the
 * strictest selected condition wins per nutrient and adding conditions can never
 * relax the plan.
 *
 * @returns { limits, applied: [{ condition, nutrient, from, to }] }
 */
export function applyConditions(baseLimits, conditionIds = []) {
  const limits = { ...baseLimits }
  const applied = []
  const kcal = baseLimits?.calories || 2000

  for (const id of conditionIds) {
    const c = conditionById(id)
    if (!c?.limits) continue

    const candidates = {}
    if (c.limits.sugarPct != null) candidates.sugar = Math.round((kcal * c.limits.sugarPct) / 4)
    if (c.limits.satFatPct != null) candidates.satFat = Math.round((kcal * c.limits.satFatPct) / 9)
    if (c.limits.sugar != null) candidates.sugar = Math.min(candidates.sugar ?? Infinity, c.limits.sugar)
    if (c.limits.sodium != null) candidates.sodium = c.limits.sodium
    if (c.limits.satFat != null) candidates.satFat = Math.min(candidates.satFat ?? Infinity, c.limits.satFat)

    for (const [nutrient, value] of Object.entries(candidates)) {
      if (value < limits[nutrient]) {
        applied.push({ condition: c, nutrient, from: limits[nutrient], to: value })
        limits[nutrient] = value
      }
    }
  }
  return { limits, applied }
}

/** Avoid-rules contributed by the selected conditions, de-duplicated by id. */
export function conditionRules(conditionIds = []) {
  const seen = new Map()
  for (const id of conditionIds) {
    const c = conditionById(id)
    if (!c) continue
    for (const r of c.rules || []) {
      if (!seen.has(r.id)) seen.set(r.id, { ...r, fromCondition: c.id, conditionLabel: c.label })
    }
  }
  return [...seen.values()]
}

/** Which nutrients the user's conditions make most important. */
export function watchedNutrients(conditionIds = []) {
  const set = new Set()
  for (const id of conditionIds) for (const n of conditionById(id)?.watch || []) set.add(n)
  return [...set]
}

/* ------------------------------------------------------------------ */
/*  Per-product personal verdict                                        */
/* ------------------------------------------------------------------ */

const NUTRIENT_META = {
  sugar: { label: 'sugar', unit: 'g' },
  sodium: { label: 'sodium', unit: 'mg' },
  satFat: { label: 'saturated fat', unit: 'g' },
}

/**
 * Turn a product + the user's conditions into concrete, personal statements.
 * Deliberately quantified against THIS user's ceiling ("62% of your daily
 * sodium") rather than a generic "high in salt" — the number is what makes it
 * actionable, and it is only meaningful because the ceiling is personalised.
 *
 * @returns [{ kind:'nutrient'|'ingredient', severity:'high'|'medium', title, detail, conditions:[label] }]
 */
export function personalAlerts(product, conditionIds = [], limits = {}) {
  if (!product || !conditionIds.length) return []
  const alerts = []

  // 1. Nutrient load, as a share of this user's own tightened ceiling.
  const watched = watchedNutrients(conditionIds)
  for (const nutrient of watched) {
    const amount = product.nutrients?.[nutrient]
    const ceiling = limits?.[nutrient]
    if (!amount || !ceiling) continue
    const pct = Math.round((amount / ceiling) * 100)
    if (pct < 25) continue

    const owners = conditionIds
      .map(conditionById)
      .filter((c) => c?.watch?.includes(nutrient))
      .map((c) => c.label)

    const meta = NUTRIENT_META[nutrient]
    alerts.push({
      kind: 'nutrient',
      severity: pct >= 50 ? 'high' : 'medium',
      nutrient,
      pct,
      title: `${pct}% of your daily ${meta.label} in 100 g`,
      detail: `${amount} ${meta.unit} against your ${ceiling} ${meta.unit} ceiling, tightened for ${owners.join(' and ')}.`,
      conditions: owners,
    })
  }

  // 2. Ingredient hazards specific to the selected conditions, matched with the
  //    same engine the avoid list uses.
  const rules = conditionRules(conditionIds)
  const lines = product.ingredients || []
  for (const rule of rules) {
    const hit = matchRule(lines, rule)
    if (!hit) continue
    const c = conditionById(rule.fromCondition)
    alerts.push({
      kind: 'ingredient',
      severity: c?.strict ? 'high' : 'medium',
      title: rule.label,
      detail: rule.why,
      matched: hit.term,
      ingredient: hit.line,
      conditions: [rule.conditionLabel],
    })
  }

  return alerts.sort((a, b) => (b.severity === 'high') - (a.severity === 'high'))
}

// Local copy of the avoid matcher's semantics (3-digit term = INS code) so this
// module stays dependency-light; kept in sync with avoidList.lineHits.
function matchRule(lines, rule) {
  for (const line of lines) {
    const s = String(line || '').toLowerCase()
    for (const t of rule.terms) {
      const term = String(t).toLowerCase()
      if (/^\d{3}[a-d]?$/.test(term)) {
        // Match a bare code only inside an additive-looking context, mirroring
        // ingredientClassify.additiveCodes (so "(200 mg)" is not additive 200).
        if (new RegExp(`(?:ins|e)?\\s*\\(?\\b${term}\\b`, 'i').test(s)
          && /colour|color|flavour|flavor|enhancer|preservative|raising|emulsif|stabilis|stabiliz|thicken|acidity|antioxidant|anticaking|humectant|sweeten|ins|e\d/i.test(s)) {
          return { term, line }
        }
      } else if (s.includes(term)) {
        return { term, line }
      }
    }
  }
  return null
}

/** Compact one-line summary for cards and lists. */
export function personalVerdict(alerts = []) {
  if (!alerts.length) return null
  const high = alerts.filter((a) => a.severity === 'high').length
  return {
    count: alerts.length,
    high,
    label: high ? `${high} serious flag${high > 1 ? 's' : ''} for you` : `${alerts.length} thing${alerts.length > 1 ? 's' : ''} to watch`,
    severity: high ? 'high' : 'medium',
  }
}
