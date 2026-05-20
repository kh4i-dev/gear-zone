'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Input } from '@/components/domain/ui'

export default function UserLoginPage() {
  const router = useRouter()
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

      toast.success(`Chào mừng ${data.user.name}!`)
      router.push('/')
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
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm mb-4">
            <Gamepad2 className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Chào mừng trở lại</h1>
          <p className="mt-2 text-sm text-slate-400">Đăng nhập bằng tài khoản đã đăng ký</p>
        </div>

        <div className="bg-slate-900/60 border border-white/5 py-8 px-6 shadow-xl rounded-3xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder="Email của bạn"
              error={errors.email}
              className="border-white/10 bg-slate-950 text-white"
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              placeholder="Mật khẩu"
              error={errors.password}
              className="border-white/10 bg-slate-950 text-white"
            />
            <Button type="submit" className="w-full rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white" size="lg" isLoading={isLoading}>
              Đăng nhập
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
