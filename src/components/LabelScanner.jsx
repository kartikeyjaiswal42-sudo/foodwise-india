'use client'
import { useMemo, useState } from 'react'
import {
  ScanLine, Sparkles, FlaskConical, ShieldCheck, AlertTriangle, Trash2,
  ArrowRight, Ban, Leaf, Minus, ClipboardPaste, Info,
} from 'lucide-react'
import { products } from '../data/foodDatabase'
import { scanLabel, ORGAN_SYSTEMS, RISK_META, TOX_BANDS, scanProduct } from '../lib/toxicity'
import { VERDICT_META } from '../lib/ingredientClassify'
import { avoidHitsInLines } from '../lib/avoidList'
import ProductPack from './ProductPack'
import { isRated } from '../lib/dataQuality'

const SAMPLES = [
  {
    name: 'Instant noodles',
    text: 'Noodles: Refined wheat flour (maida), edible vegetable oil (palm oil), salt, wheat gluten, thickeners (508, 501, 451(i)), acidity regulator (500(i)). Tastemaker: Sugar, hydrolysed groundnut protein, spices, flavour enhancers (627, 631, 621), edible starch, colour (150d), acidity regulator (330).',
  },
  {
    name: 'Cream biscuit',
    text: 'Refined wheat flour, sugar, edible vegetable oil (palm), invert sugar syrup, cocoa solids, milk solids, raising agents (503(ii), 500(ii)), emulsifiers (322, 471), salt, artificial flavouring substances, antioxidant (319).',
  },
  {
    name: 'Aerated cola',
    text: 'Carbonated water, sugar, acidity regulator (338), caramel colour (150d), caffeine, natural flavouring substances, preservative (211).',
  },
  {
    name: 'Clean atta biscuit',
    text: 'Whole wheat flour (65%), jaggery, groundnut oil, oats, almonds, cardamom, salt, raising agent (500(ii)).',
  },
]

const VERDICT_ICON = { good: Leaf, neutral: Minus, bad: AlertTriangle }

