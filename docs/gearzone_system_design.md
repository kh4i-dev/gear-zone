# GearZone System Analysis and Design

This document consolidates the project requirements, architecture, database design, UML diagrams, testing notes, and future direction for GearZone. It is synchronized with the current Next.js and Prisma implementation.

## 1. Project Overview

GearZone is an e-commerce system for gaming gear such as keyboards, mice, headsets, monitors, and PC accessories. The system focuses on product discovery, stock visibility, cart checkout, order tracking, and an admin panel for daily store operation.

### Business Goals

- Help customers browse, search, filter, and buy gaming gear quickly.
- Keep stock and sold count consistent when orders are created.
- Provide an admin panel for managing products, inventory, orders, users, banners, video, contact information, and store settings.
- Keep the implementation simple enough for local development while documenting the production direction clearly.

### Main Actors

| Actor | Role |
|:--|:--|
| Customer | Browses products, manages cart, places orders, tracks order status. |
| Admin | Manages products, inventory, orders, users, and system settings. |
| Payment configuration | Provides QR/link information for bank or MoMo payment display. |

## 2. Functional Requirements

| Module | Main Functions |
|:--|:--|
| Authentication | Register, login, logout, maintain JWT session, protect admin routes. |
| Product catalog | List products, filter/search, view product detail, show stock and sold count. |
| Cart | Add/remove items, update quantity, calculate total price on the client. |
| Checkout | Validate login, validate stock, create order, create order items, update stock. |
| Orders | Customer order history, admin status management, payment waiting timeout. |
| Admin products | Create, update, delete products and upload product images. |
| Admin users | View/search members and roles. |
| Settings | Configure accent color, hero/video, ticker, contact, payment link, SEO/category data. |

## 3. Technical Architecture

GearZone uses a practical 3-tier architecture:

| Layer | Implementation |
|:--|:--|
| Presentation | Next.js App Router, React, Tailwind CSS, storefront pages and admin pages. |
| Application | Next.js API routes for auth, products, categories, orders, admin, settings, uploads. |
| Data | Prisma ORM with SQLite for local development; PostgreSQL/MySQL recommended for production. |

```mermaid
flowchart TB
    subgraph Client["Presentation Layer"]
        Storefront["Storefront UI"]
        AdminPanel["Admin Panel"]
        Browser["Web Browser"]
    end

    subgraph App["Application Layer - Next.js"]
        Pages["App Router Pages"]
        API["API Routes"]
        Auth["Auth Module"]
        Product["Product Module"]
        Order["Order Module"]
        Settings["Settings Module"]
        Cart["CartProvider / localStorage"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma ORM"]
        DB[("SQLite dev / PostgreSQL or MySQL production")]
        Uploads["public/uploads or object storage"]
        SettingStore[("Setting key-value records")]
    end

    Storefront --> Pages
    AdminPanel --> Pages
    Browser --> Pages
    Pages --> API
    Pages --> Cart
    API --> Auth
    API --> Product
    API --> Order
    API --> Settings
    Auth --> Prisma
    Product --> Prisma
    Order --> Prisma
    Settings --> Prisma
    Prisma --> DB
    API --> Uploads
    Settings --> SettingStore
```

## 4. Database Design

The current database is defined in `prisma/schema.prisma`. There is no separate `Payment`, `Cart`, `CartItem`, or `Review` table at this stage.

```mermaid
erDiagram
    USER {
        string id PK
        string username UK
        string email UK "nullable"
        string name
        string password
        string role
        string phone UK
        string address "nullable"
        datetime createdAt
        datetime updatedAt
    }

    CATEGORY {
        string id PK
        string name UK
    }

    PRODUCT {
        string id PK
        string name
        string description "nullable"
        string imageUrl "nullable"
        float price
        float oldPrice "nullable"
        int stock
        int soldCount
        string categoryId FK "nullable"
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        string id PK
        string userId FK
        string status
        float totalAmount
        string shippingName "nullable"
        string shippingPhone "nullable"
        string shippingAddress "nullable"
        string shippingCccd "nullable"
        string paymentMethod "nullable"
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
    }

    SETTING {
        string key PK
        string value
    }

    USER ||--o{ ORDER : "places"
    CATEGORY ||--o{ PRODUCT : "classifies"
    ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "referenced by"
```

