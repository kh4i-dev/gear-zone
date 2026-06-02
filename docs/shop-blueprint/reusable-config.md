# Cấu hình Tái sử dụng (Reusable Config)

Để sử dụng blueprint này cho các shop khác nhau mà không cần sửa code cốt lõi, cần tách bạch cấu hình theo 3 cấp độ:

## 1. Environment Variables (`.env`)
Chỉ chứa các thông tin nhạy cảm và liên quan đến hạ tầng mạng:
- `DATABASE_URL`: Kết nối DB.
- `JWT_SECRET` / `AUTH_SECRET`: Khóa mã hóa session.
- `CLOUDINARY_URL` / `S3_BUCKET`: Storage cho ảnh.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: Notification bot.
- `STRIPE_KEY` / `VNPAY_SECRET`: Payment gateway keys.

## 2. Dynamic Database Settings (`Setting` model)
Dành cho admin thay đổi thường xuyên trên CMS, có ảnh hưởng ngay lập tức:
- `SHOP_HOTLINE`, `SHOP_EMAIL`, `SHOP_ADDRESS`: Thông tin liên hệ.
- `SOCIAL_FACEBOOK`, `SOCIAL_INSTAGRAM`: Link mạng xã hội.
- `FREE_SHIPPING_THRESHOLD`: Mức giá được freeship (vd: 500000).
- `BASE_SHIPPING_FEE`: Phí ship mặc định.
- `MAINTENANCE_MODE`: Bật/tắt bảo trì ("true" / "false").

*Code implementation:* Có một utility function `getSetting(key, fallback)` có cache nhẹ.

## 3. Static UI Config (`shop-config.ts` hoặc `shop-config.json`)
Cấu hình về thương hiệu (Branding) được compile cùng code Next.js để đảm bảo tốc độ tối đa:
```typescript
export const shopConfig = {
  name: "GearZone",
  seo: {
    titleTemplate: "%s | GearZone",
    defaultDescription: "Chuyên cung cấp thiết bị gaming cao cấp",
  },
  theme: {
    primaryColor: "#E11D48", // Rose 600
    buttonRadius: "md",
  },
  layout: {
    showHeroTicker: true,
    enableFloatingContact: true,
  },
  features: {
    socialProofActive: true, // Bật popup "Khách X vừa mua"
    productReviews: true,
  }
};
```

**Cách áp dụng vào Tailwind:**
Trong `tailwind.config.ts`, load các màu từ file config này thay vì hardcode css variables nếu dự án sử dụng config tĩnh. Hoặc tốt nhất là gán CSS variables trong thẻ `:root` ở `layout.tsx` nếu muốn đổi theme động.
