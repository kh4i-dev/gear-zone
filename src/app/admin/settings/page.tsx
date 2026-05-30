'use client'

import { useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Loader2, 
  Settings, 
  Upload, 
  Film, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  BookOpen, 
  FileText, 
  RefreshCw, 
  CreditCard, 
  X, 
  Tag, 
  Plus, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  ImageIcon, 
  Palette, 
  KeyRound, 
  Search,
  Check,
  Boxes
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'
import { Input, Button } from '@/components/domain/ui'
import { getAdminPath } from '@/lib/adminPath'

type SettingsStatus = {
  isLoading: boolean
  isSaving: boolean
  isUploading: boolean
  isCatLoading: boolean
  isChangingPass: boolean
}

type SettingsPageState = {
  videoUrl: string
  themeAccent: string
  introTitle: string
  introText: string
  bannerTitle: string
  bannerSubtitle: string
  bannerCtaText: string
  bannerCtaLink: string
  tickerSpeed: string
  tickerMessages: string[]
  newTickerMsg: string
  address: string
  hotline: string
  email: string
  zalo: string
  facebook: string
  openingHours: string
  guideBuyLink: string
  warrantyLink: string
  returnLink: string
  paymentLink: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  categories: any[]
  newCatName: string
  shopBrands: string[]
  newBrandName: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  activeSection: string
}

const initialSettingsPageState: SettingsPageState = {
  videoUrl: '',
  themeAccent: 'indigo',
  introTitle: '',
  introText: '',
  bannerTitle: '',
  bannerSubtitle: '',
  bannerCtaText: '',
  bannerCtaLink: '',
  tickerSpeed: '25s',
  tickerMessages: [],
  newTickerMsg: '',
  address: '',
  hotline: '',
  email: '',
  zalo: '',
  facebook: '',
  openingHours: '',
  guideBuyLink: '',
  warrantyLink: '',
  returnLink: '',
  paymentLink: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  categories: [],
  newCatName: '',
  shopBrands: [],
  newBrandName: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  activeSection: 'video',
}

export default function AdminSettingsPage() {
  const { replace } = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  
  const [status, setStatus] = useReducer(
    (state: SettingsStatus, patch: Partial<SettingsStatus>) => ({ ...state, ...patch }),
    {
      isLoading: true,
      isSaving: false,
      isUploading: false,
      isCatLoading: false,
      isChangingPass: false,
    }
  )
  const { isLoading, isSaving, isUploading, isCatLoading, isChangingPass } = status
  const setIsLoading = (isLoading: boolean) => setStatus({ isLoading })
  const setIsSaving = (isSaving: boolean) => setStatus({ isSaving })
  const setIsUploading = (isUploading: boolean) => setStatus({ isUploading })
  const setIsCatLoading = (isCatLoading: boolean) => setStatus({ isCatLoading })
  const setIsChangingPass = (isChangingPass: boolean) => setStatus({ isChangingPass })
  
  const [pageState, updatePageState] = useReducer(
    (state: SettingsPageState, patch: Partial<SettingsPageState>) => ({ ...state, ...patch }),
    initialSettingsPageState
  )
  const {
    videoUrl,
    themeAccent,
    introTitle,
    introText,
    bannerTitle,
    bannerSubtitle,
    bannerCtaText,
    bannerCtaLink,
    tickerSpeed,
    tickerMessages,
    newTickerMsg,
    address,
    hotline,
    email,
    zalo,
    facebook,
    openingHours,
    guideBuyLink,
    warrantyLink,
    returnLink,
    paymentLink,
    seoTitle,
    seoDescription,
    seoKeywords,
    categories,
    newCatName,
    shopBrands,
    newBrandName,
    currentPassword,
    newPassword,
    confirmPassword,
    activeSection,
  } = pageState
  const setVideoUrl = (videoUrl: string) => updatePageState({ videoUrl })
  const setThemeAccent = (themeAccent: string) => updatePageState({ themeAccent })
  const setIntroTitle = (introTitle: string) => updatePageState({ introTitle })
  const setIntroText = (introText: string) => updatePageState({ introText })
  const setBannerTitle = (bannerTitle: string) => updatePageState({ bannerTitle })
  const setBannerSubtitle = (bannerSubtitle: string) => updatePageState({ bannerSubtitle })
  const setBannerCtaText = (bannerCtaText: string) => updatePageState({ bannerCtaText })
  const setBannerCtaLink = (bannerCtaLink: string) => updatePageState({ bannerCtaLink })
  const setTickerSpeed = (tickerSpeed: string) => updatePageState({ tickerSpeed })
  const setTickerMessages = (tickerMessages: string[]) => updatePageState({ tickerMessages })
  const setNewTickerMsg = (newTickerMsg: string) => updatePageState({ newTickerMsg })
  const setAddress = (address: string) => updatePageState({ address })
  const setHotline = (hotline: string) => updatePageState({ hotline })
  const setEmail = (email: string) => updatePageState({ email })
  const setZalo = (zalo: string) => updatePageState({ zalo })
  const setFacebook = (facebook: string) => updatePageState({ facebook })
  const setOpeningHours = (openingHours: string) => updatePageState({ openingHours })
  const setGuideBuyLink = (guideBuyLink: string) => updatePageState({ guideBuyLink })
  const setWarrantyLink = (warrantyLink: string) => updatePageState({ warrantyLink })
  const setReturnLink = (returnLink: string) => updatePageState({ returnLink })
  const setPaymentLink = (paymentLink: string) => updatePageState({ paymentLink })
  const setSeoTitle = (seoTitle: string) => updatePageState({ seoTitle })
  const setSeoDescription = (seoDescription: string) => updatePageState({ seoDescription })
  const setSeoKeywords = (seoKeywords: string) => updatePageState({ seoKeywords })
  const setCategories = (categories: any[]) => updatePageState({ categories })
  const setNewCatName = (newCatName: string) => updatePageState({ newCatName })
  const setCurrentPassword = (currentPassword: string) => updatePageState({ currentPassword })
  const setNewPassword = (newPassword: string) => updatePageState({ newPassword })
  const setConfirmPassword = (confirmPassword: string) => updatePageState({ confirmPassword })
  const setActiveSection = (activeSection: string) => updatePageState({ activeSection })
  // 'video' | 'banner' | 'ticker' | 'contact' | 'policy' | 'seo' | 'category' | 'security'

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      replace(getAdminPath('/login'))
    }
  }, [user, authLoading, replace])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchSettings()
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const result = await res.json()
      if (res.ok && result.data) {
        setCategories(result.data)
      }
    } catch {
      toast.error('Không thể tải danh sách danh mục')
    }
  }

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const result = await res.json()
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
        setOpeningHours(result.data.contact_opening_hours || '')
        
        setThemeAccent(result.data.theme_accent || 'indigo')
        setIntroTitle(result.data.homepage_intro_title || 'Chào mừng đến với GearZone')
        setIntroText(result.data.homepage_intro_text || 'GearZone chuyên gaming gear, linh kiện và phụ kiện máy tính chính hãng. Chúng tôi tập trung vào sản phẩm rõ thông tin, giá minh bạch, tồn kho thực và hỗ trợ nhanh cho game thủ.')
        setBannerTitle(result.data.homepage_banner_title || '')
        setBannerSubtitle(result.data.homepage_banner_subtitle || '')
        setBannerCtaText(result.data.homepage_banner_cta_text || '')
        setBannerCtaLink(result.data.homepage_banner_cta_link || '')
        setTickerSpeed(result.data.homepage_ticker_speed || '25s')
        
        setSeoTitle(result.data.seo_title || '')
        setSeoDescription(result.data.seo_description || '')
        setSeoKeywords(result.data.seo_keywords || '')

        if (result.data.shop_brands) {
          try {
            updatePageState({ shopBrands: JSON.parse(result.data.shop_brands) })
          } catch {
            updatePageState({ shopBrands: result.data.shop_brands.split('|').filter(Boolean) })
          }
        } else {
          updatePageState({ shopBrands: [
            'Logitech', 'Razer', 'Asus', 'Corsair', 'Akko', 
            'Keychron', 'AULA', 'HyperX', 'SteelSeries', 'Fuhlen',
            'Acer', 'HP', 'Dell', 'Gigabyte', 'MSI', 'DareU', 'Rapoo', 'ATK'
          ]})
        }

        if (result.data.homepage_ticker_messages) {
          try {
            setTickerMessages(JSON.parse(result.data.homepage_ticker_messages))
          } catch {
            setTickerMessages(result.data.homepage_ticker_messages.split('|').filter(Boolean))
          }
        } else {
          setTickerMessages([
            '🚀 Giao hàng siêu tốc 2h nội thành',
            '🛡️ Bảo hành chính hãng 12-24 tháng',
            '⚙️ Đổi trả miễn phí trong 7 ngày',
            '🔥 Build PC Gaming giá siêu ưu đãi',
            '🎮 Gear xịn - Skill đỉnh'
          ])
        }
      }
    } catch {
      toast.error('Không thể tải cấu hình hệ thống')
    } finally {
      setIsLoading(false)
    }
  }
  const handleSave = async (sectionName?: string) => {
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
            contact_opening_hours: openingHours,
            guide_buy_link: guideBuyLink,
            warranty_link: warrantyLink,
            return_link: returnLink,
            payment_link: paymentLink,
            
            // New settings
            theme_accent: themeAccent,
            homepage_intro_title: introTitle,
            homepage_intro_text: introText,
            homepage_banner_title: bannerTitle,
            homepage_banner_subtitle: bannerSubtitle,
            homepage_banner_cta_text: bannerCtaText,
            homepage_banner_cta_link: bannerCtaLink,
            homepage_ticker_speed: tickerSpeed,
            homepage_ticker_messages: JSON.stringify(tickerMessages),
            seo_title: seoTitle,
            seo_description: seoDescription,
            seo_keywords: seoKeywords,
            shop_brands: JSON.stringify(shopBrands),
          }
        })
      })
      if (!res.ok) throw new Error()
      toast.success(sectionName ? `Đã lưu cấu hình ${sectionName}` : 'Đã lưu cấu hình hệ thống')
    } catch {
      toast.error('Lỗi lưu cấu hình hệ thống')
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
      const result = await res.json()
      if (!res.ok) throw new Error(result.error?.message || 'Lỗi khi upload')
      
      setVideoUrl(result.data.url)
      toast.success('Upload thành công, nhớ bấm Lưu cấu hình video')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddTickerMsg = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = newTickerMsg.trim()
    if (!msg) return
    
    if (tickerMessages.includes(msg)) {
      toast.error('Thông điệp này đã tồn tại')
      return
    }

    setTickerMessages([...tickerMessages, msg])
    setNewTickerMsg('')
    toast.success('Đã thêm tin nhắn chạy chữ')
  }

  const handleRemoveTickerMsg = (idx: number) => {
    const nextMsgs = tickerMessages.filter((_, i) => i !== idx)
    setTickerMessages(nextMsgs)
    toast.success('Đã xóa tin nhắn chạy chữ')
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCatName.trim()
    if (!name) return

    setIsCatLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error?.message || 'Lỗi khi thêm danh mục')
        return
      }
      toast.success(`Đã thêm danh mục "${name}"`)
      setNewCatName('')
      fetchCategories()
    } catch {
      toast.error('Lỗi khi thêm danh mục')
    } finally {
      setIsCatLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error?.message || 'Lỗi khi xóa danh mục')
        return
      }
      toast.success(`Đã xóa danh mục "${name}"`)
      fetchCategories()
    } catch {
      toast.error('Lỗi khi xóa danh mục')
    }
  }

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault()
    const brandName = newBrandName.trim()
    if (!brandName) return
    if (shopBrands.map(b => b.toLowerCase()).includes(brandName.toLowerCase())) {
      toast.error('Nhãn hàng này đã tồn tại!')
      return
    }
    updatePageState({ 
      shopBrands: [...shopBrands, brandName],
      newBrandName: ''
    })
    toast.success(`Đã thêm nhãn hàng "${brandName}", nhớ bấm Lưu cấu hình`)
  }

  const handleRemoveBrand = (brandName: string) => {
    const nextBrands = shopBrands.filter(b => b !== brandName)
    updatePageState({ shopBrands: nextBrands })
    toast.success(`Đã xóa nhãn hàng "${brandName}", nhớ bấm Lưu cấu hình`)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp!')
      return
    }

    if (newPassword.length < 3) {
      toast.error('Mật khẩu mới phải từ 3 ký tự trở lên!')
      return
    }

    setIsChangingPass(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error?.message || 'Không thể đổi mật khẩu')
        return
      }
      
      toast.success('Đổi mật khẩu tài khoản Admin thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Lỗi đổi mật khẩu')
    } finally {
      setIsChangingPass(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const menuSections = [
    { id: 'video', label: 'Giao diện & Video', icon: Film },
    { id: 'banner', label: 'Banner Trang Chủ', icon: ImageIcon },
    { id: 'ticker', label: 'Ticker Khuyến Mãi', icon: Zap },
    { id: 'contact', label: 'Thông tin liên hệ', icon: Globe },
    { id: 'policy', label: 'Chính sách & HD', icon: BookOpen },
    { id: 'seo', label: 'Cấu hình SEO', icon: Search },
    { id: 'category', label: 'Quản lý danh mục', icon: Tag },
    { id: 'brand', label: 'Quản lý nhãn hàng', icon: Boxes },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: KeyRound },
  ]

  const accentColors: Array<{ id: string; name: string; class: string; shadow?: string; border?: string; check?: string }> = [
    { id: 'violet', name: 'Violet (Tím)', class: 'bg-violet-600', shadow: 'shadow-violet-500/20' },
    { id: 'amber', name: 'Amber (Vàng)', class: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
    { id: 'rose', name: 'Rose (Hồng hồng)', class: 'bg-rose-600', shadow: 'shadow-rose-500/20' },
    { id: 'blue', name: 'Blue (Xanh dương)', class: 'bg-blue-600', shadow: 'shadow-blue-500/20' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
          <div className="size-12 bg-slate-900 border border-white/10 flex items-center justify-center rounded-xl">
            <Settings className="size-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Cài đặt hệ thống</h1>
            <p className="text-muted-foreground mt-1">Cấu hình toàn diện các tính năng, giao diện và thông tin của shop GearZone.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Left Sidebar Menu */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-3xl backdrop-blur-md space-y-1.5 lg:sticky lg:top-24 shadow-xl">
            <div className="px-3 py-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Cấu hình shop</div>
            
            {menuSections.map((sec) => {
              const Icon = sec.icon
              const isSelected = activeSection === sec.id
              return (
                <button type="button" 
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-98 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Modular Content */}
          <div className="space-y-6 flex-1 min-w-0">
            {/* Section 1: Video & Design Accent */}
            {activeSection === 'video' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <Film className="size-5 text-indigo-400" />
                  Giao diện & Video Cinema
                </div>
                
                <div className="space-y-6">
                  {/* Theme Accent Color */}
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                    <p className="block text-sm font-semibold mb-3 flex items-center gap-2">
                      <Palette className="size-4 text-slate-400" />
                      Màu nhấn chủ đạo (Accent Color)
                    </p>
                    <p className="text-xs text-slate-400 mb-4">Màu sắc các nút bấm, hiệu ứng hover, thẻ tag,... của cửa hàng ngoài trang chủ.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setThemeAccent(color.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all ${
                            themeAccent === color.id
                              ? `${color.class} border-white/20 text-white shadow-md`
                              : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                          }`}
                        >
                          <span className={`size-4 rounded-full ${color.class} ${color.shadow ?? ''}`} />
                          <span className="truncate">{color.name}</span>
                          {themeAccent === color.id && <Check className="size-4 text-white ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <p className="block text-sm font-semibold mb-2">Lời chào / tiêu đề giới thiệu shop</p>
                      <Input
                        value={introTitle}
                        onChange={(e) => setIntroTitle(e.target.value)}
                        placeholder="VD: Chào mừng đến với GearZone"
                        className="bg-slate-900 border-white/10"
                      />
                    </div>

                    <div>
                      <p className="block text-sm font-semibold mb-2">Mô tả ngắn về cửa hàng</p>
                      <textarea
                        value={introText}
                        onChange={(e) => setIntroText(e.target.value)}
                        placeholder="VD: GearZone chuyên gaming gear, linh kiện và phụ kiện máy tính chính hãng..."
                        aria-label="Mô tả ngắn về cửa hàng"
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-600 resize-none"
                      />
                      <p className="text-xs text-slate-500 mt-2">Đoạn này hiển thị ngay dưới video trang chủ. Nên viết 2-3 dòng ngắn.</p>
                    </div>
                  </div>

                  {/* Video settings */}
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                    <p className="block text-sm font-semibold mb-2">Đường dẫn Video trang chủ (Cinema Mode)</p>
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
                      <p className="block text-sm font-semibold mb-3">Hoặc Tải lên từ máy (Tối đa 200MB)</p>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleFileUpload}
                          aria-label="Tải lên tệp video giới thiệu"
                          className="absolute inset-0 size-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <Button type="button" disabled={isUploading} className="gap-2 bg-slate-900 border-white/10">
                          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                          {isUploading ? 'Đang tải lên...' : 'Chọn file video'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {videoUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center relative shadow-lg">
                      <video 
                        src={videoUrl} 
                        controls 
                        aria-label="Video giới thiệu cửa hàng"
                        className="size-full object-cover"
                      >
                        <track kind="captions" src="" label="Vietnamese" />
                      </video>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('Giao diện & Video')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu cấu hình
                  </Button>
                </div>
              </div>
            )}

            {/* Section 2: Banner config */}
            {activeSection === 'banner' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <ImageIcon className="size-5 text-indigo-400" />
                  Cấu hình Banner Trang Chủ
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <p className="block text-sm font-semibold mb-2">Tiêu đề chính (Banner Title)</p>
                      <Input
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="VD: GearZone - phụ kiện gaming rõ giá, rõ tồn kho."
                        className="bg-slate-900 border-white/10"
                      />
                    </div>

                    <div>
                      <p className="block text-sm font-semibold mb-2">Mô tả phụ (Banner Subtitle)</p>
                      <textarea
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        placeholder="VD: Xem ảnh sản phẩm, giá cũ, giá khuyến mãi, số lượng còn lại..."
                        aria-label="Mô tả phụ"
                        className="w-full h-24 rounded-xl border border-white/10 bg-slate-900 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <p className="block text-sm font-semibold mb-2">Chữ trên nút hành động (CTA Text)</p>
                        <Input
                          value={bannerCtaText}
                          onChange={(e) => setBannerCtaText(e.target.value)}
                          placeholder="VD: Xem sản phẩm"
                          className="bg-slate-900 border-white/10"
                        />
                      </div>

                      <div>
                        <p className="block text-sm font-semibold mb-2">Đường dẫn nút (CTA Link)</p>
                        <Input
                          value={bannerCtaLink}
                          onChange={(e) => setBannerCtaLink(e.target.value)}
                          placeholder="VD: /products"
                          className="bg-slate-900 border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('Banner')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu cấu hình Banner
                  </Button>
                </div>
              </div>
            )}

            {/* Section 3: Ticker messages list */}
            {activeSection === 'ticker' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <Zap className="size-5 text-indigo-400" />
                  Quản lý Ticker chạy chữ Khuyến mãi
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <p className="block text-sm font-semibold mb-2">Tốc độ cuộn chữ (Ticker Speed)</p>
                      <select
                        value={tickerSpeed}
                        onChange={(e) => setTickerSpeed(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="15s">Nhanh (15 giây)</option>
                        <option value="25s">Trung bình (25 giây - mặc định)</option>
                        <option value="35s">Chậm (35 giây)</option>
                        <option value="50s">Rất chậm (50 giây)</option>
                      </select>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <p className="block text-sm font-semibold mb-3">Các thông điệp đang chạy chữ ({tickerMessages.length})</p>
                      
                      {tickerMessages.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {tickerMessages.map((msg, idx) => (
                            <div 
                              key={msg} 
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5 text-sm"
                            >
                              <span className="font-semibold text-slate-200">{msg}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTickerMsg(idx)}
                                className="p-1 rounded-lg hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition"
                                title="Xóa thông điệp"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic mb-4">Chưa có tin nhắn nào. Ticker trang chủ sẽ trống.</p>
                      )}

                      <form onSubmit={handleAddTickerMsg} className="flex gap-3">
                        <Input
                          value={newTickerMsg}
                          onChange={(e) => setNewTickerMsg(e.target.value)}
                          placeholder="Nhập thông điệp mới (VD: 🎁 Tặng lót chuột khi mua bàn phím)..."
                          className="flex-1 bg-slate-900 border-white/10"
                        />
                        <Button 
                          type="submit" 
                          className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 shrink-0 rounded-xl"
                        >
                          <Plus className="size-4 mr-2" />
                          Thêm chữ
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('Ticker')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu cấu hình Ticker
                  </Button>
                </div>
              </div>
            )}

            {/* Section 4: Contact details */}
            {activeSection === 'contact' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <Globe className="size-5 text-indigo-400" />
                  Thông tin liên hệ cửa hàng
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="size-4 text-slate-400" /> Địa chỉ shop
                      </p>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ cửa hàng..."
                        className="bg-slate-900 border-white/10"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <Phone className="size-4 text-slate-400" /> Số Hotline
                        </p>
                        <Input
                          value={hotline}
                          onChange={(e) => setHotline(e.target.value)}
                          placeholder="Nhập số Hotline..."
                          className="bg-slate-900 border-white/10"
                        />
                      </div>

                      <div>
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <Mail className="size-4 text-slate-400" /> Email hỗ trợ
                        </p>
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
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="size-4 text-slate-400" /> Link Zalo tư vấn
                        </p>
                        <Input
                          value={zalo}
                          onChange={(e) => setZalo(e.target.value)}
                          placeholder="Nhập link Zalo tư vấn..."
                          className="bg-slate-900 border-white/10"
                        />
                      </div>

                      <div>
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <Globe className="size-4 text-slate-400" /> Link Fanpage Facebook
                        </p>
                        <Input
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="Nhập link Facebook..."
                          className="bg-slate-900 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Clock className="size-4 text-slate-400" /> Giờ mở cửa
                      </p>
                      <Input
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                        placeholder="VD: Thứ 2 - Chủ Nhật: 08:00 - 22:00"
                        className="bg-slate-900 border-white/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('Liên hệ')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu cấu hình liên hệ
                  </Button>
                </div>
              </div>
            )}

            {/* Section 5: Policies & docs */}
            {activeSection === 'policy' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <BookOpen className="size-5 text-indigo-400" />
                  Chính sách & Hướng dẫn hỗ trợ
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="size-4 text-slate-400" /> Hướng dẫn mua hàng
                        </p>
                        <Input
                          value={guideBuyLink}
                          onChange={(e) => setGuideBuyLink(e.target.value)}
                          placeholder="Nhập link/đường dẫn hướng dẫn mua hàng..."
                          className="bg-slate-900 border-white/10"
                        />
                      </div>

                      <div>
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <FileText className="size-4 text-slate-400" /> Chính sách bảo hành
                        </p>
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
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <RefreshCw className="size-4 text-slate-400" /> Chính sách đổi trả
                        </p>
                        <Input
                          value={returnLink}
                          onChange={(e) => setReturnLink(e.target.value)}
                          placeholder="Nhập link/đường dẫn chính sách đổi trả..."
                          className="bg-slate-900 border-white/10"
                        />
                      </div>

                      <div>
                        <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                          <CreditCard className="size-4 text-slate-400" /> Phương thức thanh toán
                        </p>
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

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('Liên kết')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu liên kết hỗ trợ
                  </Button>
                </div>
              </div>
            )}

            {/* Section 6: SEO */}
            {activeSection === 'seo' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <Search className="size-5 text-indigo-400" />
                  Cấu hình SEO & Metadata
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <p className="block text-sm font-semibold mb-2">Tiêu đề Website (Meta Title)</p>
                      <Input
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="VD: GearZone - Shop Gaming Gear Cao Cấp Chính Hãng"
                        className="bg-slate-900 border-white/10"
                      />
                    </div>

                    <div>
                      <p className="block text-sm font-semibold mb-2">Mô tả Website (Meta Description)</p>
                      <textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="VD: GearZone chuyên phân phối bàn phím cơ, chuột gaming, giá đỡ màn hình (arm) chính hãng 100% với giá tốt nhất thị trường."
                        aria-label="Mô tả Website (Meta Description)"
                        className="w-full h-24 rounded-xl border border-white/10 bg-slate-900 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <p className="block text-sm font-semibold mb-2">Từ khóa SEO (Keywords)</p>
                      <Input
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="VD: gearzone, ban phim co, chuot gaming, arm man hinh"
                        className="bg-slate-900 border-white/10"
                      />
                      <p className="text-xs text-slate-500 mt-1">Ngăn cách các từ khóa bằng dấu phẩy ( , )</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('SEO')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu cấu hình SEO
                  </Button>
                </div>
              </div>
            )}

            {/* Section 7: Category list */}
            {activeSection === 'category' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <Tag className="size-5 text-indigo-400" />
                  Quản lý danh mục sản phẩm
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                    <p className="block text-sm font-semibold mb-3">Tất cả danh mục hiện có</p>
                    
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5 mb-6">
                        {categories.map((cat) => (
                          <div 
                            key={cat.id} 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-slate-900 border border-white/10 hover:border-indigo-500/50 transition duration-200 group"
                          >
                            <Tag className="size-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                            <span>{cat.name}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-0.5 rounded-md hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition shrink-0"
                              title="Xóa danh mục"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mb-6 italic">Chưa có danh mục nào trong hệ thống.</p>
                    )}

                    <form onSubmit={handleAddCategory} className="border-t border-white/5 pt-5">
                      <p className="block text-sm font-semibold mb-2">Thêm danh mục mới</p>
                      <div className="flex gap-3">
                        <Input
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="Nhập tên danh mục (VD: Ghế Gaming, Đèn treo...)"
                          className="flex-1 bg-slate-900 border-white/10"
                          required
                        />
                        <Button 
                          type="submit" 
                          isLoading={isCatLoading} 
                          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-6 font-bold gap-2 shrink-0 rounded-xl"
                        >
                          <Plus className="size-4" />
                          Thêm danh mục
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Danh mục mới sẽ lập tức xuất hiện trong danh sách lựa chọn của Admin và bộ lọc của Khách hàng.</p>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Brand list */}
            {activeSection === 'brand' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <Boxes className="size-5 text-indigo-400" />
                  Quản lý nhãn hàng / thương hiệu
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5">
                    <p className="block text-sm font-semibold mb-3">Tất cả nhãn hàng hiện có ({shopBrands.length})</p>
                    
                    {shopBrands.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5 mb-6">
                        {shopBrands.map((brandName) => (
                          <div 
                            key={brandName} 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-slate-900 border border-white/10 hover:border-indigo-500/50 transition duration-200 group"
                          >
                            <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <span>{brandName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBrand(brandName)}
                              className="p-0.5 rounded-md hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition shrink-0"
                              title="Xóa nhãn hàng"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mb-6 italic">Chưa có nhãn hàng nào được cấu hình.</p>
                    )}

                    <form onSubmit={handleAddBrand} className="border-t border-white/5 pt-5">
                      <p className="block text-sm font-semibold mb-2">Thêm nhãn hàng mới</p>
                      <div className="flex gap-3">
                        <Input
                          value={newBrandName}
                          onChange={(e) => updatePageState({ newBrandName: e.target.value })}
                          placeholder="Nhập tên hãng (VD: Logitech, Asus, Akko...)"
                          className="flex-1 bg-slate-900 border-white/10"
                          required
                        />
                        <Button 
                          type="submit" 
                          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-6 font-bold gap-2 shrink-0 rounded-xl"
                        >
                          <Plus className="size-4" />
                          Thêm nhãn hàng
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Hệ thống sẽ dùng danh sách nhãn hàng này để tự động nhận dạng thương hiệu sản phẩm và cung cấp bộ lọc cho Khách hàng/Admin.</p>
                    </form>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-white/5 pt-6">
                  <Button type="button" onClick={() => handleSave('Nhãn hàng')} isLoading={isSaving} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg">
                    <Save className="size-4" />
                    Lưu cấu hình nhãn hàng
                  </Button>
                </div>
              </div>
            )}

            {/* Section 8: Security Password Change */}
            {activeSection === 'security' && (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xl font-bold mb-6 border-b border-white/5 pb-4 text-slate-200">
                  <KeyRound className="size-5 text-indigo-400" />
                  Bảo mật & Đổi mật khẩu Admin
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <p className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        Mật khẩu hiện tại (Current Password)
                      </p>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại..."
                        className="bg-slate-900 border-white/10"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <p className="block text-sm font-semibold mb-2">Mật khẩu mới (New Password)</p>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Tối thiểu 3 ký tự..."
                          className="bg-slate-900 border-white/10"
                          required
                        />
                      </div>

                      <div>
                        <p className="block text-sm font-semibold mb-2">Xác nhận mật khẩu mới</p>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới..."
                          className="bg-slate-900 border-white/10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-white/5 pt-6">
                    <Button 
                      type="submit" 
                      isLoading={isChangingPass} 
                      className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg"
                    >
                      <KeyRound className="size-4" />
                      Cập nhật mật khẩu mới
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
