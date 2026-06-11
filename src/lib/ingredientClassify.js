// Classify any packaged-food ingredient string as good / neutral / bad, with a
// short reason and a food group. Rules are matched in order (first hit wins),
// so put specific/bad patterns before generic ones. Unknown -> neutral (we do
// not fear-monger). Used by the Ingredient Guide, Product Detail and Diary.

// E / INS additive numbers with a known lean. Anything not listed is treated
// as a neutral permitted additive.
const ADDITIVE_VERDICT = {
  // colours (synthetic azo / caramel IV) -> bad
  102: ['bad', 'Tartrazine — synthetic azo dye linked to hyperactivity in children'],
  110: ['bad', 'Sunset Yellow — azo dye, allergy/hyperactivity concerns'],
  122: ['bad', 'Carmoisine — azo dye, banned in several countries'],
  124: ['bad', 'Ponceau 4R — azo dye, restricted for children'],
  129: ['bad', 'Allura Red — synthetic azo dye'],
  133: ['bad', 'Brilliant Blue — synthetic dye'],
  '150c': ['bad', 'Ammonia caramel'],
  '150d': ['bad', 'Caramel IV — can contain 4-MEI (possible carcinogen)'],
  // preservatives
  211: ['bad', 'Sodium benzoate — can form benzene with vitamin C'],
  223: ['bad', 'Sodium metabisulphite — sulphite, triggers asthma in sensitive people'],
  319: ['bad', 'TBHQ — synthetic antioxidant'],
  320: ['bad', 'BHA — synthetic antioxidant, possible carcinogen'],
  321: ['bad', 'BHT — synthetic antioxidant'],
  // flavour enhancers (MSG family)
  621: ['bad', 'MSG — excitotoxin / overrides satiety'],
  627: ['bad', 'Disodium guanylate — MSG booster'],
  631: ['bad', 'Disodium inosinate — MSG booster'],
  635: ['bad', 'Disodium ribonucleotides — MSG booster'],
  // emulsifier/thickener of concern
  407: ['bad', 'Carrageenan — gut-lining inflammation'],
  171: ['bad', 'Titanium dioxide — banned as a food additive in the EU'],
  476: ['neutral', 'PGPR — emulsifier from castor oil'],
  // neutral common additives
  170: ['neutral', 'Calcium carbonate'],
  260: ['neutral', 'Acetic acid (vinegar)'],
  270: ['good', 'Lactic acid — natural fermentation acid'],
  296: ['neutral', 'Malic acid'],
  300: ['good', 'Ascorbic acid (vitamin C)'],
  306: ['good', 'Tocopherol (vitamin E) — natural antioxidant'],
  322: ['neutral', 'Lecithin — emulsifier (often from soy/sunflower)'],
  330: ['neutral', 'Citric acid — common acidity regulator'],
  331: ['neutral', 'Sodium citrate'],
  334: ['neutral', 'Tartaric acid'],
  340: ['neutral', 'Potassium phosphate'],
  375: ['good', 'Niacin (vitamin B3)'],
  412: ['neutral', 'Guar gum — natural seed thickener'],
  410: ['neutral', 'Locust bean gum — natural thickener'],
  415: ['neutral', 'Xanthan gum — fermentation thickener'],
  440: ['good', 'Pectin — natural fruit fibre'],
  500: ['neutral', 'Baking soda (raising agent)'],
  503: ['neutral', 'Ammonium bicarbonate (raising agent)'],
  504: ['neutral', 'Magnesium carbonate'],
  160: ['good', 'Carotenes — natural colour / vitamin A precursor'],
  '160b': ['neutral', 'Annatto — natural colour'],
  101: ['neutral', 'Riboflavin (vitamin B2)'],
  440: ['good', 'Pectin — natural fruit fibre'],
}

