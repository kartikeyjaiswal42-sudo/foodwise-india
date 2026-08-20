// Parsers for a BigBasket product page. Pure — no network, so they can be
// tested against a saved page.
//
// BigBasket is a Tata Consumer company, and unlike Tata's own marketing sites
// (tataconsumer.com, tetley.in, chingssecret.com — checked, none of them publish
// a nutrition panel at all) its product pages carry the full declared panel:
// energy, protein, carbohydrate, total AND added sugars, fibre, fat, saturated
// fat, sodium. That is strictly better than the Open Food Facts records for the
// same SKUs, which usually carry three values or none.

/** Pull the Next.js data blob out of a product page. */
export function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

const stripHtml = (s) => String(s || '')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/(p|div|tr|li)>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, "'")
  .replace(/[ \t ]+/g, ' ')

const numOf = (s) => {
  if (s == null) return null
  const m = String(s).match(/-?\d+(?:\.\d+)?/)
  if (!m) return null
  const v = parseFloat(m[0])
  return isFinite(v) ? v : null
}

/**
 * Parse the nutrition block out of the "Ingredients" tab.
 *
 * THE GUARD THAT MATTERS: `basis`. Some packs declare their panel per 100 g,
 * others per serving ("Nutrition_per: 30g"). Reading a per-serving panel as
 * per-100 g understates a cereal by a factor of three, and it would do so
 * silently because the numbers are individually plausible. So the basis is
 * parsed FIRST and anything that is not explicitly 100 g / 100 ml is returned
 * with `per100: false` and dropped by the caller — we do not rescale, because
 * the serving size is itself often absent or ambiguous.
 */
export function parseNutrition(tabContent) {
  const text = stripHtml(tabContent)
  if (!/nutrition/i.test(text)) return null

  const basisM = text.match(/Nutrition[_ ]?(?:per(?: gram\/ml)?)?\s*:\s*([^\n]{0,24})/i)
  const basisRaw = basisM ? basisM[1].trim() : ''
  const per100 = /^100\s*(g|ml|gm|gms|g\b)/i.test(basisRaw)

  const grab = (...labels) => {
    for (const label of labels) {
      // Label, optional unit in brackets, colon, then the value.
      const re = new RegExp(`${label}\\s*(?:\\([^)]*\\))?\\s*[:\\-]\\s*([<>]?\\s*[\\d.]+)`, 'i')
      const m = text.match(re)
      if (m) return numOf(m[1])
    }
    return null
  }

  /** Energy in kcal only — a kJ declaration must not be read as kcal. */
  function grabEnergyKcal(t) {
    const kcal = t.match(/Energy\s*\(\s*k\s*cal\s*\)\s*[:\-]\s*([\d.]+)/i)
    if (kcal) return numOf(kcal[1])
    // "Energy: 338 kcal" — unit after the value.
    const trailing = t.match(/Energy\s*[:\-]\s*([\d.]+)\s*k\s*cal/i)
    if (trailing) return numOf(trailing[1])
    // Unitless "Energy: 338" is conventionally kcal on an Indian label, but only
    // accept it when no kJ figure is present to contradict it.
    if (!/k\s*j\b/i.test(t)) {
      const bare = t.match(/Energy\s*(?:\([^)]*\))?\s*[:\-]\s*([\d.]+)/i)
      if (bare) return numOf(bare[1])
    }
    return null
  }

  const out = {
    basis: basisRaw || null,
    per100,
    // Energy must be matched with its UNIT checked. A bare grab('Energy')
    // happily matched "Energy (kj): 1414" and stored kilojoules in the kcal
    // field — a 4.2x overstatement that no individual number would look wrong
    // enough to catch.
    calories: grabEnergyKcal(text),
    protein: grab('Protein'),
    carbs: grab('Carbohydrate[s]?', 'Total Carbohydrate'),
    sugar: grab('Total Sugars', 'Sugars', 'Added Sugars'),
    addedSugar: grab('Added Sugars'),
    fibre: grab('Dietary Fibre', 'Dietary Fiber', 'Fibre', 'Fiber'),
    fat: grab('Total Fat', 'Fat'),
    satFat: grab('Saturated Fat', 'Saturates'),
    transFat: grab('Trans Fat'),
    sodium: grab('Sodium'),
    salt: grab('Salt'),
  }

  // Energy is sometimes declared only in kilojoules.
  if (out.calories == null) {
    const kj = grab('Energy \\(kj\\)', 'Energy kj')
    if (kj != null) out.calories = Math.round(kj / 4.184)
  }
  // Sodium may only appear as salt. 1 g salt = 393.4 mg sodium.
  if (out.sodium == null && out.salt != null) out.sodium = Math.round(out.salt * 393.4)

  const any = ['calories', 'protein', 'carbs', 'sugar', 'fibre', 'fat', 'satFat', 'sodium']
    .some((k) => out[k] != null)
  return any ? out : null
}

/**
 * The Ingredients tab holds the ingredient statement AND the nutrition table in
 * one blob. Take the part before the nutrition block starts.
 */
export function parseIngredients(tabContent) {
  const text = stripHtml(tabContent)
  // "Nutrition per gram/ml:" has words between "Nutrition" and the colon, so a
  // pattern demanding an immediate colon skipped it and cut at "Energy (kcal)"
  // instead — leaving the panel's own header as the sole "ingredient".
  const cut = text.search(/Nutrition[_ ]?per\b|Nutrition\s*:|Nutritional Information|Energy\s*\(k/i)
  let head = (cut > 0 ? text.slice(0, cut) : text).trim()
  head = head.replace(/^Ingredients?\s*[:\-]?\s*/i, '').trim()
  if (head.length < 4 || head.length > 1200) return []
  return head
    .split(/,(?![^(]*\))/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s && s.length > 1 && s.length < 90)
    .slice(0, 30)
}

const tabByTitle = (node, re) =>
  (node?.tabs || []).find((t) => re.test(String(t.title || t.name || '')))?.content || ''

/** Flatten a product page into one record per pack-size variant. */
export function parseProductPage(html, sourceUrl) {
  const data = extractNextData(html)
  const root = data?.props?.pageProps?.productDetails
  if (!root) return []

  const out = []
  const seen = new Set()

  const take = (node) => {
    if (!node || typeof node !== 'object') return
    const sku = String(node.id || node.sku || '')
    if (sku && !seen.has(sku) && node.desc && node.brand?.name) {
      seen.add(sku)
      const ingTab = tabByTitle(node, /ingredient/i)
      const nutrition = parseNutrition(ingTab)
      out.push({
        sku,
        name: String(node.desc).trim(),
        brand: String(node.brand.name).trim(),
        brandSlug: String(node.brand.slug || '').trim(),
        size: String(node.w || node.pack_desc || '').trim(),
        image: node.images?.[0]?.l || node.images?.[0]?.m || node.images?.[0]?.s || null,
        mrp: numOf(node.pricing?.discount?.mrp),
        sellingPrice: numOf(node.pricing?.discount?.prim_price?.sp),
        categoryTop: node.category?.tlc_name || null,
        categoryLeaf: node.category?.llc_name || null,
        ingredients: parseIngredients(ingTab),
        nutrition,
        about: stripHtml(tabByTitle(node, /about/i)).trim().slice(0, 400) || null,
        url: node.absolute_url ? `https://www.bigbasket.com${node.absolute_url}` : sourceUrl,
      })
    }
    for (const child of node.children || []) take(child)
  }

  for (const child of root.children || []) take(child)
  if (!out.length) take(root)
  return out
}
