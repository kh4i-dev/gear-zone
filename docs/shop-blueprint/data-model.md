# Mô hình Dữ liệu (Data Model)

Mô hình dữ liệu dựa trên Prisma, được thiết kế để mở rộng và hỗ trợ sản phẩm có nhiều biến thể.

## 1. User & Auth
- **User**: Lưu thông tin khách hàng và admin (`role`: "USER" | "ADMIN").
  - *Fields*: `id`, `username`, `email`, `password`, `phone`, `address`.

## 2. Product Core
- **Category & Brand**: Phân loại sản phẩm.
- **Product**: Thực thể chính.
  - *Fields*: `id`, `name`, `price` (giá gốc), `stock`, `status` (ACTIVE/DRAFT), `specs` (JSON cho attributes tự do).
- **ProductImage**: Hình ảnh của sản phẩm.
  - *Fields*: `url`, `isPrimary`, `sortOrder`, `variantId` (nếu ảnh thuộc 1 màu cụ thể).

## 3. Product Variants (Biến thể)
Cơ chế quản lý thuộc tính đa chiều (VD: Màu sắc x Kích thước).
- **ProductOption**: Nhóm thuộc tính (VD: "Màu sắc").
- **ProductOptionValue**: Giá trị cụ thể (VD: "Đen", "Trắng").
- **ProductVariant**: Một tổ hợp bán được (SKU vật lý).
  - *Fields*: `sku`, `price` (override giá), `stock`, `imageUrl`.
- **ProductVariantOptionValue**: Bảng trung gian map Variant với các Option Value của nó.

## 4. Cart & Checkout
- **Cart**: Giỏ hàng lưu trữ (gắn với `userId`).
- **CartItem**: Món hàng trong giỏ.
  - *Fields*: `productId`, `variantId`, `quantity`.

## 5. Order Management
- **Order**: Hóa đơn mua hàng.
  - *Fields*: `status`, `totalAmount`, `shippingFee`, `discountAmount`, `paymentMethod`.
- **OrderItem**: Chi tiết các món hàng mua.
  - *Fields*: Lấy snapshot `price` tại thời điểm mua, `productId`, `variantId`.
- **OrderTimeline**: Ghi log lịch sử thay đổi trạng thái (Audit trail).
  - *Fields*: `action`, `actor`, `previousStatus`, `nextStatus`.

## 6. Ops & Others
- **Setting**: Key-Value (String -> String) cho cấu hình động.
- **Review**: Đánh giá đơn hàng.
  - *Constraints*: Unique constraint trên `[userId, productId, orderId]` (chỉ được review khi đã mua).
- **ActivityEvent & AuditLog**: Lưu log hành vi hệ thống (tạo đơn, admin xóa sản phẩm).

### Indexing quan trọng
- `Product(categoryId, brandId)` cho việc filter.
- `ProductVariant(productId, isActive)` để query nhanh biến thể.
- `Order(userId)` cho màn lịch sử mua hàng.
