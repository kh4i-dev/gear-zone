# GearZone Variant System UX Refactor

Date: 2026-06-02
Branch: dev-03
Scope: UX and admin productivity only. Backend, Prisma schema, and API contracts were not changed.

## 1. UX Audit

Current variant data flow already works: option groups, option values, SKU, inventory, sale price, product detail rendering, and cart payloads. The regression risk was not backend capability; it was admin usability and edit safety.

Findings:

- Admin variant editor looked like developer tooling: nested controls, repeated add actions, large gaps, and low information density.
- Existing variant edit hydration had a P0 bug: admin edit rebuilt variant option labels from the wrong id relationship. This could load option selections as blank and risk destructive saves.
- Gallery primary selection was implicit only: admins had to move an image to the first position without a clear "set primary" action.
- Product preview in admin was too large and behaved like a storefront card instead of a compact CMS confirmation panel.
- Product detail variant chips already worked, but admin tooling did not match the same mental model of "group -> values -> matrix".

## 2. Before / After Wireframe

Before:

```text
Admin Product Form
| Basic fields                             | Large product card preview |
| Gallery occupying full row               | Full square image          |
| Description                              | Long card body             |
| Specs textarea                           | Price and stock footer     |

Variant Editor
| Header |
| Group card with many controls |
| Group card with many controls |
| Presets + new group controls |
| Wide table: SKU, values, price, sale, stock, active |
```

After:

```text
Admin Product Form
| Basic fields                             | Compact sticky preview |
| Gallery with set-primary action          | 96px image             |
| Description                              | Price / variant / SKU  |
| Specs textarea                           | Stock                  |

Variant Builder
| Header + compact presets |
| Step 1: Groups + quick add values        | Step 2: Matrix summary |
| Group: Mau sac [Trang] [Den] [Xanh]      | Sync matrix button     |
| Quick add: Trang, Den, Xanh              | Bulk price/sale/stock  |
|                                           | Compact variant table  |
```

Product detail target:

```text
Mau sac
[ Trang ] [ Den ] [ Xanh ] [ Do ]

Phien ban
[ Mini ] [ Mini Plus ]

Ket noi
[ Bluetooth ] [ USB-C ] [ Wireless ]
```

## 3. Component Tree

```text
src/app/admin/products/page.tsx
  AdminImageGallery
    image list
    set-primary action
    upload / paste URL / remove / reorder
  AdminVariantEditor
    Variant builder header
    Preset groups
    Group cards
    Quick-add values
    Matrix sync
    Bulk edit controls
    Compact variant table
  ProductImageFrame
    Compact sticky preview image

src/lib/products/adminProductForm.ts
  hydrateAdminVariants
  parseSpecText
  serializeSpecs

src/lib/products/adminVariantMatrix.ts
  generateVariants
```

## 4. Refactor Plan

P0:

- Fix admin edit hydration so existing variants load with correct option labels.
- Add regression tests around hydration.

P1:

- Replace admin variant editor layout with compact group/value/matrix workflow.
- Add clear primary-image action in admin gallery.
- Reduce product preview footprint and keep it sticky.
- Preserve variant image URL support without schema changes.

P2:

- Add bulk price, sale price, stock, and SKU fill operations.
- Add high-count matrix warning.
- Reduce floating contact overlap risk on checkout.

## 5. Implementation Summary

Completed:

- Added `hydrateAdminVariants()` and tests.
- Added `adminVariantMatrix.ts` as a pure UI helper for variant matrix generation.
- Rebuilt `AdminVariantEditor` into a compact CMS builder.
- Added quick group presets and comma-split value entry.
- Added matrix sync, bulk number edits, missing-SKU fill, variant image URL column, and active toggle.
- Added gallery "set primary" button that moves the selected image to index 0, preserving the existing primary-image persistence model.
- Reduced admin product preview to a compact sticky panel.
- Strengthened product detail variant group hierarchy, selected state, hover state, and disabled state.
- Updated checkout summary image to `next/image`.
- Adjusted floating contact widget safe-area and z-index.

Not changed:

- Prisma schema.
- API routes.
- Product/variant database models.
- Existing cart/product detail variant contracts.
