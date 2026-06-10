import './globals.css'

export const metadata = {
  title: 'Jaano — Know what you eat',
  description:
    'Jaano helps Indian shoppers understand food labels, compare alternatives, set health goals, and track daily nutrition.',
  icons: { icon: '/favicon.svg' },
}

export const viewport = {
  themeColor: '#f4f2eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
