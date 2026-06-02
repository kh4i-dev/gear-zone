# Giao tiếp API (API Contracts)

Hệ thống sử dụng Next.js Route Handlers (`/api/*`). Pattern chung cho response của mọi API:

```typescript
{
  "data": { ... },     // Chứa payload thực tế (nếu thành công)
  "error": "...",      // Thông báo lỗi (nếu thất bại)
  "meta": { ... }      // Pagination, count, v.v (tùy chọn)
}
```

## Các API Endpoints chính

### 1. Products `/api/products`
- `GET /api/products`: Lấy danh sách sản phẩm (hỗ trợ phân trang, filter `categoryId`, `brandId`, `search`).
- `GET /api/products/:id`: Chi tiết 1 sản phẩm kèm `variants`, `images`, `options`.

### 2. Cart `/api/cart`
- `GET /api/cart`: Lấy giỏ hàng hiện tại của User.
- `POST /api/cart`: Thêm item.
  - *Body*: `{ productId, variantId, quantity }`
- `PUT /api/cart`: Cập nhật số lượng item.
- `DELETE /api/cart/:itemId`: Xóa item khỏi giỏ.

### 3. Orders `/api/orders`
- `POST /api/orders`: Tạo đơn hàng mới từ Cart.
  - *Body*: `{ shippingName, shippingPhone, shippingAddress, paymentMethod, internalNote }`
- `GET /api/orders`: Danh sách lịch sử đơn hàng của User.
- `GET /api/orders/:id`: Chi tiết 1 đơn hàng cụ thể.

### 4. Admin Products `/api/admin/products`
*(Yêu cầu Auth Role = ADMIN)*
- `POST /api/admin/products`: Tạo mới sản phẩm.
- `PUT /api/admin/products/:id`: Cập nhật.
- `PUT /api/admin/products/:id/variants`: Batch update các variants (giá, tồn kho).

### 5. Admin Orders `/api/admin/orders`
- `PATCH /api/admin/orders/:id/status`: Chuyển trạng thái đơn.
  - *Body*: `{ status: "PROCESSING" | "SHIPPING" | "COMPLETED" | "CANCELLED", note?: "Lý do" }`

### 6. Settings `/api/settings`
- `GET /api/settings`: Lấy toàn bộ cấu hình public (logo url, contact hotline).
- `PUT /api/admin/settings`: Batch update settings (Admin only).

## Security & Rate Limiting
- Các endpoint `/api/auth/*` và `/api/orders` (POST) nên gắn thư viện rate-limit (VD: `upstash/ratelimit` hoặc LRU cache) để chống spam.
- Validation: Luôn sử dụng Zod schema để validate input body/query parameter trước khi query database.
