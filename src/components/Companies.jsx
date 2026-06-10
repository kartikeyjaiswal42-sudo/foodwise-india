import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Store, ShieldAlert, Award, TrendingUp, Sparkles, AlertTriangle, ShieldCheck, Check } from 'lucide-react'
import { products } from '../data/foodDatabase'
import ProductPack from './ProductPack'

const companyList = [
  {
    name: 'Nestlé India',
    rank: 1,
    revenue: '₹19,000 Cr',
    brands: ['Maggi', 'Nescafé', 'KitKat', 'Milkmaid'],
    logoText: 'Nestlé',
    themeColor: '#C8202F',
    textColor: '#ffffff',
    summary: 'The Swiss food giant’s Indian subsidiary dominates the instant noodle, instant coffee, and chocolate wafer segments. Maggi is arguably India’s most iconic packaged food brand.',
    controversies: 'Historically scrutinized over high sodium in noodles and high sugar contents in infant formula.',
    marketStrategy: 'Increasing focus on premiumisation and launching organic, oat-based alternatives to traditional lines.'
  },
  {
    name: 'Britannia Industries',
    rank: 2,
    revenue: '₹16,000 Cr',
    brands: ['Good Day', 'Marie Gold', 'Tiger', 'Bourbon', 'NutriChoice'],
    logoText: 'Britannia',
    themeColor: '#df691a',
    textColor: '#ffffff',
    summary: 'One of India’s oldest FMCG players, controlling a major share of the biscuit market. They are actively expanding into dairy, cakes, and croissants.',
    controversies: 'Flags concerns over high concentration of palm oil and interesterified fats in its premium biscuit fillings.',
    marketStrategy: 'Pioneered "healthier" digestive biscuits via NutriChoice while maintaining massive volume through glucose and cream lines.'
  },
  {
    name: "Haldiram's",
    rank: 3,
    revenue: '₹14,000 Cr',
    brands: ['Aloo Bhujia', 'Bhujia Sev', 'Soan Papdi', 'Classic Namkeen'],
    logoText: 'Haldiram',
    themeColor: '#d69e2e',
    textColor: '#ffffff',
    summary: 'The leading name in traditional Indian namkeens, sweets, and snacks, generating massive domestic revenues. Organized as separate regional corporate entities.',
    controversies: 'High dependence on palm oil deep-frying and excessive sodium loads across its popular namkeen lines.',
    marketStrategy: 'Entering modern Western-style chips and packaged bakery while expanding retail restaurant chains globally.'
  },
  {
    name: 'ITC (Foods Division)',
    rank: 4,
    revenue: '₹15,000 Cr',
    brands: ['Aashirvaad', 'Sunfeast', 'Bingo', 'Yippee'],
    logoText: 'ITC',
    themeColor: '#c2185b',
    textColor: '#ffffff',
    summary: 'The diversified conglomerate entered foods in 2001 and quickly built market-leading brands. Aashirvaad is India’s top packaged wheat flour (atta).',
    controversies: 'Maintains highly processed snack portfolios (Bingo, Yippee) while promoting staples as health-oriented.',
    marketStrategy: 'Aggressively acquiring natural D2C brands and introducing millet-based blends across Aashirvaad and Sunfeast.'
  },
  {
    name: 'Parle Products',
    rank: 5,
    revenue: '₹17,000 Cr',
    brands: ['Parle-G', 'Monaco', 'Hide & Seek', 'KrackJack'],
    logoText: 'Parle',
    themeColor: '#1976d2',
    textColor: '#ffffff',
    summary: 'Maker of the globally famous Parle-G glucose biscuit. Parle owns an unmatched distribution network reaching the deepest parts of rural India.',
    controversies: 'Heavy reliance on cheap refined wheat flour (maida), palm oil, and high added sugar ratios in budget biscuits.',
    marketStrategy: 'Targeting urban premium markets with chocolate chips (Hide & Seek) and maintaining low-price points in rural markets.'
  },
  {
    name: 'Amul (GCMMF)',
    rank: 6,
    revenue: '₹80,000 Cr',
    brands: ['Amul Butter', 'Amul Cheese', 'Amul Milk', 'Kool', 'Dark Chocolate'],
    logoText: 'Amul',
    themeColor: '#388e3c',
    textColor: '#ffffff',
    summary: 'The Gujarat Cooperative Milk Marketing Federation is the apex body of dairy cooperatives. A highly trusted brand owned by millions of farmers.',
    controversies: 'Critiqued for using synthetic emulsifying salts and preservatives in processed cheese and dairy beverages.',
    marketStrategy: 'Expanding from traditional dairy to packaged dark chocolates, bakery products, organic food grains, and fresh fruit juices.'
  },
  {
    name: 'PepsiCo India',
    rank: 7,
    revenue: '₹8,000 Cr',
    brands: ['Lay\'s', 'Kurkure', 'Quaker Oats', 'Tropicana'],
    logoText: 'PepsiCo',
    themeColor: '#002f6c',
    textColor: '#ffffff',
    summary: 'Global food and beverage giant which operates a massive snacks division in India, leading the western-style potato chips and corn puff sectors.',
    controversies: 'High content of saturated fats and monosodium glutamate (MSG) in popular potato chips (Lays) and corn puffs (Kurkure).',
    marketStrategy: 'Formulating lower sodium alternatives and introducing baked grain snacks to balance the health-conscious market shift.'
  },
  {
    name: 'Mother Dairy',
    rank: 8,
    revenue: '₹12,000 Cr',
    brands: ['Mother Dairy Milk', 'Dhara Oils', 'Safal Frozen Vegetables'],
    logoText: 'Mother',
    themeColor: '#0288d1',
    textColor: '#ffffff',
    summary: 'Established in 1974 under Operation Flood, Mother Dairy is a wholly-owned subsidiary of the National Dairy Development Board (NDDB).',
    controversies: 'Faces regional competition and focuses on milk fat and blending standards in edible oils.',
    marketStrategy: 'Promoting chemical-free frozen vegetables (Safal) and cold-pressed edible seed oils (Dhara) alongside fresh pasteurized milk.'
  },
  {
    name: 'Tata Consumer Products',
    rank: 9,
    revenue: '₹14,000 Cr',
    brands: ['Tata Salt', 'Tata Sampann', 'Tata Tea', 'Tata Soulfull'],
    logoText: 'Tata',
    themeColor: '#008080',
    textColor: '#ffffff',
    summary: 'The food and beverage arm of the Tata Group. It has repositioned itself as a wellness brand focusing on unpolished staples, tea, and millets.',
    controversies: 'Under pressure to maintain low price points in salt while upgrading standards against microplastics.',
    marketStrategy: 'Acquiring wellness brands like Soulfull to capture the rising urban demand for healthy, millet-based breakfasts.'
  },
  {
    name: 'MTR Foods / Mondelez (Cadbury)',
    rank: 10,
    revenue: '₹11,500 Cr',
    brands: ['Cadbury Dairy Milk', 'Oreo', 'Bournvita', 'MTR Rava Idli'],
    logoText: 'Mondelez',
    themeColor: '#4a148c',
    textColor: '#ffffff',
    summary: 'Combined category representatives. Mondelez leads India’s sweet chocolate market, while MTR dominates instant breakfast mixes and South Indian ready meals.',
    controversies: 'Mondelez was heavily called out by nutrition activists for high sugar ratios (71% in Bournvita) and high synthetic additives.',
    marketStrategy: 'Re-labeling and reducing sugar content in child nutrition drinks, while MTR focuses on preservative-free quick meal solutions.'
  }
]

