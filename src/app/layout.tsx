import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ReduxProvider } from '@/store/provider'
import GlobalToaster from '@/components/shared/GlobalToaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight' });

export const metadata: Metadata = {
  title: 'Hardware POS System | Transform Your Store',
  description: 'Revolutionary POS system for hardware stores. Real-time inventory, fast transactions, and 24/7 support. Start your free trial today.',
  generator: 'v0.app',
  icons: {
    icon: '/images/futura_hardware_logo.png',
    apple: '/images/futura_hardware_logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interTight.variable} font-sans antialiased`}>
        <ReduxProvider>
          {children}
          <GlobalToaster />
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  )
}
