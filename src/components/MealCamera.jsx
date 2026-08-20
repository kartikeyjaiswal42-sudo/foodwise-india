'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera, Upload, Sparkles, KeyRound, ShieldCheck, AlertTriangle, Loader2,
  Check, Plus, RotateCcw, ExternalLink, Info, Eye, EyeOff, Trash2, Utensils,
} from 'lucide-react'
import {
  analyzeMealPhoto, prepareImage, makeThumb, getKey, setKey, looksLikeKey,
  toEstimateItem, VisionError,
} from '../lib/vision'
import { estimateMeal, confidenceNote, formatRange } from '../lib/mealEstimate'
import { dishById } from '../data/indianDishes'
import MealItemRow from './MealItemRow'
import DishPicker from './DishPicker'

/* ========================================================================== */
/*  API key setup                                                             */
/* ========================================================================== */

/**
 * The key panel says, in plain words, exactly where the key goes.
 *
 * This app is published at a public URL from a public repository, so there is
 * nowhere in it that a shared key could safely live. Rather than hide that
 * behind a vague "connect your account", the panel states the actual data path:
 * the key stays in this browser and the photo goes straight to Google. A user
 * who understands where their credential went can make a real decision about it.
 */
function KeySetup({ onSaved, existing }) {
  const [value, setValue] = useState(existing || '')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const save = () => {
    const k = value.trim()
    if (!k) { setError('Paste your key first.'); return }
    if (!looksLikeKey(k)) {
      setError('That does not look like a Google AI key — they start with “AIza” and are about 39 characters.')
      return
    }
    if (!setKey(k)) { setError('This browser is blocking storage, so the key cannot be saved.'); return }
    setError('')
    onSaved(k)
  }

  return (
    <section className="panel key-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">One-time setup</span>
          <h2><KeyRound size={19} /> Connect a free Gemini key</h2>
        </div>
      </div>

      <div className="key-safety">
        <ShieldCheck size={18} />
        <div>
          <strong>Your key never leaves this browser.</strong>
          <p>
            Jaano has no server. The key is saved only in this device’s local storage, and your
            photo is sent <em>directly</em> from your browser to Google — it does not pass through
            us, it is not stored anywhere, and no other visitor to this site can see or use your key.
            Nothing here is shared with the person who built this app.
          </p>
        </div>
      </div>

      <ol className="key-steps">
        <li>
          Open{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio <ExternalLink size={13} />
          </a>{' '}
          and sign in with any Google account.
        </li>
        <li>Click <strong>Create API key</strong> and copy it.</li>
        <li>Paste it below. The free tier is enough for everyday use.</li>
      </ol>

      <div className="key-input-row">
        <label className="search-field key-field">
          <KeyRound size={16} />
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError('') }}
            placeholder="AIza…"
            spellCheck={false}
            autoComplete="off"
            aria-label="Gemini API key"
          />
          <button className="icon-button ghost" onClick={() => setShow(!show)}
            aria-label={show ? 'Hide key' : 'Show key'}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </label>
        <button className="primary-button" onClick={save}>Save key</button>
      </div>

      {error && <p className="key-error"><AlertTriangle size={15} /> {error}</p>}

      <p className="key-footnote">
        Don’t want to use a key? You can skip this entirely and add dishes by hand below —
        the calorie numbers are identical, because they come from the same table either way.
      </p>
    </section>
  )
}

/* ========================================================================== */
/*  Main view                                                                 */
/* ========================================================================== */

