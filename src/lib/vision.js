// MEAL PHOTO RECOGNITION (browser-only, bring-your-own-key)
// ============================================================================
//
// KEY SAFETY — why it is built this way
// -------------------------------------
// This app is a static export on a public URL and its source is public. There is
// therefore NO safe place in this repository to put an API key: anything shipped
// to the browser is readable by anyone who opens devtools, and anything committed
// is readable by anyone who opens the repo.
//
// So no key is shipped. Each visitor supplies their own, it is stored only in
// their own browser's localStorage, and the request goes from their browser
// STRAIGHT to Google. The key never reaches this repo, this build, any server of
// ours, or any other visitor. `scripts/check-no-secrets.mjs` fails the build if a
// key-shaped string ever appears in the source tree.
//
// THE ARCHITECTURAL RULE — the model identifies, it never calculates
// -------------------------------------------------------------------
// The model is NOT asked "how many calories is this". A language model asked for
// a number will always produce one, fluently and unaccountably, and a wrong
// calorie count delivered confidently is exactly the failure this codebase was
// already burned by (see `lib/dataQuality.js`).
//
// Instead it is given OUR dish list and constrained to pick from it. It answers
// three questions a picture can genuinely support — which dish, how much, and
// does this look home-cooked or restaurant-made — and every nutrition number is
// then computed by `lib/mealEstimate.js` from `data/indianDishes.js`. Two users
// photographing the same dal get the same calories, the figure can be traced to
// a table, and the model cannot invent one.
//
// It is the same guardrail used in the bricktruth project: the AI extracts and
// narrates, the deterministic layer scores.

import { dishes, dishById, UNITS } from '../data/indianDishes.js'

export const KEY_STORAGE = 'jaano-gemini-key-v1'
export const MODEL_STORAGE = 'jaano-gemini-model-v1'
export const DEFAULT_MODEL = 'gemini-2.5-flash'

export class VisionError extends Error {
  constructor(message, code) { super(message); this.code = code }
}

/* -------------------------------------------------------------------------- */
/*  Key handling — localStorage only, never anywhere else                      */
/* -------------------------------------------------------------------------- */

export function getKey() {
  try { return localStorage.getItem(KEY_STORAGE) || '' } catch { return '' }
}

export function setKey(key) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim())
    else localStorage.removeItem(KEY_STORAGE)
    return true
  } catch { return false }
}

export function getModel() {
  try { return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL } catch { return DEFAULT_MODEL }
}

export function setModel(m) {
  try { localStorage.setItem(MODEL_STORAGE, m || DEFAULT_MODEL) } catch { /* ignore */ }
}

/** Shape check only. A real check is a real call — we do not pretend otherwise. */
export function looksLikeKey(key) {
  return /^AIza[0-9A-Za-z_-]{30,}$/.test(String(key || '').trim())
}

/* -------------------------------------------------------------------------- */
/*  JSON salvage                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Parse model JSON that may be fenced, prefixed, or CUT OFF MID-ARRAY.
 *
 * Truncation is not hypothetical: gemini-2.5 spends `maxOutputTokens` on
 * reasoning tokens before it writes any answer, so a long reply gets guillotined
 * and `JSON.parse` dies on "end of data". We set `thinkingBudget: 0` to stop it
 * happening, and salvage anyway — closing the open bracket stack over the
 * largest valid prefix recovers every complete element and drops only the
 * half-written tail.
 */
export function parseJsonLoose(text) {
  if (!text) throw new VisionError('The model returned an empty response.', 'empty')
  let s = String(text).trim()
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  const start = s.search(/[[{]/)
  if (start > 0) s = s.slice(start)

  try { return JSON.parse(s) } catch { /* fall through to salvage */ }

  const stack = []
  let inStr = false
  let esc = false
  let lastGood = -1
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') { inStr = true; continue }
    if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']')
    else if (c === '}' || c === ']') { stack.pop(); if (!stack.length) lastGood = i }
    // A completed element inside an array is a safe truncation point.
    else if (c === ',' && stack.length) lastGood = i - 1
  }
  for (let cut = lastGood; cut > 0; cut--) {
    if (!/[\s,]/.test(s[cut])) {
      const candidate = s.slice(0, cut + 1) + [...stack].reverse().join('')
      try { return JSON.parse(candidate) } catch { /* keep shrinking */ }
    }
  }
  throw new VisionError('The model’s reply was not valid JSON and could not be repaired.', 'parse')
}

/* -------------------------------------------------------------------------- */
/*  Prompt                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The candidate list the model must choose from.
 * Compact `id|name|aliases` lines — aliases are included because the model may
 * recognise "puchka" in a Kolkata photo while our canonical name is "Pani Puri".
 */
