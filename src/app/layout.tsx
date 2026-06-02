import { Suspense, type ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { Footer } from '@/components/domain/Footer'
import { AuthModal } from '@/components/domain/AuthModal'
import { FloatingContactWidget } from '@/components/domain/FloatingContactWidget'
import { SocialProofToast } from '@/components/domain/SocialProofToast'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-sans' })

import { getSiteSettings } from '@/lib/settings'

export async function generateMetadata() {
  const settings = await getSiteSettings()
  return {
    title: {
      template: settings.seoTitleTemplate,
      default: `${settings.shopName} - ${settings.shopTagline}`,
    },
    description: settings.seoDescription,
    icons: {
      icon: settings.faviconUrl || '/favicon.ico',
    },
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <html lang="vi" className={`${inter.variable}`}>
      <body className="bg-slate-950 text-white antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
            <Toaster position="top-right" richColors />
            <Suspense fallback={null}>
              <AuthModal shopName={settings.shopName} />
            </Suspense>
            <FloatingContactWidget />
            <SocialProofToast />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
