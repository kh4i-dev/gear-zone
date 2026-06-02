# GearZone Regression Audit

Source brief: `codex.txt`
Audit date: 2026-06-02
Scope: carousel/homepage, admin products, gallery, variants, specs, product detail, floating contact widget, git history.

## Executive Summary

Current code is not a blind rewrite; most requested systems are still present. The strongest confirmed regression is in admin variant edit hydration: existing variant option labels are not reliably reconstructed because `src/app/admin/products/page.tsx` compares an option value id to an option id. This can make the admin variant matrix lose option selections on edit and creates risk of overwriting existing variant relationships on save.

Carousel behavior has current fixes for stale auto-slide closure and bubbled `transitionend` events. Gallery support was recently added and supports upload, preview, remove, arrow reorder, and primary-by-first-image. Product detail variants update price, SKU, stock, image, cart item variant id, and buy-now flow. The missing pieces are mostly UX maturity: no explicit "set primary" button, no drag reorder, no admin variant image column, no variant bulk price/stock tools, and limited automated coverage around UI hydration.

Production-vs-local comparison was not completed because no production URL or snapshot was available in the workspace. The git audit below identifies local commits that introduced the relevant current behavior.

## P0 Findings

### P0-1 Admin Variant Edit Hydration Bug

Evidence:

- `src/app/admin/products/page.tsx:301-317` reconstructs loaded variants.
- The code finds an option group with:
  `o.values.some((ov) => ov.id === item.optionValue.optionId)`
- `ov.id` is a `ProductOptionValue.id`, while `item.optionValue.optionId` is a `ProductOption.id`.
- The API include in `src/lib/products/adminProductPayload.ts:270-280` already includes `optionValue.option`, so the correct source is available.

Impact:

- Existing variant rows can display blank option columns in the admin editor.
- `generateVariants()` preserves existing values by matching `variant.options`; if those options are `{}`, preservation fails.
- Saving after edit can drop or rebuild variant relationships incorrectly.

Regression commit:

- `04963d3 dev-03` introduced `AdminVariantEditor` and the loader mapping.

Fix strategy:

- Map option names from `item.optionValue.option.name`, or compare `o.id === item.optionValue.optionId`.
- Add a focused test around "API product with options + variants hydrates admin form variants with option labels".

## P1 Findings

### P1-1 Carousel Is Present, But UX Depends On Current Custom Logic

Evidence:

- `src/components/domain/ProductRowCarousel.tsx` implements cloned infinite rows, responsive visible count, touch swipe, hover pause, reduced motion, tab visibility pause, and arrows.
- `1101160` added the custom carousel to fix stale auto-slide closure.
- `c309742` filtered `transitionend` by target and `propertyName === 'transform'`, because ProductCard child transitions bubbled into the track handler.
- Focused tests passed: `src/lib/products/carousel.test.ts`.

Current status:

- Auto-slide and infinite loop logic exist.
- Smooth sliding exists through `translate3d` and `transform 500ms cubic-bezier(...)`.
- The system is not using Swiper; it is a custom carousel.

Risk:

- Visual differences from any older Swiper implementation are expected.
- The current automated tests cover helper logic, not full DOM transition behavior.

### P1-2 Product Cards Are Not Static, But Hover Style Changed

Evidence:

- `src/components/domain/ProductCard.tsx:81-235` has hover translate, hover ring, ambient glow, product image scale, slideshow dots, and add-to-cart interaction.
- `src/components/domain/ProductImageFrame.tsx:46-80` supports sliding gallery images by `activeIndex`.
- `src/hooks/useHoverImageSlideshow` is used by ProductCard.

Current status:

- Hover animation and hover image slideshow are present.
- If older behavior felt different, the regression is visual/interaction tuning rather than missing functionality.

### P1-3 Admin Product Management Blocks Are Present

Evidence:

- Category block exists at `src/app/admin/products/page.tsx:800-842`.
- Brand block exists at `src/app/admin/products/page.tsx:844-887`.
- Search and tabs exist at `src/app/admin/products/page.tsx:889-927`.
- Product table/card views exist below `src/app/admin/products/page.tsx:929`.

Current status:

- The separate "Khu vực quản lý sản phẩm" and "Lọc theo thương hiệu" concepts exist.
- Brand stats are scoped by selected category via `buildBrandCounts(products, resolvedBrands, selectedCategory)`.

Risk:

- The exact production label remembered by the user cannot be verified without production snapshot.

### P1-4 Gallery Workflow Exists, But Primary Selection Is Implicit

Evidence:

- `afcacd4 feat: admin product gallery UI with URL paste, upload, reorder, delete` added `AdminImageGallery`.
- `src/components/domain/AdminImageGallery.tsx` supports upload, URL add, preview, remove, and move up/down.
- `src/lib/products/adminProductPayload.ts:53-69` persists gallery images and marks index `0` as primary.
- `src/app/admin/products/page.tsx:268-273` loads existing gallery images sorted by `sortOrder`.

