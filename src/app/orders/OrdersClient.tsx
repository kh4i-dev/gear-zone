'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Package, Search, Calendar, CreditCard, MapPin, User, Clock, 
  ArrowRight, ShoppingBag, Loader2, CheckCircle2, XCircle, 
  AlertCircle, Copy, Check, ChevronDown, ChevronUp, ArrowLeft,
  QrCode, Landmark, LandmarkIcon
} from 'lucide-react'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { getSafeImageSrc } from '@/lib/product-images'

type OrderStatus = 'PENDING' | 'AWAITING_PAYMENT' | 'COMPLETED' | 'CANCELLED'

interface OrderItem {
  id: string
  productId: string
  variantId: string | null
  quantity: number
  price: number
  product: {
    name: string
    imageUrl: string | null
  }
  variant?: {
    sku: string | null
    imageUrl: string | null
    optionValues: Array<{
      optionValue: {
        label: string
        option: {
          name: string
        }
      }
    }>
  } | null
}

interface Order {
  id: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: 'cod' | 'bank'
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCccd: string | null
  createdAt: string
  items: OrderItem[]
}

interface Settings {
  shop_name?: string
  logo_url?: string | null
  vietqr_bank_id?: string
  vietqr_account_no?: string
  vietqr_account_name?: string
}

