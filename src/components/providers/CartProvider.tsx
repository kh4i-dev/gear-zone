'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  maxStock: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('gearzone_cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {}
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('gearzone_cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((current) => {
      const existing = current.find((i) => i.productId === item.productId)
      const addQty = item.quantity || 1
      if (existing) {
        return current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + addQty, item.maxStock) }
            : i
        )
      }
      return [...current, { ...item, quantity: addQty }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((current) => current.filter((i) => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((current) =>
      current.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
