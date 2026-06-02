import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { Gamepad2, MapPin, Phone, Mail } from 'lucide-react'
import { getSiteSettings } from '@/lib/settings'

function FacebookIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
    </svg>
  )
}

function ZaloIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.5 12.3c0-4.3-3.8-7.8-8.5-7.8s-8.5 3.5-8.5 7.8c0 3.7 2.8 6.8 6.6 7.6-.3.9-.9 2.5-.9 2.5s-.1.4.3.4c.3 0 1.9-1.1 2.8-1.7 1-.2 1.9-.3 2.8-.3 4.7 0 8.5-3.5 8.5-8.5v.0zM9.5 14h-2v-4h2v4zm1.5-2.5h-1v-1.5h1v1.5zm3.5 2.5h-2v-4h2v4zm3.5-1.5c0 .8-.7 1.5-1.5 1.5h-1v-4h1c.8 0 1.5.7 1.5 1.5v1z" />
    </svg>
  )
}

function DiscordIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04-.01-.08-.05-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.05-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.03.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.02.02.05.03.08.02c1.71-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
    </svg>
  )
}

function TelegramIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.2 3.45-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.85.03-.23.32-.48.88-.74 3.45-1.5 5.75-2.5 6.9-2.98 3.28-1.37 3.96-1.61 4.41-1.62.1 0 .32.02.43.12.1.09.12.21.13.31.02.13.02.26.01.32z" />
    </svg>
  )
}

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

  const address = settingsMap.contact_address || 'Thái Nguyên'
  const hotline = settingsMap.contact_hotline || '0866766247'
  const email = settingsMap.contact_email || 'kh4idev@gmail.com'
  const facebook = settingsMap.contact_facebook || '#'
  const zalo = settingsMap.contact_zalo || '#'
  const guideBuy = settingsMap.guide_buy_link || '/products'
  const warranty = settingsMap.warranty_link || '/products'
  const googleMapEmbed = settingsMap.google_map_embed || ''
  const shopDescription = settingsMap.shop_description || "Gaming gear chính hãng. Giá minh bạch. Tồn kho thực. Hỗ trợ nhanh."

  let categories: { id: string; name: string }[] = []
  try {
    categories = await prisma.category.findMany({
      take: 5,
      select: { id: true, name: true }
    })
  } catch {}

  return (
    <footer className="relative bg-[#050505] text-slate-400 overflow-hidden border-t border-white/[0.04]">
      {/* Subtle top border gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      
      {/* Ethereal glow behind brand */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      
      {/* Bottom padding to prevent floating widget overlap */}
      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-16 pb-24 md:pb-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12 animate-fade-in">
          
          {/* Cột 1: Brand (chiếm 4 cột trên LG) */}
          <div className="lg:col-span-4 flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-5 hover:opacity-80 transition-opacity w-fit">
              {logoUrl ? (
                <Image src={logoUrl} alt={shopName} width={144} height={36} className="h-8 w-auto object-contain rounded" />
              ) : (
                <>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.15)]">
                    <Gamepad2 className="size-4.5" />
                  </span>
                  <span className="text-xl font-bold tracking-tight text-white">{shopName}</span>
                </>
              )}
            </Link>
            <p className="text-[13px] leading-relaxed text-slate-400 mb-6 max-w-[280px]">
              {shopDescription}
            </p>
            <div className="flex items-center gap-3 mt-auto">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="size-9 rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] hover:text-indigo-400 transition-colors text-slate-500">
                  <FacebookIcon className="size-4.5" />
                </a>
              )}
              {zalo && (
                <a href={zalo} target="_blank" rel="noopener noreferrer" className="size-9 rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] hover:text-indigo-400 transition-colors text-slate-500">
                  <ZaloIcon className="size-4.5" />
                </a>
              )}
              <a href="#" className="size-9 rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] hover:text-indigo-400 transition-colors text-slate-500">
                <DiscordIcon className="size-4.5" />
              </a>
              <a href="#" className="size-9 rounded-md bg-white/[0.02] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.08] hover:text-indigo-400 transition-colors text-slate-500">
                <TelegramIcon className="size-4.5" />
              </a>
            </div>
          </div>
          
          {/* Cột 2: Sản phẩm (chiếm 3 cột trên LG) */}
          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
              Sản phẩm
            </h3>
            <ul className="space-y-3.5 text-[14px]">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/products?category=${cat.name}`} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li><Link href="/products" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Tất cả sản phẩm</Link></li>
              )}
            </ul>
          </div>
          
          {/* Cột 3: Hỗ trợ (chiếm 2 cột trên LG) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
              Hỗ trợ
            </h3>
            <ul className="space-y-3.5 text-[14px]">
              <li><Link href={guideBuy} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Hướng dẫn mua hàng</Link></li>
              <li><Link href={warranty} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Chính sách bảo hành</Link></li>
              <li><Link href={returnPolicy} className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Chính sách đổi trả</Link></li>
              <li><Link href="/orders" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Kiểm tra đơn hàng</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
          
          {/* Cột 4: Liên hệ (chiếm 3 cột trên LG) */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-[13px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
              Liên hệ
            </h3>
            <ul className="space-y-4 text-[14px]">
              {address && (
                <li className="flex items-center gap-3 text-slate-400 group">
                  <MapPin className="size-4.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="group-hover:text-slate-300 transition-colors">{address}</span>
                </li>
              )}
              {hotline && (
                <li className="flex items-center gap-3 text-slate-400 group">
                  <Phone className="size-4.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="group-hover:text-white transition-colors">{hotline}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3 text-slate-400 group">
                  <Mail className="size-4.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <a href={`mailto:${email}`} className="group-hover:text-white transition-colors">{email}</a>
                </li>
              )}
              <li className="flex items-center gap-3 text-slate-400 group">
                <span className="relative flex h-3 w-3 ml-[3px] mr-[3px] justify-center items-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 group-hover:bg-emerald-400 transition-colors"></span>
                </span>
                <span className="group-hover:text-emerald-400 transition-colors cursor-default">Hỗ trợ trực tuyến</span>
              </li>
            </ul>
            
            {googleMapEmbed && (
              <div className="mt-6 rounded-xl overflow-hidden border border-white/10 h-32 opacity-80 hover:opacity-100 transition-opacity">
                <div 
                  dangerouslySetInnerHTML={{ __html: googleMapEmbed }} 
                  className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0" 
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-[13px] text-slate-500">
            © 2026 {shopName}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-[13px]">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/" className="text-slate-500 hover:text-white transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
