import { prisma } from '@/lib/db'
import { enqueueEmail } from '../queue/EmailQueue'

// Default email templates to fallback on if not configured in Settings
// Default email templates to fallback on if not configured in Settings
const DEFAULT_TEMPLATES = {
  welcome_subject: 'Chào mừng bạn đến với GearZone! 🚀',
  welcome_body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px;">🎮</span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 10px 0 2px 0; letter-spacing: -0.5px;">GearZone</h1>
        <p style="color: #6366f1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Gaming Gear Store</p>
      </div>

      <!-- Hero -->
      <div style="text-align: center; margin-bottom: 32px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.2); padding: 24px; border-radius: 20px;">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 8px 0; display: inline-flex; align-items: center; gap: 8px;">🔥 Chào mừng đến với GearZone</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Chào {{customer_name}}, cảm ơn bạn đã đồng hành cùng cộng đồng game thủ lớn nhất tại GearZone!</p>
      </div>

      <!-- Coupon Card -->
      <div style="background-color: #111827; border: 1px dashed #6366f1; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 32px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #818cf8; margin-bottom: 8px;">Mã giảm giá thành viên mới</div>
        <div style="font-size: 28px; font-weight: 900; color: #ffffff; background-color: #1e1b4b; display: inline-block; padding: 8px 24px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3); margin-bottom: 12px; letter-spacing: 1px;">WELCOME10</div>
        <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">Giảm ngay 10% tổng đơn hàng</div>
        <div style="font-size: 12px; color: #64748b;">Áp dụng cho đơn hàng từ 500.000đ trở lên</div>
      </div>

      <!-- DB Products Section -->
      <div style="margin-bottom: 32px;">
        <h3 style="color: #ffffff; font-size: 16px; font-weight: 800; margin: 0 0 16px 0; border-left: 4px solid #6366f1; padding-left: 10px;">🔥 Top Gaming Gear tuần này</h3>
        <div style="background-color: #111827; border-radius: 20px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.04);">
          {{products}}
        </div>
      </div>

      <!-- Social Proof / Trust Badges -->
      <div style="grid-template-columns: 1fr 1fr; display: table; width: 100%; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 20px 0; margin-bottom: 32px;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-bottom: 10px; font-size: 13px; color: #94a3b8; font-weight: 600;">⭐ <strong style="color:#ffffff;">4.9/5</strong> đánh giá thực tế</div>
          <div style="display: table-cell; width: 50%; padding-bottom: 10px; font-size: 13px; color: #94a3b8; font-weight: 600;">👥 <strong style="color:#ffffff;">500+</strong> game thủ đã mua</div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; font-size: 13px; color: #94a3b8; font-weight: 600;">🚚 Giao hàng toàn quốc</div>
          <div style="display: table-cell; width: 50%; font-size: 13px; color: #94a3b8; font-weight: 600;">🛡️ Bảo hành chính hãng</div>
        </div>
      </div>

      <!-- Main CTA -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="{{shop_url}}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);">Khám Phá Cửa Hàng ngay</a>
      </div>

      <!-- Footer / Contact Info -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; font-size: 12px; color: #64748b; line-height: 1.8;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #94a3b8;">🎮 Cửa Hàng Gaming Gear GearZone</p>
        <p style="margin: 0 0 16px 0;">Hotline: 090 123 4567 | Email: support@gearzone.kh4idev.id.vn</p>
        <div style="margin-bottom: 16px;">
          <a href="{{shop_url}}" style="color: #6366f1; text-decoration: none; font-weight: 700; margin: 0 8px;">Website</a> | 
          <a href="https://facebook.com" style="color: #6366f1; text-decoration: none; font-weight: 700; margin: 0 8px;">Facebook</a> | 
          <a href="https://zalo.me" style="color: #6366f1; text-decoration: none; font-weight: 700; margin: 0 8px;">Zalo</a>
        </div>
        <p style="margin: 0; font-size: 11px;">Bạn nhận được email này vì đã đăng ký bản tin của GearZone. Nếu không muốn nhận nữa, bạn có thể <a href="{{unsubscribe_url}}" style="color: #94a3b8; text-decoration: underline;">Hủy đăng ký</a> bất cứ lúc nào.</p>
      </div>
    </div>
  `,
  order_subject: 'Xác nhận đơn hàng #{{order_id}} tại GearZone 📦',
  order_body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px;">🎮</span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 10px 0 2px 0; letter-spacing: -0.5px;">GearZone</h1>
        <p style="color: #10b981; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Đơn Hàng Thành Công</p>
      </div>

      <!-- Hero -->
      <div style="text-align: center; margin-bottom: 32px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.2); padding: 24px; border-radius: 20px;">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">🎉 Cảm ơn bạn đã mua hàng!</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Xin chào {{customer_name}}, đơn hàng <b>#{{order_id}}</b> của bạn đã được tiếp nhận và đang được xử lý.</p>
      </div>

      <!-- Order Details -->
      <div style="margin-bottom: 32px;">
        <h3 style="color: #ffffff; font-size: 16px; font-weight: 800; margin: 0 0 16px 0; border-left: 4px solid #10b981; padding-left: 10px;">Chi tiết đơn hàng:</h3>
        <div style="background-color: #111827; border-radius: 20px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.04);">
          {{products}}
        </div>
        <div style="margin-top: 16px; text-align: right; font-size: 15px; font-weight: 700; color: #ffffff;">
          Tổng thanh toán: <span style="font-size: 18px; color: #10b981;">{{total_amount}}</span>
        </div>
      </div>

      <!-- Main CTA -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="{{shop_url}}/orders/{{order_id}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">Xem Chi Tiết Đơn Hàng</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; font-size: 12px; color: #64748b; line-height: 1.8;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #94a3b8;">🎮 Cửa Hàng Gaming Gear GearZone</p>
        <p style="margin: 0;">Hotline: 090 123 4567 | Website: <a href="{{shop_url}}" style="color: #6366f1; text-decoration: none;">gearzone.kh4idev.id.vn</a></p>
      </div>
    </div>
  `,
  abandoned_cart_subject: 'Bạn quên sản phẩm trong giỏ hàng GearZone? 🛒',
  abandoned_cart_body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px;">🛒</span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 10px 0 2px 0; letter-spacing: -0.5px;">GearZone</h1>
        <p style="color: #f59e0b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Giỏ Hàng Đang Chờ</p>
      </div>

      <!-- Hero -->
      <div style="text-align: center; margin-bottom: 32px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%); border: 1px solid rgba(245, 158, 11, 0.2); padding: 24px; border-radius: 20px;">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">🛒 Giỏ hàng của bạn đang đợi!</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Xin chào {{customer_name}}, chúng tôi nhận thấy bạn đã để lại một số sản phẩm gaming gear tuyệt vời trong giỏ hàng:</p>
      </div>

      <!-- Products -->
      <div style="margin-bottom: 32px;">
        <div style="background-color: #111827; border-radius: 20px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.04);">
          {{products}}
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 16px; text-align: center;">Đừng bỏ lỡ! Số lượng sản phẩm khuyến mãi có hạn, hãy hoàn tất thanh toán ngay nhé.</p>
      </div>

      <!-- Main CTA -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="{{shop_url}}/cart" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);">Quay Lại Giỏ Hàng Ngay →</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; font-size: 12px; color: #64748b; line-height: 1.8;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #94a3b8;">🎮 Cửa Hàng Gaming Gear GearZone</p>
        <p style="margin: 0;">Hotline: 090 123 4567 | Website: <a href="{{shop_url}}" style="color: #6366f1; text-decoration: none;">gearzone.kh4idev.id.vn</a></p>
      </div>
    </div>
  `,
  review_reminder_subject: 'Chia sẻ cảm nhận về sản phẩm từ GearZone ⭐',
  review_reminder_body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px;">⭐</span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 10px 0 2px 0; letter-spacing: -0.5px;">GearZone</h1>
        <p style="color: #6366f1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Chia Sẻ Trải Nghiệm</p>
      </div>

      <!-- Hero -->
      <div style="text-align: center; margin-bottom: 32px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.2); padding: 24px; border-radius: 20px;">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">⭐ Đánh giá sản phẩm của bạn!</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Xin chào {{customer_name}}, đơn hàng của bạn đã được giao thành công được 7 ngày. Hãy chia sẻ cảm nhận để nhận thêm điểm thưởng nhé!</p>
      </div>

      <!-- Products -->
      <div style="margin-bottom: 32px;">
        <div style="background-color: #111827; border-radius: 20px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.04);">
          {{products}}
        </div>
      </div>

      <!-- Main CTA -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="{{shop_url}}/orders/{{order_id}}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">Viết Đánh Giá ngay</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; font-size: 12px; color: #64748b; line-height: 1.8;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #94a3b8;">🎮 Cửa Hàng Gaming Gear GearZone</p>
        <p style="margin: 0;">Hotline: 090 123 4567 | Website: <a href="{{shop_url}}" style="color: #6366f1; text-decoration: none;">gearzone.kh4idev.id.vn</a></p>
      </div>
    </div>
  `,
  recommendation_subject: 'Gợi ý sản phẩm dành riêng cho bạn tại GearZone 🎁',
  recommendation_body: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 32px;">🎁</span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 10px 0 2px 0; letter-spacing: -0.5px;">GearZone</h1>
        <p style="color: #ec4899; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Gợi ý độc quyền</p>
      </div>

      <!-- Hero -->
      <div style="text-align: center; margin-bottom: 32px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%); border: 1px solid rgba(236, 72, 153, 0.2); padding: 24px; border-radius: 20px;">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">🎁 Deal xịn cho riêng bạn!</h2>
        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">Chào {{customer_name}}, dựa trên các sản phẩm bạn đã mua, GearZone xin giới thiệu các phụ kiện có thể bạn sẽ thích:</p>
      </div>

      <!-- Products -->
      <div style="margin-bottom: 32px;">
        <div style="background-color: #111827; border-radius: 20px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.04);">
          {{products}}
        </div>
      </div>

      <!-- Main CTA -->
      <div style="text-align: center; margin-bottom: 36px;">
        <a href="{{shop_url}}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3);">Khám Phá Cửa Hàng ngay</a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; font-size: 12px; color: #64748b; line-height: 1.8;">
        <p style="margin: 0 0 8px 0; font-weight: 700; color: #94a3b8;">🎮 Cửa Hàng Gaming Gear GearZone</p>
        <p style="margin: 0;">Hotline: 090 123 4567 | Website: <a href="{{shop_url}}" style="color: #6366f1; text-decoration: none;">gearzone.kh4idev.id.vn</a></p>
      </div>
    </div>
  `,
}

export class MarketingService {
  // Load email template (from settings or default)
  public async getTemplate(type: string) {
    const subjectKey = `email_template_${type}_subject`
    const bodyKey = `email_template_${type}_body`

    const settings = await prisma.setting.findMany({
      where: { key: { in: [subjectKey, bodyKey] } },
    })

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
    
    const fallbackSubject = (DEFAULT_TEMPLATES as any)[`${type}_subject`] || 'GearZone Notification'
    const fallbackBody = (DEFAULT_TEMPLATES as any)[`${type}_body`] || '<p>GearZone</p>'

    return {
      subject: settingsMap[subjectKey] || fallbackSubject,
      body: settingsMap[bodyKey] || fallbackBody,
    }
  }

  // Segmenting newsletter subscribers dynamically
  public async getSegmentSubscribers(segment: string) {
    // 1. Get all active subscribers
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: { isActive: true },
    })

    if (segment === 'ALL' || subscribers.length === 0) {
      return subscribers
    }

    // 2. Fetch users matching subscriber emails to do behavior segmentation
    const emails = subscribers.map((s) => s.email)
    const matchedUsers = await prisma.user.findMany({
      where: {
        email: { in: emails, mode: 'insensitive' },
      },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const userMap = new Map(matchedUsers.map((u) => [u.email?.toLowerCase(), u]))

    return subscribers.filter((sub) => {
      const user = userMap.get(sub.email.toLowerCase())
      if (!user) return false // guest subscriber has no purchase history, only receives ALL

      if (segment === 'VIP') {
        const totalSpent = user.orders.reduce((sum, o) => sum + o.totalAmount, 0)
        return totalSpent >= 5000000 // VIP spent threshold
      }

      // Check product categories purchased
      const categoriesPurchased = new Set<string>()
      user.orders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.product.category?.name) {
            categoriesPurchased.add(item.product.category.name.toLowerCase())
          }
        })
      })

      if (segment === 'KEYBOARD') {
        return categoriesPurchased.has('bàn phím') || categoriesPurchased.has('keyboard')
      }
      if (segment === 'MOUSE') {
        return categoriesPurchased.has('chuột') || categoriesPurchased.has('mouse')
      }
      if (segment === 'HEADSET') {
        return (
          categoriesPurchased.has('tai nghe') ||
          categoriesPurchased.has('headset') ||
          categoriesPurchased.has('loa')
        )
      }

      return false
    })
  }

  // Parse HTML templates replacing placeholders
  public parseTemplate(
    html: string,
    replacements: Record<string, string>
  ): string {
    let result = html
    Object.entries(replacements).forEach(([key, val]) => {
      result = result.replaceAll(`{{${key}}}`, val)
    })
    return result
  }

  // Format product list helper for emails
  public formatProductsHtml(products: Array<{ id?: string; name: string; price: number; oldPrice?: number | null; imageUrl?: string | null }>): string {
    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gearzone.kh4idev.id.vn'
    return products
      .map(
        (p) => {
          const productLink = p.id ? `${shopUrl}/products/${p.id}` : shopUrl
          let imageSrc = p.imageUrl || ''
          if (imageSrc.includes('|')) {
            imageSrc = imageSrc.split('|')[0].trim()
          }
          if (imageSrc && imageSrc.startsWith('/')) {
            imageSrc = `${shopUrl}${imageSrc}`
          }
          return `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 12px 0;">
        <div style="display: flex; align-items: center; flex: 1; min-width: 0;">
          ${
            imageSrc
              ? `<div style="width: 50px; height: 50px; background-color: #1f2937; border-radius: 8px; overflow: hidden; margin-right: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.08);">
                  <img src="${imageSrc}" alt="${p.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>`
              : ''
          }
          <div style="flex: 1; min-width: 0;">
            <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #ffffff; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.name}</h4>
            <span style="font-size: 12px; font-weight: 800; color: #818cf8;">${p.price.toLocaleString('vi-VN')}đ</span>
            ${
              p.oldPrice
                ? `<span style="font-size: 10px; text-decoration: line-through; color: #64748b; margin-left: 6px;">${p.oldPrice.toLocaleString(
                    'vi-VN'
                  )}đ</span>`
                : ''
            }
          </div>
        </div>
        <a href="${productLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; font-size: 10px; font-weight: 800; text-decoration: none; padding: 6px 12px; border-radius: 6px; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Xem ngay</a>
      </div>
    `
        }
      )
      .join('')
  }

  // Trigger campaign sending
  public async sendCampaign(campaignId: string) {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!campaign) throw new Error('Campaign not found')

    // Update status to SENDING
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', sentCount: 0 },
    })

    const subscribers = await this.getSegmentSubscribers(campaign.targetGroup)
    if (subscribers.length === 0) {
      await prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: { status: 'SENT' },
      })
      return
    }

    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const productsList = campaign.products.map((cp) => cp.product)
    const productsHtml = this.formatProductsHtml(productsList)

    for (const sub of subscribers) {
      // 1. Create campaign log entry
      const log = await prisma.campaignLog.create({
        data: {
          campaignId,
          email: sub.email,
          status: 'PENDING',
        },
      })

      // 2. Format content
      const customerName = sub.email.split('@')[0]
      const emailBody = this.parseTemplate(campaign.content, {
        customer_name: customerName,
        products: productsHtml,
        shop_url: shopUrl,
        unsubscribe_url: `${shopUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(
          sub.email
        )}`,
      })

      // Wrap email body with open tracking pixel & rewrite links for click tracking
      const openTrackingPixel = `<img src="${shopUrl}/api/newsletter/track/open?logId=${log.id}" width="1" height="1" style="display:none;" />`
      let trackedBody = emailBody + openTrackingPixel

      // Quick rewrite anchor tags to redirect for tracking clicks
      trackedBody = trackedBody.replace(/href="([^"]+)"/g, (match, url) => {
        if (url.startsWith('http') && !url.includes('/track/')) {
          return `href="${shopUrl}/api/newsletter/track/click?logId=${log.id}&url=${encodeURIComponent(
            url
          )}"`
        }
        return match
      })

      // 3. Dispatch to Queue
      await enqueueEmail({
        to: sub.email,
        subject: campaign.subject,
        html: trackedBody,
        campaignId,
        logId: log.id,
      })
    }

    // Update campaign status
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENT' },
    })
  }

  // Automation Check: Cart Recovery (runs as a scheduled loop)
  public async checkAbandonedCarts() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Find carts modified > 24 hours ago that have items and haven't been emailed
    const carts = await prisma.cart.findMany({
      where: {
        abandonedEmailSent: false,
        updatedAt: { lte: oneDayAgo },
        items: {
          some: {}, // has at least one item
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (carts.length === 0) return

    const template = await this.getTemplate('abandoned_cart')
    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    for (const cart of carts) {
      if (!cart.user.email) continue // skip users without emails

      // Confirm user hasn't completed an order *after* the cart's last update time
      const recentOrder = await prisma.order.findFirst({
        where: {
          userId: cart.userId,
          createdAt: { gte: cart.updatedAt },
        },
      })
      
      if (recentOrder) {
        // User purchased, mark as sent to avoid spamming
        await prisma.cart.update({
          where: { id: cart.id },
          data: { abandonedEmailSent: true },
        })
        continue
      }

      // Compile products list HTML
      const productsData = cart.items.map((item) => ({
        name: item.product.name + (item.variant?.sku ? ` (${item.variant.sku})` : ''),
        price: item.variant?.salePrice ?? item.variant?.price ?? item.product.price,
        imageUrl: item.variant?.imageUrl ?? item.product.imageUrl,
      }))
      const productsHtml = this.formatProductsHtml(productsData)

      // Replace placeholders
      const emailBody = this.parseTemplate(template.body, {
        customer_name: cart.user.name || cart.user.username,
        products: productsHtml,
        shop_url: shopUrl,
      })

      // Log into ScheduledEmail
      await prisma.scheduledEmail.create({
        data: {
          email: cart.user.email,
          type: 'ABANDONED_CART',
          targetId: cart.id,
          subject: template.subject,
          body: emailBody,
          scheduledAt: new Date(), // send immediately
          status: 'PENDING',
        },
      })

      // Mark cart as sent
      await prisma.cart.update({
        where: { id: cart.id },
        data: { abandonedEmailSent: true },
      })
    }
  }

  // Automation Trigger: Post purchase scheduler
  public async schedulePostPurchaseEmails(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order || !order.user.email) return

    const shopUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const customerName = order.user.name || order.user.username

    const productsData = order.items.map((item) => ({
      name: item.product.name,
      price: item.price,
      imageUrl: item.product.imageUrl,
    }))
    const productsHtml = this.formatProductsHtml(productsData)

    // 1. Queue Order Confirmation (Immediately)
    const confTemplate = await this.getTemplate('order')
    const confBody = this.parseTemplate(confTemplate.body, {
      customer_name: customerName,
      order_id: order.id,
      products: productsHtml,
      total_amount: order.totalAmount.toLocaleString('vi-VN') + 'đ',
      shop_url: shopUrl,
    })

    await prisma.scheduledEmail.create({
      data: {
        email: order.user.email,
        type: 'ORDER_CONFIRMATION',
        targetId: order.id,
        subject: this.parseTemplate(confTemplate.subject, { order_id: order.id }),
        body: confBody,
        scheduledAt: new Date(), // immediate
        status: 'PENDING',
      },
    })

    // 2. Schedule Review Reminder (7 days later)
    const reviewTemplate = await this.getTemplate('review_reminder')
    const reviewBody = this.parseTemplate(reviewTemplate.body, {
      customer_name: customerName,
      order_id: order.id,
      products: productsHtml,
      shop_url: shopUrl,
    })

    await prisma.scheduledEmail.create({
      data: {
        email: order.user.email,
        type: 'REVIEW_REMINDER',
        targetId: order.id,
        subject: reviewTemplate.subject,
        body: reviewBody,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'PENDING',
      },
    })

    // 3. Schedule Product Recommendations (30 days later)
    // For recommendations, we can pull 3 random active products of other categories
    const purchasedCategoryIds = order.items
      .map((item) => item.product.categoryId)
      .filter(Boolean) as string[]

    const recommendedProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isVisible: true,
        categoryId: { notIn: purchasedCategoryIds },
      },
      take: 3,
    })

    // Fallback if no other categories exist
    const finalRecs = recommendedProducts.length > 0 
      ? recommendedProducts 
      : await prisma.product.findMany({ where: { status: 'ACTIVE', isVisible: true }, take: 3 })

    const recsHtml = this.formatProductsHtml(finalRecs)
    const recsTemplate = await this.getTemplate('recommendation')
    const recsBody = this.parseTemplate(recsTemplate.body, {
      customer_name: customerName,
      products: recsHtml,
      shop_url: shopUrl,
    })

    await prisma.scheduledEmail.create({
      data: {
        email: order.user.email,
        type: 'RECOMMENDATION',
        targetId: order.id,
        subject: recsTemplate.subject,
        body: recsBody,
        scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'PENDING',
      },
    })
  }
}

export const marketingService = new MarketingService()
