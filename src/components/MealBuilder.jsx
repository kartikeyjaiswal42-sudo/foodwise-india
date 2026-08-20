'use client'
import { useMemo, useState } from 'react'
import {
  ChefHat, Plus, Trash2, Search, Check, Info, Users, X, Scale,
} from 'lucide-react'
import {
  searchIngredients, ingredientById, amountNutrition, ingredientGroups, ingredients,
} from '../data/indianIngredients'
import { confidenceNote, UNCERTAINTY, combineUncertainty } from '../lib/mealEstimate'

/**
 * Build a dish from what you actually put in the pan.
 *
 * WHY THIS EXISTS ALONGSIDE THE PHOTO ESTIMATOR: the largest single source of
 * error in any Indian calorie estimate is the oil, and it is invisible in a
 * photograph. `mealEstimate` prices that unknown at ±16% on its own. If you tell
 * us it was two teaspoons of ghee, that error disappears and the whole estimate
 * drops from roughly ±30% to under ±10%. This screen is the only place in the
 * app that can produce a number worth calling a calculation.
 *
 * The other thing it does that no photo can: SERVES. A pot of dal is cooked once
 * and eaten by four people. Dividing the pot is arithmetic the user should not
 * have to do in their head, and getting it wrong is a 4x error.
 */
