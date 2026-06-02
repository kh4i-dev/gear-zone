# Triển khai (Deployment Checklist)

Blueprint sử dụng Next.js, có thể được deploy trên Vercel (Serverless) hoặc trên VPS riêng (Node.js + PM2).

## 1. Yêu cầu Hệ thống (VPS)
- Node.js >= 18
- PostgreSQL >= 13
- PM2 (Process Manager)
- Nginx (Reverse Proxy)

## 2. Các Bước Deploy bằng PM2
1. **Pull Code**: Checkout source code blueprint về máy chủ.
2. **Cài đặt dependencies**: `npm install`.
3. **Cấu hình môi trường**: Tạo file `.env` chứa `DATABASE_URL` và các cấu hình theo `reusable-config.md`.
4. **Database Migration**: Chạy `npx prisma migrate deploy` để apply schema lên database thật.
5. **Generate Prisma Client**: `npx prisma generate`.
6. **Build Next.js**: Chạy `npm run build`. Đảm bảo các cấu hình tĩnh (static config) đã chuẩn vì Next sẽ pre-render một số trang.
7. **Start Server**: Chạy `pm2 start npm --name "shop-frontend" -- start`
8. **Nginx**: Cấu hình reverse proxy trỏ port 80/443 về port của Next.js (thường là 3000).

## 3. Vercel Deployment (Đề xuất cho Blueprint tĩnh)
Nếu dùng Vercel, cấu hình đơn giản hơn nhiều:
- Kết nối Github repo vào Vercel.
- Điền các Environment Variables vào Dashboard Vercel.
- Build command: `npx prisma generate && npx prisma migrate deploy && next build` (lưu ý cẩn thận với `migrate deploy` trên CI, nên dùng DB platform như Neon/Supabase).

## 4. Checklist trước khi Go-live
- [ ] Xóa/Reset dữ liệu Seed/Mock trong Database.
- [ ] Kiểm tra các Admin Accounts đã đổi mật khẩu mạnh.
- [ ] Chắc chắn Stripe/VNPAY keys đang ở chế độ PRODUCTION, không phải Test.
- [ ] Vô hiệu hóa hoặc giới hạn truy cập (IP Whitelist) vào đường dẫn `/api/seed` (nếu có).
- [ ] Đảm bảo `NEXT_PUBLIC_BASE_URL` trỏ đúng tên miền thực tế để SEO tag và OpenGraph hoạt động đúng.
