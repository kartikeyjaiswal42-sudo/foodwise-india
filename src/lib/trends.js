// TRENDS & INSIGHTS (pure)
// ============================================================================
// Weekly aggregation over the diary, plus plain-language findings.
//
// THE RULE: every sentence this module emits is ARITHMETIC OVER THE USER'S OWN
// LOGGED ENTRIES. Nothing here infers a cause, diagnoses anything, or predicts.
// "Your sodium averaged 3,180 mg — above your 2,300 mg ceiling on 5 of 7 days"
// is a count. "You are eating too much salt because you eat out" is a story, and
// this module does not tell stories.
//
// A finding is OMITTED rather than softened when the data cannot carry it. Two
// logged days do not support a sentence about a weekly pattern, and printing one
// anyway — hedged with "may" — trains the user to ignore the panel. The same
// discipline as flexfit's `deriveInsights`.

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                               */
/* -------------------------------------------------------------------------- */

export const dayKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d)
  // Local date, not toISOString — that shifts to UTC and files an 11 pm dinner
  // in India under the previous day.
  const p = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`
}

export function lastNDays(n, endDate = new Date()) {
  const out = []
  const end = new Date(endDate)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    out.push(dayKey(d))
  }
  return out
}

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const weekdayOf = (key) => WEEKDAY[new Date(`${key}T12:00:00`).getDay()]

/* -------------------------------------------------------------------------- */
/*  Aggregation                                                               */
/* -------------------------------------------------------------------------- */

const EMPTY = { calories: 0, sugar: 0, sodium: 0, satFat: 0, protein: 0, fibre: 0 }

/**
 * Roll the diary up per day.
 *
 * Two kinds of entry share the log: packaged products (`productId`, nutrition
 * looked up in the catalog) and meals (`meal`, nutrition already computed by the
 * estimator and STORED ON THE ENTRY). Meals store their numbers because the dish
 * table can be corrected later and a logged meal must not silently change what
 * it recorded — the diary is a record of what you ate, not a live query.
 */
export function dailyTotals(log = [], products = [], days) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const keys = days || [...new Set(log.map((l) => l.date))].sort()
  const out = new Map(keys.map((k) => [k, { date: k, ...EMPTY, entries: 0, meals: 0, packaged: 0 }]))

  for (const item of log) {
    const row = out.get(item.date)
    if (!row) continue
    row.entries++

    if (item.meal?.totals) {
      const t = item.meal.totals
      row.calories += t.kcal || 0
      row.sugar += t.sugar || 0
      row.sodium += t.sodium || 0
      row.satFat += t.satFat || 0
      row.protein += t.protein || 0
      row.fibre += t.fibre || 0
      row.meals++
      continue
    }

    const p = byId.get(item.productId)
    if (!p) continue
    const s = item.servings || 1
    row.calories += (p.calories || 0) * s
    row.sugar += (p.nutrients?.sugar || 0) * s
    row.sodium += (p.nutrients?.sodium || 0) * s
    row.satFat += (p.nutrients?.satFat || 0) * s
    row.packaged++
  }

  return [...out.values()].map((r) => ({
    ...r,
    calories: Math.round(r.calories),
    sugar: Math.round(r.sugar * 10) / 10,
    sodium: Math.round(r.sodium),
    satFat: Math.round(r.satFat * 10) / 10,
    protein: Math.round(r.protein * 10) / 10,
    fibre: Math.round(r.fibre * 10) / 10,
  }))
}

/** Averages over days that actually have entries. An unlogged day is missing
 *  data, not a zero-calorie day, and averaging it in would understate everything. */
export function averages(rows) {
  const logged = rows.filter((r) => r.entries > 0)
  if (!logged.length) return { ...EMPTY, loggedDays: 0, totalDays: rows.length }
  const sum = logged.reduce((a, r) => {
    for (const k of Object.keys(EMPTY)) a[k] += r[k]
    return a
  }, { ...EMPTY })
  const avg = {}
  for (const k of Object.keys(EMPTY)) {
    avg[k] = k === 'calories' || k === 'sodium'
      ? Math.round(sum[k] / logged.length)
      : Math.round((sum[k] / logged.length) * 10) / 10
  }
  return { ...avg, loggedDays: logged.length, totalDays: rows.length }
}

/* -------------------------------------------------------------------------- */
/*  Insights                                                                   */
/* -------------------------------------------------------------------------- */

const NUTRIENT_META = {
  calories: { label: 'Calories', unit: 'kcal', limitKey: 'calories' },
  sugar: { label: 'Sugar', unit: 'g', limitKey: 'sugar' },
  sodium: { label: 'Sodium', unit: 'mg', limitKey: 'sodium' },
  satFat: { label: 'Saturated fat', unit: 'g', limitKey: 'satFat' },
}

/**
 * Findings over a set of daily rows.
 *
 * MINIMUM EVIDENCE, enforced not suggested: a finding about a weekly pattern
 * needs at least 4 logged days, and a comparison between two halves needs 3 on
 * each side. Below that the function returns nothing for that finding. The panel
 * showing three items instead of six is the honest outcome of a thin log.
 */
export function deriveInsights(rows, limits = {}, opts = {}) {
  const minDays = opts.minDays ?? 4
  const logged = rows.filter((r) => r.entries > 0)
  const found = []

  if (logged.length < 2) {
    return {
      insights: [],
      blocked: logged.length === 0
        ? 'Nothing logged yet in this window — log a few days and patterns will appear here.'
        : 'One logged day is not a pattern. Log at least four days to see trends.',
    }
  }

  const avg = averages(rows)

  /* --- over-ceiling counts ------------------------------------------------ */
  for (const [key, meta] of Object.entries(NUTRIENT_META)) {
    const limit = limits[meta.limitKey]
    if (!limit) continue
    const over = logged.filter((r) => r[key] > limit)
    if (!over.length) continue
    const share = over.length / logged.length
    found.push({
      id: `over-${key}`,
      tone: share >= 0.5 ? 'bad' : 'warn',
      metric: meta.label,
      text: `${meta.label} went over your ${Math.round(limit)} ${meta.unit} ceiling on ${over.length} of ${logged.length} logged day${logged.length > 1 ? 's' : ''}.`,
      detail: `Average ${Math.round(avg[key])} ${meta.unit}.`,
      weight: share * 100 + 40,
    })
  }

  /* --- comfortably inside a ceiling --------------------------------------- */
  for (const [key, meta] of Object.entries(NUTRIENT_META)) {
    const limit = limits[meta.limitKey]
    if (!limit || logged.length < minDays) continue
    if (logged.some((r) => r[key] > limit)) continue
    const headroom = 1 - avg[key] / limit
    if (headroom < 0.15) continue
    found.push({
      id: `under-${key}`,
      tone: 'good',
      metric: meta.label,
      text: `${meta.label} stayed under your ceiling every logged day — averaging ${Math.round(avg[key])} ${meta.unit} against a ${Math.round(limit)} ${meta.unit} limit.`,
      weight: 30,
    })
  }

  /* --- the single heaviest day -------------------------------------------- */
  if (logged.length >= 3) {
    const sorted = [...logged].sort((a, b) => b.calories - a.calories)
    const top = sorted[0]
    const rest = sorted.slice(1)
    const restAvg = rest.reduce((a, r) => a + r.calories, 0) / rest.length
    // Only worth saying if it genuinely stands out. A 5% spread is noise.
    if (restAvg > 0 && top.calories > restAvg * 1.35) {
      found.push({
        id: 'peak-day',
        tone: 'warn',
        metric: 'Calories',
        text: `${weekdayOf(top.date)} was your heaviest day at ${top.calories} kcal — about ${Math.round((top.calories / restAvg - 1) * 100)}% above your other logged days.`,
        weight: 45,
      })
    }
  }

  /* --- direction of travel ------------------------------------------------ */
  if (logged.length >= 6) {
    const half = Math.floor(logged.length / 2)
    const first = logged.slice(0, half)
    const second = logged.slice(-half)
    const a = first.reduce((s, r) => s + r.calories, 0) / first.length
    const b = second.reduce((s, r) => s + r.calories, 0) / second.length
    if (a > 0) {
      const change = (b - a) / a
      if (Math.abs(change) >= 0.12) {
        found.push({
          id: 'trend',
          tone: change < 0 ? 'good' : 'warn',
          metric: 'Calories',
          text: `Your intake ${change < 0 ? 'fell' : 'rose'} ${Math.abs(Math.round(change * 100))}% across this window — ${Math.round(a)} kcal a day early on versus ${Math.round(b)} kcal recently.`,
          weight: 55,
        })
      }
    }
  }

  /* --- home vs eating out ------------------------------------------------- */
  const mealDays = logged.filter((r) => r.meals > 0)
  if (mealDays.length >= 3 && opts.contextSplit) {
    const { home = 0, out = 0, homeKcal = 0, outKcal = 0 } = opts.contextSplit
    if (home >= 2 && out >= 2) {
      const hAvg = homeKcal / home
      const oAvg = outKcal / out
      if (hAvg > 0 && Math.abs(oAvg - hAvg) / hAvg >= 0.15) {
        found.push({
          id: 'home-vs-out',
          tone: oAvg > hAvg ? 'warn' : 'good',
          metric: 'Where you ate',
          text: `Restaurant, dhaba and street meals averaged ${Math.round(oAvg)} kcal a serving against ${Math.round(hAvg)} kcal for home-cooked — ${Math.abs(Math.round((oAvg / hAvg - 1) * 100))}% ${oAvg > hAvg ? 'more' : 'less'}.`,
          detail: `${out} eating-out servings, ${home} home-cooked.`,
          weight: 60,
        })
      }
    }
  }

  /* --- gaps in the log ----------------------------------------------------- */
  const missing = rows.length - logged.length
  if (missing >= 2 && rows.length >= 5) {
    found.push({
      id: 'gaps',
      tone: 'note',
      metric: 'Logging',
      // Framed as a limit on the analysis, not a scolding.
      text: `${missing} of the last ${rows.length} days have nothing logged, so these averages describe ${logged.length} day${logged.length > 1 ? 's' : ''}, not the full window.`,
      weight: 20,
    })
  }

  /* --- protein & fibre, only when meals were logged ------------------------ */
  if (mealDays.length >= minDays) {
    const pAvg = mealDays.reduce((s, r) => s + r.protein, 0) / mealDays.length
    if (pAvg > 0) {
      found.push({
        id: 'protein',
        tone: pAvg >= 50 ? 'good' : 'note',
        metric: 'Protein',
        text: `Meals you logged averaged ${Math.round(pAvg)} g of protein a day.`,
        // Deliberately no target: protein needs are bodyweight-dependent and the
        // profile does not always carry a weight.
        detail: 'Counted from logged meals only — packaged items in the catalog rarely publish protein.',
        weight: 25,
      })
    }
  }

  found.sort((a, b) => b.weight - a.weight)
  return { insights: found, blocked: null, averages: avg }
}

/** Bucket a day's calories for a bar chart, scaled against the highest bar. */
export function chartSeries(rows, key = 'calories') {
  const max = Math.max(1, ...rows.map((r) => r[key] || 0))
  return rows.map((r) => ({
    date: r.date,
    label: weekdayOf(r.date).slice(0, 3),
    value: r[key] || 0,
    pct: Math.round(((r[key] || 0) / max) * 100),
    empty: r.entries === 0,
  }))
}
