'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, ImageIcon, Loader2, Package, ReceiptText, ShoppingBag } from 'lucide-react'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatDateTime, formatPrice } from '@/lib/utils'

interface StoreOrder {
  id: string
  status: string
  paymentMethod?: string
  totalAmount: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    product: { name: string; imageUrl: string | null }
  }>
}

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
}

const statusClassName: Record<string, string> = {
  AWAITING_PAYMENT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  PENDING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELIVERING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán COD',
  bank: 'Chuyển khoản NH',
  momo: 'Ví Momo',
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' })
        const result = await res.json()
        setOrders(result.data || [])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user, authLoading])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <StoreNavbar />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Đơn hàng</h1>
          <p className="mt-2 text-sm text-slate-400">Theo dõi trạng thái và các sản phẩm trong đơn đã đặt.</p>
        </div>

        {authLoading || isLoading ? (
          <div className="flex items-center justify-center py-28">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-10 text-center shadow-sm">
            <ReceiptText className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h2 className="text-xl font-extrabold text-white">Bạn cần đăng nhập để xem đơn hàng</h2>
            <p className="mt-2 text-sm text-slate-400">Sau khi đăng nhập, các đơn hàng của tài khoản sẽ xuất hiện tại đây.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-indigo-500">
              Đăng nhập
            </Link>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 shadow-sm">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold text-indigo-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(order.createdAt)}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300 bg-slate-800 border border-white/5 rounded px-1.5 py-0.5">
                        {paymentMethodLabels[order.paymentMethod || 'cod'] || 'COD'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold border ${statusClassName[order.status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="font-mono text-lg font-extrabold text-white">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {order.status === 'AWAITING_PAYMENT' && order.paymentMethod === 'bank' && (
                  <div className="mt-4 p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col md:flex-row gap-5 items-center">
                    <div className="bg-white p-3 rounded-2xl w-40 h-40 flex items-center justify-center shrink-0 shadow-xl border border-white/10">
                      <img 
                        src={`https://img.vietqr.io/image/${process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank'}-${process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007'}-compact2.png?amount=${order.totalAmount}&addInfo=GEARZONE ${order.id.slice(0, 8).toUpperCase()}&accountName=${encodeURIComponent(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN VAN KHAI')}`} 
                        alt="Mã VietQR Thanh Toán" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 text-sm space-y-2 text-slate-300 w-full">
                      <h4 className="font-bold text-white text-base flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        Hướng dẫn chuyển khoản nhanh qua QR
                      </h4>
                      <p className="text-slate-400 text-xs">Mở app ngân hàng quét mã QR bên cạnh để thanh toán nhanh và chính xác nhất.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-3 border-t border-white/5">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Ngân hàng</span>
                          <span className="font-bold text-white uppercase">{process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Số tài khoản</span>
                          <span className="font-bold text-white font-mono text-base">{process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Chủ tài khoản</span>
                          <span className="font-bold text-white">{process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN VAN KHAI'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Số tiền</span>
                          <span className="font-bold text-emerald-400 font-mono text-base">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-white/5 font-mono text-xs">
                        <span className="text-slate-400 block text-[10px] mb-1">Nội dung chuyển khoản (bắt buộc ghi chính xác):</span>
                        <span className="text-indigo-400 font-extrabold text-sm select-all">GEARZONE {order.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-white/5">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 border border-white/5">
                          <ImageIcon className="h-5 w-5 text-slate-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{item.product.name}</p>
                        <p className="text-xs text-slate-400">Số lượng {item.quantity}</p>
                      </div>
                      <p className="font-mono text-sm font-bold text-indigo-200">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-10 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h2 className="text-xl font-extrabold text-white">Chưa có đơn hàng</h2>
            <p className="mt-2 text-sm text-slate-400">Khi bạn đặt hàng, thông tin đơn sẽ được hiển thị ở đây.</p>
            <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-indigo-500">
              <Package className="h-4 w-4" />
              Mua sản phẩm
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
