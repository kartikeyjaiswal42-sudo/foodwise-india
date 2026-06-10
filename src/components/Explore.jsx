import { useState, useMemo } from 'react'
import { Search, ScanLine, X, SlidersHorizontal, Check, Store, ArrowRight, CornerDownRight, Leaf, ShieldAlert, Info, Plus } from 'lucide-react'
import { products, categories } from '../data/foodDatabase'
import ProductPack from './ProductPack'

export default function Explore({ query, setQuery, onOpen, onAdd }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [onlyBetter, setOnlyBetter] = useState(false)
  const [selectedSwapPair, setSelectedSwapPair] = useState(null) // holds product id to compare

  // Filter products based on search term, category, and health tier
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchStr = `${product.name} ${product.brand} ${product.company} ${product.category} ${product.ingredients.join(' ')}`.toLowerCase()
      const matchesQuery = searchStr.includes(query.toLowerCase())
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      const matchesBetter = !onlyBetter || product.score >= 75
      return matchesQuery && matchesCategory && matchesBetter
    })
  }, [query, activeCategory, onlyBetter])

  const ScoreBadge = ({ score, grade }) => {
    const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
    return (
      <div className={`score-badge ${tone}`}>
        <strong>{grade}</strong>
        <span>{score}</span>
      </div>
    )
  }

  // Find the swap details for the chosen product
  const swapPairDetails = useMemo(() => {
    if (!selectedSwapPair) return null
    const base = products.find(p => p.id === selectedSwapPair)
    if (!base || !base.alternative) return null
    const alt = products.find(p => p.id === base.alternative)
    return { base, alt }
  }, [selectedSwapPair])

  return (
    <main className="explore-view">
      <section className="explore-head">
        <div>
          <span className="eyebrow">Marketplace Decoder</span>
          <h1>Decode India’s Food Shelf</h1>
          <p>Scan ingredients, identify corporate parent companies, and discover cleaner food alternatives with detailed side-by-side cost comparisons.</p>
        </div>
        <div className="explore-stat">
          <strong>{products.length}</strong>
          <span>verified Indian products</span>
          <div>
            <Leaf size={15} /> 100% additive audited
          </div>
        </div>
      </section>

      <label className="search-field explore-search">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product name, brand, company, or chemical ingredient (e.g. 'carrageenan')"
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search">
            <X size={17} />
          </button>
        )}
        <button className="scan-button">
          <ScanLine size={18} /> <span>Scan pack</span>
        </button>
      </label>

      <section className="catalog-tools">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? 'active' : ''}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          className={`filter-button ${onlyBetter ? 'active' : ''}`}
          onClick={() => setOnlyBetter(!onlyBetter)}
        >
          <SlidersHorizontal size={16} /> <span>Clean label only</span> {onlyBetter && <Check size={14} />}
        </button>
      </section>

      {/* Side-by-Side Alternative Matchmaker Panel */}
      {swapPairDetails && (
        <section className="panel swap-matchmaker-panel animated-fade-in" style={{ marginBottom: '24px' }}>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Cost & Ingredient Matchmaker</span>
              <h2>Side-by-Side Swap Comparison</h2>
            </div>
            <button className="icon-button" onClick={() => setSelectedSwapPair(null)} aria-label="Close matchmaker">
              <X size={18} />
            </button>
          </div>
          <div className="swap-comparator-deck">
            {/* Unhealthy choice */}
            <div className="comparator-col base-col">
              <span className="col-label alert-danger">Processed Choice</span>
              <div className="comparator-product-card">
                <ProductPack product={swapPairDetails.base} compact />
                <div>
                  <strong>{swapPairDetails.base.name}</strong>
                  <small>{swapPairDetails.base.company}</small>
                  <p className="price-tag">₹{swapPairDetails.base.price} ({swapPairDetails.base.size})</p>
                </div>
                <ScoreBadge score={swapPairDetails.base.score} grade={swapPairDetails.base.grade} />
              </div>
              <div className="comparator-specs">
                <strong>High Concern Ingredients:</strong>
                <ul className="spec-list">
                  {swapPairDetails.base.concerns.map((c, i) => (
                    <li key={i} className={c.level === 'high' ? 'danger-text' : ''}>
                      ⚠️ {c.name} ({c.amount})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="swap-arrow-divider">
              <ArrowRight size={28} />
            </div>

            {/* Healthier swap */}
            <div className="comparator-col alt-col">
              <span className="col-label alert-success">Recommended Swap</span>
              <div className="comparator-product-card">
                <ProductPack product={swapPairDetails.alt} compact />
                <div>
                  <strong>{swapPairDetails.alt.name}</strong>
                  <small>{swapPairDetails.alt.company}</small>
                  <p className="price-tag">₹{swapPairDetails.alt.price} ({swapPairDetails.alt.size})</p>
                </div>
                <ScoreBadge score={swapPairDetails.alt.score} grade={swapPairDetails.alt.grade} />
              </div>
              <div className="comparator-specs">
                <strong>Why it is a better upgrade:</strong>
                <ul className="spec-list clean-specs">
                  <li>🟢 unit price comparison: <strong>{swapPairDetails.base.alternativeCompare.pricePerUnitDiffText}</strong></li>
                  {swapPairDetails.base.alternativeCompare.ingredientsAvoided.map((ing, i) => (
                    <li key={i}>🚫 Avoids <strong>{ing}</strong></li>
                  ))}
                </ul>
                <div className="replaces-mapping">
                  <strong>How ingredients are upgraded:</strong>
                  {swapPairDetails.base.alternativeCompare.ingredientsReplacedWith.map((map, i) => (
                    <div key={i} className="map-item">
                      <CornerDownRight size={12} />
                      <span>{map.avoided} ➡️ <strong>{map.replaced}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="results-meta">
        <p><strong>{filteredProducts.length}</strong> items matching filters</p>
      </div>

      <section className="product-grid">
        {filteredProducts.map((product) => {
          const topConcern = product.concerns[0]
          return (
            <article key={product.id} className="product-card">
              <button className="product-main" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
                <div className="card-pack-wrap">
                  <ProductPack product={product} />
                  <ScoreBadge score={product.score} grade={product.grade} />
                </div>
                <div className="product-copy">
                  <span className="eyebrow">{product.company}</span>
                  <h3>{product.name}</h3>
                  <p>{product.brand} · {product.size}</p>
                  
                  {topConcern && (
                    <div className={`concern-pill ${topConcern.level}`}>
                      {topConcern.level === 'high' ? <ShieldAlert size={12} /> : <Info size={12} />}
                      <span>{topConcern.name}</span>
                    </div>
                  )}
                </div>
              </button>
              
              <div className="product-footer">
                <div className="footer-price-info">
                  <strong>₹{product.price}</strong>
                  <span>est. cost</span>
                </div>
                
                <div className="footer-actions">
                  {product.alternative && product.score < 60 && (
                    <button 
                      className="text-button swap-compare-trigger" 
                      onClick={() => setSelectedSwapPair(product.id)}
                      title="Compare side-by-side alternative"
                    >
                      Compare Swap
                    </button>
                  )}
                  <button 
                    className="icon-button add" 
                    onClick={() => onAdd(product)} 
                    aria-label={`Add ${product.name} to log`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <Search size={32} />
          <h2>No matching food found</h2>
          <p>We couldn't find any products matching your search term. Try adjusting filters or searching for another item.</p>
        </div>
      )}
    </main>
  )
}
