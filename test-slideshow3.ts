import { getProductCardImages } from './src/lib/products/slideshow.js';
import { parseLegacyImageUrls } from './src/lib/product-images.js';

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
