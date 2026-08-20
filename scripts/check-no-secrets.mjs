#!/usr/bin/env node
/**
 * Fail the build if an API key ever gets committed.
 *
 * `src/lib/vision.js` tells users their Gemini key never leaves their browser
 * and that no key is shipped in this repo. That promise is printed on a public
 * page attached to a public repository, so it needs an enforcement mechanism
 * rather than an intention: one absent-minded paste into a config file while
 * debugging would publish a live credential to everyone who reads the source.
 *
 * Runs as part of `npm run build`.
 * Usage: node scripts/check-no-secrets.mjs
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'out', 'dist', 'scripts/out'])
const SCAN_EXT = new Set(['.js', '.mjs', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.md', '.env', '.local'])

const PATTERNS = [
  // Deliberately NOT anchored to the exact 39-character form. A guard that only
  // catches perfectly-shaped keys is the guard that misses the one truncated by
  // a bad copy-paste — and a false positive here costs a comment on the ALLOW
  // list, while a false negative costs a live credential on a public URL.
  { name: 'Google AI / Gemini API key', re: /AIza[0-9A-Za-z_\-]{30,}/ },
  { name: 'OpenAI API key', re: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { name: 'Anthropic API key', re: /\bsk-ant-[A-Za-z0-9\-_]{20,}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
]

/**
 * Lines that legitimately CONTAIN a key-shaped string: the placeholder in the
 * UI, the format check, and this file's own pattern list. Without these the
 * guard would fail on the very code that exists to describe a key, and a check
 * that cries wolf gets disabled within a week.
 */
const ALLOW = [
  /AIza\[0-9A-Za-z_-\]/,        // the regex in looksLikeKey
  /AIza\[0-9A-Za-z_\\-\]/,      // the regex in this file
  /placeholder="AIza/,          // the input placeholder
  /AIza…/,                      // prose
]

async function* walk(dir, rel = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name
    if (SKIP_DIRS.has(entry.name) || SKIP_DIRS.has(relPath)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full, relPath)
    else yield { full, relPath }
  }
}

const hits = []
let scanned = 0

for await (const { full, relPath } of walk(root)) {
  const ext = path.extname(relPath)
  const isEnv = /(^|\/)\.env/.test(relPath)
  if (!isEnv && !SCAN_EXT.has(ext)) continue
  let text
  try { text = await readFile(full, 'utf8') } catch { continue }
  // A 1 MB catalog of product data has no business being regex-scanned line by
  // line for private keys, but it is exactly where a stray paste would hide.
  scanned++
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (ALLOW.some((a) => a.test(line))) continue
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        hits.push({ file: relPath, line: i + 1, kind: p.name, sample: line.trim().slice(0, 80) })
      }
    }
  }
}

if (hits.length) {
  console.error(`\n✗ SECRET SCAN FAILED — ${hits.length} possible credential(s) in the source tree:\n`)
  for (const h of hits) console.error(`   ${h.file}:${h.line}  ${h.kind}\n      ${h.sample}`)
  console.error('\nThis repository is public and deploys to a public URL. Remove the credential,')
  console.error('then rotate it — anything that has been committed must be treated as leaked.\n')
  process.exit(1)
}

console.log(`✓ secret scan: ${scanned} files, no credentials found`)
