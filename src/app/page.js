'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, CalendarDays, CheckCircle2, CircleHelp, Home, HeartPulse,
  Leaf, Menu, ScanLine, Search, Store, Sparkles, Activity,
  GitCompareArrows, Ban, ScanBarcode, Camera, ChefHat, TrendingUp,
  Utensils, Star, ShieldQuestion,
} from 'lucide-react'

import { products, loadCatalog } from '../data/foodDatabase'
import { computePlan, DEFAULT_LIMITS } from '../lib/health'
import { applyConditions, conditionRules } from '../lib/conditions'
import { dayKey } from '../lib/trends'

import Dashboard from '../components/Dashboard'
import Explore from '../components/Explore'
import Diary from '../components/Diary'
import IngredientGuide from '../components/IngredientGuide'
import ProductDetail from '../components/ProductDetail'
import AddFoodModal from '../components/AddFoodModal'
import Companies from '../components/Companies'
import Profile from '../components/Profile'
import HealthySwaps from '../components/HealthySwaps'
import BodyToxicity from '../components/BodyToxicity'
import LabelScanner from '../components/LabelScanner'
import Compare from '../components/Compare'
import AvoidList from '../components/AvoidList'
import BarcodeScanner from '../components/BarcodeScanner'
import MealCamera from '../components/MealCamera'
import MealBuilder from '../components/MealBuilder'
import DishBrowser from '../components/DishBrowser'
import Trends from '../components/Trends'
import SectionTabs from '../components/SectionTabs'
import { AVOID_STORAGE_KEY } from '../lib/avoidList'

/* --------------------------------------------------------------------------
 * Navigation
 *
 * Six sections, each holding one or more views. The sidebar lists SECTIONS; the
 * views inside one appear as tabs above the content. This is what kept the menu
 * from growing to sixteen entries when four features landed at once.
 * ------------------------------------------------------------------------ */

const SECTIONS = [
  {
    id: 'today', label: 'Today', icon: Home, group: 'Your day',
    views: [{ id: 'home', label: 'Today', icon: Home }],
  },
  {
    id: 'log', label: 'Log a meal', icon: Utensils, group: 'Your day',
    views: [
      { id: 'meal-photo', label: 'From a photo', icon: Camera },
      { id: 'meal-out', label: 'Eating out', icon: Store },
      { id: 'meal-cook', label: 'Cook from scratch', icon: ChefHat },
    ],
  },
  {
    id: 'diary', label: 'My diary', icon: CalendarDays, group: 'Your day',
    views: [
      { id: 'diary', label: 'Day by day', icon: CalendarDays },
      { id: 'trends', label: 'Trends', icon: TrendingUp },
    ],
  },
  {
    id: 'foods', label: 'Packaged foods', icon: Search, group: 'Find & compare',
    views: [
      { id: 'explore', label: 'Explore', icon: Search },
      { id: 'compare', label: 'Compare', icon: GitCompareArrows },
      { id: 'swaps', label: 'Healthy swaps', icon: Star },
      { id: 'companies', label: 'Companies', icon: Store },
    ],
  },
  {
    id: 'check', label: 'Check a pack', icon: ScanBarcode, group: 'Find & compare',
    views: [
      { id: 'barcode', label: 'Scan barcode', icon: ScanBarcode },
      { id: 'scanner', label: 'Label scanner', icon: ScanLine },
      { id: 'avoid', label: 'My avoid list', icon: Ban },
    ],
  },
  {
    id: 'health', label: 'My health', icon: HeartPulse, group: 'You',
    views: [
      { id: 'profile', label: 'Health & goals', icon: HeartPulse },
      { id: 'toxicity', label: 'Body toxicity', icon: Activity },
      { id: 'ingredients', label: 'Ingredient guide', icon: BookOpen },
    ],
  },
]

const VIEW_TO_SECTION = {}
for (const s of SECTIONS) for (const v of s.views) VIEW_TO_SECTION[v.id] = s

const NAV_GROUPS = [...new Set(SECTIONS.map((s) => s.group))]

const MEAL_VIEWS = new Set(['meal-photo', 'meal-out', 'meal-cook'])

