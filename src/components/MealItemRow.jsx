'use client'
import { Minus, Plus, Trash2, Info } from 'lucide-react'
import { contextOptions } from '../lib/mealEstimate'
import { UNITS } from '../data/indianDishes'

/**
 * One dish on a plate, with its quantity and cooking context editable.
 *
 * Shared by the photo estimator and the manual dish picker on purpose: a photo
 * result and a hand-picked dish must be adjustable in exactly the same way, or
 * correcting the AI would feel like a different, lesser mode of the app.
 */
export default function MealItemRow({ item, estimate, onChange, onRemove, showContext = true }) {
  const dish = item.dish
  if (!dish) return null

  const unit = UNITS[dish.unit]
  const options = showContext ? contextOptions(dish.id) : []
  const active = options.find((o) => o.id === item.context) || options[0]

  // Countable things step in halves; you eat half a roti, not a quarter of one.
  // Servings you ladle out step in quarters, because a katori genuinely is
  // filled by eye.
  const discrete = dish.unit === 'piece' || dish.unit === 'roti'
  const increment = discrete ? 0.5 : 0.25
  const step = (delta) => {
    const inv = 1 / increment
    const next = Math.round((item.qty + delta * increment) * inv) / inv
    if (next >= increment && next <= 12) onChange({ ...item, qty: next })
  }

  return (
    <li className="meal-item">
      <div className="meal-item-head">
        <div className="meal-item-name">
          <strong>{dish.name}</strong>
          <small>{dish.categoryLabel}</small>
        </div>
        <div className="meal-item-kcal">
          {estimate
            ? <><b>{estimate.nutrition.kcal}</b> <span>kcal</span></>
            : <span className="muted">—</span>}
        </div>
        <button className="icon-button danger" onClick={onRemove} aria-label={`Remove ${dish.name}`}>
          <Trash2 size={16} />
        </button>
      </div>

      <div className="meal-item-controls">
        <div className="qty-stepper">
          <button onClick={() => step(-1)} aria-label="Less" disabled={item.qty <= increment}>
            <Minus size={15} />
          </button>
          <span>
            <b>{item.qty % 1 === 0 ? item.qty : item.qty.toFixed(2).replace(/0$/, '')}</b>
            {' '}{item.qty === 1 ? unit?.label : unit?.plural}
          </span>
          <button onClick={() => step(1)} aria-label="More" disabled={item.qty >= 12}>
            <Plus size={15} />
          </button>
        </div>
        {unit?.hint && <span className="unit-hint">{unit.hint}</span>}
      </div>

      {showContext && options.length > 1 && (
        <div className="context-row">
          <div className="context-chips" role="group" aria-label="How was it cooked?">
            {options.map((o) => (
              <button
                key={o.id}
                className={`context-chip ${item.context === o.id ? 'on' : ''}`}
                aria-pressed={item.context === o.id}
                onClick={() => onChange({ ...item, context: o.id, contextKnown: true })}
              >
                {o.label}
                {o.addedKcal > 0 && <em>+{o.addedKcal}</em>}
              </button>
            ))}
          </div>
          {/* The assumption behind every non-home number is stated, never implied. */}
          {active && <p className="context-assumption"><Info size={13} /> {active.assumption}</p>}
        </div>
      )}

      {item.contextEvidence && (
        <p className="context-evidence">Read from the photo: “{item.contextEvidence}”</p>
      )}
    </li>
  )
}
