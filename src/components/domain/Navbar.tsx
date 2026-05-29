'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Settings, Boxes } from 'lucide-react'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'

export function Navbar() {
  const { push, refresh } = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Đã đăng xuất')
      push(getAdminPath('/login'))
      refresh()
    } catch {
      toast.error('Lỗi khi đăng xuất')
    }
  }

  return (
    <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={getAdminPath('/dashboard')} className="font-extrabold text-lg tracking-tight text-white">
          GearZone <span className="text-blue-400">Admin</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href={getAdminPath('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
          <Link
            href={getAdminPath('/products')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Package className="size-4" />
            Sản phẩm
          </Link>
          <Link
            href={getAdminPath('/inventory')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Boxes className="size-4" />
            Kho hàng
          </Link>
          <Link
            href={getAdminPath('/orders')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <ShoppingCart className="size-4" />
            Đơn hàng
          </Link>
          <Link
            href={getAdminPath('/users')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Users className="size-4" />
            Thành viên
          </Link>
          <Link
            href={getAdminPath('/settings')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="size-4" />
            Cài đặt
          </Link>
        </div>

        <button type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </button>
      </div>
    </nav>
  )
}

