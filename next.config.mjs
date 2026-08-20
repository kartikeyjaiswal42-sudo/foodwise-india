// Static export for GitHub Pages. basePath is applied only when PAGES_BASE=1
// (the deploy build) so local `next build` output can be served from root.
const usePagesBase = process.env.PAGES_BASE === '1'
const repo = 'foodwise-india'
const base = usePagesBase ? `/${repo}` : ''

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath: base,
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  // Exposed to client code that builds its own URLs (catalog fetch, service
  // worker registration, manifest). Next's basePath does NOT rewrite strings
  // passed to fetch()/navigator.serviceWorker.register().
  env: { NEXT_PUBLIC_BASE_PATH: base },
}
