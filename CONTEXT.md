# GearZone

E-commerce platform for gaming gear and peripherals.

## Language

**Product**:
A sellable item with name, price, stock, description, category, and images.
_Avoid_: Item, listing, SKU

**ProductImage**:
An image URL associated with a product, ordered by `sortOrder`. The first image (lowest `sortOrder`) is the primary representative image for that product.
_Avoid_: Thumbnail, photo, picture

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
