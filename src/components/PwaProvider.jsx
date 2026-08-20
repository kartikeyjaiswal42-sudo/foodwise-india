'use client'
import { useEffect, useState } from 'react'
import { Download, X, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const DISMISS_KEY = 'jaano-install-dismissed-v1'

/**
 * Registers the service worker and owns the three ambient PWA affordances:
 * install prompt, offline banner, and update-available toast.
 *
 * Deliberately renders nothing until something is actually worth saying — a
 * food app is used one-handed in a shop aisle, so persistent chrome costs real
 * screen space.
 */
export default function PwaProvider() {
  const [installEvent, setInstallEvent] = useState(null)
  const [offline, setOffline] = useState(false)
  const [updateReady, setUpdateReady] = useState(null)
  const [installed, setInstalled] = useState(false)

  /* ---------- service worker ---------- */
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    // A service worker needs a secure context; GitHub Pages is HTTPS and
    // localhost is treated as secure, so no extra guard is required.
    let reg
    navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` })
      .then((r) => {
        reg = r
        // A worker already waiting means a newer build is sitting behind this tab.
        if (r.waiting) setUpdateReady(r.waiting)
        r.addEventListener('updatefound', () => {
          const sw = r.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            // `controller` is null on the very first install — that is a fresh
            // install, not an update, and must not raise an update toast.
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(sw)
            }
          })
        })
      })
      .catch(() => { /* offline first load, or SW unsupported */ })

    // Tell the worker which hashed build assets this page actually loaded, so it
    // can cache them. They are requested before the worker takes control on a
    // first visit, so without this handshake an offline launch never hydrates.
    const warm = () => {
      const ctrl = navigator.serviceWorker.controller
      if (!ctrl) return
      // Resource timing, not a DOM query: Next loads several route chunks
      // (app/layout, app/page, shared vendor splits) through webpack rather than
      // as <script src> tags, so a DOM scan silently missed exactly the chunks
      // needed to hydrate — the app still died offline with a warm-looking cache.
      const urls = performance.getEntriesByType('resource')
        .filter((e) => (e.initiatorType === 'script' || e.initiatorType === 'link'
          || e.initiatorType === 'fetch' || e.initiatorType === 'other')
          && e.name.startsWith(window.location.origin)
          && /\/_next\/static\/.+\.(js|css)$/.test(e.name))
        .map((e) => e.name)
      if (urls.length) ctrl.postMessage({ type: 'CACHE_ASSETS', urls })
    }
    navigator.serviceWorker.ready.then(warm).catch(() => {})
    navigator.serviceWorker.addEventListener('controllerchange', warm)
    // Hydration and lazy route chunks land after the first pass, so sweep once
    // more when the page has settled. Re-sending known URLs is cheap: the worker
    // skips anything already cached.
    const settle = setTimeout(warm, 4000)
    window.addEventListener('load', warm)

    return () => {
      reg = undefined
      clearTimeout(settle)
      window.removeEventListener('load', warm)
      navigator.serviceWorker.removeEventListener('controllerchange', warm)
    }
  }, [])

  /* ---------- online / offline ---------- */
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  /* ---------- install prompt ---------- */
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault() // keep the event so we can trigger it from our own button
      try { if (localStorage.getItem(DISMISS_KEY)) return } catch { /* ignore */ }
      setInstallEvent(e)
    }
    const onInstalled = () => { setInstalled(true); setInstallEvent(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!installEvent) return
    installEvent.prompt()
    const { outcome } = await installEvent.userChoice.catch(() => ({ outcome: 'dismissed' }))
    if (outcome === 'accepted') setInstalled(true)
    setInstallEvent(null)
  }

  const dismissInstall = () => {
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    setInstallEvent(null)
  }

  const applyUpdate = () => {
    updateReady?.postMessage?.({ type: 'SKIP_WAITING' })
    // The generated worker calls skipWaiting() during install, so the new build
    // is already active; a reload is all that is needed to run it.
    window.location.reload()
  }

  return (
    <>
      {offline && (
        <div className="pwa-offline-bar" role="status">
          <WifiOff size={15} />
          Offline — showing your saved catalog. Scans of new packs need a signal.
        </div>
      )}

      {updateReady && (
        <div className="pwa-toast" role="status">
          <RefreshCw size={17} />
          <div>
            <strong>A newer version of Jaano is ready</strong>
            <small>Includes the latest product and additive data.</small>
          </div>
          <button className="primary-button" onClick={applyUpdate}>Refresh</button>
        </div>
      )}

      {installEvent && !installed && (
        <div className="pwa-install" role="dialog" aria-label="Install Jaano">
          <div className="pwa-install-icon"><Download size={19} /></div>
          <div className="pwa-install-text">
            <strong>Install Jaano on your phone</strong>
            <small>Opens instantly, works offline in the shop, and scans straight from the home screen.</small>
          </div>
          <button className="primary-button" onClick={install}>Install</button>
          <button className="icon-button pwa-install-close" onClick={dismissInstall} aria-label="Not now">
            <X size={17} />
          </button>
        </div>
      )}

      {installed && (
        <div className="pwa-toast success" role="status">
          <CheckCircle2 size={17} />
          <div><strong>Installed — find Jaano on your home screen</strong></div>
        </div>
      )}
    </>
  )
}
