'use client'
import { useMemo, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { searchDishes, dishCategories, CATEGORY_LABEL, dishes, UNITS } from '../data/indianDishes'

/**
 * Search-and-add for cooked Indian food.
 *
 * This is the no-key path. Everything the photo estimator can do, this can do
 * without an API key, without a network call and without a camera — which is the
 * only reason the photo feature is allowed to depend on a key at all. A feature
 * that leaves half the audience with nothing is not a feature.
 */
export default function DishPicker({ onPick, onClose, initialCategory = null, compact = false }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(initialCategory)

  const results = useMemo(() => {
    const base = q.trim() ? searchDishes(q, 60) : dishes
    const filtered = cat ? base.filter((d) => d.category === cat) : base
    return filtered.slice(0, q.trim() ? 60 : 80)
  }, [q, cat])

  return (
    <div className={`dish-picker ${compact ? 'compact' : ''}`}>
      <div className="dish-picker-head">
        <label className="search-field">
          <Search size={17} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dal, roti, biryani, golgappa, chai…"
            aria-label="Search dishes"
          />
          {q && (
            <button className="icon-button ghost" onClick={() => setQ('')} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </label>
        {onClose && (
          <button className="icon-button" onClick={onClose} aria-label="Close dish picker"><X size={18} /></button>
        )}
      </div>

      <div className="dish-cat-row">
        <button className={`chip ${!cat ? 'on' : ''}`} onClick={() => setCat(null)}>All</button>
        {dishCategories.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(cat === c ? null : c)}>
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="empty-note">
          No dish matches “{q}”. Try a simpler word — “dal”, “roti”, “chaat” — or the local name.
          If it is a packaged product, search it in <strong>Explore Foods</strong> instead.
        </p>
      ) : (
        <ul className="dish-results">
          {results.map((d) => (
            <li key={d.id}>
              <button className="dish-result" onClick={() => onPick(d)}>
                <span className="dish-result-main">
                  <strong>{d.name}</strong>
                  <small>{d.categoryLabel} · per {UNITS[d.unit]?.label}</small>
                </span>
                <span className="dish-result-kcal">{d.kcal}<em>kcal</em></span>
                <span className="dish-result-add"><Plus size={16} /></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
