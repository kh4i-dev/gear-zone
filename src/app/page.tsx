'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Award, Globe, Headset, Loader2, Mail, Package, ShieldCheck, Truck, Zap, ShoppingCart, Star, ImageIcon, Tag } from 'lucide-react'
import { ProductCatalog, type StoreProduct } from '@/components/domain/ProductCatalog'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { useCart } from '@/components/providers/CartProvider'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

export default function StoreHomePage() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState('all')

  const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean))) as string[]

  const displayedProducts = products
    .filter(p => activeTab === 'all' || p.category?.name === activeTab)
    .slice(0, 8)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const result = await res.json()
        setProducts(result.data || [])
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const result = await res.json()
        if (result.data?.homepage_video) {
          setVideoUrl(result.data.homepage_video)
        }
      } catch (e) {
        console.error('Lỗi khi tải cài đặt', e)
      }
    }

    fetchProducts()
    fetchSettings()
  }, [])

  const tickerConfig = {
    speed: '25s', // Có thể cấu hình tốc độ (thay đổi thành 10s, 30s...)
    messages: [
      '🚀 Giao hàng siêu tốc 2h nội thành',
      '🛡️ Bảo hành chính hãng 12-24 tháng',
      '⚙️ Đổi trả miễn phí trong 7 ngày',
      '🔥 Build PC Gaming giá siêu ưu đãi',
      '🎮 Gear xịn - Skill đỉnh',
    ]
  }

  // Duplicate the messages array multiple times to create a seamless infinite scrolling effect
  const tickerItems = [...tickerConfig.messages, ...tickerConfig.messages, ...tickerConfig.messages, ...tickerConfig.messages]

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Ticker Section */}
      <div className="bg-indigo-600/20 border-b border-indigo-500/20 overflow-hidden py-2 relative">
        <div 
          className="whitespace-nowrap inline-flex gap-8 px-4 animate-ticker hover:[animation-play-state:paused]"
          style={{ animationDuration: tickerConfig.speed }}
        >
          {tickerItems.map((msg, idx) => (
            <span key={idx} className="text-indigo-200 text-sm font-bold flex-shrink-0">
              {msg}
            </span>
          ))}
        </div>
      </div>

      <StoreNavbar />

      {/* Cinema Video Section */}
      <section className="mx-auto w-full max-w-[1920px] px-4 md:px-8 py-4 h-[calc(100vh-120px)] flex flex-col relative mb-12">
        <div className="relative rounded-[2rem] flex-1 flex flex-col shadow-2xl shadow-indigo-500/10">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-[3rem] -z-10" />
          
          <div className="relative rounded-[2rem] overflow-hidden flex items-center justify-center flex-1 w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 bg-black">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                autoPlay 
                muted 
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 p-8 text-center h-full w-full bg-slate-900">
                <div className="w-20 h-20 mb-4 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                  <span className="text-3xl">🎬</span>
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Video giới thiệu chưa được cấu hình</h3>
                <p className="max-w-md text-sm">Vui lòng đăng nhập Admin &gt; Cài đặt để thêm video URL hoặc upload video từ máy tính của bạn.</p>
              </div>
            )}
          </div>
          
          {/* Text and Controls below the video */}
          <div className="pt-6 pb-2 px-4 text-center shrink-0 flex flex-col items-center justify-center">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">Trải Nghiệm Đỉnh Cao</h3>
            <p className="text-slate-400 max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-6">
              Khám phá không gian mua sắm gaming gear chuyên nghiệp nhất. Nơi hội tụ của các thương hiệu hàng đầu thế giới với hệ sinh thái sản phẩm đa dạng.
            </p>
            
            {/* Scroll Down Indicator */}
            <div className="flex justify-center animate-bounce">
              <div 
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer" 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          
          {/* Ambient light effect under the screen */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-indigo-500/20 blur-2xl rounded-full" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="grid gap-6 rounded-3xl bg-slate-900 border border-white/5 p-6 text-white shadow-xl md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="flex flex-col justify-center py-4">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-bold text-indigo-200">
              Gaming gear store
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">
              GearZone - phụ kiện gaming rõ giá, rõ tồn kho.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Xem ảnh sản phẩm, giá cũ, giá khuyến mãi, số lượng còn lại và lọc nhanh theo tên hàng, danh mục hoặc khoảng giá.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-indigo-50">
                Xem sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/orders" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
                Tra cứu đơn hàng
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Package className="mb-3 h-5 w-5 text-indigo-300" />
              <p className="text-2xl font-extrabold">{products.length}</p>
              <p className="text-sm text-slate-300">sản phẩm đang bán</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Truck className="mb-3 h-5 w-5 text-emerald-300" />
              <p className="text-2xl font-extrabold">24h</p>
              <p className="text-sm text-slate-300">xử lý đơn nội thành</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-amber-300" />
              <p className="text-2xl font-extrabold">Chính hãng</p>
              <p className="text-sm text-slate-300">bảo hành theo sản phẩm</p>
            </div>
          </div>
        </div>
      </section>



      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">Tại sao chọn GearZone?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Chúng tôi mang đến những giá trị tốt nhất cho cộng đồng game thủ với dịch vụ chuyên nghiệp và sản phẩm chất lượng cao.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Award, title: 'Chính hãng 100%', desc: 'Cam kết sản phẩm chất lượng cao từ các thương hiệu hàng đầu thế giới.' },
            { icon: Zap, title: 'Giao hàng siêu tốc', desc: 'Nhận hàng ngay trong 2h đối với khu vực nội thành.' },
            { icon: Headset, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ kỹ thuật viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.' },
            { icon: Globe, title: 'Cộng đồng lớn mạnh', desc: 'Tham gia các giải đấu và event độc quyền dành cho member GearZone.' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:bg-slate-900 transition-colors group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              🎮 Siêu phẩm Gear xịn
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Sản phẩm nổi bật
            </h2>
          </div>

          {/* Category Tabs */}
          {products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
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
                <button
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
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="mt-4 text-sm text-slate-400">Đang tải siêu phẩm gaming...</p>
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
                  <Link href={`/products/${product.id}`} className="relative aspect-[4/3] bg-slate-950 block overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center transition duration-700 group-hover:scale-105">
                        <ImageIcon className="h-12 w-12 text-slate-700" />
                      </div>
                    )}
                  </Link>
                  <div className="p-5 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                        <Tag className="h-3 w-3" />
                        {product.category?.name || 'Khác'}
                      </div>
                      <Link href={`/products/${product.id}`} className="group/title block">
                        <h3 className="text-base font-extrabold leading-6 text-white group-hover/title:text-indigo-400 transition-colors line-clamp-2 min-h-12">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className="h-3.5 w-3.5 fill-current" />
                        ))}
                        <span className="ml-1 text-[11px] font-bold text-slate-500">
                          ({Math.max(product.soldCount * 7, 12)} đánh giá)
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-end justify-between border-t border-white/5 pt-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-white">
                              {formatPrice(product.price)}
                            </span>
                            {discount && (
                              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          {product.oldPrice && (
                            <span className="text-xs font-semibold text-slate-500 line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>

                        <button
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
                          className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 active:scale-95"
                          title="Thêm vào giỏ hàng"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/10 py-20 text-center backdrop-blur-md">
            <Package className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-extrabold text-white">Chưa có sản phẩm nào</h3>
            <p className="mt-1 text-sm text-slate-400">Vui lòng quay lại sau.</p>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900 hover:border-white/20 px-6 py-3.5 text-sm font-extrabold text-white transition-all group"
          >
            Khám phá tất cả sản phẩm
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-6 shadow-lg shadow-indigo-600/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6">Nhận thông tin khuyến mãi mới nhất</h2>
          <p className="text-slate-300 text-lg mb-8">Đăng ký email để không bỏ lỡ các deal sốc và sản phẩm limited edition từ GearZone.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Nhập email của bạn..." className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
