'use client'

import { useState, useSyncExternalStore, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Award, Globe, Headset, Loader2, Mail, Package, ShieldCheck, Truck, Zap, ShoppingCart, Star, ImageIcon, Tag, RotateCcw, Cpu, Gamepad2 } from 'lucide-react'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { ProductCard, type StoreProduct } from '@/components/domain/ProductCard'
import { HomeCategorySection } from '@/components/domain/HomeCategorySection'
import { useCart } from '@/components/providers/CartProvider'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

const DEFAULT_HOME_SETTINGS = {
  videoUrl: null as string | null,
  themeAccent: 'indigo',
  introTitle: 'Chào mừng đến với GearZone',
  introText: 'GearZone chuyên gaming gear, linh kiện và phụ kiện máy tính chính hãng. Chúng tôi tập trung vào sản phẩm rõ thông tin, giá minh bạch, tồn kho thực và hỗ trợ nhanh cho game thủ.',
  bannerTitle: 'GearZone - phụ kiện gaming rõ giá, rõ tồn kho.',
  bannerSubtitle: 'Xem ảnh sản phẩm, giá cũ, giá khuyến mãi, số lượng còn lại và lọc nhanh theo tên hàng, danh mục hoặc khoảng giá.',
  bannerCtaText: 'Xem sản phẩm',
  bannerCtaLink: '/products',
  tickerSpeed: '25s',
  tickerMessages: [
    'Giao hàng siêu tốc 2h nội thành',
    'Bảo hành chính hãng 12-24 tháng',
    'Đổi trả miễn phí trong 7 ngày',
    'Build PC Gaming giá siêu ưu đãi',
    'Gear xịn - Skill đỉnh',
  ]
}

type HomeData = {
  products?: StoreProduct[]
  settings?: typeof DEFAULT_HOME_SETTINGS
}

const accentStyles = {
  indigo: {
    ticker: 'bg-indigo-600/20 border-indigo-500/20',
    tickerText: 'text-indigo-200',
    soft: 'bg-indigo-500/15 text-indigo-200',
    primary: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25 text-white',
    focus: 'focus:ring-indigo-500',
    glow: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    selected: 'bg-indigo-600 border-indigo-500 shadow-indigo-600/20 text-white',
  },
  emerald: {
    ticker: 'bg-emerald-600/20 border-emerald-500/20',
    tickerText: 'text-emerald-200',
    soft: 'bg-emerald-500/15 text-emerald-200',
    primary: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 text-white',
    focus: 'focus:ring-emerald-500',
    glow: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    selected: 'bg-emerald-600 border-emerald-500 shadow-emerald-600/20 text-white',
  },
  violet: {
    ticker: 'bg-violet-600/20 border-violet-500/20',
    tickerText: 'text-violet-200',
    soft: 'bg-violet-500/15 text-violet-200',
    primary: 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/25 text-white',
    focus: 'focus:ring-violet-500',
    glow: 'bg-violet-500/10',
    text: 'text-violet-400',
    selected: 'bg-violet-600 border-violet-500 shadow-violet-600/20 text-white',
  },
  amber: {
    ticker: 'bg-amber-600/20 border-amber-500/20',
    tickerText: 'text-amber-200',
    soft: 'bg-amber-500/15 text-amber-200',
    primary: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/25 text-black',
    focus: 'focus:ring-amber-500',
    glow: 'bg-amber-500/10',
    text: 'text-amber-400',
    selected: 'bg-amber-500 border-amber-400 shadow-amber-500/20 text-black',
  },
  rose: {
    ticker: 'bg-rose-600/20 border-rose-500/20',
    tickerText: 'text-rose-200',
    soft: 'bg-rose-500/15 text-rose-200',
    primary: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25 text-white',
    focus: 'focus:ring-rose-500',
    glow: 'bg-rose-500/10',
    text: 'text-rose-400',
    selected: 'bg-rose-600 border-rose-500 shadow-rose-600/20 text-white',
  },
  blue: {
    ticker: 'bg-blue-600/20 border-blue-500/20',
    tickerText: 'text-blue-200',
    soft: 'bg-blue-500/15 text-blue-200',
    primary: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25 text-white',
    focus: 'focus:ring-blue-500',
    glow: 'bg-blue-500/10',
    text: 'text-blue-400',
    selected: 'bg-blue-600 border-blue-500 shadow-blue-600/20 text-white',
  },
} as const

