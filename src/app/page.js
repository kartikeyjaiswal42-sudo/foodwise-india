'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, CalendarDays, CheckCircle2, CircleHelp, Home, HeartPulse,
  Leaf, Menu, ScanLine, Search, Star, Store, Sparkles,
} from 'lucide-react'

import { products } from '../data/foodDatabase'
import { computePlan, DEFAULT_LIMITS } from '../lib/health'

import Dashboard from '../components/Dashboard'
import Explore from '../components/Explore'
import Diary from '../components/Diary'
import IngredientGuide from '../components/IngredientGuide'
import ProductDetail from '../components/ProductDetail'
import AddFoodModal from '../components/AddFoodModal'
import Companies from '../components/Companies'
import Profile from '../components/Profile'

const navItems = [
  { id: 'home', label: 'Today', icon: Home },
  { id: 'explore', label: 'Explore Foods', icon: Search },
  { id: 'diary', label: 'My Food Diary', icon: CalendarDays },
  { id: 'profile', label: 'My Health & Goals', icon: HeartPulse },
  { id: 'ingredients', label: 'Ingredient Guide', icon: BookOpen },
]

const todayStr = new Date().toISOString().split('T')[0]

export default function Page() {
  const [view, setView] = useState('home')
  const [activeDate, setActiveDate] = useState(todayStr)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addTarget, setAddTarget] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')
  const [log, setLog] = useState([])
  const [profile, setProfile] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage AFTER mount (so static prerender has no window access)
  useEffect(() => {
    try {
      const savedLog = localStorage.getItem('jaano-food-log-v2')
      if (savedLog) setLog(JSON.parse(savedLog))
      const savedProfile = localStorage.getItem('jaano-profile-v1')
      if (savedProfile) setProfile(JSON.parse(savedProfile))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('jaano-food-log-v2', JSON.stringify(log))
  }, [log, hydrated])

  // Personalised daily ceilings (falls back to sensible defaults with no profile)
  const limits = useMemo(() => computePlan(profile)?.limits || DEFAULT_LIMITS, [profile])

  const activeDateTotals = useMemo(() => {
    const activeLogs = log.filter((item) => item.date === activeDate)
    return activeLogs.reduce(
      (sum, item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          sum.sugar += (product.nutrients.sugar || 0) * item.servings
          sum.sodium += (product.nutrients.sodium || 0) * item.servings
          sum.satFat += (product.nutrients.satFat || 0) * item.servings
          sum.calories += (product.calories || 0) * item.servings
        }
        return sum
      },
      { sugar: 0, sodium: 0, satFat: 0, calories: 0 }
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
    const newEntry = { id: `log-${Date.now()}`, date: activeDate, productId: product.id, servings, time }
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

  const saveProfile = (p) => {
    setProfile(p)
    try { localStorage.setItem('jaano-profile-v1', JSON.stringify(p)) } catch { /* ignore */ }
    setToast('Health profile saved — your diary targets are updated')
    setTimeout(() => setToast(''), 2800)
  }

  const renderView = () => {
    if (selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAdd={openAdd}
          onOpen={openProduct}
          limits={limits}
        />
      )
    }
    switch (view) {
      case 'explore':
        return <Explore query={query} setQuery={setQuery} onOpen={openProduct} onAdd={openAdd} />
      case 'diary':
        return (
          <Diary log={log} activeDate={activeDate} setActiveDate={setActiveDate}
            onAdd={openAdd} onOpen={openProduct} onDeleteLog={deleteLog} limits={limits} />
        )
      case 'profile':
        return <Profile profile={profile} onSave={saveProfile} />
      case 'ingredients':
        return <IngredientGuide />
      case 'companies':
        return <Companies onOpen={openProduct} onAdd={openAdd} />
      case 'home':
      default:
        return (
          <Dashboard
            totals={activeDateTotals}
            log={log.filter((item) => item.date === activeDate)}
            onAdd={openAdd} onOpen={openProduct} onNavigate={navigate}
            limits={limits} profile={profile}
          />
        )
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <button className="logo" onClick={() => navigate('home')}>
          <span><Leaf size={19} /></span>
          jaano
          <small>food clarity</small>
        </button>
        <nav>
          <span className="nav-label">Your health dashboard</span>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id}
                className={view === item.id && !selectedProduct ? 'active' : ''}
                onClick={() => navigate(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
          <span className="nav-label">Discover</span>
          <button className={view === 'companies' && !selectedProduct ? 'active' : ''} onClick={() => navigate('companies')}>
            <Store size={18} /> Companies list
          </button>
          <button onClick={() => { navigate('explore'); setQuery('') }}>
            <Star size={18} /> Healthy Swaps
          </button>
        </nav>

        <div className="side-card">
          <div><Sparkles size={17} /></div>
          <strong>Scan Pack Ingredients</strong>
          <p>Instantly audit chemicals and additives on packaging.</p>
          <button onClick={() => navigate('explore')}><ScanLine size={15} /> Scan barcode</button>
        </div>

        <div className="profile-mini">
          <span>KK</span>
          <div>
            <strong>Kartikey</strong>
            <small>{profile ? `BMI ${computePlan(profile)?.bmi ?? '—'} · ${profile.goal}` : 'Set your health goal'}</small>
          </div>
        </div>
      </aside>

      <div className="app-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Open sidebar menu">
            <Menu size={20} />
          </button>
          <label className="search-field header-search">
            <Search size={17} />
            <input value={query} onFocus={() => navigate('explore')}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Indian products or ingredients" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button className="icon-button" onClick={() => navigate('profile')} title="My Health">
              <HeartPulse size={18} />
            </button>
            <button className="icon-button" onClick={() => navigate('ingredients')} title="Help Guide">
              <CircleHelp size={18} />
            </button>
            <button className="avatar">KK</button>
          </div>
        </header>

        <div className="content">{renderView()}</div>
      </div>

      {showAdd && (
        <AddFoodModal products={products} initialProduct={addTarget}
          onClose={() => { setShowAdd(false); setAddTarget(null); setQuery('') }}
          onAdd={addFood} />
      )}

      {toast && (
        <div className="toast animated-fade-in">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {mobileNav && <div className="mobile-scrim" onClick={() => setMobileNav(false)} />}
    </div>
  )
}