// Ordered keyword rules. Each: [regex, verdict, label, why, group]
const RULES = [
  // ---- BAD: refined / processed ----
  [/\bmaida\b|refined wheat flour|refined flour|enriched flour|bleached flour/, 'bad', 'Refined flour (maida)', 'Stripped of fibre and bran — fast blood-sugar spikes, low nutrition.', 'Grains'],
  [/(partially )?hydrogenated|vanaspati|interesterified|\bshortening\b|trans fat/, 'bad', 'Hydrogenated / trans fat', 'Industrial trans-style fat — raises bad cholesterol, hurts the heart.', 'Fats & oils'],
  [/palm\s*kernel|palmolein|\bpalm\s*oil\b|palm fat|\bpalm\b/, 'bad', 'Palm oil', '~50% saturated fat; high-heat refining creates harmful contaminants.', 'Fats & oils'],
  [/high.?fructose|corn syrup|liquid glucose|glucose syrup|glucose[- ]fructose|invert sugar|invert syrup|fructose syrup/, 'bad', 'Glucose / fructose syrup', 'Cheap free sugar absorbed instantly — drives fat storage & insulin spikes.', 'Sweeteners'],
  [/\bsugar\b|sucrose|dextrose|caramel syrup|\bsyrup\b/, 'bad', 'Added sugar', 'Added free sugar — limit to ~25 g/day; drives weight gain & decay.', 'Sweeteners'],
  [/maltodextrin|malt extract/, 'bad', 'Maltodextrin / malt extract', 'Ultra-processed starch, glycemic index higher than sugar; disturbs gut flora.', 'Sweeteners'],
  [/monosodium glutamate|\bmsg\b|ajinomoto/, 'bad', 'MSG (flavour enhancer)', 'Overrides natural fullness signals; reactions in sensitive people.', 'Additives'],
  [/carrageenan/, 'bad', 'Carrageenan', 'Seaweed thickener linked to gut-lining inflammation.', 'Emulsifiers'],
  [/artificial (colour|color|flavour|flavor)|synthetic (colour|color)|tartrazine|sunset yellow|carmoisine|allura|ponceau|brilliant blue/, 'bad', 'Artificial colour / flavour', 'Synthetic additive; some azo dyes are linked to hyperactivity in children.', 'Colours'],
  [/titanium dioxide/, 'bad', 'Titanium dioxide', 'Whitening agent banned as a food additive in the EU.', 'Colours'],

  // ---- GOOD: whole foods ----
  [/whole wheat|whole grain|wholegrain|\batta\b|multigrain|whole oat|rolled oat|\boats?\b|porridge oat/, 'good', 'Whole grain', 'Keeps fibre, bran & germ — slow energy, good for the gut.', 'Grains'],
  [/millet|ragi|finger millet|jowar|sorghum|bajra|pearl millet|foxtail|barnyard|quinoa|barley|buckwheat|amaranth/, 'good', 'Millet / ancient grain', 'High-fibre, mineral-rich whole grain with a low glycemic load.', 'Grains'],
  [/almond|cashew|walnut|pistachio|hazelnut|\bnuts?\b|peanut(?!.*oil)/, 'good', 'Nuts', 'Good fats, protein and fibre — heart and metabolism friendly.', 'Nuts & seeds'],
  [/flax|chia|sunflower seed|pumpkin seed|sesame|\bseeds?\b|melon seed/, 'good', 'Seeds', 'Fibre, minerals and healthy omega fats.', 'Nuts & seeds'],
  [/\bdal\b|lentil|chickpea|\bgram\b|besan|\bsoya?\b|soybean|moong|chana|rajma|pulse|legume|pea protein|black gram/, 'good', 'Pulses / legumes', 'Plant protein and fibre — steadies blood sugar.', 'Pulses'],
  [/tomato|onion|garlic|ginger|carrot|spinach|\bpeas?\b|potato(?!.*(chip|starch))|vegetable(?!.*oil)|capsicum|cabbage|cauliflower|beetroot|mushroom/, 'good', 'Vegetables', 'Real vegetables add fibre, vitamins and antioxidants.', 'Fruits & vegetables'],
  [/turmeric|cumin|coriander|fenugreek|cardamom|clove|cinnamon|\bpepper\b|mustard|fennel|asafoet|\bhing\b|curry leaf|bay le|\bspices?\b|oregano|basil|\bmint\b|chill?i|nutmeg|aniseed|\banise\b|ajwain|carom|\bmace\b|paprika|garam masala|dry ginger|tamarind|caraway|saffron|\bdill\b|fenugreek/, 'good', 'Spices & herbs', 'Natural flavour with antioxidant and digestive benefits.', 'Spices'],
  [/\beggs?\b|egg white|egg powder|albumen/, 'good', 'Egg', 'Complete protein with vitamins and minerals.', 'Other'],
  [/\bfruit\b|mango|apple|orange|banana|pineapple|strawberry|pomegranate|guava|\bberry\b|berries|\braisins?\b|\bdates?\b|fruit pulp|fruit juice concentrate/, 'good', 'Fruit', 'Whole-fruit content brings fibre, vitamins and natural sweetness.', 'Fruits & vegetables'],
  [/cocoa solids|cocoa mass|cocoa butter|cocoa powder|\bcocoa\b|\bcacao\b/, 'good', 'Cocoa', 'Cocoa solids carry flavonoid antioxidants (best in dark chocolate).', 'Other'],
  [/\bmilk\b|skimmed milk|milk solids|curd|yogurt|yoghurt|\bpaneer\b|\bghee\b|buttermilk|\bwhey\b|probiotic|active culture|lactobacillus|\bcheese\b(?!.*flavour)/, 'good', 'Dairy', 'Protein and calcium source (watch added sugar in flavoured dairy).', 'Dairy'],
  [/\bhoney\b|jaggery|\bgur\b/, 'neutral', 'Honey / jaggery', 'Less-refined sweetener — still a sugar, use sparingly.', 'Sweeteners'],
  [/lecithin/, 'good', 'Lecithin', 'Natural emulsifier (usually soy/sunflower) — benign.', 'Emulsifiers'],
  [/inulin|chicory fibre|dietary fibre|\bfibre\b|\bfiber\b|wheat bran|oat bran|psyllium/, 'good', 'Added fibre', 'Supports digestion and slows sugar absorption.', 'Grains'],
  [/vitamin|niacin|riboflavin|thiamine|folic acid|\biron\b|\bzinc\b|\bcalcium\b|mineral|ascorbic/, 'good', 'Vitamins & minerals', 'Fortified micronutrients.', 'Salt & minerals'],

  // ---- NEUTRAL: benign / structural ----
  [/iodised salt|iodized salt|\bsalt\b|sodium chloride|sea salt|rock salt/, 'neutral', 'Salt', 'Needed in small amounts — packaged foods add up; watch total sodium.', 'Salt & minerals'],
  [/\bwater\b|aqua/, 'neutral', 'Water', 'Inert base ingredient.', 'Other'],
  [/baking soda|sodium bicarbonate|raising agent|baking powder|leavening/, 'neutral', 'Raising agent', 'Leavening for baked goods — benign.', 'Additives'],
  [/citric acid|acidity regulator|lactic acid|acetic acid|malic acid|tartaric acid|\bacid\b/, 'neutral', 'Acidity regulator', 'Common food acid for tartness/shelf-life.', 'Additives'],
  [/corn starch|maize starch|tapioca|modified starch|\bstarch\b/, 'neutral', 'Starch', 'Thickener/bulking starch — generally benign.', 'Additives'],
  [/guar gum|xanthan|locust bean|pectin|\bgum\b|stabiliser|stabilizer|thickener/, 'neutral', 'Thickener / stabiliser', 'Texture agent — mostly benign in normal amounts.', 'Emulsifiers'],
  [/natural (flavour|flavor)|natural identical|\byeast\b|emulsifier/, 'neutral', 'Natural flavour / yeast', 'Generally benign flavour/leavening agent.', 'Additives'],
  [/edible (vegetable )?oil|sunflower oil|rice bran oil|groundnut oil|mustard oil|olive oil|sesame oil|coconut oil|canola/, 'neutral', 'Vegetable oil', 'Refined cooking oil — fine in moderation (better than palm).', 'Fats & oils'],
  [/\bbutter\b|cream\b|milk fat|butter oil/, 'neutral', 'Dairy fat', 'Natural saturated fat — fine in moderation.', 'Dairy'],
]