export default function MealBuilder({ onLogMeal, limits, activeDate }) {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [group, setGroup] = useState(null)
  const [serves, setServes] = useState(1)
  const [myShare, setMyShare] = useState(1)
  const [name, setName] = useState('')
  const [logged, setLogged] = useState(false)

  const results = useMemo(() => {
    const base = q.trim() ? searchIngredients(q, 40) : ingredients
    return (group ? base.filter((g) => g.group === group) : base).slice(0, q.trim() ? 40 : 60)
  }, [q, group])

  const addRow = (ing) => {
    const m = ing.measures[0]
    setRows((cur) => [...cur, {
      key: `${ing.id}-${Date.now()}`,
      id: ing.id, measure: m.label, count: 1, grams: m.grams,
    }])
    setQ(''); setLogged(false)
  }

  const setRow = (key, patch) => {
    setRows((cur) => cur.map((r) => (r.key === key ? { ...r, ...patch } : r)))
    setLogged(false)
  }

  const removeRow = (key) => { setRows((cur) => cur.filter((r) => r.key !== key)); setLogged(false) }

  /* ---- the maths --------------------------------------------------------- */

  const pot = useMemo(() => {
    const total = { kcal: 0, protein: 0, carbs: 0, fat: 0, satFat: 0, sugar: 0, sodium: 0, fibre: 0 }
    for (const r of rows) {
      const n = amountNutrition(r.id, r.grams * r.count)
      if (!n) continue
      for (const k of Object.keys(total)) total[k] += n[k] || 0
    }
    for (const k of Object.keys(total)) {
      total[k] = k === 'kcal' || k === 'sodium' ? Math.round(total[k]) : Math.round(total[k] * 10) / 10
    }
    return total
  }, [rows])

  const portions = Math.max(1, Number(serves) || 1)
  const share = Math.max(0.25, Number(myShare) || 1)

  const mine = useMemo(() => {
    const out = {}
    const factor = share / portions
    for (const [k, v] of Object.entries(pot)) {
      out[k] = k === 'kcal' || k === 'sodium'
        ? Math.round(v * factor)
        : Math.round(v * factor * 10) / 10
    }
    return out
  }, [pot, portions, share])

  // Built from declared amounts, so identity and preparation are known. What is
  // left is measurement slop — a "tablespoon" of ghee is not exactly 15 g — plus
  // cooking losses. That is genuinely small, and claiming otherwise would be the
  // mirror image of the overconfidence this app exists to avoid.
  const uncertainty = combineUncertainty(
    UNCERTAINTY.identity.confirmed,
    UNCERTAINTY.portion.measured,
    UNCERTAINTY.preparation.builtFromIngredients
  )
  const note = confidenceNote(uncertainty)
  const low = Math.round(mine.kcal * (1 - uncertainty))
  const high = Math.round(mine.kcal * (1 + uncertainty))

  const fatRows = rows.filter((r) => ingredientById[r.id]?.group === 'Fats & oils')
  const fatKcal = fatRows.reduce((s, r) => s + (amountNutrition(r.id, r.grams * r.count)?.kcal || 0), 0)
  const fatShare = pot.kcal > 0 ? Math.round((fatKcal / pot.kcal) * 100) : 0

  const logMeal = () => {
    if (!rows.length) return
    onLogMeal({
      title: name.trim() || `Home-cooked (${rows.length} ingredient${rows.length > 1 ? 's' : ''})`,
      source: 'builder',
      items: rows.map((r) => ({
        dishId: r.id, name: ingredientById[r.id]?.name || r.id,
        qty: r.count, unit: r.measure, context: 'home',
      })),
      totals: mine,
      kcalLow: low, kcalHigh: high, uncertainty,
      serves: portions, share,
    })
    setLogged(true)
  }

  return (
    <main className="meal-builder-view">
      <section className="scanner-hero">
        <div className="scanner-hero-icon"><ChefHat size={34} /></div>
        <div>
          <span className="eyebrow">Cook it, count it</span>
          <h1>Build a home-cooked dish</h1>
          <p>
            A photo can’t see how much oil went in — that one unknown is most of the error in any
            calorie estimate. Tell us what actually went in the pan and how many people it fed, and
            the guess becomes a <strong>calculation</strong>.
          </p>
        </div>
      </section>

      <div className="builder-grid">
        {/* ---- picker ---- */}
        <section className="panel">
          <div className="section-heading">
            <div><span className="eyebrow">Step 1</span><h2>What went in?</h2></div>
          </div>

          <label className="search-field">
            <Search size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="atta, toor dal, ghee, pyaz, paneer…" aria-label="Search ingredients" />
            {q && <button className="icon-button ghost" onClick={() => setQ('')} aria-label="Clear"><X size={15} /></button>}
          </label>

          <div className="dish-cat-row">
            <button className={`chip ${!group ? 'on' : ''}`} onClick={() => setGroup(null)}>All</button>
            {ingredientGroups.map((g) => (
              <button key={g} className={`chip ${group === g ? 'on' : ''}`}
                onClick={() => setGroup(group === g ? null : g)}>{g}</button>
            ))}
          </div>

          <ul className="dish-results ingredient-results">
            {results.map((g) => (
              <li key={g.id}>
                <button className="dish-result" onClick={() => addRow(g)}>
                  <span className="dish-result-main">
                    <strong>{g.name}</strong>
                    <small>{g.group} · {g.kcal} kcal / 100 g</small>
                  </span>
                  <span className="dish-result-add"><Plus size={16} /></span>
                </button>
              </li>
            ))}
            {!results.length && <li className="empty-note">No ingredient matches “{q}”.</li>}
          </ul>
        </section>

        {/* ---- the pot ---- */}
        <section className="panel">
          <div className="section-heading">
            <div><span className="eyebrow">Step 2</span><h2>The pot</h2></div>
          </div>

          {rows.length === 0 ? (
            <p className="empty-note">Nothing added yet. Search on the left and tap an ingredient.</p>
          ) : (
            <ul className="builder-rows">
              {rows.map((r) => {
                const ing = ingredientById[r.id]
                if (!ing) return null
                const n = amountNutrition(r.id, r.grams * r.count)
                return (
                  <li key={r.key} className="builder-row">
                    <div className="builder-row-name">
                      <strong>{ing.name}</strong>
                      <small>{Math.round(r.grams * r.count)} g</small>
                    </div>
                    <input
                      className="builder-count" type="number" min="0.25" step="0.25"
                      value={r.count}
                      onChange={(e) => setRow(r.key, { count: Math.max(0.25, Number(e.target.value) || 0.25) })}
                      aria-label={`Quantity of ${ing.name}`}
                    />
                    <select
                      className="builder-measure" value={r.measure}
                      onChange={(e) => {
                        const m = ing.measures.find((x) => x.label === e.target.value)
                        setRow(r.key, { measure: m.label, grams: m.grams })
                      }}
                      aria-label={`Measure for ${ing.name}`}
                    >
                      {ing.measures.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                    </select>
                    <span className="builder-kcal">{n?.kcal ?? 0}</span>
                    <button className="icon-button danger" onClick={() => removeRow(r.key)}
                      aria-label={`Remove ${ing.name}`}><Trash2 size={15} /></button>
                  </li>
                )
              })}
            </ul>
          )}

          {rows.length > 0 && (
            <>
              <div className="builder-serves">
                <Users size={17} />
                <label>
                  <span>This pot feeds</span>
                  <input type="number" min="1" step="1" value={serves}
                    onChange={(e) => { setServes(e.target.value); setLogged(false) }}
                    aria-label="Number of people this recipe serves" />
                  <span>people</span>
                </label>
                <label>
                  <span>I ate</span>
                  <input type="number" min="0.25" step="0.25" value={myShare}
                    onChange={(e) => { setMyShare(e.target.value); setLogged(false) }}
                    aria-label="How many servings you ate" />
                  <span>serving{share === 1 ? '' : 's'}</span>
                </label>
              </div>

              {fatShare >= 30 && (
                <p className="builder-fat-note">
                  <Info size={14} /> Oil and ghee are <strong>{fatShare}%</strong> of this pot’s
                  calories. That is the number a photo could never have told you.
                </p>
              )}

              <div className="builder-total">
                <div className="builder-total-block">
                  <span className="eyebrow">Whole pot</span>
                  <strong>{pot.kcal}<em>kcal</em></strong>
                  <small>{portions} serving{portions > 1 ? 's' : ''}</small>
                </div>
                <div className="builder-total-block accent">
                  <span className="eyebrow">Your share</span>
                  <strong>{low}–{high}<em>kcal</em></strong>
                  <small>midpoint {mine.kcal} kcal</small>
                </div>
              </div>

              <div className={`meal-confidence tone-${note.level}`}>
                <strong><Scale size={15} /> {note.label}</strong>
                <p>{note.text} Every amount here was declared, so the only slop left is measurement.</p>
              </div>

              <ul className="meal-macros">
                {[
                  ['Protein', mine.protein, 'g'], ['Carbs', mine.carbs, 'g'],
                  ['Fat', mine.fat, 'g'], ['Sat fat', mine.satFat, 'g', limits?.satFat],
                  ['Sugar', mine.sugar, 'g', limits?.sugar],
                  ['Sodium', mine.sodium, 'mg', limits?.sodium], ['Fibre', mine.fibre, 'g'],
                ].map(([label, value, unit, limit]) => (
                  <li key={label} className={limit && value > limit ? 'over' : ''}>
                    <span>{label}</span><strong>{value}<em>{unit}</em></strong>
                    {limit ? <small>{Math.round((value / limit) * 100)}% of your day</small> : null}
                  </li>
                ))}
              </ul>

              <div className="meal-log-row">
                <label className="search-field name-field">
                  <ChefHat size={16} />
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Name this dish (optional)" aria-label="Dish name" />
                </label>
                <button className="primary-button" onClick={logMeal} disabled={logged}>
                  {logged ? <><Check size={16} /> Logged to {activeDate}</> : <><Plus size={16} /> Log my share</>}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