export default function LabelScanner({ avoid = [], onOpen }) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState('')

  const result = useMemo(() => (submitted ? scanLabel(submitted) : null), [submitted])

  // A pasted label carries no nutrition panel, so the score is hazard-only,
  // rescaled from the 0–60 hazard band onto the familiar 0–100 dial.
  const toxIndex = result ? Math.min(100, Math.round(result.hazardScore * (100 / 60))) : 0
  const band = toxIndex >= 60 ? 'severe' : toxIndex >= 38 ? 'high' : toxIndex >= 18 ? 'moderate' : 'clean'
  const bandMeta = TOX_BANDS[band]

  const flags = useMemo(() => (result ? avoidHitsInLines(result.list, avoid) : []), [result, avoid])

  // Suggest genuinely cleaner catalog products that answer the same craving.
  const cleaner = useMemo(() => {
    if (!result) return []
    return products
      .filter((p) => isRated(p) && p.score >= 78 && p.image && (p.ingredients || []).length >= 2)
      .map((p) => ({ p, s: scanProduct(p) }))
      .sort((a, b) => a.s.toxIndex - b.s.toxIndex)
      .slice(0, 4)
      .map((x) => x.p)
  }, [result])

  const organs = result
    ? Object.entries(result.organs).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0)
    : []
  const maxOrgan = Math.max(1, ...organs.map(([, v]) => v))

  return (
    <main className="scanner-view">
      <section className="scanner-hero">
        <div className="scanner-hero-icon"><ScanLine size={34} /></div>
        <div>
          <span className="eyebrow">Universal label decoder</span>
          <h1>Decode any pack in India</h1>
          <p>
            Type or paste the <strong>“INGREDIENTS:”</strong> line printed on any packet — even one that
            isn’t in our catalog — and get the same organ-level breakdown: every INS code named,
            every hazard explained, and where the load lands on your body.
          </p>
        </div>
      </section>

      <section className="panel scanner-input-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Step 1</span>
            <h2>Paste the ingredient statement</h2>
          </div>
          <span className="helper-click-badge">💡 Commas separate ingredients — brackets are handled</span>
        </div>

        <textarea
          className="scanner-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="e.g. Refined wheat flour, sugar, edible vegetable oil (palm), raising agents (500(ii), 503(ii)), emulsifier (322), flavour enhancer (INS 621), colour (INS 102)…"
        />

        <div className="scanner-actions">
          <button className="primary-button" disabled={text.trim().length < 4} onClick={() => setSubmitted(text)}>
            <FlaskConical size={17} /> Decode this label
          </button>
          {(text || submitted) && (
            <button className="secondary-button" onClick={() => { setText(''); setSubmitted('') }}>
              <Trash2 size={16} /> Clear
            </button>
          )}
        </div>

        <div className="scanner-samples">
          <span><ClipboardPaste size={14} /> Try a real one:</span>
          {SAMPLES.map((s) => (
            <button key={s.name} onClick={() => { setText(s.text); setSubmitted(s.text) }}>{s.name}</button>
          ))}
        </div>
      </section>

      {result && result.list.length === 0 && (
        <section className="panel empty-state" style={{ padding: '36px 16px' }}>
          <Info size={28} />
          <h2>Couldn’t read any ingredients</h2>
          <p>Make sure ingredients are separated by commas, e.g. “wheat flour, sugar, palm oil”.</p>
        </section>
      )}

      {result && result.list.length > 0 && (
        <>
          {/* ---------- verdict ---------- */}
          <section className="scanner-verdict" style={{ '--band': bandMeta.color }}>
            <div className="scanner-score">
              <strong>{toxIndex}</strong>
              <span>toxic load<br />/ 100</span>
            </div>
            <div>
              <span className="tox-risk-chip" style={{ background: bandMeta.color }}>{bandMeta.label}</span>
              <h2>
                {result.list.length} ingredients · {result.additives.length} declared additive{result.additives.length !== 1 ? 's' : ''} · {result.systemsHit} body system{result.systemsHit !== 1 ? 's' : ''} affected
              </h2>
              <p>{bandMeta.note}</p>
              <div className="scanner-tally">
                <span className="good">🟢 {result.counts.good} good</span>
                <span className="neutral">⚪ {result.counts.neutral} neutral</span>
                <span className="bad">🔴 {result.counts.bad} watch out</span>
              </div>
            </div>
          </section>

          {flags.length > 0 && (
            <section className="scanner-avoid-alert">
              <Ban size={22} />
              <div>
                <strong>This pack contains {flags.length} thing{flags.length !== 1 ? 's' : ''} on your avoid list</strong>
                <div className="scanner-avoid-tags">
                  {flags.map((f) => (
                    <span key={f.rule.id}>{f.rule.label} <small>“{f.matchedTerm}”</small></span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ---------- the ingredient list, in order ---------- */}
          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Step 2 · as printed on the pack</span>
                <h2>The ingredient list, decoded in order</h2>
              </div>
              <span className="helper-click-badge">Listed by quantity — the first items dominate</span>
            </div>
            <IngredientLedger lines={result.lines} />
          </section>

          {/* ---------- organ load ---------- */}
          {organs.length > 0 && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Step 3</span>
                  <h2>Where this lands in your body</h2>
                </div>
              </div>
              <div className="tox-organ-bars">
                {organs.map(([key, value]) => {
                  const sys = ORGAN_SYSTEMS[key]
                  return (
                    <div key={key} className="tox-organ-bar-row">
                      <span className="tox-organ-bar-name static"><span>{sys.emoji}</span> {sys.label}</span>
                      <div className="tox-organ-bar">
                        <span style={{ width: `${(value / maxOrgan) * 100}%`, background: sys.color }} />
                      </div>
                      <strong>{Math.round(value)}</strong>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ---------- additive table ---------- */}
          {result.additives.length > 0 && <AdditiveTable additives={result.additives} />}

          {/* ---------- cleaner picks ---------- */}
          {cleaner.length > 0 && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Step 4</span>
                  <h2>Cleanest labels in our catalog</h2>
                </div>
                <Sparkles size={18} />
              </div>
              <div className="scanner-clean-grid">
                {cleaner.map((p) => (
                  <button key={p.id} className="scanner-clean-card" onClick={() => onOpen?.(p)}>
                    <ProductPack product={p} compact />
                    <div>
                      <strong>{p.name}</strong>
                      <small>{p.brand} · score {p.score}</small>
                    </div>
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section className="panel evidence-note">
        <ShieldCheck size={24} />
        <div>
          <h2>Nothing leaves your phone</h2>
          <p>The decoder runs entirely in your browser against Jaano’s offline registries — no server, no upload, no account. A pasted label has no nutrition panel, so this score reflects additive and ingredient hazard only; catalog products additionally carry a nutrition penalty.</p>
        </div>
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared: the ordered, decoded ingredient ledger                     */
/* ------------------------------------------------------------------ */
export function IngredientLedger({ lines }) {
  const [open, setOpen] = useState(null)
  return (
    <ol className="ing-ledger">
      {lines.map((l, i) => {
        const meta = VERDICT_META[l.verdict]
        const Icon = VERDICT_ICON[l.verdict]
        const isOpen = open === i
        const rm = RISK_META[l.risk] || RISK_META.none
        return (
          <li key={i} className={`ing-ledger-row v-${l.verdict} ${isOpen ? 'open' : ''}`} style={{ '--v': meta.color }}>
            <button className="ing-ledger-head" onClick={() => setOpen(isOpen ? null : i)}>
              <span className="ing-ledger-num">{i + 1}</span>
              <div className="ing-ledger-main">
                <strong>{l.raw}</strong>
                <small>{l.cls?.label}{l.cls?.group ? ` · ${l.cls.group}` : ''}</small>
              </div>
              <div className="ing-ledger-tags">
                {l.additives.map((a) => (
                  <span key={a.code} className="ing-code-tag" title={a.name}>{a.code}</span>
                ))}
                <span className="ing-ledger-verdict"><Icon size={12} /> {meta.label}</span>
              </div>
            </button>
            {isOpen && (
              <div className="ing-ledger-body animated-fade-in">
                <p>{l.harm || l.cls?.why}</p>
                {l.risk !== 'none' && (
                  <span className="tox-risk-chip sm" style={{ background: rm.color }}>{rm.dot} {rm.label}</span>
                )}
                {Object.keys(l.organs).length > 0 && (
                  <div className="ing-ledger-organs">
                    {Object.keys(l.organs).map((o) => ORGAN_SYSTEMS[o] && (
                      <span key={o} className="organ-tag">{ORGAN_SYSTEMS[o].emoji} {ORGAN_SYSTEMS[o].label}</span>
                    ))}
                  </div>
                )}
                {l.rich?.replacedBy && (
                  <p className="ing-ledger-swap"><strong>Clean swap:</strong> {l.rich.replacedBy}</p>
                )}
                {l.additives.map((a) => (
                  <div key={a.code} className="ing-ledger-additive">
                    <strong>INS {a.code} — {a.name}</strong>
                    <p>{a.harm}</p>
                    <small>ADI: {a.adi} · {a.law}</small>
                  </div>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared: the additive table                                         */
/* ------------------------------------------------------------------ */
export function AdditiveTable({ additives }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Chemical breakdown</span>
          <h2>{additives.length} declared additive{additives.length !== 1 ? 's' : ''}</h2>
        </div>
      </div>
      <div className="additive-table">
        {additives.map((a) => {
          const rm = RISK_META[a.risk] || RISK_META.none
          const banned = /\bBANNED\b|Banned/.test(a.law || '')
          return (
            <div key={a.code} className="additive-table-row" style={{ '--risk': rm.color }}>
              <span className="tox-code-badge">{a.code}</span>
              <div className="additive-table-main">
                <div className="additive-table-title">
                  <strong>{a.name}</strong>
                  {banned && <span className="tox-ban-tag"><Ban size={11} /> Banned somewhere</span>}
                  <span className="tox-risk-chip sm" style={{ background: rm.color }}>{rm.label}</span>
                </div>
                <small>{a.cls}</small>
                <p>{a.harm}</p>
                {a.symptoms && <p className="additive-symptoms"><AlertTriangle size={12} /> Early signs: {a.symptoms}</p>}
                <div className="additive-table-meta">
                  <span><strong>ADI:</strong> {a.adi}</span>
                  <span><strong>Law:</strong> {a.law}</span>
                </div>
              </div>
              <div className="additive-table-organs">
                {Object.keys(a.organs || {}).map((o) => {
                  const key = o === 'cancer' ? 'dna' : o === 'hormone' ? 'thyroid' : o
                  return ORGAN_SYSTEMS[key] ? (
                    <span key={o} title={ORGAN_SYSTEMS[key].label}>{ORGAN_SYSTEMS[key].emoji}</span>
                  ) : null
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