const ADDITIVE_CLASS_RE = /(colou?r|flavou?r|enhancer|preservativ|raising agent|emulsif|stabili|thickener|acidity regulator|anti.?caking|humectant|antioxidant|sweetener|firming|flour treatment|gelling|sequestrant|leavening|\bins\b|\be\d)/i
const ADDITIVE_CLASS_LABEL = /(flavou?r enhancers?|colou?rs?|preservatives?|raising agents?|emulsifiers?|stabili[sz]ers?|thickeners?|acidity regulators?|anti.?caking agents?|humectants?|antioxidants?|sweeteners?|firming agents?|flour treatment agents?|gelling agents?)/i

// Pull additive numbers (e.g. 635, 150d, 500(ii)) — but only when the string is
// clearly an additive declaration (has a class word OR an INS/E prefix), so we
// never mistake a quantity like "(200 mg)" for additive 200.
function additiveCodes(s) {
  if (!ADDITIVE_CLASS_RE.test(s)) return []
  const codes = []
  for (const m of s.matchAll(/\b(\d{3})([a-d])?\b(?!\s*(mg|kg|ml|g|%|kcal))/gi)) {
    const n = parseInt(m[1], 10)
    if (n < 100 || n > 1599) continue
    codes.push((m[1] + (m[2] || '')).toLowerCase())
  }
  return codes
}

