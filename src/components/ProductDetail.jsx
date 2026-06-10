import { useState, useMemo } from 'react'
import { ArrowLeft, Plus, ShoppingBasket, ShieldCheck, HeartPulse, Sparkles, Zap, Info, TriangleAlert, ArrowRight, CornerDownRight, X, Heart, Activity } from 'lucide-react'
import { products } from '../data/foodDatabase'
import { ingredientsDb } from '../data/ingredientsDb'
import ProductPack from './ProductPack'

export default function ProductDetail({ product, onBack, onAdd, onOpen, limits }) {
  const [selectedIngredient, setSelectedIngredient] = useState(null)

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

  // Look up details of an ingredient in our hazard registry
  const getIngredientDetails = (name) => {
    const cleanName = name.replace(/[0-9*()]/g, '').trim()
    const foundKey = Object.keys(ingredientsDb).find(key => 
      name.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(cleanName.toLowerCase())
    )
    return foundKey ? ingredientsDb[foundKey] : null
  }

  const ScoreBadge = ({ score, grade, large = false }) => {
    const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
    return (
      <div className={`score-badge ${tone} ${large ? 'large' : ''}`}>
        <strong>{grade}</strong>
        <span>{score}</span>
      </div>
    )
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
            {product.brand} <span /> {product.size} <span /> ₹{product.price}
          </p>
          <div className="detail-score-row">
            <ScoreBadge score={product.score} grade={product.grade} large />
            <div className="score-desc">
              <strong>{product.score >= 75 ? 'Excellent clean alternative' : product.score >= 50 ? 'Occasional consume' : 'Processed food: high watchpoint'}</strong>
              <p>Score calculated considering synthetic additives, sodium concentration, and glycemic index load.</p>
            </div>
          </div>
          <div className="detail-actions">
            <button className="primary-button" onClick={() => onAdd(product)}>
              <Plus size={18} /> Add to diary
            </button>
            <button className="secondary-button">
              <ShoppingBasket size={18} /> Find online stores
            </button>
          </div>
        </div>
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

      {/* Interactive Ingredient Explainer Cloud */}
      <section className="panel ingredient-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Additive Auditor</span>
            <h2>Interactive Ingredient Decoder</h2>
          </div>
          <span className="helper-click-badge">💡 Click highlighted items to decode</span>
        </div>
        
        {/* Decoder Overlay Modal if ingredient is clicked */}
        {selectedIngredient && (
          <div className="ingredient-detail-box animated-fade-in">
            <div className="ing-detail-header">
              <h3>🔍 Decoder: {selectedIngredient.name}</h3>
              <button className="icon-button" onClick={() => setSelectedIngredient(null)} aria-label="Close decoder">
                <X size={15} />
              </button>
            </div>
            <div className="ing-detail-body">
              <div className={`ing-badge ${selectedIngredient.risk}`}>
                Risk level: <strong>{selectedIngredient.risk.toUpperCase()}</strong>
              </div>
              <div className="ing-details-grid">
                <div>
                  <strong>Target Organs:</strong>
                  <div className="ing-organs">
                    {selectedIngredient.organs.map(o => (
                      <span key={o} className="organ-tag">
                        {o === 'gut' && <Activity size={10} />}
                        {o === 'heart' && <Heart size={10} />}
                        {o === 'metabolic' && <Activity size={10} />}
                        {o === 'liver' && <ShieldCheck size={10} />}
                        {o === 'cellular' && <Sparkles size={10} />}
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Regulatory Status:</strong>
                  <p className="ing-small-p">{selectedIngredient.regulatory}</p>
                </div>
              </div>
              <div className="ing-description">
                <strong>Biological Issue Created in Body:</strong>
                <p>{selectedIngredient.issues}</p>
              </div>
              <div className="ing-replacement">
                <strong>Replaced with:</strong>
                <p>In clean foods, this is replaced by: <span>{selectedIngredient.replacedBy}</span></p>
              </div>
            </div>
          </div>
        )}

        <div className="ingredient-cloud">
          {product.ingredients.map((ingredient, index) => {
            const audit = getIngredientDetails(ingredient)
            return (
              <span
                key={index}
                className={`ingredient-chip ${audit ? 'flagged clickable' : ''} ${audit ? audit.risk : ''}`}
                onClick={() => audit && setSelectedIngredient(audit)}
              >
                {ingredient}
                {audit && (
                  <span className="info-dot">
                    {audit.risk === 'high' ? <TriangleAlert size={10} /> : <Info size={10} />}
                  </span>
                )}
              </span>
            )
          })}
        </div>
        <p className="label-note">
          <Info size={14} /> Ingredient statements are extracted from packaging label declarations. Always review product labels in store if you suffer from severe allergies.
        </p>
      </section>

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
