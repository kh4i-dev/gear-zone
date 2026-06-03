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
import { AdminProductForm } from '@/components/domain/AdminProductForm'
import { AdminProductFilters } from '@/components/domain/AdminProductFilters'
import { AdminProductTable } from '@/components/domain/AdminProductTable'
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
      : (product.imageUrl || '')
          .split(/[\r\n|]+/)
          .map((url) => url.trim())
          .filter(Boolean)
          .join('\n')

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
            const trimmed = line.trim()
            if (!trimmed) return

            // Split by :, tab, |, = or double/multiple spaces
            const match = trimmed.match(/^([^:\t|=]+?)[:\t|=](.+)$/) || trimmed.match(/^(.+?)\s{2,}(.+)$/)
            let name = ''
            let value = ''

            if (match) {
              name = match[1]?.trim() || ''
              value = match[2]?.trim() || ''
            } else {
              const colonIdx = trimmed.indexOf(':')
              if (colonIdx > 0) {
                name = trimmed.slice(0, colonIdx).trim()
                value = trimmed.slice(colonIdx + 1).trim()
              }
            }

            // Exclude header rows
            const lowerName = name.toLowerCase()
            const isHeader = lowerName === 'thông số' || lowerName === 'thông số kỹ thuật' || lowerName === 'chi tiết' || lowerName === 'thành phần' || lowerName === 'model' && value.toLowerCase() === 'chi tiết'

            if (name && value && !isHeader) {
              parsedSpecs.push({ name, value })
            }
          })
      }
    }

    const description = (product.description || '')
      .replace(/\n\n?\$\$\$SPECS\$\$\$[\s\S]*/, '')
      .trim()

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
          <AdminProductForm
            formData={formData}
            setFormData={setFormData}
            existingCategories={existingCategories}
            isSaving={isSaving}
            isUploading={isUploading}
            editingId={editingId}
            hasSubmitted={hasSubmitted}
            handleImageUpload={handleImageUpload}
            handleSubmit={handleSubmit}
            handleCancelEdit={handleCancelEdit}
            previewVariant={previewVariant}
            previewPrice={previewPrice}
            previewOldPrice={previewOldPrice}
            previewStock={previewStock}
            formHasVariants={formHasVariants}
            formVariantStockTotal={formVariantStockTotal}
          />
        )}

        <AdminProductFilters
          products={products}
          categoryStats={categoryStats}
          brandStats={brandStats}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <AdminProductTable
          isLoading={isLoading}
          filteredProducts={filteredProducts}
          resolvedBrands={resolvedBrands}
          openActionMenuId={openActionMenuId}
          setOpenActionMenuId={setOpenActionMenuId}
          handleEditClick={handleEditClick}
          handleToggleVisibility={handleToggleVisibility}
          handleToggleStatus={handleToggleStatus}
          handleDuplicateProduct={handleDuplicateProduct}
          handleDeleteProduct={handleDeleteProduct}
          getSalesStatus={getSalesStatus}
          getAdminProductStock={getAdminProductStock}
          getInventoryStatus={getInventoryStatus}
          getProductBrand={getProductBrand}
        />
      </main>
    </div>
  )
}