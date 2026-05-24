# 📊 Hệ Thống Sơ Đồ UML GearZone

Tài liệu này đặc tả chi tiết về cấu trúc tĩnh và hành vi động của hệ thống **GearZone** thông qua các sơ đồ UML (Unified Modeling Language) được xây dựng bằng cú pháp Mermaid JS.

---

## 1. Sơ Đồ Lớp (Class Diagram)

Sơ đồ lớp mô tả cấu trúc tĩnh của hệ thống, chỉ rõ các lớp đối tượng, các thuộc tính, phương thức và mối quan hệ giữa chúng (kế thừa, kết hợp, phụ thuộc):

```mermaid
classDiagram
    class User {
        +String id
        +String name
        +String email
        +String password
        +String role
        +String phone
        +String address
        +login() Bool
        +logout() Bool
        +updateProfile() Bool
    }
    
    class Product {
        +String id
        +String name
        +Float price
        +Float oldPrice
        +Int stock
        +Int soldCount
        +String description
        +updateStock(Int qty) Bool
    }
    
    class Category {
        +String id
        +String name
        +getProducts() List
    }
    
    class Order {
        +String id
        +String userId
        +String status
        +Float totalAmount
        +String shippingName
        +String shippingPhone
        +String shippingAddress
        +String paymentMethod
        +createOrder() Bool
        +cancelOrder() Bool
        +updateStatus(String newStatus) Bool
    }
    
    class OrderItem {
        +String id
        +String orderId
        +String productId
        +Int quantity
        +Float price
        +calculateSubtotal() Float
    }
    
    class Setting {
        +String key
        +String value
    }

    %% Relationships
    User "1" --> "0..*" Order : "đặt và sở hữu"
    Category "1" --> "0..*" Product : "phân loại"
    Order "1" --> "1..*" OrderItem : "chi tiết dòng hàng"
    Product "1" --> "0..*" OrderItem : "được tham chiếu"
```

---

## 2. Sơ Đồ Tuần Tự Đặt Hàng (Sequence Diagram)

Sơ đồ tuần tự thể hiện sự tương tác theo trình tự thời gian giữa các tác nhân và đối tượng khi thực hiện quy trình nghiệp vụ phức tạp nhất: **Quy trình đặt hàng**:

```mermaid
sequenceDiagram
    actor KH as 👤 Khách hàng
    participant UI as 💻 Giao diện Web (Giỏ hàng)
    participant API as 🛡️ Order API Controller
    participant DB as 🗄️ Database (Prisma/SQLite)
    participant PAY as 💳 Cổng thanh toán (VietQR/MOMO)

    KH->>UI: Click nút "Xác nhận Đặt hàng"
    activate UI
    UI->>API: Gửi thông tin (cartItems, shippingDetails, paymentMethod)
    activate API
    
    API->>DB: Truy vấn thông tin sản phẩm và kiểm tra tồn kho (stock >= quantity)
    activate DB
    DB-->>API: Trả về trạng thái kho hàng khả dụng
    deactivate DB

    alt Kho không đủ hàng
        API-->>UI: Báo lỗi "Sản phẩm A đã hết hàng"
        UI-->>KH: Hiển thị thông báo điều chỉnh giỏ hàng
    else Kho khả dụng
        API->>DB: Tạo bản ghi Order & các dòng OrderItem (Transaction)
        activate DB
        API->>DB: Trừ số lượng tồn kho (stock - quantity) của sản phẩm
        DB-->>API: Phản hồi tạo đơn thành công (orderId)
        deactivate DB

        alt Phương thức thanh toán là Chuyển khoản (BANKING)
            API->>PAY: Yêu cầu khởi tạo mã QR thanh toán (QR Code API)
            activate PAY
            PAY-->>API: Trả về hình ảnh QR Code & nội dung chuyển khoản
            deactivate PAY
            API-->>UI: Trả mã đơn hàng kèm QR Code thanh toán
            UI-->>KH: Hiển thị mã QR thanh toán cho khách hàng quét
            KH->>PAY: Thực hiện chuyển khoản trên App Mobile Banking
            PAY-->>API: IPN / Webhook báo thanh toán thành công
            API->>DB: Cập nhật trạng thái đơn hàng (status = "PROCESSING")
        else Phương thức COD (Thanh toán khi nhận hàng)
            API-->>UI: Trả mã đơn hàng thành công trực tiếp
            UI-->>KH: Hiển thị màn hình xác nhận đặt hàng thành công
        end
    end
    
    deactivate API
    deactivate UI
```