const homeListeners = new Set<() => void>()
const initialHomeSnapshot: HomeData = {}
let homeSnapshot: HomeData = {}
let homeRequest: Promise<void> | null = null

function parseTickerMessages(raw: string | null | undefined, fallback: string[]) {
  if (!raw) return fallback

  try {
    const list = JSON.parse(raw)
    // Strip emojis if present in stored messages
    return list.map((msg: string) => msg.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim())
  } catch {
    return raw.split('|').filter(Boolean).map(msg => msg.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim())
  }
}

function loadHomeData() {
  if (homeRequest) return homeRequest

  homeRequest = Promise.all([
    window.fetch('/api/products')
      .then((res) => res.json())
      .then((result) => result.data || [])
      .catch((error) => {
        console.error('Lỗi khi tải sản phẩm', error)
        return []
      }),
    window.fetch('/api/settings')
      .then((res) => res.json())
      .then((result) => {
        if (!result.data) return DEFAULT_HOME_SETTINGS

        return {
          videoUrl: result.data.homepage_video || DEFAULT_HOME_SETTINGS.videoUrl,
          themeAccent: result.data.theme_accent || DEFAULT_HOME_SETTINGS.themeAccent,
          introTitle: result.data.homepage_intro_title || DEFAULT_HOME_SETTINGS.introTitle,
          introText: result.data.homepage_intro_text || DEFAULT_HOME_SETTINGS.introText,
          bannerTitle: result.data.homepage_banner_title || DEFAULT_HOME_SETTINGS.bannerTitle,
          bannerSubtitle: result.data.homepage_banner_subtitle || DEFAULT_HOME_SETTINGS.bannerSubtitle,
          bannerCtaText: result.data.homepage_banner_cta_text || DEFAULT_HOME_SETTINGS.bannerCtaText,
          bannerCtaLink: result.data.homepage_banner_cta_link || DEFAULT_HOME_SETTINGS.bannerCtaLink,
          tickerSpeed: result.data.homepage_ticker_speed || DEFAULT_HOME_SETTINGS.tickerSpeed,
          tickerMessages: parseTickerMessages(
            result.data.homepage_ticker_messages,
            DEFAULT_HOME_SETTINGS.tickerMessages
          ),
        }
      })
      .catch((error) => {
        console.error('Lỗi khi tải cài đặt', error)
        return DEFAULT_HOME_SETTINGS
      }),
  ]).then(([products, settings]) => {
    homeSnapshot = { products, settings }
    homeListeners.forEach((listener) => listener())
  })

  return homeRequest
}

const homeStore = {
  subscribe(listener: () => void) {
    homeListeners.add(listener)
    if (!homeRequest) {
      loadHomeData()
    }
    return () => {
      homeListeners.delete(listener)
    }
  },
  getSnapshot: () => homeSnapshot,
  getServerSnapshot: () => initialHomeSnapshot,
}