export default function OrdersClient({ shopName = 'GearZone' }: { shopName?: string }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL')
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activePaymentModalOrder, setActivePaymentModalOrder] = useState<Order | null>(null)
  const [settings, setSettings] = useState<Settings>({})

  // Fetch orders when user changes or page mounts
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsFetching(false)
      return
    }

    async function fetchOrdersAndSettings() {
      setIsFetching(true)
      setError(null)
      try {
        const [ordersRes, settingsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/settings')
        ])

        if (!ordersRes.ok) {
          throw new Error('Không thể tải danh sách đơn hàng')
        }

        const ordersResult = await ordersRes.json()
        const settingsResult = await settingsRes.json()

        if (ordersResult.data) {
          setOrders(ordersResult.data)
        }

        if (settingsResult.data) {
          setSettings(settingsResult.data)
        }
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu đơn hàng:', err)
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu đơn hàng')
      } finally {
        setIsFetching(false)
      }
    }

    fetchOrdersAndSettings()
  }, [user, authLoading])

  const handleLoginClick = () => {
    // Append auth=login query string to currently loaded page which will open standard login overlay modal
    router.push('/orders?auth=login')
  }

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('Đã sao chép mã đơn hàng!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyPaymentInfo = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  // Filter orders based on status tab and search queries
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        order.shippingName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        order.shippingPhone.includes(searchQuery.trim())

      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, searchQuery])

  // Map database status string values to beautiful client-friendly status metadata
  const getStatusBadgeMeta = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          text: 'Chờ xử lý',
          classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
          icon: Clock
        }
      case 'AWAITING_PAYMENT':
        return {
          text: 'Chờ thanh toán',
          classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
          icon: Clock
        }
      case 'COMPLETED':
        return {
          text: 'Hoàn thành',
          classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
          icon: CheckCircle2
        }
      case 'CANCELLED':
        return {
          text: 'Đã hủy',
          classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
          icon: XCircle
        }
      default:
        return {
          text: 'Chưa rõ',
          classes: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
          icon: AlertCircle
        }
    }
  }

  // Get active bank details from either settings API or system env configuration as a fallback
  const paymentDetails = useMemo(() => {
    return {
      bankId: settings.vietqr_bank_id || process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank',
      accountNo: settings.vietqr_account_no || process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007',
      accountName: settings.vietqr_account_name || process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN VAN KHAI',
    }
  }, [settings])

  if (authLoading || (isFetching && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <StoreNavbar />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="size-12 animate-spin text-indigo-500" />
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Đang tải thông tin đơn hàng...</p>
        </div>
        <footer className="border-t border-white/5 py-8 bg-slate-950 text-center">
          <p className="text-xs text-slate-500">© 2026 {shopName}. All rights reserved. Built for professional gamers.</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <StoreNavbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Guest State - Ask to Sign In */}
        {!user ? (
          <div className="max-w-md mx-auto my-12 p-1.5 rounded-[2rem] bg-white/[0.03] ring-1 ring-white/[0.06] shadow-2xl">
            <div className="relative rounded-[calc(2rem-6px)] bg-[#0a0a0a] p-8 text-center overflow-hidden">
              <div className="absolute -top-24 -left-24 size-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20 mb-6 relative">
                <Landmark className="size-6 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight text-white mb-3">Tra Cứu Đơn Hàng</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                Vui lòng đăng nhập tài khoản của bạn để xem lịch sử mua hàng, chi tiết thanh toán và cập nhật trạng thái vận chuyển tức thì.
              </p>
              
              <button
                type="button"
                onClick={handleLoginClick}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer border-0"
              >
                Đăng nhập ngay
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header section with order quantity count */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Đơn hàng của bạn</h1>
                <p className="text-xs text-slate-400 mt-1.5">
                  Lịch sử và trạng thái các đơn hàng đã đặt tại cửa hàng.
                </p>
              </div>
              
              <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-all">
                <ShoppingBag className="size-4" />
                Tiếp tục mua sắm
              </Link>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold border-0 cursor-pointer"
                >
                  Tải lại
                </button>
              </div>
            )}

            {/* List & Search State */}
            {orders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/10 py-20 text-center backdrop-blur-md">
                <Package className="mx-auto size-16 text-slate-600 mb-4 opacity-50 animate-glow-pulse" />
                <h3 className="text-lg font-bold text-white mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
                  Bạn chưa thực hiện bất kỳ giao dịch mua bán nào tại {shopName}. Hãy khám phá và thêm các thiết bị gaming gear cao cấp vào giỏ hàng ngay!
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Mua sắm ngay
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Filters Row */}
                <div className="p-1.5 rounded-[1.25rem] bg-white/[0.03] ring-1 ring-white/[0.06] shadow-xl">
                  <div className="rounded-[calc(1.25rem-6px)] bg-[#0a0a0a] p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                    
                    {/* Search Field */}
                    <div className="relative w-full md:max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo Mã đơn hàng..."
                        aria-label="Tìm mã đơn hàng"
                        className="h-10 w-full rounded-xl border-0 bg-slate-950/60 ring-1 ring-white/10 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all duration-300"
                      />
                    </div>

                    {/* Filter Status Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
                      {[
                        { key: 'ALL', label: 'Tất cả' },
                        { key: 'PENDING', label: 'Chờ xử lý' },
                        { key: 'AWAITING_PAYMENT', label: 'Chờ thanh toán' },
                        { key: 'COMPLETED', label: 'Hoàn thành' },
                        { key: 'CANCELLED', label: 'Đã hủy' }
                      ].map(tab => {
                        const isSelected = statusFilter === tab.key
                        return (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStatusFilter(tab.key as any)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border-0 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
                                : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Listing Grid */}
                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
                    <Search className="mx-auto size-10 text-slate-700 mb-3 opacity-60" />
                    <p className="text-slate-400 text-xs font-medium">Không tìm thấy đơn hàng nào khớp với tìm kiếm.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => {
                      const isExpanded = expandedOrders[order.id]
                      const badge = getStatusBadgeMeta(order.status)
                      const isAwaitingPayment = order.status === 'AWAITING_PAYMENT'
                      const isBankTransfer = order.paymentMethod === 'bank'
                      const dateStr = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })

                      return (
                        <div
                          key={order.id}
                          className="group p-1 rounded-2xl bg-white/[0.02] hover:bg-white/[0.03] ring-1 ring-white/[0.06] hover:ring-white/10 transition-all duration-500 shadow-md"
                        >
                          <div className="rounded-[calc(2xl-4px)] bg-[#0a0a0a] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-4">
                            
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 inline-flex items-center gap-1.5 relative select-none">
                                  #{order.id.slice(0, 12)}...
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyOrderId(order.id, e)}
                                    className="p-0.5 rounded text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition-all outline-none border-0 cursor-pointer"
                                    title="Sao chép mã đơn đầy đủ"
                                  >
                                    <Copy className="size-3" />
                                  </button>
                                </span>
                                
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-lg ${badge.classes} inline-flex items-center gap-1.5 select-none`}>
                                  <badge.icon className="size-3.5" />
                                  {badge.text}
                                </span>
                              </div>

                              <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1">
                                <Calendar className="size-3.5" />
                                {dateStr}
                              </span>
                            </div>

                            {/* Card Body - Products List */}
                            <div className="divide-y divide-white/[0.04] space-y-3.5">
                              {order.items.map((item, idx) => {
                                const variantText = item.variant?.optionValues
                                  ?.map(val => val.optionValue.label)
                                  .join(' / ')

                                const thumbUrl = item.variant?.imageUrl || item.product.imageUrl
                                
                                return (
                                  <div key={item.id} className={`flex gap-4 ${idx > 0 ? 'pt-3.5' : ''}`}>
                                    
                                    {/* Product Thumbnail */}
                                    <div className="size-16 relative bg-white border border-white/10 rounded-xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-1.5">
                                      <Image
                                        src={getSafeImageSrc(thumbUrl)}
                                        alt={item.product.name}
                                        fill
                                        sizes="64px"
                                        className="object-contain"
                                      />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                      <h4 className="font-bold text-[13px] text-slate-200 line-clamp-1 leading-snug">
                                        {item.product.name}
                                      </h4>
                                      
                                      {variantText && (
                                        <span className="text-[10px] font-bold text-emerald-400/90 w-fit rounded bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 mt-1 select-none">
                                          {variantText}
                                        </span>
                                      )}

                                      <div className="flex items-center justify-between text-[11px] mt-1.5">
                                        <span className="text-slate-500 font-medium">
                                          x{item.quantity} • <span className="text-slate-600">{formatPrice(item.price)}</span>
                                        </span>
                                        <span className="font-extrabold text-slate-200">
                                          {formatPrice(item.price * item.quantity)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Collapsible Shipping Info */}
                            {isExpanded && (
                              <div className="border-t border-white/5 pt-4 mt-4 text-xs space-y-3.5 bg-white/[0.01] p-4.5 rounded-2xl ring-1 ring-white/[0.04] animate-in fade-in slide-in-from-top-1 duration-200">
                                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">
                                  Thông tin nhận hàng
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center text-slate-400 gap-2 font-medium">
                                      <User className="size-4 text-slate-500 shrink-0" />
                                      <span>Người nhận: <span className="text-slate-200 font-semibold">{order.shippingName}</span></span>
                                    </div>
                                    <div className="flex items-center text-slate-400 gap-2 font-medium">
                                      <Clock className="size-4 text-slate-500 shrink-0" />
                                      <span>Điện thoại: <span className="text-slate-200 font-semibold font-mono">{order.shippingPhone}</span></span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-start text-slate-400 gap-2 font-medium">
                                      <MapPin className="size-4 text-slate-500 shrink-0 mt-0.5" />
                                      <span>Địa chỉ: <span className="text-slate-200 font-semibold leading-relaxed">{order.shippingAddress}</span></span>
                                    </div>
                                    {order.shippingCccd && (
                                      <div className="flex items-center text-slate-400 gap-2 font-medium">
                                        <LandmarkIcon className="size-4 text-slate-500 shrink-0" />
                                        <span>CCCD: <span className="text-slate-200 font-semibold font-mono">{order.shippingCccd}</span></span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Card Footer */}
                            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
                              <div className="flex flex-wrap items-center gap-3.5 text-xs">
                                
                                {/* Expander Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleOrderExpand(order.id)}
                                  className="inline-flex items-center gap-1 font-bold text-slate-400 hover:text-slate-200 border-0 bg-transparent p-0 cursor-pointer outline-none"
                                >
                                  {isExpanded ? (
                                    <>
                                      Ẩn chi tiết
                                      <ChevronUp className="size-4" />
                                    </>
                                  ) : (
                                    <>
                                      Hiện chi tiết
                                      <ChevronDown className="size-4" />
                                    </>
                                  )}
                                </button>
                                
                                <span className="text-slate-600 font-semibold">|</span>

                                {/* Payment Method display */}
                                <span className="text-slate-400 font-bold inline-flex items-center gap-1.5 select-none">
                                  <CreditCard className="size-4 text-indigo-400" />
                                  {order.paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản'}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                                
                                {/* Total Amount */}
                                <div className="text-right flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tổng tiền thanh toán</span>
                                  <span className="text-lg font-extrabold text-indigo-400 mt-0.5">{formatPrice(order.totalAmount)}</span>
                                </div>

                                {/* Pay Now CTA Button */}
                                {isAwaitingPayment && isBankTransfer && (
                                  <button
                                    type="button"
                                    onClick={() => setActivePaymentModalOrder(order)}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-xs font-extrabold text-white transition-all shadow-md shadow-emerald-600/10 active:scale-95 border-0 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                                  >
                                    <QrCode className="size-4" />
                                    Thanh toán ngay
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Payment Instruction Modal */}
      {activePaymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Glass Backdrop */}
          <button 
            type="button"
            onClick={() => setActivePaymentModalOrder(null)}
            aria-label="Đóng bảng thanh toán"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer border-0 p-0 text-left outline-none"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh] overflow-y-auto">
            
            {/* Glow decoration */}
            <div className="absolute -top-24 -left-24 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-400 ring-1 ring-emerald-500/20 mb-3">
                <QrCode className="size-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Quét Mã VietQR</h2>
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng mở ứng dụng ngân hàng và quét mã để thanh toán đơn hàng.
              </p>
            </div>

            {/* Payment Info Table */}
            <div className="space-y-4">
              
              {/* Dynamic QR Code Render */}
              <div className="relative mx-auto size-52 bg-white rounded-2xl overflow-hidden p-2.5 shadow-xl border border-white/15">
                <Image
                  src={`https://img.vietqr.io/image/${paymentDetails.bankId}-${paymentDetails.accountNo}-compact2.png?amount=${activePaymentModalOrder.totalAmount}&addInfo=${encodeURIComponent(`GZ ${activePaymentModalOrder.id.slice(0, 10)}`)}&accountName=${encodeURIComponent(paymentDetails.accountName)}`}
                  alt="Mã QR thanh toán ngân hàng"
                  width={200}
                  height={200}
                  className="size-full object-contain"
                />
              </div>

              {/* Monospace Copyable Details */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4.5 space-y-3">
                
                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-500 font-bold">Ngân hàng thụ hưởng:</span>
                  <span className="font-extrabold text-slate-200 uppercase">{paymentDetails.bankId}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-500 font-bold">Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-200 tracking-wider">{paymentDetails.accountNo}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPaymentInfo(paymentDetails.accountNo, 'Đã sao chép số tài khoản!')}
                      className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition border-0 bg-transparent cursor-pointer outline-none"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-500 font-bold">Tên người nhận:</span>
                  <span className="font-bold text-slate-200">{paymentDetails.accountName}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
                  <span className="text-slate-500 font-bold">Số tiền chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-400 font-mono tracking-wide">{formatPrice(activePaymentModalOrder.totalAmount)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPaymentInfo(String(activePaymentModalOrder.totalAmount), 'Đã sao chép số tiền!')}
                      className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition border-0 bg-transparent cursor-pointer outline-none"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/25 tracking-wider">{`GZ ${activePaymentModalOrder.id.slice(0, 10)}`}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPaymentInfo(`GZ ${activePaymentModalOrder.id.slice(0, 10)}`, 'Đã sao chép nội dung chuyển khoản!')}
                      className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition border-0 bg-transparent cursor-pointer outline-none"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Instructions Callout */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4 flex gap-3 text-xs leading-relaxed text-slate-400">
                <AlertCircle className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <span className="text-emerald-400 font-bold">Lưu ý quan trọng:</span> Quý khách vui lòng chuyển đúng chính xác <span className="text-slate-200 font-semibold">số tiền</span> và <span className="text-slate-200 font-semibold">nội dung chuyển khoản</span> ở trên. Hệ thống tự động xác nhận đơn hàng sau 1-3 phút kể từ khi nhận đủ tiền.
                </p>
              </div>

              {/* Close Action */}
              <button
                type="button"
                onClick={() => setActivePaymentModalOrder(null)}
                className="w-full h-11 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-all mt-2 active:scale-98 cursor-pointer"
              >
                Đóng bảng hướng dẫn
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-slate-950 text-center">
        <p className="text-xs text-slate-500">© 2026 {shopName}. All rights reserved. Built for professional gamers.</p>
      </footer>
    </div>
  )
}
