const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  chuot: '/categories/mouse.webp',
  mouse: '/categories/mouse.webp',
  'tai-nghe': '/categories/headset.webp',
  headset: '/categories/headset.webp',
  'ban-phim': '/categories/keyboard.webp',
  keyboard: '/categories/keyboard.webp',
  'ban-choi-game': '/categories/desk.webp',
  desk: '/categories/desk.webp',
  'man-hinh': '/categories/monitor.webp',
  monitor: '/categories/monitor.webp',
  'lot-chuot': '/categories/mousepad.webp',
  mousepad: '/categories/mousepad.webp',
}

export function getCategoryImage(categoryName: string): string | null {
  const slug = getCategorySlug(categoryName)
  if (CATEGORY_IMAGE_BY_SLUG[slug]) return CATEGORY_IMAGE_BY_SLUG[slug]
  if (slug.includes('mousepad') || slug.includes('lot-chuot')) return CATEGORY_IMAGE_BY_SLUG.mousepad
  return null
}

export function getCategorySlug(categoryName: string): string {
  return categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
