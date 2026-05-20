'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Settings, Boxes } from 'lucide-react'
import { toast } from 'sonner'

export function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Đã đăng xuất')
      router.push('/admin/login')
      router.refresh()
    } catch {
      toast.error('Lỗi khi đăng xuất')
    }
  }

  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/admin/dashboard" className="font-extrabold text-lg tracking-tight text-white">
          GearZone <span className="text-blue-400">Admin</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Package className="w-4 h-4" />
            Sản phẩm
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Boxes className="w-4 h-4" />
            Kho hàng
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Đơn hàng
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Users className="w-4 h-4" />
            Thành viên
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Cài đặt
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </nav>
  )
}
