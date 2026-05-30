'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, Loader2, ShieldCheck, UserCheck, Calendar, Phone, MapPin, Mail, Lock, ShieldAlert, FileText, AlertTriangle
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { Button } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'

type UserData = {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  role: string
  createdAt: string
}

type RoleChangeRequest = {
  userId: string
  name: string
  currentRole: string
  newRole: string
} | null

export default function AdminUsersPage() {
  const { push } = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<UserData[] | null>(null)
  const isLoading = users === null
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'customers' | 'staff'>('customers')
  
  // Security Modal State
  const [roleChangeReq, setRoleChangeReq] = useState<RoleChangeRequest>(null)
  const [changeReason, setChangeReason] = useState('')
  const [isChangingRole, setIsChangingRole] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users`)
      const { data } = await res.json()
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Không thể tải danh sách thành viên')
      setUsers([])
    }
  }, [])

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      push(getAdminPath('/login'))
    }
  }, [user, authLoading, push])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchUsers()
    }
  }, [user, fetchUsers])

  const initiateRoleChange = (targetUserId: string, name: string, currentRole: string, newRole: string) => {
    // 1. Block self-demotion
    if (targetUserId === user?.id) {
      toast.error('Không thể tự thay đổi quyền của chính mình để tránh mất quyền quản trị.')
      return
    }

    // 2. Open confirmation modal
    setRoleChangeReq({ userId: targetUserId, name, currentRole, newRole })
    setChangeReason('')
  }

  const confirmRoleChange = async () => {
    if (!roleChangeReq) return
    
    // Destructive or high-risk actions require a reason (e.g. promoting to ADMIN or demoting from ADMIN)
    const isHighRisk = roleChangeReq.newRole === 'ADMIN' || roleChangeReq.currentRole === 'ADMIN'
    if (isHighRisk && changeReason.trim().length < 5) {
      toast.error('Vui lòng nhập lý do cụ thể (ít nhất 5 ký tự) cho thao tác phân quyền quan trọng này.')
      return
    }

    setIsChangingRole(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: roleChangeReq.userId, role: roleChangeReq.newRole, reason: changeReason }),
      })

      const result = await res.json()

      if (res.ok) {
        toast.success(`Đã cập nhật vai trò của ${roleChangeReq.name} thành ${roleChangeReq.newRole}`)
        fetchUsers()
        setRoleChangeReq(null)
      } else {
        toast.error(result.error?.message || 'Lỗi khi cập nhật vai trò')
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật vai trò')
    } finally {
      setIsChangingRole(false)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const lowerQuery = searchQuery.toLowerCase()
    
    return users.filter((u) => {
      // Apply search
      const matchesSearch = u.name.toLowerCase().includes(lowerQuery) ||
                            u.email.toLowerCase().includes(lowerQuery) ||
                            (u.phone && u.phone.includes(lowerQuery))
      if (!matchesSearch) return false
      
      // Apply tab filter
      const isStaff = u.role === 'ADMIN' || u.role === 'WAREHOUSE'
      if (activeTab === 'staff') return isStaff
      if (activeTab === 'customers') return !isStaff
      
      return true
    })
  }, [users, searchQuery, activeTab])

  if (authLoading || users === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="size-4" /> Vận hành thành viên
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Quản Lý Phân Quyền</h1>
            <p className="text-muted-foreground mt-1 text-sm">Kiểm soát truy cập, bảo mật tài khoản và quản lý thông tin khách hàng.</p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-900 border border-white/5 px-4 py-2 rounded-xl">
            <Users className="size-4 text-blue-400" />
            <span className="font-semibold">{users.length}</span> tài khoản hệ thống
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <div className="flex bg-slate-900/80 p-1 border border-white/5 rounded-xl w-fit">
            <button type="button"
              onClick={() => setActiveTab('customers')}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="size-4" /> Khách hàng
            </button>
            <button type="button"
              onClick={() => setActiveTab('staff')}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="size-4" /> Nhân sự & Quản trị
            </button>
          </div>

          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại…"
              aria-label="Tìm kiếm thành viên"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6 min-w-[250px]">Tài khoản</th>
                    <th className="p-4 min-w-[200px]">Liên hệ</th>
                    <th className="p-4 min-w-[150px]">Ngày tham gia</th>
                    <th className="p-4 min-w-[220px]">Bảo mật / Phân quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => {
                    const isSelf = user?.id === u.id
                    return (
                      <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-extrabold text-slate-300 uppercase shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm line-clamp-1">{u.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Mail className="size-3 text-slate-500" /> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="space-y-1">
                            {u.phone ? (
                              <p className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                                <Phone className="size-3 text-slate-500" /> {u.phone}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone className="size-3" /> ---</p>
                            )}
                            {u.address ? (
                              <p className="text-xs text-muted-foreground flex items-start gap-1.5 line-clamp-2">
                                <MapPin className="size-3 text-slate-500 shrink-0 mt-0.5" /> {u.address}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="size-3" /> ---</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground align-top">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-slate-500" />
                            {formatDateTime(u.createdAt)}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {isSelf ? (
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <UserCheck className="size-3.5" /> Quản trị viên tối cao (Bạn)
                              </span>
                              <span className="text-[10px] text-slate-500 italic flex items-center gap-1 mt-1">
                                <Lock className="size-2.5" /> Không thể tự hạ quyền
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 items-start">
                              <select
                                value={u.role}
                                onChange={(e) => initiateRoleChange(u.id, u.name, u.role, e.target.value)}
                                className={`border rounded-xl px-2.5 py-1.5 text-xs font-bold cursor-pointer focus:ring-2 focus:ring-blue-500/50 outline-none w-36 ${
                                  u.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                  u.role === 'WAREHOUSE' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  'bg-slate-900 text-slate-300 border-white/10'
                                }`}
                              >
                                <option value="USER" className="bg-slate-900 text-white">Khách hàng</option>
                                <option value="WAREHOUSE" className="bg-slate-900 text-indigo-400">Nhân viên kho</option>
                                <option value="ADMIN" className="bg-slate-900 text-blue-400 font-bold">Quản trị viên</option>
                              </select>
                              <div className="flex gap-2">
                                <span className="text-[9px] text-amber-500/70 border border-amber-500/20 bg-amber-500/5 px-1 rounded flex items-center gap-1" title="Cần tích hợp Backend 2FA">
                                  <AlertTriangle className="size-2" /> TODO: Re-auth
                                </span>
                                <span className="text-[9px] text-emerald-500/70 border border-emerald-500/20 bg-emerald-500/5 px-1 rounded flex items-center gap-1" title="Cần tích hợp Audit Logs">
                                  <FileText className="size-2" /> TODO: Audit
                                </span>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-white/5 rounded-2xl m-4">
              <Users className="size-12 text-slate-700 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-1 text-slate-300">Không có dữ liệu</h3>
              <p className="text-slate-500 text-sm">Không tìm thấy thành viên nào phù hợp bộ lọc.</p>
            </div>
          )}
        </div>

        {/* Role Change Modal */}
        {roleChangeReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 text-amber-400 mb-2">
                  <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <ShieldAlert className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Xác nhận phân quyền</h3>
                </div>
                <p className="text-slate-400 text-sm mt-3">
                  Bạn đang chuẩn bị thay đổi quyền hạn của tài khoản <strong className="text-white">{roleChangeReq.name}</strong>.
                </p>
                <div className="flex items-center gap-3 mt-4 text-sm bg-slate-950 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-500 font-mono line-through">{roleChangeReq.currentRole}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="font-bold text-emerald-400 font-mono">{roleChangeReq.newRole}</span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="changeReason" className="block text-sm font-medium text-slate-300 mb-2">
                    Lý do thay đổi <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="changeReason"
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    placeholder="Ghi chú lý do cấp/hạ quyền (vd: Nhân viên mới, Thuyên chuyển công tác...)"
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <Lock className="size-3" /> Hành động này sẽ được lưu vào hệ thống Audit Log (TODO).
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-slate-950/50 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setRoleChangeReq(null)} disabled={isChangingRole} className="border-white/10 text-slate-300 hover:text-white">
                  Hủy bỏ
                </Button>
                <Button onClick={confirmRoleChange} isLoading={isChangingRole} className="bg-amber-600 hover:bg-amber-500 text-white font-bold border-none">
                  Xác nhận thay đổi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