export default function MealCamera({ onLogMeal, limits, activeDate }) {
  const [key, setKeyState] = useState('')
  const [showKeyPanel, setShowKeyPanel] = useState(false)
  const [image, setImage] = useState(null)         // { dataUrl, base64, mimeType, bytes }
  const [hint, setHint] = useState('')
  const [status, setStatus] = useState('idle')     // idle | working | done | error
  const [error, setError] = useState(null)
  const [scene, setScene] = useState('')
  const [unmatched, setUnmatched] = useState([])
  const [items, setItems] = useState([])           // editable meal items
  const [showPicker, setShowPicker] = useState(false)
  const [logged, setLogged] = useState(false)
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => { setKeyState(getKey()) }, [])
  useEffect(() => () => abortRef.current?.abort(), [])

  const hasKey = Boolean(key)

  /* ---- image intake ---------------------------------------------------- */

  const takeFile = useCallback(async (file) => {
    if (!file) return
    setError(null); setLogged(false)
    try {
      const prepared = await prepareImage(file)
      setImage(prepared)
      setStatus('idle')
    } catch (e) {
      setError({ message: e.message || 'Could not read that image.', code: e.code })
    }
  }, [])

  const onDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer?.files?.[0]
    if (f) takeFile(f)
  }

  /* ---- analysis --------------------------------------------------------- */

  const analyse = async () => {
    if (!image) return
    if (!hasKey) { setShowKeyPanel(true); return }
    setStatus('working'); setError(null); setLogged(false)
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await analyzeMealPhoto({
        base64: image.base64, mimeType: image.mimeType, apiKey: key,
        hint: hint.trim() || undefined, signal: controller.signal,
      })
      setScene(res.scene)
      setUnmatched(res.unmatched)
      setItems(res.items.map((it) => ({ ...it, _est: toEstimateItem(it) })))
      setStatus(res.items.length ? 'done' : 'error')
      if (!res.items.length) {
        setError({
          message: res.noFood
            ? 'No food was found in that photo.'
            : 'Nothing in that photo matched a dish we can price. Add the dishes by hand below.',
          code: 'nomatch', soft: true,
        })
      }
    } catch (e) {
      if (e.code === 'abort') return
      setStatus('error')
      setError({ message: e.message || 'Something went wrong.', code: e.code })
      if (e.code === 'badkey' || e.code === 'nokey' || e.code === 'forbidden') setShowKeyPanel(true)
    }
  }

  /* ---- editing ---------------------------------------------------------- */

  const updateItem = (idx, next) => {
    setItems((cur) => cur.map((it, i) => (i === idx ? {
      ...next,
      // A hand-corrected item is no longer a guess. Re-classifying it as
      // confirmed is what makes the range tighten as the user fixes things —
      // the estimate should visibly improve when you tell it more.
      _est: {
        ...it._est, qty: next.qty, context: next.context,
        identity: 'confirmed',
        portion: next.qty !== it.qty ? 'chosen' : it._est.portion,
        preparation: next.contextKnown ? 'contextChosen' : it._est.preparation,
      },
    } : it)))
    setLogged(false)
  }

  const addDish = (dish) => {
    setItems((cur) => [...cur, {
      dishId: dish.id, dish, qty: 1, context: 'home', contextKnown: true,
      confidence: 'high', unit: dish.unit,
      _est: { dishId: dish.id, qty: 1, context: 'home', identity: 'confirmed', portion: 'chosen', preparation: 'contextChosen' },
    }])
    setShowPicker(false)
    setLogged(false)
  }

  const removeItem = (idx) => { setItems((cur) => cur.filter((_, i) => i !== idx)); setLogged(false) }

  const reset = () => {
    abortRef.current?.abort()
    setImage(null); setItems([]); setScene(''); setUnmatched([])
    setStatus('idle'); setError(null); setHint(''); setLogged(false)
  }

  /* ---- totals ----------------------------------------------------------- */

  const estimate = estimateMeal(items.map((it) => it._est))
  const note = estimate.empty ? null : confidenceNote(estimate.uncertainty)

  const logMeal = async () => {
    if (estimate.empty) return
    const thumb = image?.dataUrl ? await makeThumb(image.dataUrl) : null
    onLogMeal({
      title: items.map((i) => i.dish.name).slice(0, 3).join(', ')
        + (items.length > 3 ? ` +${items.length - 3}` : ''),
      source: image ? 'photo' : 'manual',
      items: items.map((i) => ({
        dishId: i.dishId, name: i.dish.name, qty: i.qty, unit: i.unit, context: i.context,
      })),
      totals: estimate.totals,
      kcalLow: estimate.kcalLow, kcalHigh: estimate.kcalHigh,
      uncertainty: estimate.uncertainty,
      thumb,
    })
    setLogged(true)
  }

  /* ---- render ----------------------------------------------------------- */

  return (
    <main className="meal-camera-view">
      <section className="scanner-hero">
        <div className="scanner-hero-icon"><Camera size={34} /></div>
        <div>
          <span className="eyebrow">Photo to calories</span>
          <h1>Snap what’s on your plate</h1>
          <p>
            Ghar ki daal and restaurant ki daal are not the same food — the second one carries
            butter and cream the first never had. Photograph your meal and Jaano identifies each
            dish, judges whether it was <strong>cooked at home, at a restaurant, a dhaba or a stall</strong>,
            and gives you a calorie <strong>range</strong> for the plate.
          </p>
        </div>
      </section>

      {/* Honesty banner — stated before the first number, not after it. */}
      <div className="estimate-disclaimer">
        <Info size={17} />
        <p>
          <strong>This is an estimate, not a measurement.</strong> Nobody can look at a bowl of dal
          and know its calories — how much oil went in is invisible. Jaano always shows a range, and
          the range narrows as you correct the dish, the portion and how it was cooked.
        </p>
      </div>

      {(showKeyPanel || (!hasKey && !items.length)) && (
        <KeySetup existing={key} onSaved={(k) => { setKeyState(k); setShowKeyPanel(false) }} />
      )}

      {/* ---- step 1: the photo ---- */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Step 1</span>
            <h2>Add a photo of your meal</h2>
          </div>
          {hasKey && (
            <button className="link-button" onClick={() => setShowKeyPanel((s) => !s)}>
              <KeyRound size={14} /> {showKeyPanel ? 'Hide key settings' : 'Key settings'}
            </button>
          )}
        </div>

        {!image ? (
          <div
            className="photo-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            <Utensils size={30} />
            <strong>Thali, katori, tiffin or a restaurant plate</strong>
            <p>Shoot from above so every bowl is visible. One plate at a time works best.</p>
            <div className="photo-drop-actions">
              <button className="primary-button" onClick={() => cameraRef.current?.click()}>
                <Camera size={16} /> Take a photo
              </button>
              <button className="ghost-button" onClick={() => fileRef.current?.click()}>
                <Upload size={16} /> Choose a file
              </button>
            </div>
            <small>Or drag an image here.</small>
            {/* `capture` opens the rear camera on a phone; on desktop it degrades
                to a normal file picker, so both inputs are safe to render. */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => takeFile(e.target.files?.[0])} />
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={(e) => takeFile(e.target.files?.[0])} />
          </div>
        ) : (
          <div className="photo-staged">
            <img src={image.dataUrl} alt="The meal you photographed" />
            <div className="photo-staged-side">
              <p className="photo-meta">
                Resized to {image.width}×{image.height} · about {Math.round(image.bytes / 1024)} kB.
                Photos are shrunk before upload so they cost you less data and less quota.
              </p>
              <label className="hint-field">
                <span>Anything we should know? <em>(optional)</em></span>
                <input
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="e.g. mummy ne banaya, no cream"
                  aria-label="Optional hint about the meal"
                />
              </label>
              <div className="photo-staged-actions">
                <button className="primary-button" onClick={analyse} disabled={status === 'working'}>
                  {status === 'working'
                    ? <><Loader2 size={16} className="spin" /> Reading the plate…</>
                    : <><Sparkles size={16} /> Identify this meal</>}
                </button>
                <button className="ghost-button" onClick={reset}><RotateCcw size={15} /> Start over</button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className={`scan-error ${error.soft ? 'soft' : ''}`}>
            <AlertTriangle size={15} /> {error.message}
          </p>
        )}
      </section>

      {/* ---- step 2: the plate ---- */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Step 2</span>
            <h2>Check what’s on the plate</h2>
          </div>
          <button className="ghost-button small" onClick={() => setShowPicker((s) => !s)}>
            <Plus size={15} /> Add a dish
          </button>
        </div>

        {scene && <p className="scene-line">“{scene}”</p>}

        {showPicker && (
          <DishPicker compact onPick={addDish} onClose={() => setShowPicker(false)} />
        )}

        {items.length === 0 ? (
          <p className="empty-note">
            Nothing on the plate yet. Identify a photo above, or press <strong>Add a dish</strong> to
            build the meal by hand — no key needed, and the calories come from the same table.
          </p>
        ) : (
          <ul className="meal-items">
            {items.map((it, i) => (
              <MealItemRow
                key={`${it.dishId}-${i}`}
                item={it}
                estimate={estimate.items[i]}
                onChange={(next) => updateItem(i, next)}
                onRemove={() => removeItem(i)}
              />
            ))}
          </ul>
        )}

        {unmatched.length > 0 && (
          <div className="unmatched-note">
            <AlertTriangle size={15} />
            <div>
              <strong>Not counted:</strong> {unmatched.join(', ')}.
              {' '}These were visible but aren’t in our dish table, so they are <em>not</em> in the
              total below. Add the closest match by hand if you want them included.
            </div>
          </div>
        )}
      </section>

      {/* ---- step 3: the number ---- */}
      {!estimate.empty && (
        <section className="panel meal-total-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Step 3</span>
              <h2>What this plate comes to</h2>
            </div>
          </div>

          <div className="meal-total">
            <div className="meal-total-range">
              <span className="meal-range-value">{formatRange(estimate.kcalLow, estimate.kcalHigh, '')}</span>
              <span className="meal-range-unit">kcal</span>
              <small>midpoint {estimate.totals.kcal} kcal</small>
            </div>
            {note && (
              <div className={`meal-confidence tone-${note.level}`}>
                <strong>{note.label}</strong>
                <p>{note.text}</p>
              </div>
            )}
          </div>

          <ul className="meal-macros">
            {[
              ['Protein', estimate.totals.protein, 'g'],
              ['Carbs', estimate.totals.carbs, 'g'],
              ['Fat', estimate.totals.fat, 'g'],
              ['Sat fat', estimate.totals.satFat, 'g', limits?.satFat],
              ['Sugar', estimate.totals.sugar, 'g', limits?.sugar],
              ['Sodium', estimate.totals.sodium, 'mg', limits?.sodium],
              ['Fibre', estimate.totals.fibre, 'g'],
            ].map(([label, value, unit, limit]) => (
              <li key={label} className={limit && value > limit ? 'over' : ''}>
                <span>{label}</span>
                <strong>{value}<em>{unit}</em></strong>
                {limit ? <small>{Math.round((value / limit) * 100)}% of your day</small> : null}
              </li>
            ))}
          </ul>

          <div className="meal-log-row">
            <button className="primary-button" onClick={logMeal} disabled={logged}>
              {logged ? <><Check size={16} /> Logged to {activeDate}</> : <><Plus size={16} /> Log this meal</>}
            </button>
            {items.length > 0 && (
              <button className="ghost-button" onClick={() => { setItems([]); setLogged(false) }}>
                <Trash2 size={15} /> Clear the plate
              </button>
            )}
          </div>
          {logged && (
            <p className="log-confirm">
              <Check size={14} /> Saved with its range. Your diary records what you logged — if the
              dish table is corrected later, this entry will not silently change.
            </p>
          )}
        </section>
      )}
    </main>
  )
}
