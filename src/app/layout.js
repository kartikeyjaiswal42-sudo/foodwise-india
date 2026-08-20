import './globals.css'
import PwaProvider from '../components/PwaProvider'

const base = process.env.PAGES_BASE === '1' ? '/foodwise-india' : ''

export const metadata = {
  title: 'Jaano — Know what you eat',
  description:
    'Scan any Indian packaged food and see what is really inside it: every additive decoded, '
    + 'organ-level impact, and how it fits your own health conditions.',
  applicationName: 'Jaano',
  manifest: `${base}/manifest.webmanifest`,
  icons: {
    icon: `${base}/favicon.svg`,
    apple: `${base}/icons/apple-touch-icon.png`,
  },
  appleWebApp: {
    capable: true,
    title: 'Jaano',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
}

export const viewport = {
  themeColor: '#22372e',
  width: 'device-width',
  initialScale: 1,
  // Let the app paint into the notch area when installed standalone.
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaProvider />
      </body>
    </html>
  )
}
