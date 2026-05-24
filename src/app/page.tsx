'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Award, Globe, Headset, Loader2, Mail, Package, ShieldCheck, Truck, Zap, ShoppingCart, Star, ImageIcon, Tag } from 'lucide-react'
import { ProductCatalog, type StoreProduct } from '@/components/domain/ProductCatalog'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { useCart } from '@/components/providers/CartProvider'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

export default function StoreHomePage() {
  const [products, setProducts] = useState<StoreProduct[] | null>(null)
  const isLoading = products === null

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đăng ký email thành công! Bạn sẽ nhận được khuyến mãi sớm nhất.')
  }
  
  // Dynamic Settings grouped into a single state
  const [settings, setSettings] = useState({
    videoUrl: null as string | null,
    bannerTitle: 'GearZone - phụ kiện gaming rõ giá, rõ tồn kho.',
    bannerSubtitle: 'Xem ảnh sản phẩm, giá cũ, giá khuyến mãi, số lượng còn lại và lọc nhanh theo tên hàng, danh mục hoặc khoảng giá.',
    bannerCtaText: 'Xem sản phẩm',
    bannerCtaLink: '/products',
    tickerSpeed: '25s',
    tickerMessages: [
      '🚀 Giao hàng siêu tốc 2h nội thành',
      '🛡️ Bảo hành chính hãng 12-24 tháng',
      '⚙️ Đổi trả miễn phí trong 7 ngày',
      '🔥 Build PC Gaming giá siêu ưu đãi',
      '🎮 Gear xịn - Skill đỉnh',
    ]
  })
  
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState('all')

  const uniqueCategories = Array.from(new Set((products || []).flatMap(p => p.category?.name ? [p.category.name] : []))) as string[]

  const displayedProducts = (products || [])
    .filter(p => activeTab === 'all' || p.category?.name === activeTab)
    .slice(0, 8)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await window.fetch('/api/products')
        const result = await res.json()
        setProducts(result.data || [])
      } catch (e) {
        console.error('Lỗi khi tải sản phẩm', e)
        setProducts([])
      }
    }

    async function fetchSettings() {
      try {
        const res = await window.fetch('/api/settings')
        const result = await res.json()
        if (result.data) {
          setSettings(prev => {
            let tickerMsgs = prev.tickerMessages
            if (result.data.homepage_ticker_messages) {
              try {
                tickerMsgs = JSON.parse(result.data.homepage_ticker_messages)
              } catch {
                tickerMsgs = result.data.homepage_ticker_messages.split('|').filter(Boolean)
              }
            }
            return {
              videoUrl: result.data.homepage_video || prev.videoUrl,
              bannerTitle: result.data.homepage_banner_title || prev.bannerTitle,
              bannerSubtitle: result.data.homepage_banner_subtitle || prev.bannerSubtitle,
              bannerCtaText: result.data.homepage_banner_cta_text || prev.bannerCtaText,
              bannerCtaLink: result.data.homepage_banner_cta_link || prev.bannerCtaLink,
              tickerSpeed: result.data.homepage_ticker_speed || prev.tickerSpeed,
              tickerMessages: tickerMsgs,
            }
          })
        }
      } catch (e) {
        console.error('Lỗi khi tải cài đặt', e)
      }
    }

    fetchProducts()
    fetchSettings()
  }, [])

  // Duplicate the messages array multiple times to create a seamless infinite scrolling effect
  const tickerItems = [...settings.tickerMessages, ...settings.tickerMessages, ...settings.tickerMessages, ...settings.tickerMessages].map((msg, idx) => ({
    id: `ticker-${idx}-${msg}`,
    msg
  }))

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Ticker Section */}
      <div className="bg-indigo-600/20 border-b border-indigo-500/20 overflow-hidden py-2 relative">
        <div 
          className="whitespace-nowrap inline-flex gap-8 px-4 animate-ticker hover:[animation-play-state:paused]"
          style={{ animationDuration: settings.tickerSpeed }}
        >
          {tickerItems.map((item) => (
            <span key={item.id} className="text-indigo-200 text-sm font-bold flex-shrink-0">
              {item.msg}
            </span>
          ))}
        </div>
      </div>

      <StoreNavbar />

      {/* Cinema Video Section */}
      <section className="mx-auto w-full max-w-[1920px] px-4 md:px-8 py-4 h-[calc(100vh-120px)] flex flex-col relative mb-12">
        <div className="relative rounded-[2rem] flex-1 flex flex-col shadow-2xl shadow-indigo-500/10">
          {/* Cinema Frame Border decoration */}
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none z-10" />
          
          {/* Main Video Element */}
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
          
          {/* Text and Controls below the video */}
          <div className="pt-6 pb-2 px-4 text-center shrink-0 flex flex-col items-center justify-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">Trải Nghiệm Đỉnh Cao</h3>
            <p className="text-slate-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-6">
              Khám phá không gian mua sắm gaming gear chuyên nghiệp nhất. Nơi hội tụ của các thương hiệu hàng đầu thế giới với hệ sinh thái sản phẩm đa dạng.
            </p>
            
            {/* Scroll Down Indicator */}
            <div className="flex justify-center animate-pulse">
              <button 
                type="button"
                className="size-12 rounded-full border border-white/10 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900" 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                aria-label="Cuộn xuống"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          </div>
          
          {/* Ambient light effect under the screen */}
          <div className="absolute -bottom-10 left-1/4 right-1/4 h-20 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        </div>
      </section>

      {/* Hero Banner Section */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-6 rounded-3xl bg-slate-900 border border-white/5 p-6 text-white shadow-xl md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="flex flex-col justify-center py-4">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-bold text-indigo-200">
              Gaming gear store
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              {settings.bannerTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              {settings.bannerSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={settings.bannerCtaLink} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-black hover:bg-indigo-50">
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

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              🎮 Siêu phẩm Gear xịn
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Sản phẩm nổi bật
            </h2>
          </div>

          {/* Category Tabs */}
          {products !== null && products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                Tất cả
              </button>
              {uniqueCategories.map(cat => (
                <button type="button"
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                    activeTab === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-10 animate-spin text-indigo-500" />
            <p className="mt-4 text-sm text-slate-400">Đang tải siêu phẩm gaming…</p>
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayedProducts.map((product) => {
              const discount = product.oldPrice && product.oldPrice > product.price
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : null

              return (
                <article
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/20 backdrop-blur-md shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col"
                >
                  {/* Image wrapper */}
                  <Link href={`/products/${product.id}`} className="relative aspect-[4/3] bg-slate-950 block overflow-hidden">
                    {discount && (
                      <span className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-extrabold text-white">
                        -{discount}%
                      </span>
                    )}
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-slate-700 bg-slate-900/50">
                        <ImageIcon className="size-12" />
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 w-fit">
                      <Tag className="size-3" />
                      {product.category?.name || 'Khác'}
                    </div>

                    <Link href={`/products/${product.id}`} className="group/title">
                      <h3 className="min-h-12 text-base font-semibold leading-6 text-white group-hover/title:text-indigo-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Star ratings */}
                    <div className="mt-2 flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="size-3.5 fill-current" />
                      ))}
                      <span className="ml-1.5 text-xs font-semibold text-slate-500">
                        ({Math.max(product.soldCount * 7, 12)})
                      </span>
                    </div>

                    {/* Description excerpt */}
                    <p className="mt-3 text-xs leading-5 text-slate-400 line-clamp-2">
                      {product.description || 'Sản phẩm gaming gear chính hãng chất lượng cao.'}
                    </p>

                    {/* Bottom strip */}
                    <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs font-semibold text-slate-500 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <button type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            maxStock: product.stock,
                          })
                          toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
                        }}
                        disabled={product.stock <= 0}
                        className="size-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-white/30 active:scale-95"
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingCart className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/10 py-20 text-center backdrop-blur-md">
            <Package className="mx-auto size-12 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-1">Chưa có sản phẩm nào</h3>
            <p className="text-slate-400 text-sm">Vui lòng quay lại sau hoặc thử danh mục khác.</p>
          </div>
        )}
      </section>

      {/* Email newsletter signup section (Premium layout) */}
      <section className="mx-auto max-w-7xl px-4 py-16 relative">
        <div className="relative rounded-3xl bg-slate-900 border border-white/5 p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle design glow */}
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
