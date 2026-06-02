# Luồng Quản trị (Admin Flows)

Tài liệu này mô tả các luồng nghiệp vụ cơ bản trên trang Admin (CMS) của Blueprint.

## 1. Product Management
**Mục đích:** Admin tạo hoặc chỉnh sửa sản phẩm và cấu hình các biến thể (variants).
**Flow:**
1. Admin vào `Dashboard > Products > Add New`.
2. Nhập thông tin chung (Tên, Mô tả, Category, Brand, Specs dạng key-value).
3. Upload thư viện ảnh (Kéo thả).
4. Khai báo các Option (VD: Option 1 = "Màu sắc" với giá trị "Đen, Trắng"; Option 2 = "Switch" với giá trị "Red, Blue").
5. Hệ thống tự động sinh ra ma trận ProductVariant (Đen-Red, Trắng-Blue...).
6. Admin điền giá, SKU, stock cho từng variant cụ thể.
7. Click `Lưu` -> Lưu vào DB.

## 2. Order Fulfillment
**Mục đích:** Xử lý đơn hàng do khách đặt.
**Flow:**
1. Khách đặt hàng -> Trạng thái đơn `PENDING`.
2. Admin vào `Dashboard > Orders`, lọc các đơn `PENDING`.
3. Xem chi tiết thông tin thanh toán, địa chỉ. Nếu khách trả COD, admin có thể cần gọi điện xác nhận.
4. Admin nhấn chuyển trạng thái sang `PROCESSING` (Đang chuẩn bị hàng). (Hệ thống trừ tồn kho tại bước này hoặc bước PENDING tùy logic kinh doanh).
5. Khi giao cho đơn vị vận chuyển, admin cập nhật mã vận đơn vào Note và chuyển trạng thái `SHIPPING`.
6. Khi có xác nhận giao thành công, admin đổi thành `COMPLETED`.
7. **Lưu ý:** Việc chuyển trạng thái sẽ tạo ra một record trong `OrderTimeline` ghi nhận ai (actor) đã thao tác.

## 3. Inventory Management
**Mục đích:** Kiểm soát lượng hàng tồn kho.
**Flow:**
1. Admin vào `Dashboard > Inventory`.
2. Bảng hiển thị toàn bộ `ProductVariant` kèm số lượng `stock`.
3. Có bộ lọc các biến thể "Sắp hết hàng" (ví dụ: stock <= 5).
4. Admin có thể nhập nhanh số lượng stock mới ngay trên bảng (Inline edit) và nhấn `Lưu`.

## 4. System Settings
**Mục đích:** Thay đổi cấu hình động của shop.
**Flow:**
1. Admin vào `Dashboard > Settings`.
2. Form gồm các tab: General (Contact, Social), Policy (Return, Warranty), Layout (Hero Ticker, Notification banner).
3. Sau khi lưu, Next.js cache sẽ bị vô hiệu hóa (Revalidate tag) để Storefront hiển thị giá trị mới ngay lập tức mà không cần rebuild.
