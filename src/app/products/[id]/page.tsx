import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/db'

import { getCurrentUser } from '@/lib/auth'
import { formatPrice } from '@/lib/utils'
import { parseLegacyImageUrls, getPrimaryLegacyImageUrl } from '@/lib/product-images'
import { ArrowLeft, ImageIcon, Package, ShieldCheck, Star, Tag, Truck } from 'lucide-react'
import Link from 'next/link'
import { AddToCartButton } from './AddToCartButton'
import { ProductSpecsAndDesc } from './ProductSpecsAndDesc'
import { ProductGallery } from './ProductGallery'
import { ProductImageFrame } from '@/components/domain/ProductImageFrame'

interface MockReview {
  name: string
  avatarLetter: string
  date: string
  rating: number
  comment: string
}

function getProductReviews(productName: string, productId: string) {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const totalReviews = 15 + (seed % 21)
  
  const rating5Count = Math.round(totalReviews * 0.86)
  const rating4Count = totalReviews - rating5Count
  
  const averageRating = ((rating5Count * 5 + rating4Count * 4) / totalReviews).toFixed(1)
  
  const pct5 = Math.round((rating5Count / totalReviews) * 100)
  const pct4 = 100 - pct5

  const firstNames = ['Anh', 'Minh', 'Tuấn', 'Dũng', 'Quang', 'Hùng', 'Trung', 'Hải', 'Nam', 'Trang', 'Vy', 'Linh', 'Yến', 'Chi', 'Hà', 'Phương']
  const middleNames = ['Văn', 'Thành', 'Quốc', 'Đức', 'Hoàng', 'Thị', 'Khánh', 'Minh', 'Ngọc', 'Thu']
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi']

  const pName = productName.toLowerCase()
  let templates = [
    "Chất lượng sản phẩm tuyệt vời, đóng gói kỹ càng. Sử dụng cực kỳ ưng ý. Sẽ giới thiệu cho bạn bè.",
    "Hàng chính hãng chất lượng cao. Giá tốt nhất thị trường hiện tại. Dịch vụ chăm sóc khách hàng 10 điểm.",
    "Thiết kế sang trọng, hiện đại. Trải nghiệm sử dụng vượt mong đợi. Đáng đồng tiền bát gạo.",
    "Đóng gói cẩn thận, đầy đủ hóa đơn bảo hành. Sản phẩm hoạt động ổn định, mượt mà.",
    "Sản phẩm rất tốt, giao hàng nhanh chóng. Dùng rất sướng, shop tư vấn hỗ trợ cực kỳ nhiệt tình.",
    "GearZone bán hàng rất uy tín, được hỗ trợ cài đặt tận tình. Chắc chắn sẽ quay lại mua thêm."
  ]
  let templates4 = [
    "Sản phẩm rất tốt, giao hàng nhanh chóng. Dùng rất sướng, duy chỉ có khâu đóng hộp carton bên ngoài hơi móp chút.",
    "Sản phẩm dùng ngon lành cành đào, chất liệu cao cấp. Hộp đựng hơi xước tí nhưng hàng bên trong mới tinh nguyên seal.",
    "Mọi thứ đều hoàn hảo, chất lượng hoàn thiện tuyệt vời. Giao hàng hỏa tốc đúng giờ."
  ]

  if (pName.includes('bàn phím') || pName.includes('keyboard') || pName.includes('phím')) {
    templates = [
      "Bàn phím gõ siêu êm, âm thanh trầm ấm rất thích tai. Đèn LED RGB sáng đều, hiệu ứng mượt. Shop giao cực nhanh.",
      "Build chắc chắn, đầm tay. Keycap thiết kế đẹp chống bám vân tay rất tốt. Rất đáng tiền.",
      "Switch nhạy, gõ mượt mà không bị rít. Hàng chuẩn chính hãng, fullbox nguyên seal.",
      "Giao hàng hỏa tốc trong 2 giờ đúng tiến độ. Gõ rất thích, có phần mềm tùy biến LED tiện lợi.",
      "Phím bấm mượt, stabiliser được lube sẵn khá đều, không bị lọc xọc. Chăm sóc khách hàng của shop chu đáo.",
      "Switch gõ phản hồi cực tốt, lực bấm nhẹ không mỏi tay khi cày game đêm. Đèn LED lung linh rất hợp góc làm việc."
    ]
    templates4 = [
      "Mọi thứ đều hoàn hảo, chỉ tiếc là dây nối hơi cứng một chút nhưng không sao, thay dây khác là đẹp ngay.",
      "Gõ phím siêu sướng, stabiliser tốt. Giao hàng hơi trễ 15 phút do trời mưa nhưng chất lượng bù lại hoàn toàn.",
      "Build cực đầm và chắc chắn, gõ sướng tay. Tuy nhiên phím spacebar tiếng hơi vang một xíu so với các phím khác."
    ]
  } else if (pName.includes('chuột') || pName.includes('mouse')) {
    templates = [
      "Chuột cầm cực kỳ ôm tay, trọng lượng siêu nhẹ di chuyển rất thanh thoát. Cảm biến nhạy, không lệch tâm.",
      "Click chuột giòn, nảy, lực bấm vừa phải. Thời lượng pin cực trâu, dùng cả tuần chưa hết. Rất hài lòng.",
      "DPI tùy chỉnh linh hoạt, LED RGB tinh tế không bị chói. Nhựa nhám sờ rất sướng tay.",
      "Giao hàng siêu tốc. Chuột dùng chơi FPS cực mượt, flick shot chuẩn đét. Đầy đủ phụ kiện đi kèm.",
      "Sản phẩm tốt, click êm ái không gây ồn. Cáp kết nối mềm dẻo. Shop tư vấn nhiệt tình.",
      "Cảm biến nhạy bén, di chuyển mượt mà trên mọi bề mặt pad. Thiết kế công thái học cầm lâu không mỏi tay."
    ]
    templates4 = [
      "Form chuột cầm sướng nhưng ai tay quá nhỏ thì cần lưu ý tí nhé, tổng quan chất lượng hoàn thiện tuyệt vời.",
      "Chuột dùng rất mượt và nhạy. Nút cuộn hơi khít một chút thời gian đầu, dùng vài hôm là trơn tru ngay.",
      "Flick chuột rất bay và đầm tay. Phần mềm chỉnh DPI giao diện hơi khó dùng tí nhưng setup xong thì chạy hoàn hảo."
    ]
  } else if (pName.includes('tai nghe') || pName.includes('headset') || pName.includes('âm thanh') || pName.includes('loa')) {
    templates = [
      "Âm thanh vòm định vị cực tốt, chơi Valorant nghe rõ tiếng bước chân địch từ hướng nào luôn. Bass đầm.",
      "Tai nghe đeo êm, mút đệm tai mềm không bị đau khi đeo lâu. Mic thu âm trong, không bị lẫn tạp âm.",
      "Thiết kế hầm hố đẹp mắt, build cực kỳ chắc chắn. Âm thanh nghe nhạc hay chơi game đều xuất sắc.",
      "Kết nối không dây ổn định, không hề bị trễ âm. Đóng gói cẩn thận 2 lớp chống sốc.",
      "Hàng chính hãng bảo hành dài hạn. Giá này quá hời cho một chiếc tai nghe gaming chất lượng như vậy.",
      "Chất âm trong trẻo, dải bass uy lực chiến game bom tấn siêu đã tai. Cách âm cực tốt chống ồn hiệu quả."
    ]
    templates4 = [
      "Chất âm tuyệt vời, mic bắt nhạy. Hơi bí tai một chút vào mùa hè nhưng bật điều hòa lên là hết bài.",
      "Âm thanh rất hay và rõ, bass lực. Dây cáp kèm theo hơi dài dễ rối, còn lại tai nghe đeo rất thích.",
      "Chụp tai êm, âm thanh vòm sống động. Đèn LED bên tai nghe không tắt độc lập được, nhưng chất âm gỡ gạc tất cả."
    ]
  }

  const reviews: MockReview[] = []
  
  for (let i = 0; i < 5; i++) {
    const rSeed = seed + i * 17
    const rating = i < 4 ? 5 : 4
    
    const ln = lastNames[rSeed % lastNames.length]
    const mn = middleNames[(rSeed + 3) % middleNames.length]
    const fn = firstNames[(rSeed + 7) % firstNames.length]
    const fullName = `${ln} ${mn} ${fn}`
    const avatar = fn.charAt(0).toUpperCase()
    
    const daysAgo = 2 + (rSeed % 28)
    const dateStr = `${daysAgo} ngày trước`
    
    const commentPool = rating === 5 ? templates : templates4
    const comment = commentPool[rSeed % commentPool.length]
    
    reviews.push({
      name: fullName,
      avatarLetter: avatar,
      date: dateStr,
      rating,
      comment
    })
  }

  return {
    totalReviews,
    rating5Count,
    rating4Count,
    pct5,
    pct4,
    averageRating,
    reviews
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
  })
  
  if (!product) {
    return { title: 'Không tìm thấy sản phẩm' }
  }
  
  return {
    title: `${product.name} | GearZone`,
    description: product.description?.substring(0, 160) || 'Chi tiết sản phẩm'
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })

  if (!product || !product.isVisible) {
    notFound()
  }

  const [relatedProducts, settings, user] = await Promise.all([
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isVisible: true
      },
      take: 4,
      include: { category: true }
    }),
    prisma.setting.findMany(),
    getCurrentUser()
  ])
  const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  const reviewData = getProductReviews(product.name, product.id)
  const imageUrls = parseLegacyImageUrls(product.imageUrl)

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Back navigation — eyebrow style */}
        <Link href="/products" className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 hover:text-emerald-400 mb-8 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group">
          <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]" />
          Quay lại danh sách sản phẩm
        </Link>

        {/* Hero Section — Double Bezel */}
        <div className="p-2 rounded-[2rem] bg-white/[0.02] ring-1 ring-white/[0.06]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-[#0a0a0a] rounded-[calc(2rem-8px)] p-6 lg:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            {/* Image Gallery */}
            <ProductGallery imageUrls={imageUrls} name={product.name} />

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category eyebrow pill */}
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 w-fit px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] mb-5 ring-1 ring-emerald-500/20">
                <Tag className="size-3" />
                {product.category?.name || 'Chưa phân loại'}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-5 break-words">{product.name}</h1>
              
              {/* Rating + Sold */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="size-4 fill-current" />
                  ))}
                </div>
                <span className="text-slate-500 font-medium text-sm">
                  Đã bán {product.soldCount}
                </span>
              </div>

              {/* Price Section — generous breathing */}
              <div className="flex items-end gap-4 mb-10 pb-10 border-b border-white/[0.04]">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xl text-slate-600 font-medium line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                    {discount && (
                      <span className="bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">
                        -{discount}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Trust Badges — Double Bezel micro cards */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                <div className="group p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-white/[0.05]">
                  <div className="flex items-center gap-3 bg-[#111] rounded-[calc(1rem-4px)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                    <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <Truck className="size-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm tracking-tight">Giao hàng 2H</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Nội thành miễn phí</p>
                    </div>
                  </div>
                </div>
                <div className="group p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-white/[0.05]">
                  <div className="flex items-center gap-3 bg-[#111] rounded-[calc(1rem-4px)] p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                    <div className="p-2 rounded-xl bg-amber-500/10 group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <ShieldCheck className="size-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm tracking-tight">Bảo hành VIP</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">12-24 tháng 1 đổi 1</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock + CTA */}
              <div className="mt-auto pt-4 flex items-center gap-4">
                <div className="p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-white/[0.05] shrink-0">
                  <div className="bg-[#111] rounded-[calc(1rem-4px)] px-4 py-3 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                    <Package className={`size-4 mr-2 ${product.status === 'DISCONTINUED' ? 'text-rose-500' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-sm">
                      {product.status === 'DISCONTINUED' ? (
                        <span className="text-rose-400">Ngừng kinh doanh</span>
                      ) : product.stock > 0 ? (
                        `Còn ${product.stock}`
                      ) : (
                        <span className="text-rose-400">Hết hàng</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <AddToCartButton product={product} />
                </div>
              </div>

              {/* Contact Shop block */}
              {(settingsMap.contact_hotline || settingsMap.contact_zalo) && (
                <div className="mt-8 p-1 rounded-[1rem] bg-white/[0.02] ring-1 ring-emerald-500/10">
                  <div className="bg-[#111] rounded-[calc(1rem-4px)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] flex flex-col gap-4">
                    <div>
                      <p className="font-semibold text-sm text-emerald-400 tracking-tight">Cần tư vấn thêm?</p>
                      <p className="text-[11px] text-slate-500 mt-1">Liên hệ ngay với chuyên viên của GearZone</p>
                    </div>
                    <div className="flex gap-2 w-full">
                      {settingsMap.contact_hotline && (
                        <a href={`tel:${settingsMap.contact_hotline.replace(/\s+/g, '')}`} className="flex-1 flex items-center justify-center gap-2 bg-[#0a0a0a] hover:bg-white/[0.04] text-white text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ring-1 ring-white/[0.06]">
                          📞 Gọi điện
                        </a>
                      )}
                      {settingsMap.contact_zalo && (
                        <a href={settingsMap.contact_zalo} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ring-1 ring-emerald-500/20">
                          💬 Chat ngay
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between border-b border-white/[0.04] pb-5 mb-10">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70 mb-2 block">Cùng danh mục</span>
                <h2 className="text-xl font-semibold tracking-tight text-white">Sản phẩm tương tự</h2>
              </div>
              <Link href={`/products?category=${product.categoryId}`} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-300">
                Xem thêm &gt;
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="group">
                  <div className="p-1 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.05] hover:ring-emerald-500/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <div className="bg-[#0a0a0a] rounded-[calc(1.25rem-4px)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="p-3 bg-gradient-to-b from-[#111] to-[#080808]">
                        <ProductImageFrame
                          src={getPrimaryLegacyImageUrl(p.imageUrl)}
                          alt={p.name}
                          aspectRatio="aspect-square"
                          innerClassName="group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm text-slate-300 line-clamp-2 mb-2.5 group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">{p.name}</h3>
                        <div className="flex items-end gap-2">
                          <span className="font-bold text-white">{formatPrice(p.price)}</span>
                          {p.oldPrice && <span className="text-xs text-slate-600 line-through mb-0.5">{formatPrice(p.oldPrice)}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product Description and Specs Side-by-Side */}
        <ProductSpecsAndDesc product={product} />

        {/* Reviews Section — Double Bezel */}
        <div className="mt-16 p-2 rounded-[2rem] bg-white/[0.02] ring-1 ring-white/[0.06]">
          <div className="bg-[#0a0a0a] rounded-[calc(2rem-8px)] p-6 lg:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3 mb-8 pb-5 border-b border-white/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">Đánh giá</span>
              <span className="text-slate-700">•</span>
              <h2 className="text-lg font-semibold tracking-tight text-white">{product.name}</h2>
            </div>

            {product.soldCount > 0 ? (
              <>
                {/* Rating Summary — Double Bezel */}
                <div className="p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.05]">
                  <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-6 bg-[#060606] rounded-[calc(1.5rem-6px)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                    <div className="text-center md:border-r border-white/[0.04] md:pr-12">
                      <p className="text-5xl font-bold tracking-tight text-white">{reviewData.averageRating}<span className="text-2xl text-slate-600 font-medium">/5</span></p>
                      <div className="flex items-center gap-0.5 text-amber-400 my-3 justify-center">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`size-4 ${idx < Math.round(Number(reviewData.averageRating)) ? 'fill-current' : 'text-slate-700'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{reviewData.totalReviews} đánh giá & nhận xét</p>
                    </div>
                    <div className="flex-1 space-y-2.5 w-full max-w-md">
                      {/* 5 stars */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="w-8 text-slate-500 font-medium">5 sao</span>
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${reviewData.pct5}%` }} />
                        </div>
                        <span className="w-8 text-right text-slate-500 font-medium">{reviewData.pct5}%</span>
                      </div>
                      {/* 4 stars */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="w-8 text-slate-500 font-medium">4 sao</span>
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${reviewData.pct4}%` }} />
                        </div>
                        <span className="w-8 text-right text-slate-500 font-medium">{reviewData.pct4}%</span>
                      </div>
                      {/* 3, 2, 1 stars */}
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 text-xs opacity-30">
                          <span className="w-8 text-slate-500">{3 - i} sao</span>
                          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="w-0 h-full bg-emerald-500 rounded-full" />
                          </div>
                          <span className="w-8 text-right text-slate-500">0%</span>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm w-full md:w-auto active:scale-[0.97] hover:shadow-[0_0_24px_rgba(16,185,129,0.15)]">
                      Viết đánh giá
                    </button>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="mt-8 space-y-4">
                  {reviewData.reviews.map((rev) => (
                    <div key={`${rev.name}-${rev.date}`} className="p-1 rounded-[1.25rem] bg-white/[0.01] ring-1 ring-white/[0.04] hover:ring-white/[0.08] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <div className="p-5 bg-[#060606] rounded-[calc(1.25rem-4px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 font-semibold text-emerald-400 text-sm">
                              {rev.avatarLetter}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-white">{rev.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">✓ Đã mua tại shop</span>
                                <span className="text-[11px] text-slate-600">• {rev.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                              <Star 
                                key={sIdx} 
                                className={`size-3.5 ${sIdx < rev.rating ? 'fill-current' : 'text-slate-800'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-relaxed text-justify whitespace-pre-line">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Empty reviews state */}
                <div className="p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.05]">
                  <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-6 bg-[#060606] rounded-[calc(1.5rem-6px)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                    <div className="text-center md:border-r border-white/[0.04] md:pr-12">
                      <p className="text-5xl font-bold text-slate-700 tracking-tight">0<span className="text-2xl text-slate-800 font-medium">/5</span></p>
                      <div className="flex items-center gap-0.5 text-slate-800 my-3 justify-center">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className="size-4 text-slate-800" 
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-600">0 đánh giá & nhận xét</p>
                    </div>
                    <div className="flex-1 space-y-2.5 w-full max-w-md">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 text-xs opacity-20">
                          <span className="w-8 text-slate-600">{5 - i} sao</span>
                          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className="w-0 h-full bg-emerald-500 rounded-full" />
                          </div>
                          <span className="w-8 text-right text-slate-600">0%</span>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm w-full md:w-auto active:scale-[0.97]">
                      Viết đánh giá
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-center py-16 bg-[#060606] ring-1 ring-dashed ring-white/[0.04] rounded-2xl">
                  <Star className="size-7 text-slate-800 mx-auto mb-3 animate-glow-pulse" />
                  <p className="text-sm text-slate-500 font-medium">Chưa có đánh giá nào cho sản phẩm này</p>
                  <p className="text-[11px] text-slate-600 mt-1.5">Hãy là người đầu tiên mua sản phẩm và viết đánh giá!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
