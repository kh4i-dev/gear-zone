'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight, Award, Globe, Headset, Loader2, Mail, Package, ShieldCheck, Truck, Zap, ShoppingCart, Star, ImageIcon, Tag, RotateCcw, Cpu, Gamepad2 } from 'lucide-react'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { ProductCard, type StoreProduct } from '@/components/domain/ProductCard'
import { HomeCategorySection } from '@/components/domain/HomeCategorySection'
import { ProductRowCarousel } from '@/components/domain/ProductRowCarousel'
import { useCart } from '@/components/providers/CartProvider'
import { useSocialProofContext } from '@/components/providers/SocialProofProvider'
import { LiveFeedTicker } from '@/components/domain/LiveFeedTicker'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import { isPublicProduct } from '@/lib/products/publicProductHelper'

export const DEFAULT_HOME_SETTINGS = {
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
  ],
  shopName: 'GearZone',
  shopTagline: 'Gaming gear store',
}

type HomeData = {
  featuredProducts: StoreProduct[]
  categoryProducts: StoreProduct[]
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

export default function StoreHomePageClient({
  featuredProducts,
  categoryProducts,
  settings: homeSettings,
}: HomeData) {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [email, setEmail] = useState('')
  const { recentEvents } = useSocialProofContext()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error.message || 'Có lỗi xảy ra khi đăng ký')
      } else {
        toast.success(data.data?.message || 'Đăng ký email thành công! Bạn sẽ nhận được khuyến mãi sớm nhất.')
        setEmail('') // reset on success
      }
    } catch (err) {
      toast.error('Không thể kết nối đến máy chủ, vui lòng thử lại sau.')
    } finally {
      setIsSubscribing(false)
    }
  }


  const settings = homeSettings ?? DEFAULT_HOME_SETTINGS
  const accent = accentStyles[settings.themeAccent as keyof typeof accentStyles] ?? accentStyles.indigo
  const bannerCtaLink = settings.bannerCtaLink || DEFAULT_HOME_SETTINGS.bannerCtaLink
  const shouldReduce = useReducedMotion()
  
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
      const cleanMsg = msg
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        .trim()
      const match = Object.keys(tickerIconMap).find(k => cleanMsg.toLowerCase().includes(k.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().slice(0, 10)))
      const IconComp = match ? tickerIconMap[match] : Zap
      return { text: cleanMsg, icon: IconComp }
    })
    // Duplicate for seamless loop
    return [...list, ...list, ...list, ...list].map((item, idx) => ({
      id: `ticker-${idx}-${item.text}`,
      ...item
    }))
  }, [settings.tickerMessages])

  const publicCategoryProducts = useMemo(
    () => categoryProducts.filter(isPublicProduct),
    [categoryProducts]
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <style>{`
        @keyframes hero-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(99,102,241,0); }
          50% { text-shadow: 0 0 20px rgba(99,102,241,0.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-glow { animation: none !important; }
        }
      `}</style>
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

          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
          
          <div className="relative z-20 mt-auto pb-12 px-4 md:px-8 text-center shrink-0 flex flex-col items-center justify-center">
            <motion.h3
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={shouldReduce ? { duration: 0.4, ease: 'easeOut', delay: 0.1 } : { type: 'spring', stiffness: 80, damping: 18, mass: 0.8, delay: 0.1 }}
              className={`text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight drop-shadow-lg ${!shouldReduce ? 'hero-glow' : ''}`}
            >
              {settings.introTitle}
            </motion.h3>
            <motion.p
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={shouldReduce ? { duration: 0.4, ease: 'easeOut', delay: 0.3 } : { type: 'spring', stiffness: 80, damping: 18, mass: 0.8, delay: 0.3 }}
              className="text-slate-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-6 drop-shadow-md"
            >
              {settings.introText}
            </motion.p>
            
            {recentEvents.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-6 py-2.5 shadow-xl flex items-center justify-center min-w-[300px]"
              >
                <LiveFeedTicker events={recentEvents} accent={accent} />
              </motion.div>
            )}
          </div>
          
          <div className={`absolute -bottom-10 left-1/4 right-1/4 h-20 ${accent.glow} blur-[80px] rounded-full pointer-events-none`} />
        </div>
      </section>

      {/* Hero Banner Section */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-6 rounded-3xl bg-slate-900 border border-white/5 p-6 text-white shadow-xl md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="flex flex-col justify-center py-4">
            <motion.div
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={shouldReduce ? { duration: 0.4, ease: 'easeOut', delay: 0.05 } : { type: 'spring', stiffness: 80, damping: 18, mass: 0.8, delay: 0.05 }}
              className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full ${accent.soft} px-3 py-1 text-sm font-bold`}
            >
              {settings.shopTagline}
            </motion.div>
            <motion.h1
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={shouldReduce ? { duration: 0.4, ease: 'easeOut', delay: 0.1 } : { type: 'spring', stiffness: 80, damping: 18, mass: 0.8, delay: 0.1 }}
              className={`max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl ${!shouldReduce ? 'hero-glow' : ''}`}
            >
              {settings.bannerTitle}
            </motion.h1>
            <motion.p
              initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={shouldReduce ? { duration: 0.4, ease: 'easeOut', delay: 0.3 } : { type: 'spring', stiffness: 80, damping: 18, mass: 0.8, delay: 0.3 }}
              className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base"
            >
              {settings.bannerSubtitle}
            </motion.p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={bannerCtaLink} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-lg ${accent.primary}`}>
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
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">Tại sao chọn {settings.shopName}?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Chúng tôi mang đến những giá trị tốt nhất cho cộng đồng game thủ với dịch vụ chuyên nghiệp và sản phẩm chất lượng cao.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Award, title: 'Chính hãng 100%', desc: 'Cam kết sản phẩm chất lượng cao từ các thương hiệu hàng đầu thế giới.' },
            { icon: Zap, title: 'Giao hàng siêu tốc', desc: 'Nhận hàng ngay trong 2h đối với khu vực nội thành.' },
            { icon: Headset, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ kỹ thuật viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.' },
            { icon: Globe, title: 'Cộng đồng lớn mạnh', desc: `Tham gia các giải đấu và event độc quyền dành cho member ${settings.shopName}.` },
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

        {featuredProducts.length > 0 ? (
          <ProductRowCarousel autoSlideInterval={4000}>
            {featuredProducts.map((product, idx) => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} accent={accent} showBadge={true} badgeText="BÁN CHẠY" priority={idx < 4} />
              </div>
            ))}
          </ProductRowCarousel>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/10 py-20 text-center backdrop-blur-md">
            <Package className="mx-auto size-12 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-1">Chưa có sản phẩm nổi bật</h3>
            <p className="text-slate-400 text-sm">Vui lòng quay lại sau.</p>
          </div>
        )}
      </section>

      {/* Home Category Section */}
      <HomeCategorySection products={publicCategoryProducts} />

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                placeholder="Nhập email của bạn..."
                aria-label="Địa chỉ Email"
                className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/60 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubscribing || !email}
              className="h-12 rounded-xl bg-indigo-600 px-6 text-sm font-bold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng ký ngay'
              )}
            </button>
          </form>
        </div>
      </section>

    </main>
  )
}
