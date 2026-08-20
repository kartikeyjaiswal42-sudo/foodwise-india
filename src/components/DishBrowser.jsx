'use client'
import { useMemo, useState } from 'react'
import {
  Store, Search, Plus, X, ArrowUpDown, Info, Check, Trash2, Flame,
} from 'lucide-react'
import {
  dishes, searchDishes, dishCategories, CATEGORY_LABEL, CONTEXTS, UNITS,
} from '../data/indianDishes'
import { servingFor, estimateMeal, confidenceNote, formatRange, contextOptions } from '../lib/mealEstimate'
import MealItemRow from './MealItemRow'

const SORTS = [
  { id: 'name', label: 'A–Z' },
  { id: 'kcalDesc', label: 'Heaviest first' },
  { id: 'kcalAsc', label: 'Lightest first' },
  { id: 'gap', label: 'Biggest home-vs-out gap' },
]

const DIET = [
  { id: null, label: 'Everything' },
  { id: 'v', label: 'Veg' },
  { id: 'n', label: 'Non-veg' },
  { id: 'e', label: 'Egg' },
]

/**
 * Browse cooked food the way you meet it in real life — before you order it.
 *
 * The point of this screen is the COMPARISON, not the list. Seeing that the same
 * paneer butter masala is 272 kcal at home and 389 at a restaurant is the single
 * most useful thing this dataset knows, and it is invisible on any per-dish page
 * that shows one number. So every card shows the gap, and the sort can rank by it.
 */
