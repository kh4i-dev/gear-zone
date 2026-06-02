# Realtime & Notifications

Blueprint sở hữu một vài module nâng cao để tăng mức độ tương tác (engagement).

## 1. Social Proof (Activity Feed)
**Mô tả:** Góc trái/phải dưới màn hình thỉnh thoảng hiện lên popup: "Nguyễn Văn A (Hà Nội) vừa mua Bàn phím X 5 phút trước".
**Luồng xử lý (Data Flow):**
1. Khi có đơn hàng mới (Trạng thái PENDING thành công).
2. API sinh ra một `ActivityEvent` record.
3. Server emit qua Websocket (nếu có dùng Socket.io) hoặc Frontend dùng Long Polling / SWR polling `/api/activity/latest` để fetch dữ liệu 30s một lần.
4. Component `SocialProofToast` render UI.
*Reusability:* Có thể bật tắt qua `shop-config.features.socialProofActive`.

## 2. Admin Notification (Webhook/Telegram)
**Mô tả:** Admin cần biết ngay khi có đơn mà không cần ngồi F5 Dashboard.
**Luồng xử lý:**
1. Order API tạo thành công.
2. Gửi bất đồng bộ (Fire-and-forget) một request tới Telegram Bot API.
3. Message chứa: `Mã đơn`, `Tên khách`, `Tổng tiền`, kèm link dẫn thẳng vào admin chi tiết đơn hàng.

## 3. Newsletter (Đăng ký nhận tin)
1. Dưới Footer có ô nhập Email.
2. Gửi xuống `/api/newsletter`.
3. Backend có thể tích hợp với hệ thống thứ 3 (Mailchimp, Resend) để lưu contact.

## 4. Floating Contact Widget
Component `FloatingContactWidget` neo ở góc màn hình. Cung cấp các nút: Gọi điện, Nhắn tin Zalo, Facebook Messenger. Các link này được cấu hình tĩnh trong config hoặc đọc từ Database Settings.
