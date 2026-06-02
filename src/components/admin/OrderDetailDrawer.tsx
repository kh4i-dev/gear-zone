'use client'

import { Calendar, CheckCircle, Clock, CreditCard, DollarSign, Edit, Lock, Package, Receipt, User, X, AlertCircle, Loader2 } from 'lucide-react'
import { cn, formatDateTime, formatPrice } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface AdminOrder {
  id: string
  status: string
  paymentMethod?: string
  totalAmount: number
  shippingFee?: number
  discountAmount?: number
  createdAt: string
  user: { name: string; email: string }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: { name: string }
  }>
  paymentStatus?: string
  refundStatus?: string
  internalNote?: string
  shippingPhone?: string | null
  shippingAddress?: string | null
  shippingName?: string | null
  shippingCccd?: string | null
}

interface OrderDetailDrawerProps {
  order: AdminOrder | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: string) => void
  onConfirmAction: (action: { type: 'CANCEL' | 'REFUND' | 'DELETE', orderId: string }) => void
  isActionLoading?: boolean
}

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã hoàn thành',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
}

const statusBadgeClasses: Record<string, string> = {
  AWAITING_PAYMENT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  PENDING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELIVERING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  REFUNDED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán COD',
  bank: 'Chuyển khoản NH',
  momo: 'Ví Momo',
}

const getOrderCategory = (status: string) => {
  if (['AWAITING_PAYMENT', 'PENDING'].includes(status)) return 'PENDING'
  if (['PROCESSING', 'DELIVERING'].includes(status)) return 'PROCESSING'
  if (['DELIVERED', 'COMPLETED'].includes(status)) return 'COMPLETED'
  if (['CANCELLED', 'REFUNDED'].includes(status)) return 'CANCELLED'
  return 'ALL'
}

export function OrderDetailDrawer({ order, isOpen, onClose, onUpdateStatus, onConfirmAction, isActionLoading = false }: OrderDetailDrawerProps) {
  const [note, setNote] = useState(order?.internalNote || '')
  const [isSavingNote, setIsSavingNote] = useState(false)

  useEffect(() => {
    setNote(order?.internalNote || '')
  }, [order?.internalNote])

  const handleSaveNote = async () => {
    if (!order) return
    if (note === order.internalNote) return
    
    setIsSavingNote(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNote: note })
      })
      
      if (res.ok) {
        toast.success('Đã lưu ghi chú nội bộ')
      } else {
        toast.error('Không thể lưu ghi chú')
      }
    } catch {
      toast.error('Lỗi khi lưu ghi chú')
    } finally {
      setIsSavingNote(false)
    }
  }

  if (!order) return null;

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 cursor-default border-0 p-0 m-0 appearance-none",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-label="Đóng chi tiết đơn hàng"
      />
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-[60] w-full max-w-[640px] sm:w-[560px] bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Chi tiết đơn hàng
              <span className="font-mono text-sm bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="size-3" />
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 sm:space-y-8 scrollbar-hide">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Clock className="size-4" /> Trạng thái & Thao tác</h3>
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={cn('inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border', statusBadgeClasses[order.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
                  {statusLabels[order.status] || order.status}
                </span>
                {getOrderCategory(order.status) === 'PENDING' && (
                  <span className="text-xs text-slate-400 flex items-center gap-1"><AlertCircle className="size-3" /> Chờ admin xử lý</span>
                )}
              </div>
              
              <div className="flex gap-2 shrink-0">
                {order.status === 'PENDING' && (
                  <button type="button" disabled={isActionLoading} onClick={() => onUpdateStatus(order.id, 'PROCESSING')} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Nhận xử lý
                  </button>
                )}
                {['PENDING', 'PROCESSING'].includes(order.status) && (
                  <button type="button" disabled={isActionLoading} onClick={() => onConfirmAction({ type: 'CANCEL', orderId: order.id })} className="px-3 py-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-white/80 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Hủy đơn
                  </button>
                )}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="size-4" /> Khách hàng</h3>
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex items-start gap-4">
              <div className="size-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                {order.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{order.user.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{order.user.email}</p>
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Số điện thoại</p>
                    {order.shippingPhone ? (
                      <p className="text-xs text-slate-200 font-medium">{order.shippingPhone}</p>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium italic">Chưa có dữ liệu</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Địa chỉ giao</p>
                    {order.shippingAddress ? (
                      <p className="text-xs text-slate-200 font-medium">{order.shippingAddress}</p>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium italic">Chưa có dữ liệu</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Package className="size-4" /> Sản phẩm ({order.items.length})</h3>
            <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {order.items.map((item, idx) => (
                <div key={item.id || idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-200 line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">ID: {item.id.slice(-6)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatPrice(item.price)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Receipt className="size-4" /> Thanh toán</h3>
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <CreditCard className="size-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phương thức</p>
                    <p className="text-sm font-bold text-white">{paymentMethodLabels[order.paymentMethod || 'cod'] || 'COD'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Trạng thái TT</p>
                  <p className="text-sm font-medium text-slate-300 mt-0.5">Đã xác nhận</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Tạm tính</span>
                  <span>{formatPrice(order.totalAmount - (order.shippingFee || 0) + (order.discountAmount || 0))}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(order.shippingFee || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Giảm giá</span>
                  <span>{order.discountAmount ? `-${formatPrice(order.discountAmount)}` : '0 ₫'}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="font-bold text-white">Tổng cộng</span>
                  <span className="font-black text-emerald-400 text-xl">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="pb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Lock className="size-4" /> Ghi chú nội bộ</h3>
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Edit className="size-3" /> Ghi chú (Chỉ Admin)</h4>
                {isSavingNote && <Loader2 className="size-3 animate-spin text-blue-400" />}
              </div>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSaveNote}
                aria-label="Ghi chú nội bộ"
                placeholder="Nhập ghi chú vận hành, lý do hủy đơn, hẹn khách..."
                className="w-full bg-slate-950/50 border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-slate-300 resize-none h-20 transition-all"
                disabled={isSavingNote}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
