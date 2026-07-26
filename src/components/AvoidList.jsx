'use client'
import { useMemo, useState } from 'react'
import { Ban, Plus, X, ShieldAlert, Check, Search, ShieldCheck, ArrowRight } from 'lucide-react'
import { products } from '../data/foodDatabase'
import { AVOID_PRESETS, makeCustomAvoid, avoidHits, isAvoided } from '../lib/avoidList'
import ProductPack from './ProductPack'

export default function AvoidList({ avoid = [], onChange, onOpen }) {
  const [custom, setCustom] = useState('')

  const toggle = (rule) => {
    onChange(isAvoided(rule.id, avoid) ? avoid.filter((a) => a.id !== rule.id) : [...avoid, rule])
  }

  const addCustom = () => {
    const rule = makeCustomAvoid(custom)
    if (!rule || isAvoided(rule.id, avoid)) { setCustom(''); return }
    onChange([...avoid, rule])
    setCustom('')
  }

  // Which catalog products would this list actually rule out?
  const { flagged, clean } = useMemo(() => {
    if (!avoid.length) return { flagged: [], clean: [] }
    const f = []
    for (const p of products) {
      const hits = avoidHits(p, avoid)
      if (hits.length) f.push({ p, hits })
    }
    return {
      flagged: f.sort((a, b) => b.hits.length - a.hits.length),
      clean: products.filter((p) => avoidHits(p, avoid).length === 0),
    }
  }, [avoid])

  const pct = products.length ? Math.round((flagged.length / products.length) * 100) : 0

  return (
    <main className="avoid-view">
      <section className="avoid-hero">
        <div className="avoid-hero-icon"><Ban size={32} /></div>
        <div>
          <span className="eyebrow">Personal food firewall</span>
          <h1>Your avoid list</h1>
          <p>
            Pick the ingredients you never want in your food — for allergies, a medical
            condition, or simply because you’ve decided. Every product page, search result and
            label scan is then checked against it and flagged before you buy.
          </p>
        </div>
      </section>

      {avoid.length > 0 && (
        <section className="avoid-impact">
          <div className="avoid-impact-stat">
            <strong>{flagged.length.toLocaleString('en-IN')}</strong>
            <span>of {products.length.toLocaleString('en-IN')} catalog products contain something on your list</span>
            <div className="avoid-impact-bar"><span style={{ width: `${pct}%` }} /></div>
            <small>{pct}% ruled out · {clean.length.toLocaleString('en-IN')} still safe for you</small>
          </div>
          <div className="avoid-active-chips">
            <span className="eyebrow">Active rules ({avoid.length})</span>
            <div>
              {avoid.map((a) => (
                <button key={a.id} className="avoid-chip active" onClick={() => toggle(a)}>
                  {a.label} <X size={13} />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">One-tap presets</span>
            <h2>Common things people cut out</h2>
          </div>
          <span className="helper-click-badge">💡 Tap to add or remove</span>
        </div>
        <div className="avoid-preset-grid">
          {AVOID_PRESETS.map((r) => {
            const on = isAvoided(r.id, avoid)
            return (
              <button key={r.id} className={`avoid-preset ${on ? 'on' : ''}`} onClick={() => toggle(r)}>
                <div className="avoid-preset-head">
                  <strong>{r.label}</strong>
                  <span className="avoid-preset-mark">{on ? <Check size={14} /> : <Plus size={14} />}</span>
                </div>
                <p>{r.why}</p>
                <small>{r.terms.slice(0, 4).join(' · ')}{r.terms.length > 4 ? ' …' : ''}</small>
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Anything else</span>
            <h2>Add your own ingredient</h2>
          </div>
        </div>
        <div className="avoid-custom-row">
          <label className="search-field">
            <Search size={18} />
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              placeholder="e.g. 'sesame', 'mustard', 'yeast extract', 'INS 476'"
            />
          </label>
          <button className="primary-button" onClick={addCustom} disabled={custom.trim().length < 2}>
            <Plus size={17} /> Add rule
          </button>
        </div>
        <p className="label-note">
          <ShieldAlert size={14} /> This matches the words printed in the ingredient list. It is a shopping aid, not a
          medical safeguard — for a severe allergy always read the physical pack, which also carries
          “may contain” cross-contamination warnings that no database can see.
        </p>
      </section>

      {avoid.length > 0 && flagged.length > 0 && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Caught by your rules</span>
              <h2>Products you’ll now be warned about</h2>
            </div>
            <span className="meal-count">{flagged.length} flagged</span>
          </div>
          <div className="avoid-flag-grid">
            {flagged.slice(0, 12).map(({ p, hits }) => (
              <button key={p.id} className="avoid-flag-card" onClick={() => onOpen?.(p)}>
                <ProductPack product={p} compact />
                <div className="avoid-flag-main">
                  <strong>{p.name}</strong>
                  <small>{p.brand}</small>
                  <div className="avoid-flag-tags">
                    {hits.slice(0, 3).map((h) => (
                      <span key={h.rule.id}>{h.rule.label}</span>
                    ))}
                    {hits.length > 3 && <span>+{hits.length - 3}</span>}
                  </div>
                </div>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
          {flagged.length > 12 && (
            <p className="label-note">Showing 12 of {flagged.length}. The rest are flagged wherever they appear in the app.</p>
          )}
        </section>
      )}

      {avoid.length === 0 && (
        <section className="panel empty-state" style={{ padding: '40px 20px' }}>
          <ShieldCheck size={30} />
          <h2>No rules yet</h2>
          <p>Add a preset above and Jaano starts checking every product against it.</p>
        </section>
      )}
    </main>
  )
}
