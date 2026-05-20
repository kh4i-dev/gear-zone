'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Boxes,
  Search,
  Plus,
  Minus,
  Save,
  RotateCcw,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Package,
  TrendingUp
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  oldPrice: number | null
  stock: number
  imageUrl: string | null
  categoryId: string | null
  category: { name: string } | null
}

export default function AdminInventoryPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({})
  const [savingRows, setSavingRows] = useState<Record<string, boolean>>({})
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [filterTab, setFilterTab] = useState<'all' | 'low' | 'out'>('all')

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
      if (res.ok) {
        setProducts(result.data || [])
      } else {
        toast.error(result.error?.message || 'Không thể tải danh sách kho')
      }
    } catch {
      toast.error('Không thể tải danh sách kho')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle local stock adjustment
  const handleStockChange = (id: string, newStock: number) => {
    if (newStock < 0) return
    setStockChanges(prev => ({
      ...prev,
      [id]: newStock
    }))
  }

  // Save single product stock
  const handleSaveRow = async (product: Product) => {
    const newStock = stockChanges[product.id]
    if (newStock === undefined || newStock === product.stock) return

    setSavingRows(prev => ({ ...prev, [product.id]: true }))
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: newStock,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId
        })
      })

      const result = await res.json()
      if (res.ok) {
        toast.success(`Đã cập nhật kho hàng cho: ${product.name}`)
        // Update local products list
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p))
        // Remove from modified changes
        setStockChanges(prev => {
          const updated = { ...prev }
          delete updated[product.id]
          return updated
        })
      } else {
        toast.error(result.error?.message || 'Không thể cập nhật tồn kho')
      }
    } catch {
      toast.error('Lỗi kết nối khi cập nhật tồn kho')
    } finally {
      setSavingRows(prev => ({ ...prev, [product.id]: false }))
    }
  }

  // Reset local changes for a single product
  const handleResetRow = (id: string) => {
    setStockChanges(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  // Bulk save all unsaved changes
  const handleBulkSave = async () => {
    const modifiedIds = Object.keys(stockChanges)
    if (modifiedIds.length === 0) return

    setIsBulkSaving(true)
    let successCount = 0

    for (const id of modifiedIds) {
      const product = products.find(p => p.id === id)
      const newStock = stockChanges[id]
      if (!product || newStock === undefined) continue

      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            stock: newStock,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId
          })
        })

        if (res.ok) {
          successCount++
          // Update product locally
          setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
        }
      } catch (err) {
        console.error(`Failed to update stock for ${id}`, err)
      }
    }

    toast.success(`Đã kiểm kê thành công ${successCount}/${modifiedIds.length} sản phẩm!`)
    setStockChanges({})
    setIsBulkSaving(false)
  }

  // Filter products based on search query and tabs
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterTab === 'low') {
      const currentStock = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock
      return currentStock > 0 && currentStock <= 5
    }
    if (filterTab === 'out') {
      const currentStock = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock
      return currentStock === 0
    }

    return true
  })

  // Summary stats
  const totalProducts = products.length
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const outOfStockCount = products.filter(p => p.stock === 0).length
  const unsavedCount = Object.keys(stockChanges).length

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-semibold transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <Boxes className="w-4 h-4" /> Kiểm kê kho hàng
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Quản Lý Tồn Kho</h1>
            <p className="text-muted-foreground mt-1">Cập nhật số lượng tồn kho nhanh chóng và chính xác.</p>
          </div>

          {unsavedCount > 0 && (
            <button
              onClick={handleBulkSave}
              disabled={isBulkSaving}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
            >
              {isBulkSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Lưu tất cả thay đổi ({unsavedCount})
            </button>
          )}
        </div>

        {/* Dashboard Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Tổng sản phẩm</p>
              <p className="text-2xl font-black mt-0.5">{totalProducts}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Sắp hết hàng (&lt;=5)</p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{lowStockCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Hết hàng (0)</p>
              <p className="text-2xl font-black text-red-400 mt-0.5">{outOfStockCount}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex bg-slate-900/80 p-1 border border-white/5 rounded-xl w-fit">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterTab('low')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'low'
                  ? 'bg-amber-500/10 text-amber-400 shadow-sm border border-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sắp hết hàng ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterTab('out')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'out'
                  ? 'bg-red-500/10 text-red-400 shadow-sm border border-red-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hết hàng ({outOfStockCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên hoặc danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
              <p className="text-slate-400 text-sm">Đang tải danh sách tồn kho...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6 w-[45%]">Sản phẩm</th>
                    <th className="p-4 w-[15%]">Danh mục</th>
                    <th className="p-4 text-center w-[25%]">Tồn kho / Kiểm kê</th>
                    <th className="p-4 pr-6 text-right w-[15%]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map(product => {
                    const localStock = stockChanges[product.id]
                    const currentStock = localStock !== undefined ? localStock : product.stock
                    const isChanged = localStock !== undefined && localStock !== product.stock
                    const isSaving = savingRows[product.id] || false

                    // Stock status
                    let statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Đủ hàng
                      </span>
                    )
                    if (currentStock === 0) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                          Hết hàng
                        </span>
                      )
                    } else if (currentStock <= 5) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Sắp hết hàng
                        </span>
                      )
                    }

                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-slate-900/20 transition-colors ${
                          isChanged ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : ''
                        }`}
                      >
                        {/* Product info */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3.5">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-white/5"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-slate-700">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm line-clamp-1">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">{product.id.slice(-8)}</span>
                                <span className="text-[11px] text-slate-400 font-medium">{formatPrice(product.price)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="text-slate-300 text-xs font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
                            {product.category?.name || 'Chưa phân loại'}
                          </span>
                        </td>

                        {/* Stock Adjustment controller */}
                        <td className="p-4">
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                              {/* Decrement */}
                              <button
                                onClick={() => handleStockChange(product.id, currentStock - 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center border border-white/5"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              {/* Stock input */}
                              <input
                                type="number"
                                min="0"
                                value={currentStock}
                                onChange={e => {
                                  const val = parseInt(e.target.value, 10)
                                  handleStockChange(product.id, isNaN(val) ? 0 : val)
                                }}
                                className="w-16 h-8 text-center bg-slate-950 border border-white/10 rounded-lg text-sm font-bold font-mono focus:outline-none focus:border-blue-500/50"
                              />

                              {/* Increment */}
                              <button
                                onClick={() => handleStockChange(product.id, currentStock + 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center border border-white/5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Badge and Changes Indicators */}
                            <div className="flex items-center gap-2">
                              {statusBadge}
                              {isChanged && (
                                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                  Thay đổi: {product.stock} ➔ {currentStock}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Save Action */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isChanged && (
                              <button
                                onClick={() => handleResetRow(product.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                title="Hủy thay đổi"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleSaveRow(product)}
                              disabled={!isChanged || isSaving}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                                isChanged
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                              }`}
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Lưu
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-50" />
              <h3 className="font-bold text-lg mb-1">Không có sản phẩm nào</h3>
              <p className="text-slate-500 text-sm">Chưa có sản phẩm phù hợp bộ lọc.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
