import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatPrice(price: number) {
  return priceFormatter.format(price)
}

export function formatDateTime(date: string | Date) {
  return dateFormatter.format(new Date(date))
}

export function parseVndInput(value: string): number {
  const digits = value.replace(/\\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function formatVnd(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return ''
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ'
}

// Helper to sanitize HTML tags and comments to produce clean text excerpt
export function sanitizeProductExcerpt(description: string | null | undefined, maxLength = 100): string {
  if (!description) return 'Sản phẩm gaming gear chính hãng chất lượng cao.'
  
  // 1. Remove HTML comments <!-- ... -->
  let text = description.replace(/<!--[\s\S]*?-->/g, '')
  
  // 2. Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '')
  
  // 3. Unescape common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  
  // 4. Normalize whitespaces
  text = text.replace(/\s+/g, ' ').trim()
  
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

