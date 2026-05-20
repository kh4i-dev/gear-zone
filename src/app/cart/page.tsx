'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StoreNavbar } from '@/components/domain/StoreNavbar'
import { useCart } from '@/components/providers/CartProvider'
import { Button, Input } from '@/components/domain/ui'
import { CheckCircle2, Copy, ExternalLink, ImageIcon, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, updateQuantity, removeFromCart, totalPrice, totalCount, clearCart, isLoaded } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    cccd: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update name once user is loaded
  useEffect(() => {
    if (user?.name && !shippingDetails.name) {
      setShippingDetails(prev => ({ ...prev, name: user.name }))
    }
  }, [user?.name])

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán')
      router.push('/login?redirect=/cart')
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
        router.push(`/orders`)
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
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-indigo-500" />
          Giỏ hàng của bạn
        </h1>

        {!isLoaded ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold mb-2">Đang tải giỏ hàng...</h2>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-white/5">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-400 mb-6">Hãy quay lại cửa hàng để chọn cho mình những món đồ ưng ý nhé.</p>
            <Button onClick={() => router.push('/')} className="bg-indigo-600 hover:bg-indigo-700">
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-4 bg-slate-900/40 rounded-2xl border border-white/5 items-center">
                  <div className="w-20 h-20 bg-slate-950 rounded-xl overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-lg">{item.name}</h3>
                    <p className="text-indigo-400 font-semibold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950 rounded-xl px-2 py-1 border border-white/5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:text-indigo-400 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:text-indigo-400 transition"
                      disabled={item.quantity >= item.maxStock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/40 rounded-2xl border border-white/5 p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6">Thông tin giao hàng</h2>
              
              <div className="space-y-4 mb-6">
                <Input
                  label="Họ và tên"
                  value={shippingDetails.name}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                  error={errors.name}
                  className="bg-slate-950/50 border-white/10"
                />
                <Input
                  label="Số điện thoại"
                  value={shippingDetails.phone}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  error={errors.phone}
                  className="bg-slate-950/50 border-white/10"
                />
                <Input
                  label="Số CCCD/CMND"
                  value={shippingDetails.cccd}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, cccd: e.target.value })}
                  error={errors.cccd}
                  className="bg-slate-950/50 border-white/10"
                />
                <Input
                  label="Địa chỉ giao hàng chi tiết"
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  error={errors.address}
                  className="bg-slate-950/50 border-white/10"
                />
              </div>

              <div className="h-px bg-white/10 my-6" />

              <h2 className="text-xl font-bold mb-6">Tổng quan đơn hàng</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Số lượng:</span>
                  <span className="text-white font-semibold">{totalCount} sản phẩm</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tạm tính:</span>
                  <span className="text-white font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Tổng tiền:</span>
                  <span className="font-extrabold text-indigo-400 text-2xl">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <h3 className="font-bold text-slate-300">Phương thức thanh toán</h3>
                
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-900'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-indigo-500' : 'border-slate-500'}`}>
                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  <span className="font-semibold text-sm text-white">Thanh toán khi nhận hàng (COD)</span>
                </label>

                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'bank' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-900'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'bank' ? 'border-indigo-500' : 'border-slate-500'}`}>
                      {paymentMethod === 'bank' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    <span className="font-semibold text-sm text-white">Chuyển khoản ngân hàng</span>
                  </div>
                  {!(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || process.env.NEXT_PUBLIC_SEPAY_API_KEY) && (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">Đang phát triển</span>
                  )}
                </label>

                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${paymentMethod === 'momo' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-slate-950/50 hover:bg-slate-900'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'momo' ? 'border-indigo-500' : 'border-slate-500'}`}>
                      {paymentMethod === 'momo' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    <span className="font-semibold text-sm text-white">Ví MoMo</span>
                  </div>
                  {!process.env.NEXT_PUBLIC_MOMO_PHONE && (
                    <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">Đang phát triển</span>
                  )}
                </label>

                {((paymentMethod === 'bank' && !(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || process.env.NEXT_PUBLIC_SEPAY_API_KEY)) || 
                  (paymentMethod === 'momo' && !process.env.NEXT_PUBLIC_MOMO_PHONE)) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] leading-relaxed">
                    <p className="font-bold mb-1 flex items-center gap-1.5">⚠️ Thông báo thanh toán:</p>
                    <p>Hệ thống tự động cộng tiền qua cổng thanh toán này đang được bảo trì hoặc đang trong quá trình phát triển. Vui lòng chọn phương thức COD hoặc liên hệ hotline cửa hàng để giao dịch chuyển khoản trực tiếp.</p>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleCheckout}
                isLoading={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg rounded-xl"
              >
                Tiến hành thanh toán
              </Button>
            </div>
          </div>
        )}
      </main>

      {showPaymentModal && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 sm:p-8 flex flex-col items-center text-center border-b border-white/5">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Đơn hàng đã được tạo thành công!</h2>
              <p className="text-slate-400 text-xs mt-1.5 font-mono">
                Mã đơn hàng: <span className="text-indigo-400 font-bold">#{createdOrder.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] space-y-6">
              {paymentMethod === 'bank' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="bg-white p-3 rounded-2xl w-44 h-44 flex items-center justify-center shrink-0 shadow-lg">
                    <img 
                      src={`https://img.vietqr.io/image/${process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'vietcombank'}-${process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007'}-compact2.png?amount=${createdOrder.totalAmount}&addInfo=GEARZONE ${createdOrder.id.slice(0, 8).toUpperCase()}&accountName=${encodeURIComponent(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'TRAN VAN KHAI')}`} 
                      alt="VietQR Payment Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-sm space-y-3 text-slate-300 w-full">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
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
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '1026820007')
                              toast.success('Đã copy số tài khoản!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
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
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(createdOrder.totalAmount.toString())
                              toast.success('Đã copy số tiền!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/5">
                        <span className="text-slate-400">Nội dung CK:</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-indigo-400">
                          <span>GEARZONE {createdOrder.id.slice(0, 8).toUpperCase()}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`GEARZONE ${createdOrder.id.slice(0, 8).toUpperCase()}`)
                              toast.success('Đã copy nội dung chuyển khoản!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'momo' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="bg-pink-600/10 border border-pink-500/20 p-5 rounded-2xl w-44 h-44 flex items-center justify-center shrink-0 shadow-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`23070507...`)}`} 
                      alt="Momo QR Code" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex-1 text-sm space-y-3 text-slate-300 w-full">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                      Thông tin chuyển khoản Ví MoMo
                    </h3>
                    <p className="text-xs text-slate-400">Vui lòng thực hiện chuyển khoản MoMo chính xác thông tin dưới đây:</p>
                    
                    <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Số MoMo nhận:</span>
                        <div className="flex items-center gap-1.5 font-bold text-white font-mono text-sm">
                          <span>{process.env.NEXT_PUBLIC_MOMO_PHONE || '0123456789'}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(process.env.NEXT_PUBLIC_MOMO_PHONE || '0123456789')
                              toast.success('Đã copy số MoMo!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
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
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(createdOrder.totalAmount.toString())
                              toast.success('Đã copy số tiền!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2.5 border-t border-white/5">
                        <span className="text-slate-400">Nội dung CK:</span>
                        <div className="flex items-center gap-1.5 font-extrabold text-pink-300">
                          <span>GEARZONE {createdOrder.id.slice(0, 8).toUpperCase()}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`GEARZONE ${createdOrder.id.slice(0, 8).toUpperCase()}`)
                              toast.success('Đã copy nội dung chuyển khoản!')
                            }}
                            className="p-1 hover:bg-white/10 rounded transition text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-950 border-t border-white/5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  toast.success('Đã ghi nhận yêu cầu xác nhận thanh toán!')
                  router.push('/orders')
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition"
              >
                Tôi đã chuyển khoản
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  router.push('/orders')
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
