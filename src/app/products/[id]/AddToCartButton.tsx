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
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-extrabold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-white/30"
    >
      <ShoppingCart className="size-5" />
      Thêm vào giỏ
    </button>
  )
}
