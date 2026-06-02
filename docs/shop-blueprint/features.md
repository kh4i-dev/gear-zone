# Phân loại Tính năng (Features Classification)

Dưới đây là các tính năng chuẩn hóa được rút ra từ hệ thống, phân loại theo mức độ quan trọng.

## 1. Core MVP (Must-have)
Những tính năng bắt buộc để một shop ecommerce hoạt động:
- **Storefront**: Homepage, Header (Navbar), Footer.
- **Product Catalog**: Hiển thị danh sách sản phẩm (có filter theo category, brand).
- **Product Detail (PDP)**: Thông tin sản phẩm, Thư viện ảnh (Gallery), Lựa chọn biến thể (Variants).
- **Cart**: Thêm vào giỏ hàng, cập nhật số lượng, xóa sản phẩm.
- **Checkout**: Nhập thông tin giao hàng, chọn phương thức thanh toán.
- **Orders**: Theo dõi trạng thái đơn hàng (Pending, Processing, Completed, Cancelled).
- **Auth**: Đăng nhập, Đăng ký (Email/Password, JWT/Session).

## 2. Growth / Conversion (Tăng tỷ lệ chuyển đổi)
- **Product Reviews**: Khách hàng đánh giá sản phẩm (Rating, Comment).
- **Floating Contact Widget**: Chat nhanh (Zalo, Messenger, Hotline).
- **Product Row Carousel**: Slider sản phẩm nổi bật/bán chạy trên Homepage.
- **Discount/Sale Prices**: Hiển thị giá cũ (gạch ngang) và giá sale.

## 3. Admin Ops (Vận hành)
- **Dashboard**: Thống kê doanh thu, đơn hàng mới, top sản phẩm.
- **Product Management**: Create/Read/Update/Delete (CRUD) sản phẩm.
- **Variant & Option Editor**: Quản lý màu sắc, kích cỡ, SKU, stock riêng biệt.
- **Inventory Management**: Kiểm soát và cảnh báo hết hàng.
- **Order Management**: Chuyển trạng thái đơn, xem chi tiết (Timeline).
- **Settings**: Cấu hình phí ship, policy, thông tin liên hệ.
- **Image Upload**: Upload ảnh lên S3/Cloudinary.

## 4. Realtime / Advanced
- **Social Proof Realtime**: Hiển thị popup "Khách hàng X vừa mua sản phẩm Y".
- **Hero Ticker/Live Feed**: Dòng chữ chạy thông báo khuyến mãi.
- **Telegram/Discord Notifications**: Bắn log/thông báo khi có đơn hàng mới qua webhook.

## 5. Future Scale (Cần phát triển cho hệ thống lớn)
- Multi-currency / Multi-language.
- Abandoned Cart Recovery (Gửi email nhắc nhở).
- Advanced Promotion Engine (Buy 1 Get 1, Voucher Codes).
- ElasticSearch / Algolia cho thanh tìm kiếm thông minh.
