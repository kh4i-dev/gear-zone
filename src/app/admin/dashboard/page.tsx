'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice, cn } from '@/lib/utils'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      setIsLoading(false)
      router.replace('/admin/login')
      return
    }

    if (user && user.role === 'ADMIN') {
      fetchDashboard()
    }
  }, [user, authLoading])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { credentials: 'include' })
      if (res.ok) {
        const { data } = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const statCards = [
    {
      label: 'Tổng doanh thu',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Tổng đơn hàng',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Sản phẩm',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Khách hàng',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Hệ thống quản trị
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Quản Trị</h1>
            <p className="text-muted-foreground mt-1">Chào mừng quay trở lại, {user.name}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" /> Sản phẩm
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-slate-900 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" /> Đơn hàng
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <Users className="w-4 h-4" /> Khách hàng
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className={cn('text-3xl font-extrabold mt-1 font-mono', stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Alerts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Orders */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Đơn hàng chờ xử lý</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                Xem tất cả
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.pendingOrders > 0 ? (
                <Link 
                  href="/admin/orders" 
                  className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:border-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/30 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-400 text-lg group-hover:text-amber-300 transition-colors">{stats.pendingOrders} đơn hàng</p>
                    <p className="text-sm text-muted-foreground">đang chờ xác nhận và đóng gói</p>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground text-center py-6 bg-slate-950/40 rounded-xl border border-white/5">Không có đơn hàng chờ xử lý</p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Cảnh báo tồn kho</h2>
              <Link
                href="/admin/inventory"
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                Quản lý kho
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.lowStockProducts > 0 ? (
                <Link 
                  href="/admin/inventory" 
                  className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:border-red-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 group-hover:bg-red-500/30 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                  </div>
                  <div>
                    <p className="font-bold text-red-400 text-lg group-hover:text-red-300 transition-colors">{stats.lowStockProducts} sản phẩm</p>
                    <p className="text-sm text-muted-foreground">sắp hết hàng, cần nhập thêm hàng gấp</p>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground text-center py-6 bg-slate-950/40 rounded-xl border border-white/5">Tồn kho ổn định, không có cảnh báo</p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Đơn hàng gần đây</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recentOrders?.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                >
                  <div>
                    <p className="font-semibold font-mono text-sm text-blue-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.user?.name || 'Khách hàng'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-white">{formatPrice(order.totalAmount)}</p>
                    <p className={cn(
                      'text-xs mt-0.5 font-medium',
                      order.status === 'DELIVERED' ? 'text-green-400' : 'text-amber-400'
                    )}>{order.status}</p>
                  </div>
                </div>
              ))}
              {!stats?.recentOrders?.length && (
                <p className="text-muted-foreground text-center py-6">Chưa có đơn hàng nào</p>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Sản phẩm bán chạy</h2>
              <Link
                href="/admin/products"
                className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
              >
                Quản lý sản phẩm
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.topProducts?.map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3.5 bg-slate-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-extrabold text-sm border border-blue-500/20">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1 text-white">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.soldCount} đã bán
                    </p>
                  </div>
                </div>
              ))}
              {!stats?.topProducts?.length && (
                <p className="text-muted-foreground text-center py-6">Chưa có dữ liệu sản phẩm</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