function dishMenu() {
  return dishes.map((d) => {
    const aka = d.aka.length ? `|${d.aka.slice(0, 5).join(',')}` : ''
    return `${d.id}|${d.name}${aka}`
  }).join('\n')
}

const SYSTEM = `You identify Indian food in photographs. You do NOT estimate calories or nutrition — another system does that from a nutrition table. Your only job is to say WHAT is on the plate, HOW MUCH of it, and HOW IT WAS COOKED.

Rules:
1. Every dish you report MUST use an id from the CANDIDATE DISHES list. Never invent an id. If a food is clearly present but no id fits, list it under "unmatched" with a plain-language name.
2. Report each distinct food separately. A thali with dal, two rotis and a sabzi is THREE items, not one.
3. Estimate quantity in the unit given for that dish (katori, piece, plate, roti, glass, cup, bowl, tbsp). Use decimals if useful (1.5 katori).
4. Judge the cooking context from visual evidence and say what the evidence was:
   - "home": steel katori/thali, home kitchen or dining table, plain presentation, visible simple tadka, melamine or everyday crockery.
   - "restaurant": restaurant crockery, cream swirl, butter cube, coriander garnish arranged on top, copper/brass serveware, glossy heavily-emulsified gravy, foil takeaway container.
   - "dhaba": steel bowls with a visible oil layer on the surface, generous ghee, roadside setting.
   - "street": paper plate, leaf bowl, newspaper, pushcart, disposable dona/glass.
   If the photo genuinely does not show enough to tell, use "unknown" — do not guess.
5. confidence is your honest certainty that the dish id is right: "high", "medium" or "low". Use "low" freely. A wrong dish confidently reported is worse than an admitted uncertainty.
6. If the photo contains no food at all, return an empty items array and set "noFood": true.

Reply with JSON only, no prose, in exactly this shape:
{"items":[{"id":"dal-tadka","qty":1,"context":"home","contextEvidence":"steel katori on a home dining table","confidence":"high","note":"yellow dal with a simple tadka"}],"unmatched":["name of any food you could not match"],"noFood":false,"scene":"one short sentence describing the plate"}`

/* -------------------------------------------------------------------------- */
/*  The call                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Send one photo to Gemini and get back matched dish ids.
 *
 * @param {{ base64:string, mimeType:string, apiKey?:string, model?:string,
 *           hint?:string, signal?:AbortSignal }} opts
 * @returns {Promise<{items:Array, unmatched:string[], noFood:boolean, scene:string, raw:object}>}
 */
