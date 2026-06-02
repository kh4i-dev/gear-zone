'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Boxes, Search, Plus, Minus, Save, RotateCcw, Loader2, AlertTriangle, ArrowLeft, CheckCircle, Package, TrendingUp, Filter, ListFilter
} from 'lucide-react'
import { Navbar } from '@/components/domain/Navbar'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { getAdminPath } from '@/lib/adminPath'

interface Product {
  id: string
  name: string
  price: number
  oldPrice: number | null
  stock: number
  imageUrl: string | null
  categoryId: string | null
  category: { name: string } | null
  variants?: { stock: number; isActive: boolean }[]
}



const hasVariants = (product: Product) => (product.variants?.length ?? 0) > 0

const getInventoryStock = (product: Product) => {
  if (!hasVariants(product)) return product.stock
  return (product.variants ?? []).reduce((total, variant) => {
    if (!variant.isActive) return total
    return total + variant.stock
  }, 0)
}

export default function AdminInventoryPage() {
  const { replace } = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [productsState, setProductsState] = useState({
    products: [] as Product[],
    isLoading: true,
  })
  const { products, isLoading } = productsState

  const setProducts = (val: Product[] | ((prev: Product[]) => Product[])) => {
    setProductsState(prev => {
      const nextProducts = typeof val === 'function' ? val(prev.products) : val
      return { ...prev, products: nextProducts }
    })
  }
  const setIsLoading = (val: boolean) => setProductsState(prev => ({ ...prev, isLoading: val }))

  const [inventoryState, setInventoryState] = useState({
    stockChanges: {} as Record<string, number>,
    savingRows: {} as Record<string, boolean>,
    isBulkSaving: false,
  })
  const { stockChanges, savingRows, isBulkSaving } = inventoryState

  const setStockChanges = (val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    setInventoryState(prev => {
      const nextChanges = typeof val === 'function' ? val(prev.stockChanges) : val
      return { ...prev, stockChanges: nextChanges }
    })
  }
  const setSavingRows = (val: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
    setInventoryState(prev => {
      const nextRows = typeof val === 'function' ? val(prev.savingRows) : val
      return { ...prev, savingRows: nextRows }
    })
  }
  const setIsBulkSaving = (val: boolean) => setInventoryState(prev => ({ ...prev, isBulkSaving: val }))

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      replace(getAdminPath('/login'))
    }
  }, [user, authLoading, replace])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchProducts()
    }
  }, [user])

  // Prevent leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(stockChanges).length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [stockChanges])

  async function fetchProducts() {
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

  const handleStockChange = (id: string, newStock: number) => {
    if (newStock < 0) return
    const product = products.find((item) => item.id === id)
    if (product && hasVariants(product)) return
    setStockChanges(prev => ({
      ...prev,
      [id]: newStock
    }))
  }

  const handleSaveRow = async (product: Product) => {
    const newStock = stockChanges[product.id]
    if (hasVariants(product)) {
      toast.error('Sản phẩm có biến thể: chỉnh tồn kho trong ma trận biến thể.')
      return
    }
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
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p))
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

  const handleResetRow = (id: string) => {
    setStockChanges(prev => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const handleBulkSave = async () => {
    const modifiedIds = Object.keys(stockChanges)
    if (modifiedIds.length === 0) return

    setIsBulkSaving(true)
    const productMap = new Map(products.map(p => [p.id, p]))

    async function saveSingleProduct(id: string) {
      const product = productMap.get(id)
      const newStock = stockChanges[id]
      if (product && hasVariants(product)) return null
      if (!product || newStock === undefined || newStock === product.stock) return null

      try {
        const res = await window.fetch(`/api/admin/products/${id}`, {
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
          return { id, newStock }
        }
      } catch (err) {
        console.error(`Error saving product ${id}:`, err)
      }
      return null
    }

    const savePromises = modifiedIds.map(saveSingleProduct)
    const results = await Promise.all(savePromises)
    const successfulUpdates = results.filter(Boolean) as { id: string; newStock: number }[]
    const successCount = successfulUpdates.length

    if (successfulUpdates.length > 0) {
      setProducts(prev => prev.map(p => {
        const update = successfulUpdates.find(u => u.id === p.id)
        return update ? { ...p, stock: update.newStock } : p
      }))
    }

    toast.success(`Đã kiểm kê thành công ${successCount}/${modifiedIds.length} sản phẩm!`)
    setStockChanges({})
    setIsBulkSaving(false)
  }



  const categoryGroups = useMemo(() => {
    const groups: Record<string, { total: number, name: string }> = {
      'uncategorized': { total: 0, name: 'Chưa phân loại' }
    }
    
    products.forEach(p => {
      const catName = p.category?.name || 'Chưa phân loại'
      const key = p.category?.name ? p.category.name.toLowerCase() : 'uncategorized'
      
      if (!groups[key]) {
        groups[key] = { total: 0, name: catName }
      }

      groups[key].total++
    })

    return Object.fromEntries(Object.entries(groups).filter(([_, v]) => v.total > 0))
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.id.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      const catKey = p.category?.name ? p.category.name.toLowerCase() : 'uncategorized'
      if (selectedCategory !== 'all' && catKey !== selectedCategory) return false

      const localStock = stockChanges[p.id]
      const currentStock = localStock !== undefined && !hasVariants(p) ? localStock : getInventoryStock(p)

      if (inventoryStatusFilter === 'in_stock' && currentStock <= 5) return false
      if (inventoryStatusFilter === 'out_of_stock' && currentStock > 0) return false
      if (inventoryStatusFilter === 'low_stock' && (currentStock === 0 || currentStock > 5)) return false

      return true
    })
  }, [products, searchQuery, selectedCategory, inventoryStatusFilter, stockChanges])

  const totalProducts = products.length
  const lowStockCount = products.filter(p => {
    const currentStock = stockChanges[p.id] !== undefined && !hasVariants(p) ? stockChanges[p.id] : getInventoryStock(p)
    return currentStock > 0 && currentStock <= 5
  }).length
  const outOfStockCount = products.filter(p => {
    const currentStock = stockChanges[p.id] !== undefined && !hasVariants(p) ? stockChanges[p.id] : getInventoryStock(p)
    return currentStock === 0
  }).length
  const unsavedCount = Object.keys(stockChanges).filter(id => {
    const p = products.find(prod => prod.id === id)
    return p && stockChanges[id] !== p.stock
  }).length

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link href={getAdminPath('/dashboard')} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 font-semibold transition group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold uppercase tracking-wider mb-1">
              <Boxes className="size-4" /> Vận hành kho
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Quản Lý Tồn Kho</h1>
            <p className="text-muted-foreground mt-1 text-sm">Kiểm soát xuất nhập kho, điều chỉnh số lượng an toàn theo danh mục.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {unsavedCount > 0 && (
              <button type="button"
                onClick={handleBulkSave}
                disabled={isBulkSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
              >
                {isBulkSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                Lưu tất cả ({unsavedCount})
              </button>
            )}
          </div>
        </div>

        {/* 4 Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Package className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng sản phẩm</p>
              <p className="text-xl font-black mt-0.5">{totalProducts}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
              <AlertTriangle className="size-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sắp hết hàng</p>
              <p className="text-xl font-black text-amber-400 mt-0.5">{lowStockCount}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <AlertTriangle className="size-5 text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hết hàng</p>
              <p className="text-xl font-black text-red-400 mt-0.5">{outOfStockCount}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Save className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cần kiểm kê</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{unsavedCount}</p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <input
              type="text"
              aria-label="Tìm kiếm sản phẩm"
              placeholder="Tìm theo tên hoặc SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-950 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm appearance-none min-w-[160px] text-slate-200"
              >
                <option value="all">Tất cả danh mục ({totalProducts})</option>
                {Object.entries(categoryGroups).map(([key, group]) => (
                  <option key={key} value={key}>{group.name} ({group.total})</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="size-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="relative">
              <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 size-4 pointer-events-none" />
              <select
                value={inventoryStatusFilter}
                onChange={(e) => setInventoryStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 bg-slate-950 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm appearance-none min-w-[160px] text-slate-200"
              >
                <option value="all">Tất cả trạng thái kho</option>
                <option value="in_stock">Đủ hàng (&gt;5)</option>
                <option value="low_stock">Sắp hết (1-5)</option>
                <option value="out_of_stock">Hết hàng (0)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="size-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="size-8 animate-spin text-blue-400 mb-2" />
              <p className="text-slate-400 text-sm">Đang tải danh sách tồn kho…</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6 min-w-[320px]">Sản phẩm & SKU</th>
                    <th className="p-4 min-w-[120px]">Phân loại</th>
                    <th className="p-4 text-center min-w-[200px]">Tồn kho (Inventory Status)</th>
                    <th className="p-4 pr-6 text-right min-w-[140px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredProducts.map(product => {
                    const localStock = stockChanges[product.id]
                    const isVariantProduct = hasVariants(product)
                    const currentStock = localStock !== undefined && !isVariantProduct ? localStock : getInventoryStock(product)
                    const isChanged = localStock !== undefined && !isVariantProduct && localStock !== product.stock
                    const isSaving = savingRows[product.id] || false

                    let statusBadge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ĐỦ HÀNG</span>
                    if (currentStock === 0) {
                      statusBadge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">HẾT HÀNG</span>
                    } else if (currentStock <= 5) {
                      statusBadge = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">SẮP HẾT</span>
                    }

                    return (
                      <tr key={product.id} className={`hover:bg-slate-900/20 transition-colors ${isChanged ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : ''}`}>
                        <td className="p-4 pl-6">
                          <div className="flex gap-4 items-center">
                            {product.imageUrl ? (
                              <Image src={product.imageUrl.split('|')[0]?.trim() || '/placeholder.png'} alt={product.name} width={48} height={48} className="size-12 rounded-xl object-contain bg-white border border-white/10 shrink-0" />
                            ) : (
                              <div className="size-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                                <Package className="size-5 text-slate-600" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-white text-sm line-clamp-1">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">SKU: {product.id.slice(-8)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 align-middle">
                          <span className="text-slate-300 text-xs font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
                            {product.category?.name || 'Chưa phân loại'}
                          </span>
                        </td>

                        <td className="p-4 align-middle text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <button type="button" disabled={isVariantProduct} onClick={() => handleStockChange(product.id, currentStock - 1)} className="size-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center border border-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                                <Minus className="size-3.5" />
                              </button>
                              <input type="number" aria-label="S? l??ng t?n kho" min="0" value={currentStock} disabled={isVariantProduct} onChange={e => { const val = parseInt(e.target.value, 10); handleStockChange(product.id, isNaN(val) ? 0 : val) }} className="w-16 h-8 text-center bg-slate-950 border border-white/10 rounded-lg text-sm font-bold font-mono focus:outline-none focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60" />
                              <button type="button" disabled={isVariantProduct} onClick={() => handleStockChange(product.id, currentStock + 1)} className="size-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 transition-all flex items-center justify-center border border-white/5 disabled:cursor-not-allowed disabled:opacity-40">
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              {statusBadge}
                              {isVariantProduct && <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">T?nh t? bi?n th?</span>}
                              {isChanged && <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Đổi: {product.stock} ➔ {currentStock}</span>}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 pr-6 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isChanged && (
                              <button type="button" onClick={() => handleResetRow(product.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all" title="Hủy thay đổi">
                                <RotateCcw className="size-4" />
                              </button>
                            )}
                            <button type="button" onClick={() => handleSaveRow(product)} disabled={!isChanged || isSaving} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${isChanged ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}>
                              {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
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
              <Package className="size-12 text-slate-700 mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold text-lg mb-1">Không có sản phẩm nào</h3>
              <p className="text-slate-500 text-sm">Chưa có sản phẩm phù hợp bộ lọc.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