export default function Companies({ onOpen, onAdd }) {
  const [selectedCompany, setSelectedCompany] = useState(null)

  // Robust product matcher considering name variations
  const getCompanyProducts = (companyName) => {
    return products.filter((p) => {
      if (companyName === 'Amul (GCMMF)') {
        return p.company === 'Amul (GCMMF)' || p.company === 'GCMMF'
      }
      if (companyName === 'MTR Foods / Mondelez (Cadbury)') {
        return p.company === 'MTR Foods / Mondelez (Cadbury)' || p.company === 'Mondelez India'
      }
      return p.company === companyName
    })
  }

  // Calculate dynamic metrics for each company based on active products
  const computedCompanies = useMemo(() => {
    return companyList.map((company) => {
      const companyProducts = getCompanyProducts(company.name)
      const count = companyProducts.length
      const scoreSum = companyProducts.reduce((sum, p) => sum + p.score, 0)
      const avgScore = count > 0 ? Math.round(scoreSum / count) : 0

      // Grade calculation based on avgScore
      let grade = 'N/A'
      if (count > 0) {
        if (avgScore >= 80) grade = 'A'
        else if (avgScore >= 70) grade = 'B'
        else if (avgScore >= 50) grade = 'C'
        else if (avgScore >= 30) grade = 'D'
        else grade = 'E'
      }

      return {
        ...company,
        productsCount: count,
        avgScore,
        grade,
        companyProducts
      }
    })
  }, [])

  const currentCompanyDetails = useMemo(() => {
    if (!selectedCompany) return null
    return computedCompanies.find((c) => c.name === selectedCompany)
  }, [selectedCompany, computedCompanies])

  const ScoreBadge = ({ score, grade }) => {
    const tone = score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor'
    return (
      <div className={`score-badge ${tone}`}>
        <strong>{grade}</strong>
        <span>{score}</span>
      </div>
    )
  }

  const ProductCard = ({ product }) => {
    const topConcern = product.concerns[0]
    return (
      <article className="product-card">
        <button className="product-main" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
          <div className="card-pack-wrap">
            <ProductPack product={product} />
            <ScoreBadge score={product.score} grade={product.grade} />
          </div>
          <div className="product-copy">
            <span className="eyebrow">{product.brand}</span>
            <h3>{product.name}</h3>
            <p>{product.category} · {product.size}</p>
            {topConcern ? (
              <div className={`concern-pill ${topConcern.level}`}>
                <ShieldAlert size={12} />
                <span>{topConcern.name}</span>
              </div>
            ) : (
              <div className="concern-pill low">
                <Check size={12} />
                <span>Clean Label</span>
              </div>
            )}
          </div>
        </button>
        <div className="product-footer">
          <div className="footer-price-info">
            <strong>₹{product.price}</strong>
            <span>est. retail</span>
          </div>
          <button className="icon-button add" onClick={() => onAdd(product)} aria-label={`Add ${product.name}`}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
          </button>
        </div>
      </article>
    )
  }

  if (currentCompanyDetails) {
    const comp = currentCompanyDetails
    const scoreTone = comp.avgScore >= 75 ? 'good' : comp.avgScore >= 50 ? 'fair' : 'poor'

    return (
      <main className="companies-view animated-fade-in">
        <button className="text-button back" onClick={() => setSelectedCompany(null)}>
          <ArrowLeft size={17} /> Back to parent directory
        </button>

        <section className="company-detail-page">
          <header className="company-detail-header" style={{ borderLeft: `6px solid ${comp.themeColor}` }}>
            <div className="company-title-row">
              <div className="company-logo-avatar" style={{ backgroundColor: comp.themeColor, color: comp.textColor }}>
                {comp.logoText.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="company-detail-rank">🏆 FMCG Rank #{comp.rank}</span>
                <h1>{comp.name}</h1>
                <p>Est. Annual Indian Revenue: <strong>{comp.revenue}</strong></p>
              </div>
            </div>
            
            <div className="company-score-panel">
              <div className={`company-score-ring ${scoreTone}`}>
                <strong>{comp.grade}</strong>
                <span>{comp.avgScore} index</span>
              </div>
              <div className="company-score-copy">
                <strong>Dynamic Health Rating</strong>
                <p>Calculated as the average audit score of all associated products in our registry.</p>
              </div>
            </div>
          </header>

          <div className="company-grid-layout">
            <div className="company-info-panel">
              <article className="panel">
                <h3>Corporate Profile</h3>
                <p>{comp.summary}</p>
              </article>

              <article className="panel">
                <h3><AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#d97706' }} /> Nutritional Controversies</h3>
                <p>{comp.controversies}</p>
              </article>

              <article className="panel">
                <h3><TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: '#0f766e' }} /> Market Strategy Shift</h3>
                <p>{comp.marketStrategy}</p>
              </article>
            </div>

            <div className="company-products-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Corporate Shelf</span>
                  <h2>Packaged Products ({comp.companyProducts.length} verified)</h2>
                </div>
              </div>

              {comp.companyProducts.length > 0 ? (
                <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {comp.companyProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="empty-state-card">
                  <Store size={36} />
                  <h3>No products cataloged yet</h3>
                  <p>We are actively laboratory auditing and adding products from this company soon.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="companies-view">
      <section className="explore-head">
        <div>
          <span className="eyebrow">Conglomerate Auditor</span>
          <h1>Corporate Parent Companies</h1>
          <p>Examine the market dominance, dynamic health score grades, and processed food portfolios of the top 10 food giants dominating India's supermarket shelves.</p>
        </div>
        <div className="explore-stat">
          <strong>10</strong>
          <span>major food conglomerates</span>
          <div>
            <Sparkles size={15} /> Fully dynamic auditing
          </div>
        </div>
      </section>

      <section className="company-card-grid">
        {computedCompanies.map((comp) => {
          const scoreTone = comp.avgScore >= 75 ? 'good' : comp.avgScore >= 50 ? 'fair' : 'poor'
          return (
            <article 
              key={comp.name} 
              className="company-card clickable-card"
              onClick={() => setSelectedCompany(comp.name)}
            >
              <div className="company-card-header">
                <div className="company-avatar" style={{ backgroundColor: comp.themeColor, color: comp.textColor }}>
                  {comp.logoText}
                </div>
                <div className={`score-badge ${scoreTone}`} title="Average Health Grade">
                  <strong>{comp.grade}</strong>
                  <span>{comp.avgScore}</span>
                </div>
              </div>

              <div className="company-card-body">
                <span className="company-rank-badge">FMCG Rank #{comp.rank}</span>
                <h2>{comp.name}</h2>
                <p className="company-summary">{comp.summary}</p>
                
                <div className="company-card-footer">
                  <div className="brand-tags">
                    <strong>Core Brands:</strong>
                    <span>{comp.brands.join(' · ')}</span>
                  </div>
                  <div className="company-revenue-pill">
                    <strong>Revenue:</strong> {comp.revenue}
                  </div>
                </div>
              </div>

              <div className="company-card-action">
                <span>Inspect Corporate Shelf ({comp.productsCount} items)</span>
                <ArrowRight size={14} />
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