### Table Notes

| Table | Purpose |
|:--|:--|
| `User` | Stores customer/admin account data. `username` and `phone` are required unique fields; `email` is optional unique. |
| `Category` | Groups products into product categories. |
| `Product` | Stores product information, price, image, stock, and sold count. |
| `Order` | Stores checkout result, shipping information, status, and selected payment method. |
| `OrderItem` | Stores product lines inside an order. Deleted with its parent order. |
| `Setting` | Stores configurable shop data as key-value records. |

### Implementation Notes

- Cart data is handled by `CartProvider` and browser `localStorage`.
- Payment is represented by `Order.paymentMethod` and settings values for QR/link display.
- Product review data on the product detail page is display/mock data, not persisted in the database.

## 5. UML and Workflow Diagrams

### Use Case Diagram

```mermaid
flowchart LR
    Customer["Customer"]
    Admin["Admin"]
    Payment["Payment config"]

    Login(("Register / Login"))
    Browse(("Browse and search products"))
    Detail(("View product detail"))
    CartUC(("Manage cart"))
    Checkout(("Place order"))
    Track(("Track orders"))

    ProductAdmin(("Manage products"))
    InventoryAdmin(("Manage inventory"))
    OrderAdmin(("Manage orders"))
    UserAdmin(("Manage users"))
    SettingAdmin(("Configure shop settings"))
    PaymentDisplay(("Display QR/link payment"))

    Customer --> Login
    Customer --> Browse
    Customer --> Detail
    Customer --> CartUC
    Customer --> Checkout
    Customer --> Track

    Admin --> ProductAdmin
    Admin --> InventoryAdmin
    Admin --> OrderAdmin
    Admin --> UserAdmin
    Admin --> SettingAdmin

    Checkout -.-> PaymentDisplay
    Payment --> PaymentDisplay
```

### Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String username
        +String email?
        +String name
        +String password
        +String role
        +String phone
        +String address?
    }

    class Category {
        +String id
        +String name
    }

    class Product {
        +String id
        +String name
        +String description?
        +String imageUrl?
        +Float price
        +Float oldPrice?
        +Int stock
        +Int soldCount
        +String categoryId?
    }

    class Order {
        +String id
        +String userId
        +String status
        +Float totalAmount
        +String shippingName?
        +String shippingPhone?
        +String shippingAddress?
        +String shippingCccd?
        +String paymentMethod?
    }

    class OrderItem {
        +String id
        +String orderId
        +String productId
        +Int quantity
        +Float price
    }

    class Setting {
        +String key
        +String value
    }

    User "1" --> "0..*" Order
    Category "1" --> "0..*" Product
    Order "1" --> "1..*" OrderItem
    Product "1" --> "0..*" OrderItem
```

### Checkout Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant UI as Web UI / Cart
    participant Auth as Auth API
    participant OrderAPI as Order API
    participant DB as Prisma Database
    participant Pay as Payment Display

    Customer->>UI: Review cart and shipping details
    UI->>Auth: Check current session
    Auth-->>UI: Return current user
    UI->>OrderAPI: POST /api/orders
    OrderAPI->>DB: Count active pending orders
    OrderAPI->>DB: Check product stock
    alt Stock is not enough
        OrderAPI-->>UI: Return stock error
        UI-->>Customer: Show checkout error
    else Stock is valid
        OrderAPI->>DB: Create Order and OrderItem records
        OrderAPI->>DB: Decrease stock and increase soldCount
        alt Bank payment with automation config
            OrderAPI-->>UI: Return AWAITING_PAYMENT order
            UI->>Pay: Show QR/link data from settings
        else COD or manual payment
            OrderAPI-->>UI: Return PENDING order
        end
        UI-->>Customer: Show order result
    end
```

