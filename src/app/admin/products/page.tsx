'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boxes, ImageIcon, Loader2, Package, Plus, Search, ShieldCheck, Tag, TrendingUp, Edit2, Trash2 } from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { Button, Input } from '@/components/domain/ui'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

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

const initialForm = {
  name: '',
  categoryName: '',
  imageUrl: '',
  oldPrice: '',
  price: '',
  stock: '',
  description: '',
  specs: '',
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
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
    } catch {
      toast.error(editingId ? 'Không thể cập nhật sản phẩm' : 'Không thể thêm sản phẩm')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = (product: AdminProduct) => {
    setEditingId(product.id)
    
    const rawDescription = product.description || ''
    const hasSpecs = rawDescription.includes('$$$SPECS$$$')
    const [descPart, specsPart] = hasSpecs 
      ? rawDescription.split('$$$SPECS$$$') 
      : [rawDescription, '']

    setFormData({
      name: product.name,
      categoryName: product.category?.name || '',
      imageUrl: product.imageUrl || '',
      oldPrice: product.oldPrice?.toString() || '',
      price: product.price.toString(),
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
    if (!window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?')) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error?.message || 'Lỗi khi xoá sản phẩm')
        return
      }
      toast.success('Đã xoá sản phẩm')
      await fetchProducts()
    } catch {
      toast.error('Lỗi khi xoá sản phẩm')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const uploadData = new FormData()
        uploadData.append('image', files[i])

        const res = await fetch('/api/admin/upload-product-image', {
          method: 'POST',
          credentials: 'include',
          body: uploadData,
        })
        const result = await res.json()

        if (res.ok && result.data?.imageUrl) {
          uploadedUrls.push(result.data.imageUrl)
        }
      }

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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) => (
      product.name.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query)
    ))
  }, [products, searchQuery])

  const existingCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean))) as string[]
  }, [products])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Quản lý kho hàng
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Sản Phẩm</h1>
            <p className="text-muted-foreground mt-1">Thêm sản phẩm, ảnh, giá bán, giá cũ và số lượng tồn kho.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm bg-slate-900 border border-white/5 px-4 py-2 rounded-xl">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">{products.length}</span> sản phẩm
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                if (editingId) handleCancelEdit()
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Đóng' : 'Thêm sản phẩm'}
            </button>
          </div>
        </div>

        {(showForm || editingId !== null) && (
          <form onSubmit={handleSubmit} className="mb-8 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              {editingId ? <Edit2 className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-blue-400" />}
            </div>
            <div>
              <h2 className="font-bold text-lg">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <p className="text-xs text-muted-foreground">Dùng ảnh URL trước; upload file có thể thêm sau.</p>
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
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <Input
                label="Ảnh sản phẩm (Hỗ trợ nhiều ảnh phân tách bằng dấu |)"
                value={formData.imageUrl}
                onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
                placeholder="VD: link_anh_1|link_anh_2|link_anh_3"
                className="md:col-span-2"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Chọn các ảnh từ thư mục (Có thể chọn nhiều ảnh cùng lúc)</label>
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải các ảnh...
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Hỗ trợ tải lên nhiều ảnh (JPG, PNG, WEBP, GIF), tối đa 5MB mỗi ảnh. Các ảnh sẽ được tự động ghép nối bằng ký tự |.</p>
              </div>
              <div>
                <Input
                  label="Giá cũ"
                  type="number"
                  min="0"
                  value={formData.oldPrice}
                  onChange={(event) => setFormData({ ...formData, oldPrice: event.target.value })}
                  placeholder="3790000"
                />
                {formData.oldPrice && (
                  <p className="mt-1.5 text-xs text-emerald-400 font-bold font-mono px-1 flex items-center gap-1 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 w-fit">
                    <span className="text-[10px]">➔ Xem trước:</span> {formatPrice(Number(formData.oldPrice))}
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Giá bán"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                  placeholder="3290000"
                  required
                />
                {formData.price && (
                  <p className="mt-1.5 text-xs text-emerald-400 font-bold font-mono px-1 flex items-center gap-1 bg-emerald-500/10 py-1 px-2 rounded-lg border border-emerald-500/20 w-fit">
                    <span className="text-[10px]">➔ Xem trước:</span> {formatPrice(Number(formData.price))}
                  </p>
                )}
              </div>
              <Input
                label="Số lượng tồn"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                placeholder="10"
                required
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Mô tả / Bài viết chi tiết (Hỗ trợ HTML)</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Mô tả ngắn hoặc bài viết chi tiết giới thiệu sản phẩm. Hỗ trợ thẻ HTML..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-indigo-400 mb-1.5 font-bold flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  Thông số kỹ thuật chi tiết
                </label>
                <textarea
                  value={formData.specs}
                  onChange={(event) => setFormData({ ...formData, specs: event.target.value })}
                  placeholder="Nhập thông số kỹ thuật chi tiết, mỗi thông số trên 1 dòng dạng Nhãn: Giá trị&#10;Ví dụ:&#10;Thương hiệu: Akko&#10;Kết nối: Bluetooth 5.0, 2.4Ghz, Type-C&#10;Dung lượng pin: 3000 mAh&#10;Switch: Akko V3 Cream Yellow&#10;LED: RGB 16.8 triệu màu"
                  rows={5}
                  className="w-full rounded-xl border border-indigo-500/20 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <p className="mt-1 text-[11px] text-slate-400">Các thông số này sẽ hiển thị đẹp đẽ trong bảng &quot;Thông số kỹ thuật&quot; và Modal cấu hình chi tiết ở trang khách hàng.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950/50 overflow-hidden min-h-[260px] flex flex-col">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Xem trước sản phẩm"
                  className="h-48 w-full object-cover bg-slate-950"
                />
              ) : (
                <div className="h-48 flex items-center justify-center bg-slate-950">
                  <ImageIcon className="w-10 h-10 text-slate-600" />
                </div>
              )}
              <div className="p-4 flex-1">
                <p className="font-bold line-clamp-1">{formData.name || 'Tên sản phẩm'}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {formData.description || 'Mô tả sản phẩm sẽ hiển thị tại đây.'}
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

          <div className="flex justify-end gap-3 mt-5">
            {editingId && (
              <Button type="button" variant="secondary" onClick={handleCancelEdit} disabled={isSaving} className="bg-slate-800 hover:bg-slate-700">
                Hủy
              </Button>
            )}
            <Button type="submit" isLoading={isSaving} className="gap-2">
              {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Cập nhật' : 'Thêm sản phẩm'}
            </Button>
          </div>
          </form>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-muted-foreground text-sm"
          />
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
              <p className="text-muted-foreground text-sm">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 pl-6">Sản phẩm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4">Tồn kho</th>
                    <th className="p-4">Đã bán</th>
                    <th className="p-4 pr-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-white/5" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-slate-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {product.description ? product.description.split('$$$SPECS$$$')[0].trim() : 'Chưa có mô tả'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Tag className="w-3.5 h-3.5" />
                          {product.category?.name || 'Chưa phân loại'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm font-semibold">{formatPrice(product.price)}</div>
                        {product.oldPrice && (
                          <div className="font-mono text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={product.stock <= 5 ? 'text-red-400 font-bold' : 'text-slate-200 font-semibold'}>
                          <Boxes className="w-4 h-4 inline mr-1.5 text-slate-500" />
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-semibold">
                          <TrendingUp className="w-4 h-4 inline mr-1.5" />
                          {product.soldCount}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(product)}
                            className="p-2 rounded-lg transition-colors text-blue-400 hover:bg-blue-400/10"
                            title="Sửa sản phẩm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={product.soldCount > 0}
                            className={`p-2 rounded-lg transition-colors ${product.soldCount > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-red-400 hover:bg-red-400/10'}`}
                            title={product.soldCount > 0 ? 'Không thể xoá sản phẩm đã bán' : 'Xoá sản phẩm'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl m-4">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-lg mb-1">Không có sản phẩm</h3>
              <p className="text-muted-foreground text-sm">Chưa có dữ liệu sản phẩm phù hợp bộ lọc.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