export async function analyzeMealPhoto({ base64, mimeType, apiKey, model, hint, signal }) {
  const key = (apiKey ?? getKey()).trim()
  if (!key) throw new VisionError('No Gemini key saved on this device.', 'nokey')
  if (!base64) throw new VisionError('No image data to analyse.', 'noimage')

  const useModel = model || getModel()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${useModel}:generateContent`

  const userText = [
    hint ? `The person says this is: "${hint}". Use it to disambiguate, but trust the photo if it clearly disagrees.` : '',
    'CANDIDATE DISHES (id|name|aliases):',
    dishMenu(),
  ].filter(Boolean).join('\n')

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: mimeType || 'image/jpeg', data: base64 } },
        { text: userText },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      // Reasoning tokens are billed against maxOutputTokens on gemini-2.5 and
      // will truncate the answer mid-array. This is a classification task with
      // a fixed output shape; it does not need a scratchpad.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal,
    })
  } catch (e) {
    if (e?.name === 'AbortError') throw new VisionError('Cancelled.', 'abort')
    throw new VisionError('Could not reach Google. Check your internet connection.', 'network')
  }

  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.error?.message || '' } catch { /* ignore */ }
    if (res.status === 400 && /API key not valid/i.test(detail)) {
      throw new VisionError('That Gemini key was rejected. Check you copied all of it.', 'badkey')
    }
    if (res.status === 403) throw new VisionError('Google refused the key. Make sure the Generative Language API is enabled for it.', 'forbidden')
    if (res.status === 429) throw new VisionError('You have hit your Gemini rate limit. Wait a minute and try again.', 'ratelimit')
    if (res.status === 404) throw new VisionError(`The model "${useModel}" is not available on this key.`, 'nomodel')
    throw new VisionError(detail || `Gemini returned HTTP ${res.status}.`, 'http')
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('')
  if (!text) {
    const reason = json?.candidates?.[0]?.finishReason
    if (reason === 'SAFETY') throw new VisionError('Google’s safety filter blocked this image.', 'safety')
    throw new VisionError('Gemini replied with no content.', 'empty')
  }

  const parsed = parseJsonLoose(text)
  return normalise(parsed)
}

/**
 * Coerce the model's reply into something the estimator can trust.
 *
 * Everything here is defensive because the input is a language model: an id that
 * is not in our table is DROPPED (never passed through — it would crash the
 * estimator or, worse, silently score as zero), a missing quantity becomes one
 * serving, and an out-of-range quantity is clamped. Anything discarded is
 * reported back in `unmatched` so the UI can tell the user what was ignored
 * rather than quietly showing them a short plate.
 */
export function normalise(parsed) {
  const rawItems = Array.isArray(parsed?.items) ? parsed.items : []
  const unmatched = Array.isArray(parsed?.unmatched) ? parsed.unmatched.map(String) : []
  const items = []

  for (const it of rawItems) {
    const dish = dishById[String(it?.id || '').trim()]
    if (!dish) {
      if (it?.id || it?.note) unmatched.push(String(it.note || it.id))
      continue
    }
    let qty = Number(it?.qty)
    if (!isFinite(qty) || qty <= 0) qty = 1
    qty = Math.min(qty, 12)                       // nobody eats 40 katoris

    const ctx = String(it?.context || 'unknown')
    const context = dish.contexts.includes(ctx) ? ctx : 'home'

    const conf = ['high', 'medium', 'low'].includes(it?.confidence) ? it.confidence : 'low'

    items.push({
      dishId: dish.id,
      dish,
      qty,
      context,
      // An "unknown" context is recorded so the estimator can widen the band for
      // it, rather than pretending a defaulted guess was an observation.
      contextKnown: dish.contexts.includes(ctx),
      contextEvidence: String(it?.contextEvidence || '').slice(0, 160),
      confidence: conf,
      note: String(it?.note || '').slice(0, 160),
      unit: dish.unit,
      unitLabel: UNITS[dish.unit]?.label || dish.unit,
    })
  }

  return {
    items,
    unmatched: [...new Set(unmatched.filter(Boolean))].slice(0, 8),
    noFood: parsed?.noFood === true || (!items.length && !unmatched.length),
    scene: String(parsed?.scene || '').slice(0, 200),
  }
}

/** Map a vision item onto the estimator's uncertainty inputs. */
export function toEstimateItem(visionItem) {
  return {
    dishId: visionItem.dishId,
    qty: visionItem.qty,
    context: visionItem.context,
    identity: visionItem.confidence === 'high' ? 'photoHigh'
      : visionItem.confidence === 'medium' ? 'photoMedium' : 'photoLow',
    portion: 'photoEstimated',
    preparation: visionItem.contextKnown ? 'contextChosen' : 'contextUnknown',
  }
}

/* -------------------------------------------------------------------------- */
/*  Image preparation                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Downscale and re-encode a photo before upload.
 *
 * A modern phone camera produces 4–12 MB per shot. Sent raw that is slow on
 * Indian mobile data, burns the user's own quota, and adds nothing: food
 * recognition does not improve past roughly 1024 px. This caps the long edge and
 * re-encodes to JPEG, which typically cuts the payload by 90%.
 */
export function prepareImage(file, maxEdge = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new VisionError('No file selected.', 'nofile'))
    if (!/^image\//.test(file.type)) return reject(new VisionError('That file is not an image.', 'notimage'))

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      const base64 = dataUrl.split(',')[1]
      if (!base64) return reject(new VisionError('Could not read that image.', 'decode'))
      resolve({ base64, mimeType: 'image/jpeg', dataUrl, width: w, height: h,
        bytes: Math.round(base64.length * 0.75) })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new VisionError('That image could not be opened. Try a JPG or PNG.', 'decode'))
    }
    img.src = url
  })
}

/**
 * A tiny thumbnail for the diary.
 *
 * WHY NOT JUST KEEP THE UPLOADED IMAGE: localStorage caps at about 5 MB per
 * origin. A 1024 px JPEG data URL is 150–300 kB, so roughly twenty logged meals
 * would fill the quota and `setItem` would start throwing — taking the whole
 * food log down with it, not just the photos. A 160 px thumbnail is ~6 kB, so a
 * year of meals still fits.
 */
export function makeThumb(dataUrl, edge = 160, quality = 0.6) {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(null)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, edge / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      try { resolve(c.toDataURL('image/jpeg', quality)) } catch { resolve(null) }
    }
    // A missing thumbnail must never block logging the meal — the numbers are
    // the point, the picture is decoration.
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}
