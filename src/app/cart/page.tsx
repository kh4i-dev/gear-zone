import { Metadata } from 'next'
import { Suspense } from 'react'
import CartClient from './CartClient'
import { Loader2 } from 'lucide-react'
import { getSiteSettings } from '@/lib/settings'
 
export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Xem và quản lý giỏ hàng của bạn.',
}
 
export default async function CartPage() {
  const { shopName } = await getSiteSettings()
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
        <span className="text-sm text-slate-400 mt-2">Đang tải giỏ hàng…</span>
      </div>
    }>
      <CartClient shopName={shopName} />
    </Suspense>
  )
}
