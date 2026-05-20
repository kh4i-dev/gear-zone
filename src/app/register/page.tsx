'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input } from '@/components/domain/ui'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function UserRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
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
          email: formData.email,
          password: formData.password,
        }),
      })

      const { error, data } = await res.json()

      if (!res.ok) {
        if (error?.details) {
          setErrors(error.details as Record<string, string>)
        } else {
          toast.error(error?.message || 'Đăng ký thất bại')
        }
        return
      }

      toast.success('Đăng ký tài khoản thành công!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Lỗi kết nối')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950 py-12 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại trang chủ
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gradient tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Tạo tài khoản mới
          </h1>
          <p className="text-muted-foreground mt-2">Đăng ký để trở thành thành viên GearZone</p>
        </div>

        <div className="bg-card/45 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-purple-500/5 relative group hover:border-purple-500/30 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và tên"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nguyễn Văn A"
              error={errors.name}
              className="bg-slate-950/50 border-white/5 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              error={errors.email}
              className="bg-slate-950/50 border-white/5 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              error={errors.password}
              hint="Ít nhất 6 ký tự"
              className="bg-slate-950/50 border-white/5 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              error={errors.confirmPassword}
              className="bg-slate-950/50 border-white/5 focus:border-purple-500 focus:ring-purple-500/20"
              required
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-purple-500/20 py-2.5 rounded-xl font-bold mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Đăng ký
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
