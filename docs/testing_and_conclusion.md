# 🧪 Kiểm Thử Hệ Thống & Đánh Giá GearZone

Tài liệu này đặc tả quy trình kiểm thử chất lượng phần mềm, liệt kê danh sách các ca kiểm thử chính (Test Cases) nhằm xác minh tính ổn định, độ bảo mật và tính chính xác của hệ thống **GearZone**, đi kèm với tổng kết đánh giá và định hướng phát triển tương lai.

---

## 1. Kế Hoạch & Mục Tiêu Kiểm Thử

Hệ thống được thực hiện kiểm thử chức năng (Functional Testing) và kiểm thử luồng nghiệp vụ (End-to-End Testing) để đảm bảo:
1. **Tính chính xác**: Các chức năng đăng ký, đăng nhập, tìm kiếm, giỏ hàng, đặt hàng hoạt động đúng nghiệp vụ.
2. **Tính nhất quán**: Số lượng sản phẩm tồn kho được cập nhật chính xác (giảm trừ) ngay khi khách đặt hàng thành công.
3. **Bảo mật**: Chỉ có tài khoản có vai trò `ADMIN` mới có thể truy cập khu vực Admin Panel (`/admin/*`) để thực hiện các hành động quản trị. Mật khẩu lưu trữ luôn luôn được mã hóa một chiều.
4. **Trải nghiệm responsive**: Website hoạt động tốt trên các kích thước màn hình phổ biến bao gồm PC (Desktop), Laptop và Điện thoại (Mobile).

---

## 2. Bảng Ma Trận Kiểm Thử Chức Năng (Test Cases Matrix)

| Mã Case | Phân hệ | Chức năng kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Trạng thái thực tế | Kết luận |
|:---|:---|:---|:---|:---|:---|:---|
| **TC01** | `User` | Đăng ký tài khoản mới | Email chưa tồn tại, mật khẩu hợp lệ | Tạo tài khoản thành công, mật khẩu được mã hóa bcrypt trong database | Đạt (Pass) | Thành công |
| **TC02** | `User` | Đăng ký trùng email | Email đã tồn tại trong hệ thống | Báo lỗi email đã đăng ký, không tạo tài khoản mới | Đạt (Pass) | Thành công |
| **TC03** | `Auth` | Đăng nhập đúng thông tin | Email và mật khẩu chính xác | Đăng nhập thành công, cấp token JWT, chuyển hướng về trang chủ | Đạt (Pass) | Thành công |
| **TC04** | `Auth` | Đăng nhập sai thông tin | Email đúng, mật khẩu sai | Báo lỗi "Mật khẩu không chính xác", giữ lại trang đăng nhập | Đạt (Pass) | Thành công |
| **TC05** | `Product`| Tìm kiếm sản phẩm | Nhập từ khóa "bàn phím" | Trả về danh sách các sản phẩm chứa từ khóa trong tên hoặc mô tả | Đạt (Pass) | Thành công |
| **TC06** | `Cart` | Thêm sản phẩm vào giỏ | Sản phẩm còn hàng, số lượng = 1 | Sản phẩm xuất hiện trong giỏ, số lượng tăng lên, tổng tiền cập nhật đúng | Đạt (Pass) | Thành công |
| **TC07** | `Order` | Đặt hàng thành công | Nhập địa chỉ nhận, số điện thoại, chọn COD | Tạo đơn hàng mới trạng thái `PENDING`, giảm stock sản phẩm, làm sạch giỏ hàng | Đạt (Pass) | Thành công |
| **TC08** | `Order` | Hủy đơn hàng | Khách hàng bấm hủy đơn khi đang `PENDING` | Trạng thái đơn chuyển sang `CANCELLED`, hoàn trả số lượng stock cho sản phẩm | Đạt (Pass) | Thành công |
| **TC09** | `Admin` | CRUD sản phẩm (Admin) | Thêm sản phẩm mới với thông tin hợp lệ | Sản phẩm mới hiển thị ngay lập tức trên trang chủ và danh sách admin | Đạt (Pass) | Thành công |
| **TC10** | `Admin` | Bảo mật phân quyền | Người dùng `USER` truy cập `/admin` | Middleware chặn lại, trả về mã lỗi 403 hoặc chuyển hướng về trang chủ | Đạt (Pass) | Thành công |

---

## 3. Đánh Giá Kết Quả Thực Hiện

### 3.1 Ưu Điểm Đạt Được
- **Công nghệ hiện đại**: Mã nguồn được tổ chức rất mạch lạc dựa trên Next.js 15 và Prisma ORM giúp dễ bảo trì và dễ triển khai lên đám mây.
- **Tính năng hoàn chỉnh**: Đáp ứng đầy đủ các quy trình nghiệp vụ của một website thương mại điện tử chuyên biệt về phụ kiện máy tính.
- **Trực quan hóa tài liệu**: Bộ tài liệu Markdown kết hợp sơ đồ Mermaid giúp lập trình viên tiếp theo nắm bắt hệ thống trong thời gian cực ngắn.

### 3.2 Hạn Chế Còn Tồn Tại
- Hệ thống thanh toán tự động hiện tại mới dừng ở mức cấu hình hiển thị mã QR và nhận diện thủ công, chưa kết nối trực tiếp IPN Webhook ngân hàng thực tế.
- Cơ sở dữ liệu hiện tại là SQLite - rất tốt cho môi trường thử nghiệm cục bộ nhưng cần chuyển đổi sang PostgreSQL/MySQL để đảm bảo tính chịu tải cao khi lượng truy cập lớn.

---

## 4. Định Hướng Phát Triển Tương Lai

Nhằm hoàn thiện và nâng cao tính chuyên nghiệp cho GearZone, hệ thống định hướng phát triển các module tiếp theo:

1. **Tích hợp cổng thanh toán trực tuyến tự động**: Kết nối với cổng thanh toán **VNPay, MoMo** hoặc **VietQR Pay** để nhận diện giao dịch tự động qua Webhook thời gian thực.
2. **Hệ thống thông báo thông minh**: Gửi Email xác nhận tự động (Nodemailer/SendGrid) cho khách hàng khi đặt hàng, giao hàng hoặc hủy đơn.
3. **Mở rộng mô hình dữ liệu**: Bổ sung bảng đánh giá sản phẩm (Reviews), bảng mã giảm giá (Coupons/Vouchers) và tích hợp chức năng so sánh thông số kỹ thuật trực tiếp giữa các dòng Gaming Gear.
4. **Tối ưu hóa SEO & Performance**: Cấu hình cơ chế Server-Side Rendering (SSR) nâng cao cho trang chi tiết sản phẩm và nén ảnh tự động để nâng điểm Core Web Vitals của Google.
