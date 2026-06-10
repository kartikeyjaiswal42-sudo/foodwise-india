// Static export for GitHub Pages. basePath is applied only when PAGES_BASE=1
// (the deploy build) so local `next build` output can be served from root.
const usePagesBase = process.env.PAGES_BASE === '1'
const repo = 'foodwise-india'

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  basePath: usePagesBase ? `/${repo}` : '',
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
}
