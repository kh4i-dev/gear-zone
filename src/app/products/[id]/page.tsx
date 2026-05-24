import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { getCurrentUser } from '@/lib/auth'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, ImageIcon, Package, ShieldCheck, Star, Tag, Truck } from 'lucide-react'
import Link from 'next/link'
import { AddToCartButton } from './AddToCartButton'
import { ProductSpecsAndDesc } from './ProductSpecsAndDesc'
import { ProductGallery } from './ProductGallery'

interface MockReview {
  name: string
  avatarLetter: string
  date: string
  rating: number
  comment: string
}

function getProductReviews(productName: string, productId: string) {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Deterministic choices based on seed
  const totalReviews = 15 + (seed % 21) // between 15 and 35 reviews
  
  // To get exactly 4.8 - 4.9 average:
  const rating5Count = Math.round(totalReviews * 0.86) // ~86% are 5 stars
  const rating4Count = totalReviews - rating5Count // the rest are 4 stars
  
  const averageRating = ((rating5Count * 5 + rating4Count * 4) / totalReviews).toFixed(1)
  
  // Percentages for UI bars
  const pct5 = Math.round((rating5Count / totalReviews) * 100)
  const pct4 = 100 - pct5

  // Pick names deterministically
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
  
  // Seed-based selection of 5 dynamic reviews
  for (let i = 0; i < 5; i++) {
    const rSeed = seed + i * 17
    const rating = i < 4 ? 5 : 4 // 4 are 5-star, 1 is 4-star -> 4.8 average
    
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

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })

  const relatedProducts = product ? await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id }
    },
    take: 4,
    include: { category: true }
  }) : []

  const settings = await prisma.setting.findMany()
  const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>)

  if (!product) {
    notFound()
  }

  const user = await getCurrentUser()
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null

  const reviewData = getProductReviews(product.name, product.id)
  const imageUrls = product.imageUrl ? product.imageUrl.split('|').filter(Boolean) : []

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StoreNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-semibold transition group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách sản phẩm
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-3xl backdrop-blur-md">
          {/* Image Gallery */}
          <ProductGallery imageUrls={imageUrls} name={product.name} />

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 w-fit px-3 py-1 rounded-full text-sm font-bold mb-4 border border-indigo-500/20">
              <Tag className="size-4" />
              {product.category?.name || 'Chưa phân loại'}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight leading-tight mb-4 break-words">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="size-5 fill-current" />
                ))}
              </div>
              <span className="text-slate-400 font-semibold text-sm">
                Đã bán {product.soldCount}
              </span>
            </div>

            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-white/5">
              <span className="text-4xl font-extrabold text-white">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl text-slate-500 font-semibold line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  {discount && (
                    <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-lg text-xs font-extrabold select-none">
                      -{discount}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-slate-900 border border-white/5 p-4 rounded-xl">
                <Truck className="size-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Giao hàng 2H</p>
                  <p className="text-xs text-slate-400">Nội thành miễn phí</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900 border border-white/5 p-4 rounded-xl">
                <ShieldCheck className="size-6 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Bảo hành VIP</p>
                  <p className="text-xs text-slate-400">12-24 tháng 1 đổi 1</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 shrink-0 flex items-center justify-center">
                <Package className="size-5 text-indigo-400 mr-2" />
                <span className="font-bold">
                  {product.stock > 0 ? `Còn ${product.stock}` : <span className="text-rose-500">Hết hàng</span>}
                </span>
              </div>
              <div className="flex-1">
                <AddToCartButton product={product} />
              </div>
            </div>

            {/* Contact Shop block */}
            {(settingsMap.contact_hotline || settingsMap.contact_zalo) && (
              <div className="mt-6 bg-slate-900/50 border border-indigo-500/20 rounded-xl p-4 flex flex-col gap-4">
                <div>
                  <p className="font-bold text-sm text-indigo-300">Cần tư vấn thêm?</p>
                  <p className="text-xs text-slate-400 mt-1">Liên hệ ngay với chuyên viên của GearZone</p>
                </div>
                <div className="flex gap-2 w-full">
                  {settingsMap.contact_hotline && (
                    <a href={`tel:${settingsMap.contact_hotline.replace(/\s+/g, '')}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold py-2.5 px-3 rounded-lg transition-colors border border-white/5">
                      📞 Gọi điện
                    </a>
                  )}
                  {settingsMap.contact_zalo && (
                    <a href={settingsMap.contact_zalo} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-lg transition-colors border border-blue-500/30">
                      💬 Chat ngay
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section (GearVN puts it directly under product card) */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between border-b border-white/5 pb-4 mb-8">
              <h2 className="text-xl font-semibold tracking-tight text-white">Sản phẩm tương tự</h2>
              <Link href={`/products?category=${product.categoryId}`} className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Xem thêm &gt;
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <Link key={p.id} href={`/products/${p.id}`} className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all">
                  <div className="aspect-square bg-slate-950 relative">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl.split('|')[0]} alt={p.name} width={180} height={180} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="size-full flex items-center justify-center">
                        <ImageIcon className="size-12 text-slate-800" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-slate-300 line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                    <div className="flex items-end gap-2">
                      <span className="font-extrabold text-white">{formatPrice(p.price)}</span>
                      {p.oldPrice && <span className="text-xs text-slate-500 line-through mb-0.5">{formatPrice(p.oldPrice)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Product Description and Specs Side-by-Side (GearVN Style) */}
        <ProductSpecsAndDesc product={product} />

        {/* Đánh giá & Nhận xét (GearVN Style) */}
        <div className="mt-12 bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-3xl backdrop-blur-md">
          <h2 className="text-xl font-semibold tracking-tight text-white mb-6 pb-4 border-b border-white/5">
            Đánh giá & Nhận xét {product.name}
          </h2>
          {product.soldCount > 0 ? (
            <>
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-6 bg-slate-950/40 rounded-2xl border border-white/5">
                <div className="text-center md:border-r border-white/5 md:pr-12">
                  <p className="text-5xl font-extrabold text-white">{reviewData.averageRating}/5</p>
                  <div className="flex items-center gap-1 text-amber-400 my-2 justify-center">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`size-5 ${idx < Math.round(Number(reviewData.averageRating)) ? 'fill-current' : 'text-slate-600'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{reviewData.totalReviews} đánh giá & nhận xét</p>
                </div>
                <div className="flex-1 space-y-2 w-full max-w-md">
                  {/* 5 stars */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="w-8 text-slate-400">5 sao</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${reviewData.pct5}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-400">{reviewData.pct5}%</span>
                  </div>
                  {/* 4 stars */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="w-8 text-slate-400">4 sao</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${reviewData.pct4}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-400">{reviewData.pct4}%</span>
                  </div>
                  {/* 3, 2, 1 stars */}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs opacity-40">
                      <span className="w-8 text-slate-400">{3 - i} sao</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-indigo-500 rounded-full" />
                      </div>
                      <span className="w-8 text-right text-slate-400">0%</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm w-full md:w-auto">
                  Viết đánh giá
                </button>
              </div>

              {/* Render dynamic mock reviews */}
              <div className="mt-8 space-y-4">
                {reviewData.reviews.map((rev) => (
                  <div key={`${rev.name}-${rev.date}`} className="p-6 bg-slate-900/20 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 font-bold text-indigo-400">
                          {rev.avatarLetter}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">{rev.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ Đã mua tại shop</span>
                            <span className="text-xs text-slate-500">• {rev.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className={`size-4 ${sIdx < rev.rating ? 'fill-current' : 'text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed text-justify prose-p:text-justify whitespace-pre-line">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-6 bg-slate-950/40 rounded-2xl border border-white/5">
                <div className="text-center md:border-r border-white/5 md:pr-12">
                  <p className="text-5xl font-extrabold text-slate-500">0/5</p>
                  <div className="flex items-center gap-1 text-slate-700 my-2 justify-center">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className="size-5 text-slate-700" 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">0 đánh giá & nhận xét</p>
                </div>
                <div className="flex-1 space-y-2 w-full max-w-md">
                  {/* 5, 4, 3, 2, 1 stars all 0% */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 text-xs opacity-30">
                      <span className="w-8 text-slate-500">{5 - i} sao</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-indigo-500 rounded-full" />
                      </div>
                      <span className="w-8 text-right text-slate-500">0%</span>
                    </div>
                  ))}
                </div>
                <button type="button" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm w-full md:w-auto">
                  Viết đánh giá
                </button>
              </div>

              <div className="mt-8 text-center py-12 bg-slate-900/10 border border-dashed border-white/5 rounded-2xl">
                <Star className="size-8 text-slate-600 mx-auto mb-3 opacity-30" />
                <p className="text-sm text-slate-400">Chưa có đánh giá nào cho sản phẩm này</p>
                <p className="text-xs text-slate-500 mt-1">Hãy là người đầu tiên mua sản phẩm và viết đánh giá!</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