export default function DishBrowser({ onLogMeal, limits, activeDate }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(null)
  const [diet, setDiet] = useState(null)
  const [sort, setSort] = useState('name')
  const [context, setContext] = useState('restaurant')
  const [plate, setPlate] = useState([])
  const [logged, setLogged] = useState(false)

  const list = useMemo(() => {
    let base = q.trim() ? searchDishes(q, 400) : dishes
    if (cat) base = base.filter((d) => d.category === cat)
    if (diet) base = base.filter((d) => d.diet === diet)

    const withGap = base.map((d) => {
      const home = servingFor(d.id, 'home')
      const out = servingFor(d.id, context)
      return {
        dish: d,
        homeKcal: home.kcal,
        outKcal: out.kcal,
        // `applied` tells us whether this dish actually supports the chosen
        // context. Dishes that do not are still listed — hiding them would make
        // the catalog look thin — but they show no gap rather than a fake one.
        supported: out.context === context,
        gap: out.kcal - home.kcal,
      }
    })

    const sorters = {
      name: (a, b) => a.dish.name.localeCompare(b.dish.name),
      kcalDesc: (a, b) => b.outKcal - a.outKcal,
      kcalAsc: (a, b) => a.outKcal - b.outKcal,
      gap: (a, b) => b.gap - a.gap,
    }
    return withGap.sort(sorters[sort])
  }, [q, cat, diet, sort, context])

  const addToPlate = (dish) => {
    const supported = dish.contexts.includes(context)
    setPlate((cur) => [...cur, {
      dishId: dish.id, dish, qty: 1,
      context: supported ? context : 'home',
      contextKnown: true, unit: dish.unit,
      _est: {
        dishId: dish.id, qty: 1, context: supported ? context : 'home',
        identity: 'confirmed', portion: 'chosen', preparation: 'contextChosen',
      },
    }])
    setLogged(false)
  }

  const updatePlate = (idx, next) => {
    setPlate((cur) => cur.map((it, i) => (i === idx
      ? { ...next, _est: { ...it._est, qty: next.qty, context: next.context } }
      : it)))
    setLogged(false)
  }

  const estimate = estimateMeal(plate.map((p) => p._est))
  const note = estimate.empty ? null : confidenceNote(estimate.uncertainty)

  const logPlate = () => {
    if (estimate.empty) return
    onLogMeal({
      title: plate.map((p) => p.dish.name).slice(0, 3).join(', ')
        + (plate.length > 3 ? ` +${plate.length - 3}` : ''),
      source: 'eating-out',
      items: plate.map((p) => ({
        dishId: p.dishId, name: p.dish.name, qty: p.qty, unit: p.unit, context: p.context,
      })),
      totals: estimate.totals,
      kcalLow: estimate.kcalLow, kcalHigh: estimate.kcalHigh,
      uncertainty: estimate.uncertainty,
    })
    setLogged(true)
  }

  const ctxMeta = CONTEXTS[context]

  return (
    <main className="dish-browser-view">
      <section className="scanner-hero">
        <div className="scanner-hero-icon"><Store size={34} /></div>
        <div>
          <span className="eyebrow">Eating out</span>
          <h1>What it costs to order it</h1>
          <p>
            The same dish is a different food depending on who cooked it. Switch between{' '}
            <strong>ghar ka</strong>, <strong>restaurant</strong>, <strong>dhaba</strong> and{' '}
            <strong>thela</strong> to see the gap before you order — then build a plate and log it.
          </p>
        </div>
      </section>

      <div className="context-switch">
        <span className="context-switch-label">Cooked at</span>
        <div className="context-chips big">
          {Object.values(CONTEXTS).filter((c) => c.id !== 'homeRich').map((c) => (
            <button key={c.id} className={`context-chip ${context === c.id ? 'on' : ''}`}
              aria-pressed={context === c.id} onClick={() => setContext(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="context-assumption"><Info size={13} /> {ctxMeta.note}</p>
      </div>

      <div className="trends-controls">
        <label className="search-field">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="samosa, biryani, chai, golgappa…" aria-label="Search dishes" />
          {q && <button className="icon-button ghost" onClick={() => setQ('')} aria-label="Clear"><X size={15} /></button>}
        </label>
        <div className="chip-row">
          {DIET.map((d) => (
            <button key={d.label} className={`chip ${diet === d.id ? 'on' : ''}`}
              aria-pressed={diet === d.id} onClick={() => setDiet(d.id)}>{d.label}</button>
          ))}
        </div>
        <div className="chip-row">
          <ArrowUpDown size={15} className="sort-icon" />
          {SORTS.map((s) => (
            <button key={s.id} className={`chip ${sort === s.id ? 'on' : ''}`}
              aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="dish-cat-row">
        <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => setCat(null)}>All food</button>
        {dishCategories.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`}
            onClick={() => setCat(cat === c ? null : c)}>{CATEGORY_LABEL[c]}</button>
        ))}
      </div>

      {plate.length > 0 && (
        <section className="panel plate-panel">
          <div className="section-heading">
            <div><span className="eyebrow">Your order</span><h2>{plate.length} item{plate.length > 1 ? 's' : ''} on the plate</h2></div>
            <button className="ghost-button small" onClick={() => { setPlate([]); setLogged(false) }}>
              <Trash2 size={14} /> Clear
            </button>
          </div>
          <ul className="meal-items">
            {plate.map((it, i) => (
              <MealItemRow key={`${it.dishId}-${i}`} item={it} estimate={estimate.items[i]}
                onChange={(next) => updatePlate(i, next)}
                onRemove={() => { setPlate((c) => c.filter((_, j) => j !== i)); setLogged(false) }} />
            ))}
          </ul>
          <div className="meal-total">
            <div className="meal-total-range">
              <span className="meal-range-value">{formatRange(estimate.kcalLow, estimate.kcalHigh, '')}</span>
              <span className="meal-range-unit">kcal</span>
              <small>midpoint {estimate.totals.kcal} kcal
                {limits?.calories ? ` · ${Math.round((estimate.totals.kcal / limits.calories) * 100)}% of your day` : ''}
              </small>
            </div>
            {note && (
              <div className={`meal-confidence tone-${note.level}`}>
                <strong>{note.label}</strong><p>{note.text}</p>
              </div>
            )}
          </div>
          <div className="meal-log-row">
            <button className="primary-button" onClick={logPlate} disabled={logged}>
              {logged ? <><Check size={16} /> Logged to {activeDate}</> : <><Plus size={16} /> Log this order</>}
            </button>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{list.length} dish{list.length === 1 ? '' : 'es'}</span>
            <h2>{cat ? CATEGORY_LABEL[cat] : 'All Indian food'}</h2>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="empty-note">Nothing matches that. Try the local name, or clear the filters.</p>
        ) : (
          <ul className="dish-grid">
            {list.map(({ dish, homeKcal, outKcal, gap, supported }) => (
              <li key={dish.id} className="dish-card">
                <div className="dish-card-head">
                  <div>
                    <strong>{dish.name}</strong>
                    <small>{dish.categoryLabel} · per {UNITS[dish.unit]?.label}</small>
                  </div>
                  <span className={`diet-dot diet-${dish.diet}`} title={
                    dish.diet === 'v' ? 'Vegetarian' : dish.diet === 'e' ? 'Contains egg' : 'Non-vegetarian'
                  } />
                </div>

                <div className="dish-card-numbers">
                  <div className="dish-num">
                    <span>Ghar ka</span>
                    <strong>{homeKcal}</strong>
                  </div>
                  <div className={`dish-num ${supported ? 'out' : 'na'}`}>
                    <span>{ctxMeta.label}</span>
                    <strong>{supported ? outKcal : '—'}</strong>
                  </div>
                  {supported && gap > 0 && (
                    <div className="dish-gap">
                      <Flame size={13} /> +{gap} kcal
                      <em>+{Math.round((gap / homeKcal) * 100)}%</em>
                    </div>
                  )}
                  {!supported && (
                    <div className="dish-gap na">
                      {/* Better to say the comparison does not apply than to
                          print a number for a preparation that does not exist. */}
                      no {ctxMeta.label.toLowerCase()} version
                    </div>
                  )}
                </div>

                <button className="ghost-button small full" onClick={() => addToPlate(dish)}>
                  <Plus size={14} /> Add to plate
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
