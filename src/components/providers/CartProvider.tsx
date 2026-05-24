'use client'

import React, { createContext, use, useMemo, useCallback, useSyncExternalStore } from 'react'

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

// Custom subscriber store for useSyncExternalStore
let cartListeners: (() => void)[] = []
function emitCartChange() {
  for (const listener of cartListeners) {
    listener()
  }
}

const cartStore = {
  subscribe(listener: () => void) {
    cartListeners = [...cartListeners, listener]
    return () => {
      cartListeners = cartListeners.filter((l) => l !== listener)
    }
  },
  getSnapshot() {
    if (typeof window === 'undefined') return '[]'
    return localStorage.getItem('gearzone_cart:v1') || localStorage.getItem('gearzone_cart') || '[]'
  },
  getServerSnapshot() {
    return '[]'
  },
  set(value: string) {
    localStorage.setItem('gearzone_cart:v1', value)
    emitCartChange()
  },
  clear() {
    localStorage.removeItem('gearzone_cart:v1')
    localStorage.removeItem('gearzone_cart')
    emitCartChange()
  }
}

const clientLoadedStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartJson = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  )

  const isLoaded = useSyncExternalStore(
    clientLoadedStore.subscribe,
    clientLoadedStore.getSnapshot,
    clientLoadedStore.getServerSnapshot
  )

  const items = useMemo(() => {
    try {
      return JSON.parse(cartJson) as CartItem[]
    } catch {
      return []
    }
  }, [cartJson])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const currentJson = cartStore.getSnapshot()
    let current: CartItem[] = []
    try {
      current = JSON.parse(currentJson)
    } catch {}

    const existing = current.find((i) => i.productId === item.productId)
    const addQty = item.quantity || 1
    let next: CartItem[]
    if (existing) {
      next = current.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: Math.min(i.quantity + addQty, item.maxStock) }
          : i
      )
    } else {
      next = [...current, { ...item, quantity: addQty }]
    }
    cartStore.set(JSON.stringify(next))
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    const currentJson = cartStore.getSnapshot()
    let current: CartItem[] = []
    try {
      current = JSON.parse(currentJson)
    } catch {}

    const next = current.filter((i) => i.productId !== productId)
    cartStore.set(JSON.stringify(next))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    const currentJson = cartStore.getSnapshot()
    let current: CartItem[] = []
    try {
      current = JSON.parse(currentJson)
    } catch {}

    const next = current.map((i) =>
      i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
    )
    cartStore.set(JSON.stringify(next))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    cartStore.clear()
  }, [])

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const contextValue = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCount,
    totalPrice,
    isLoaded,
  }), [items, isLoaded, addToCart, removeFromCart, updateQuantity, clearCart, totalCount, totalPrice])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = use(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

