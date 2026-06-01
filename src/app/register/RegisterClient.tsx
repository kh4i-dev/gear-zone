'use client'
 
import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, Lock, User, Eye, EyeOff, Loader2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Input } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
 
function RegisterForm({ shopName }: { shopName: string }) {
  const { push, refresh } = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { refreshUser } = useAuth()
 
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
 
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' })
      return
    }
 
    setIsLoading(true)
 
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          phone: formData.phone,
          email: formData.email || null,
          password: formData.password,
        }),
      })
 
      const { error, data } = await res.json()
 
      if (!res.ok) {
        if (error?.details) {
          setErrors(error.details as Record<string, string>)
        } else {
          toast.error(error?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
        }
        return
      }
 
      toast.success('Đăng ký tài khoản thành công!')
      await refreshUser()
      push(redirect)
      refresh()
    } catch {
      toast.error('Lỗi kết nối máy chủ')
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 shadow-black/60">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -left-24 size-48 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-violet-600/10 blur-3xl" />
 
      {/* Brand Logo Header */}
      <div className="text-center mb-8 relative">
        <Link href="/" className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/35 hover:scale-105 active:scale-95 transition-all duration-300 mb-4">
          <Gamepad2 className="size-6" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
          Đăng ký tài khoản
        </h1>
        <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
          Trở thành thành viên {shopName} ngay hôm nay để nhận nhiều ưu đãi độc quyền.
        </p>
      </div>
 
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <Input
          label="Họ và tên"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nhập họ và tên đầy đủ"
          error={errors.name}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<User className="size-4.5 text-slate-500" />}
          required
        />

        <Input
          label="Tên đăng nhập (Username)"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Nhập tên đăng nhập"
          error={errors.username}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<User className="size-4.5 text-slate-500" />}
          required
        />

        <Input
          label="Số điện thoại"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Nhập số điện thoại"
          error={errors.phone}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<Phone className="size-4.5 text-slate-500" />}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@example.com"
          error={errors.email}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<Mail className="size-4.5 text-slate-500" />}
        />

        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Tối thiểu 8 ký tự"
          error={errors.password}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<Lock className="size-4.5 text-slate-500" />}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md cursor-pointer border-0 bg-transparent flex items-center"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          required
        />

        <Input
          label="Xác nhận mật khẩu"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Nhập lại mật khẩu"
          error={errors.confirmPassword}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<Lock className="size-4.5 text-slate-500" />}
          required
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-600/25 rounded-2xl font-bold mt-6 h-12 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              Đang tạo tài khoản…
            </>
          ) : (
            'Đăng ký tài khoản'
          )}
        </Button>
      </form>
 
      {/* Switch to Login link */}
      <div className="text-center mt-6 border-t border-white/5 pt-5 relative">
        <p className="text-xs text-slate-400">
          Đã có tài khoản?{' '}
          <Link
            href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-indigo-400 hover:text-indigo-300 font-extrabold hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
 
export default function RegisterClient({ shopName = 'GearZone' }: { shopName?: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Background Radial Light Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
          <span className="text-sm text-slate-400">Đang tải biểu mẫu…</span>
        </div>
      }>
        <RegisterForm shopName={shopName} />
      </Suspense>
    </div>
  )
}
