# GearZone

E-commerce platform for gaming gear and peripherals.

## Language

**Product**:
A sellable item with name, price, stock, description, category, and images.
_Avoid_: Item, listing, SKU

**ProductImage**:
An image URL associated with a product, ordered by `sortOrder`. The first image (lowest `sortOrder`) is the primary representative image for that product.
_Avoid_: Thumbnail, photo, picture

**Product Summary Spec**:
Short display text shown on product cards, such as sensor name, wireless support, or weight. It is descriptive only and never represents a customer-selectable purchase choice.
_Avoid_: Purchase option, variant, option value

**Product Option**:
A customer-selectable purchase dimension for a Product, such as color or version.
_Avoid_: Summary spec, technical spec

**Product Option Value**:
One selectable value inside a Product Option, such as "Blaze Silver" for color or "Ultra Max" for version.
_Avoid_: Summary spec value, technical spec row

**Product Variant**:
A sellable combination of Product Option Values with its own SKU, optional price override, optional sale price override, stock, image, and active state.
_Avoid_: Product, card spec

**Technical Spec**:
Detailed specification text used for the product detail specs table, such as sensor model, polling rate, or weight. It is descriptive only and never represents a customer-selectable purchase choice.
_Avoid_: Purchase option, variant

**Primary Product Image**:
The first `ProductImage` of a product, used as the default representative in cards, listings, and initial gallery view. Determined by position (`sortOrder`), not an explicit flag.
_Avoid_: Thumbnail (that's a presentation concern)

**Category**:
A named grouping of products (e.g. "Bàn phím", "Chuột").
_Avoid_: Type, collection, department

**Order**:
A customer purchase containing one or more line items.
_Avoid_: Transaction, purchase

**Setting**:
A key-value configuration entry for store-wide parameters (payment, branding, etc.).
_Avoid_: Config, option, preference

## Relationships

- A **Product** has zero or more **ProductImage** records, ordered by `sortOrder`
- A **Product** has zero or more **ProductOption** records, each with one or more **ProductOptionValue** records
- A **ProductVariant** belongs to one **Product** and is identified by a unique combination of ProductOptionValues for that Product
- A **Product** belongs to at most one **Category**
- A **Category** has zero or more **Product** records
- An **Order** has one or more **OrderItem** records, each referencing one **Product**

## Example dialogue

> **Dev:** "When we render a product card, do we fetch all ProductImages or just the primary one?"
> **Domain expert:** "For the card, only the primary ProductImage is needed. For the detail page, fetch all ProductImages to show the gallery."
>
> **Dev:** "Can a product have zero images?"
> **Domain expert:** "Yes. In that case, show the placeholder image."

## Flagged ambiguities

- "Thumbnail" was used to mean both a UI size variant and the primary image — resolved: `ProductImage` is the domain entity; "thumbnail" is only a UI presentation term.
- "isPrimary" was considered as an explicit flag — resolved: position-based (`sortOrder`) is simpler and sufficient for current scope.
