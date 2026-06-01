'use client'

import { useEffect, useState } from 'react'
import { Phone, MessageCircle } from 'lucide-react'

interface ContactSettings {
  hotline: string
  zalo: string
  facebook: string
}

const contactItems = [
  {
    key: 'facebook' as const,
    label: 'Messenger',
    icon: MessageCircle,
    color: 'bg-[#0084FF]',
    hoverColor: 'hover:bg-[#0084FF]',
  },
  {
    key: 'zalo' as const,
    label: 'Zalo',
    icon: null,
    color: 'bg-[#0068FF]',
    hoverColor: 'hover:bg-[#0068FF]',
    customIcon: (
      <span className="text-[11px] font-black leading-none tracking-tight">ZALO</span>
    ),
  },
  {
    key: 'hotline' as const,
    label: 'Hotline',
    icon: Phone,
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-500',
  },
]

export function FloatingContactWidget() {
  const [settings, setSettings] = useState<ContactSettings | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
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

  return (
    <div
      className="fixed right-4 bottom-4 z-50 flex flex-col gap-3 md:right-6 md:bottom-6"
      role="navigation"
      aria-label="Liên hệ nhanh"
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const href = settings[item.key]
        const isExternal = item.key !== 'hotline'
        const linkProps = isExternal
          ? { href, target: '_blank', rel: 'noopener noreferrer' }
          : { href: `tel:${href.replace(/\s+/g, '')}` }

        return (
          <a
            key={item.key}
            {...linkProps}
            className={`group relative flex size-12 items-center justify-center rounded-full text-white shadow-lg backdrop-blur-sm transition-all duration-300 ease-out ${item.color} ${item.hoverColor} hover:scale-110 hover:shadow-xl active:scale-95`}
            style={{ animationDelay: `${index * 100}ms` }}
            aria-label={item.label}
          >
            {item.customIcon || (Icon && <Icon className="size-5" />)}

            <span className="absolute right-full mr-3 hidden items-center rounded-lg bg-slate-900/95 px-3 py-1.5 text-[13px] font-semibold text-white shadow-lg backdrop-blur-sm whitespace-nowrap md:group-hover:flex">
              {item.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}
