'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, LogIn, LogOut, Package, ReceiptText, Settings, ShoppingCart, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import { getAdminPath } from '@/lib/adminPath'

export function StoreNavbar() {
  const { push, refresh } = useRouter()
  const { user, refreshUser } = useAuth()
  const { totalCount, isLoaded } = useCart()

  const openLoginModal = () => {
    const params = new URLSearchParams(window.location.search)
    params.set('auth', 'login')
    push(`${window.location.pathname}?${params.toString()}`)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await refreshUser()
      toast.success('Đã đăng xuất')
      push('/')
      refresh()
    } catch {
      toast.error('Không thể đăng xuất')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Gamepad2 className="size-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">GearZone</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-2"><Gamepad2 className="size-4" /> Trang chủ</span>
          </Link>
          <Link href="/products" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-2"><Package className="size-4" /> Sản phẩm</span>
          </Link>
          <Link href="/orders" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-2"><ReceiptText className="size-4" /> Đơn hàng</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Giỏ hàng">
            <ShoppingCart className="size-5" />
            {isLoaded && totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 sm:flex border border-white/5">
                <UserRound className="size-4 text-indigo-400" />
                {user.name}
              </div>
              {user.role === 'ADMIN' && (
                <Link href={getAdminPath('/dashboard')} className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Admin">
                  <Settings className="size-5" />
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Đăng xuất">
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <button type="button" onClick={openLoginModal} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
              <LogIn className="size-4" />
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