// Local date, not toISOString — UTC would file a late dinner under yesterday.
const todayStr = dayKey(new Date())

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
  const [avoid, setAvoid] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [storageWarning, setStorageWarning] = useState('')
  // 'loading' | 'ready' | 'error' — the catalog is fetched, not bundled
  const [catalog, setCatalog] = useState('loading')

  useEffect(() => {
    let alive = true
    loadCatalog()
      .then(() => { if (alive) setCatalog('ready') })
      .catch(() => { if (alive) setCatalog('error') })
    return () => { alive = false }
  }, [])

  const retryCatalog = () => {
    setCatalog('loading')
    loadCatalog().then(() => setCatalog('ready')).catch(() => setCatalog('error'))
  }

  // Hydrate from localStorage AFTER mount (so static prerender has no window access)
  useEffect(() => {
    try {
      const savedLog = localStorage.getItem('jaano-food-log-v2')
      if (savedLog) setLog(JSON.parse(savedLog))
      const savedProfile = localStorage.getItem('jaano-profile-v1')
      if (savedProfile) setProfile(JSON.parse(savedProfile))
      const savedAvoid = localStorage.getItem(AVOID_STORAGE_KEY)
      if (savedAvoid) setAvoid(JSON.parse(savedAvoid))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Meal entries carry a photo thumbnail, so the log can now grow large enough
  // to hit the ~5 MB localStorage quota. An unguarded setItem would THROW inside
  // an effect and take the app down; worse, it would do so silently from the
  // user's point of view — they would keep logging and lose everything on
  // reload. On overflow we drop the oldest thumbnails (the data is the point,
  // the pictures are decoration) and only then tell the user.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('jaano-food-log-v2', JSON.stringify(log))
      if (storageWarning) setStorageWarning('')
    } catch {
      const stripped = log.map((e) => (e.meal?.thumb ? { ...e, meal: { ...e.meal, thumb: null } } : e))
      try {
        localStorage.setItem('jaano-food-log-v2', JSON.stringify(stripped))
        setStorageWarning('Your diary filled this browser’s storage, so older meal photos were removed. All the numbers are intact.')
      } catch {
        setStorageWarning('This browser’s storage is full — new entries may not survive a reload. Delete some older diary entries.')
      }
    }
  }, [log, hydrated])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(AVOID_STORAGE_KEY, JSON.stringify(avoid)) } catch { /* ignore */ }
    }
  }, [avoid, hydrated])

  const conditions = useMemo(() => profile?.conditions || [], [profile])

  const limits = useMemo(() => {
    const base = computePlan(profile)?.limits || DEFAULT_LIMITS
    return applyConditions(base, conditions).limits
  }, [profile, conditions])

  const effectiveAvoid = useMemo(
    () => [...avoid, ...conditionRules(conditions).filter((r) => !avoid.some((a) => a.id === r.id))],
    [avoid, conditions]
  )

  /**
   * Day totals across BOTH kinds of entry.
   *
   * A meal carries its own precomputed totals rather than a product id, because
   * a meal is not in the catalog. Those totals are read back verbatim: the diary
   * is a record of what was logged, so a later correction to the dish table must
   * not retroactively rewrite what a user already recorded eating.
   */
  const activeDateTotals = useMemo(() => {
    const activeLogs = log.filter((item) => item.date === activeDate)
    return activeLogs.reduce(
      (sum, item) => {
        if (item.meal?.totals) {
          const t = item.meal.totals
          sum.sugar += t.sugar || 0
          sum.sodium += t.sodium || 0
          sum.satFat += t.satFat || 0
          sum.calories += t.kcal || 0
          return sum
        }
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

  const nowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const addFood = (product, servings = 1) => {
    const newEntry = { id: `log-${Date.now()}`, date: activeDate, productId: product.id, servings, time: nowTime() }
    setLog((current) => [...current, newEntry])
    setShowAdd(false)
    setAddTarget(null)
    setQuery('')
    setToast(`${product.name} logged on ${activeDate === todayStr ? 'today' : activeDate}`)
    setTimeout(() => setToast(''), 2600)
  }

  const addMeal = (meal) => {
    const entry = { id: `meal-${Date.now()}`, date: activeDate, time: nowTime(), meal }
    setLog((current) => [...current, entry])
    setToast(`${meal.title} logged — ${meal.kcalLow}–${meal.kcalHigh} kcal`)
    setTimeout(() => setToast(''), 3000)
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

  const activeSection = VIEW_TO_SECTION[view] || SECTIONS[0]

  const renderView = () => {
    if (catalog === 'loading') return <CatalogBoot />
    // The dish tables are bundled, so the meal features work even when the
    // packaged catalog fetch has failed. Gating them behind it would take the
    // whole app down over a file none of them read.
    if (catalog === 'error' && !MEAL_VIEWS.has(view)) return <CatalogError onRetry={retryCatalog} />
    if (selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAdd={openAdd}
          onOpen={openProduct}
          limits={limits}
          avoid={effectiveAvoid}
          conditions={conditions}
          onNavigate={navigate}
        />
      )
    }
    switch (view) {
      case 'explore':
        return <Explore query={query} setQuery={setQuery} onOpen={openProduct} onAdd={openAdd} avoid={effectiveAvoid} />
      case 'diary':
        return (
          <Diary log={log} activeDate={activeDate} setActiveDate={setActiveDate}
            onAdd={openAdd} onOpen={openProduct} onDeleteLog={deleteLog} limits={limits}
            onNavigate={navigate} />
        )
      case 'trends':
        return <Trends log={log} limits={limits} />
      case 'profile':
        return <Profile profile={profile} onSave={saveProfile} />
      case 'swaps':
        return <HealthySwaps onOpen={openProduct} onAdd={openAdd} />
      case 'ingredients':
        return <IngredientGuide />
      case 'toxicity':
        return <BodyToxicity onOpen={openProduct} log={log} />
      case 'barcode':
        return <BarcodeScanner onOpen={openProduct} onNavigate={navigate} />
      case 'scanner':
        return <LabelScanner avoid={effectiveAvoid} onOpen={openProduct} />
      case 'compare':
        return <Compare onOpen={openProduct} onAdd={openAdd} avoid={effectiveAvoid} />
      case 'avoid':
        return <AvoidList avoid={avoid} onChange={setAvoid} onOpen={openProduct} />
      case 'companies':
        return <Companies onOpen={openProduct} onAdd={openAdd} />
      case 'meal-photo':
        return <MealCamera onLogMeal={addMeal} limits={limits} activeDate={activeDate} />
      case 'meal-cook':
        return <MealBuilder onLogMeal={addMeal} limits={limits} activeDate={activeDate} />
      case 'meal-out':
        return <DishBrowser onLogMeal={addMeal} limits={limits} activeDate={activeDate} />
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
          {NAV_GROUPS.map((group) => (
            <div key={group} className="nav-group">
              <span className="nav-label">{group}</span>
              {SECTIONS.filter((s) => s.group === group).map((section) => {
                const Icon = section.icon
                const active = activeSection.id === section.id && !selectedProduct
                return (
                  <button key={section.id} className={active ? 'active' : ''}
                    onClick={() => navigate(section.views[0].id)}>
                    <Icon size={18} />
                    {section.label}
                    {section.id === 'check' && avoid.length > 0 && (
                      <span className="nav-count">{avoid.length}</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="side-card">
          <div><Camera size={17} /></div>
          <strong>Ghar ki daal or hotel ki?</strong>
          <p>Photograph your plate — Jaano tells the two apart and counts the difference.</p>
          <button onClick={() => navigate('meal-photo')}><Sparkles size={15} /> Try the meal camera</button>
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
            <button className="icon-button" onClick={() => navigate('meal-photo')} title="Log a meal from a photo">
              <Camera size={18} />
            </button>
            <button className="icon-button" onClick={() => navigate('profile')} title="My Health">
              <HeartPulse size={18} />
            </button>
            <button className="icon-button" onClick={() => navigate('ingredients')} title="Help Guide">
              <CircleHelp size={18} />
            </button>
            <button className="avatar">KK</button>
          </div>
        </header>

        <div className="content">
          {!selectedProduct && catalog !== 'loading' && (
            <SectionTabs tabs={activeSection.views} current={view} onSelect={navigate} />
          )}
          {storageWarning && (
            <div className="storage-warning">
              <ShieldQuestion size={16} /> {storageWarning}
            </div>
          )}
          {renderView()}
        </div>
      </div>

      {showAdd && (
        <AddFoodModal products={products} initialProduct={addTarget} avoid={effectiveAvoid}
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

/* ------------------------------------------------------------------ */
/*  Catalog boot states                                                */
/* ------------------------------------------------------------------ */

function CatalogBoot() {
  return (
    <main className="catalog-boot" role="status" aria-live="polite">
      <div className="catalog-boot-mark"><Leaf size={30} /></div>
      <strong>Loading the food catalog…</strong>
      <p>Indian packaged products with real labels. Cached after the first visit.</p>
      <div className="catalog-boot-bar"><span /></div>
    </main>
  )
}

function CatalogError({ onRetry }) {
  return (
    <main className="catalog-boot catalog-boot-error">
      <div className="catalog-boot-mark error"><CircleHelp size={30} /></div>
      <strong>Couldn’t load the food catalog</strong>
      <p>
        You appear to be offline and this device hasn’t cached the catalog yet.
        Connect once and Jaano will work offline from then on.
        The meal camera and dish tables still work — they don’t need this file.
      </p>
      <button className="primary-button" onClick={onRetry}>Try again</button>
    </main>
  )
}
