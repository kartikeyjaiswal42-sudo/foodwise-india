#!/usr/bin/env node
/**
 * Real-browser verification of the meal features and the new navigation.
 *
 * Structural checks cannot see the things that actually break a UI: an overlay
 * that eats every click, a control that renders below the fold on a phone, a
 * grid that pushes the page sideways. This drives the real app in a real
 * browser at desktop AND 390 px, and asserts on COMPUTED state rather than on
 * markup.
 *
 * Usage: node scripts/verify-ui.mjs [baseUrl]
 */
import { chromium } from '../../ntpc-singrauli-sim/node_modules/playwright/index.mjs'

const BASE = process.argv[2] || 'http://localhost:8188'

let pass = 0
const fails = []
const ok = (c, n) => { if (c) { pass++ } else { fails.push(n) } }
const eq = (a, b, n) => ok(a === b, `${n} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)

const browser = await chromium.launch({ channel: 'chrome' })   // real Chrome; the bundled headless shell is not installed on this machine

async function session(width, height, label, fn) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    // The catalog is fetched, so the boot screen must clear before anything else.
    await page.waitForSelector('.sidebar', { timeout: 20000 })
    await page.waitForFunction(() => !document.querySelector('.catalog-boot'), { timeout: 25000 })
    await fn(page, errors)
  } catch (e) {
    fails.push(`${label} — threw ${e.message}`)
  }
  // Ignore noise Next's dev overlay and the SW emit; only real app errors count.
  const real = errors.filter((e) => !/favicon|sw\.js|manifest|Download the React|hydrat/i.test(e))
  ok(real.length === 0, `${label}: no console errors (${real.slice(0, 2).join(' | ')})`)
  await ctx.close()
}

/** Click a sidebar section by its visible label. */
const goSection = async (page, label) => {
  await page.click(`.sidebar nav button:has-text("${label}")`)
  await page.waitForTimeout(350)
}
const goTab = async (page, label) => {
  await page.click(`.section-tabs button:has-text("${label}")`)
  await page.waitForTimeout(350)
}

/* ====================================================================== */
/*  Desktop                                                               */
/* ====================================================================== */

await session(1280, 900, 'desktop', async (page) => {
  /* ---- navigation shrank, not grew ---- */
  const navCount = await page.locator('.sidebar nav > .nav-group > button').count()
  ok(navCount === 6, `sidebar has exactly 6 sections, not 16 (got ${navCount})`)

  /* ---- every section and tab reaches a rendered screen ---- */
  const journey = [
    ['Log a meal', ['From a photo', 'Eating out', 'Cook from scratch']],
    ['My diary', ['Day by day', 'Trends']],
    ['Packaged foods', ['Explore', 'Compare', 'Healthy swaps', 'Companies']],
    ['Check a pack', ['Scan barcode', 'Label scanner', 'My avoid list']],
    ['My health', ['Health & goals', 'Body toxicity', 'Ingredient guide']],
  ]
  for (const [section, tabs] of journey) {
    await goSection(page, section)
    for (const tab of tabs) {
      await goTab(page, tab)
      const main = await page.locator('main').first()
      const text = (await main.innerText().catch(() => '')).trim()
      ok(text.length > 80, `${section} › ${tab} renders real content (${text.length} chars)`)
    }
  }

  /* ---- the meal camera ---- */
  await goSection(page, 'Log a meal')
  await goTab(page, 'From a photo')

  ok(await page.locator('.estimate-disclaimer').isVisible(),
    'the "this is an estimate" banner is visible BEFORE any number')
  const disc = await page.locator('.estimate-disclaimer').innerText()
  ok(/estimate, not a measurement/i.test(disc), 'the banner states it is not a measurement')

  ok(await page.locator('.key-safety').isVisible(), 'the key-safety explanation is shown')
  const safety = await page.locator('.key-safety').innerText()
  ok(/never leaves this browser/i.test(safety), 'it says the key never leaves the browser')
  ok(/directly/i.test(safety), 'it says the photo goes directly to Google')

  /* ---- the no-key path must work: add a dish by hand ---- */
  await page.click('button:has-text("Add a dish")')
  await page.waitForSelector('.dish-picker input')
  await page.fill('.dish-picker input', 'dal tadka')
  await page.waitForTimeout(300)
  await page.click('.dish-result:has-text("Dal Tadka")')
  await page.waitForTimeout(300)
  ok(await page.locator('.meal-item').count() === 1, 'a dish can be added with NO api key')

  // Regional alias search — the thing that makes this usable across India.
  await page.click('button:has-text("Add a dish")')
  await page.fill('.dish-picker input', 'golgappa')
  await page.waitForTimeout(300)
  const aliasHit = await page.locator('.dish-result').first().innerText()
  ok(/pani puri/i.test(aliasHit), `searching "golgappa" finds Pani Puri (got "${aliasHit.split('\n')[0]}")`)
  await page.click('.dish-result')
  await page.waitForTimeout(300)

  /* ---- a range, never a bare number ---- */
  const rangeText = await page.locator('.meal-range-value').innerText()
  ok(/\d+–\d+/.test(rangeText), `the total is a RANGE not a single number (got "${rangeText}")`)
  const totalPanel = await page.locator('.meal-total-panel').innerText()
  ok(/midpoint/i.test(totalPanel), 'the single figure is labelled a midpoint')
  ok(await page.locator('.meal-confidence').isVisible(), 'a confidence statement is shown')

  /* ---- ghar vs restaurant actually changes the number ---- */
  const kcalBefore = Number((await page.locator('.meal-item').first().locator('.meal-item-kcal b').innerText()))
  const ctxButtons = page.locator('.meal-item').first().locator('.context-chip')
  const ctxCount = await ctxButtons.count()
  ok(ctxCount >= 3, `dal offers ghar/restaurant/dhaba contexts (got ${ctxCount})`)
  await ctxButtons.filter({ hasText: 'Restaurant' }).click()
  await page.waitForTimeout(300)
  const kcalAfter = Number((await page.locator('.meal-item').first().locator('.meal-item-kcal b').innerText()))
  ok(kcalAfter > kcalBefore,
    `switching ghar ka -> restaurant RAISES the calories (${kcalBefore} -> ${kcalAfter})`)

  const assumption = await page.locator('.meal-item').first().locator('.context-assumption').innerText()
  ok(/\d+\s*g/.test(assumption), `the restaurant assumption names a gram figure ("${assumption}")`)

  /* ---- logging reaches the diary ---- */
  await page.click('button:has-text("Log this meal")')
  await page.waitForTimeout(500)
  await goSection(page, 'My diary')
  await goTab(page, 'Day by day')
  await page.waitForTimeout(400)
  const mealCards = await page.locator('.timeline-card.meal-card').count()
  ok(mealCards >= 1, `the logged meal appears in the diary (${mealCards} meal cards)`)
  const diaryText = await page.locator('.timeline-card.meal-card').first().innerText()
  ok(/\d+–\d+/.test(diaryText), 'the diary entry keeps its RANGE rather than flattening to one number')

  /* ---- trends refuses to speak from one day ---- */
  await goTab(page, 'Trends')
  await page.waitForTimeout(400)
  const trendsText = await page.locator('.trends-view').innerText()
  ok(/not a pattern|Nothing logged/i.test(trendsText),
    'with one logged day, Trends says the log is too thin instead of inventing a finding')
  ok(await page.locator('.trend-chart').isVisible(), 'the chart still renders')

  /* ---- eating-out browser ---- */
  await goSection(page, 'Log a meal')
  await goTab(page, 'Eating out')
  await page.waitForTimeout(500)
  const cards = await page.locator('.dish-card').count()
  ok(cards > 20, `the eating-out catalog lists dishes (${cards})`)
  const firstCard = await page.locator('.dish-card').first().innerText()
  ok(/Ghar ka/i.test(firstCard), 'each card shows the ghar ka figure')
  const gaps = await page.locator('.dish-gap').count()
  ok(gaps > 5, `the home-vs-out gap is shown on cards (${gaps})`)

  /* ---- the builder ---- */
  await goTab(page, 'Cook from scratch')
  await page.waitForTimeout(400)
  await page.fill('.meal-builder-view .search-field input', 'toor dal')
  await page.waitForTimeout(300)
  await page.click('.dish-result:has-text("Toor dal")')
  await page.waitForTimeout(300)
  await page.fill('.meal-builder-view .search-field input', 'ghee')
  await page.waitForTimeout(300)
  await page.click('.dish-result:has-text("Ghee")')
  await page.waitForTimeout(400)
  ok(await page.locator('.builder-row').count() === 2, 'two ingredients are in the pot')
  const builderText = await page.locator('.builder-total').innerText()
  ok(/kcal/i.test(builderText), 'the pot has a calorie total')
  const conf = await page.locator('.meal-builder-view .meal-confidence').innerText()
  ok(/±\s*\d+%/.test(conf), `the builder states its precision ("${conf.split('\n')[0]}")`)
  ok(/Calculated|Close estimate/i.test(conf),
    'a measured build reads as calculated, not as a rough guess')

  // serves divider
  const potKcal = Number((await page.locator('.builder-total-block').first().innerText()).match(/(\d+)/)[1])
  await page.fill('.builder-serves input >> nth=0', '4')
  await page.waitForTimeout(400)
  const shareText = await page.locator('.builder-total-block.accent').innerText()
  const shareMid = Number(shareText.match(/midpoint (\d+)/)[1])
  ok(Math.abs(shareMid - potKcal / 4) < 3,
    `serving 4 people divides the pot by four (${potKcal} -> ${shareMid})`)

  /* ---- Tata coverage is visible in the product UI ---- */
  await goSection(page, 'Packaged foods')
  await goTab(page, 'Companies')
  await page.waitForTimeout(600)
  const companiesText = await page.locator('main').innerText()
  ok(/Tata/i.test(companiesText), 'Tata appears in the companies directory')
})

/* ====================================================================== */
/*  Phone                                                                 */
/* ====================================================================== */

await session(390, 844, 'phone-390', async (page) => {
  const noPan = async (label) => {
    // documentElement.scrollWidth false-positives in flex shells; the honest
    // test is whether the page can actually be panned sideways.
    await page.evaluate(() => window.scrollTo(9999, 0))
    const x = await page.evaluate(() => window.scrollX)
    ok(x === 0, `${label}: page cannot be panned sideways at 390px (scrollX=${x})`)
  }

  await page.click('.mobile-menu')
  await page.waitForTimeout(300)
  await goSection(page, 'Log a meal')
  await page.waitForTimeout(400)
  await noPan('meal camera')

  ok(await page.locator('.photo-drop').isVisible(), 'the photo drop zone is visible on a phone')
  const btn = await page.locator('button:has-text("Take a photo")').boundingBox()
  ok(btn && btn.height >= 40, `"Take a photo" meets the 40px tap-target floor (${btn?.height}px)`)

  // Add a dish and confirm the context chips are reachable, not clipped.
  await page.click('button:has-text("Add a dish")')
  await page.waitForSelector('.dish-picker input')
  await page.fill('.dish-picker input', 'samosa')
  await page.waitForTimeout(300)
  await page.click('.dish-result')
  await page.waitForTimeout(400)
  const chip = page.locator('.context-chip').first()
  const cb = await chip.boundingBox()
  ok(cb && cb.width > 30 && cb.height >= 26, `context chips are tappable at 390px (${cb?.width}x${cb?.height})`)
  // A chip that is on screen but covered by something else is the bug markup
  // inspection cannot see.
  const topmost = await page.evaluate(() => {
    const el = document.querySelector('.context-chip')
    if (!el) return 'missing'
    const r = el.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return el.contains(hit) || el === hit ? 'clickable' : (hit?.className || 'covered')
  })
  eq(topmost, 'clickable', 'nothing is covering the context chips')

  await noPan('meal camera with an item')

  for (const [section, tab] of [['My diary', 'Trends'], ['Log a meal', 'Eating out'], ['Log a meal', 'Cook from scratch']]) {
    await page.click('.mobile-menu')
    await page.waitForTimeout(250)
    await goSection(page, section)
    await goTab(page, tab)
    await page.waitForTimeout(500)
    await noPan(`${section} › ${tab}`)
  }
})

await browser.close()

console.log(`\n${fails.length ? '✗' : '✓'} browser verification: ${pass} checks passed, ${fails.length} failed`)
if (fails.length) { for (const f of fails) console.log('   ✗', f); process.exit(1) }
