import { Suspense, type ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { Footer } from '@/components/domain/Footer'
import { AuthModal } from '@/components/domain/AuthModal'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata = {
  title: 'GearZone - Gaming Gear Store',
  description: 'Cửa hàng thiết bị chơi game hàng đầu',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${GeistSans.variable} ${GeistMono.variable}`}>
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
              <AuthModal />
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
