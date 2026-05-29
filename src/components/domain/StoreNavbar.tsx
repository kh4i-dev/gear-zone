'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, LogIn, LogOut, Package, ReceiptText, Settings, ShoppingCart, UserRound, ChevronDown, Monitor, Keyboard, Headphones, Mouse, Sliders, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import { getAdminPath } from '@/lib/adminPath'

export function StoreNavbar() {
  const { push, refresh } = useRouter()
  const { user, refreshUser } = useAuth()
  const { totalCount, isLoaded } = useCart()
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
  // Fix Tai nghe mapping
  const categoryLinks = [
    { name: 'Chuột gaming', query: 'Chuột', icon: Mouse, desc: 'Chuột siêu nhẹ, cảm biến HERO 2, switch quang học.' },
    { name: 'Bàn phím cơ', query: 'Bàn phím', icon: Keyboard, desc: 'Bàn phím Akko, Keychron, layout 75%, hot-swap.' },
    { name: 'Tai nghe gaming', query: 'Tai nghe', icon: Headphones, desc: 'Âm thanh vòm, kết nối không dây trễ cực thấp.' },
    { name: 'Màn hình gaming', query: 'Màn hình', icon: Monitor, desc: 'Màn hình IPS, tần số quét cao 144Hz - 360Hz.' },
    { name: 'Phụ kiện / Khác', query: 'Giá đỡ màn hình (Arm)', icon: Sliders, desc: 'Arm màn hình, Mousepad cỡ lớn cực xịn.' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Gamepad2 className="size-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">GearZone</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            Trang chủ
          </Link>
          
          {/* Category Dropdown Toggle */}
          <div 
            className="relative py-2"
            onMouseEnter={() => setIsCategoryMenuOpen(true)}
            onMouseLeave={() => setIsCategoryMenuOpen(false)}
          >
            <button 
              type="button" 
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors inline-flex items-center gap-1.5 focus:outline-none"
            >
              Danh mục
              <ChevronDown className={`size-4 transition-transform duration-300 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Dropdown Menu */}
            {isCategoryMenuOpen && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[320px] rounded-2xl border border-white/5 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex flex-col gap-1">
                  {categoryLinks.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/products?category=${encodeURIComponent(cat.query)}`}
                      className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/5 text-slate-300 hover:text-white transition-all group"
                      onClick={() => setIsCategoryMenuOpen(false)}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <cat.icon className="size-4" />
                      </span>
                      <div>
                        <div className="text-xs font-bold">{cat.name}</div>
                        <div className="text-[10px] text-slate-400 leading-normal mt-0.5">{cat.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/products" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            Sản phẩm
          </Link>
          <Link href="/orders" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            Đơn hàng
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <Link href="/cart" className="relative flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors" aria-label="Giỏ hàng">
            <ShoppingCart className="size-5" />
            {isLoaded && totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-lg shadow-indigo-600/30">
                {totalCount}
              </span>
            )}
          </Link>

          {/* User Account Section */}
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl bg-slate-900/60 px-3 py-2 text-sm font-bold text-slate-200 sm:flex border border-white/5 shadow-inner">
                <UserRound className="size-4 text-indigo-400" />
                {user.name}
              </div>
              {user.role === 'ADMIN' && (
                <Link href={getAdminPath('/dashboard')} className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors" aria-label="Admin">
                  <Settings className="size-5" />
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors" aria-label="Đăng xuất">
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <button type="button" onClick={openLoginModal} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25 active:scale-95">
              <LogIn className="size-4" />
              Đăng nhập
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex size-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-white/5 bg-slate-950 md:hidden p-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1">
            <Link 
              href="/" 
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            
            {/* Mobile Categories Block */}
            <div className="px-4 py-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Danh mục</div>
              <div className="grid grid-cols-2 gap-2">
                {categoryLinks.map((cat) => (
                  <Link
                    key={cat.name}
                    href={`/products?category=${encodeURIComponent(cat.query)}`}
                    className="flex items-center gap-2 rounded-xl bg-slate-900/60 p-2 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <cat.icon className="size-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300">{cat.query}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link 
              href="/products" 
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link 
              href="/orders" 
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white block"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Đơn hàng
            </Link>
          </div>

          {user && (
            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 border border-white/5">
                <UserRound className="size-4 text-indigo-400" />
                {user.name}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
