import { useState, useMemo } from 'react'
import { ArrowLeft, Plus, ShoppingBasket, ShieldCheck, HeartPulse, Sparkles, Zap, Info, TriangleAlert, ArrowRight, CornerDownRight, X, Heart, Activity, Leaf, Ban, GitCompareArrows, FileText } from 'lucide-react'
import { products } from '../data/foodDatabase'
import { ORGAN_SYSTEMS } from '../data/ingredientsDb'
import { VERDICT_META } from '../lib/ingredientClassify'
import { scanProduct, TOX_BANDS } from '../lib/toxicity'
import { avoidHits } from '../lib/avoidList'
import { personalAlerts, conditionById, DISCLAIMER } from '../lib/conditions'
import { IngredientLedger, AdditiveTable } from './LabelScanner'
import ProductPack from './ProductPack'
import ScoreBadge from './ScoreBadge'
import { isRated, auditProduct, CONFIDENCE_META } from '../lib/dataQuality'

export default function ProductDetail({ product, onBack, onAdd, onOpen, limits, avoid = [], conditions = [], onNavigate }) {
  const [showRaw, setShowRaw] = useState(false)

  const scan = useMemo(() => scanProduct(product), [product])
  const flags = useMemo(() => avoidHits(product, avoid), [product, avoid])
  const personal = useMemo(
    () => personalAlerts(product, conditions, limits),
    [product, conditions, limits]
  )
  const organs = useMemo(
    () => Object.entries(scan.organs).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0),
    [scan]
  )
  const maxOrgan = Math.max(1, ...organs.map(([, v]) => v))
  const band = TOX_BANDS[scan.band]

  const alternative = useMemo(() => {
    return products.find((item) => item.id === product.alternative)
  }, [product])

  const isBetter = alternative && alternative.score > product.score

  const dailyLimits = limits || { sugar: 25, sodium: 2300, satFat: 20 }
  const metricMeta = {
    sugar: { label: 'Added sugar', unit: 'g', color: '#df7b54', icon: Zap },
    sodium: { label: 'Sodium', unit: 'mg', color: '#7d88d9', icon: Sparkles },
    satFat: { label: 'Saturated fat', unit: 'g', color: '#c49143', icon: HeartPulse },
  }


  return (
    <main className="detail-view">
      <button className="text-button back" onClick={onBack}>
        <ArrowLeft size={17} /> Back to explore
      </button>

      <section className="detail-hero">
        <div className="detail-pack-panel">
          <div className="pack-halo" />
          <ProductPack product={product} large />
          <div className="verified-chip">
            <ShieldCheck size={15} /> Lab Audited Data
          </div>
        </div>
        <div className="detail-intro">
          <span className="eyebrow">{product.company} · {product.category}</span>
          <h1>{product.name}</h1>
          <p className="brand-line">
            {product.brand} <span /> {product.size} <span />
            <span title={product.priceNote || 'Estimated from pack weight and a category rate — not a printed price.'}>
              ₹{product.price} {product.priceSource === 'bigbasket-mrp'
                ? <em className="price-kind real">MRP</em>
                : <em className="price-kind">est.</em>}
            </span>
          </p>
          <div className="detail-score-row">
            <ScoreBadge score={product.score} grade={product.grade} large />
            <div className="score-desc">
              <strong>{!isRated(product) ? 'Not enough label data to rate this pack'
                : product.score >= 75 ? 'Excellent clean alternative'
                  : product.score >= 50 ? 'Occasional consume'
                    : 'Processed food: high watchpoint'}</strong>
              <p>Score calculated considering synthetic additives, sodium concentration, and glycemic index load.</p>
            </div>
          </div>
          <div className="detail-actions">
            <button className="primary-button" onClick={() => onAdd(product)}>
              <Plus size={18} /> Add to diary
            </button>
            <button className="secondary-button" onClick={() => onNavigate?.('compare')}>
              <GitCompareArrows size={18} /> Compare with another
            </button>
          </div>
        </div>
      </section>

      {(() => {
        const audit = auditProduct(product)
        if (audit.confidence === 'full' && !audit.implausible.length) return null
        const meta = CONFIDENCE_META[audit.confidence]
        return (
          <section className="data-quality-note">
            <Info size={19} />
            <div>
              <strong>{meta.label}</strong>
              <p>
                {audit.confidence === 'none'
                  ? 'Open Food Facts has this pack on file but nobody has photographed or typed up its label yet, so Jaano will not put a score on it. Anything we do show below comes only from what is published.'
                  : meta.note}
              </p>
              {audit.reasons.length > 0 && (
                <ul>{audit.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
              )}
            </div>
          </section>
        )
      })()}

      {personal.length > 0 && (
        <section className="personal-alert-panel">
          <div className="personal-alert-head">
            <HeartPulse size={20} />
            <div>
              <strong>What this means for you</strong>
              <small>
                Based on {conditions.map((c) => conditionById(c)?.label).filter(Boolean).join(' · ')}
              </small>
            </div>
            <button className="text-button" onClick={() => onNavigate?.('profile')}>
              Edit <ArrowRight size={14} />
            </button>
          </div>
          <ul className="personal-alert-list">
            {personal.map((a, i) => (
              <li key={i} className={`personal-alert sev-${a.severity}`}>
                <span className="personal-alert-icon">
                  {a.severity === 'high' ? <TriangleAlert size={15} /> : <Info size={15} />}
                </span>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.detail}</p>
                  {a.ingredient && (
                    <small className="personal-alert-src">Found in: “{a.ingredient}”</small>
                  )}
                </div>
                {a.kind === 'nutrient' && (
                  <div className="personal-alert-meter" title={`${a.pct}% of your daily ceiling`}>
                    <span style={{ width: `${Math.min(100, a.pct)}%` }} />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="personal-alert-foot">{DISCLAIMER}</p>
        </section>
      )}

      {flags.length > 0 && (
        <section className="detail-avoid-alert">
          <Ban size={22} />
          <div>
            <strong>This contains {flags.length} thing{flags.length !== 1 ? 's' : ''} on your avoid list</strong>
            <div className="scanner-avoid-tags">
              {flags.map((f) => (
                <span key={f.rule.id}>{f.rule.label} <small>found “{f.matchedTerm}”</small></span>
              ))}
            </div>
          </div>
          <button className="text-button" onClick={() => onNavigate?.('avoid')}>Edit list <ArrowRight size={14} /></button>
        </section>
      )}

      {/* Toxic load + organ impact */}
      <section className="panel detail-tox-panel" style={{ '--band': band.color }}>
        <div className="detail-tox-head">
          <div className="detail-tox-score">
            <strong>{scan.toxIndex}</strong>
            <span>toxic load<br />/ 100</span>
          </div>
          <div>
            <span className="tox-risk-chip" style={{ background: band.color }}>{band.label}</span>
            <h2>Body impact analysis</h2>
            <p>
              {band.note} We found <strong>{scan.additives.length} declared additive{scan.additives.length !== 1 ? 's' : ''}</strong>{' '}
              and <strong>{scan.hazards.length} flagged ingredient{scan.hazards.length !== 1 ? 's' : ''}</strong> loading{' '}
              <strong>{scan.systemsHit} body system{scan.systemsHit !== 1 ? 's' : ''}</strong>.
            </p>
          </div>
        </div>
        {organs.length > 0 && (
          <div className="tox-organ-bars">
            {organs.slice(0, 8).map(([key, value]) => {
              const sys = ORGAN_SYSTEMS[key]
              return (
                <div key={key} className="tox-organ-bar-row">
                  <button className="tox-organ-bar-name" onClick={() => onNavigate?.('toxicity')}>
                    <span>{sys.emoji}</span> {sys.label}
                  </button>
                  <div className="tox-organ-bar">
                    <span style={{ width: `${(value / maxOrgan) * 100}%`, background: sys.color }} />
                  </div>
                  <strong>{Math.round(value)}</strong>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="detail-grid">
        <article className="panel nutrition-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Per Serving ({product.servingSize})</span>
              <h2>Nutrition Profile</h2>
            </div>
            <span>{product.calories} kcal</span>
          </div>
          <div className="nutrient-bars">
            {Object.entries(product.nutrients).map(([metric, value]) => {
              const meta = metricMeta[metric]
              const percent = Math.min(100, (value / dailyLimits[metric]) * 100)
              return (
                <div className="nutrient-row" key={metric}>
                  <div className="nutrient-row-label">
                    <span>{meta.label}</span>
                    <strong>{value}{meta.unit}</strong>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${percent}%`, background: meta.color }} />
                  </div>
                  <small>{Math.round(percent)}% of daily allowance</small>
                </div>
              )
            })}
          </div>
        </article>

        <article className="panel concerns-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Toxicity warnings</span>
              <h2>Primary Concerns</h2>
            </div>
            <TriangleAlert size={19} color="#e59e0b" />
          </div>
          <div className="concern-list">
            {product.concerns.map((concern, index) => (
              <div key={index} className={`concern-item ${concern.level}`}>
                <div className="concern-icon">
                  {concern.level === 'high' ? <TriangleAlert size={18} /> : <Info size={18} />}
                </div>
                <div className="concern-content">
                  <div>
                    <strong>{concern.name}</strong>
                    <span>{concern.amount}</span>
                  </div>
                  <p>{concern.note}</p>
                </div>
              </div>
            ))}
            {product.concerns.length === 0 && (
              <div className="no-concerns-box">
                <ShieldCheck size={20} color="#10b981" />
                <p>No high-risk food additives or excessive nutritional parameters detected in this product.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* ============ THE INGREDIENT LIST ============ */}
      <section className="panel ingredient-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Additive auditor</span>
            <h2>Full ingredient list, decoded</h2>
          </div>
          <span className="helper-click-badge">💡 Tap any ingredient for the mechanism</span>
        </div>

        {product.ingredients.length > 0 ? (
          <>
            <div className="ingredient-summary">
              <div className="ing-quality-bar">
                <span className="iq good" style={{ flex: scan.counts.good || 0.0001 }} />
                <span className="iq neutral" style={{ flex: scan.counts.neutral || 0.0001 }} />
                <span className="iq bad" style={{ flex: scan.counts.bad || 0.0001 }} />
              </div>
              <div className="ing-quality-legend">
                <span><i className="good" /> {scan.counts.good} good</span>
                <span><i className="neutral" /> {scan.counts.neutral} neutral</span>
                <span><i className="bad" /> {scan.counts.bad} watch out</span>
                <span className="ing-count">{product.ingredients.length} total</span>
              </div>
            </div>

            {scan.lines[0] && (
              <p className="ingredient-lead">
                <Info size={14} />
                <span>
                  Ingredients are printed by descending weight, so <strong>{scan.lines[0].raw}</strong>
                  {scan.lines[1] ? <> and <strong>{scan.lines[1].raw}</strong> make up</> : <> makes up</>} the bulk of this pack.
                </span>
              </p>
            )}

            <IngredientLedger lines={scan.lines} />

            <button className="text-button" onClick={() => setShowRaw(!showRaw)} style={{ marginTop: 12 }}>
              <FileText size={14} /> {showRaw ? 'Hide' : 'Show'} the statement exactly as printed
            </button>
            {showRaw && (
              <div className="ingredient-raw animated-fade-in">
                <span className="eyebrow">As declared on pack</span>
                <p>INGREDIENTS: {product.ingredients.join(', ')}</p>
              </div>
            )}
          </>
        ) : (
          <p className="label-note">No ingredient list was declared for this product in the source data.</p>
        )}

        <p className="label-note">
          <Info size={14} /> Always review the physical pack if you have a severe allergy — “may contain” cross-contamination warnings are not part of the declared ingredient list.
        </p>
      </section>

      {/* ============ ADDITIVE TABLE ============ */}
      {scan.additives.length > 0 && <AdditiveTable additives={scan.additives} />}

      {/* Alternative Swap Section */}
      {alternative && (
        <section className="swap-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{isBetter ? 'Smart Health Upgrade' : 'Comparison choice'}</span>
              <h2>{isBetter ? 'Satisfy your craving. Protect your health.' : 'Product Comparison details'}</h2>
            </div>
            <button className="secondary-button" onClick={() => onOpen(alternative)}>
              View full analysis <ArrowRight size={16} />
            </button>
          </div>
          <div className="swap-card">
            <div className="swap-product">
              <ProductPack product={product} compact />
              <div className="swap-product-meta">
                <span>Current selection</span>
                <strong>{product.name}</strong>
                <small>₹{product.price}</small>
              </div>
              <ScoreBadge score={product.score} grade={product.grade} />
            </div>
            <div className="swap-arrow">
              <ArrowRight size={19} />
            </div>
            <div className="swap-product better">
              <ProductPack product={alternative} compact />
              <div className="swap-product-meta">
                <span>{isBetter ? 'Healthier Swap' : 'Comparable Alternative'}</span>
                <strong>{alternative.name}</strong>
                <small>₹{alternative.price}</small>
              </div>
              <ScoreBadge score={alternative.score} grade={alternative.grade} />
            </div>
            <div className="swap-reasons">
              {Object.keys(metricMeta).map((metric) => {
                const diff = product.nutrients[metric] - alternative.nutrients[metric]
                return diff > 0 ? (
                  <span key={metric} className="swap-benefit">
                    🚫 Up to {diff.toFixed(metric === 'sodium' ? 0 : 1)}{metricMeta[metric].unit} less {metricMeta[metric].label.toLowerCase()}
                  </span>
                ) : null
              })}
              {isBetter && (
                <>
                  <span className="swap-benefit">
                    🚫 Eliminates: {product.alternativeCompare.ingredientsAvoided.join(', ')}
                  </span>
                  <div className="swap-replacements">
                    <strong>Ingredient Upgrades:</strong>
                    {product.alternativeCompare.ingredientsReplacedWith.map((map, i) => (
                      <div key={i} className="replacement-map-row">
                        <CornerDownRight size={11} />
                        <span>Replaces {map.avoided} with <strong>{map.replaced}</strong></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
