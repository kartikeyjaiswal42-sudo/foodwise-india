// Personal "never feed me this" list.
// Stored in localStorage as [{ id, label, terms: [string] }] and matched against
// every product's declared ingredient lines + the INS/E codes inside them.
// Pure functions only — the React state lives in page.js (SSR-safe hydration).

import { additiveCodes } from './ingredientClassify'

export const AVOID_STORAGE_KEY = 'jaano-avoid-v1'

// One-tap presets covering the families people most often want out of their food.
export const AVOID_PRESETS = [
  { id: 'palm', label: 'Palm oil & palmolein', terms: ['palm oil', 'palmolein', 'palm fat', 'palm kernel'], why: '~50% saturated; refining creates 3-MCPD/glycidyl esters.' },
  { id: 'maida', label: 'Refined flour (maida)', terms: ['maida', 'refined wheat flour', 'refined flour', 'bleached flour'], why: 'Pure starch, no fibre — sharp blood-sugar spikes.' },
  { id: 'msg', label: 'MSG & flavour enhancers', terms: ['monosodium glutamate', 'msg', 'ajinomoto', '621', '627', '631', '635'], why: 'Overrides satiety; reactions in sensitive people.' },
  { id: 'azo', label: 'Synthetic azo colours', terms: ['tartrazine', 'sunset yellow', 'carmoisine', 'ponceau', 'allura', '102', '110', '122', '124', '129'], why: 'Linked to hyperactivity in children; several banned abroad.' },
  { id: 'sulphite', label: 'Sulphites', terms: ['sulphite', 'sulfite', 'metabisulphite', 'sulphur dioxide', '220', '223', '224'], why: 'Can trigger severe asthma attacks in sensitive people.' },
  { id: 'transfat', label: 'Hydrogenated / trans fat', terms: ['hydrogenated', 'vanaspati', 'shortening', 'interesterified'], why: 'Raises LDL and lowers HDL — the worst cholesterol shift.' },
  { id: 'sweetener', label: 'Artificial sweeteners', terms: ['aspartame', 'sucralose', 'acesulfame', 'saccharin', '950', '951', '954', '955'], why: 'Microbiome and blood-sugar effects; aspartame is IARC 2B.' },
  { id: 'carrageenan', label: 'Carrageenan & polysorbates', terms: ['carrageenan', 'polysorbate', '407', '433'], why: 'Erodes the gut mucus barrier; inflammation risk.' },
  { id: 'bha', label: 'BHA / BHT / TBHQ', terms: ['bha', 'bht', 'tbhq', 'butylated', '319', '320', '321'], why: 'Synthetic antioxidants with carcinogenicity/endocrine flags.' },
  { id: 'tio2', label: 'Titanium dioxide', terms: ['titanium dioxide', '171'], why: 'Banned as a food additive in the EU since 2022.' },
  { id: 'nitrite', label: 'Nitrites in cured meat', terms: ['nitrite', 'nitrate', '250', '251'], why: 'Forms nitrosamines — IARC Group 1 in processed meat.' },
  { id: 'gluten', label: 'Gluten (wheat, barley, rye)', terms: ['wheat', 'maida', 'atta', 'barley', 'rye', 'semolina', 'suji', 'gluten'], why: 'For coeliac disease or diagnosed gluten sensitivity.' },
  { id: 'dairy', label: 'Milk & dairy', terms: ['milk', 'butter', 'ghee', 'cheese', 'whey', 'casein', 'paneer', 'curd', 'cream'], why: 'For lactose intolerance or a dairy allergy.' },
  { id: 'nuts', label: 'Nuts & peanuts', terms: ['peanut', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'groundnut'], why: 'Allergen — always confirm against the physical pack too.' },
  { id: 'soy', label: 'Soy', terms: ['soy', 'soya', 'soybean'], why: 'Common allergen; also a lecithin source.' },
]

export function makeCustomAvoid(text) {
  const term = String(text || '').trim().toLowerCase()
  if (term.length < 2) return null
  return { id: `custom-${term.replace(/\s+/g, '-')}`, label: text.trim(), terms: [term], custom: true }
}

// Does one ingredient line trip one avoid rule?
function lineHits(line, rule) {
  const s = String(line || '').toLowerCase()
  const codes = additiveCodes(s)
  for (const t of rule.terms) {
    const term = t.toLowerCase()
    if (/^\d{3}[a-d]?$/.test(term)) {
      if (codes.includes(term)) return term
    } else if (s.includes(term)) {
      return term
    }
  }
  return null
}

/**
 * Which avoid-rules does this product trip?
 * @returns [{ rule, matchedTerm, ingredient }]
 */
export function avoidHits(product, avoid = []) {
  if (!avoid.length) return []
  const out = []
  for (const rule of avoid) {
    for (const line of product?.ingredients || []) {
      const term = lineHits(line, rule)
      if (term) { out.push({ rule, matchedTerm: term, ingredient: line }); break }
    }
  }
  return out
}

/** Same check against a raw pasted label (array of split ingredient lines). */
export function avoidHitsInLines(lines = [], avoid = []) {
  const out = []
  for (const rule of avoid) {
    for (const line of lines) {
      const term = lineHits(line, rule)
      if (term) { out.push({ rule, matchedTerm: term, ingredient: line }); break }
    }
  }
  return out
}

export function isAvoided(id, avoid = []) {
  return avoid.some((a) => a.id === id)
}
