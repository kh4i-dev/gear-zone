'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Boxes, ImageIcon, Loader2, Package, Plus, Search, ShieldCheck, Tag, TrendingUp, Edit2, Trash2, 
  EyeOff, XCircle, Copy, ExternalLink, MoreVertical, AlertTriangle, ListFilter, X
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { Button, Input, MoneyInputVND } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'
import { getPrimaryLegacyImageUrl, getSafeImageSrc } from '@/lib/product-images'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'
import { RichTextEditor } from '@/components/domain/RichTextEditor'
import { ProductImageFrame } from '@/components/domain/ProductImageFrame'
import { AdminImageGallery } from '@/components/domain/AdminImageGallery'
import { AdminVariantEditor } from '@/components/domain/AdminVariantEditor'
import type { AdminOptionGroup, AdminVariant } from '@/components/domain/AdminVariantEditor'
import { hydrateAdminVariants, parseSpecText, serializeSpecs } from '@/lib/products/adminProductForm'
import { buildCategoryCounts, buildBrandCounts } from '@/lib/products/adminProductFilters'


interface AdminProduct {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  oldPrice: number | null
  stock: number
  soldCount: number
  category: { id?: string | null; name: string } | null
  updatedAt: string
  isVisible: boolean
  status: string
  images?: { url: string; sortOrder: number; isPrimary?: boolean | null }[]
  specs?: { name: string; value: string }[] | null
  options?: { id: string; name: string; sortOrder: number; values: { id: string; label: string; sortOrder: number }[] }[]
  variants?: {
    id: string; sku: string | null; price: number | null; salePrice: number | null;
    stock: number; imageUrl: string | null; isActive: boolean;
    optionValues: { optionValue: { id: string; optionId: string; label: string; option?: { id: string; name: string } | null } }[]
  }[]
}

type SalesStatus = 'active' | 'hidden' | 'discontinued' | 'draft'
type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

const initialForm = {
  name: '',
  categoryName: '',
  imageUrl: '',
  oldPrice: null as number | null,
  price: 0,
  stock: '',
  description: '',
  specRows: '',
  optionGroups: [] as AdminOptionGroup[],
  variants: [] as AdminVariant[],
}

const COMMON_BRANDS = [
  'Logitech', 'Razer', 'Asus', 'Corsair', 'Akko', 
  'Keychron', 'AULA', 'HyperX', 'SteelSeries', 'Fuhlen',
  'Acer', 'HP', 'Dell', 'Gigabyte', 'MSI', 'DareU', 'Rapoo', 'ATK'
]

function getProductBrand(name: string, brandsList: string[]): string {
  const match = brandsList.find(brand => name.toLowerCase().includes(brand.toLowerCase()))
  return match || 'Khác'
}

const getInventoryStatus = (stock: number): InventoryStatus => {
  if (stock <= 0) return 'out_of_stock'
  if (stock <= 5) return 'low_stock'
  return 'in_stock'
}

const getActiveVariantStockTotal = (variants: { stock: number; isActive?: boolean }[] | undefined) =>
  (variants ?? []).reduce((total, variant) => {
    if (variant.isActive === false) return total
    return total + variant.stock
  }, 0)

const getAdminProductStock = (product: Pick<AdminProduct, 'stock' | 'variants'>) => {
  if (product.variants && product.variants.length > 0) {
    return getActiveVariantStockTotal(product.variants)
  }
  return product.stock
}

