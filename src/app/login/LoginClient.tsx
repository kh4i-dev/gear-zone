'use client'
 
import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Input } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
 
function LoginForm({ shopName }: { shopName: string }) {
  const { push, refresh } = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { refreshUser } = useAuth()
 
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
 
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })
 
      const { error, data } = await res.json()
 
      if (!res.ok) {
        if (error?.details) {
          setErrors(error.details as Record<string, string>)
        } else {
          toast.error(error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.')
        }
        return
      }
 
      toast.success(`Chào mừng trở lại, ${data.user.name || data.user.username}!`)
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
          Đăng nhập {shopName}
        </h1>
        <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
          Quản lý đơn hàng, lưu giỏ hàng và nhận ưu đãi dành riêng cho bạn.
        </p>
      </div>
 
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <Input
          label="Tài khoản hoặc Số điện thoại"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Tên đăng nhập hoặc SĐT…"
          error={errors.username}
          className="bg-slate-950/40 border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
          startAdornment={<User className="size-4.5 text-slate-500" />}
          required
        />

        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Nhập mật khẩu"
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-600/25 rounded-2xl font-bold mt-6 h-12 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4.5 animate-spin" />
              Đang đăng nhập…
            </>
          ) : (
            'Đăng nhập'
          )}
        </Button>
      </form>
 
      {/* Switch to Register link */}
      <div className="text-center mt-6 border-t border-white/5 pt-5 relative">
        <p className="text-xs text-slate-400">
          Chưa có tài khoản?{' '}
          <Link
            href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="text-indigo-400 hover:text-indigo-300 font-extrabold hover:underline transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
 
      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5" />
        </div>
        <span className="relative px-3 bg-slate-900 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
          Hoặc tiếp tục với
        </span>
      </div>
 
      {/* Mock Social Logins (Premium Look & Safe) */}
      <div className="grid grid-cols-2 gap-3 relative">
        <button
          type="button"
          onClick={() => toast.info('Đăng nhập bằng Google sắp ra mắt!')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/50 text-slate-400 hover:text-white transition text-xs font-bold"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.746-.08-1.32-.176-1.887H12.24z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => toast.info('Đăng nhập bằng Facebook sắp ra mắt!')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/50 text-slate-400 hover:text-white transition text-xs font-bold"
        >
          <svg className="size-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
          </svg>
          Facebook
        </button>
      </div>
    </div>
  )
}
 
export default function LoginClient({ shopName = 'GearZone' }: { shopName?: string }) {
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
        <LoginForm shopName={shopName} />
      </Suspense>
    </div>
  )
}
