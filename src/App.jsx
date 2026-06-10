import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Home,
  Leaf,
  Menu,
  ScanLine,
  Search,
  Star,
  Store,
  X,
  Sparkles,
} from 'lucide-react'

// Import databases
import { products } from './data/foodDatabase'

// Import modular components
import Dashboard from './components/Dashboard'
import Explore from './components/Explore'
import Diary from './components/Diary'
import IngredientGuide from './components/IngredientGuide'
import ProductDetail from './components/ProductDetail'
import AddFoodModal from './components/AddFoodModal'

const navItems = [
  { id: 'home', label: 'Today', icon: Home },
  { id: 'explore', label: 'Explore Foods', icon: Search },
  { id: 'diary', label: 'My Food Diary', icon: CalendarDays },
  { id: 'ingredients', label: 'Ingredient Guide', icon: BookOpen },
]

// Generate dynamic dates for mock historical logging
const todayStr = new Date().toISOString().split('T')[0]
const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const twoDaysAgoStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const initialLog = [
  { id: 'log-1', date: todayStr, productId: 'cornflakes', servings: 1.5, time: '8:20 AM' },
  { id: 'log-2', date: todayStr, productId: 'kool', servings: 1, time: '11:40 AM' },
  { id: 'log-3', date: todayStr, productId: 'lays', servings: 1, time: '4:10 PM' },
  
  { id: 'log-4', date: yesterdayStr, productId: 'maggi', servings: 1, time: '1:30 PM' },
  { id: 'log-5', date: yesterdayStr, productId: 'coke', servings: 1, time: '4:00 PM' },
  
  { id: 'log-6', date: twoDaysAgoStr, productId: 'kurkure', servings: 1, time: '5:20 PM' }
]

export default function App() {
  const [view, setView] = useState('home')
  const [activeDate, setActiveDate] = useState(todayStr)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addTarget, setAddTarget] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')

  // Load log state from LocalStorage or fall back to rich history
  const [log, setLog] = useState(() => {
    try {
      const saved = localStorage.getItem('jaano-food-log-v2')
      return saved ? JSON.parse(saved) : initialLog
    } catch {
      return initialLog
    }
  })

  // Synchronize logs to LocalStorage
  useEffect(() => {
    localStorage.setItem('jaano-food-log-v2', JSON.stringify(log))
  }, [log])

  // Calculate daily totals for the currently active date
  const activeDateTotals = useMemo(() => {
    const activeLogs = log.filter((item) => item.date === activeDate)
    return activeLogs.reduce(
      (sum, item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          sum.sugar += (product.nutrients.sugar || 0) * item.servings
          sum.sodium += (product.nutrients.sodium || 0) * item.servings
          sum.satFat += (product.nutrients.satFat || 0) * item.servings
        }
        return sum
      },
      { sugar: 0, sodium: 0, satFat: 0 }
    )
  }, [log, activeDate])

  const navigate = (nextView) => {
    setView(nextView)
    setSelectedProduct(null)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openProduct = (product) => {
    setSelectedProduct(product)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openAdd = (product) => {
    setAddTarget(product || null)
    setShowAdd(true)
  }

  const addFood = (product, servings = 1) => {
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const newEntry = {
      id: `log-${Date.now()}`,
      date: activeDate,
      productId: product.id,
      servings,
      time,
    }
    setLog((current) => [...current, newEntry])
    setShowAdd(false)
    setAddTarget(null)
    setQuery('')
    setToast(`${product.name} logged on ${activeDate === todayStr ? 'today' : activeDate}`)
    setTimeout(() => setToast(''), 2600)
  }

  const deleteLog = (logId) => {
    setLog((current) => current.filter((item) => item.id !== logId))
    setToast('Log entry removed')
    setTimeout(() => setToast(''), 2000)
  }

  const renderView = () => {
    if (selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAdd={openAdd}
          onOpen={openProduct}
        />
      )
    }

    switch (view) {
      case 'explore':
        return (
          <Explore
            query={query}
            setQuery={setQuery}
            onOpen={openProduct}
            onAdd={openAdd}
          />
        )
      case 'diary':
        return (
          <Diary
            log={log}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            onAdd={openAdd}
            onOpen={openProduct}
            onDeleteLog={deleteLog}
          />
        )
      case 'ingredients':
        return <IngredientGuide />
      case 'home':
      default:
        return (
          <Dashboard
            totals={activeDateTotals}
            log={log.filter((item) => item.date === activeDate)}
            onAdd={openAdd}
            onOpen={openProduct}
            onNavigate={navigate}
          />
        )
    }
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <button className="logo" onClick={() => navigate('home')}>
          <span>
            <Leaf size={19} />
          </span>
          jaano
          <small>food clarity</small>
        </button>
        <nav>
          <span className="nav-label">Your health dashboard</span>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={view === item.id && !selectedProduct ? 'active' : ''}
                onClick={() => navigate(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
          <span className="nav-label">Discover</span>
          <button onClick={() => navigate('explore')}>
            <Store size={18} />
            Companies list
          </button>
          <button onClick={() => { navigate('explore'); setQuery('millet') }}>
            <Star size={18} />
            Healthy Swaps
          </button>
        </nav>
        
        <div className="side-card">
          <div>
            <Sparkles size={17} />
          </div>
          <strong>Scan Pack Ingredients</strong>
          <p>Instantly audit chemicals and additives on packaging.</p>
          <button onClick={() => navigate('explore')}>
            <ScanLine size={15} /> Scan barcode
          </button>
        </div>
        
        <div className="profile-mini">
          <span>KK</span>
          <div>
            <strong>Kartikey</strong>
            <small>Active Streak · 6 Days</small>
          </div>
        </div>
      </aside>

      {/* Main Body Column */}
      <div className="app-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Open sidebar menu">
            <Menu size={20} />
          </button>
          <label className="search-field header-search">
            <Search size={17} />
            <input
              value={query}
              onFocus={() => navigate('explore')}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Indian products or ingredients"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button className="icon-button" onClick={() => navigate('ingredients')} title="Help Guide">
              <CircleHelp size={18} />
            </button>
            <button className="avatar">KK</button>
          </div>
        </header>
        
        <div className="content">{renderView()}</div>
      </div>

      {/* Modals & Portals */}
      {showAdd && (
        <AddFoodModal
          products={products}
          initialProduct={addTarget}
          onClose={() => {
            setShowAdd(false)
            setAddTarget(null)
            setQuery('')
          }}
          onAdd={addFood}
        />
      )}
      
      {toast && (
        <div className="toast animated-fade-in">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      
      {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)} />}
    </div>
  )
}