export default function StoreHomePageClient() {
  const homeData = useSyncExternalStore(
    homeStore.subscribe,
    homeStore.getSnapshot,
    homeStore.getServerSnapshot
  )
  const products = homeData.products
  const isLoading = products === undefined

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đăng ký email thành công! Bạn sẽ nhận được khuyến mãi sớm nhất.')
  }
  
  const settings = homeData.settings ?? DEFAULT_HOME_SETTINGS
  const accent = accentStyles[settings.themeAccent as keyof typeof accentStyles] ?? accentStyles.indigo
  
  const tickerItems = useMemo(() => {
    // Custom infinite ticker item list with proper Lucide icons (Emoji-free)
    const tickerIconMap: { [key: string]: any } = {
      'Giao hàng siêu tốc 2h nội thành': Truck,
      'Bảo hành chính hãng 12-24 tháng': ShieldCheck,
      'Đổi trả miễn phí trong 7 ngày': RotateCcw,
      'Build PC Gaming giá siêu ưu đãi': Cpu,
      'Gear xịn - Skill đỉnh': Gamepad2,
    }

    const list = settings.tickerMessages.map((msg) => {
      const match = Object.keys(tickerIconMap).find(k => msg.toLowerCase().includes(k.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().slice(0, 10)))
      const IconComp = match ? tickerIconMap[match] : Zap
      return { text: msg, icon: IconComp }
    })
    // Duplicate for seamless loop
    return [...list, ...list, ...list, ...list].map((item, idx) => ({
      id: `ticker-${idx}-${item.text}`,
      ...item
    }))
  }, [settings.tickerMessages])

  // Top 4 Featured Products logic - uses ES2023 toSorted for immutable sorting
  const featuredProducts = useMemo(() => {
    if (!products) return []
    return products
      .toSorted((a, b) => {
        // 1. Best soldCount
        if (b.soldCount !== a.soldCount) {
          return b.soldCount - a.soldCount
        }
        // 2. Fallback: Discount
        const discA = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0
        const discB = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0
        if (discB !== discA) return discB - discA
        // 3. Fallback: Created date (assume mock id/date)
        return b.id.localeCompare(a.id)
      })
      .slice(0, 4)
  }, [products])

  // Group Products by Categories for Category blocks - combined iterations using reduce
  const categoryBlocks = useMemo(() => {
    if (!products) return []
    const groups: { [key: string]: StoreProduct[] } = {}
    products.forEach(p => {
      const catName = p.category?.name || 'Phụ kiện / Khác'
      if (!groups[catName]) groups[catName] = []
      groups[catName].push(p)
    })

    return Object.entries(groups).reduce((acc, [name, list]) => {
      const sliced = list.slice(0, 4)
      if (sliced.length > 0) {
        acc.push({ name, products: sliced })
      }
      return acc
    }, [] as { name: string; products: StoreProduct[] }[])
  }, [products])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Ticker Section - Lucide icons, premium scrolling, no hover pause */}
      <div className={`${accent.ticker} border-b overflow-hidden py-2 relative`}>
        <div 
          className="whitespace-nowrap inline-flex gap-12 px-4 animate-ticker"
          style={{ animationDuration: settings.tickerSpeed }}
        >
          {tickerItems.map((item) => (
            <span key={item.id} className={`${accent.tickerText} text-xs font-extrabold tracking-wider uppercase flex items-center gap-2 flex-shrink-0 select-none`}>
              <item.icon className="size-4 shrink-0" strokeWidth={2.5} />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <StoreNavbar />

      {/* Cinema Video Section */}
      <section className="mx-auto w-full max-w-[1920px] px-4 md:px-8 py-4 h-[calc(100vh-120px)] flex flex-col relative mb-12">
        <div className="relative rounded-[2rem] flex-1 flex flex-col shadow-2xl shadow-black/30">
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none z-10" />
          
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden bg-slate-950">
            {settings.videoUrl ? (
              <video 
                src={settings.videoUrl} 
                autoPlay 
                muted 
                loop 
                playsInline
                aria-label="Video giới thiệu sản phẩm trang chủ"
                className="size-full object-cover opacity-85"
              />
            ) : (
              <div className="size-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <ImageIcon className="size-16 opacity-20" />
                <p className="max-w-md text-sm">Vui lòng đăng nhập Admin &gt; Cài đặt để thêm video URL hoặc upload video từ máy tính của bạn.</p>
              </div>
            )}
          </div>
          
          <div className="pt-6 pb-2 px-4 text-center shrink-0 flex flex-col items-center justify-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">{settings.introTitle}</h3>
            <p className="text-slate-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-6">
              {settings.introText}
            </p>
          </div>
          
          <div className={`absolute -bottom-10 left-1/4 right-1/4 h-20 ${accent.glow} blur-[80px] rounded-full pointer-events-none`} />
        </div>
      </section>

      {/* Hero Banner Section */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-6 rounded-3xl bg-slate-900 border border-white/5 p-6 text-white shadow-xl md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="flex flex-col justify-center py-4">
            <div className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full ${accent.soft} px-3 py-1 text-sm font-bold`}>
              Gaming gear store
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              {settings.bannerTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              {settings.bannerSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={settings.bannerCtaLink} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg ${accent.primary}`}>
                {settings.bannerCtaText}
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/orders" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Tra cứu đơn hàng
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Package className="mb-3 size-5 text-indigo-300" />
              <h3 className="font-semibold text-base text-white">100% Chính Hãng</h3>
              <p className="mt-1 text-xs text-slate-400">Các thương hiệu uy tín hàng đầu Razer, Logitech, Keychron, Asus…</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Truck className="mb-3 size-5 text-emerald-300" />
              <h3 className="font-semibold text-base text-white">Giao Hàng Siêu Tốc</h3>
              <p className="mt-1 text-xs text-slate-400">Ship hàng nội thành nhanh chóng trong vòng 2h kể từ lúc xác nhận.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="mb-3 size-5 text-violet-300" />
              <h3 className="font-semibold text-base text-white">Bảo Hành Dễ Dàng</h3>
              <p className="mt-1 text-xs text-slate-400">Bảo hành 12 - 24 tháng theo số serial, an tâm sử dụng trọn đời.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us section (Premium look) */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">Tại sao chọn GearZone?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Chúng tôi mang đến những giá trị tốt nhất cho cộng đồng game thủ với dịch vụ chuyên nghiệp và sản phẩm chất lượng cao.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Award, title: 'Chính hãng 100%', desc: 'Cam kết sản phẩm chất lượng cao từ các thương hiệu hàng đầu thế giới.' },
            { icon: Zap, title: 'Giao hàng siêu tốc', desc: 'Nhận hàng ngay trong 2h đối với khu vực nội thành.' },
            { icon: Headset, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ kỹ thuật viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.' },
            { icon: Globe, title: 'Cộng đồng lớn mạnh', desc: 'Tham gia các giải đấu và event độc quyền dành cho member GearZone.' },
          ].map((feature) => (
            <div key={feature.title} className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:bg-slate-900 transition-colors group">
              <div className="size-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="size-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 1: Featured Products Section (Premium Look) */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              🔥 TOP BÁN CHẠY
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-1 text-sm text-slate-400">Những thiết bị đỉnh cao được nhiều game thủ tin dùng nhất.</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Xem tất cả
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-10 animate-spin text-indigo-500" />
            <p className="mt-4 text-sm text-slate-400">Đang tải siêu phẩm gaming…</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} accent={accent} showBadge={true} badgeText="BÁN CHẠY" />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/10 py-20 text-center backdrop-blur-md">
            <Package className="mx-auto size-12 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-1">Chưa có sản phẩm nổi bật</h3>
            <p className="text-slate-400 text-sm">Vui lòng quay lại sau.</p>
          </div>
        )}
      </section>

      {/* Home Category Section */}
      <HomeCategorySection products={products ?? []} />

      {/* SECTION 2: Category Blocks (Mouse, Keyboard, Headset, Monitor, others) */}
      <section className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          categoryBlocks.map((block) => (
            <div key={block.name} className="space-y-6">
              <div className="flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-indigo-500 animate-pulse" />
                    {block.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Khám phá các sản phẩm hàng đầu trong danh mục {block.name}.</p>
                </div>
                <Link 
                  href={`/products?category=${encodeURIComponent(block.name)}`} 
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  Xem tất cả {block.name}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {block.products.map((product) => (
                  <ProductCard key={product.id} product={product} accent={accent} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Email newsletter signup section (Premium layout) */}
      <section className="mx-auto max-w-7xl px-4 py-16 relative">
        <div className="relative rounded-3xl bg-slate-900 border border-white/5 p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute -top-32 -right-32 size-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
          
          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3">Đừng bỏ lỡ ưu đãi nào!</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">Đăng ký email để nhận tin tức về siêu phẩm gaming mới nhất, code giảm giá độc quyền và các chương trình giveaway.</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 shrink-0 z-10">
            <div className="relative min-w-[280px]">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Nhập email của bạn..."
                aria-label="Địa chỉ Email"
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button 
              type="submit"
              className="h-12 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/25"
            >
              Đăng ký ngay
            </button>
          </form>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-white/5 py-8 bg-slate-950 text-center">
        <p className="text-xs text-slate-500">© 2026 GearZone Store. All rights reserved. Built for professional gamers.</p>
      </footer>
    </main>
  )
}
