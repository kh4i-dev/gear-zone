'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  Loader2,
  ShieldCheck,
  UserCheck,
  Calendar,
  Phone,
  MapPin,
  Mail,
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { Button } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'

export default function AdminUsersPage() {
  const { push } = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<any[] | null>(null)
  const isLoading = users === null
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (roleFilter) params.set('role', roleFilter)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const { data } = await res.json()
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Không thể tải danh sách thành viên')
      setUsers([])
    }
  }, [roleFilter])

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      push(getAdminPath('/login'))
    }
  }, [user, authLoading, push])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsers()
    }
  }, [user, roleFilter, fetchUsers])

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, role: newRole }),
      })

      const result = await res.json()

      if (res.ok) {
        toast.success(`Đã cập nhật vai trò của ${result.data.name} thành ${newRole}`)
        fetchUsers()
      } else {
        toast.error(result.error?.message || 'Lỗi khi cập nhật vai trò')
      }
    } catch {
      toast.error('Lỗi khi cập nhật vai trò')
    }
  }

  if (authLoading || users === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    )
  }

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.phone && u.phone.includes(searchLower))
    );
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="size-4" /> Vận hành thành viên
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Quản Lý Thành Viên</h1>
            <p className="text-muted-foreground mt-1">Danh sách tất cả các tài khoản khách hàng và quản trị viên</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-900 border border-white/5 px-4 py-2 rounded-xl">
            <Users className="size-4 text-blue-400" />
            <span className="font-semibold">{users.length}</span> thành viên tổng cộng
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              aria-label="Tìm kiếm thành viên"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm"
            >
              <option value="">Tất cả vai trò</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="WAREHOUSE">WAREHOUSE</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-blue-400 mb-2" />
              <p className="text-muted-foreground text-sm">Đang tải danh sách thành viên…</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Thành viên</th>
                    <th className="p-4">Liên hệ</th>
                    <th className="p-4">Vai trò / Quyền hạn</th>
                    <th className="p-4">Ngày tham gia</th>
                    <th className="p-4 pr-6 text-right">Mã định danh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-extrabold text-blue-400 uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Mail className="size-3 text-slate-500" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          {u.phone && (
                            <p className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                              <Phone className="size-3 text-slate-500" /> {u.phone}
                            </p>
                          )}
                          {u.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1 max-w-[200px]">
                              <MapPin className="size-3 text-slate-500 flex-shrink-0" /> {u.address}
                            </p>
                          )}
                          {!u.phone && !u.address && (
                            <p className="text-xs text-muted-foreground italic">Chưa cập nhật thông tin</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {user?.id === u.id ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <UserCheck className="size-3.5" /> ADMIN (Bạn)
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer text-white focus:ring-2 focus:ring-blue-500/50"
                          >
                            <option value="USER" className="text-white bg-slate-950">USER</option>
                            <option value="ADMIN" className="text-blue-400 bg-slate-950 font-bold">ADMIN</option>
                            <option value="WAREHOUSE" className="text-indigo-400 bg-slate-950">WAREHOUSE</option>
                            <option value="CUSTOMER" className="text-white bg-slate-950">CUSTOMER</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-slate-500" />
                          {formatDateTime(u.createdAt)}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className="font-mono text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-white/5">
                          {u.id}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl m-4">
              <Users className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-1">Không tìm thấy thành viên</h3>
              <p className="text-muted-foreground text-sm">Vui lòng thay đổi từ khóa hoặc điều kiện bộ lọc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
