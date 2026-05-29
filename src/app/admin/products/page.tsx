'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Boxes, ImageIcon, Loader2, Package, Plus, Search, ShieldCheck, Tag, TrendingUp, Edit2, Trash2, 
  EyeOff, XCircle, Copy, ExternalLink, MoreVertical, AlertTriangle
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { Button, Input, MoneyInputVND } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'
import { RichTextEditor } from '@/components/domain/RichTextEditor'

interface AdminProduct {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  oldPrice: number | null
  stock: number
  soldCount: number
  category: { name: string } | null
  updatedAt: string
}

type SalesStatus = 'active' | 'hidden' | 'discontinued' | 'draft'
type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

const initialForm = {
  name: '',
  categoryName: '',
  imageUrl: '',
  oldPrice: 0,
  price: 0,
  stock: '',
  description: '',
  specs: '',
}

export default function AdminProductsPage() {
  const { replace } = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [dataState, setDataState] = useState({
    products: [] as AdminProduct[],
    categories: [] as any[],
    isLoading: true,
  })
  const { products, categories, isLoading } = dataState

  const setProducts = (val: AdminProduct[] | ((prev: AdminProduct[]) => AdminProduct[])) => {
    setDataState(prev => {
      const nextProducts = typeof val === 'function' ? val(prev.products) : val
      return { ...prev, products: nextProducts }
    })
  }
  const setCategories = (val: any[] | ((prev: any[]) => any[])) => {
    setDataState(prev => {
      const nextCategories = typeof val === 'function' ? val(prev.categories) : val
      return { ...prev, categories: nextCategories }
    })
  }
  const setIsLoading = (val: boolean) => setDataState(prev => ({ ...prev, isLoading: val }))

  const [uiState, setUiState] = useState({
    isSaving: false,
    isUploading: false,
    showForm: false,
    editingId: null as string | null,
  })
  const { isSaving, isUploading, showForm, editingId } = uiState

  const setIsSaving = (val: boolean) => setUiState(prev => ({ ...prev, isSaving: val }))
  const setIsUploading = (val: boolean) => setUiState(prev => ({ ...prev, isUploading: val }))
  const setShowForm = (val: boolean) => setUiState(prev => ({ ...prev, showForm: val }))
  const setEditingId = (val: string | null) => setUiState(prev => ({ ...prev, editingId: val }))

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'hidden' | 'out_of_stock' | 'discontinued' | 'draft'>('all')
  const [formData, setFormData] = useState(initialForm)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      replace(getAdminPath('/login'))
    }
  }, [user, authLoading, replace])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchProducts()
      fetchCategories()
    }
  }, [user])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const result = await res.json()
      if (res.ok && result.data) {
        setCategories(result.data)
      }
    } catch {
      // Silently ignore
    }
  }

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error?.message || 'Không thể tải danh sách sản phẩm')
        return
      }

      setProducts(result.data || [])
    } catch {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
      const method = editingId ? 'PUT' : 'POST'

      const combinedDescription = formData.description.trim() + 
        (formData.specs.trim() ? '\n$$$SPECS$$$\n' + formData.specs.trim() : '')

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          oldPrice: formData.oldPrice || null,
          description: combinedDescription
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error?.message || (editingId ? 'Không thể cập nhật sản phẩm' : 'Không thể thêm sản phẩm'))
        return
      }

      toast.success(editingId ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      setFormData(initialForm)
      setEditingId(null)
      setShowForm(false)
      await fetchProducts()
      await fetchCategories()
    } catch {
      toast.error(editingId ? 'Không thể cập nhật sản phẩm' : 'Không thể thêm sản phẩm')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = (product: AdminProduct) => {
    setEditingId(product.id)
    setOpenActionMenuId(null)
    
    const rawDescription = product.description || ''
    const hasSpecs = rawDescription.includes('$$$SPECS$$$')
    const [descPart, specsPart] = hasSpecs 
      ? rawDescription.split('$$$SPECS$$$') 
      : [rawDescription, '']

    setFormData({
      name: product.name,
      categoryName: product.category?.name || '',
      imageUrl: product.imageUrl || '',
      oldPrice: product.oldPrice || 0,
      price: product.price || 0,
      stock: product.stock.toString(),
      description: descPart.trim(),
      specs: specsPart.trim(),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(initialForm)
    setShowForm(false)
  }

  const handleDeleteProduct = async (id: string) => {
    setOpenActionMenuId(null)
    if (!window.confirm('CẢNH BÁO MẤT DỮ LIỆU: \nBạn có chắc chắn muốn xoá cứng sản phẩm này?\nKhuyến nghị: Nên Ẩn (Hide) hoặc Ngừng bán (Discontinue) để bảo toàn lịch sử hệ thống.')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error?.message || 'Lỗi khi xoá sản phẩm')
        return
      }
      toast.success('Đã xoá cứng sản phẩm')
      await fetchProducts()
    } catch {
      toast.error('Lỗi khi xoá sản phẩm')
    }
  }

  const handleMockAction = (action: string) => {
    setOpenActionMenuId(null)
    toast.info(`Tính năng [${action}] đang được phát triển (Cần Backend API)`)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      async function uploadSingleFile(file: File) {
        const uploadData = new FormData()
        uploadData.append('image', file)

        const res = await window.fetch('/api/admin/upload-product-image', {
          method: 'POST',
          credentials: 'include',
          body: uploadData,
        })
        const result = await res.json()

        if (res.ok && result.data?.imageUrl) {
          return result.data.imageUrl
        }
        return null
      }

      const uploadPromises = Array.from(files).map(uploadSingleFile)

      const results = await Promise.all(uploadPromises)
      const uploadedUrls = results.filter(Boolean) as string[]

      if (uploadedUrls.length > 0) {
        const combined = uploadedUrls.join('|')
        setFormData((current) => ({
          ...current,
          imageUrl: current.imageUrl ? current.imageUrl + '|' + combined : combined
        }))
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh sản phẩm`)
      } else {
        toast.error('Không thể tải ảnh lên')
      }
    } catch {
      toast.error('Không thể tải ảnh lên')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  // Derive statuses
  const getInventoryStatus = (stock: number): InventoryStatus => {
    if (stock <= 0) return 'out_of_stock'
    if (stock <= 5) return 'low_stock'
    return 'in_stock'
  }

  const getSalesStatus = (product: AdminProduct): SalesStatus => {
    // TODO: Connect to real backend fields (product.salesStatus or product.isActive)
    // For now, derive mock states for demonstration
    // We assume 'active' by default. If we wanted to persist, we'd read from product.
    return 'active' 
  }

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(query) ||
                            product.category?.name.toLowerCase().includes(query) ||
                            product.id.toLowerCase().includes(query)
      if (!matchesSearch) return false

      const salesStatus = getSalesStatus(product)
      const inventoryStatus = getInventoryStatus(product.stock)

      if (filterTab === 'active') return salesStatus === 'active'
      if (filterTab === 'hidden') return salesStatus === 'hidden'
      if (filterTab === 'discontinued') return salesStatus === 'discontinued'
      if (filterTab === 'draft') return salesStatus === 'draft'
      if (filterTab === 'out_of_stock') return inventoryStatus === 'out_of_stock'

      return true
    })
  }, [products, searchQuery, filterTab])

  const existingCategories = useMemo(() => {
    return categories.map((c) => c.name) as string[]
  }, [categories])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="size-4" /> Vận hành kinh doanh
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Sản Phẩm</h1>
            <p className="text-muted-foreground mt-1 text-sm">Cấu hình danh mục bán hàng, giá cả và hiển thị sản phẩm trên cửa hàng.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm bg-slate-900 border border-white/5 px-4 py-2 rounded-xl">
              <Package className="size-4 text-blue-400" />
              <span className="font-semibold">{products.length}</span> sản phẩm
            </div>
            <button type="button"
              onClick={() => {
                setShowForm(!showForm)
                if (editingId) handleCancelEdit()
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all"
            >
              <Plus className="size-4" />
              {showForm ? 'Đóng form' : 'Thêm sản phẩm'}
            </button>
          </div>
        </div>

        {(showForm || editingId !== null) && (
          <form onSubmit={handleSubmit} className="mb-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                {editingId ? <Edit2 className="size-4 text-blue-400" /> : <Plus className="size-4 text-blue-400" />}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                <p className="text-xs text-muted-foreground">Các trạng thái bán hàng nâng cao sẽ sớm được hỗ trợ (TODO).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên sản phẩm"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="VD: Logitech G Pro X Superlight 2"
                  required
                />
                <div>
                  <Input
                    label="Danh mục"
                    value={formData.categoryName}
                    onChange={(event) => setFormData({ ...formData, categoryName: event.target.value })}
                    placeholder="VD: Chuột, Bàn phím, Tai nghe"
                    list="categories"
                  />
                  <datalist id="categories">
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </datalist>
                </div>
                <Input
                  label="Ảnh sản phẩm (Phân tách bằng dấu |)"
                  value={formData.imageUrl}
                  onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
                  placeholder="VD: link_anh_1|link_anh_2"
                  className="md:col-span-2"
                />
                <div className="md:col-span-2">
                  <p className="block text-sm font-medium text-muted-foreground mb-1.5">Chọn tệp ảnh (Tối đa 5MB)</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:h-10 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700 disabled:opacity-50"
                    />
                    {isUploading && (
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <Loader2 className="size-4 animate-spin" />
                        Đang tải các ảnh…
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <MoneyInputVND
                    label="Giá cũ"
                    value={formData.oldPrice}
                    onChange={(val) => setFormData({ ...formData, oldPrice: val })}
                    placeholder="3790000"
                  />
                </div>
                <div>
                  <MoneyInputVND
                    label="Giá bán"
                    value={formData.price}
                    onChange={(val) => setFormData({ ...formData, price: val })}
                    placeholder="3290000"
                    required
                    error={formData.price === 0 ? "Giá bán bắt buộc nhập và lớn hơn 0" : undefined}
                    hint={formData.oldPrice > 0 && formData.price > formData.oldPrice ? "Giá bán đang cao hơn giá cũ" : undefined}
                  />
                </div>
                <Input
                  label="Số lượng tồn (Chỉ cấu hình lúc tạo mới)"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                  placeholder="10"
                  required
                />
                <div className="md:col-span-2">
                  <p className="block text-sm font-medium text-muted-foreground mb-1.5">Mô tả chi tiết</p>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Viết bài viết giới thiệu sản phẩm..."
                  />
                </div>
                <div className="md:col-span-2">
                  <p className="block text-sm font-medium text-indigo-400 mb-1.5 font-bold flex items-center gap-1.5">
                    <span className="inline-block size-1.5 bg-indigo-400 rounded-full"></span>
                    Thông số kỹ thuật
                  </p>
                  <textarea
                    value={formData.specs}
                    onChange={(event) => setFormData({ ...formData, specs: event.target.value })}
                    placeholder="Thương hiệu: Akko&#10;Kết nối: Bluetooth 5.0"
                    rows={4}
                    className="w-full rounded-xl border border-indigo-500/20 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/50 overflow-hidden min-h-[260px] flex flex-col">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl.split('|')[0]}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="h-48 w-full object-cover bg-white"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-slate-900 border-b border-white/5">
                    <ImageIcon className="size-10 text-slate-600" />
                  </div>
                )}
                <div className="p-4 flex-1">
                  <p className="font-bold line-clamp-1">{formData.name || 'Tên sản phẩm'}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {sanitizeProductExcerpt(formData.description)}
                  </p>
                  <div className="flex items-end gap-2 mt-4">
                    <span className="text-lg font-mono font-extrabold text-emerald-400">
                      {formData.price ? formatPrice(Number(formData.price)) : formatPrice(0)}
                    </span>
                    {formData.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through mb-0.5">
                        {formatPrice(Number(formData.oldPrice))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-white/5">
              {editingId && (
                <Button type="button" onClick={handleCancelEdit} disabled={isSaving} className="bg-slate-800 hover:bg-slate-700">
                  Hủy
                </Button>
              )}
              <Button type="submit" isLoading={isSaving} className="gap-2">
                {editingId ? <Edit2 className="size-4" /> : <Plus className="size-4" />}
                {editingId ? 'Cập nhật' : 'Lưu sản phẩm mới'}
              </Button>
            </div>
          </form>
        )}

        {/* Tab Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex bg-slate-900/80 p-1 border border-white/5 rounded-xl whitespace-nowrap w-max">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'active', label: 'Đang bán' },
                { id: 'hidden', label: 'Ẩn' },
                { id: 'out_of_stock', label: 'Hết hàng' },
                { id: 'discontinued', label: 'Ngừng kinh doanh' },
                { id: 'draft', label: 'Bản nháp' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    filterTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <input
              type="text"
              placeholder="Tên, danh mục hoặc SKU..."
              aria-label="Tìm kiếm sản phẩm"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500 text-sm"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-visible relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="size-8 animate-spin text-blue-400 mb-2" />
              <p className="text-slate-400 text-sm">Đang tải danh sách sản phẩm…</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6 min-w-[320px]">Sản phẩm & SKU</th>
                    <th className="p-4 min-w-[120px]">Phân loại</th>
                    <th className="p-4 min-w-[140px]">Trạng thái (Sales)</th>
                    <th className="p-4 min-w-[140px]">Tồn kho (Inv)</th>
                    <th className="p-4 text-right pr-6 min-w-[80px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product) => {
                    const salesStatus = getSalesStatus(product)
                    const invStatus = getInventoryStatus(product.stock)
                    const isMenuOpen = openActionMenuId === product.id

                    return (
                      <tr key={product.id} className="hover:bg-slate-900/30 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex gap-4 items-start">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl.split('|')[0]} 
                                alt={product.name} 
                                width={64} 
                                height={64} 
                                className="size-16 rounded-xl object-contain bg-white border border-white/10 shrink-0" 
                              />
                            ) : (
                              <div className="size-16 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                                <ImageIcon className="size-6 text-slate-600" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white text-sm line-clamp-1 leading-snug">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1 mb-1.5">
                                <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                                  SKU: {product.id.slice(-8)}
                                </span>
                                <span className="text-emerald-400 font-mono font-bold text-xs">{formatPrice(product.price)}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1" title="Đã sanitize HTML">
                                {sanitizeProductExcerpt(product.description, 70)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Tag className="size-3" />
                            {product.category?.name || 'Chưa phân loại'}
                          </span>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1.5 items-start">
                            {salesStatus === 'active' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ĐANG BÁN (Active)</span>}
                            {salesStatus === 'hidden' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">ẨN (Hidden)</span>}
                            {salesStatus === 'discontinued' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">NGỪNG BÁN</span>}
                            {salesStatus === 'draft' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">NHÁP (Draft)</span>}
                            <span className="text-[9px] text-slate-500 italic flex items-center gap-1" title="Cần Backend Persist">
                              <AlertTriangle className="size-2.5" /> TODO UI-only
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1.5 items-start">
                            {invStatus === 'in_stock' && <span className="text-slate-300 font-semibold text-xs"><Boxes className="size-3.5 inline mr-1 text-slate-500" />Tồn kho: {product.stock}</span>}
                            {invStatus === 'low_stock' && <span className="text-amber-400 font-semibold text-xs"><AlertTriangle className="size-3.5 inline mr-1" />Sắp hết: {product.stock}</span>}
                            {invStatus === 'out_of_stock' && <span className="text-red-400 font-bold text-xs"><XCircle className="size-3.5 inline mr-1" />Hết hàng (0)</span>}
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                              <TrendingUp className="size-3 text-emerald-500" /> Đã bán: {product.soldCount}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 align-top text-right relative">
                          <button
                            onClick={() => setOpenActionMenuId(isMenuOpen ? null : product.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="size-5" />
                          </button>
                          
                          {isMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenActionMenuId(null)} />
                              <div className="absolute right-8 top-4 w-48 bg-slate-900 border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 py-1">
                                <button
                                  onClick={() => handleEditClick(product)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <Edit2 className="size-4 text-blue-400" /> Sửa sản phẩm
                                </button>
                                <button
                                  onClick={() => handleMockAction('Hide/Show')}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <EyeOff className="size-4 text-slate-400" /> Ẩn khỏi cửa hàng
                                </button>
                                <button
                                  onClick={() => handleMockAction('Discontinue')}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <XCircle className="size-4 text-amber-400" /> Ngừng kinh doanh
                                </button>
                                <button
                                  onClick={() => handleMockAction('Duplicate')}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <Copy className="size-4 text-indigo-400" /> Nhân bản (Duplicate)
                                </button>
                                <Link
                                  href={`/products/${product.id}`}
                                  target="_blank"
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 border-b border-white/5"
                                >
                                  <ExternalLink className="size-4 text-emerald-400" /> Xem trên cửa hàng
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={product.soldCount > 0}
                                  className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${
                                    product.soldCount > 0 
                                      ? 'text-slate-600 cursor-not-allowed' 
                                      : 'text-red-400 hover:bg-red-500/10'
                                  }`}
                                  title={product.soldCount > 0 ? 'Không thể xóa cứng sản phẩm đã bán. Hãy dùng Ngừng kinh doanh.' : ''}
                                >
                                  <Trash2 className="size-4" /> Xóa cứng (Hard Delete)
                                </button>
                              </div>
                            </>
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
              <Package className="size-12 text-slate-700 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-1 text-slate-300">Không có dữ liệu</h3>
              <p className="text-slate-500 text-sm">Chưa có sản phẩm phù hợp bộ lọc.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
