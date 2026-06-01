Use the repo skills first:
- Use /grill-the-docs to inspect current implementation before editing.
- Use /tdd for test-first implementation.
- Do not code immediately. First produce a short implementation plan and list files to change.
- Do not rewrite unrelated UI.
- Do not change unrelated business logic.
- Do not delete existing product data.

Context:
This is GearZone, a Next.js App Router + TypeScript + Prisma project. The current product detail page is too simple. I want to upgrade product detail, product cards, and admin product management to support real ecommerce-style product variants and image galleries.

Objective:
Implement product variant and gallery support similar to a gaming gear ecommerce product page.

Required UX:
1. Product detail page:
   - Show main product image.
   - Show thumbnail gallery below the main image.
   - Clicking a thumbnail changes the main image.
   - Product has selectable options:
     - Variant group example: Loại / Phiên bản: Ultra Max, Ultimate, Extreme.
     - Variant group example: Màu sắc: Black, White, PearlBlue, CoralPink, LEVIATAN Collab.
   - When user selects a valid variant combination, update:
     - main image
     - price
     - sale price / discount
     - stock status
     - SKU if visible
   - Disabled/unavailable combinations must be visually disabled and cannot be selected.
   - Quantity selector must respect stock.
   - Add to cart must add the selected variant, not only the base product.
   - If a product has no variants, keep current simple product flow working.

2. Product card/listing page:
   - Product card should use product gallery images.
   - On hover, automatically cycle through product images in order:
     image 1 -> image 2 -> image 3 -> ...
   - When mouse leaves, stop cycling and reset to the primary image.
   - Must not cause memory leaks.
   - Must not create excessive re-renders for many product cards.
   - Respect prefers-reduced-motion: if user disables motion, do not autoplay cycle.
   - Keep layout stable, no CLS.
   - Existing product cards without gallery must still work.

3. Admin Panel:
   - Update create/edit product form to support:
     - Primary image
     - Gallery images
     - Add image
     - Remove image
     - Reorder images
     - Preview images
   - Add variant management:
     - Define option groups, for example:
       - Loại: Ultra Max, Ultimate, Extreme
       - Màu sắc: Black, White, PearlBlue, CoralPink
       - Size if needed later
     - Manage variant rows with:
       - option combination
       - SKU
       - price override
       - sale price override
       - stock
       - image/gallery association
       - active/inactive status
   - Admin UX should be simple and maintainable, not over-designed.
   - Validate all inputs before submit.
   - Show useful form errors.

Data model requirements:
Inspect current Prisma schema first. Then propose the minimal safe schema extension.

Suggested structure if compatible:
- ProductImage:
  - id
  - productId
  - url
  - alt
  - sortOrder
  - isPrimary
  - variantId nullable if image belongs to a specific variant
  - createdAt
  - updatedAt

- ProductOption:
  - id
  - productId
  - name
  - sortOrder

- ProductOptionValue:
  - id
  - optionId
  - value
  - label
  - sortOrder

- ProductVariant:
  - id
  - productId
  - sku
  - price nullable
  - salePrice nullable
  - stock
  - imageUrl nullable
  - isActive
  - createdAt
  - updatedAt

- ProductVariantOptionValue:
  - variantId
  - optionValueId
  - composite unique constraint

Important:
- If the current schema already has similar fields, reuse them instead of creating duplicate concepts.
- Add proper indexes for productId, variantId, sortOrder, sku.
- Use Prisma migration. Do not use db push for production.
- Keep migration-first discipline.

API requirements:
Standardize product APIs around this shape:
{
  "data": ...,
  "error": null,
  "meta": {
    "traceId": "...",
    "pagination": ...
  }
}

Implement or update:
1. GET /api/products
   - Return product cards with enough gallery data for hover slideshow.
   - Add pagination if currently missing.
   - Keep backward compatibility with current UI where possible.

2. GET /api/products/[id]
   - Return full product detail:
     - base product
     - images
     - options
     - option values
     - variants
     - variant image mapping
   - Return 404 cleanly if product not found.

3. Admin product APIs:
   - Create/update product with images and variants.
   - Validate request body with Zod or existing validation style.
   - Use Prisma transaction for product + images + variants update.
   - Avoid partial writes.
   - Use clear 400/404/500 error handling.

Cart requirements:
- Inspect current cart schema and add variantId support only if needed.
- Add selected variant to cart.
- Cart item should preserve productId and variantId.
- If variantId is null, old products still work.
- Validate stock for selected variant.

Frontend architecture:
- Keep components small and testable.
- Suggested components:
  - ProductImageGallery
  - ProductOptionSelector
  - ProductVariantSelector
  - ProductPriceBlock
  - ProductCardImageHover
  - AdminProductImageManager
  - AdminProductVariantEditor
- Use pure helper functions for variant resolution:
  - getSelectedVariant(options, variants)
  - getAvailableOptionValues(selectedOptions, variants)
  - getVariantPrice(product, variant)
  - getPrimaryProductImage(product, selectedVariant)
- Unit test these helpers.

Testing:
Before implementation, add tests for pure variant logic:
1. Selecting Ultra Max + Black returns the correct variant.
2. Unavailable color is disabled when selected type has no matching active variant.
3. Variant price overrides base price.
4. Variant image overrides base primary image.
5. Product without variants still works.
6. Hover image helper returns ordered gallery images and falls back to primary image.

Then implement code and run:
- npm run build
- npm run lint
- npx tsc --noEmit
- npx prisma validate
- npx prisma migrate status

Security / reliability:
- No console.log in production code.
- Use JSON logging or existing logger if available.
- Include traceId in API errors.
- Validate all admin input.
- Do not trust image URLs blindly.
- Do not expose admin-only fields in public API.
- Do not commit secrets.
- Do not break existing products.

Performance:
- Product card hover slideshow must not fetch extra data per hover.
- Product listing API should return only lightweight gallery data.
- Product detail API can return full variant data.
- Use stable keys and memoized helpers where useful.
- Avoid static stale product catalog if products are dynamic.

Acceptance criteria:
- Admin can create/edit product with multiple gallery images.
- Admin can create/edit product variants by type/color/size-like options.
- Product detail page updates image/price/stock when selecting variant.
- Invalid variant combinations are disabled.
- Add to cart includes selected variant.
- Product card hover cycles through gallery images.
- Existing products without variants still display and can be added to cart.
- Build and type-check pass.
- Prisma migration exists.
- No unrelated UI rewrite.