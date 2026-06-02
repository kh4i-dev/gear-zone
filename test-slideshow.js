const { parseLegacyImageUrls } = require('./src/lib/product-images.js') || {};

function parseLegacy(input) {
  if (!input) return [];
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed.map((url) => url.trim()).filter(Boolean);
  } catch (e) {
    // not JSON
  }
  return input.split(/[\n|]+/).map((url) => url.trim()).filter(Boolean);
}

const PLACEHOLDER_IMAGE = '/placeholder.png'

function getProductCardImages(product) {
  const images = product.images || []
  
  const validImages = images.filter((img) => img.url && img.url.trim().length > 0)
  
  const sorted = [...validImages].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  const urls = sorted.flatMap((img) => parseLegacy(img.url))

  const uniqueUrls = Array.from(new Set(urls))

  const filteredUrls = uniqueUrls.filter((url) => url !== PLACEHOLDER_IMAGE)

  const hasRealImage = filteredUrls.some(
    (url) => !url.includes('unsplash.com') && url !== PLACEHOLDER_IMAGE
  )
  const finalUrls = hasRealImage
    ? filteredUrls.filter((url) => !url.includes('unsplash.com'))
    : filteredUrls

  if (finalUrls.length === 0) {
    return parseLegacy(product.imageUrl).filter((url) => url !== PLACEHOLDER_IMAGE)
  }

  return finalUrls
}

const product = {
  "images": [
    {
      "url": "https://cdn2.cellphones.com.vn/x/media/catalog/product/g/r/group_400_7_.png | https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80 | https://images.unsplash.com/photo-1625842268584-8f3290404318?auto=format&fit=crop&w=600&q=80",
      "sortOrder": 0,
      "isPrimary": true
    },
    {
      "url": "https://cdn.hstatic.net/products/200000637319/image_-_2025-10-03t102604.752_d9d6928e240b4c4d8ab61cdbbe32b4b5_master_ee91ddb483ee42ac87780a3a5d2789aa_master.png",
      "sortOrder": 1,
      "isPrimary": false
    }
  ],
  "imageUrl": "https://cdn2.cellphones.com.vn/x/media/catalog/product/g/r/group_400_7_.png | https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80 | https://images.unsplash.com/photo-1625842268584-8f3290404318?auto=format&fit=crop&w=600&q=80"
}

console.log("Result:", getProductCardImages(product))

