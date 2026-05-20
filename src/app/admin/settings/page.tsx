'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Settings, Upload, Film, Save, MapPin, Phone, Mail, MessageSquare, Globe, BookOpen, FileText, RefreshCw, CreditCard } from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'
import { Input, Button } from '@/components/domain/ui'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [videoUrl, setVideoUrl] = useState('')
  const [address, setAddress] = useState('')
  const [hotline, setHotline] = useState('')
  const [email, setEmail] = useState('')
  const [zalo, setZalo] = useState('')
  const [facebook, setFacebook] = useState('')
  const [guideBuyLink, setGuideBuyLink] = useState('')
  const [warrantyLink, setWarrantyLink] = useState('')
  const [returnLink, setReturnLink] = useState('')
  const [paymentLink, setPaymentLink] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const text = await res.text()
      try {
        const result = JSON.parse(text)
        if (res.ok && result.data) {
          setVideoUrl(result.data.homepage_video || '')
          setAddress(result.data.contact_address || '')
          setHotline(result.data.contact_hotline || '')
          setEmail(result.data.contact_email || '')
          setZalo(result.data.contact_zalo || '')
          setFacebook(result.data.contact_facebook || '')
          setGuideBuyLink(result.data.guide_buy_link || '')
          setWarrantyLink(result.data.warranty_link || '')
          setReturnLink(result.data.return_link || '')
          setPaymentLink(result.data.payment_link || '')
        }
      } catch {
        throw new Error('API returned invalid JSON')
      }
    } catch (err: any) {
      toast.error('Không thể tải cài đặt. Có thể do lỗi Prisma, hãy tắt server và chạy npx prisma generate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            homepage_video: videoUrl,
            contact_address: address,
            contact_hotline: hotline,
            contact_email: email,
            contact_zalo: zalo,
            contact_facebook: facebook,
            guide_buy_link: guideBuyLink,
            warranty_link: warrantyLink,
            return_link: returnLink,
            payment_link: paymentLink
          }
        })
      })
      if (!res.ok) throw new Error()
      toast.success('Đã lưu cấu hình')
    } catch {
      toast.error('Lỗi lưu cấu hình. Đảm bảo đã chạy npx prisma db push')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 200 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 200MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: formData,
      })
      const text = await res.text()
      let result
      try {
        result = JSON.parse(text)
      } catch {
        throw new Error('Server trả về lỗi không xác định (lỗi HTML)')
      }
      if (!res.ok) throw new Error(result.error?.message || 'Lỗi khi upload')
      
      setVideoUrl(result.data.url)
      toast.success('Upload thành công, nhớ bấm Lưu để áp dụng')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi upload')
    } finally {
      setIsUploading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
          <div className="w-12 h-12 bg-slate-900 border border-white/10 flex items-center justify-center rounded-xl">
            <Settings className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Cài đặt hệ thống</h1>
            <p className="text-muted-foreground mt-1">Cấu hình giao diện và tính năng của cửa hàng.</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xl font-bold mb-6 text-slate-200">
            <Film className="w-5 h-5 text-indigo-400" />
            Video trang chủ (Cinema Mode)
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
              <label className="block text-sm font-semibold mb-2">Đường dẫn Video (URL)</label>
              <div className="flex gap-4">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://... hoặc /uploads/video.mp4"
                  className="flex-1 bg-slate-900 border-white/10"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Dán link YouTube, Vimeo (dạng nhúng) hoặc file mp4 trực tiếp.</p>
              
              <div className="mt-6 flex flex-col items-start border-t border-white/5 pt-6">
                <label className="block text-sm font-semibold mb-3">Hoặc Tải lên từ máy (Tối đa 200MB)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button type="button" disabled={isUploading} variant="outline" className="gap-2 bg-slate-900 border-white/10">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? 'Đang tải lên...' : 'Chọn file video'}
                  </Button>
                </div>
              </div>
            </div>

            {videoUrl && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center relative">
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 px-8">
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* Cấu hình Thông tin liên hệ Shop (GearZone Admin Style) */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md mt-8">
          <div className="flex items-center gap-2 text-xl font-bold mb-6 text-slate-200">
            <Globe className="w-5 h-5 text-indigo-400" />
            Thông tin liên hệ cửa hàng
          </div>

          <div className="space-y-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Địa chỉ shop
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ cửa hàng..."
                  className="bg-slate-900 border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> Số Hotline
                  </label>
                  <Input
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    placeholder="Nhập số Hotline..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> Email hỗ trợ
                  </label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập Email hỗ trợ..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" /> Link Zalo tư vấn
                  </label>
                  <Input
                    value={zalo}
                    onChange={(e) => setZalo(e.target.value)}
                    placeholder="Nhập link Zalo tư vấn..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" /> Link Fanpage Facebook
                  </label>
                  <Input
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="Nhập link Facebook..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 px-8">
              <Save className="w-4 h-4" />
              Lưu cấu hình liên hệ
            </Button>
          </div>
        </div>

        {/* Cấu hình Liên kết hướng dẫn & chính sách (GearZone Admin Style) */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md mt-8">
          <div className="flex items-center gap-2 text-xl font-bold mb-6 text-slate-200">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Liên kết hướng dẫn & chính sách hỗ trợ
          </div>

          <div className="space-y-6">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" /> Hướng dẫn mua hàng
                  </label>
                  <Input
                    value={guideBuyLink}
                    onChange={(e) => setGuideBuyLink(e.target.value)}
                    placeholder="Nhập link/đường dẫn hướng dẫn mua hàng..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Chính sách bảo hành
                  </label>
                  <Input
                    value={warrantyLink}
                    onChange={(e) => setWarrantyLink(e.target.value)}
                    placeholder="Nhập link/đường dẫn chính sách bảo hành..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-400" /> Chính sách đổi trả
                  </label>
                  <Input
                    value={returnLink}
                    onChange={(e) => setReturnLink(e.target.value)}
                    placeholder="Nhập link/đường dẫn chính sách đổi trả..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Phương thức thanh toán
                  </label>
                  <Input
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="Nhập link/đường dẫn phương thức thanh toán..."
                    className="bg-slate-900 border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700 px-8">
              <Save className="w-4 h-4" />
              Lưu liên kết hỗ trợ
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