Current status:

- Upload: present.
- Preview: present.
- Remove: present.
- Reorder: present via arrows.
- Primary: present only by first image position.

Missing UX:

- No explicit "set primary" action.
- No drag-and-drop reorder.
- No per-image alt editing.

### P1-5 Product Detail Variant UX Mostly Works

Evidence:

- `src/app/products/[id]/ProductPurchaseExperience.tsx` initializes selected options, computes `selectedVariant`, `price`, `currentStock`, `primaryImage`, and `galleryImages`.
- Variant selection buttons disable unavailable values based on active in-stock variants.
- Add-to-cart and buy-now pass `variantId`, SKU, quantity, selected price, selected image, and max stock.
- `src/lib/products/productVariants.ts` has tests for selection, availability, price, and image helpers.

Current status:

- Product detail supports Playzone-like option chips at a functional level.
- Price, sale price, SKU, stock, and images can update with selected variant.

Missing UX:

- No explicit selected variant summary beyond label/SKU.
- No visual matrix or comparison for variants.
- No variant-specific thumbnail selection in admin.

## P2 Findings

### P2-1 Technical Specs Textarea Requirement Is Preserved

Evidence:

- `src/app/admin/products/page.tsx:684-714` uses a textarea for technical specs.
- `src/lib/products/adminProductForm.ts:42-63` parses `Name: Value` and `Name|Value`.
- Focused tests passed: `src/lib/products/adminProductForm.test.ts`.

Current status:

- The rejected key/value row workflow is not present.
- Supplier copy-paste workflow is preserved.

### P2-2 Floating Contact Widget Exists, With Basic Accessibility

Evidence:

- `src/components/domain/FloatingContactWidget.tsx:63-92` renders fixed bottom-right contact buttons.
- It has `role="navigation"`, `aria-label`, per-link labels, external link `rel`, and `tel:` handling.

Risk:

- `z-50` can conflict with sticky nav and modal layers.
- On mobile, `bottom-4 right-4` may overlap product purchase actions or cart checkout content because no route-specific offset is applied.

### P2-3 Admin Variant Editor Is Functional But Developer-Oriented

Evidence:

- `src/components/domain/AdminVariantEditor.tsx` has presets, group/value creation, batch add, value reorder, generated matrix, SKU, price, sale price, stock, active toggle.
- It lacks a visible variant image input column despite `AdminVariant.imageUrl` existing in the type and API.

Missing UX:

- Bulk fill price/stock/SKU.
- Variant image assignment.
- Warnings for large Cartesian products.
- Matrix validation hints before submit.

## Git Audit

| Regression or Behavior | Commit | Root Cause | Fix Strategy |
|---|---|---|---|
| Carousel custom infinite auto-slide introduced | `1101160 fix: eliminate stale closure in Featured Products auto-slide` | Replaced/added custom carousel with refs and interval control | Keep; add DOM/integration test for transition reset |
| Carousel child transitions could break track reset | `c309742 fix: filter bubbled transitionend events in ProductRowCarousel` | ProductCard transitions bubbled to carousel `transitionend` | Fixed; keep target/property filter |
| Product variant helper layer introduced | `5e61be9 chore: push all lib modules to remote` | Added selection/price/image helper logic | Keep; tests pass |
| Product detail variant purchase UX introduced | `6bee058 chore: sync all local changes to remote` | Added `ProductPurchaseExperience` and updated ProductCard/gallery frame | Keep; needs UI tests |
| Admin gallery UI introduced | `afcacd4 feat: admin product gallery UI with URL paste, upload, reorder, delete` | Replaced single image input with gallery list | Keep; add explicit set-primary if desired |
| Admin variant editor and hydration introduced | `04963d3 dev-03` | New loader maps option groups incorrectly by id type | Fix loader and add hydration regression test |

## Verification

Commands run:

- `npx vitest run src/lib/products/carousel.test.ts src/lib/products/slideshow.test.ts src/lib/products/productVariants.test.ts src/lib/products/adminProductForm.test.ts src/lib/products/adminProductPayload.test.ts src/lib/products/adminProductFilters.test.ts`
- Result: 6 test files passed, 66 tests passed.
- `npm run type-check`
- Result: TypeScript passed.

## Recommended Fix Priority

P0:

- Fix admin variant edit hydration in `src/app/admin/products/page.tsx`.
- Add a regression test for existing product variants loading into the admin matrix.

P1:

- Add a small Playwright or React integration test for ProductRowCarousel auto-slide/infinite reset.
- Add product detail variant UI test covering option select -> price/SKU/stock/image/cart payload.
- Add explicit admin "set primary" control for gallery images.

P2:

- Add drag-and-drop gallery reorder.
- Add variant image assignment in admin matrix.
- Add bulk variant editing tools for price, sale price, SKU prefix, stock, and active state.
- Add mobile overlap checks for FloatingContactWidget on product and checkout pages.
