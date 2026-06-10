import { useState } from 'react'
import { Search, ScanLine, X, ArrowLeft, Minus, Plus, Check, Info } from 'lucide-react'

export default function AddFoodModal({ products, initialProduct, onClose, onAdd }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(initialProduct)
  const [servings, setServings] = useState(1)

  const filtered = products.filter((product) =>
    `${product.name} ${product.brand} ${product.company} ${product.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  const handleAdd = () => {
    if (selected) {
      onAdd(selected, servings)
    }
  }

  // Visual component for product packaging representation
  const ProductPack = ({ product, compact = false }) => {
    return (
      <div
        className={`product-pack ${compact ? 'compact' : ''}`}
        style={{ '--pack': product.color, '--ink': product.ink }}
      >
        <span className="pack-company">{product.brand}</span>
        <strong>{product.accent}</strong>
        <span className="pack-line" />
        <small>{product.category}</small>
      </div>
    )
  }

  const ScoreBadge = ({ score, grade }) => {
    const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
    return (
      <div className={`score-badge ${tone}`}>
        <strong>{grade}</strong>
        <span>{score}</span>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal add-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">Food log</span>
            <h2>Add what you ate</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={19} />
          </button>
        </div>

        {!selected ? (
          <>
            <label className="search-field modal-search">
              <Search size={18} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods, brands, or ingredients"
              />
              <button className="scan-button" aria-label="Scan barcode">
                <ScanLine size={18} />
              </button>
            </label>
            <p className="helper-copy">Available Food catalog</p>
            <div className="food-picker">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  className="food-picker-row"
                  onClick={() => {
                    setSelected(product)
                    setServings(1)
                  }}
                >
                  <ProductPack product={product} compact />
                  <span className="picker-meta">
                    <strong>{product.name}</strong>
                    <small>{product.brand} · {product.size} · ₹{product.price}</small>
                  </span>
                  <ScoreBadge score={product.score} grade={product.grade} />
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="empty-picker">
                  <p>No products match your search. Try "maggi", "chips", or "muesli".</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="serving-step">
            <button className="text-button back" onClick={() => setSelected(null)}>
              <ArrowLeft size={16} /> Back to search
            </button>
            <div className="selected-food">
              <ProductPack product={selected} />
              <div className="selected-food-details">
                <span className="eyebrow">{selected.company}</span>
                <h3>{selected.name}</h3>
                <p>Serving size: {selected.servingSize} ({selected.size} total)</p>
              </div>
            </div>

            <div className="serving-control">
              <div className="serving-label">
                <span>Quantity eaten</span>
                <strong>{servings} {servings === 1 ? 'serving' : 'servings'}</strong>
              </div>
              <div className="serving-buttons">
                <button
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  aria-label="Decrease servings"
                >
                  <Minus size={18} />
                </button>
                <button onClick={() => setServings(servings + 0.5)} aria-label="Increase servings">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="impact-preview">
              <span className="preview-header"><Info size={13} /> Log impact preview</span>
              <div className="preview-grid">
                <div className="impact-item">
                  <strong>+{(selected.nutrients.sugar * servings).toFixed(1)}g</strong>
                  <small>sugar</small>
                </div>
                <div className="impact-item">
                  <strong>+{(selected.nutrients.sodium * servings).toFixed(0)}mg</strong>
                  <small>sodium</small>
                </div>
                <div className="impact-item">
                  <strong>+{(selected.nutrients.satFat * servings).toFixed(1)}g</strong>
                  <small>sat. fat</small>
                </div>
              </div>
            </div>

            {selected.score < 50 && (
              <div className="alert-box warning-alert">
                <strong>⚠️ Processed Food Notice</strong>
                <p>This product contains multiple high-concern additives. Swapping to the recommended alternative is advised for regular meals.</p>
              </div>
            )}

            <button className="primary-button wide add-confirm-button" onClick={handleAdd}>
              <Check size={18} /> Add to food diary
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
