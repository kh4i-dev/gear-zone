# Phân Tích & Thiết Kế Hướng Đối Tượng — Tài Liệu & Ví Dụ Web Bán Gaming Gear

---

## 1. Thống Kê Sơ Đồ Trong Tài Liệu

Tài liệu **"Phân tích thiết kế hướng đối tượng"** (179 trang) chứa tổng cộng **~126 hình/sơ đồ**, phân bổ theo từng loại UML như sau:

| Loại sơ đồ | Số lượng | Chương |
|---|---|---|
| Sơ đồ quy trình phát triển phần mềm (Waterfall, Tăng trưởng, Xoắn ốc) | 4 | Chương 1 |
| Sơ đồ ký hiệu UML cơ bản (lớp, đối tượng, gói, ràng buộc...) | ~23 | Chương 2 |
| **Biểu đồ ca sử dụng (Use Case Diagram)** | ~8 | Chương 3 |
| **Biểu đồ lớp (Class Diagram)** | ~14 | Chương 4 |
| **Biểu đồ trình tự (Sequence Diagram)** | ~6 | Chương 5 |
| **Biểu đồ trạng thái (State Diagram)** | ~5 | Chương 5 |
| **Biểu đồ hoạt động (Activity Diagram)** | ~3 | Chương 5 |
| **Biểu đồ cộng tác (Collaboration Diagram)** | ~24 | Chương 6 |
| **Biểu đồ thành phần & triển khai (Component/Deployment)** | ~4 | Chương 7 |
| Sơ đồ kiến trúc & cài đặt (code generation) | ~12 | Chương 7 |

> **Tổng: ~126 hình/sơ đồ** (đánh số từ Hình 1.1 → Hình 7.12)

---

## 2. Ví Dụ Áp Dụng: Website Bán Gaming Gear

**Hệ thống:** GearZone — website thương mại điện tử bán gaming gear (chuột, bàn phím, tai nghe, màn hình gaming) cho game thủ.

**Các tác nhân chính:**
- `KhachHang` — game thủ mua sản phẩm
- `Admin` — quản trị viên hệ thống
- `NhanVienKho` — nhân viên kho
- `HeThongThanhToan` — cổng thanh toán (VNPay, MoMo)

---

## 3. Biểu Đồ Ca Sử Dụng (Use Case Diagram)

```mermaid
graph TD
    subgraph System ["🎮 GearZone — Hệ thống bán Gaming Gear"]
        UC1(Đăng ký / Đăng nhập)
        UC2(Tìm kiếm sản phẩm)
        UC3(Xem chi tiết sản phẩm)
        UC4(Thêm vào giỏ hàng)
        UC5(Đặt hàng)
        UC6(Thanh toán online)
        UC7(Theo dõi đơn hàng)
        UC8(Viết đánh giá)
        UC9(Quản lý sản phẩm)
        UC10(Quản lý đơn hàng)
        UC11(Cập nhật kho)
        UC12(Xác nhận thanh toán)
    end

    KhachHang([👤 KhachHang]) --> UC1
    KhachHang --> UC2
    KhachHang --> UC3
    KhachHang --> UC4
    KhachHang --> UC5
    KhachHang --> UC6
    KhachHang --> UC7
    KhachHang --> UC8

    Admin([🔑 Admin]) --> UC9
    Admin --> UC10

    NhanVienKho([📦 NhanVienKho]) --> UC11
    NhanVienKho --> UC10

    HeThongThanhToan([💳 HeThongThanhToan]) --> UC12

    UC5 -.->|extend| UC6
    UC6 -.->|include| UC12
```

---

## 4. Biểu Đồ Lớp (Class Diagram)

