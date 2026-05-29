'use client'

import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/components/providers/CartProvider'

export function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart()

  return (
    <button type="button"
      onClick={() => {
        addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          maxStock: product.stock,
        })
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
      }}
      disabled={product.stock <= 0}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-4 text-sm font-extrabold text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:from-emerald-500 hover:to-cyan-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:from-slate-800 disabled:to-slate-800 disabled:text-white/30"
    >
      <ShoppingCart className="size-5" />
      Thêm vào giỏ
    </button>
  )
}
