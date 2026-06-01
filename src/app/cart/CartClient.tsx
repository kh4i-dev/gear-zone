'use client'
 
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ShoppingCart, ArrowRight, Trash2, Plus, Minus, CreditCard, 
  MapPin, Phone, User, FileText, CheckCircle2, ShieldCheck, ArrowLeft, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/providers/CartProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button, Input } from '@/components/domain/ui'
import { getSafeImageSrc } from '@/lib/product-images'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const formatVND = (price: number) => {
  return vndFormatter.format(price)
}
 
export default function CartClient({ shopName = 'GearZone' }: { shopName?: string }) {
  const { push, refresh } = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const { user } = useAuth()
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalCount, isLoaded } = useCart()
 
  // Page steps: 'cart' | 'checkout'
  const [step, setStep] = useState<'cart' | 'checkout'>(() => {
    if (stepParam === 'checkout' && user) {
      return 'checkout'
    }
    return 'cart'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
 
  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    shippingName: user?.name || '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCccd: '',
    paymentMethod: 'cod' as 'cod' | 'bank',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
 
  // Stepper quantity update helper
  const handleQtyChange = (productId: string, variantId: string | null | undefined, currentQty: number, change: number, maxStock: number) => {
    const nextQty = currentQty + change
    if (nextQty < 1) return
    if (nextQty > maxStock) {
      toast.warning(`Chỉ còn tối đa ${maxStock} sản phẩm trong kho`)
      return
    }
    updateQuantity(productId, nextQty, variantId || null)
  }
 

 
  // Proceed to Checkout verification
  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiến hành thanh toán')
      push(`/login?redirect=/cart`)
      return
    }
    // Pre-fill user data if available
    setShippingForm(prev => ({
      ...prev,
      shippingName: prev.shippingName || user.name || '',
      shippingPhone: prev.shippingPhone || '',
    }))
    setStep('checkout')
  }
 
  // Submit order handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
 
    // Validation
    const errors: Record<string, string> = {}
    if (!shippingForm.shippingName.trim()) errors.shippingName = 'Họ tên người nhận không được trống'
    if (!shippingForm.shippingPhone.trim()) errors.shippingPhone = 'Số điện thoại không được trống'
    if (!shippingForm.shippingAddress.trim()) errors.shippingAddress = 'Địa chỉ giao hàng không được trống'
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error('Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc')
      return
    }
 
    setIsSubmitting(true)
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: item.price,
      }))
 
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: totalPrice,
          paymentMethod: shippingForm.paymentMethod,
          shippingName: shippingForm.shippingName,
          shippingPhone: shippingForm.shippingPhone,
          shippingAddress: shippingForm.shippingAddress,
          shippingCccd: shippingForm.shippingCccd || null,
          items: orderItems,
        }),
      })
 
      const result = await res.json()
 
      if (!res.ok) {
        throw new Error(result.error?.message || 'Có lỗi xảy ra khi tạo đơn hàng')
      }
 
      toast.success('Đặt hàng thành công! Đang chuyển hướng...')
      clearCart()
      push('/orders')
      refresh()
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đặt hàng')
    } finally {
      setIsSubmitting(false)
    }
  }
 
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
        <span className="text-sm text-slate-400 mt-2">Đang tải giỏ hàng…</span>
      </div>
    )
  }
 
  // 1. EMPTY STATE
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-6 max-w-md relative z-10 animate-in fade-in duration-300">
          <div className="mx-auto size-24 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_50px_rgba(79,70,229,0.05)] mb-4">
            <ShoppingCart className="size-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Giỏ hàng của bạn đang trống
            </h1>
            <p className="text-slate-400 text-sm max-w-[320px] mx-auto leading-relaxed">
              Hãy lấp đầy giỏ hàng của bạn bằng những sản phẩm gaming gear xịn nhất từ {shopName}.
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold px-8 py-3.5 transition shadow-lg shadow-indigo-600/20 text-sm active:scale-95">
            Tiếp tục mua sắm
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 relative px-4">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 size-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 size-[600px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
 
      <main className="container mx-auto max-w-6xl relative z-10">
        {/* Step Navigation Bar */}
        <div className="flex items-center gap-3 text-sm font-bold mb-8 border-b border-white/5 pb-6">
          <Link href="/" className="text-slate-500 hover:text-white transition">Home</Link>
          <span className="text-slate-700">/</span>
          <button 
            type="button" 
            onClick={() => setStep('cart')} 
            className={`transition ${step === 'cart' ? 'text-indigo-400 font-extrabold' : 'text-slate-500 hover:text-white'}`}
          >
            Giỏ hàng ({totalCount})
          </button>
          {step === 'checkout' && (
            <>
              <span className="text-slate-700">/</span>
              <span className="text-indigo-400 font-extrabold">Thông tin thanh toán</span>
            </>
          )}
        </div>
 
        {/* 2. MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* STEP 1: REVIEW CART */}
          {step === 'cart' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
                <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <ShoppingCart className="size-5 text-indigo-400" />
                  Chi tiết giỏ hàng
                </h2>
 
                <div className="divide-y divide-white/5 space-y-4">
                  {items.map((item, idx) => (
                    <div 
                      key={`${item.productId}-${item.variantId || 'base'}`} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${idx > 0 ? 'pt-6' : ''}`}
                    >
                      {/* Left: Image & Title Info */}
                      <div className="flex gap-4 items-start flex-1 min-w-0">
                        <div className="size-20 bg-white border border-white/10 rounded-2xl overflow-hidden shrink-0 relative shadow-inner">
                          {item.imageUrl ? (
                            <div className="absolute inset-1.5">
                              <Image
                                src={getSafeImageSrc(item.imageUrl)}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <ShoppingCart className="size-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <h3 className="font-bold text-sm text-slate-200 hover:text-indigo-400 transition leading-snug truncate">
                            {item.name}
                          </h3>
                          {/* Variant Options labels */}
                          {item.sku && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-950/80 text-indigo-400 border border-indigo-500/10">
                                SKU: {item.sku}
                              </span>
                            </div>
                          )}
                          {/* shortSpecs if exists */}
                          {item.maxStock <= 5 && (
                            <span className="inline-block text-[10px] text-amber-400 font-semibold">
                              Chỉ còn {item.maxStock} sản phẩm
                            </span>
                          )}
                        </div>
                      </div>
 
                      {/* Right: Stepper, Price & Remove button */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 shrink-0">
                        {/* Stepper */}
                        <div className="flex items-center bg-slate-950/60 border border-white/5 rounded-xl px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.variantId, item.quantity, -1, item.maxStock)}
                            className="size-7 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-90"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.variantId, item.quantity, 1, item.maxStock)}
                            className="size-7 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-90"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
 
                        {/* Unit & Total Price */}
                        <div className="text-right space-y-0.5">
                          <p className="text-xs text-slate-400 font-semibold">{formatVND(item.price)}</p>
                          <p className="text-sm font-extrabold text-indigo-400">{formatVND(item.price * item.quantity)}</p>
                        </div>
 
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
 
          {/* STEP 2: CHECKOUT & SHIPPING FORM */}
          {step === 'checkout' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <form onSubmit={handlePlaceOrder} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-6">
                <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2 border-b border-white/5 pb-4">
                  <MapPin className="size-5 text-indigo-400" />
                  Thông tin giao hàng
                </h2>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label="Họ và tên người nhận"
                      value={shippingForm.shippingName}
                      onChange={(e) => setShippingForm({ ...shippingForm, shippingName: e.target.value })}
                      placeholder="Nhập họ và tên người nhận"
                      error={formErrors.shippingName}
                      className="bg-slate-950/40 border-white/10 pl-10"
                      required
                    />
                    <User className="absolute left-3 bottom-3 size-4.5 text-slate-500" />
                  </div>
 
                  <div className="relative">
                    <Input
                      label="Số điện thoại nhận hàng"
                      value={shippingForm.shippingPhone}
                      onChange={(e) => setShippingForm({ ...shippingForm, shippingPhone: e.target.value })}
                      placeholder="Nhập số điện thoại nhận hàng"
                      error={formErrors.shippingPhone}
                      className="bg-slate-950/40 border-white/10 pl-10"
                      required
                    />
                    <Phone className="absolute left-3 bottom-3 size-4.5 text-slate-500" />
                  </div>
                </div>
 
                <div className="relative">
                  <Input
                    label="Địa chỉ giao hàng"
                    value={shippingForm.shippingAddress}
                    onChange={(e) => setShippingForm({ ...shippingForm, shippingAddress: e.target.value })}
                    placeholder="Số nhà, ngõ, tên đường, phường/xã, quận/huyện, tỉnh/TP..."
                    error={formErrors.shippingAddress}
                    className="bg-slate-950/40 border-white/10 pl-10"
                    required
                  />
                  <MapPin className="absolute left-3 bottom-3 size-4.5 text-slate-500" />
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="relative">
                    <Input
                      label="Số CCCD"
                      value={shippingForm.shippingCccd}
                      onChange={(e) => setShippingForm({ ...shippingForm, shippingCccd: e.target.value })}
                      placeholder="Dành cho kiểm tra hóa đơn (nếu có)"
                      className="bg-slate-950/40 border-white/10 pl-10"
                    />
                    <FileText className="absolute left-3 bottom-3 size-4.5 text-slate-500" />
                  </div>
 
                  <div>
                    <p className="block text-sm font-semibold mb-2">Phương thức thanh toán</p>
                    <select
                      value={shippingForm.paymentMethod}
                      onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value as 'cod' | 'bank' })}
                      className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                      <option value="bank">Chuyển khoản ngân hàng (QR Code / Bank)</option>
                    </select>
                  </div>
                </div>
 
                {/* Action Buttons inside Form */}
                <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-white/5 pt-6 justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold py-3.5 px-6 transition text-slate-300"
                  >
                    <ArrowLeft className="size-4" />
                    Quay lại giỏ hàng
                  </button>
 
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 px-10 rounded-xl shadow-lg shadow-rose-600/10 transition h-12 flex items-center justify-center gap-2 shrink-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang tạo đơn hàng…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4.5" />
                        Xác nhận đặt hàng ngay
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
 
          {/* SIDEBAR SUMMARY SECTION */}
          <aside className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-white/5 pb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-indigo-400" />
              Tổng quan đơn hàng
            </h2>

            {/* Chi tiết danh sách sản phẩm rút gọn khi thanh toán */}
            {step === 'checkout' && (
              <div className="border-b border-white/5 pb-4 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sản phẩm đặt mua</p>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {items.map((item) => (
                    <div 
                      key={`${item.productId}-${item.variantId || 'base'}`}
                      className="flex gap-3 items-center"
                    >
                      {/* Image */}
                      <div className="size-11 bg-white border border-white/10 rounded-lg overflow-hidden shrink-0 relative shadow-inner">
                        {item.imageUrl ? (
                          <div className="absolute inset-1">
                            <img 
                              src={getSafeImageSrc(item.imageUrl)} 
                              alt={item.name} 
                              className="size-full object-contain" 
                            />
                          </div>
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <ShoppingCart className="size-4 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                        <h4 className="font-bold text-[13px] text-slate-200 line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-0.5 text-[11px]">
                          <span className="text-slate-400">
                            x{item.quantity} • <span className="text-slate-500">{formatVND(item.price)}</span>
                          </span>
                          <span className="font-bold text-indigo-400">
                            {formatVND(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400">Tạm tính ({totalCount} món)</span>
                <span className="text-slate-200">{formatVND(totalPrice)}</span>
              </div>
 
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400">Phí vận chuyển</span>
                <span className="text-emerald-400 font-semibold">Miễn phí</span>
              </div>
 
              <div className="flex justify-between items-center text-sm font-medium border-t border-white/5 pt-4">
                <span className="text-slate-400">Mã giảm giá</span>
                <span className="text-slate-500 italic text-xs">Tính ở bước thanh toán</span>
              </div>
 
              <div className="flex justify-between items-end border-t border-white/5 pt-4">
                <span className="text-sm text-slate-300 font-bold">Tổng cộng</span>
                <span className="text-xl font-extrabold text-indigo-400">{formatVND(totalPrice)}</span>
              </div>
            </div>
 
            {/* Action Buttons for Sidebar */}
            {step === 'cart' && (
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition duration-300 text-sm flex items-center justify-center gap-2 active:scale-98"
              >
                Tiến hành thanh toán
                <ArrowRight className="size-4" />
              </button>
            )}
 
            {/* Safety Policies Badge */}
            <div className="rounded-2xl bg-slate-950/50 border border-white/5 p-4 space-y-3.5 mt-6">
              <div className="flex gap-2.5 items-start">
                <ShieldCheck className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">Bảo mật giao dịch 100%</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Mọi thông tin thanh toán của bạn đều được mã hóa nâng cao bảo vệ tuyệt đối.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start border-t border-white/5 pt-3">
                <CheckCircle2 className="size-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">Đổi trả siêu tốc 7 ngày</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Đổi trả sản phẩm lỗi miễn phí vô cùng dễ dàng và nhanh chóng.</p>
                </div>
              </div>
            </div>
          </aside>
 
        </div>
      </main>
    </div>
  )
}
