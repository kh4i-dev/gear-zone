'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Phone } from 'lucide-react'

interface ContactSettings {
  hotline: string
  zalo: string
  facebook: string
}

const MessengerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 36 36" fill="url(#messenger-grad)" className={className}>
    <defs>
      <linearGradient id="messenger-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="50%" stopColor="#A334FA" />
        <stop offset="100%" stopColor="#0695FF" />
      </linearGradient>
    </defs>
    <path d="M18 0C8.06 0 0 7.63 0 17.04C0 22.36 2.65 27.06 6.75 30.14V36L12.57 32.82C14.28 33.3 16.1 33.56 18 33.56C27.94 33.56 36 25.93 36 16.52C36 7.11 27.94 0 18 0ZM19.74 22.38L16.03 18.42L8.8 22.38L16.71 13.96L20.42 17.92L27.65 13.96L19.74 22.38Z" />
  </svg>
)

const ZaloIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" stroke="#0068FF" strokeWidth="2.5">
    <path d="M18 3C8.06 3 2 9.63 2 19.04C2 24.36 4.65 29.06 8.75 32.14V36L14.57 33.82C15.68 34.1 16.82 34.24 18 34.24C27.94 34.24 34 27.61 34 18.2C34 8.79 27.94 3 18 3Z" />
    <text x="18" y="24" fill="#0068FF" stroke="none" fontSize="14" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">Zalo</text>
  </svg>
)

const contactItems = [
  {
    key: 'facebook' as const,
    title: 'Chat Messenger',
    sub: '(8h30 - 22h00)',
    icon: MessengerIcon,
  },
  {
    key: 'zalo' as const,
    title: 'Chat Zalo',
    sub: '(8h30 - 22h00)',
    icon: ZaloIcon,
  },
  {
    key: 'hotline' as const,
    title: 'Hotline',
    sub: '(8h30 - 18h30)',
    icon: ({ className }: { className?: string }) => (
      <Phone className={className} fill="currentColor" strokeWidth={1.5} />
    ),
    iconColor: 'text-rose-500',
  },
]

export function FloatingContactWidget() {
  const [settings, setSettings] = useState<ContactSettings | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.data) {
          setSettings({
            hotline: data.data.contact_hotline || '',
            zalo: data.data.contact_zalo || '',
            facebook: data.data.contact_facebook || '',
          })
        }
      })
      .catch(() => {})
  }, [])

  const hasAny = settings && (settings.hotline || settings.zalo || settings.facebook)
  if (!hasAny) return null

  const items = contactItems.filter((item) => settings[item.key])
  const bottomClass = pathname.startsWith('/cart')
    ? 'bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] md:bottom-6'
    : 'bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-6'

  return (
    <>
      {/* DESKTOP VIEW: Hover-expanding FABs */}
      <div
        className={`hidden md:flex fixed right-6 z-40 flex-col items-end gap-3 ${bottomClass}`}
        role="navigation"
        aria-label="Liên hệ nhanh"
      >
        {items.map((item, index) => {
          const Icon = item.icon
          const href = settings[item.key]
          const isExternal = item.key !== 'hotline'
          const linkProps = isExternal
            ? { href, target: '_blank', rel: 'noopener noreferrer' }
            : { href: `tel:${href.replace(/\\s+/g, '')}` }
            
          const displayTitle = item.key === 'hotline' ? (settings.hotline || item.title) : item.title

          return (
            <a
              key={item.key}
              {...linkProps}
              className="group flex items-center justify-start gap-3 overflow-hidden rounded-full bg-[#070b17]/80 border border-white/[0.08] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 ease-out hover:border-emerald-500/30 hover:bg-[#0a1020]/90 max-w-[56px] hover:max-w-[260px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon Circle */}
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.04] transition-colors group-hover:bg-white/[0.08] ${item.iconColor || ''}`}>
                <Icon className="size-6" />
              </div>

              {/* Text Content */}
              <div className="flex flex-col text-left pr-4 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100 delay-75">
                <span className="text-[13px] font-bold text-slate-200 transition-colors group-hover:text-emerald-400">
                  {displayTitle}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {item.sub}
                </span>
              </div>
            </a>
          )
        })}
      </div>

      {/* MOBILE VIEW: Bottom Sticky Bar */}
      {!pathname.startsWith('/cart') && !pathname.startsWith('/checkout') && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-[#050812]/95 backdrop-blur-xl border-t border-white/[0.05] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] h-14">
          {items.map((item) => {
            const Icon = item.icon
            const href = settings[item.key]
            const isExternal = item.key !== 'hotline'
            const linkProps = isExternal
              ? { href, target: '_blank', rel: 'noopener noreferrer' }
              : { href: `tel:${href.replace(/\\s+/g, '')}` }
            
            const shortLabel = item.key === 'facebook' ? 'Messenger' : item.key === 'zalo' ? 'Zalo' : 'Gọi ngay'

            return (
              <a
                key={`mobile-${item.key}`}
                {...linkProps}
                className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-slate-400 active:text-emerald-400 transition-colors bg-transparent active:bg-white/[0.02]"
              >
                <div className={`flex size-6 items-center justify-center ${item.iconColor || ''}`}>
                  <Icon className="size-full" />
                </div>
                <span className="text-[10px] font-medium">{shortLabel}</span>
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}
