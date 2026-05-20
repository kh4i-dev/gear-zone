# Gear Zone 🎮

**Nền tảng thương mại điện tử chuyên dụng cho thiết bị chơi game (Gaming Gear).**

## Công nghệ sử dụng

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** SQLite (Dev) / Prisma ORM
- **Authentication:** JWT (jose) + bcrypt
- **Payment:** VietQR, MoMo, PayOS, Sepay

## Kiến trúc hệ thống

### Use Case Diagram
![Use Case Diagram](images/use_case_gearzone.jpeg)
*Sơ đồ use case mô tả các tác nhân và chức năng chính của hệ thống.*

### Sơ đồ chức năng
![Sơ đồ chức năng](images/so_do_chuc_nang_gearzone.svg)
*Phân rã chức năng của hệ thống Gear Zone.*

### Sơ đồ thành phần
![Sơ đồ thành phần](images/so_do_thanh_phan_v2.svg)
*Các thành phần và mối quan hệ giữa chúng.*

---

## Luồng hoạt động (Workflow)

### Activity Diagram (Đặt hàng)
![Activity Diagram](images/activity_diagram_swimlane_gearzone.svg)
*Quy trình đặt hàng với swimlane phân chia trách nhiệm giữa các tác nhân.*

### Sequence Diagram (Đặt hàng)
![Sequence Diagram](images/so_do_tuan_tu_dat_hang_gearzone.svg)
*Luồng tương tác giữa các đối tượng trong quá trình đặt hàng.*

### State Diagram (Đơn hàng)
![State Diagram](images/so_do_trang_thai_don_hang_v2.svg)
*Các trạng thái của đơn hàng từ khi tạo đến khi hoàn tất.*

---

## Thiết kế dữ liệu

### Class Diagram
![Class Diagram](images/class_diagram_gearzone.svg)

Xem tương tác tại: [Class Diagram (HTML)](images/class_diagram_gearzone.html)

### Chi tiết UML
Xem thêm: [Mô tả UML](images/so_do_UML_gaming_gear.md)

---

## Triển khai

### Deployment Diagram
![Deployment Diagram](images/deployment_diagram_gearzone_v2.svg)
*Kiến trúc triển khai hệ thống Gear Zone.*

---

## Cài đặt & Chạy

```bash
# Cài đặt dependencies
npm install

# Tạo database
npx prisma db push

# Seed dữ liệu mẫu
npx prisma db seed

# Chạy dev
npm run dev
```

Truy cập: `http://localhost:3000`
