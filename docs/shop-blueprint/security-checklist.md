# Bảo mật (Security Checklist)

Khi triển khai Blueprint, các khía cạnh bảo mật sau phải được tuân thủ nghiêm ngặt để bảo vệ dữ liệu khách hàng.

## 1. Authentication & Authorization
- **JWT / Session**: Sử dụng thư viện bảo mật tiêu chuẩn (NextAuth.js hoặc iron-session). Set cookie với thuộc tính `HttpOnly`, `Secure` (trên HTTPS), và `SameSite=Lax/Strict`.
- **Role-Based Access Control (RBAC)**: Middleware phải check cứng role `ADMIN` đối với mọi route `/admin/*` và `/api/admin/*`.

## 2. API Validation (Zod)
- Mọi dữ liệu POST/PUT/PATCH từ client gửi lên phải được validate bằng Zod schema trước khi tương tác với Prisma. Đề phòng Mass Assignment (cố tình truyền thêm field `role: "ADMIN"` lúc register).

## 3. Chống XSS (Cross-Site Scripting)
- Trình soạn thảo văn bản cho chi tiết sản phẩm (RichTextEditor) sẽ xuất ra mã HTML. Trước khi render HTML này ở Storefront (`dangerouslySetInnerHTML`), phải chạy qua trình dọn dẹp như `DOMPurify` để loại bỏ thẻ `<script>` độc hại.

## 4. Chống Spam / Abuse (Rate Limiting)
- Route đăng nhập (`/api/auth/login`) cần rate limit để chống Brute force.
- Route tạo đơn hàng (`/api/orders`) cần rate limit để tránh spam tạo đơn giả.
- Route đăng ký nhận tin (`/api/newsletter`) dễ bị lợi dụng để đẩy rác vào DB.

## 5. File Upload Safety
- Endpoint upload ảnh của Admin phải verify file extension (chỉ cho phép `.png, .jpg, .webp, .svg`).
- Check Max Size (VD: <= 5MB).
- Đổi tên file gốc thành UUID ngẫu nhiên trước khi lưu lên S3/Cloudinary để tránh lỗi override hoặc Path Traversal.

## 6. Logic Nghiệp vụ
- **Order Price Snapshot**: Khi tạo OrderItem, giá phải được backend copy từ bảng `ProductVariant.price` ở DB. Tuyệt đối không tin tưởng field `price` do Client tự gửi lên giỏ hàng.
- **Tồn kho (Race condition)**: Phải sử dụng Prisma Transaction (`$transaction`) khi trừ stock lúc đặt hàng thành công để tránh việc 2 khách hàng mua cùng 1 món hàng cuối cùng.