const getSalesStatus = (product: AdminProduct): SalesStatus => {
  if (product.status === 'DISCONTINUED') return 'discontinued'
  if (!product.isVisible) return 'hidden'
  return 'active'
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
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all')
  const [selectedBrand, setSelectedBrand] = useState<'all' | string>('all')
  const [brands, setBrands] = useState<string[] | undefined>(undefined)
  const resolvedBrands = brands || COMMON_BRANDS
  const previewVariant = formData.variants.find((variant) => variant.isActive) ?? formData.variants[0] ?? null
  const previewVariantName = previewVariant
    ? Object.values(previewVariant.options).filter(Boolean).join(' / ') || 'Bien the'
    : 'Chua co bien the'
  const previewPrice = previewVariant?.salePrice ?? previewVariant?.price ?? formData.price
  const previewOldPrice = previewVariant?.salePrice ? (previewVariant.price ?? formData.oldPrice) : formData.oldPrice
  const formHasVariants = formData.optionGroups.length > 0 || formData.variants.length > 0
  const formVariantStockTotal = getActiveVariantStockTotal(formData.variants)
  const previewStock = formHasVariants ? formVariantStockTotal : Number(formData.stock) || 0

  const categoryStats = useMemo(() => {
    return buildCategoryCounts(products, categories)
  }, [products, categories])

  const brandStats = useMemo(() => {
    return buildBrandCounts(products, resolvedBrands, selectedCategory)
  }, [products, resolvedBrands, selectedCategory])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const result = await res.json()
        if (res.ok && result.data && result.data.shop_brands) {
          setBrands(JSON.parse(result.data.shop_brands))
        }
      } catch {
        // Fallback
      }
    }
    fetchSettings()
  }, [])

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
      const galleryUrls = formData.imageUrl
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean)
      const validSpecs = parseSpecText(formData.specRows)

      setHasSubmitted(true)

      const optionGroups = formData.optionGroups
      const variants = formData.variants
      const stock = variants.length > 0 ? getActiveVariantStockTotal(variants) : Number(formData.stock) || 0

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          categoryName: formData.categoryName,
          imageUrl: galleryUrls[0] || '',
          oldPrice: formData.oldPrice ?? null,
          price: formData.price,
          stock,
          description: formData.description.trim(),
          galleryImages: galleryUrls,
          specs: validSpecs.length > 0 ? validSpecs : null,
          optionGroups,
          variants,
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error?.message || (editingId ? 'Không thể cập nhật sản phẩm' : 'Không thể thêm sản phẩm'))
        return
      }

      toast.success(editingId ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      setFormData(initialForm)
      setHasSubmitted(false)
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

    const galleryUrls = product.images?.length
      ? product.images
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((img) => img.url)
          .join('\n')
      : product.imageUrl || ''

    const parsedSpecs: { name: string; value: string }[] = []
    if (Array.isArray(product.specs) && product.specs.length > 0) {
      parsedSpecs.push(...product.specs.filter((s) => s.name && s.value))
    } else {
      const rawDescription = product.description || ''
      const specMatch = rawDescription.match(/\$\$\$SPECS\$\$\$([\s\S]*)/)
      if (specMatch) {
        specMatch[1]
          .trim()
          .split('\n')
          .forEach((line) => {
            const colonIdx = line.indexOf(':')
            if (colonIdx > 0) {
              parsedSpecs.push({
                name: line.slice(0, colonIdx).trim(),
                value: line.slice(colonIdx + 1).trim(),
              })
            }
          })
      }
    }

    const description = Array.isArray(product.specs)
      ? (product.description || '').replace(/\n\n?\$\$\$SPECS\$\$\$[\s\S]*/, '').trim()
      : product.description || ''

    const loadedOptionGroups: AdminOptionGroup[] =
      product.options?.map((o) => ({
        name: o.name,
        values: o.values
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((v) => v.label),
      })) ?? []

    const loadedVariants: AdminVariant[] = hydrateAdminVariants(product.variants, product.options)

    setFormData({
      name: product.name,
      categoryName: product.category?.name || '',
      imageUrl: galleryUrls,
      oldPrice: product.oldPrice ?? null,
      price: product.price,
      stock: product.stock.toString(),
      description,
      specRows: serializeSpecs(parsedSpecs),
      optionGroups: loadedOptionGroups,
      variants: loadedVariants,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(initialForm)
    setSelectedCategory('all')
    setSelectedBrand('all')
    setHasSubmitted(false)
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

  const handleToggleVisibility = async (product: AdminProduct) => {
    setOpenActionMenuId(null)
    const nextVisibility = !product.isVisible
    const toastId = toast.loading(`${nextVisibility ? 'Hiện' : 'Ẩn'} sản phẩm...`)
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextVisibility }),
        credentials: 'include',
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error?.message || 'Lỗi khi cập nhật hiển thị')
      }
      
      toast.success(nextVisibility ? 'Đã hiển thị sản phẩm trên store!' : 'Đã ẩn sản phẩm khỏi store!', { id: toastId })
      await fetchProducts()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật hiển thị', { id: toastId })
    }
  }

  const handleToggleStatus = async (product: AdminProduct) => {
    setOpenActionMenuId(null)
    const nextStatus = product.status === 'DISCONTINUED' ? 'ACTIVE' : 'DISCONTINUED'
    const toastId = toast.loading(`${nextStatus === 'DISCONTINUED' ? 'Ngừng bán' : 'Kích hoạt'} sản phẩm...`)
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'include',
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error?.message || 'Lỗi khi cập nhật trạng thái')
      }
      
      toast.success(nextStatus === 'DISCONTINUED' ? 'Đã ngừng bán sản phẩm!' : 'Đã kích hoạt bán sản phẩm!', { id: toastId })
      await fetchProducts()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái', { id: toastId })
    }
  }

  const handleDuplicateProduct = async (product: AdminProduct) => {
    setOpenActionMenuId(null)
    const toastId = toast.loading('Đang nhân bản sản phẩm...')
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error?.message || 'Lỗi khi nhân bản sản phẩm')
      }
      
      const newProduct = result.data
      toast.success('Nhân bản sản phẩm thành công!', { id: toastId })
      
      await fetchProducts()
      
      // Auto open edit form for the duplicated product
      handleEditClick(newProduct)
      setShowForm(true)
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi nhân bản sản phẩm', { id: toastId })
    }
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
        const combined = uploadedUrls.join('\n')
        setFormData((current) => ({
          ...current,
          imageUrl: current.imageUrl ? current.imageUrl + '\n' + combined : combined
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



  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(query) ||
                              product.category?.name.toLowerCase().includes(query) ||
                              product.id.toLowerCase().includes(query)
        if (!matchesSearch) return false

        if (selectedCategory !== 'all' && product.category?.id !== selectedCategory && product.category?.name !== selectedCategory) {
          return false
        }

        const salesStatus = getSalesStatus(product)
        const productStock = getAdminProductStock(product)
        const inventoryStatus = getInventoryStatus(productStock)

        let matchesTab = true
        if (filterTab === 'active') matchesTab = salesStatus === 'active'
        else if (filterTab === 'hidden') matchesTab = salesStatus === 'hidden'
        else if (filterTab === 'discontinued') matchesTab = salesStatus === 'discontinued'
        else if (filterTab === 'draft') matchesTab = salesStatus === 'draft'
        else if (filterTab === 'out_of_stock') matchesTab = inventoryStatus === 'out_of_stock'

        if (!matchesTab) return false

        if (selectedBrand === 'all') return true
        return getProductBrand(product.name, resolvedBrands) === selectedBrand
      })
  }, [products, searchQuery, selectedCategory, filterTab, selectedBrand, resolvedBrands])

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
                if (!showForm) {
                  setFormData(initialForm)
                  setHasSubmitted(false)
                  setSelectedCategory('all')
                  setSelectedBrand('all')
                }
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
                <div>
                  <Input
                    label="Tên sản phẩm"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="VD: Logitech G Pro X Superlight 2"
                    required
                  />
                  <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="inline-block size-1 bg-emerald-400 rounded-full animate-pulse" />
                    Hãng sản xuất tự nhận diện theo tên sản phẩm (VD: Logitech, Asus, Razer, Akko…).
                  </p>
                </div>
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
                <div className="md:col-span-2">
                  <AdminImageGallery
                    imageUrl={formData.imageUrl}
                    onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                    onUpload={handleImageUpload}
                    isUploading={isUploading}
                    disabled={isSaving}
                  />
                  <div className="mt-2">
                    <input
                      aria-label="Thêm ảnh bằng URL"
                      placeholder="Hoặc dán URL ảnh vào đây và nhấn Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const url = (e.target as HTMLInputElement).value.trim()
                          if (url) {
                            const next = formData.imageUrl
                              ? formData.imageUrl + '\n' + url
                              : url
                            setFormData({ ...formData, imageUrl: next })
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-white/[0.06] bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <MoneyInputVND
                    label="Giá cũ"
                    value={formData.oldPrice}
                    onChange={(val) => setFormData({ ...formData, oldPrice: val })}
                    placeholder=""
                  />
                </div>
                <div>
                  <MoneyInputVND
                    label="Giá bán"
                    value={formData.price}
                    onChange={(val) => setFormData({ ...formData, price: val })}
                    placeholder=""
                    required
                    error={hasSubmitted && formData.price === 0 ? "Giá bán bắt buộc nhập và lớn hơn 0" : undefined}
                    hint={formData.oldPrice != null && formData.oldPrice > 0 && formData.price > formData.oldPrice ? "Giá bán đang cao hơn giá cũ" : undefined}
                  />
                </div>
                {formHasVariants ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <p className="text-sm font-bold text-emerald-300">T?n kho ???c t?nh t? t?ng bi?n th?.</p>
                    <p className="mt-1 text-xs text-slate-400">
                      T?ng kho hi?n t?i: <span className="font-mono font-bold text-white">{formVariantStockTotal}</span>
                    </p>
                  </div>
                ) : (
                  <Input
                    label="S? l??ng t?n"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                    placeholder="10"
                    required
                  />
                )}
                <div className="md:col-span-2">
                  <p className="block text-sm font-medium text-muted-foreground mb-1.5">Mô tả chi tiết</p>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Viết bài viết giới thiệu sản phẩm..."
                  />
                </div>
                <div className="md:col-span-2">
                  <p className="block text-sm font-medium text-indigo-400 font-bold flex items-center gap-1.5 mb-1.5">
                    <span className="inline-block size-1.5 bg-indigo-400 rounded-full"></span>
                    Thông số kỹ thuật
                  </p>
                  <textarea
                    aria-label="Thông số kỹ thuật"
                    value={formData.specRows}
                    onChange={(e) => setFormData({ ...formData, specRows: e.target.value })}
                    placeholder={"Thương hiệu: Akko\nModel: 5075B Plus\nKết nối: Bluetooth / 2.4G / USB-C\nPin: 3000mAh\nTrọng lượng: 0.9kg"}
                    className="w-full rounded-lg border border-white/[0.06] bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 placeholder:leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono resize-y min-h-[160px]"
                    rows={8}
                    spellCheck={false}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Mỗi dòng một thông số, định dạng <code className="text-indigo-400">Tên: Giá trị</code> hoặc <code className="text-indigo-400">Tên|Giá trị</code>
                  </p>
                  {formData.specRows.trim() && (
                    <div className="mt-2 rounded-lg border border-white/[0.06] bg-slate-950/40 p-2.5">
                      <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Xem trước ({parseSpecText(formData.specRows).length} thông số)</p>
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                        {parseSpecText(formData.specRows).map((spec, i) => (
                          <div key={i} className="contents">
                            <span className="text-slate-400 truncate max-w-[160px]">{spec.name}:</span>
                            <span className="text-white">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:sticky lg:top-5 rounded-xl border border-white/[0.06] bg-[#070707] p-3 shadow-xl">
                <div className="relative overflow-hidden">
                  {/* Image Area - Premium white stage in a dark gradient frame */}
                  <div className="relative float-left mr-3 w-24 rounded-lg border border-white/[0.06] bg-[#0a0a0a] p-1">
                    <ProductImageFrame
                      src={getPrimaryLegacyImageUrl(previewVariant?.imageUrl || formData.imageUrl)}
                      alt={formData.name || 'Preview'}
                      aspectRatio="aspect-square"
                      galleryImages={formData.imageUrl.split(/\r?\n/).filter(Boolean)}
                    />
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0">
                    {/* Category Badge — Eyebrow pill */}
                    <div className="mb-3 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-400 w-fit">
                      {formData.categoryName || 'Khác'}
                    </div>

                    {/* Product Title */}
                    <h3 className="h-10 text-[15px] font-semibold tracking-tight leading-5 text-white line-clamp-2 overflow-hidden">
                      {formData.name || 'Tên sản phẩm'}
                    </h3>

                    {/* Description Excerpt */}
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-400 line-clamp-2 min-h-8">
                      {sanitizeProductExcerpt(formData.description) || 'Mô tả ngắn hoặc bài viết giới thiệu sản phẩm...'}
                    </p>

                    {/* Price & Stock Section */}
                    <div className="mt-auto pt-4 border-t border-white/[0.04] flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-base md:text-lg font-bold text-white">
                          {formatPrice(Number(previewPrice) || 0)}
                        </span>
                        {previewOldPrice && previewOldPrice > Number(previewPrice || 0) ? (
                          <span className="text-[10px] md:text-xs font-semibold text-slate-500 line-through">
                            {formatPrice(Number(previewOldPrice))}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[11px] font-semibold text-slate-500">
                        T?n kho: {previewStock}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <AdminVariantEditor
                optionGroups={formData.optionGroups}
                variants={formData.variants}
                onOptionGroupsChange={(groups) =>
                  setFormData((current) => ({
                    ...current,
                    optionGroups: groups,
                  }))
                }
                onVariantsChange={(variants) =>
                  setFormData((current) => ({ ...current, variants }))
                }
                disabled={isSaving}
              />
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

        {/* Category Filter Section */}
        <div className="mb-4 p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] shadow-xl">
          <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2 select-none">
              <ListFilter className="size-4 text-blue-400 animate-pulse" />
              Khu vực quản lý sản phẩm
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
                }`}
              >
                <span>Tất cả</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                  {products.length}
                </span>
              </button>

              {categoryStats.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Filter Section */}
        <div className="mb-6 p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04] shadow-xl">
          <div className="rounded-[calc(1.25rem-6px)] bg-[#070707] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-2 select-none">
              <Boxes className="size-4 text-blue-400 animate-pulse" />
              Lọc theo thương hiệu
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                  selectedBrand === 'all'
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
                }`}
              >
                <span>Tất cả hãng</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                  {Object.keys(brandStats).length}
                </span>
              </button>

              {Object.entries(brandStats).map(([brand, count]) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 h-10 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer outline-none whitespace-nowrap ${
                    selectedBrand === brand
                      ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      : 'bg-[#0a0a0a] border-white/[0.06] text-slate-400 hover:border-white/10 hover:text-white hover:-translate-y-[1px]'
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>{brand}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

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
                <button type="button"
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
            <>
              {/* Desktop view: keeping table layout */}
              <div className="hidden md:block overflow-x-auto min-h-[400px]">
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
                      const productStock = getAdminProductStock(product)
                      const invStatus = getInventoryStatus(productStock)
                      const isMenuOpen = openActionMenuId === product.id

                      return (
                        <tr key={product.id} className="hover:bg-slate-900/30 transition-colors group">
                          <td className="p-4 pl-6">
                            <div className="flex gap-4 items-start">
                              {product.imageUrl ? (
                                <Image 
                                  src={getSafeImageSrc(product.imageUrl)} 
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
                            <div className="flex flex-col gap-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                                <Tag className="size-3" />
                                {product.category?.name || 'Chưa phân loại'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
                                <span className="size-1 bg-indigo-400 rounded-full animate-pulse" />
                                <Boxes className="size-3" />
                                {getProductBrand(product.name, resolvedBrands)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-1.5 items-start">
                              {salesStatus === 'active' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ĐANG BÁN (Active)</span>}
                              {salesStatus === 'hidden' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">ẨN (Hidden)</span>}
                              {salesStatus === 'discontinued' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">NGỪNG BÁN</span>}
                              {salesStatus === 'draft' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">NHÁP (Draft)</span>}
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-1.5 items-start">
                              {invStatus === 'in_stock' && <span className="text-slate-300 font-semibold text-xs"><Boxes className="size-3.5 inline mr-1 text-slate-500" />Tổng kho: {productStock}</span>}
                              {invStatus === 'low_stock' && <span className="text-amber-400 font-semibold text-xs"><AlertTriangle className="size-3.5 inline mr-1" />Sắp hết: {productStock}</span>}
                              {invStatus === 'out_of_stock' && <span className="text-red-400 font-bold text-xs"><XCircle className="size-3.5 inline mr-1" />Hết hàng (0)</span>}
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                                <TrendingUp className="size-3 text-emerald-500" /> Đã bán: {product.soldCount}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 pr-6 align-top text-right relative">
                            <button type="button"
                              onClick={() => setOpenActionMenuId(isMenuOpen ? null : product.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <MoreVertical className="size-5" />
                            </button>
                            
                            {isMenuOpen && (
                              <>
                                <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpenActionMenuId(null)} onKeyDown={(e) => { if(e.key === 'Escape') setOpenActionMenuId(null) }} />
                                <div className="absolute right-8 top-4 w-44 bg-slate-900 border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 py-1 max-h-[240px] overflow-y-auto">
                                  {/* Sửa sản phẩm */}
                                  <button type="button"
                                    onClick={() => handleEditClick(product)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                  >
                                    <Edit2 className="size-3.5 text-blue-400" /> Sửa sản phẩm
                                  </button>

                                  {/* Real actions for Store Product Management */}
                                  <button type="button"
                                    onClick={() => handleToggleVisibility(product)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                  >
                                    <EyeOff className="size-3.5 text-slate-400" />
                                    {product.isVisible ? 'Ẩn khỏi store' : 'Hiện trên store'}
                                  </button>

                                  <button type="button"
                                    onClick={() => handleToggleStatus(product)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                  >
                                    <XCircle className="size-3.5 text-amber-500" />
                                    {product.status === 'DISCONTINUED' ? 'Kích hoạt bán' : 'Ngừng bán'}
                                  </button>

                                  <button type="button"
                                    onClick={() => handleDuplicateProduct(product)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                  >
                                    <Copy className="size-3.5 text-indigo-400" /> Nhân bản sản phẩm
                                  </button>

                                  {/* Xem trên cửa hàng */}
                                  <Link
                                    href={`/products/${product.id}`}
                                    target="_blank"
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 border-b border-t border-white/5"
                                  >
                                    <ExternalLink className="size-3.5 text-emerald-400" /> Xem trên store
                                  </Link>

                                  {/* Xóa cứng (Hard Delete) */}
                                  <button type="button"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    disabled={product.soldCount > 0}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2 ${
                                      product.soldCount > 0 
                                        ? 'text-slate-600 cursor-not-allowed opacity-40' 
                                        : 'text-red-400 hover:bg-red-500/10'
                                    }`}
                                    title={product.soldCount > 0 ? 'Không thể xóa cứng sản phẩm đã bán.' : ''}
                                  >
                                    <Trash2 className="size-3.5" /> Xóa (Hard Delete)
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

              {/* Mobile view: beautiful interactive card list */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const salesStatus = getSalesStatus(product)
                  const productStock = getAdminProductStock(product)
                  const invStatus = getInventoryStatus(productStock)
                  const isMenuOpen = openActionMenuId === product.id

                  return (
                    <div key={product.id} className="p-4 flex flex-col gap-3.5 relative">
                      {/* Top Row: Image & Name & Actions */}
                      <div className="flex gap-3 items-start justify-between">
                        <div className="flex gap-3 items-start min-w-0">
                          {product.imageUrl ? (
                            <Image 
                              src={getSafeImageSrc(product.imageUrl)} 
                              alt={product.name} 
                              width={56} 
                              height={56} 
                              className="size-14 rounded-lg object-contain bg-white border border-white/10 shrink-0" 
                            />
                          ) : (
                            <div className="size-14 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                              <ImageIcon className="size-5 text-slate-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm line-clamp-2 leading-snug">{product.name}</p>
                            <span className="inline-block text-[9px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 mt-1">
                              SKU: {product.id.slice(-8)}
                            </span>
                          </div>
                        </div>

                        {/* Action Menu Trigger */}
                        <div className="relative shrink-0">
                          <button type="button"
                            onClick={() => setOpenActionMenuId(isMenuOpen ? null : product.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                          
                          {isMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpenActionMenuId(null)} onKeyDown={(e) => { if(e.key === 'Escape') setOpenActionMenuId(null) }} />
                              <div className="absolute right-0 top-6 w-44 bg-slate-900 border border-white/10 shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 py-1 max-h-[220px] overflow-y-auto">
                                {/* Sửa sản phẩm */}
                                <button type="button"
                                  onClick={() => handleEditClick(product)}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <Edit2 className="size-3.5 text-blue-400" /> Sửa sản phẩm
                                </button>

                                {/* Real actions for Store Product Management */}
                                <button type="button"
                                  onClick={() => handleToggleVisibility(product)}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <EyeOff className="size-3.5 text-slate-400" />
                                  {product.isVisible ? 'Ẩn khỏi store' : 'Hiện trên store'}
                                </button>

                                <button type="button"
                                  onClick={() => handleToggleStatus(product)}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <XCircle className="size-3.5 text-amber-500" />
                                  {product.status === 'DISCONTINUED' ? 'Kích hoạt bán' : 'Ngừng bán'}
                                </button>

                                <button type="button"
                                  onClick={() => handleDuplicateProduct(product)}
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                >
                                  <Copy className="size-3.5 text-indigo-400" /> Nhân bản sản phẩm
                                </button>

                                {/* Xem trên cửa hàng */}
                                <Link
                                  href={`/products/${product.id}`}
                                  target="_blank"
                                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 border-t border-b border-white/5"
                                >
                                  <ExternalLink className="size-3.5 text-emerald-400" /> Xem trên store
                                </Link>

                                {/* Xóa cứng (Hard Delete) */}
                                <button type="button"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  disabled={product.soldCount > 0}
                                  className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 ${
                                    product.soldCount > 0 
                                      ? 'text-slate-600 cursor-not-allowed opacity-40' 
                                      : 'text-red-400 hover:bg-red-500/10'
                                  }`}
                                  title={product.soldCount > 0 ? 'Không thể xóa cứng sản phẩm đã bán.' : ''}
                                >
                                  <Trash2 className="size-3.5" /> Xóa (Hard Delete)
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Middle Row: Price & Category */}
                      <div className="flex items-center justify-between text-xs mt-1 border-t border-white/[0.02] pt-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {product.category?.name || 'Khác'}
                          </span>
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                             <span className="size-1 bg-indigo-400 rounded-full animate-pulse" />
                             {getProductBrand(product.name, resolvedBrands)}
                           </span>
                        </div>
                        <span className="text-emerald-400 font-mono font-bold text-sm">{formatPrice(product.price)}</span>
                      </div>

                      {/* Bottom Row: Status, Stock & Sold info */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/20 p-2.5 rounded-xl border border-white/[0.02] mt-1 text-[11px] leading-snug">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Tồn kho (Inv)</span>
                          {invStatus === 'in_stock' && <span className="text-slate-300 font-semibold"><Boxes className="size-3 inline mr-1 text-slate-500" />T?ng kho {productStock}</span>}
                          {invStatus === 'low_stock' && <span className="text-amber-400 font-semibold"><AlertTriangle className="size-3 inline mr-1" />S?p h?t {productStock}</span>}
                          {invStatus === 'out_of_stock' && <span className="text-red-400 font-bold"><XCircle className="size-3 inline mr-1" />Hết hàng (0)</span>}
                        </div>

                        <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Lượng bán (Sales)</span>
                          <span className="text-slate-300 flex items-center gap-1 font-semibold">
                            <TrendingUp className="size-3 text-emerald-500" /> Đã bán {product.soldCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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
