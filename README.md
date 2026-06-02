# GearZone

Production-minded ecommerce for gaming gear: variant-rich catalog, persisted cart, transactional checkout, inventory operations, admin CMS, and Azure-ready deployment.

![GearZone storefront](docs/screenshots/homepage-showcase.png)

## Features

### Storefront Commerce

- Gaming gear storefront built with Next.js 15 App Router and React 19.
- Product listing with category chips, search, price filters, stock filter, and sorting.
- Product detail pages with gallery images, related products, stock-aware purchase controls, trust badges, reviews, and technical specs.
- Guest cart with localStorage persistence.
- Authenticated cart with database persistence and guest-cart merge after login.
- Checkout flow with shipping fields, COD/bank payment selection, and transactional order creation.
- Customer order history page.

### Catalog And Merchandising

- Products, categories, brands, images, technical specs, and visibility/status flags.
- Variant system with options, option values, SKU, active state, price override, sale price override, stock, and variant images.
- Parent product stock is computed from active variants when variants exist.
- Store feature cards, homepage content, ticker/contact/payment/SEO settings through admin settings.
- Newsletter subscription persistence.

### Operations Admin

- Admin KPI dashboard for revenue, orders, products, customers, pending orders, low-stock alerts, recent orders, and top sellers.
- Product management API and UI for catalog editing, image galleries, specs, option groups, and variants.
- Inventory dashboard with low-stock and out-of-stock filters, inline stock controls, and variant-stock safeguards.
- Order management with status buckets, payment filters, search, detail drawer, status transitions, internal notes, timeline entries, cancellation stock restoration, and refund flagging.
- User/member listing and admin settings.

### Platform Foundation

- PostgreSQL data model managed by Prisma migrations.
- HttpOnly JWT session cookie with bcrypt password hashing.
- Admin route obfuscation and middleware rewrites using configurable admin prefix/login path.
- Consistent API response shape with trace IDs.
- Socket.IO social-proof event channel.
- Deployment guide for Azure Ubuntu, PM2, Nginx, and Neon PostgreSQL.

## Screenshots

Every image below is a real Playwright capture from the running application, saved under `docs/screenshots`.

### Product Listing

Chosen because it shows the ecommerce surface clearly: category segmentation, search/filter controls, sort order, product cards, prices, and merchandising density.

![Product listing](docs/screenshots/products.png)

### Product Detail

Chosen because it demonstrates the highest-value customer workflow: product media, pricing, stock availability, quantity control, add-to-cart, buy-now, support actions, and related products.

![Product detail](docs/screenshots/product-detail.png)

### Cart

Chosen because it shows the purchase review step with line items, quantity controls, subtotal, shipping, order total, and checkout CTA.

![Cart](docs/screenshots/cart.png)

### Admin Dashboard

Chosen because it proves this is not only a storefront: the repository includes operational KPIs, pending-order alerts, low-stock alerts, recent orders, and top sellers.

![Admin dashboard](docs/screenshots/admin-dashboard.png)

### Inventory Operations

Chosen because ecommerce production quality depends on stock operations. This view shows stock status, filters, inline controls, and variant-aware safeguards.

![Inventory](docs/screenshots/inventory.png)

### Order Management

Chosen because it shows the order command center used by store operators to search, filter, inspect, and progress orders.

![Order management](docs/screenshots/order-management.png)

### Admin Settings

Chosen because GearZone includes a lightweight CMS surface for storefront appearance, homepage content, SEO, contact, payment, categories, brands, and admin security.

![Admin settings](docs/screenshots/admin-settings.png)

More captures: `docs/screenshots/category.png`, `docs/screenshots/login.png`, `docs/screenshots/register.png`, `docs/screenshots/checkout.png`, `docs/screenshots/orders.png`.

## Architecture

GearZone is a full-stack Next.js application with Route Handlers as the backend API layer and Prisma as the database boundary.

```mermaid
flowchart TB
  subgraph Browser["Browser"]
    Storefront["Storefront UI"]
    AdminUI["Admin Dashboard"]
    Providers["AuthProvider / CartProvider / SocialProofProvider"]
  end

  subgraph NextApp["Next.js 15 App Router"]
    Pages["Server + Client Pages"]
    API["Route Handlers"]
    Middleware["Auth Middleware + Admin Rewrites"]
    Socket["Socket.IO Social Proof"]
  end

  subgraph Domain["Domain Modules"]
    ProductLogic["Product Mapping / Variants / Filters"]
    OrderLogic["Checkout / Orders / Timeline"]
    SettingsLogic["Store Settings / CMS"]
    Newsletter["Newsletter + Notifications"]
  end

  subgraph Data["Data Layer"]
    Prisma["Prisma ORM"]
    Postgres[("Neon PostgreSQL")]
  end

  Storefront --> Pages
  AdminUI --> Pages
  Providers --> API
  Pages --> API
  Middleware --> Pages
  API --> ProductLogic
  API --> OrderLogic
  API --> SettingsLogic
  API --> Newsletter
  API --> Socket
  ProductLogic --> Prisma
  OrderLogic --> Prisma
  SettingsLogic --> Prisma
  Newsletter --> Prisma
  Prisma --> Postgres
```

