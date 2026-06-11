'use client'
import { useMemo, useState } from 'react'
import { Zap, Sparkles, HeartPulse, BookOpen, ShieldCheck, Search, Leaf, AlertTriangle, Minus } from 'lucide-react'
import { products } from '../data/foodDatabase'
import { buildIngredientIndex, VERDICT_META } from '../lib/ingredientClassify'

const watchpoints = [
  { name: 'Added sugar', icon: Zap, color: '#df7b54', desc: 'Sugars added in manufacturing — colas, spreads, cereals, cream biscuits.', guide: 'Keep under ~25 g/day. Hidden as sucrose, glucose syrup, invert sugar, maltodextrin.' },
  { name: 'Sodium & preservatives', icon: Sparkles, color: '#7d88d9', desc: 'Salt plus preservatives like sodium benzoate (INS 211) raise blood pressure & react with vitamin C.', guide: 'Keep sodium under ~2,300 mg/day.' },
  { name: 'Industrial fats', icon: HeartPulse, color: '#c49143', desc: 'Palm oil & hydrogenated/vanaspati fats extend shelf-life but raise bad cholesterol.', guide: 'Prefer cold-pressed/rice-bran oils; avoid hydrogenated fat.' },
  { name: 'Disruptive additives', icon: ShieldCheck, color: '#ef4444', desc: 'MSG family (621/627/631/635), carrageenan (407), azo colours, caramel IV (150d).', guide: 'Shorter, recognisable ingredient lists are better.' },
]

const VERDICT_ICON = { good: Leaf, neutral: Minus, bad: AlertTriangle }

export default function IngredientGuide() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | good | neutral | bad

  const index = useMemo(() => buildIngredientIndex(products), [])
  const counts = useMemo(() => {
    const c = { good: 0, neutral: 0, bad: 0 }
    index.forEach((i) => { c[i.verdict] += 1 })
    return c
  }, [index])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return index.filter((i) => {
      if (filter !== 'all' && i.verdict !== filter) return false
      if (q && !(`${i.label} ${i.raw} ${i.group}`.toLowerCase().includes(q))) return false
      return true
    })
  }, [index, query, filter])

  return (
    <main className="guide-view">
      <section className="guide-hero">
        <div>
          <span className="eyebrow">Ingredient Academy</span>
          <h1>Every Ingredient, Decoded</h1>
          <p>We scanned all {products.length} products and classified every ingredient as <strong style={{ color: '#10b981' }}>good</strong>, <strong style={{ color: '#9aa0a6' }}>neutral</strong>, or <strong style={{ color: '#ef4444' }}>watch&nbsp;out</strong>. Search any ingredient or chemical code below.</p>
        </div>
        <div className="guide-hero-icon"><BookOpen size={35} /></div>
      </section>

      {/* Key watchpoints */}
      <div className="guide-grid">
        {watchpoints.map((g) => {
          const Icon = g.icon
          return (
            <article className="guide-card" key={g.name} style={{ '--guide': g.color }}>
              <div className="guide-icon"><Icon size={21} /></div>
              <h2>{g.name}</h2>
              <p>{g.desc}</p>
              <div className="guide-tip"><Sparkles size={15} /><span>{g.guide}</span></div>
            </article>
          )
        })}
      </div>

      {/* Searchable ingredient database */}
      <section className="panel ingredient-db">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Ingredient database</span>
            <h2>{index.length} distinct ingredients across the catalog</h2>
          </div>
        </div>

        <label className="search-field" style={{ marginBottom: 14 }}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search an ingredient or code (e.g. 'palm', 'maida', 'INS 621', 'oats')" />
        </label>

        <div className="verdict-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({index.length})</button>
          <button className={`good ${filter === 'good' ? 'active' : ''}`} onClick={() => setFilter('good')}>🟢 Good ({counts.good})</button>
          <button className={`neutral ${filter === 'neutral' ? 'active' : ''}`} onClick={() => setFilter('neutral')}>⚪ Neutral ({counts.neutral})</button>
          <button className={`bad ${filter === 'bad' ? 'active' : ''}`} onClick={() => setFilter('bad')}>🔴 Watch out ({counts.bad})</button>
        </div>

        <div className="ingredient-db-list">
          {visible.slice(0, 250).map((i) => {
            const meta = VERDICT_META[i.verdict]
            const Icon = VERDICT_ICON[i.verdict]
            return (
              <div className="ing-db-row" key={i.label} style={{ '--v': meta.color }}>
                <span className="ing-db-verdict"><Icon size={13} /> {meta.label}</span>
                <div className="ing-db-main">
                  <strong>{i.label}</strong>
                  <p>{i.why}</p>
                  <small>{i.group} · found in {i.count} product{i.count !== 1 ? 's' : ''}{i.examples.length ? ` (e.g. ${i.examples[0]})` : ''}</small>
                </div>
              </div>
            )
          })}
          {visible.length === 0 && (
            <div className="empty-state" style={{ padding: '36px 12px' }}>
              <Search size={28} />
              <h2>No ingredient found</h2>
              <p>Try another term — e.g. “sugar”, “oil”, “colour”, or an INS code.</p>
            </div>
          )}
          {visible.length > 250 && <p className="label-note" style={{ marginTop: 12 }}>Showing the 250 most common of {visible.length}. Refine your search to narrow down.</p>}
        </div>
      </section>

      <section className="panel evidence-note">
        <ShieldCheck size={24} />
        <div>
          <h2>How Jaano classifies ingredients</h2>
          <p>Ratings draw on FSSAI/WHO guidance and published research on additives, refined carbohydrates, industrial fats and emulsifiers. “Neutral” means benign or structural in normal amounts — not everything processed is harmful. This is educational and does not replace medical advice.</p>
        </div>
      </section>
    </main>
  )
}
