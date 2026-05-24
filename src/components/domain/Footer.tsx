import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Gamepad2, Facebook } from 'lucide-react'

export async function Footer() {
  let settingsMap: Record<string, string> = {}
  try {
    const settings = await prisma.setting.findMany()
    settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
  } catch (error) {
    // Fail silently in case prisma table is not ready during build
  }

  const address = settingsMap.contact_address || ''
  const hotline = settingsMap.contact_hotline || ''
  const email = settingsMap.contact_email || ''
  const facebook = settingsMap.contact_facebook || ''
  const zalo = settingsMap.contact_zalo || ''
  const openingHours = settingsMap.contact_opening_hours || ''
  const guideBuy = settingsMap.guide_buy_link || ''
  const warranty = settingsMap.warranty_link || ''
  const returnPolicy = settingsMap.return_link || ''
  const payment = settingsMap.payment_link || ''

  // If no contact info and no social link is set, we don't need to render empty sections.
  const hasContactInfo = address || hotline || email || openingHours
  const hasSocial = facebook || zalo

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-16 pb-8 text-slate-400">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Gamepad2 className="size-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">GearZone</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Cửa hàng chuyên cung cấp các thiết bị, phụ kiện Gaming chính hãng hàng đầu với giá cả cạnh tranh và dịch vụ bảo hành siêu tốc.
            </p>
            {hasSocial && (
              <div className="flex gap-4">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                    <Facebook className="size-5" />
                  </a>
                )}
                {zalo && (
                  <a href={zalo} target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                    <span className="font-extrabold text-xs">Zalo</span>
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6">Sản phẩm</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Bàn phím cơ</Link></li>
              <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Chuột Gaming</Link></li>
              <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Tai nghe</Link></li>
              <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Màn hình</Link></li>
              <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Phụ kiện khác</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href={guideBuy} className="hover:text-indigo-400 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link href={warranty} className="hover:text-indigo-400 transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href={returnPolicy} className="hover:text-indigo-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link href={payment} className="hover:text-indigo-400 transition-colors">Phương thức thanh toán</Link></li>
              <li><Link href="/orders" className="hover:text-indigo-400 transition-colors">Kiểm tra đơn hàng</Link></li>
            </ul>
          </div>
          
          {hasContactInfo && (
            <div>
              <h3 className="text-white font-semibold mb-6">Thông tin liên hệ</h3>
              <ul className="space-y-4 text-sm">
                {address && (
                  <li className="flex flex-col">
                    <span className="text-slate-500 mb-1">Địa chỉ:</span>
                    <span className="text-white">{address}</span>
                  </li>
                )}
                {hotline && (
                  <li className="flex flex-col">
                    <span className="text-slate-500 mb-1">Hotline:</span>
                    <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="text-white font-bold text-lg text-indigo-400 hover:underline">{hotline}</a>
                  </li>
                )}
                {email && (
                  <li className="flex flex-col">
                    <span className="text-slate-500 mb-1">Email:</span>
                    <a href={`mailto:${email}`} className="text-white hover:underline">{email}</a>
                  </li>
                )}
                {openingHours && (
                  <li className="flex flex-col">
                    <span className="text-slate-500 mb-1">Giờ mở cửa:</span>
                    <span className="text-white">{openingHours}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 GearZone. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