```mermaid
classDiagram
    class KhachHang {
        +int maKH
        +String hoTen
        +String email
        +String soDienThoai
        +String diaChi
        +String matKhau
        +dangNhap() bool
        +dangXuat() void
        +capNhatThongTin() void
    }

    class SanPham {
        +int maSP
        +String tenSP
        +String thuongHieu
        +String danhMuc
        +double giaBan
        +int soLuongTon
        +String moTa
        +List~String~ hinhAnh
        +timKiem() List
        +xemChiTiet() SanPham
    }

    class GioHang {
        +int maGH
        +int maKH
        +List~ChiTietGioHang~ danhSach
        +themSanPham(maSP, soLuong) void
        +xoaSanPham(maSP) void
        +tinhTongTien() double
    }

    class ChiTietGioHang {
        +int maSP
        +int soLuong
        +double donGia
        +tinhThanhTien() double
    }

    class DonHang {
        +int maDH
        +int maKH
        +Date ngayDat
        +String trangThai
        +double tongTien
        +String diaChiGiao
        +datHang() bool
        +huyDon() bool
        +capNhatTrangThai(tt) void
    }

    class ChiTietDonHang {
        +int maDH
        +int maSP
        +int soLuong
        +double donGia
    }

    class ThanhToan {
        +int maTT
        +int maDH
        +String phuongThuc
        +double soTien
        +String trangThai
        +Date thoiGian
        +thucHienThanhToan() bool
        +xacNhanThanhToan() void
        +hoanTien() bool
    }

    class DanhGia {
        +int maDG
        +int maKH
        +int maSP
        +int soSao
        +String noiDung
        +Date ngayDang
        +guiDanhGia() void
    }

    KhachHang "1" --> "1" GioHang : sở hữu
    KhachHang "1" --> "0..*" DonHang : đặt
    KhachHang "1" --> "0..*" DanhGia : viết
    GioHang "1" --> "1..*" ChiTietGioHang : chứa
    DonHang "1" --> "1..*" ChiTietDonHang : gồm
    DonHang "1" --> "1" ThanhToan : có
    SanPham "1" --> "0..*" ChiTietGioHang : tham chiếu
    SanPham "1" --> "0..*" ChiTietDonHang : tham chiếu
    SanPham "1" --> "0..*" DanhGia : được đánh giá
```

---

## 5. Biểu Đồ Trình Tự (Sequence Diagram) — Ca Sử Dụng "Đặt Hàng & Thanh Toán"

```mermaid
sequenceDiagram
    actor KH as 👤 KhachHang
    participant UI as 🖥️ GioHangUI
    participant GH as GioHang
    participant DH as DonHang
    participant TT as ThanhToan
    participant HTTT as 💳 VNPay/MoMo

    KH->>UI: Nhấn "Đặt hàng"
    UI->>GH: layDanhSachGioHang(maKH)
    GH-->>UI: Trả về danh sách sản phẩm + tổng tiền

    UI->>KH: Hiển thị form xác nhận đơn hàng
    KH->>UI: Nhập địa chỉ giao hàng, chọn phương thức TT
    UI->>DH: taoMoiDonHang(maKH, diaChiGiao, chiTiet)
    DH-->>UI: Trả về maDH + trạng thái "Chờ thanh toán"

    UI->>TT: khoiTaoThanhToan(maDH, soTien, phuongThuc)
    TT->>HTTT: chuyenHuongThanhToan(thongTin)
    HTTT-->>KH: Hiển thị cổng thanh toán

    KH->>HTTT: Nhập thông tin & xác nhận
    HTTT-->>TT: callbackKetQua(trangThai, maGiaoDich)

    alt Thanh toán thành công
        TT->>DH: capNhatTrangThai("Đã thanh toán")
        TT-->>UI: Thông báo thành công
        UI-->>KH: Hiển thị trang xác nhận đơn hàng ✅
    else Thanh toán thất bại
        TT->>DH: capNhatTrangThai("Thanh toán thất bại")
        TT-->>UI: Thông báo lỗi
        UI-->>KH: Yêu cầu thử lại ❌
    end
```

---

## 6. Biểu Đồ Trạng Thái (State Diagram) — Vòng Đời Đơn Hàng

```mermaid
stateDiagram-v2
    [*] --> ChoDatHang : KhachHang tạo đơn

    ChoDatHang --> ChoThanhToan : Xác nhận đơn hàng
    ChoThanhToan --> DaThanhToan : Thanh toán thành công
    ChoThanhToan --> DaHuy : Thanh toán thất bại / Hủy

    DaThanhToan --> DangXuLy : Admin xác nhận
    DangXuLy --> DangGiao : NhanVienKho xuất kho
    DangGiao --> DaGiao : Đơn vị vận chuyển giao thành công
    DaGiao --> DaHoanThanh : KhachHang xác nhận nhận hàng

    DaThanhToan --> YeuCauHuy : KhachHang yêu cầu hủy
    DangXuLy --> YeuCauHuy : KhachHang yêu cầu hủy
    YeuCauHuy --> DaHuy : Admin đồng ý
    YeuCauHuy --> DangXuLy : Admin từ chối

    DaHuy --> HoanTien : Đã thanh toán trước đó
    HoanTien --> [*]
    DaHoanThanh --> [*]
```

