'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Loader2, Package, Search, ShieldCheck, ShoppingCart, User } from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { cn, formatDateTime, formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'

interface AdminOrder {
  id: string
  status: string
  paymentMethod?: string
  totalAmount: number
  createdAt: string
  user: { name: string; email: string }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: { name: string }
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

export default function AdminOrdersPage() {
  const { replace } = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      replace(getAdminPath('/login'))
    }
  }, [user, authLoading, replace])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchOrders()
    }
  }, [user])

  async function fetchOrders() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error?.message || 'Không thể tải danh sách đơn hàng')
        return
      }

      setOrders(result.data || [])
    } catch {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error?.message || 'Lỗi cập nhật trạng thái')
        return
      }

      toast.success('Cập nhật trạng thái thành công')
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return orders

    return orders.filter((order) => (
      order.id.toLowerCase().includes(query) ||
      order.user.name.toLowerCase().includes(query) ||
      order.user.email.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    ))
  }, [orders, searchQuery])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="size-4" /> Vận hành đơn hàng
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Đơn Hàng</h1>
            <p className="text-muted-foreground mt-1">Theo dõi khách hàng, trạng thái và giá trị đơn.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-900 border border-white/5 px-4 py-2 rounded-xl">
            <ShoppingCart className="size-4 text-blue-400" />
            <span className="font-semibold">{orders.length}</span> đơn hàng
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, khách hàng, email hoặc trạng thái..."
            aria-label="Tìm kiếm đơn hàng"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-muted-foreground text-sm"
          />
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-blue-400 mb-2" />
              <p className="text-muted-foreground text-sm">Đang tải danh sách đơn hàng…</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Mã đơn</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4 pr-6 text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 pl-6">
                        <span className="font-mono text-xs text-blue-300 bg-slate-950 px-2 py-1 rounded border border-white/5">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white text-sm flex items-center gap-1.5">
                          <User className="size-4 text-slate-500" />
                          {order.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{order.user.email}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase font-extrabold tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5">
                          {paymentMethodLabels[order.paymentMethod || 'cod'] || 'COD'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-200">
                          <Package className="size-4 inline mr-1.5 text-slate-500" />
                          {order.items.length} dòng hàng
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {order.items.map((item) => `${item.product.name} x${item.quantity}`).join(', ') || 'Không có sản phẩm'}
                        </p>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-bold border outline-none appearance-none cursor-pointer',
                            statusClassName[order.status] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                          )}
                        >
                          <option value="AWAITING_PAYMENT" className="bg-slate-900 text-amber-500">Chờ thanh toán</option>
                          <option value="PENDING" className="bg-slate-900 text-indigo-400">Chờ xác nhận</option>
                          <option value="PROCESSING" className="bg-slate-900 text-blue-400">Đang xử lý</option>
                          <option value="DELIVERING" className="bg-slate-900 text-cyan-400">Đang giao hàng</option>
                          <option value="DELIVERED" className="bg-slate-900 text-emerald-400">Đã hoàn thành</option>
                          <option value="CANCELLED" className="bg-slate-900 text-red-400">Đã hủy</option>
                        </select>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        <Calendar className="size-3.5 inline mr-1.5 text-slate-500" />
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="p-4 pr-6 text-right font-mono font-bold text-emerald-400">
                        {formatPrice(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl m-4">
              <ShoppingCart className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-1">Không có đơn hàng</h3>
              <p className="text-muted-foreground text-sm">Chưa có dữ liệu đơn hàng phù hợp bộ lọc.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
