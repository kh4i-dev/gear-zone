'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gamepad2, LogIn, LogOut, Package, Settings, ShoppingCart, UserRound, ChevronDown, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import { getAdminPath } from '@/lib/adminPath'
import { categoryMegaMenu } from '@/config/categoryMegaMenu'

export function StoreNavbar() {
  const { push, refresh } = useRouter()
  const { user, refreshUser } = useAuth()
  const { totalCount, isLoaded } = useCart()
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)

  // Safe deferred menu close to prevent Next.js from aborting navigation due to sudden DOM unmounting during onClick ticks
  const closeCategoryMenu = () => {
    setTimeout(() => {
      setIsCategoryMenuOpen(false)
    }, 150)
  }

  // Keyboard accessibility: Close menu on Escape key down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
                className="absolute top-full left-1/2 -translate-x-[200px] xl:-translate-x-1/2 mt-0 w-[920px] rounded-3xl border border-white/5 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-black/80 flex overflow-hidden min-h-[440px] max-h-[500px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* Left Side: Category Tabs */}
                <div className="w-[240px] border-r border-white/5 p-3.5 flex flex-col gap-1 bg-slate-900/20 overflow-y-auto max-h-[500px]">
                  {categoryMegaMenu.map((cat, idx) => {
                    const isActive = idx === activeCategoryIndex
                    return (
                      <Link
                        key={cat.id}
                        href={cat.href}
                        onMouseEnter={() => setActiveCategoryIndex(idx)}
                        onClick={closeCategoryMenu}
                        className={`w-full text-left flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.08)]'
                            : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`flex size-7 items-center justify-center rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                            <cat.icon className="size-4" />
                          </span>
                          <span>{cat.label}</span>
                        </div>
                        <ChevronDown className="size-3.5 -rotate-90 opacity-60" />
                      </Link>
                    )
                  })}
                </div>
 
                {/* Right Side: Groups & Links */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[500px] bg-black/40 flex flex-col justify-between">
                  <div className="grid grid-cols-4 gap-x-6 gap-y-8">
                    {categoryMegaMenu[activeCategoryIndex].groups.map((group, gIdx) => (
                      <div key={`${categoryMegaMenu[activeCategoryIndex].id}-group-${gIdx}-${group.title}`} className="space-y-3">
                        <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">
                          {group.title}
                        </h4>
                        <ul className="flex flex-col gap-2">
                          {group.items.map((item, iIdx) => (
                            <li key={`${item.label}-${iIdx}`}>
                              <Link
                                href={item.href}
                                onClick={closeCategoryMenu}
                                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors font-medium block py-0.5"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {categoryMegaMenu[activeCategoryIndex].footerLink && (
                    <div className="mt-8 pt-4 border-t border-white/5 flex">
                      <Link
                        href={categoryMegaMenu[activeCategoryIndex].footerLink.href}
                        onClick={closeCategoryMenu}
                        className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider text-rose-500 hover:text-rose-400 uppercase transition-all duration-300 hover:scale-[1.03] active:scale-95 py-1 px-3.5 bg-rose-500/10 rounded-full border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                      >
                        <span>{categoryMegaMenu[activeCategoryIndex].footerLink.label}</span>
                        <span className="text-[10px]">➔</span>
                      </Link>
                    </div>
                  )}
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
              <div className="flex flex-col gap-2">
                {categoryMegaMenu.map((cat) => {
                  const isExpanded = expandedMobileCategory === cat.id
                  return (
                    <div key={cat.id} className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                        className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.02] outline-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <cat.icon className="size-4 text-indigo-400" />
                          <span>{cat.label}</span>
                        </div>
                        <ChevronDown className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/5 bg-black/30 p-3.5 space-y-4">
                           {cat.groups.map((group, gIdx) => (
                            <div key={`${cat.id}-mobile-group-${gIdx}-${group.title}`} className="space-y-1.5">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {group.title}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {group.items.map((item, iIdx) => (
                                  <Link
                                    key={`${item.label}-${iIdx}`}
                                    href={item.href}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false)
                                      setIsCategoryMenuOpen(false)
                                    }}
                                    className="text-xs text-slate-400 hover:text-white py-1 block"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
