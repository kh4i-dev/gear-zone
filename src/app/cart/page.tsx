'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { useCart } from '@/components/providers/CartProvider'
import { Button, Input } from '@/components/domain/ui'
import { CheckCircle2, Copy, CreditCard, ExternalLink, ImageIcon, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'

export default function CartPage() {
  const { push } = useRouter()
  const { user } = useAuth()
  const { items, updateQuantity, removeFromCart, totalPrice, totalCount, clearCart, isLoaded } = useCart()
  const [checkoutState, setCheckoutState] = useState({
    isSubmitting: false,
    showPaymentModal: false,
    createdOrder: null as any,
  })
  const { isSubmitting, showPaymentModal, createdOrder } = checkoutState

  const setIsSubmitting = (val: boolean) => setCheckoutState(prev => ({ ...prev, isSubmitting: val }))
  const setShowPaymentModal = (val: boolean) => setCheckoutState(prev => ({ ...prev, showPaymentModal: val }))
  const setCreatedOrder = (val: any) => setCheckoutState(prev => ({ ...prev, createdOrder: val }))

  const [paymentMethod, setPaymentMethod] = useState('cod')
  
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    cccd: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update name once user is loaded, without loop dependency chain
  useEffect(() => {
    if (user?.name) {
      setShippingDetails(prev => prev.name ? prev : { ...prev, name: user.name })
    }
  }, [user])

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán')
      push('/login?redirect=/cart')
      return
    }

    if (items.length === 0) return

    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.cccd) {
      setErrors({
        name: !shippingDetails.name ? 'Vui lòng nhập họ tên' : '',
        phone: !shippingDetails.phone ? 'Vui lòng nhập số điện thoại' : '',
        address: !shippingDetails.address ? 'Vui lòng nhập địa chỉ' : '',
        cccd: !shippingDetails.cccd ? 'Vui lòng nhập số CCCD/CMND' : ''
      })
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng')
      return
    }

    const isBankEnabled = !!(
      process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO ||
      process.env.NEXT_PUBLIC_SEPAY_API_KEY
    )
    const isMomoEnabled = !!process.env.NEXT_PUBLIC_MOMO_PHONE

    if (paymentMethod === 'bank' && !isBankEnabled) {
      toast.error('Cổng thanh toán chuyển khoản ngân hàng đang được bảo trì hoặc đang trong quá trình phát triển. Vui lòng chọn phương thức COD!')
      return
    }

    if (paymentMethod === 'momo' && !isMomoEnabled) {
      toast.error('Cổng thanh toán Ví MoMo đang được bảo trì hoặc đang trong quá trình phát triển. Vui lòng chọn phương thức COD!')
      return
    }

    setIsSubmitting(true)
    try {
      // Typically we'd call an API to create the order here
      // /api/checkout/route.ts
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items, 
          totalAmount: totalPrice, 
          paymentMethod,
          shippingName: shippingDetails.name,
          shippingPhone: shippingDetails.phone,
          shippingAddress: shippingDetails.address,
          shippingCccd: shippingDetails.cccd
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Lỗi thanh toán')

      clearCart()
      if (paymentMethod === 'bank' || paymentMethod === 'momo') {
        setCreatedOrder(data.data)
        setShowPaymentModal(true)
      } else {
        toast.success('Đơn hàng của bạn đã được đặt thành công!')
        push(`/orders`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi thanh toán')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StoreNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8 flex items-center gap-3">
          <ShoppingBag className="size-8 text-indigo-500" />
          Giỏ hàng của bạn
        </h1>

        {!isLoaded ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
            <h2 className="text-xl font-semibold mb-2">Đang tải giỏ hàng…</h2>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
            <ShoppingBag className="size-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-400 mb-6">Hãy quay lại cửa hàng để chọn cho mình những món đồ ưng ý nhé.</p>
            <Button type="button" onClick={() => push('/')} className="bg-indigo-600 hover:bg-indigo-700">
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cột Trái: Giỏ hàng + Phương thức thanh toán */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 items-center">
                    <div className="size-16 bg-slate-950 rounded-xl overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <ImageIcon className="size-6 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-base">{item.name}</h3>
                      <p className="text-indigo-400 font-semibold text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 rounded-xl px-2 py-1 border border-white/5 shrink-0">
                      <button type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:text-indigo-400 transition"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:text-indigo-400 transition"
                        disabled={item.quantity >= item.maxStock}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 text-white/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* PHƯƠNG THỨC THANH TOÁN (DI CHUYỂN QUA TRÁI ĐỂ TIẾT KIỆM CHIỀU CAO) */}
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-indigo-400">
                  <CreditCard className="size-4" />
                  Phương thức thanh toán
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label htmlFor="payment-cod" className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-900'}`}>
                    <input id="payment-cod" type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} aria-label="Thanh toán khi nhận hàng (COD)" className="hidden" />
                    <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-indigo-500' : 'border-slate-500'}`}>
                      {paymentMethod === 'cod' && <div className="size-2.5 rounded-full bg-indigo-500" />}
                    </div>
                    <span className="font-semibold text-xs text-white">Thanh toán khi nhận hàng (COD)</span>
                  </label>

                  <label htmlFor="payment-bank" className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'bank' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      <input id="payment-bank" type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} aria-label="Chuyển khoản ngân hàng" className="hidden" />
                      <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'bank' ? 'border-indigo-500' : 'border-slate-500'}`}>
                        {paymentMethod === 'bank' && <div className="size-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="font-semibold text-xs text-white">Chuyển khoản ngân hàng</span>
                    </div>
                    {!(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || process.env.NEXT_PUBLIC_SEPAY_API_KEY) && (
                      <span className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded shrink-0">Bảo trì</span>
                    )}
                  </label>

                  <label htmlFor="payment-momo" className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'momo' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      <input id="payment-momo" type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} aria-label="Ví MoMo" className="hidden" />
                      <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'momo' ? 'border-slate-500' : 'border-slate-500'}`}>
                        {paymentMethod === 'momo' && <div className="size-2.5 rounded-full bg-indigo-500" />}
                      </div>
                      <span className="font-semibold text-xs text-white">Ví MoMo</span>
                    </div>
                    {!process.env.NEXT_PUBLIC_MOMO_PHONE && (
                      <span className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded shrink-0">Bảo trì</span>
                    )}
                  </label>
                </div>

                {((paymentMethod === 'bank' && !(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || process.env.NEXT_PUBLIC_SEPAY_API_KEY)) || 
                  (paymentMethod === 'momo' && !process.env.NEXT_PUBLIC_MOMO_PHONE)) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] leading-relaxed mt-3">
                    <p className="font-bold mb-0.5 flex items-center gap-1.5">⚠️ Thông báo thanh toán:</p>
                    <p>Cổng thanh toán này hiện đang bảo trì hoặc chưa cấu hình API hoàn chỉnh. Bạn vui lòng sử dụng phương thức COD hoặc liên hệ Hotline để chuyển khoản trực tiếp.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cột Phải: Thông tin giao hàng + Tổng quan & Nút xác nhận */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 h-fit sticky top-24 space-y-4">
              <div>
                <h2 className="text-base font-semibold mb-3 text-indigo-400 flex items-center gap-2">
                  <ShoppingBag className="size-4.5" />
                  Thông tin giao hàng
                </h2>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <Input
                    label="Họ và tên"
                    value={shippingDetails.name}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                    error={errors.name}
                    className="bg-slate-950/50 border-white/10 py-2.5 text-sm"
                  />
                  <Input
                    label="Số điện thoại"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    error={errors.phone}
                    className="bg-slate-950/50 border-white/10 py-2.5 text-sm"
                  />
                  <Input
                    label="Số CCCD/CMND"
                    value={shippingDetails.cccd}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, cccd: e.target.value })}
                    error={errors.cccd}
                    className="bg-slate-950/50 border-white/10 py-2.5 text-sm"
                  />
                  <Input
                    label="Địa chỉ chi tiết"
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    error={errors.address}
                    className="bg-slate-950/50 border-white/10 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <h2 className="text-base font-semibold mb-3">Tổng quan đơn hàng</h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Số lượng:</span>
                    <span className="text-white font-semibold">{totalCount} sản phẩm</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tạm tính:</span>
                    <span className="text-white font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Tổng tiền:</span>
                    <span className="font-extrabold text-indigo-400 text-xl">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <Button type="button"
                onClick={handleCheckout}
                isLoading={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 text-base font-bold rounded-xl shadow-lg active:scale-98 transition-all"
              >
                Xác nhận đặt hàng
              </Button>
            </div>
          </div>
        )}
      </main>

      {showPaymentModal && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 sm:p-8 flex flex-col items-center text-center border-b border-white/5">
              <div className="size-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Đơn hàng đã được tạo thành công!</h2>
              <p className="text-slate-400 text-xs mt-1.5 font-mono">
                Mã đơn hàng: <span className="text-indigo-400 font-bold">#{createdOrder.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] space-y-6">
              {paymentMethod === 'bank' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="bg-white p-3 rounded-2xl size-44 flex items-center justify-center shrink-0 shadow-lg">
                    <Image 
                      src={`https://img.vietqr.io/image/${process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank'}-${process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007'}-compact2.png?amount=${createdOrder.totalAmount}&addInfo=GEARZONE ${createdOrder.id.slice(0, 8).toUpperCase()}&accountName=${encodeURIComponent(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN VAN KHAI')}`} 
                      alt="VietQR Payment Code" 
                      width={176}
                      height={176}
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-sm space-y-3 text-slate-300 w-full">
                    <h3 className="font-semibold text-white text-base flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
                      Thông tin chuyển khoản ngân hàng
                    </h3>
                    <p className="text-xs text-slate-400">Vui lòng quét mã QR hoặc thực hiện chuyển khoản chính xác thông tin bên dưới:</p>
                    
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Ngân hàng:</span>
                        <span className="font-extrabold text-white uppercase">{process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5 font-bold text-white font-mono text-sm">
                          <span>{process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007'}</span>
                          <button type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007')
                              toast.success('Đã copy số tài khoản!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Tên chủ thẻ:</span>
                        <span className="font-extrabold text-white">{process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN VAN KHAI'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Số tiền:</span>
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                          <span>{formatPrice(createdOrder.totalAmount)}</span>
                          <button type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(createdOrder.totalAmount.toString())
                              toast.success('Đã copy số tiền!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/5">
                        <span className="text-slate-400">Nội dung CK:</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-indigo-400">
                          <span>GEARZONE {createdOrder.id.slice(0, 8).toUpperCase()}</span>
                          <button type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(`GEARZONE ${createdOrder.id.slice(0, 8).toUpperCase()}`)
                              toast.success('Đã copy nội dung chuyển khoản!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'momo' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="bg-pink-600/10 border border-pink-500/20 p-5 rounded-2xl size-44 flex items-center justify-center shrink-0 shadow-lg">
                    <Image 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`23070507...`)}`} 
                      alt="Momo QR Code" 
                      width={176}
                      height={176}
                      className="size-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex-1 text-sm space-y-3 text-slate-300 w-full">
                    <h3 className="font-semibold text-white text-base flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-pink-500 animate-pulse" />
                      Thông tin chuyển khoản Ví MoMo
                    </h3>
                    <p className="text-xs text-slate-400">Vui lòng thực hiện chuyển khoản MoMo chính xác thông tin dưới đây:</p>
                    
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Số MoMo nhận:</span>
                        <div className="flex items-center gap-1.5 font-bold text-white font-mono text-sm">
                          <span>{process.env.NEXT_PUBLIC_MOMO_PHONE || '0123456789'}</span>
                          <button type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(process.env.NEXT_PUBLIC_MOMO_PHONE || '0123456789')
                              toast.success('Đã copy số MoMo!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Tên người nhận:</span>
                        <span className="font-extrabold text-white">{process.env.NEXT_PUBLIC_MOMO_RECEIVER_NAME || 'TRAN VAN KHAI'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Số tiền:</span>
                        <div className="flex items-center gap-1.5 font-bold text-pink-400 font-mono">
                          <span>{formatPrice(createdOrder.totalAmount)}</span>
                          <button type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(createdOrder.totalAmount.toString())
                              toast.success('Đã copy số tiền!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/5">
                        <span className="text-slate-400">Nội dung CK:</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-pink-300">
                          <span>GEARZONE {createdOrder.id.slice(0, 8).toUpperCase()}</span>
                          <button type="button" 
                            onClick={() => {
                              navigator.clipboard.writeText(`GEARZONE ${createdOrder.id.slice(0, 8).toUpperCase()}`)
                              toast.success('Đã copy nội dung chuyển khoản!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-950 border-t border-white/5 flex flex-col sm:flex-row gap-3">
              <button type="button"
                onClick={() => {
                  setShowPaymentModal(false)
                  toast.success('Đã ghi nhận yêu cầu xác nhận thanh toán!')
                  push('/orders')
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition"
              >
                Tôi đã chuyển khoản
              </button>
              <button type="button"
                onClick={() => {
                  setShowPaymentModal(false)
                  push('/orders')
                }}
                className="flex-1 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white py-3 rounded-xl font-bold text-sm transition"
              >
                Để sau / Theo dõi đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
