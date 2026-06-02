import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { Gamepad2, Facebook, MapPin, Phone, Mail, Truck, CircleCheck } from 'lucide-react'
import { getSiteSettings } from '@/lib/settings'

export async function Footer() {
  let settingsMap: Record<string, string> = {}
  try {
    const settings = await prisma.setting.findMany()
    settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
  } catch (error) {
    // Fail silently in case prisma table is not ready during build
  }

  const siteSettings = await getSiteSettings()
  const shopName = siteSettings.shopName
  const logoUrl = siteSettings.logoUrl
  const shopDescription = siteSettings.shopDescription

  const address = settingsMap.contact_address || ''
  const hotline = settingsMap.contact_hotline || ''
  const email = settingsMap.contact_email || ''
  const facebook = settingsMap.contact_facebook || ''
  const zalo = settingsMap.contact_zalo || ''
  const openingHours = settingsMap.contact_opening_hours || ''
  const guideBuy = settingsMap.guide_buy_link || '/products'
  const warranty = settingsMap.warranty_link || '/products'
  const returnPolicy = settingsMap.return_link || '/products'
  const payment = settingsMap.payment_link || '/products'

  // If no contact info and no social link is set, we don't need to render empty sections.
  const hasContactInfo = address || hotline || email || openingHours
  const hasSocial = facebook || zalo

  return (
    <footer className="relative bg-[#050505] text-slate-400">
      {/* Subtle top border gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Add bottom padding to prevent mobile widget overlap */}
      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-14 pb-24 md:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-5 hover:opacity-80 transition-opacity w-fit">
              {logoUrl ? (
                <Image src={logoUrl} alt={shopName} width={144} height={36} className="h-8 w-auto object-contain rounded" />
              ) : (
                <>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                    <Gamepad2 className="size-4.5" />
                  </span>
                  <span className="text-xl font-extrabold tracking-tight text-white">{shopName}</span>
                </>
              )}
            </Link>
            <p className="text-[13px] leading-relaxed text-slate-500 mb-6 max-w-sm">
              {shopDescription}
            </p>
            {hasSocial && (
              <div className="flex flex-wrap gap-3 mt-auto">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="size-9 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-slate-400">
                    <Facebook className="size-4" />
                  </a>
                )}
                {zalo && (
                  <a href={zalo} target="_blank" rel="noopener noreferrer" className="h-9 px-3.5 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-slate-400">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider">Zalo</span>
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Products Column */}
          <div>
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-6">Sản phẩm</h3>
            <ul className="space-y-3.5 text-[13px]">
              <li><Link href="/products" className="text-slate-500 hover:text-indigo-400 transition-colors">Bàn phím cơ</Link></li>
              <li><Link href="/products" className="text-slate-500 hover:text-indigo-400 transition-colors">Chuột Gaming</Link></li>
              <li><Link href="/products" className="text-slate-500 hover:text-indigo-400 transition-colors">Tai nghe</Link></li>
              <li><Link href="/products" className="text-slate-500 hover:text-indigo-400 transition-colors">Màn hình</Link></li>
              <li><Link href="/products" className="text-slate-500 hover:text-indigo-400 transition-colors">Phụ kiện khác</Link></li>
            </ul>
          </div>
          
          {/* Support Column */}
          <div>
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-6">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3.5 text-[13px]">
              <li><Link href={guideBuy} className="text-slate-500 hover:text-indigo-400 transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link href={warranty} className="text-slate-500 hover:text-indigo-400 transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href={returnPolicy} className="text-slate-500 hover:text-indigo-400 transition-colors">Chính sách đổi trả</Link></li>
              <li><Link href={payment} className="text-slate-500 hover:text-indigo-400 transition-colors">Phương thức thanh toán</Link></li>
              <li><Link href="/orders" className="text-slate-500 hover:text-indigo-400 transition-colors">Kiểm tra đơn hàng</Link></li>
            </ul>
          </div>
          
          {/* Contact Column */}
          {hasContactInfo && (
            <div>
              <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-6">Liên hệ</h3>
              <ul className="space-y-4 text-[13px]">
                {address && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <MapPin className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Địa chỉ</span>
                      <span className="text-slate-300 leading-relaxed">{address}</span>
                    </div>
                  </li>
                )}
                {hotline && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Phone className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-indigo-400/80 uppercase tracking-wider">Hotline</span>
                      <a href={`tel:${hotline.replace(/\\s+/g, '')}`} className="text-lg font-bold text-white hover:text-indigo-300 transition-colors">{hotline}</a>
                      {openingHours && <span className="text-indigo-200/60 text-xs">Hỗ trợ {openingHours}</span>}
                    </div>
                  </li>
                )}
                {email && (
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <Mail className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Email</span>
                      <a href={`mailto:${email}`} className="text-slate-300 hover:text-indigo-400 transition-colors">{email}</a>
                    </div>
                  </li>
                )}
                <li className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Truck className="size-5 text-indigo-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Giao hàng toàn quốc</span>
                </li>
                <li className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CircleCheck className="size-5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-medium">Đang hỗ trợ trực tuyến</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500 text-center md:text-left">
            © 2026 {shopName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[13px] font-medium">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/" className="text-slate-500 hover:text-white transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
