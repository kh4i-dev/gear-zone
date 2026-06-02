'use client'

import React, { createContext, use, useMemo, useCallback, useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useSocialProofContext } from '@/components/providers/SocialProofProvider'

export interface CartItem {
  id?: string
  productId: string
  variantId?: string | null
  sku?: string | null
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  maxStock: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  totalCount: number
  totalPrice: number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function getCartKey(item: Pick<CartItem, 'productId' | 'variantId'>) {
  return `${item.productId}:${item.variantId ?? 'base'}`
}

function getActiveKey(userId: string | null) {
  if (userId) return `gearzone_cart:user_${userId}`
  return 'gearzone_cart:guest'
}

function readLocalCart(key: string): CartItem[] {
  try {
    const stored = localStorage.getItem(key) || '[]'
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function writeLocalCart(key: string, items: CartItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {}
}

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message || 'Cart API error')
  return json.data as T
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [prevUserId, setPrevUserId] = useState<string | null>(null)

  // Initial load from localStorage + API refresh for logged-in users
  useEffect(() => {
    const currentUserId = user?.id || null

    // Legacy migration (run once)
    try {
      const guestKey = 'gearzone_cart:guest'
      if (!localStorage.getItem(guestKey)) {
        const legacy = localStorage.getItem('gearzone_cart:v1') || localStorage.getItem('gearzone_cart')
        if (legacy) {
          localStorage.setItem(guestKey, legacy)
          localStorage.removeItem('gearzone_cart:v1')
          localStorage.removeItem('gearzone_cart')
        }
      }
    } catch {}

    if (currentUserId) {
      const userKey = getActiveKey(currentUserId)
      const cached = readLocalCart(userKey)
      setItems(cached)
      setIsLoaded(true)
      setPrevUserId(currentUserId)

      apiFetch<CartItem[]>('GET', '/api/cart')
        .then((apiItems) => {
          setItems(apiItems)
          writeLocalCart(userKey, apiItems)
        })
        .catch(() => {})
    } else {
      setItems(readLocalCart(getActiveKey(null)))
      setIsLoaded(true)
      setPrevUserId(null)
    }
  }, [user?.id])

  // Track login/logout transitions
  useEffect(() => {
    if (!isLoaded) return

    const currentUserId = user?.id || null

    if (prevUserId === null && currentUserId !== null) {
      const guestKey = 'gearzone_cart:guest'
      const userKey = getActiveKey(currentUserId)
      const guestItems = readLocalCart(guestKey)

      const sync = guestItems.length > 0
        ? apiFetch<CartItem[]>('POST', '/api/cart/merge', {
            items: guestItems.map((g) => ({
              productId: g.productId,
              variantId: g.variantId,
              quantity: g.quantity,
              maxStock: g.maxStock,
            })),
          })
        : apiFetch<CartItem[]>('GET', '/api/cart')

      sync
        .then((apiItems) => {
          setItems(apiItems)
          writeLocalCart(userKey, apiItems)
          writeLocalCart(guestKey, [])
        })
        .catch(() => {
          const userItems = readLocalCart(userKey)
          const mergedMap = new Map<string, CartItem>()
          userItems.forEach((item) => mergedMap.set(getCartKey(item), { ...item, id: undefined }))
          guestItems.forEach((item) => {
            const key = getCartKey(item)
            const existing = mergedMap.get(key)
            if (existing) {
              mergedMap.set(key, {
                ...existing,
                quantity: Math.min(existing.quantity + item.quantity, item.maxStock),
              })
            } else {
              mergedMap.set(key, { ...item, id: undefined })
            }
          })
          const merged = Array.from(mergedMap.values())
          setItems(merged)
          writeLocalCart(userKey, merged)
          writeLocalCart(guestKey, [])
        })
        .finally(() => {
          setPrevUserId(currentUserId)
          window.dispatchEvent(new Event('gearzone_cart_changed'))
        })
      return
    }

    if (prevUserId !== null && currentUserId === null) {
      setItems(readLocalCart('gearzone_cart:guest'))
      setPrevUserId(null)
      return
    }

    setPrevUserId(currentUserId)
  }, [user?.id, isLoaded, prevUserId])

  // Cross-tab sync (only for guest mode, or all modes via localStorage)
  useEffect(() => {
    const syncCart = (e: StorageEvent | Event) => {
      if (!user) {
        const activeKey = getActiveKey(null)
        if (e instanceof StorageEvent && e.key !== activeKey) return
        setItems(readLocalCart(activeKey))
      }
    }

    window.addEventListener('storage', syncCart)
    window.addEventListener('gearzone_cart_changed', syncCart)
    return () => {
      window.removeEventListener('storage', syncCart)
      window.removeEventListener('gearzone_cart_changed', syncCart)
    }
  }, [user])

  const { socketId } = useSocialProofContext()

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1
    const isUser = user?.id

    if (isUser) {
      const userKey = getActiveKey(user.id)
      // Optimistic update
      setItems((current) => {
        const key = getCartKey(item)
        const existing = current.find((i) => getCartKey(i) === key)
        const next = existing
          ? current.map((i) =>
              getCartKey(i) === key
                ? { ...i, quantity: Math.min(i.quantity + qty, item.maxStock) }
                : i
            )
          : [...current, { ...item, quantity: qty }]
        writeLocalCart(userKey, next)
        return next
      })
      window.dispatchEvent(new Event('gearzone_cart_changed'))

      try {
        const apiItems = await apiFetch<CartItem[]>('POST', '/api/cart/items', {
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: qty,
          socketId,
        })
        setItems(apiItems)
        writeLocalCart(userKey, apiItems)
        window.dispatchEvent(new Event('gearzone_cart_changed'))
      } catch {}
      return
    }

    // Guest mode
    setItems((current) => {
      const key = getCartKey(item)
      const existing = current.find((i) => getCartKey(i) === key)
      const next = existing
        ? current.map((i) =>
            getCartKey(i) === key
              ? { ...i, quantity: Math.min(i.quantity + qty, item.maxStock) }
              : i
          )
        : [...current, { ...item, quantity: qty }]
      writeLocalCart('gearzone_cart:guest', next)
      window.dispatchEvent(new Event('gearzone_cart_changed'))
      return next
    })

    // Fire social proof event for guests too
    try {
      fetch('/api/social-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: item.name, socketId }),
      }).catch(() => {})
    } catch {}
  }, [user, socketId])

  const removeFromCart = useCallback((productId: string, variantId: string | null = null) => {
    const isUser = user?.id
    const removeKey = getCartKey({ productId, variantId })

    setItems((current) => {
      const itemToRemove = current.find((i) => getCartKey(i) === removeKey)
      const next = current.filter((i) => getCartKey(i) !== removeKey)

      if (isUser && itemToRemove?.id) {
        const userKey = getActiveKey(user.id)
        writeLocalCart(userKey, next)

        apiFetch<CartItem[]>('DELETE', `/api/cart/items/${itemToRemove.id}`)
          .then((apiItems) => {
            setItems(apiItems)
            writeLocalCart(userKey, apiItems)
            window.dispatchEvent(new Event('gearzone_cart_changed'))
          })
          .catch(() => {})
      } else if (!isUser) {
        writeLocalCart('gearzone_cart:guest', next)
      }

      window.dispatchEvent(new Event('gearzone_cart_changed'))
      return next
    })
  }, [user])

  const updateQuantity = useCallback((productId: string, quantity: number, variantId: string | null = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId)
      return
    }

    const isUser = user?.id
    const updateKey = getCartKey({ productId, variantId })

    setItems((current) => {
      const item = current.find((i) => getCartKey(i) === updateKey)
      const next = current.map((i) =>
        getCartKey(i) === updateKey ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
      )

      if (isUser && item?.id) {
        const userKey = getActiveKey(user.id)
        writeLocalCart(userKey, next)

        apiFetch<CartItem[]>('PATCH', `/api/cart/items/${item.id}`, { quantity })
          .then((apiItems) => {
            setItems(apiItems)
            writeLocalCart(userKey, apiItems)
            window.dispatchEvent(new Event('gearzone_cart_changed'))
          })
          .catch(() => {})
      } else if (!isUser) {
        writeLocalCart('gearzone_cart:guest', next)
      }

      window.dispatchEvent(new Event('gearzone_cart_changed'))
      return next
    })
  }, [removeFromCart, user])

  const clearCart = useCallback(() => {
    const isUser = user?.id

    setItems([])

    if (isUser) {
      const userKey = getActiveKey(user.id)
      localStorage.removeItem(userKey)
      window.dispatchEvent(new Event('gearzone_cart_changed'))

      apiFetch<CartItem[]>('DELETE', '/api/cart')
        .then((apiItems) => {
          setItems(apiItems)
          writeLocalCart(userKey, apiItems)
          window.dispatchEvent(new Event('gearzone_cart_changed'))
        })
        .catch(() => {})
    } else {
      localStorage.removeItem('gearzone_cart:guest')
      window.dispatchEvent(new Event('gearzone_cart_changed'))
    }
  }, [user])

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