### Checkout Activity

```mermaid
flowchart TD
    A([Start]) --> B[Browse product]
    B --> C[Add product to cart]
    C --> D[Open cart]
    D --> E{Logged in?}
    E -- No --> F[Login or register]
    F --> G[Enter shipping details]
    E -- Yes --> G
    G --> H[Choose COD / Bank / MoMo]
    H --> I[Submit checkout]
    I --> J{Stock available?}
    J -- No --> K[Show error and keep cart]
    J -- Yes --> L[Create order and order items]
    L --> M[Update stock and sold count]
    M --> N{Online payment wait?}
    N -- Yes --> O[Status AWAITING_PAYMENT]
    N -- No --> P[Status PENDING]
    O --> Q[Track order]
    P --> Q
    Q --> R([End])
```

### Order Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : COD / manual payment
    [*] --> AWAITING_PAYMENT : bank automation configured

    AWAITING_PAYMENT --> PENDING : payment confirmed
    AWAITING_PAYMENT --> CANCELLED : timeout after 5 minutes

    PENDING --> PROCESSING : admin confirms
    PENDING --> CANCELLED : admin cancels

    PROCESSING --> SHIPPING : hand over to delivery
    PROCESSING --> CANCELLED : admin cancels

    SHIPPING --> DELIVERED : delivered
    SHIPPING --> PROCESSING : retry / reprocess

    DELIVERED --> [*]
    CANCELLED --> [*]
```

## 6. Deployment View

```mermaid
flowchart TB
    subgraph Users["User Devices"]
        CustomerBrowser["Customer browser"]
        AdminBrowser["Admin browser"]
    end

    subgraph Server["VPS / Cloud Server"]
        Nginx["Nginx / HTTPS reverse proxy"]
        Next["Next.js server :3000"]
        Node["Node.js runtime"]
        Uploads["File storage / uploads"]
    end

    subgraph Data["Data Services"]
        DB[("PostgreSQL or MySQL production")]
        Redis[("Redis optional cache/session")]
    end

    CustomerBrowser -->|HTTPS :443| Nginx
    AdminBrowser -->|HTTPS :443| Nginx
    Nginx -->|proxy_pass| Next
    Next --> Node
    Node -->|Prisma TCP| DB
    Node -->|ioredis optional| Redis
    Node --> Uploads
```

## 7. Test Plan

| Case | Module | Expected Result |
|:--|:--|:--|
| TC01 | Auth | Register creates a user with hashed password. |
| TC02 | Auth | Duplicate username/phone/email is rejected. |
| TC03 | Auth | Login returns JWT session data. |
| TC04 | Product | Product list and search return correct results. |
| TC05 | Cart | Add/remove/update quantity updates local cart totals. |
| TC06 | Checkout | Valid checkout creates order and order items. |
| TC07 | Checkout | Out-of-stock checkout is rejected. |
| TC08 | Order | Admin can move order status through the lifecycle. |
| TC09 | Admin | Product CRUD and image upload work for admins only. |
| TC10 | Security | Non-admin users cannot access `/admin/*`. |

## 8. Limitations and Future Work

| Current Limitation | Future Direction |
|:--|:--|
| SQLite is used for local development. | Use PostgreSQL/MySQL in production. |
| Payment is stored as `Order.paymentMethod`; no `Payment` table yet. | Add a `Payment` model if webhook reconciliation is implemented. |
| Cart is client-side only. | Add persisted cart tables if cross-device cart is required. |
| Reviews are display/mock data. | Add `Review` model and moderation workflow. |
| Email notification is not a persisted workflow. | Add email service and notification logs. |

## 9. Source of Truth

- Database source of truth: `prisma/schema.prisma`
- Main application routes: `src/app`
- Domain components and providers: `src/components`
- API routes: `src/app/api`
- Visual diagram assets: `images/*.svg`
