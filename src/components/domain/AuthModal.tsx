'use client'

import React, { Suspense, useState, useSyncExternalStore } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, Gamepad2, Lock, Mail, User, Eye, EyeOff, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Input } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'

interface AuthModalContentProps {
  authType: string
  redirectPath: string | null
  shopName: string
}

const clientLoadedStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}

function AuthModalContent({ authType, redirectPath, shopName }: AuthModalContentProps) {
  const { push, replace, refresh } = useRouter()
  const pathname = usePathname()
  const { refreshUser } = useAuth()

  const mounted = useSyncExternalStore(
    clientLoadedStore.subscribe,
    clientLoadedStore.getSnapshot,
    clientLoadedStore.getServerSnapshot
  )

  const [uiState, setUiState] = useState({
    isLoading: false,
    showPassword: false,
  })
  const { isLoading, showPassword } = uiState

  const setIsLoading = (val: boolean) => setUiState((prev) => ({ ...prev, isLoading: val }))
  const setShowPassword = (val: boolean) => setUiState((prev) => ({ ...prev, showPassword: val }))

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClose = () => {
    const params = new URLSearchParams(window.location.search)
    params.delete('auth')
    params.delete('redirect')
    const search = params.toString()
    replace(`${pathname}${search ? `?${search}` : ''}`)
  }

  const switchTab = (type: 'login' | 'register') => {
    const params = new URLSearchParams(window.location.search)
    params.set('auth', type)
    replace(`${pathname}?${params.toString()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (authType === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' })
        return
      }
    }

    setIsLoading(true)

    try {
      const endpoint = authType === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = authType === 'login' 
        ? { username: formData.username, password: formData.password }
        : { 
            name: formData.name, 
            username: formData.username, 
            phone: formData.phone,
            email: formData.email || null, // send null if email is empty
            password: formData.password 
          }

      const res = await window.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const { error, data } = await res.json()

      if (!res.ok) {
        if (error?.details) {
          setErrors(error.details as Record<string, string>)
        } else {
          toast.error(error?.message || (authType === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'))
        }
        return
      }

      toast.success(authType === 'login' ? `Chào mừng trở lại, ${data.user.name || data.user.username}!` : 'Đăng ký tài khoản thành công!')
      
      // Refresh Auth State
      await refreshUser()

      handleClose()
      
      if (redirectPath) {
        push(redirectPath)
      }
      
      refresh()
    } catch {
      toast.error('Lỗi kết nối máy chủ')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glass Backdrop - Button type for perfect native accessibility */}
      <button 
        type="button"
        onClick={handleClose}
        aria-label="Đóng biểu mẫu"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 cursor-pointer w-full h-full border-0 p-0 text-left outline-none"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 md:p-10 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-10">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 size-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-48 rounded-full bg-violet-500/10 blur-3xl" />

        {/* Close Button */}
        <button type="button" 
          onClick={handleClose}
          className="absolute top-6 right-6 flex size-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
            <Gamepad2 className="size-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {authType === 'login' ? `Đăng nhập ${shopName}` : 'Tạo tài khoản'}
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {authType === 'login' 
              ? 'Quản lý đơn hàng, lưu giỏ hàng và nhận ưu đãi dành riêng cho bạn.' 
              : `Trở thành thành viên ${shopName} ngay hôm nay để nhận nhiều ưu đãi độc quyền.`}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 mb-7">
          <button type="button"
            onClick={() => switchTab('login')}
            className={`flex-1 pb-3.5 text-sm font-extrabold tracking-tight transition-all relative ${
              authType === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Đăng nhập
            {authType === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button type="button"
            onClick={() => switchTab('register')}
            className={`flex-1 pb-3.5 text-sm font-extrabold tracking-tight transition-all relative ${
              authType === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Đăng ký
            {authType === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {authType === 'register' && (
            <Input
              label="Họ và tên"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập họ và tên đầy đủ"
              error={errors.name}
              className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
              startAdornment={<User className="size-4.5 text-slate-500" />}
              required
            />
          )}

          {authType === 'register' ? (
            <>
              {/* Register Username field */}
              <Input
                label="Tài khoản (Username)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Nhập tên đăng nhập"
                error={errors.username}
                className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
                startAdornment={<User className="size-4.5 text-slate-500" />}
                required
              />

              {/* Register Phone field (Mandatory) */}
              <Input
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                error={errors.phone}
                className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
                startAdornment={<Phone className="size-4.5 text-slate-500" />}
                required
              />

              {/* Register Email field (Optional) */}
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                error={errors.email}
                className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
                startAdornment={<Mail className="size-4.5 text-slate-500" />}
              />
            </>
          ) : (
            /* Login Username field (can accept username or phone) */
            <Input
              label="Tài khoản hoặc Số điện thoại"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Nhập tên tài khoản hoặc số điện thoại"
              error={errors.username}
              className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
              startAdornment={<User className="size-4.5 text-slate-500" />}
              required
            />
          )}

          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Nhập mật khẩu"
            error={errors.password}
            className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
            startAdornment={<Lock className="size-4.5 text-slate-500" />}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer border-0 bg-transparent p-0 flex items-center"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            required
          />

          {authType === 'register' && (
            <Input
              label="Xác nhận mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu"
              error={errors.confirmPassword}
              className="bg-slate-950/40 border-white/5 focus:ring-indigo-500/20 focus:border-indigo-500"
              startAdornment={<Lock className="size-4.5 text-slate-500" />}
              required
            />
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 border-0 shadow-lg shadow-indigo-600/25 rounded-2xl font-bold mt-2 h-12 active:scale-[0.98] transition-all"
            size="lg"
            isLoading={isLoading}
          >
            {authType === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative px-4 bg-slate-900 text-xs text-slate-500 uppercase tracking-widest font-semibold">
            Hoặc đăng nhập bằng
          </span>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => toast.info('Đăng nhập bằng Google sắp ra mắt!')}
            className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/50 text-slate-400 hover:text-white transition-all text-xs font-bold"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.746-.08-1.32-.176-1.887H12.24z"/>
            </svg>
            Google
          </button>
          <button 
            type="button" 
            onClick={() => toast.info('Đăng nhập bằng Facebook sắp ra mắt!')}
            className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/50 text-slate-400 hover:text-white transition-all text-xs font-bold"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  )
}

function AuthModalWrapper({ shopName }: { shopName: string }) {
  const searchParams = useSearchParams()
  const { get } = searchParams
  const authType = get.call(searchParams, 'auth')
  const redirectPath = get.call(searchParams, 'redirect')

  if (!authType) return null

  return (
    <AuthModalContent 
      key={authType} 
      authType={authType} 
      redirectPath={redirectPath} 
      shopName={shopName}
    />
  )
}

export function AuthModal({ shopName = 'GearZone' }: { shopName?: string }) {
  return (
    <Suspense fallback={null}>
      <AuthModalWrapper shopName={shopName} />
    </Suspense>
  )
}