## Database

The Prisma schema is centered on a variant-aware ecommerce model.

```mermaid
erDiagram
  User ||--o{ Order : places
  User ||--o| Cart : owns
  User ||--o{ Review : writes
  Category ||--o{ Product : groups
  Brand ||--o{ Product : marks
  Product ||--o{ ProductImage : has
  Product ||--o{ ProductOption : defines
  ProductOption ||--o{ ProductOptionValue : contains
  Product ||--o{ ProductVariant : sells
  ProductVariant ||--o{ ProductVariantOptionValue : combines
  ProductOptionValue ||--o{ ProductVariantOptionValue : selected
  Product ||--o{ CartItem : appears_in
  ProductVariant ||--o{ CartItem : appears_in
  Cart ||--o{ CartItem : contains
  Order ||--o{ OrderItem : contains
  Product ||--o{ OrderItem : purchased
  ProductVariant ||--o{ OrderItem : purchased
  Order ||--o{ OrderTimeline : records
  Product ||--o{ Review : receives
```

Key database decisions:

- `ProductVariant.stock` is authoritative for variant products.
- `OrderTimeline` records status movement and admin actions.
- `Cart` and `CartItem` persist authenticated carts while guest carts remain client-side until merge.
- `Setting` and `StoreFeature` give the admin dashboard CMS-like control.
- `NewsletterSubscription`, `ActivityEvent`, and `AuditLog` prepare the platform for growth workflows.

## Admin Dashboard

The admin area is available behind configurable paths:

- `NEXT_PUBLIC_ADMIN_PANEL_PREFIX`, default `system-control`.
- `NEXT_PUBLIC_ADMIN_LOGIN_PATH`, default `auth-login`.

Capabilities:

- Dashboard analytics.
- Product CRUD and variant management.
- Inventory count review and updates.
- Order queue, status changes, notes, timeline, cancellation handling.
- User/member overview.
- Store settings, SEO, banners, contact, policy, payment, categories, brands.
- Admin password change.

## Security

### Authentication

- Custom JWT auth with `jose`.
- Session stored in `gearzone_session`.
- HttpOnly cookie.
- Secure cookie in production.
- bcrypt password hashing.

### Authorization

- Middleware protects admin routes and rewrites the public admin prefix to internal `/admin/*`.
- Direct external `/admin` access is blocked.
- Admin APIs check `user.role === "ADMIN"`.
- Customer order/cart APIs require a current user where appropriate.

### Validation

- API routes validate required fields, numeric ranges, product existence, variant ownership, stock availability, and order status transitions.
- Prisma enforces uniqueness and relational integrity.

Recommended hardening:

- Add centralized Zod schemas.
- Add Redis-backed rate limiting.
- Add MFA for admins.
- Add session revocation.
- Write audit logs for every admin mutation.

## Deployment

Production target:

- Azure Ubuntu VM.
- PM2 process manager.
- Nginx reverse proxy.
- Neon PostgreSQL.
- Prisma Migrate.

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.cjs
sudo nginx -t
sudo systemctl reload nginx
```

Required environment variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DB?sslmode=require"
NEXT_PUBLIC_APP_URL="https://your-domain.example"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_ADMIN_PANEL_PREFIX="system-control"
NEXT_PUBLIC_ADMIN_LOGIN_PATH="auth-login"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
```

See [docs/azure-ubuntu-neon-deploy.md](docs/azure-ubuntu-neon-deploy.md) for the complete deployment guide.

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Useful checks:

```bash
npx prisma validate
npm run type-check
npm run lint
npm run build
```

## Roadmap

### Completed

- Storefront home, catalog, product detail, cart, checkout, auth, and orders.
- Admin dashboard, products, inventory, orders, users, and settings.
- Variant matrix with SKU, price, stock, and active state.
- PostgreSQL Prisma schema and migrations.
- Azure Ubuntu + Neon deployment documentation.
- Playwright screenshot gallery.

### In Progress

- Stronger automated test coverage for cart, checkout, admin order transitions, and auth.
- Documentation cleanup for stale blueprint notes.
- Demo data and screenshot fixtures for repeatable showcase captures.
- UI refinements for homepage media and checkout deep-linking.

### Future

- Payment gateway webhooks and reconciliation.
- Promotion engine and coupon rules.
- Product/category slugs and richer SEO.
- Structured observability and CI/CD.
- Object storage for uploads.

## Future Expansion

- Redis for rate limits, cache, distributed session helpers, and background queues.
- SMTP for order confirmations, newsletter welcome emails, and admin alerts.
- Telegram notifications for new orders, low-stock alerts, and newsletter signups.
- Newsletter segmentation, unsubscribe flow, and campaign analytics.
- Campaign system for promotions, timed drops, banners, and coupons.
- AI recommendation system based on product category, specs, inventory, and purchase history.
- Realtime events for social proof, admin order feed, and inventory alerts.

## Repository Review

Detailed findings, screenshot rationale, recruiter review, ecommerce feature matrix, and final scoring are available in [docs/repository-showcase-report.md](docs/repository-showcase-report.md).

Final documentation score target: **9/10**.
