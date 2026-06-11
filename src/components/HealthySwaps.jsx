'use client'
import { useMemo, useState } from 'react'
import { ArrowRight, Search, Sparkles, TrendingUp } from 'lucide-react'
import { products } from '../data/foodDatabase'
import ProductPack from './ProductPack'

export default function HealthySwaps({ onOpen, onAdd }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [])

  // Every product that has a meaningfully healthier alternative, worst first.
  const swaps = useMemo(() => {
    return products
      .map((p) => {
        const alt = p.alternative ? byId[p.alternative] : null
        if (!alt || alt.score <= p.score + 5) return null
        return { base: p, alt, gain: alt.score - p.score }
      })
      .filter(Boolean)
      .sort((a, b) => a.base.score - b.base.score || b.gain - a.gain)
  }, [byId])

  const categories = useMemo(() => ['All', ...Array.from(new Set(swaps.map((s) => s.base.category)))], [swaps])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return swaps.filter((s) => {
      if (category !== 'All' && s.base.category !== category) return false
      if (q && !(`${s.base.name} ${s.base.brand} ${s.alt.name}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [swaps, query, category])

  return (
    <main className="swaps-view">
      <section className="explore-head">
        <div>
          <span className="eyebrow">Smart Health Upgrades</span>
          <h1>Healthy Swaps</h1>
          <p>For the processed products in the catalog we found a cleaner, higher-scoring alternative in the same category. Swap up without giving up the craving.</p>
        </div>
        <div className="explore-stat">
          <strong>{swaps.length}</strong>
          <span>better swaps found</span>
          <div><TrendingUp size={15} /> healthier picks</div>
        </div>
      </section>

      <label className="search-field explore-search">
        <Search size={20} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a product to upgrade (e.g. 'noodles', 'chips', 'biscuit')" />
      </label>

      <div className="category-tabs" style={{ marginBottom: 18 }}>
        {categories.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="swaps-grid">
        {visible.slice(0, 120).map(({ base, alt, gain }) => (
          <article className="swap-pair-card" key={base.id}>
            <button className="swap-pair-side from" onClick={() => onOpen(base)}>
              <span className="swap-tag bad">Swap this</span>
              <ProductPack product={base} compact />
              <strong>{base.name}</strong>
              <small>{base.brand}</small>
              <span className={`mini-score s-${base.score >= 75 ? 'good' : base.score >= 50 ? 'fair' : 'poor'}`}>{base.grade} · {base.score}</span>
            </button>

            <div className="swap-pair-arrow">
              <ArrowRight size={20} />
              <span className="swap-gain">+{gain}</span>
            </div>

            <button className="swap-pair-side to" onClick={() => onOpen(alt)}>
              <span className="swap-tag good">For this</span>
              <ProductPack product={alt} compact />
              <strong>{alt.name}</strong>
              <small>{alt.brand}</small>
              <span className={`mini-score s-${alt.score >= 75 ? 'good' : alt.score >= 50 ? 'fair' : 'poor'}`}>{alt.grade} · {alt.score}</span>
            </button>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="empty-state">
          <Sparkles size={30} />
          <h2>No swaps match that search</h2>
          <p>Try a different product or category.</p>
        </div>
      )}
      {visible.length > 120 && <p className="label-note" style={{ marginTop: 14 }}>Showing the first 120 swaps — refine with search or a category.</p>}
    </main>
  )
}
