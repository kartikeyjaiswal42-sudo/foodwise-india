'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ScanBarcode, Camera, CameraOff, Zap, ZapOff, Search, Loader2, PackageSearch,
  ShieldCheck, WifiOff, History, Trash2, ArrowRight, Keyboard, Info, ScanLine,
} from 'lucide-react'
import { products, findByBarcode } from '../data/foodDatabase'
import {
  lookupBarcode, isValidBarcode, attachAlternative, recentScans, clearScanHistory,
} from '../lib/offLookup'
import ProductPack from './ProductPack'

// EAN-13 / EAN-8 cover practically every Indian retail pack; the rest are for
// imported goods and the odd Code-128 shelf label.
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'itf', 'codabar']

// A single frame is a weak signal — motion blur and glare produce misreads. We
// only accept a code seen on CONSECUTIVE frames, which costs ~200 ms and removes
// essentially all false positives.
const CONFIRM_FRAMES = 2

export default function BarcodeScanner({ onOpen, onNavigate }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const runningRef = useRef(false)
  const lastSeen = useRef({ code: null, hits: 0 })

  const [support, setSupport] = useState('checking') // checking | ok | unsupported
  const [camera, setCamera] = useState('idle')       // idle | starting | live | denied | error
  const [cameraMsg, setCameraMsg] = useState('')
  const [torch, setTorch] = useState({ available: false, on: false })
  const [status, setStatus] = useState(null)         // lookup status object
  const [busy, setBusy] = useState(false)
  const [manual, setManual] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    setSupport(typeof window !== 'undefined' && 'BarcodeDetector' in window ? 'ok' : 'unsupported')
    setHistory(recentScans())
  }, [])

  /* ---------------- lookup ---------------- */

  const resolve = useCallback(async (code) => {
    setBusy(true)
    setStatus(null)

    // 1. Local catalog first — instant, works offline, and carries our curated
    //    swap data. Only fall through to the network on a miss.
    const local = findByBarcode(code)
    if (local) {
      setBusy(false)
      stop()
      onOpen?.(local)
      return
    }

    // 2. Live Open Food Facts.
    const res = await lookupBarcode(code)
    setBusy(false)

    if (res.status === 'found') {
      attachAlternative(res.product, products)
      setHistory(recentScans())
      stop()
      onOpen?.(res.product)
      return
    }
    setStatus({ ...res, code })
  }, [onOpen])

  /* ---------------- camera ---------------- */

  const stop = useCallback(() => {
    runningRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const s = streamRef.current
    if (s) { s.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    setCamera('idle')
    setTorch({ available: false, on: false })
  }, [])

  // Stopping the tracks on unmount is load-bearing: without it the camera stays
  // on (and the phone's privacy light stays lit) after leaving the view.
  useEffect(() => stop, [stop])

  const tick = useCallback(async () => {
    if (!runningRef.current) return
    const video = videoRef.current
    const det = detectorRef.current
    if (video && det && video.readyState >= 2) {
      try {
        const codes = await det.detect(video)
        const hit = codes.find((c) => isValidBarcode(c.rawValue))
        if (hit) {
          const val = hit.rawValue.trim()
          if (lastSeen.current.code === val) lastSeen.current.hits += 1
          else lastSeen.current = { code: val, hits: 1 }

          if (lastSeen.current.hits >= CONFIRM_FRAMES) {
            lastSeen.current = { code: null, hits: 0 }
            if (navigator.vibrate) navigator.vibrate(60)
            runningRef.current = false
            resolve(val)
            return
          }
        }
      } catch { /* a dropped frame is normal; keep scanning */ }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [resolve])

  const start = useCallback(async () => {
    setStatus(null)
    setCamera('starting')
    setCameraMsg('')
    try {
      detectorRef.current = new window.BarcodeDetector({ formats: FORMATS })
    } catch {
      // Some builds ship the constructor but reject our format list.
      try { detectorRef.current = new window.BarcodeDetector() } catch {
        setSupport('unsupported'); setCamera('idle'); return
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        // iOS needs both of these set before play() or it opens a fullscreen player.
        video.setAttribute('playsinline', 'true')
        video.muted = true
        await video.play().catch(() => {})
      }

      const track = stream.getVideoTracks()[0]
      const caps = track?.getCapabilities?.() || {}
      setTorch({ available: !!caps.torch, on: false })

      setCamera('live')
      runningRef.current = true
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      const name = err?.name || ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCamera('denied')
        setCameraMsg('Camera permission was blocked. Allow it in your browser’s site settings, or type the number below.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCamera('error')
        setCameraMsg('No camera found on this device. Type the barcode number instead.')
      } else {
        setCamera('error')
        setCameraMsg('Could not start the camera. Type the barcode number instead.')
      }
    }
  }, [tick])

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks?.()[0]
    if (!track) return
    const next = !torch.on
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] })
      setTorch((t) => ({ ...t, on: next }))
    } catch { /* torch unsupported despite advertising it */ }
  }

  const submitManual = (e) => {
    e.preventDefault()
    const code = manual.trim()
    if (isValidBarcode(code)) resolve(code)
    else setStatus({ status: 'error', reason: 'Enter the 8–14 digit number printed under the barcode.', code })
  }

  /* ---------------- render ---------------- */

  return (
    <main className="scanner-view">
      <section className="scanner-hero">
        <div className="scanner-hero-icon"><ScanBarcode size={34} /></div>
        <div>
          <span className="eyebrow">Point and know</span>
          <h1>Scan any barcode</h1>
          <p>
            Point your camera at the barcode on any packet. Jaano checks its own catalog first,
            then <strong>Open Food Facts</strong> — so you are not limited to the 887 products we ship.
            You get the same score, the same additive breakdown, the same organ map.
          </p>
        </div>
      </section>

      {/* ---------- camera ---------- */}
      <section className="panel scan-camera-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Step 1</span>
            <h2>Scan the pack</h2>
          </div>
          {camera === 'live' && torch.available && (
            <button className="secondary-button" onClick={toggleTorch}>
              {torch.on ? <ZapOff size={15} /> : <Zap size={15} />} {torch.on ? 'Light off' : 'Light on'}
            </button>
          )}
        </div>

        <div className={`scan-stage ${camera === 'live' ? 'live' : ''}`}>
          <video ref={videoRef} className="scan-video" playsInline muted />

          {camera === 'live' && (
            <div className="scan-reticle" aria-hidden="true">
              <span /><span /><span /><span />
              <div className="scan-laser" />
            </div>
          )}

          {camera !== 'live' && (
            <div className="scan-placeholder">
              {camera === 'starting' ? (
                <>
                  <Loader2 size={30} className="spin" />
                  <strong>Starting camera…</strong>
                  <p>Allow camera access when your browser asks.</p>
                </>
              ) : support === 'unsupported' ? (
                <>
                  <Keyboard size={30} />
                  <strong>Live scanning isn’t available in this browser</strong>
                  <p>
                    Camera barcode detection needs Chrome or Edge (Android or desktop).
                    On iPhone, use your Camera app to read the number, then type it below —
                    everything after that works exactly the same.
                  </p>
                </>
              ) : camera === 'denied' || camera === 'error' ? (
                <>
                  <CameraOff size={30} />
                  <strong>{camera === 'denied' ? 'Camera blocked' : 'Camera unavailable'}</strong>
                  <p>{cameraMsg}</p>
                  <button className="secondary-button" onClick={start}>Try again</button>
                </>
              ) : (
                <>
                  <Camera size={30} />
                  <strong>Camera is off</strong>
                  <p>Nothing is recorded. The video never leaves your phone — only the barcode number is looked up.</p>
                  <button className="primary-button" onClick={start}><Camera size={16} /> Start camera</button>
                </>
              )}
            </div>
          )}

          {busy && (
            <div className="scan-busy">
              <Loader2 size={26} className="spin" />
              <strong>Looking this pack up…</strong>
            </div>
          )}
        </div>

        {camera === 'live' && (
          <div className="scan-live-row">
            <span className="scan-live-dot" /> Scanning — hold the barcode inside the frame
            <button className="secondary-button" onClick={stop}><CameraOff size={15} /> Stop</button>
          </div>
        )}
      </section>

      {/* ---------- manual entry ---------- */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{support === 'unsupported' ? 'Step 1' : 'Or type it'}</span>
            <h2>Enter the barcode number</h2>
          </div>
          <span className="helper-click-badge">The digits printed under the bars</span>
        </div>
        <form className="scan-manual" onSubmit={submitManual}>
          <label className="search-field">
            <Search size={17} />
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              pattern="\d*"
              maxLength={14}
              placeholder="e.g. 8901262071864"
              aria-label="Barcode number"
            />
          </label>
          <button className="primary-button" type="submit" disabled={!isValidBarcode(manual) || busy}>
            <PackageSearch size={16} /> Look up
          </button>
        </form>
        <div className="scan-try-row">
          <span>Try one from our catalog:</span>
          {products.slice(0, 3).map((p) => {
            const code = p.id.replace(/^off-/, '')
            return (
              <button key={p.id} onClick={() => { setManual(code); resolve(code) }}>{code}</button>
            )
          })}
        </div>
      </section>

      {/* ---------- lookup outcome ---------- */}
      {status && <ScanOutcome status={status} onNavigate={onNavigate} onRetry={() => { setStatus(null); start() }} />}

      {/* ---------- recent scans ---------- */}
      {history.length > 0 && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow"><History size={13} /> Saved on this device</span>
              <h2>Recently scanned</h2>
            </div>
            <button
              className="secondary-button"
              onClick={() => { clearScanHistory(); setHistory([]) }}
            >
              <Trash2 size={15} /> Clear
            </button>
          </div>
          <div className="scanner-clean-grid">
            {history.map((p) => (
              <button key={p.id} className="scanner-clean-card" onClick={() => onOpen?.(attachAlternative(p, products))}>
                <ProductPack product={p} compact />
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.brand} · score {p.score}</small>
                </div>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
          <p className="scan-foot-note">
            <Info size={13} /> Cached so a repeat scan works with no signal — useful inside a shop.
          </p>
        </section>
      )}

      <section className="panel evidence-note">
        <ShieldCheck size={24} />
        <div>
          <h2>The camera feed never leaves your phone</h2>
          <p>
            Barcode detection runs on-device in your browser. Only the resulting number is sent to
            Open Food Facts (an open, non-profit food database) to fetch that product’s label.
            No account, no tracking, no images uploaded.
          </p>
        </div>
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Outcome panel — a miss must lead somewhere useful                  */
/* ------------------------------------------------------------------ */
function ScanOutcome({ status, onNavigate, onRetry }) {
  if (status.status === 'not-found') {
    return (
      <section className="panel scan-outcome miss">
        <PackageSearch size={26} />
        <div>
          <h2>Not in Open Food Facts yet</h2>
          <p>
            Barcode <code>{status.code}</code> isn’t in the open database. Indian coverage is
            crowd-sourced and still patchy — this is common for regional and newly-launched packs.
          </p>
          <p><strong>You can still get the full breakdown:</strong> type the pack’s printed
            ingredient list into the label decoder and Jaano will audit every additive on it.</p>
          <div className="scan-outcome-actions">
            <button className="primary-button" onClick={() => onNavigate?.('scanner')}>
              <ScanLine size={16} /> Decode its ingredient list
            </button>
            <button className="secondary-button" onClick={onRetry}>Scan another</button>
          </div>
        </div>
      </section>
    )
  }

  if (status.status === 'offline') {
    return (
      <section className="panel scan-outcome offline">
        <WifiOff size={26} />
        <div>
          <h2>You’re offline</h2>
          <p>{status.reason} Previously scanned packs still open instantly — everything else needs one moment of signal.</p>
          <button className="secondary-button" onClick={onRetry}>Try again</button>
        </div>
      </section>
    )
  }

  return (
    <section className="panel scan-outcome error">
      <Info size={26} />
      <div>
        <h2>That didn’t work</h2>
        <p>{status.reason}</p>
        <button className="secondary-button" onClick={onRetry}>Try again</button>
      </div>
    </section>
  )
}