---

## 7. Biểu Đồ Hoạt Động (Activity Diagram) — Quy Trình Tìm Kiếm & Mua Hàng

```mermaid
flowchart TD
    A([🚀 Bắt đầu]) --> B[Truy cập GearZone]
    B --> C{Đã đăng nhập?}
    C -- Chưa --> D[Đăng nhập / Đăng ký]
    D --> E[Tìm kiếm sản phẩm]
    C -- Rồi --> E

    E --> F[Xem danh sách kết quả]
    F --> G[Chọn sản phẩm]
    G --> H[Xem chi tiết & đánh giá]
    H --> I{Muốn mua?}
    I -- Không --> E
    I -- Có --> J[Thêm vào giỏ hàng]
    J --> K{Tiếp tục mua?}
    K -- Có --> E
    K -- Không --> L[Xem giỏ hàng]
    L --> M[Xác nhận đặt hàng]
    M --> N[Chọn phương thức thanh toán]
    N --> O[Thanh toán]
    O --> P{Thanh toán OK?}
    P -- Thất bại --> Q[Thông báo lỗi]
    Q --> N
    P -- Thành công --> R[Xác nhận đơn hàng qua email]
    R --> S[Theo dõi trạng thái đơn hàng]
    S --> T([🏁 Kết thúc])
```

---

## 8. Biểu Đồ Thành Phần (Component Diagram) — Kiến Trúc Hệ Thống

```mermaid
graph TB
    subgraph Client ["🌐 Client Layer"]
        WEB[Web Browser / React App]
        MOBILE[Mobile App]
    end

    subgraph API ["⚙️ API Gateway"]
        GW[API Gateway / Nginx]
    end

    subgraph Backend ["🖥️ Backend Services"]
        AUTH[AuthService\nĐăng nhập/JWT]
        PRODUCT[ProductService\nSản phẩm]
        ORDER[OrderService\nĐơn hàng]
        PAYMENT[PaymentService\nThanh toán]
        NOTI[NotificationService\nEmail/SMS]
    end

    subgraph DB ["🗄️ Database"]
        MYSQL[(MySQL\nDữ liệu chính)]
        REDIS[(Redis\nCache/Session)]
    end

    subgraph External ["🔌 External Services"]
        VNPAY[VNPay]
        MOMO[MoMo]
        SMTP[Email SMTP]
    end

    WEB --> GW
    MOBILE --> GW
    GW --> AUTH
    GW --> PRODUCT
    GW --> ORDER
    GW --> PAYMENT

    AUTH --> MYSQL
    AUTH --> REDIS
    PRODUCT --> MYSQL
    PRODUCT --> REDIS
    ORDER --> MYSQL
    PAYMENT --> MYSQL
    PAYMENT --> VNPAY
    PAYMENT --> MOMO
    ORDER --> NOTI
    NOTI --> SMTP
```

---

## 9. Biểu Đồ Triển Khai (Deployment Diagram)

```mermaid
graph TB
    subgraph User ["👤 Người dùng"]
        Browser[Web Browser]
        Phone[Điện thoại]
    end

    subgraph Cloud ["☁️ Cloud Server - AWS/VPS"]
        subgraph WebServer ["Web Server"]
            Nginx[Nginx\nReverse Proxy\n:443]
            ReactApp[React App\nStatic Files]
        end

        subgraph AppServer ["App Server"]
            NodeAPI[Node.js API\n:3000]
        end

        subgraph DataServer ["Database Server"]
            MySQL[(MySQL 8.0\n:3306)]
            RedisCache[(Redis Cache\n:6379)]
        end
    end

    subgraph Payment ["💳 Cổng Thanh Toán"]
        VNPayGW[VNPay Gateway]
        MoMoGW[MoMo Gateway]
    end

    Browser -->|HTTPS| Nginx
    Phone -->|HTTPS| Nginx
    Nginx --> ReactApp
    Nginx -->|/api/*| NodeAPI
    NodeAPI --> MySQL
    NodeAPI --> RedisCache
    NodeAPI -->|HTTP POST| VNPayGW
    NodeAPI -->|HTTP POST| MoMoGW
```

---

*Tài liệu tham khảo: "Phân tích thiết kế hướng đối tượng" — 179 trang, ~126 hình minh họa UML*