---

## 3. Sơ Đồ Hoạt Động Mua Hàng (Activity Diagram)

Sơ đồ hoạt động biểu diễn luồng công việc (workflow) tuần tự, các rẽ nhánh điều kiện từ lúc người dùng bắt đầu truy cập đến lúc hoàn tất đơn mua hàng:

```mermaid
flowchart TD
    A([🏁 Bắt đầu]) --> B[Truy cập Website GearZone]
    B --> C[Tìm kiếm sản phẩm hoặc duyệt theo danh mục]
    C --> D[Xem trang chi tiết sản phẩm và thông số]
    D --> E{Thỏa mãn nhu cầu?}
    
    E -- Không --> C
    E -- Có --> F[Thêm sản phẩm vào Giỏ hàng]
    
    F --> G{Tiếp tục mua sắm?}
    G -- Có --> C
    G -- Không --> H[Truy cập trang Giỏ hàng]
    
    H --> I[Kiểm tra & Điều chỉnh số lượng sản phẩm]
    I --> J{Đã đăng nhập tài khoản?}
    
    J -- Chưa --> K[Đăng nhập / Đăng ký tài khoản mới]
    K --> L[Tiến hành Thanh toán]
    J -- Rồi --> L
    
    L --> M[Nhập thông tin nhận hàng & Số điện thoại]
    M --> N[Chọn phương thức thanh toán: COD hoặc Chuyển khoản]
    N --> O[Click Xác nhận Đặt hàng]
    O --> P[Hệ thống xử lý đơn hàng & Cập nhật kho]
    P --> Q[Theo dõi tiến độ đơn hàng tại trang Lịch sử]
    Q --> R([🏁 Kết thúc])

    style A fill:#4caf50,stroke:#388e3c,color:#fff
    style R fill:#f44336,stroke:#d32f2f,color:#fff
    style E fill:#ff9800,stroke:#f57c00,color:#fff
    style G fill:#ff9800,stroke:#f57c00,color:#fff
    style J fill:#ff9800,stroke:#f57c00,color:#fff
```

---

## 4. Sơ Đồ Trạng Thái Đơn Hàng (State Diagram)

Sơ đồ trạng thái mô tả vòng đời của một Đơn hàng trong cơ sở dữ liệu, biểu diễn các trạng thái tĩnh và các sự kiện gây ra sự chuyển dịch trạng thái:

```mermaid
stateDiagram-v2
    [*] --> ChoXacNhan : Khách tạo đơn thành công (PENDING)
    
    ChoXacNhan --> DangXuLy : Admin kiểm kho & xác nhận đơn (PROCESSING)
    ChoXacNhan --> DaHuy : Khách hàng tự hủy / Admin hủy đơn (CANCELLED)
    
    DangXuLy --> DangGiao : Bàn giao cho đơn vị vận chuyển (SHIPPING)
    DangXuLy --> DaHuy : Admin hủy do hết hàng đột xuất
    
    DangGiao --> DaGiao : Giao hàng thành công cho khách (DELIVERED)
    DangGiao --> DangXuLy : Trả hàng về do giao thất bại (chuyển xử lý lại)
    
    DaGiao --> HoanThanh : Khách ấn đã nhận hàng hoặc quá thời gian tự động (COMPLETED)
    
    DaHuy --> [*]
    HoanThanh --> [*]

    state ChoXacNhan {
        [*] --> Pending
    }
    state DangXuLy {
        [*] --> Processing
    }
    state DangGiao {
        [*] --> Shipping
    }
    state DaGiao {
        [*] --> Delivered
    }
    state DaHuy {
        [*] --> Cancelled
    }
```

---

> [!TIP]
> **Tài liệu tiếp theo**: Mời xem [5. Kiểm Thử & Đánh Giá](file:///e:/my-project/gear-zone/docs/testing_and_conclusion.md) để xem bảng ma trận kiểm thử phần mềm cho toàn bộ các quy trình trên.
