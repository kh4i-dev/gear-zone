# 🌌 Tài Liệu Phân Tích Và Thiết Kế Hệ Thống GearZone

Chào mừng bạn đến với bộ tài liệu phân tích và thiết kế hệ thống **GearZone** - website thương mại điện tử chuyên cung cấp phụ kiện máy tính gaming trực tuyến. Tài liệu này được biên soạn đầy đủ bằng định dạng **Markdown** kết hợp **Mermaid JS** để trực quan hóa toàn bộ sơ đồ phân tích nghiệp vụ, dữ liệu và kiến trúc.

> [!NOTE]
> Bộ tài liệu này được cấu trúc hóa một cách khoa học để hỗ trợ việc đọc, bảo trì và phát triển dự án bằng AI cũng như con người. Tất cả các sơ đồ đều có thể chỉnh sửa trực tiếp thông qua cú pháp Mermaid.

---

## 📂 Danh Mục Tài Liệu Hệ Thống

Bộ tài liệu được chia thành các cấu phần chuyên biệt như sau:

| 📝 Tài liệu | 🎯 Nội dung chi tiết | Sơ đồ Mermaid đi kèm |
|:---|:---|:---|
| 📑 [1. Phân Tích Yêu Cầu & Nghiệp Vụ](file:///e:/my-project/gear-zone/docs/requirements.md) | Khảo sát hiện trạng, phân tích nghiệp vụ, mục tiêu dự án và phạm vi thực hiện. | Sơ đồ chức năng (Functional Flowchart), Sơ đồ Use Case tổng quát. |
| 🏗️ [2. Kiến Trúc Hệ Thống](file:///e:/my-project/gear-zone/docs/architecture.md) | Kiến trúc tổng quan 3 lớp (3-tier architecture), cấu trúc thành phần (Components) và mô hình triển khai (Deployment). | Sơ đồ thành phần (Component Diagram), Sơ đồ triển khai (Deployment Diagram). |
| 🗄️ [3. Thiết Kế Cơ Sở Dữ Liệu & ERD](file:///e:/my-project/gear-zone/docs/database.md) | Chi tiết bảng cơ sở dữ liệu chuẩn hóa, quan hệ thực thể, kiểu dữ liệu thực tế và schema Prisma. | Sơ đồ thực thể liên kết (ERD - Entity Relationship Diagram). |
| 📊 [4. Hệ Thống Sơ Đồ UML](file:///e:/my-project/gear-zone/docs/uml_diagrams.md) | Các sơ đồ UML chi tiết mô tả cấu trúc tĩnh và hành vi động của hệ thống. | Sơ đồ lớp (Class Diagram), Sơ đồ tuần tự (Sequence), Sơ đồ hoạt động (Activity), Sơ đồ trạng thái (State). |
| 🧪 [5. Kiểm Thử & Đánh Giá](file:///e:/my-project/gear-zone/docs/testing_and_conclusion.md) | Kế hoạch kiểm thử chức năng, bảng kết quả test cases và hướng phát triển tương lai. | Bảng ma trận kiểm thử phần mềm (Test Cases Matrix). |

---

## 🛠️ Công Nghệ Phát Triển Hệ Thống

Hệ thống **GearZone** được thiết kế và triển khai trên các công nghệ hiện đại và tối ưu nhất:

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS (Responsive Layout & Glassmorphism)
- **Database & ORM**: Prisma ORM kết nối SQLite (môi trường thử nghiệm) / PostgreSQL & MySQL (môi trường production)
- **Authentication**: JWT (JSON Web Tokens) với thư viện `jose` và mã hóa mật khẩu `bcryptjs`
- **Data Fetching**: SWR (Stale-While-Revalidate) phía Client-side

---

> [!TIP]
> Để xem các sơ đồ một cách tốt nhất, hãy sử dụng các trình xem Markdown hỗ trợ hiển thị Mermaid (như VS Code Markdown Preview, GitHub, Obsidian hoặc các công cụ render tương thích).
