# Shop Blueprint: Reusable Ecommerce Platform

Bộ tài liệu này định nghĩa một cấu trúc tiêu chuẩn (blueprint) để xây dựng hoặc nhân bản một hệ thống Ecommerce dựa trên codebase hiện tại của **GearZone**. Mục đích là tách biệt logic dùng chung (core features, admin, checkout) ra khỏi các phần đặc thù của thương hiệu.

## Mục lục Tài liệu

1. [Tính năng (Features)](./features.md)
2. [Mô hình Dữ liệu (Data Model)](./data-model.md)
3. [Giao tiếp API (API Contracts)](./api-contracts.md)
4. [Luồng Quản trị (Admin Flows)](./admin-flows.md)
5. [Luồng Khách hàng (Storefront Flows)](./storefront-flows.md)
6. [Realtime & Notifications](./realtime-notifications.md)
7. [Triển khai (Deployment)](./deployment.md)
8. [Bảo mật (Security Checklist)](./security-checklist.md)
9. [Cấu hình Tái sử dụng (Reusable Config)](./reusable-config.md)

## Gap Analysis (Phân tích khoảng cách)

Dựa trên codebase GearZone, đây là các phần cần chú ý khi biến hệ thống thành Blueprint tái sử dụng:

### 1. Tính năng có UI nhưng cần hoàn thiện Backend
- **Payment Gateway Placeholder**: Flow thanh toán hiện tại phần lớn là mock hoặc chuyển khoản thủ công. Cần tích hợp VNPAY/MoMo thực tế.
- **Newsletter**: Cần webhook backend gắn với hệ thống gửi email (như Resend/Sendgrid) thay vì chỉ lưu email vào DB.

### 2. Tính năng cần Refactor để Reusable
- **Theme & Branding**: Logo, màu sắc chính, tên shop đang rải rác hoặc hardcode trong một số file layout. Cần dời vào một `shop-config.ts`.
- **Category & Filters**: GearZone chuyên về thiết bị điện tử nên có các spec riêng (polling rate, switch). Cần tạo cơ chế `Dynamic Attributes/Specs` để dùng cho ngành hàng khác (quần áo, mỹ phẩm).

### 3. Tính năng chưa Production-ready (Future Scale)
- **Email/SMS Notification**: Chưa có cơ chế gửi email tự động (Order Confirmation) hoàn chỉnh.
- **Queue/Background Jobs**: Việc gửi notification hoặc xử lý ảnh đang đồng bộ (synchronous). Cần BullMQ/Redis.

## Roadmap 3 Phase Đề Xuất

### Phase 1: Stabilize current shop
- Hoàn thiện luồng thanh toán thực tế (VNPAY/MoMo).
- Viết e2e tests (Playwright) cho các critical flows: Cart, Checkout, Login.
- Audit & fix N+1 queries trong Admin Dashboard và Product Catalog.

### Phase 2: Make reusable ecommerce blueprint
- Tách `shop-config.ts` (theme, logo, categories tĩnh).
- Refactor `RichTextEditor` và `ImageGallery` thành các component library độc lập.
- Migrate các hardcoded values (thông tin liên hệ, social links) vào bảng `Setting` (Database).
- Khởi tạo template repository chuẩn (clean fork).

### Phase 3: Add Redis/BullMQ/Realtime scaling
- Tích hợp Redis cho Caching (Next.js Cache, Session) và Realtime Socket.io (Social Proof, Activity Feed).
- Đưa tác vụ nặng (Resize Image, Gửi Email, Telegram Alert) vào Background Queue (BullMQ).
