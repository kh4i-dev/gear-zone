'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Input } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { getAdminPath } from '@/lib/adminPath'

export default function AdminLoginPage() {
  const { replace, refresh } = useRouter()
  const { refreshUser } = useAuth()
  const [shopName, setShopName] = useState('GearZone')

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(result => {
        if (result.data?.shop_name) setShopName(result.data.shop_name)
      })
      .catch(() => {})
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password }),
      })
      const { error, data } = await res.json()

      if (!res.ok) {
        if (error?.details) setErrors(error.details as Record<string, string>)
        else toast.error(error?.message || 'Đăng nhập thất bại')
        return
      }

      if (data.user.role !== 'ADMIN') {
        toast.error('Tài khoản này không có quyền Admin')
        await fetch('/api/auth/logout', { method: 'POST' })
        return
      }

      await refreshUser()
      replace(getAdminPath('/dashboard'))
      refresh()
    } catch {
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="size-4" />
          Quay lại cửa hàng
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
            <ShieldAlert className="size-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{shopName} Admin</h1>
          <p className="text-slate-400 mt-2 text-sm">Đăng nhập bằng tài khoản quản trị đã cấu hình trên server.</p>
        </div>

        <div className="bg-slate-900/70 rounded-2xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Tài khoản Quản trị"
              type="text"
              value={formData.username}
              onChange={(event) => setFormData({ ...formData, username: event.target.value })}
              placeholder="Nhập admin hoặc tài khoản quản trị"
              error={errors.username || errors.email}
              className="bg-slate-950/60 border-white/10"
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              placeholder="Mật khẩu"
              error={errors.password}
              className="bg-slate-950/60 border-white/10"
            />
            <Button type="submit" className="w-full rounded-xl font-bold" size="lg" isLoading={isLoading}>
              Đăng nhập Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
