'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Calendar, Loader2, Package, Search, ShieldCheck, ShoppingCart, User, MoreVertical, X, Clock, CheckCircle, XCircle, CreditCard, DollarSign, Wallet, Building, AlertTriangle, Eye, History, Edit, Receipt, FileText, ChevronRight, Lock, MessageSquare, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { cn, formatDateTime, formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'

// Dynamic import the drawer to reduce bundle size
const OrderDetailDrawer = dynamic(
  () => import('@/components/admin/OrderDetailDrawer').then(mod => mod.OrderDetailDrawer),
  { ssr: false }
)

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
  paymentStatus?: string
  internalNote?: string
}

type TabStatus = 'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

const statusLabels: Record<string, string> = {
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  DELIVERING: 'Đang giao hàng',
  DELIVERED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
}

const statusBadgeClasses: Record<string, string> = {
  AWAITING_PAYMENT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  PENDING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELIVERING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  REFUNDED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const paymentMethodLabels: Record<string, string> = {
  cod: 'Thanh toán COD',
  bank: 'Chuyển khoản NH',
  momo: 'Ví Momo',
}

const getOrderCategory = (status: string): TabStatus => {
  if (['AWAITING_PAYMENT', 'PENDING'].includes(status)) return 'PENDING'
  if (['PROCESSING', 'DELIVERING'].includes(status)) return 'PROCESSING'
  if (['DELIVERED', 'COMPLETED'].includes(status)) return 'COMPLETED'
  if (['CANCELLED', 'REFUNDED'].includes(status)) return 'CANCELLED'
  return 'ALL'
}

export function OrdersClient() {
  const { replace } = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<TabStatus>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [confirmAction, setConfirmAction] = useState<{ type: 'CANCEL' | 'REFUND' | 'DELETE', orderId: string } | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const dropdownRef = useRef<HTMLTableSectionElement>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeDrawer()
      }
      window.addEventListener('keydown', handleEsc)
      return () => {
        window.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = 'unset'
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => { document.body.style.overflow = 'unset' }
  }, [isDrawerOpen])

  async function fetchOrders() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/orders', { credentials: 'include' })
      const result = await res.json()
      if (res.ok) {
        const fetchedOrders = result.data || []
        setOrders(fetchedOrders)

        // Automatically switch tab if PENDING is empty
        if (fetchedOrders.length > 0) {
          let hasPending = false, hasProcessing = false, hasCompleted = false;
          for (const o of fetchedOrders) {
            const cat = getOrderCategory(o.status)
            if (cat === 'PENDING') hasPending = true
            else if (cat === 'PROCESSING') hasProcessing = true
            else if (cat === 'COMPLETED') hasCompleted = true
          }
          if (hasPending) setActiveTab('PENDING')
          else if (hasProcessing) setActiveTab('PROCESSING')
          else if (hasCompleted) setActiveTab('COMPLETED')
          else setActiveTab('ALL')
        }
      } else {
        toast.error(result.error?.message || 'Không thể tải danh sách đơn hàng')
      }
    } catch {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsActionLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await res.json()
      if (res.ok) {
        toast.success('Cập nhật trạng thái thành công')
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        }
      } else {
        toast.error(result.error?.message || 'Lỗi cập nhật trạng thái')
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái')
    } finally {
      setIsActionLoading(false)
      setConfirmAction(null)
      setActiveMenu(null)
    }
  }

  const openDrawer = (order: AdminOrder) => {
    setSelectedOrder(order)
    setIsDrawerOpen(true)
    setActiveMenu(null)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const category = getOrderCategory(order.status)
      if (activeTab !== 'ALL' && category !== activeTab) {
        return false
      }

      if (paymentFilter !== 'ALL' && (order.paymentMethod || 'cod') !== paymentFilter) return false

      const query = searchQuery.trim().toLowerCase()
      if (query) {
        const matches = 
          order.id.toLowerCase().includes(query) ||
          order.user.name.toLowerCase().includes(query) ||
          order.user.email.toLowerCase().includes(query) ||
          order.items.some(item => item.product.name.toLowerCase().includes(query))
        
        if (!matches) return false
      }

      return true
    }).sort((a, b) => {
      if (activeTab === 'ALL') {
        const aCat = getOrderCategory(a.status)
        const bCat = getOrderCategory(b.status)
        if (aCat === 'CANCELLED' && bCat !== 'CANCELLED') return 1
        if (aCat !== 'CANCELLED' && bCat === 'CANCELLED') return -1
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [orders, activeTab, searchQuery, paymentFilter])

  const stats = useMemo(() => {
    let pending = 0, processing = 0, completed = 0, cancelled = 0, revenue = 0
    orders.forEach(o => {
      const cat = getOrderCategory(o.status)
      if (cat === 'PENDING') pending++
      else if (cat === 'PROCESSING') processing++
      else if (cat === 'COMPLETED') { completed++; revenue += o.totalAmount }
      else if (cat === 'CANCELLED') cancelled++
    })
    return { total: orders.length, pending, processing, completed, cancelled, revenue }
  }, [orders])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const renderEmptyState = () => {
    const messages = {
      ALL: 'Không tìm thấy đơn hàng nào.',
      PENDING: 'Không có đơn chờ duyệt. Bạn đã xử lý hết các đơn mới!',
      PROCESSING: 'Không có đơn đang xử lý.',
      COMPLETED: 'Không có đơn đã hoàn tất trong bộ lọc hiện tại.',
      CANCELLED: 'Không có đơn đã hủy.'
    }
    
    return (
      <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl mx-4 my-8 bg-slate-900/20">
        <ShoppingCart className="size-16 text-slate-700 mx-auto mb-4 opacity-50" />
        <h3 className="font-semibold text-lg mb-1 text-slate-300">{messages[activeTab]}</h3>
        {activeTab === 'PENDING' && stats.cancelled > 0 && stats.processing === 0 && (
          <p className="text-slate-500 text-sm mt-2">Hiện không có đơn vận hành. Có <span className="text-slate-400 font-bold">{stats.cancelled}</span> đơn đã hủy trong lưu trữ.</p>
        )}
        <p className="text-slate-500 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="size-4" /> Vận hành hệ thống
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Trung Tâm Đơn Hàng</h1>
            <p className="text-slate-400 mt-1 text-sm">Theo dõi tiến độ, xử lý giao dịch và phản hồi khách hàng.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          <button type="button" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex flex-col justify-between hover:bg-slate-900/60 transition-colors cursor-pointer text-left" onClick={() => setActiveTab('ALL')}>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Tổng đơn</span>
            <span className="text-2xl font-black">{stats.total}</span>
          </button>
          <button type="button" className={cn("bg-slate-900/40 backdrop-blur-md rounded-2xl border p-4 flex flex-col justify-between hover:bg-slate-900/60 transition-colors cursor-pointer text-left", activeTab === 'PENDING' ? "border-indigo-500/40" : "border-indigo-500/10")} onClick={() => setActiveTab('PENDING')}>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">Cần xử lý</span>
            <span className="text-2xl font-black text-indigo-400">{stats.pending}</span>
          </button>
          <button type="button" className={cn("bg-slate-900/40 backdrop-blur-md rounded-2xl border p-4 flex flex-col justify-between hover:bg-slate-900/60 transition-colors cursor-pointer text-left", activeTab === 'PROCESSING' ? "border-blue-500/40" : "border-blue-500/10")} onClick={() => setActiveTab('PROCESSING')}>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">Đang xử lý</span>
            <span className="text-2xl font-black text-blue-400">{stats.processing}</span>
          </button>
          <button type="button" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-emerald-500/10 p-4 flex flex-col justify-between hover:bg-slate-900/60 transition-colors cursor-pointer text-left" onClick={() => setActiveTab('COMPLETED')}>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">Hoàn tất</span>
            <span className="text-2xl font-black text-emerald-400">{stats.completed}</span>
          </button>
          <button type="button" className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-500/10 p-4 flex flex-col justify-between hover:bg-slate-900/60 transition-colors cursor-pointer text-left" onClick={() => setActiveTab('CANCELLED')}>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Đã hủy</span>
            <span className="text-2xl font-black text-slate-400">{stats.cancelled}</span>
          </button>
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex flex-col justify-between">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2 line-clamp-1">Doanh thu hợp lệ</span>
            <span className="text-lg md:text-xl font-black text-amber-400 truncate" title={formatPrice(stats.revenue)}>{formatPrice(stats.revenue)}</span>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex bg-slate-900/80 p-1 border border-white/5 rounded-xl w-fit overflow-x-auto scrollbar-hide">
            {[
              { id: 'PENDING', label: 'Cần xử lý' },
              { id: 'PROCESSING', label: 'Đang xử lý' },
              { id: 'COMPLETED', label: 'Hoàn tất' },
              { id: 'ALL', label: 'Tất cả' },
              { id: 'CANCELLED', label: 'Đã hủy / Lưu trữ' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabStatus)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <label htmlFor="paymentFilter" className="sr-only">Lọc theo phương thức thanh toán</label>
              <select
                id="paymentFilter"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full sm:w-auto pl-4 pr-8 py-2 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm appearance-none text-slate-300"
              >
                <option value="ALL">Tất cả thanh toán</option>
                <option value="cod">COD</option>
                <option value="bank">Chuyển khoản</option>
                <option value="momo">Ví Momo</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="size-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            
            <div className="relative flex-1 sm:w-64">
              <label htmlFor="searchOrders" className="sr-only">Tìm kiếm đơn hàng</label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <input
                id="searchOrders"
                type="text"
                placeholder="Tìm mã đơn, KH, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-blue-400 mb-2" />
              <p className="text-slate-400 text-sm">Đang tải danh sách đơn hàng…</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6 w-32">Mã đơn</th>
                    <th className="p-4 w-48">Khách hàng</th>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4 w-36">Thanh toán</th>
                    <th className="p-4 w-36">Trạng thái đơn</th>
                    <th className="p-4 w-32">Ngày tạo</th>
                    <th className="p-4 text-right w-32">Tổng tiền</th>
                    <th className="p-4 pr-6 text-center w-16">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm" ref={dropdownRef}>
                  {filteredOrders.map((order) => {
                    const statusClass = statusBadgeClasses[order.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    const statusLabel = statusLabels[order.status] || order.status
                    
                    let payIcon = <CreditCard className="size-3 text-slate-400 mr-1" />
                    if (order.paymentMethod === 'bank') payIcon = <Building className="size-3 text-blue-400 mr-1" />
                    if (order.paymentMethod === 'cod') payIcon = <DollarSign className="size-3 text-emerald-400 mr-1" />
                    if (order.paymentMethod === 'momo') payIcon = <Wallet className="size-3 text-pink-400 mr-1" />

                    const isCancelled = getOrderCategory(order.status) === 'CANCELLED'

                    return (
                      <tr key={order.id} className={cn("hover:bg-slate-900/60 transition-colors", isCancelled && "opacity-60")}>
                        <td className="p-4 pl-6 align-top">
                          <button type="button" onClick={() => openDrawer(order)} className="font-mono text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </button>
                        </td>
                        <td className="p-4 align-top">
                          <p className="font-bold text-white text-sm line-clamp-1" title={order.user.name}>{order.user.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1" title={order.user.email}>{order.user.email}</p>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <p key={item.id || idx} className="text-xs text-slate-300 line-clamp-1">
                                <span className="text-slate-500 mr-1">{item.quantity}x</span> {item.product.name}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">+ {order.items.length - 2} sản phẩm khác</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider text-slate-300 bg-slate-900 border border-white/10 rounded px-2 py-1 whitespace-nowrap">
                              {payIcon} {paymentMethodLabels[order.paymentMethod || 'cod'] || 'COD'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium italic">
                              Đã xác nhận
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <span className={cn('inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border', statusClass)}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-300">{formatDateTime(order.createdAt).split(' ')[1]}</span>
                            <span className="text-[10px]">{formatDateTime(order.createdAt).split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right font-mono font-bold text-white align-top">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="p-4 pr-6 align-top text-right">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                              aria-label="More options"
                              className={cn(
                                "p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                activeMenu === order.id ? "bg-slate-800 text-white" : "bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                              )}
                            >
                              <MoreVertical className="size-4" />
                            </button>
                            {activeMenu === order.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-slate-800 border border-white/10 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden text-left">
                                <div className="py-1">
                                  <button type="button" onClick={() => { openDrawer(order); setActiveMenu(null) }} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                                    <Eye className="size-3.5 mr-2" /> Xem chi tiết
                                  </button>
                                  <button type="button" onClick={() => { openDrawer(order); setActiveMenu(null) }} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                                    <History className="size-3.5 mr-2" /> Lịch sử / Timeline
                                  </button>
                                  <button type="button" onClick={() => { openDrawer(order); setActiveMenu(null) }} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                                    <Edit className="size-3.5 mr-2" /> Ghi chú nội bộ
                                  </button>
                                  
                                  <div className="border-t border-white/5 my-1"></div>
                                  
                                  {order.status === 'PENDING' && (
                                    <button type="button" onClick={() => handleUpdateStatus(order.id, 'PROCESSING')} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-slate-700">
                                      <Package className="size-3.5 mr-2" /> Đánh dấu đang xử lý
                                    </button>
                                  )}
                                  
                                  {['PROCESSING', 'DELIVERING'].includes(order.status) && (
                                    <button type="button" onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-700">
                                      <CheckCircle className="size-3.5 mr-2" /> Hoàn tất đơn
                                    </button>
                                  )}
                                  
                                  {!['CANCELLED', 'REFUNDED', 'DELIVERED'].includes(order.status) && (
                                    <button type="button" onClick={() => setConfirmAction({ type: 'CANCEL', orderId: order.id })} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10">
                                      <XCircle className="size-3.5 mr-2" /> Hủy đơn
                                    </button>
                                  )}
                                  
                                  {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                                    <button type="button" onClick={() => setConfirmAction({ type: 'REFUND', orderId: order.id })} className="flex w-full items-center px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10">
                                      <DollarSign className="size-3.5 mr-2" /> Hoàn tiền (Refund)
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : renderEmptyState()}
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="size-6" />
              </div>
              <h2 className="text-xl font-bold">Xác nhận thao tác nguy hiểm</h2>
            </div>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Bạn đang thực hiện thao tác <strong className="text-white">{confirmAction.type === 'CANCEL' ? 'Hủy Đơn Hàng' : 'Hoàn Tiền'}</strong> cho mã đơn <span className="font-mono text-blue-400">#{confirmAction.orderId.slice(0, 8).toUpperCase()}</span>.<br/><br/>
              Hành động này có thể ảnh hưởng đến trải nghiệm khách hàng hoặc số liệu đối soát. Vẫn tiếp tục?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Trở lại
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(confirmAction.orderId, confirmAction.type === 'CANCEL' ? 'CANCELLED' : 'REFUNDED')}
                disabled={isActionLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                Xác nhận {confirmAction.type === 'CANCEL' ? 'Hủy' : 'Hoàn Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Drawer */}
      {isDrawerOpen && (
        <OrderDetailDrawer
          isOpen={isDrawerOpen}
          order={selectedOrder}
          onClose={closeDrawer}
          onUpdateStatus={handleUpdateStatus}
          onConfirmAction={setConfirmAction}
        />
      )}
    </div>
  )
}