export function classifyIngredient(raw) {
  const name = String(raw || '').trim()
  if (!name) return null
  const s = name.toLowerCase()

  // 1) keyword rules (specific, ordered)
  for (const [re, verdict, label, why, group] of RULES) {
    if (re.test(s)) return { verdict, label, why, group, raw: name }
  }
  // 2) additive numbers (INS / E prefixed OR bare codes in an additive context)
  const codes = additiveCodes(s)
  if (codes.length) {
    const clsWord = (s.match(ADDITIVE_CLASS_LABEL) || [])[0]
    const clsLabel = clsWord ? clsWord.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Additive'
    const label = `${clsLabel} (${codes.map((c) => c.toUpperCase()).join(', ')})`
    // worst verdict wins
    const bad = codes.find((c) => ADDITIVE_VERDICT[c]?.[0] === 'bad')
    if (bad) return { verdict: 'bad', label, why: ADDITIVE_VERDICT[bad][1], group: 'Additives', raw: name }
    const good = codes.find((c) => ADDITIVE_VERDICT[c]?.[0] === 'good')
    if (good && codes.length === 1) return { verdict: 'good', label, why: ADDITIVE_VERDICT[good][1], group: 'Additives', raw: name }
    return { verdict: 'neutral', label, why: 'Permitted additive with no major flagged concern in normal amounts.', group: 'Additives', raw: name }
  }
  // 3) default
  return { verdict: 'neutral', label: name, why: 'No specific concern identified — treated as neutral.', group: 'Other', raw: name }
}

export const VERDICT_META = {
  good: { label: 'Good', color: '#10b981', tip: 'Whole-food or beneficial ingredient.' },
  neutral: { label: 'Neutral', color: '#9aa0a6', tip: 'Benign or structural — fine in moderation.' },
  bad: { label: 'Watch out', color: '#ef4444', tip: 'Refined, additive or processed — limit it.' },
}

// Build a frequency-ranked index of every distinct ingredient across the catalog.
export function buildIngredientIndex(products) {
  const map = new Map()
  for (const p of products) {
    const seen = new Set()
    for (const ing of p.ingredients || []) {
      const c = classifyIngredient(ing)
      if (!c) continue
      const key = c.label.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      if (!map.has(key)) map.set(key, { ...c, count: 0, examples: [] })
      const e = map.get(key)
      e.count += 1
      if (e.examples.length < 3 && !e.examples.includes(p.name)) e.examples.push(p.name)
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

// Per-product ingredient-quality tally.
export function ingredientQuality(product) {
  const t = { good: 0, neutral: 0, bad: 0 }
  for (const ing of product.ingredients || []) {
    const c = classifyIngredient(ing)
    if (c) t[c.verdict] += 1
  }
  return t
}
