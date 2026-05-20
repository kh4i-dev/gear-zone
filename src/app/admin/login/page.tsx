'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Input } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminLoginPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      router.replace('/admin/dashboard')
      router.refresh()
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
          <ArrowLeft className="w-4 h-4" />
          Quay lại cửa hàng
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">GearZone Admin</h1>
          <p className="text-slate-400 mt-2 text-sm">Đăng nhập bằng tài khoản quản trị đã cấu hình trên server.</p>
        </div>

        <div className="bg-slate-900/70 rounded-2xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Tài khoản hoặc Email"
              type="text"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder="Nhập admin hoặc email quản trị"
              error={errors.email}
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
