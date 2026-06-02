import Image from 'next/image'
import Link from 'next/link'
import {
  ImageIcon, Tag, Boxes, AlertTriangle, XCircle, TrendingUp, MoreVertical,
  Edit2, EyeOff, Copy, ExternalLink, Trash2, Loader2, Package
} from 'lucide-react'
import { getSafeImageSrc } from '@/lib/product-images'
import { formatPrice, sanitizeProductExcerpt } from '@/lib/utils'

interface AdminProductTableProps {
  isLoading: boolean
  filteredProducts: any[]
  resolvedBrands: string[]
  openActionMenuId: string | null
  setOpenActionMenuId: (id: string | null) => void
  handleEditClick: (product: any) => void
  handleToggleVisibility: (product: any) => void
  handleToggleStatus: (product: any) => void
  handleDuplicateProduct: (product: any) => void
  handleDeleteProduct: (id: string) => void
  getSalesStatus: (product: any) => string
  getAdminProductStock: (product: any) => number
  getInventoryStatus: (stock: number) => string
  getProductBrand: (name: string, brands: string[]) => string
}

export function AdminProductTable({
  isLoading,
  filteredProducts,
  resolvedBrands,
  openActionMenuId,
  setOpenActionMenuId,
  handleEditClick,
  handleToggleVisibility,
  handleToggleStatus,
  handleDuplicateProduct,
  handleDeleteProduct,
  getSalesStatus,
  getAdminProductStock,
  getInventoryStatus,
  getProductBrand,
}: AdminProductTableProps) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-visible relative z-10">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-blue-400 mb-2" />
          <p className="text-slate-400 text-sm">Đang tải danh sách sản phẩm…</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          {/* Desktop view */}
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

          {/* Mobile view */}
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
                      {invStatus === 'in_stock' && <span className="text-slate-300 font-semibold"><Boxes className="size-3 inline mr-1 text-slate-500" />Tổng kho {productStock}</span>}
                      {invStatus === 'low_stock' && <span className="text-amber-400 font-semibold"><AlertTriangle className="size-3 inline mr-1" />Sắp hết {productStock}</span>}
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
  )
}
