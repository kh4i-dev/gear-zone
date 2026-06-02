# Luồng Khách hàng (Storefront Flows)

Tài liệu này mô tả hành trình mua sắm tiêu chuẩn của một User trên Blueprint.

## 1. Duyệt Sản phẩm (Browsing)
1. User vào **Homepage**. Thấy danh mục nổi bật, hero banner, và các hàng sản phẩm bán chạy (ProductRowCarousel).
2. Tương tác với **Hero Ticker** để xem tin khuyến mãi.
3. User bấm vào menu hoặc tìm kiếm để vào **Product Catalog**. Trang này hiển thị grid sản phẩm với bộ lọc theo `Category` và `Brand`.
4. Nếu có sự kiện realtime (ai đó vừa mua hàng), góc màn hình sẽ hiện popup **SocialProofToast**.

## 2. Xem Chi tiết Sản phẩm (Product Detail Page - PDP)
1. User nhấn vào 1 sản phẩm.
2. Bên trái hiển thị **Image Gallery**. Bên phải là thông tin: Tên, Giá, `Specs`, và các `Options`.
3. Khi User chọn Option (VD: Chọn Màu "Đen"), hệ thống sẽ query tìm ra `Variant` tương ứng.
4. UI cập nhật Giá, Trạng thái Tồn kho, và đổi ảnh Gallery về ảnh đại diện của Variant đó.
5. User nhập số lượng và nhấn "Thêm vào giỏ".

## 3. Quản lý Giỏ hàng (Cart)
1. Giỏ hàng có thể là trang `/cart` hoặc Sidebar (Cart Drawer).
2. Hiển thị danh sách `CartItem`. Lưu ý: Giỏ hàng nhóm theo `VariantId` chứ không phải `ProductId` thuần. (Ví dụ mua 2 con chuột giống nhau nhưng 1 đen 1 trắng là 2 dòng khác biệt).
3. User có thể tăng giảm số lượng hoặc xóa. Frontend gọi API, Backend tính lại tổng tiền.

## 4. Checkout
1. User nhấn nút "Thanh toán".
2. Khách vãng lai (Guest) cần điền form giao hàng. Khách đã Đăng nhập sẽ tự fill địa chỉ.
3. Chọn phương thức thanh toán (COD, Chuyển khoản, hoặc Cổng thanh toán - tính năng mở rộng).
4. Kiểm tra lại thông tin và xác nhận.
5. Hệ thống gọi POST `/api/orders`:
   - Tạo Order.
   - Di chuyển CartItem sang OrderItem (snapshot giá tại thời điểm hiện tại).
   - Xóa Cart của User.
   - Bắn thông báo (Telegram/Email) cho Admin.
6. Chuyển hướng tới trang "Cảm ơn" (Order Success).
